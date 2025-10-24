"use client";
import { useEffect, useState } from "react";
import ArtCanvas from "@/components/ArtCanvas";

const artworkIDs = [436535, 436528, 436533, 436532, 436524, 436525];

export default function Home() {
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Art Study</h1>

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

          {/* Canvas Drawing */}
          <ArtCanvas width={600} height={400} />
        </div>
      )}
    </main>
  );
}

