"use client";
import Header from "@/components/header";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MyListPage() {
  const [items, setItems] = useState<Array<{ id: string; tmdbId: number; mediaType: "movie" | "tv"; title: string; posterPath?: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/favorites", { credentials: "same-origin", cache: "no-store" });
        const text = await res.text();
        const data = text ? JSON.parse(text) : { favorites: [] };
        if (mounted) setItems(data?.favorites || []);
      } catch (e) {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-dvh">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">My List</h1>
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400">No items yet. Add movies and TV shows to your list from the title pages.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((it) => (
              <li key={it.id} className="group">
                <Link href={`/title/${it.mediaType}/${it.tmdbId}`} className="block">
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]">
                    {it.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${it.posterPath}`}
                        alt={it.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-sm text-neutral-400">No image</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-600 text-white font-medium">
                          {it.mediaType === "tv" ? "TV" : "Movie"}
                        </span>
                        <span className="text-xs text-white/90 line-clamp-1">{it.title}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

