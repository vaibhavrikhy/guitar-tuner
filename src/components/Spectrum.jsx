import { useEffect, useRef } from "react";

function Spectrum({ analyser }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext("2d");

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasContext.fillStyle = "#111827";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;

        canvasContext.fillStyle = "#22c55e";
        canvasContext.fillRect(
          x,
          canvas.height - barHeight,
          barWidth,
          barHeight
        );

        x += barWidth + 1;
      }
    }

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={350}
      height={120}
      style={{
        marginTop: "20px",
        borderRadius: "12px",
      }}
    />
  );
}

export default Spectrum;