import { useRef, useState } from "react";

import guitarStrings from "../data/guitarStrings";

import {
    autoCorrelate,
    findClosestString,
    getCentsDifference,
    getTuningStatus,
    smoothFrequency,
} from "../utils/pitchDetection";

function useTuner() {
    const [message, setMessage] =
    useState("Not Listening");

    const [frequency, setFrequency] =
    useState(0);

    const [note, setNote] =
    useState("--");

    const [status, setStatus] =
    useState("--");

    const [cents, setCents] =
    useState(0);

    const [isListening, setIsListening] =
    useState(false);

    const frequencyHistory =
        useRef([]);

    const animationFrameRef =
        useRef(null);

    const streamRef =
        useRef(null);

    const audioContextRef =
        useRef(null);

    const [analyser, setAnalyser] =
    useState(null);

    function stopListening() {
        if (animationFrameRef.current) {
            cancelAnimationFrame(
                animationFrameRef.current
            );
        }

        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => track.stop());
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        setMessage("Not Listening");

        setIsListening(false);
    }

    async function startListening() {
        if (isListening) return;

        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

            streamRef.current = stream;

            const audioContext =
                new AudioContext();

            audioContextRef.current =
                audioContext;

            const source =
                audioContext.createMediaStreamSource(
                    stream
                );

            const analyser =
                audioContext.createAnalyser();

            source.connect(analyser);

            analyser.fftSize = 2048;

            const dataArray =
                new Float32Array(
                    analyser.fftSize
                );

            function detectFrequency() {
                analyser.getFloatTimeDomainData(
                    dataArray
                );

                const detectedFrequency =
                    autoCorrelate(
                        dataArray,
                        audioContext.sampleRate
                    );

                if (detectedFrequency !== -1) {
                    const smoothedFrequency =
                        smoothFrequency(
                            detectedFrequency,
                            frequencyHistory
                        );

                    setFrequency(smoothedFrequency);

                    const closestString =
                        findClosestString(
                            smoothedFrequency,
                            guitarStrings
                        );

                    const centsDifference =
                        getCentsDifference(
                            smoothedFrequency,
                            closestString.frequency
                        );

                    const tuningStatus =
                        getTuningStatus(
                            centsDifference
                        );

                    setNote(
                        closestString.note
                    );

                    setCents(
                        centsDifference
                    );

                    setStatus(
                        tuningStatus
                    );
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
            console.log(error);

            setMessage(
                "Microphone Access Denied"
            );
        }
    }

    return {
        message,
        frequency,
        note,
        status,
        cents,
        isListening,
        startListening,
        stopListening,
    };
}

export default useTuner;