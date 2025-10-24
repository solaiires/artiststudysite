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
  const [opacity, setOpacity] = useState(1);
  const [lineWidth, setLineWidth] = useState(3);
  const [eraser, setEraser] = useState(false);
  const [hue, setHue] = useState(0);

  // ======================== DRAWING CANVAS ========================
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
    lastPos.current = getPos(e);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!drawing.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const pos = getPos(e);
    ctx.lineWidth = lineWidth * (e.pressure || 1);
    ctx.strokeStyle = eraser ? "white" : hexToRgba(color, opacity);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const handlePointerUpOrLeave = () => {
    drawing.current = false;
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
  }, [color, opacity, lineWidth, eraser]);

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "my-drawing.png";
    link.click();
  };

  // ======================== COLOR PICKER ========================
  const squareRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);
  const size = 150;
  const hueWidth = 15;

  // Draw color square
  const drawColorSquare = (hueValue: number) => {
    const canvas = squareRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // Base hue
    ctx.fillStyle = `hsl(${hueValue}, 100%, 50%)`;
    ctx.fillRect(0, 0, size, size);

    // White gradient
    const whiteGrad = ctx.createLinearGradient(0, 0, size, 0);
    whiteGrad.addColorStop(0, "white");
    whiteGrad.addColorStop(1, "transparent");
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, size, size);

    // Black gradient
    const blackGrad = ctx.createLinearGradient(0, 0, 0, size);
    blackGrad.addColorStop(0, "transparent");
    blackGrad.addColorStop(1, "black");
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, size, size);
  };

  // Draw hue slider
  const drawHueSlider = (hueValue: number) => {
    const canvas = hueRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, hueWidth + 10, size);

    const grad = ctx.createLinearGradient(0, 0, 0, size);
    for (let i = 0; i <= 360; i += 10) {
      grad.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, hueWidth, size);

    // Indicator triangle
    const y = (hueValue / 360) * size;
    ctx.beginPath();
    ctx.moveTo(hueWidth + 2, y);
    ctx.lineTo(hueWidth + 8, y - 5);
    ctx.lineTo(hueWidth + 8, y + 5);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
  };

  useEffect(() => {
    drawColorSquare(hue);
    drawHueSlider(hue);
  }, [hue]);

  // Pick color from square
  const pickColorSquare = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = squareRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const picked = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
      .toString(16)
      .slice(1)}`;
    setColor(picked);
    setEraser(false);
  };

  // Hue picking (click + drag)
  const isPickingHue = useRef(false);
  const handleHueDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPickingHue.current = true;
    updateHue(e);
  };
  const handleHueMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPickingHue.current) updateHue(e);
  };
  const handleHueUp = () => {
    isPickingHue.current = false;
  };

  const updateHue = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = Math.max(0, Math.min(size, e.clientY - rect.top));
    const hueValue = (y / size) * 360;
    setHue(hueValue);
  };

  // Initial draw
  useEffect(() => {
    drawColorSquare(hue);
    drawHueSlider(hue);
  }, []);

  return (
    <div className="flex space-x-4">
      {/* Drawing Canvas */}
      <div>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ border: "1px solid black", touchAction: "none" }}
          className="cursor-crosshair"
        />
        <div className="controls mt-2 flex flex-wrap items-center space-x-2">
          <button
            onClick={() => setEraser(false)}
            className={`px-3 py-1 rounded ${
              !eraser ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Pen
          </button>
          <button
            onClick={() => setEraser(true)}
            className={`px-3 py-1 rounded ${
              eraser ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
          >
            Eraser
          </button>
          <label>
            Opacity:
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
            Line Width:
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
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={saveCanvas}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>

      {/* Color Picker */}
      <div className="flex flex-col items-center">
        <div className="flex items-start">
          <canvas
            ref={squareRef}
            width={size}
            height={size}
            onClick={pickColorSquare}
            style={{ cursor: "crosshair", border: "1px solid #888" }}
          />
          <canvas
            ref={hueRef}
            width={hueWidth + 10}
            height={size}
            onMouseDown={handleHueDown}
            onMouseMove={handleHueMove}
            onMouseUp={handleHueUp}
            onMouseLeave={handleHueUp}
            style={{
              cursor: "ns-resize",
              marginLeft: "5px",
              border: "1px solid #888",
            }}
          />
        </div>

        {/* Color preview swatch */}
        <div
          className="mt-2 w-10 h-10 rounded-full border border-gray-400"
          style={{ backgroundColor: color }}
          title={color}
        />
      </div>
    </div>
  );
}
