import { useEffect, useRef } from "react";

function Waveform({ analyser }) {
  const canvasRef =
    useRef(null);

  const animationFrameRef =
    useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas =
      canvasRef.current;

    const canvasContext =
      canvas.getContext("2d");

    const bufferLength =
      analyser.fftSize;

    const dataArray =
      new Uint8Array(bufferLength);

    function draw() {
      animationFrameRef.current =
        requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(
        dataArray
      );

      canvasContext.fillStyle =
        "#111827";

      canvasContext.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvasContext.lineWidth = 2;

      canvasContext.strokeStyle =
        "#22c55e";

      canvasContext.beginPath();

      const sliceWidth =
        canvas.width / bufferLength;

      let x = 0;

      for (
        let i = 0;
        i < bufferLength;
        i++
      ) {
        const v =
          dataArray[i] / 128.0;

        const y =
          (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(
        canvas.width,
        canvas.height / 2
      );

      canvasContext.stroke();
    }

    draw();

    return () => {
      if (
        animationFrameRef.current
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
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

export default Waveform;