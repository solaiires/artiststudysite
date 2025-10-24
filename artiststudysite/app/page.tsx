"use client";
import { useEffect, useRef, useState } from "react";

// Sample artwork IDs for quick demo
const artworkIDs = [436535, 436528, 436533, 436532, 436524, 436525];

export default function Home() {
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Fetch random artwork
  const fetchRandomArtwork = async () => {
    setLoading(true);
    try {
      const randomID = artworkIDs[Math.floor(Math.random() * artworkIDs.length)];
      const res = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomID}`
      );
      const art = await res.json();
      setArtwork(art);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomArtwork();
  }, []);

  // Setup canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";

    ctx.fillStyle = "white"; // background white
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctxRef.current = ctx;
  }, [artwork]); // reset canvas whenever artwork changes

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
    link.download = "my-drawing.png";
    link.click();
  };

  // Canvas dimensions (match artwork if possible)
  const canvasWidth = 600;
  const canvasHeight = 400;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">🎨 Art Study</h1>

      {loading && <p className="text-center">Loading artwork…</p>}

      {!loading && artwork?.primaryImageSmall && (
        <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
          {/* Artwork */}
          <div className="flex flex-col items-center">
            <a
              href={artwork.primaryImage}
              target="_blank"
              rel="noopener noreferrer"
              title="Click to view full image"
            >
              <img
                src={artwork.primaryImageSmall}
                alt={artwork.title || "Artwork"}
                className="rounded shadow-lg max-h-[400px] cursor-pointer hover:opacity-80 transition"
              />
            </a>
            <p className="mt-2 text-lg italic">{artwork.title}</p>
            <p>{artwork.artistDisplayName}</p>
            <button
              onClick={fetchRandomArtwork}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Load Another Artwork
            </button>
          </div>

          {/* Drawing Canvas */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Draw your study</h2>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="border border-gray-400 cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{ width: canvasWidth, height: canvasHeight }}
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
        </div>
      )}
    </main>
  );
}
