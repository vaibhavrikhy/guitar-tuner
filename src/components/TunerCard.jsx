function TunerCard({
  message,
  note,
  frequency,
  cents,
  status,
  needlePosition,
}) {
  return (
    <div className="card">
      <p>{message}</p>

      <div className="note">
        {note}
      </div>

      <div className="frequency">
        {frequency} Hz
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "18px",
        }}
      >
        {cents} cents
      </div>

      <div className="tuner">
        <div className="scale">
          <div className="center-line"></div>

          <div
            className="needle"
            style={{
              left: `${needlePosition}%`,
            }}
          ></div>
        </div>

        <div className="labels">
          <span>Flat</span>

          <span>In Tune</span>

          <span>Sharp</span>
        </div>
      </div>

      <div className="status">
        {status}
      </div>
    </div>
  );
}

export default TunerCard;