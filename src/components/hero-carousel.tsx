"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Hero from "./hero";
import type { TmdbMedia } from "@/lib/tmdb";

type Props = {
  items: TmdbMedia[];
  intervalMs?: number;
  forceType?: "movie" | "tv";
};

export default function HeroCarousel({ items, intervalMs = 5000, forceType }: Props) {
  const slides = useMemo(() => items.filter(Boolean).slice(0, 8), [items]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current && window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (isPaused) return;
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length, intervalMs, isPaused]);

  if (slides.length === 0) return null;
  const current = slides[index];
  const type = forceType ?? (current.media_type === "tv" ? "tv" : "movie");
  const title = current.title || current.name || "";

  return (
    <div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <Hero
        key={`${type}-${current.id}`}
        title={title}
        overview={current.overview}
        backdropPath={current.backdrop_path}
        id={current.id}
        type={type}
      />
      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute z-20 bottom-28 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === index ? "bg-white" : "bg-white/40"}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 