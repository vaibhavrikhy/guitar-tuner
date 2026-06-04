import { useRef, useState } from "react";

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

    const frequencyHistory = useRef([]);
    const animationFrameRef = useRef(null);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);

    const stableNoteRef = useRef({
        note: null,
        count: 0,
    });

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

    function stopListening() {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
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

            const source = audioContext.createMediaStreamSource(stream);
            const audioAnalyser = audioContext.createAnalyser();

            setAnalyser(audioAnalyser);

            source.connect(audioAnalyser);

            audioAnalyser.fftSize = 2048;

            const dataArray = new Float32Array(audioAnalyser.fftSize);

            function detectFrequency() {
                audioAnalyser.getFloatTimeDomainData(dataArray);

                let detectedPitch = null;

                if (selectedString === "AUTO") {
                    detectedPitch = detectGuitarPitchFromKnownStrings(
                        dataArray,
                        audioContext.sampleRate,
                        guitarStrings
                    );
                } else {
                    const targetString = guitarStrings.find(
                        (string) => string.note === selectedString
                    );

                    const detectedFrequency = autoCorrelateForTarget(
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

                    const centsDifference = getCentsDifference(
                        smoothedFrequency,
                        closestString.frequency
                    );

                    const tuningStatus = getTuningStatus(centsDifference);

                    if (stableNoteRef.current.note === closestString.note) {
                        stableNoteRef.current.count += 1;
                    } else {
                        stableNoteRef.current.note = closestString.note;
                        stableNoteRef.current.count = 1;
                    }

                    if (stableNoteRef.current.count >= 3) {
                        setNote(closestString.note);
                    }

                    setCents(centsDifference);
                    setStatus(tuningStatus);
                    setConfidence(Math.round(detectedPitch.confidence));
                } else {
                    resetTunerState();
                }

                animationFrameRef.current = requestAnimationFrame(detectFrequency);
            }

            detectFrequency();

            setIsListening(true);
            setMessage("Listening...");
        } catch (error) {
            console.log(error);
            setMessage("Microphone Access Denied");
        }
    }

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
    };
}

export default useTuner;