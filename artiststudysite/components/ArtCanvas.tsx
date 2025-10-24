"use client";
import { useEffect, useRef, useState } from "react";

interface CanvasProps {
  width: number;
  height: number;
}

export default function DrawingCanvas({ width, height }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(0.1); // default to light
  const [lineWidth, setLineWidth] = useState(3);

  // Convert hex + opacity to rgba string
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
  }, [width, height]);

  const getPos = (e: PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (!ctxRef.current) return;
    drawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!drawing.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const pos = getPos(e);

    const pressure = e.pressure > 0 ? e.pressure : 1;
    ctx.lineWidth = lineWidth * pressure;
    ctx.strokeStyle = hexToRgba(color, opacity);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
  };

  const handlePointerUpOrLeave = () => {
    drawing.current = false;
  };

  const clearCanvas = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "my-drawing.png";
    link.click();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUpOrLeave);
    canvas.addEventListener("pointerleave", handlePointerUpOrLeave);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUpOrLeave);
      canvas.removeEventListener("pointerleave", handlePointerUpOrLeave);
    };
  }, [color, opacity, lineWidth]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black", touchAction: "none" }}
        width={width}
        height={height}
        className="cursor-crosshair"
      />

      <div className="controls mt-2 flex items-center space-x-4">
        <label>
          Color:{" "}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <label>
          Opacity:{" "}
          <input
            type="range"
            min={0.01}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
          />
        </label>

        <label>
          Line Width:{" "}
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
          />
        </label>

        <button
          onClick={clearCanvas}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Clear
        </button>

        <button
          onClick={saveCanvas}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}
