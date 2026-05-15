import "./App.css";

import TunerCard from "./components/TunerCard";
import Waveform from "./components/Waveform";
import Spectrum from "./components/Spectrum";

import useTuner from "./hooks/useTuner";

function App() {
  const {
    message,
    frequency,
    note,
    status,
    cents,
    isListening,
    startListening,
    stopListening,
    analyser,
  } = useTuner();

  const needlePosition = Math.min(Math.max(cents + 50, 0), 100);

  return (
    <div className="container">
      <h1>Guitar Tuner</h1>

      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>

      <TunerCard
        message={message}
        note={note}
        frequency={frequency}
        status={status}
        needlePosition={needlePosition}
      />

      <div className="visualizer-section">
        <div className="visualizer-title">Waveform</div>
        <Waveform analyser={analyser} />
      </div>

      <div className="visualizer-section">
        <div className="visualizer-title">Spectrum Analyzer</div>
        <Spectrum analyser={analyser} />
      </div>
    </div>
  );
}

export default App;