"use client";
import { useRef, useState, useEffect } from "react";

interface DrawingCanvasProps {
  width?: number;
  height?: number;
}

export default function DrawingCanvas({ width = 600, height = 400 }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctxRef.current = ctx;
  }, [width, height]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctxRef.current) return;
    setIsDrawing(true);
    const { x, y } = getMousePos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctxRef.current) return;
    const { x, y } = getMousePos(e);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!ctxRef.current) return;
    setIsDrawing(false);
    ctxRef.current.closePath();
  };

  const clearCanvas = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctxRef.current.fillStyle = "white";
    ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "drawing.png";
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-400 cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ width, height }}
      />
      <div className="mt-2 space-x-2">
        <button
          onClick={clearCanvas}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear
        </button>
        <button
          onClick={saveCanvas}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}
