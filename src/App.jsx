import "./App.css";

import TunerCard from "./components/TunerCard";

import useTuner from "./hooks/useTuner";

import Waveform from"./components/Waveform";  

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
    analyser
  } = useTuner();

  const needlePosition = Math.min(
    Math.max(cents + 50, 0),
    100
  );

  return (
    <div className="container">
      <h1>Guitar Tuner</h1>

      <button
        onClick={
          isListening
            ? stopListening
            : startListening
        }
      >
        {isListening
          ? "Stop Listening"
          : "Start Listening"}
      </button>

      <Waveform analyser={analyser} />

      <TunerCard
        message={message}
        note={note}
        frequency={frequency}
        status={status}
        needlePosition={needlePosition}
      />
    </div>
  );
}

export default App;