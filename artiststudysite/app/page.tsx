"use client";
import { useEffect, useState } from "react";

const artworkIDs = [
  436535, 436528, 436533, 436532, 436524, 436525,
  437853, 437854, 437855, 437856, 437857, 437858
];

export default function Home() {
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchRandomArtwork() {
    setLoading(true);
    try {
      const randomID = artworkIDs[Math.floor(Math.random() * artworkIDs.length)];
      const artRes = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomID}`
      );
      const art = await artRes.json();
      setArtwork(art);
    } catch (error) {
      console.error("Error fetching artwork:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRandomArtwork();
  }, []);

  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">🎨 Study this artwork</h1>

      {loading && <p>Loading artwork…</p>}

      {artwork?.primaryImageSmall && !loading && (
        <>
          {/* Wrap image in a link to the full-size image */}
          <a
            href={artwork.primaryImage}
            target="_blank"
            rel="noopener noreferrer"
            title="Click to view full image"
          >
            <img
              src={artwork.primaryImageSmall}
              alt={artwork.title || "Artwork"}
              className="mx-auto rounded shadow-lg max-h-[400px] cursor-pointer hover:opacity-80 transition"
            />
          </a>

          <p className="mt-2 text-lg italic">{artwork.title}</p>
          <p>{artwork.artistDisplayName}</p>
        </>
      )}

      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={fetchRandomArtwork}
      >
        Load Another Artwork
      </button>
    </main>
  );
}
