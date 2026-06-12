import "./App.css";

import TunerCard from "./components/TunerCard";
import Waveform from "./components/Waveform";
import Spectrum from "./components/Spectrum";

import useTuner from "./hooks/useTuner";

function App() {
  const {
    message,
    confidence,
    frequency,
    note,
    status, 
    cents,
    isListening,
    startListening,
    stopListening,
    analyser,
    selectedString,
    setSelectedString,
    isRecording,
    startRecording,
    stopRecording,
  } = useTuner();

  const needlePosition = Math.min(Math.max(cents + 50, 0), 100);

  return (
    <div className="container">
      <h1>Guitar Tuner</h1>

      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
    
      {isListening && (
  <button
    onClick={
      isRecording
        ? stopRecording
        : startRecording
    }
  >
    {isRecording
      ? "Stop Recording"
      : "Record Sample"}
  </button>
)}
    
      <div className="string-selector">
  <button
    onClick={() =>
      setSelectedString("AUTO")
    }
  >
    AUTO
  </button>

  {["E2", "A2", "D3", "G3", "B3", "E4"].map(
    (string) => (
      <button
        key={string}
        onClick={() =>
          setSelectedString(string)
        }
      >
        {string}
      </button>
    )
  )}
</div>

<div className="current-selection">
  Currently Tuning:{" "}
  <span>
    {selectedString === "AUTO"
      ? "Auto Detect"
      : selectedString}
  </span>
</div>

<div className="target-frequency">
  Target:
  {
    selectedString === "AUTO"
      ? " Auto Detect"
      : ` ${
          {
            E2: "82.41 Hz",
            A2: "110.00 Hz",
            D3: "146.83 Hz",
            G3: "196.00 Hz",
            B3: "246.94 Hz",
            E4: "329.63 Hz",
          }[selectedString]
        }`
  }
</div>

      <TunerCard
        message={message}
        note={note}
        frequency={frequency}
        status={status}
        needlePosition={needlePosition}
        confidence={confidence}
      />

      <div className="visualizer-section \n">
        <div className="visualizer-title \n">Waveform</div>
        <Waveform analyser={analyser} />
      </div>

      <div className="visualizer-section \n">
        <div className="visualizer-title \n">Spectrum Analyzer</div>
        <Spectrum analyser={analyser} />
      </div>
    </div>
  );
}

export default App;