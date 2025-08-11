"use client";
import { useEffect, useState, useTransition } from "react";

type Props = {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  className?: string;
  variant?: "default" | "icon";
  blockNavigation?: boolean;
};

export default function FavoriteButton({ tmdbId, mediaType, title, posterPath, className = "", variant = "default", blockNavigation = true }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!tmdbId) return;
    const url = `/api/favorites?tmdbId=${tmdbId}&mediaType=${mediaType}`;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) return { exists: false };
        return r.json();
      })
      .then((d) => setIsFavorite(Boolean(d?.exists)))
      .catch(() => {});
    return () => controller.abort();
  }, [tmdbId, mediaType]);

  function handleGuardedClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (blockNavigation) {
      e.preventDefault();
      e.stopPropagation();
      // @ts-ignore
      if (e.nativeEvent?.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
    }
  }

  function toggle() {
    if (!tmdbId) return;
    setErr(null);
    startTransition(async () => {
      const next = !isFavorite;
      setIsFavorite(next);
      const res = await fetch(`/api/favorites`, {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, mediaType, title, posterPath }),
      });
      if (res.status === 401) {
        window.location.href = "/signin";
        return;
      }
      if (!res.ok) {
        setIsFavorite(!next);
        try {
          const j = await res.json();
          setErr(j?.error || "Failed");
        } catch {
          setErr("Failed");
        }
      } else {
        const evt = new CustomEvent("app:toast", { detail: { message: next ? "Added to My List" : "Removed from My List", type: "success" } });
        window.dispatchEvent(evt);
      }
    });
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={(e) => { handleGuardedClick(e); toggle(); }}
        disabled={isPending}
        aria-label={isFavorite ? "Remove from My List" : "Add to My List"}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white transition ${className}`}
        title={isFavorite ? "Remove from My List" : "Add to My List"}
      >
        {isFavorite ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.1 21.35l-1.1-1.02C5.14 15.28 2 12.36 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.86-3.14 6.78-8.9 11.83z"/>
          </svg>
        )}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={(e) => { handleGuardedClick(e); toggle(); }}
        disabled={isPending}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition`}
        title={isFavorite ? "Remove from My List" : "Add to My List"}
      >
        {isFavorite ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.1 21.35l-1.1-1.02C5.14 15.28 2 12.36 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.86-3.14 6.78-8.9 11.83z"/>
          </svg>
        )}
        <span>{isFavorite ? "My List" : "Add"}</span>
      </button>
      {err && <span className="text-xs text-red-400">{err}</span>}
    </div>
  );
} 