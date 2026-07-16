import "./App.css";

import TunerCard from "./components/TunerCard";
import Waveform from "./components/Waveform";
import Spectrum from "./components/Spectrum";

import useTuner from "./hooks/useTuner";

const guitarFrequencies = {
  E2: "82.41 Hz",
  A2: "110.00 Hz",
  D3: "146.83 Hz",
  G3: "196.00 Hz",
  B3: "246.94 Hz",
  E4: "329.63 Hz",
};

const guitarStrings = ["E2", "A2", "D3", "G3", "B3", "E4"];

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
    clearRecordedSamples,
  } = useTuner();

  const needlePosition = Math.min(Math.max(cents + 50, 0), 100);

  function handleClearDataset() {
    const shouldClear = window.confirm(
      "Are you sure you want to clear the saved dataset history?"
    );

    if (shouldClear) {
      clearRecordedSamples();
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Real-time pitch detection</p>
          <h1>Guitar Tuner</h1>
          <p className="app-subtitle">
            Tune your guitar using live microphone input and digital signal
            processing.
          </p>
        </div>

        <div className={`listening-indicator ${isListening ? "active" : ""}`}>
          <span className="status-dot"></span>
          {isListening ? "Microphone active" : "Microphone inactive"}
        </div>
      </header>

      <section className="tuner-layout">
        <div className="main-tuner-card">
          <div className="primary-control">
            <button
              className={`primary-button ${isListening ? "stop-button" : ""}`}
              onClick={isListening ? stopListening : startListening}
            >
              {isListening ? "Stop Listening" : "Start Listening"}
            </button>

            <p className="privacy-note">
              Microphone audio is processed locally in your browser.
            </p>
          </div>

          <div className="string-controls">
            <div className="section-heading">
              <div>
                <p className="section-label">Tuning mode</p>
                <h2>Select a string</h2>
              </div>

              <div className="current-string">
                {selectedString === "AUTO" ? "Auto Detect" : selectedString}
              </div>
            </div>

            <div className="string-selector">
              <button
                className={selectedString === "AUTO" ? "selected" : ""}
                onClick={() => setSelectedString("AUTO")}
              >
                AUTO
              </button>

              {guitarStrings.map((string) => (
                <button
                  key={string}
                  className={selectedString === string ? "selected" : ""}
                  onClick={() => setSelectedString(string)}
                >
                  {string}
                </button>
              ))}
            </div>

            <div className="target-information">
              <span>Target frequency</span>

              <strong>
                {selectedString === "AUTO"
                  ? "Automatic detection"
                  : guitarFrequencies[selectedString]}
              </strong>
            </div>
          </div>

          <TunerCard
            message={message}
            note={note}
            frequency={frequency}
            status={status}
            needlePosition={needlePosition}
            confidence={confidence}
          />
        </div>

        <aside className="signal-panel">
          <div className="signal-card">
            <div className="visualizer-heading">
              <div>
                <p className="section-label">Live signal</p>
                <h2>Waveform</h2>
              </div>
            </div>

            <Waveform analyser={analyser} />
          </div>

          <div className="signal-card">
            <div className="visualizer-heading">
              <div>
                <p className="section-label">Frequency analysis</p>
                <h2>Spectrum</h2>
              </div>
            </div>

            <Spectrum analyser={analyser} />
          </div>
        </aside>
      </section>

      <section className="dataset-lab">
        <details>
          <summary>
            <div>
              <p className="section-label">Development tools</p>
              <h2>Dataset Lab</h2>
            </div>

            <span>Open tools</span>
          </summary>

          <div className="dataset-content">
            <div className="recording-panel">
              <div>
                <h3>Record a training sample</h3>
                <p>
                  Select a string before recording so each sample receives the
                  correct label.
                </p>
              </div>

              <div className="recording-actions">
                <button
                  className="secondary-button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!isListening}
                >
                  {isRecording ? "Stop Recording" : "Record Sample"}
                </button>

                {isRecording && (
                  <div className="recording-status">
                    <span className="recording-dot"></span>
                    Recording... {recordingCountdown}
                  </div>
                )}
              </div>

              <div className="sample-label">
                Sample label:
                <strong>
                  {selectedString === "AUTO"
                    ? " auto"
                    : ` ${selectedString.toLowerCase()}`}
                </strong>
              </div>
            </div>

            {datasetStats && (
              <div className="dataset-dashboard">
                <div className="dataset-header">
                  <div>
                    <p className="section-label">Collection progress</p>
                    <h3>Dataset Progress</h3>
                  </div>

                  <div className="dataset-total">
                    {datasetStats.total} total
                  </div>
                </div>

                <div className="dataset-list">
                  {guitarStrings.map((string) => (
                    <div className="dataset-row" key={string}>
                      <span className="dataset-string">{string}</span>

                      <div className="dataset-bar">
                        <div
                          className="dataset-fill"
                          style={{
                            width: `${Math.min(
                              datasetStats[string] * 10,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>

                      <span className="dataset-count">
                        {datasetStats[string]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recordedSamples.length > 0 && (
              <div className="recent-samples">
                <div className="recent-samples-header">
                  <div>
                    <p className="section-label">Latest recordings</p>
                    <h3>Recent Samples</h3>
                  </div>
                </div>

                <div className="sample-list">
                  {recordedSamples
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((sample) => (
                      <div key={sample.fileName} className="sample-item">
                        <span className="sample-check">✓</span>

                        <div>
                          <strong>{sample.fileName}</strong>
                          <span>{sample.createdAt}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="dataset-actions">
              <button
                className="secondary-button"
                onClick={downloadManifest}
                disabled={recordedSamples.length === 0}
              >
                Download Manifest
                {recordedSamples.length > 0
                  ? ` (${recordedSamples.length})`
                  : ""}
              </button>

              <button
                className="danger-button"
                type="button"
                onClick={handleClearDataset}
                disabled={recordedSamples.length === 0}
              >
                Clear Dataset History
              </button>
            </div>
          </div>
        </details>
      </section>
    </main>
  );
}

export default App;