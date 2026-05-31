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
  } = useTuner();

  const needlePosition = Math.min(Math.max(cents + 50, 0), 100);

  return (
    <div className="container">
      <h1>Guitar Tuner</h1>

      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
    
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