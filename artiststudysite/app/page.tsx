"use client";
import { useEffect, useState } from "react";
import ArtCanvas from "@/components/ArtCanvas";

export default function Home() {
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allIDs, setAllIDs] = useState<number[]>([]);

  // 🎨 Only include actual paintings/drawings/sculpture/etc.
  const allowedDepartments = [
    "European Paintings",
    "Modern and Contemporary Art",
    "Drawings and Prints",
    "American Decorative Arts",
    "The American Wing",
    "Arts of Africa, Oceania, and the Americas",
  ];

  // 1️⃣ Load all object IDs once
  useEffect(() => {
    const fetchAllIDs = async () => {
      try {
        const res = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects");
        const data = await res.json();
        setAllIDs(data.objectIDs);
      } catch (err) {
        console.error("Failed to load object IDs:", err);
      }
    };
    fetchAllIDs();
  }, []);

  // 2️⃣ Fetch random artwork safely
  const fetchRandomArtwork = async () => {
    if (!allIDs.length) return;
    setLoading(true);

    try {
      let art = null;
      let attempts = 0;
      const maxAttempts = 25; // safety cap to avoid infinite loops

      while (attempts < maxAttempts) {
        attempts++;
        const randomID = allIDs[Math.floor(Math.random() * allIDs.length)];

        // Some IDs are missing — we’ll safely skip those
        let res;
        try {
          res = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomID}`
          );
        } catch {
          continue; // skip failed fetch
        }

        if (!res.ok) continue;

        const data = await res.json();

        if (!data || !data.primaryImageSmall) continue;
        if (!allowedDepartments.includes(data.department)) continue;

        art = data;
        break;
      }

      if (art) {
        setArtwork(art);
      } else {
        console.warn("No valid artwork found after several attempts.");
      }
    } catch (err) {
      console.error("Error fetching random artwork:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ Load one on startup
  useEffect(() => {
    if (allIDs.length) fetchRandomArtwork();
  }, [allIDs]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Art Study</h1>

      {loading && <p className="text-center">Loading artwork…</p>}

      {!loading && artwork?.primaryImageSmall && (
        <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
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
            <p className="text-sm text-gray-500">{artwork.department}</p>

            <button
              onClick={fetchRandomArtwork}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Load Another Artwork
            </button>
          </div>

          <ArtCanvas width={600} height={400} />
        </div>
      )}
    </main>
  );
}
