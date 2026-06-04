#  Guitar Tuner

A real-time guitar tuner built with React and the Web Audio API. The application captures microphone input, performs digital signal processing (DSP) to estimate pitch, and provides visual feedback to help tune guitar strings accurately.

## Features

- 🎵 Real-time pitch detection
- 🎸 Automatic guitar string detection
- 🎯 Manual string selection mode
- 📈 Waveform visualization
- 📊 Frequency spectrum analyzer (FFT)
- 🔍 Signal confidence meter
- ⚡ Low-latency microphone processing
- 🎛️ Fine tuning feedback using cents deviation

## Tech Stack

- React
- JavaScript (ES6+)
- Web Audio API
- HTML5 Canvas
- CSS3

## How It Works

### Audio Processing Pipeline

```text
Microphone Input
        ↓
Web Audio API
        ↓
Analyser Node
        ↓
Pitch Detection Algorithm
        ↓
Frequency Estimation
        ↓
String Detection
        ↓
Tuning Feedback
```

### DSP Techniques Used

- Autocorrelation-based pitch detection
- Frequency smoothing
- Signal confidence estimation
- FFT frequency spectrum analysis
- Real-time waveform rendering

## Current Features

### Auto Detection Mode

The tuner automatically identifies the closest guitar string and displays:

- Detected note
- Frequency
- Tuning status
- Signal confidence

### Manual Tuning Mode

Users can select a specific string:

- E2
- A2
- D3
- G3
- B3
- E4

The tuner then performs targeted pitch detection around the selected string's frequency range for improved stability.

## Project Structure

```text
src
│
├── components
│   ├── TunerCard.jsx
│   ├── Waveform.jsx
│   └── Spectrum.jsx
│
├── hooks
│   └── useTuner.js
│
├── utils
│   └── pitchDetection.js
│
├── data
│   └── guitarStrings.js
│
└── App.jsx
```

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/guitar-tuner.git
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

## Future Improvements

- Improved high-string pitch detection
- Advanced harmonic rejection
- Recording and playback support
- Mobile optimization
- Machine learning assisted pitch classification
- Hybrid DSP + ML tuning engine
- Additional instrument support

## Learning Outcomes

This project explores:

- React architecture
- Custom hooks
- Real-time systems
- Digital Signal Processing (DSP)
- Audio visualization
- Web Audio API
- Signal confidence estimation
- Future integration of Machine Learning

## License

MIT License
