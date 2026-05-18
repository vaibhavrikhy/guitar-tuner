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
        return "In Tune ✅";
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

export function autoCorrelate(buffer, sampleRate) {
    let rms = 0;

    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }

    rms = Math.sqrt(rms / buffer.length);

    if (rms < 0.01) {
        return -1;
    }

    let bestOffset = -1;
    let bestCorrelation = 0;

    const minFrequency = 70;
    const maxFrequency = 400;

    const minOffset = Math.floor(sampleRate / maxFrequency);
    const maxOffset = Math.floor(sampleRate / minFrequency);

    for (let offset = minOffset; offset <= maxOffset; offset++) {
        let correlation = 0;

        for (let i = 0; i < buffer.length - offset; i++) {
            correlation += Math.abs(buffer[i] - buffer[i + offset]);
        }

        correlation = 1 - correlation / (buffer.length - offset);

        if (correlation > bestCorrelation) {
            bestCorrelation = correlation;
            bestOffset = offset;
        }
    }

    if (bestCorrelation > 0.01 && bestOffset !== -1) {
        return sampleRate / bestOffset;
    }

    return -1;
}