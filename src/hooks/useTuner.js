import { useEffect, useRef, useState } from "react";

import guitarStrings from "../data/guitarStrings";

import {
    autoCorrelateForTarget,
    detectGuitarPitchFromKnownStrings,
    getCentsDifference,
    getTuningStatus,
    smoothFrequency,
} from "../utils/pitchDetection";

function useTuner() {
    const [message, setMessage] = useState("Not Listening");
    const [frequency, setFrequency] = useState(0);
    const [note, setNote] = useState("--");
    const [status, setStatus] = useState("--");
    const [cents, setCents] = useState(0);
    const [confidence, setConfidence] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [analyser, setAnalyser] = useState(null);
    const [selectedString, setSelectedString] = useState("AUTO");

    const [isRecording, setIsRecording] = useState(false);
    const [recordingCountdown, setRecordingCountdown] = useState(0);

    const [recordedSamples, setRecordedSamples] = useState(() => {
        try {
            const savedSamples = localStorage.getItem("guitarTunerSamples");

            return savedSamples ? JSON.parse(savedSamples) : [];
        } catch (error) {
            console.error("Could not load saved sample metadata:", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(
                "guitarTunerSamples",
                JSON.stringify(recordedSamples)
            );
        } catch (error) {
            console.error("Could not save sample metadata:", error);
        }
    }, [recordedSamples]);

    const frequencyHistory = useRef([]);
    const animationFrameRef = useRef(null);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimeoutRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    const stableNoteRef = useRef({
        note: null,
        count: 0,
    });

    function clearRecordedSamples() {
        setRecordedSamples([]);
        localStorage.removeItem("guitarTunerSamples");
    }

    function resetTunerState() {
        frequencyHistory.current = [];

        stableNoteRef.current = {
            note: null,
            count: 0,
        };

        setFrequency(0);
        setNote("--");
        setCents(0);
        setConfidence(0);
        setStatus("No Signal");
    }

    function clearRecordingTimers() {
        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
        }

        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    }

    function stopListening() {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }

        clearRecordingTimers();

        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => track.stop());

            streamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        frequencyHistory.current = [];

        stableNoteRef.current = {
            note: null,
            count: 0,
        };

        setFrequency(0);
        setNote("--");
        setCents(0);
        setConfidence(0);
        setStatus("--");
        setAnalyser(null);
        setMessage("Not Listening");
        setIsListening(false);
        setIsRecording(false);
        setRecordingCountdown(0);
    }

    async function startListening() {
        if (isListening) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            streamRef.current = stream;

            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const source =
                audioContext.createMediaStreamSource(stream);

            const audioAnalyser =
                audioContext.createAnalyser();

            setAnalyser(audioAnalyser);

            source.connect(audioAnalyser);

            audioAnalyser.fftSize = 2048;

            const dataArray =
                new Float32Array(audioAnalyser.fftSize);

            function detectFrequency() {
                audioAnalyser.getFloatTimeDomainData(dataArray);

                let detectedPitch = null;

                if (selectedString === "AUTO") {
                    detectedPitch =
                        detectGuitarPitchFromKnownStrings(
                            dataArray,
                            audioContext.sampleRate,
                            guitarStrings
                        );
                } else {
                    const targetString = guitarStrings.find(
                        (string) =>
                        string.note === selectedString
                    );

                    if (targetString) {
                        const detectedFrequency =
                            autoCorrelateForTarget(
                                dataArray,
                                audioContext.sampleRate,
                                targetString.frequency
                            );

                        if (detectedFrequency !== -1) {
                            detectedPitch = {
                                note: targetString.note,
                                targetFrequency: targetString.frequency,
                                detectedFrequency,
                                confidence: 100,
                            };
                        }
                    }
                }

                if (detectedPitch) {
                    const smoothedFrequency = smoothFrequency(
                        detectedPitch.detectedFrequency,
                        frequencyHistory
                    );

                    setFrequency(smoothedFrequency);

                    const closestString = {
                        note: detectedPitch.note,
                        frequency: detectedPitch.targetFrequency,
                    };

                    const centsDifference =
                        getCentsDifference(
                            smoothedFrequency,
                            closestString.frequency
                        );

                    const tuningStatus =
                        getTuningStatus(centsDifference);

                    if (
                        stableNoteRef.current.note ===
                        closestString.note
                    ) {
                        stableNoteRef.current.count += 1;
                    } else {
                        stableNoteRef.current.note =
                            closestString.note;

                        stableNoteRef.current.count = 1;
                    }

                    if (stableNoteRef.current.count >= 3) {
                        setNote(closestString.note);
                    }

                    setCents(centsDifference);
                    setStatus(tuningStatus);
                    setConfidence(
                        Math.round(
                            detectedPitch.confidence
                        )
                    );
                } else {
                    resetTunerState();
                }

                animationFrameRef.current =
                    requestAnimationFrame(
                        detectFrequency
                    );
            }

            detectFrequency();

            setIsListening(true);
            setMessage("Listening...");
        } catch (error) {
            console.error(error);
            setMessage("Microphone Access Denied");
        }
    }

    function startRecording() {
        if (!streamRef.current) {
            console.warn(
                "Start listening before recording."
            );
            return;
        }

        if (isRecording) return;

        if (
            typeof MediaRecorder === "undefined"
        ) {
            console.error(
                "MediaRecorder is not supported in this browser."
            );
            return;
        }

        audioChunksRef.current = [];

        const recorder =
            new MediaRecorder(streamRef.current);

        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(
                    event.data
                );
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(
                audioChunksRef.current, {
                    type: "audio/webm",
                }
            );

            const label =
                selectedString === "AUTO" ?
                "auto" :
                selectedString.toLowerCase();

            const fileName =
                `${label}_${Date.now()}.webm`;

            const sampleMetadata = {
                fileName,
                label,
                selectedString,
                durationSeconds: 3,
                createdAt: new Date().toISOString(),
            };

            setRecordedSamples(
                (previousSamples) => [
                    ...previousSamples,
                    sampleMetadata,
                ]
            );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            mediaRecorderRef.current = null;
            audioChunksRef.current = [];

            setIsRecording(false);
            setRecordingCountdown(0);
        };

        recorder.onerror = (event) => {
            console.error(
                "Recording error:",
                event.error
            );

            clearRecordingTimers();

            setIsRecording(false);
            setRecordingCountdown(0);
        };

        recorder.start();

        setIsRecording(true);
        setRecordingCountdown(3);

        let countdown = 3;

        countdownIntervalRef.current =
            setInterval(() => {
                countdown -= 1;

                setRecordingCountdown(countdown);

                if (countdown <= 0) {
                    clearInterval(
                        countdownIntervalRef.current
                    );

                    countdownIntervalRef.current =
                        null;
                }
            }, 1000);

        recordingTimeoutRef.current =
            setTimeout(() => {
                stopRecording();
            }, 3000);
    }

    function stopRecording() {
        clearRecordingTimers();

        if (!mediaRecorderRef.current) {
            setIsRecording(false);
            setRecordingCountdown(0);
            return;
        }

        if (
            mediaRecorderRef.current.state !==
            "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);
        setRecordingCountdown(0);
    }

    function downloadManifest() {
        const manifest = {
            project: "guitar-tuner",
            sampleCount: recordedSamples.length,
            samples: recordedSamples,
        };

        const blob = new Blob(
            [JSON.stringify(manifest, null, 2)], {
                type: "application/json",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download = "manifest.json";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    const datasetStats = {
        total: recordedSamples.length,

        E2: recordedSamples.filter(
            (sample) => sample.label === "e2"
        ).length,

        A2: recordedSamples.filter(
            (sample) => sample.label === "a2"
        ).length,

        D3: recordedSamples.filter(
            (sample) => sample.label === "d3"
        ).length,

        G3: recordedSamples.filter(
            (sample) => sample.label === "g3"
        ).length,

        B3: recordedSamples.filter(
            (sample) => sample.label === "b3"
        ).length,

        E4: recordedSamples.filter(
            (sample) => sample.label === "e4"
        ).length,
    };

    return {
        message,
        frequency,
        note,
        status,
        cents,
        confidence,

        isListening,
        startListening,
        stopListening,

        analyser,

        selectedString,
        setSelectedString,

        isRecording,
        startRecording,
        stopRecording,
        recordingCountdown,

        recordedSamples,
        downloadManifest,
        datasetStats,
        clearRecordedSamples,
    };
}

export default useTuner;