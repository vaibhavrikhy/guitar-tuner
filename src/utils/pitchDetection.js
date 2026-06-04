export function findClosestString(detectedFrequency, guitarStrings) {
    let closestString = guitarStrings[0];

    for (let i = 0; i < guitarStrings.length; i++) {
        const currentDifference = Math.abs(
            detectedFrequency - guitarStrings[i].frequency
        );

        const closestDifference = Math.abs(
            detectedFrequency - closestString.frequency
        );

        if (currentDifference < closestDifference) {
            closestString = guitarStrings[i];
        }
    }

    return closestString;
}

export function getCentsDifference(detectedFrequency, targetFrequency) {
    return Math.round(1200 * Math.log2(detectedFrequency / targetFrequency));
}

export function getTuningStatus(centsDifference) {
    if (Math.abs(centsDifference) <= 5) {
        return "In Tune";
    }

    if (centsDifference < 0) {
        return "Too Low";
    }

    return "Too High";
}

export function smoothFrequency(newFrequency, frequencyHistory) {
    frequencyHistory.current.push(newFrequency);

    if (frequencyHistory.current.length > 5) {
        frequencyHistory.current.shift();
    }

    const sum = frequencyHistory.current.reduce(
        (total, value) => total + value,
        0
    );

    return Math.round(sum / frequencyHistory.current.length);
}

export function detectGuitarPitchFromKnownStrings(
    buffer,
    sampleRate,
    guitarStrings
) {
    let rms = 0;

    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }

    rms = Math.sqrt(rms / buffer.length);

    if (rms < 0.01) {
        return null;
    }

    function getCorrelation(offset) {
        let correlation = 0;

        for (let i = 0; i < buffer.length - offset; i++) {
            correlation += Math.abs(buffer[i] - buffer[i + offset]);
        }

        return 1 - correlation / (buffer.length - offset);
    }

    let bestResult = null;

    for (const string of guitarStrings) {
        const targetOffset = sampleRate / string.frequency;
        const minOffset = Math.floor(targetOffset * 0.88);
        const maxOffset = Math.ceil(targetOffset * 1.12);

        let bestOffset = targetOffset;
        let bestScore = 0;

        for (let offset = minOffset; offset <= maxOffset; offset++) {
            const score = getCorrelation(offset);

            if (score > bestScore) {
                bestScore = score;
                bestOffset = offset;
            }
        }

        const detectedFrequency = sampleRate / bestOffset;

        const result = {
            note: string.note,
            targetFrequency: string.frequency,
            detectedFrequency,
            score: bestScore,
        };

        if (!bestResult ||
            result.score > bestResult.score ||
            (result.score > bestResult.score * 0.97 &&
                result.targetFrequency > bestResult.targetFrequency)
        ) {
            bestResult = result;
        }
    }

    if (!bestResult || bestResult.score < 0.88) {
        return null;
    }

    return {
        ...bestResult,
        confidence: Math.min(
            Math.max(bestResult.score * 100, 0),
            100
        ),
    };
}
export function autoCorrelateForTarget(
    buffer,
    sampleRate,
    targetFrequency
) {
    let rms = 0;

    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }

    rms = Math.sqrt(rms / buffer.length);

    if (rms < 0.01) {
        return -1;
    }

    const targetOffset =
        sampleRate / targetFrequency;

    const minOffset = Math.floor(
        targetOffset * 0.85
    );

    const maxOffset = Math.ceil(
        targetOffset * 1.15
    );

    let bestOffset = -1;
    let bestCorrelation = 0;

    for (
        let offset = minOffset; offset <= maxOffset; offset++
    ) {
        let correlation = 0;

        for (
            let i = 0; i < buffer.length - offset; i++
        ) {
            correlation += Math.abs(
                buffer[i] - buffer[i + offset]
            );
        }

        correlation =
            1 - correlation / (buffer.length - offset);

        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        }
    }

    if (bestCorrelation > 0.9) {
        return sampleRate / bestOffset;
    }

    return -1;
}