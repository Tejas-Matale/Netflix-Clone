"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TmdbMedia } from "@/lib/tmdb";
import FavoriteButton from "@/components/favorite-button";

type MediaWithExtras = TmdbMedia & {
  href?: string;
  positionMs?: number;
  durationMs?: number;
};

type RowProps = {
  title: string;
  items: MediaWithExtras[];
  auto?: boolean;
  intervalMs?: number;
  forceType?: "movie" | "tv";
};

export default function Row({ title, items, auto = true, intervalMs = 3500, forceType }: RowProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  useEffect(() => {
    if (!auto) return;
    const el = scrollerRef.current;
    if (!el) return;

    const timer = window.setInterval(() => {
      if (isPaused) return;
      const step = Math.max(el.clientWidth * 0.9, 320);
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 20;
      if (nearEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [auto, intervalMs, isPaused]);

  return (
    <section className="mb-8">
      <h3 className="mb-2 px-4 max-w-7xl mx-auto font-medium">{title}</h3>
      <div className="relative">
        <button
          aria-label="Scroll left"
          className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2"
          onClick={() => scrollBy(-500)}
        >
          ‹
        </button>
        <ul
          ref={scrollerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="no-scrollbar flex gap-2 overflow-x-auto pl-4 pr-4 max-w-7xl mx-auto"
        >
          {items.map((m) => {
            const type = forceType ?? (m.media_type === "tv" ? "tv" : "movie");
            const defaultHref = `/title/${type}/${m.id}`;
            const href = m.href ?? defaultHref;
            const title = m.title || m.name || "Untitled";
            const pos = m.positionMs;
            const dur = m.durationMs;
            const pct = pos && dur ? Math.min(100, Math.max(0, Math.round((pos / dur) * 100))) : undefined;
            const modalHref = href.startsWith("/watch/") ? href : `/title/${type}/${m.id}`;
            
            return (
              <li key={m.id} className="relative w-40 md:w-48 lg:w-56 shrink-0 group">
                <Link href={modalHref} className="block relative" onClick={(e) => {
                  if (!href.startsWith("/watch/")) {
                    e.preventDefault();
                    const evt = new CustomEvent("app:title-modal", { detail: { type, id: m.id } });
                    window.dispatchEvent(evt);
                  }
                }}>
                  {/* Main Card */}
                  <div className="relative w-full aspect-[2/3] bg-neutral-900 rounded-lg overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:z-20 shadow-lg group-hover:shadow-2xl">
                    {m.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${m.poster_path}`}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 40vw, (max-width: 1200px) 20vw, 16vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110 [image-rendering:-webkit-optimize-contrast]"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-sm text-gray-400 bg-neutral-800">
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                          No Image
                        </div>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Title Overlay (appears on hover) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">{title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-300">
                        <span className="px-1.5 py-0.5 bg-red-600 rounded text-white font-medium">
                          {type === "tv" ? "TV" : "Movie"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Play Button (appears on hover) */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg hover:bg-white transition-colors">
                        <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {pct !== undefined && (
                      <div className="absolute left-0 right-0 bottom-0 h-1 bg-black/40">
                        <div className="h-full bg-red-600" style={{ width: `${pct}%` }} />
                      </div>
                    )}

                    {/* Quick Add to My List */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FavoriteButton
                        tmdbId={m.id}
                        mediaType={type}
                        title={title}
                        posterPath={m.poster_path || undefined}
                        variant="icon"
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <button
          aria-label="Scroll right"
          className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2"
          onClick={() => scrollBy(500)}
        >
          ›
        </button>
      </div>
    </section>
  );
}

