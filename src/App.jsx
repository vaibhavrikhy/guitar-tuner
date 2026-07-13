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
    recordingCountdown,
    recordedSamples,
    downloadManifest,
    datasetStats,
  } = useTuner();

  const needlePosition = Math.min(Math.max(cents + 50, 0), 100);

  return (
    <div className="container">
      <h1>Guitar Tuner</h1>

      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>

      {isListening && (
        <>
          <button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? "Stop Recording" : "Record Sample"}
          </button>

          {isRecording && (
            <div className="recording-status">
              Recording... {recordingCountdown}
            </div>
          )}

          <div className="sample-label">
            Sample Label:{" "}
            <span>
              {selectedString === "AUTO"
                ? "auto"
                : selectedString.toLowerCase()}
            </span>
          </div>
        </>
      )}
      {recordedSamples?.length > 0 && (
  <button onClick={downloadManifest}>
    Download Manifest ({recordedSamples.length})
  </button>
)}

{datasetStats && (
  <div className="dataset-dashboard">
    <h2>Dataset Progress</h2>

    <div className="dataset-total">
      Total Samples: {datasetStats.total}
    </div>

    {["E2", "A2", "D3", "G3", "B3", "E4"].map((string) => (
      <div className="dataset-row" key={string}>
        <span>{string}</span>

        <div className="dataset-bar">
          <div
            className="dataset-fill"
            style={{
              width: `${Math.min(datasetStats[string] * 10, 100)}%`,
            }}
          ></div>
        </div>

        <span>{datasetStats[string]}</span>
      </div>
    ))}
  </div>
)}

{recordedSamples.length > 0 && (
  <div className="recent-samples">
    <h2>Recent Samples</h2>

    {recordedSamples
      .slice()
      .reverse()
      .slice(0, 5)
      .map((sample) => (
        <div
          key={sample.fileName}
          className="sample-item"
        >
          ✓ {sample.fileName}
        </div>
      ))}
  </div>
)}


      <div className="string-selector">
        <button onClick={() => setSelectedString("AUTO")}>AUTO</button>

        {["E2", "A2", "D3", "G3", "B3", "E4"].map((string) => (
          <button key={string} onClick={() => setSelectedString(string)}>
            {string}
          </button>
        ))}
      </div>

      <div className="current-selection">
        Currently Tuning:{" "}
        <span>{selectedString === "AUTO" ? "Auto Detect" : selectedString}</span>
      </div>

      <div className="target-frequency">
        Target:
        {selectedString === "AUTO"
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
            }`}
      </div>

      <TunerCard
        message={message}
        note={note}
        frequency={frequency}
        status={status}
        needlePosition={needlePosition}
        confidence={confidence}
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