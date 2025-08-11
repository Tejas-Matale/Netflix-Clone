"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type MediaType = "movie" | "tv";

type TMDBItem = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  seasons?: Array<{ season_number: number; name?: string; episode_count?: number }>;
};

type TMDBEpisode = { episode_number: number; name: string };

export default function TitleModalHost() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<MediaType>("movie");
  const [id, setId] = useState<number | null>(null);
  const [item, setItem] = useState<TMDBItem | null>(null);
  const [loading, setLoading] = useState(false);

  // TV-specific state
  const [season, setSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [episode, setEpisode] = useState<number | null>(null);
  const hasTV = type === "tv" && id != null;

  // Drag-to-scroll refs
  const seasonRowRef = useRef<HTMLDivElement>(null!);
  const episodeRowRef = useRef<HTMLDivElement>(null!);
  const seasonDrag = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const episodeDrag = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const [draggingSeasons, setDraggingSeasons] = useState(false);
  const [draggingEpisodes, setDraggingEpisodes] = useState(false);

  function close() {
    setOpen(false);
    setItem(null);
    setSeason(null);
    setEpisodes([]);
    setEpisode(null);
  }

  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  // Open modal and fetch title details
  useEffect(() => {
    async function onOpen(e: Event) {
      const detail = (e as CustomEvent).detail as { type: MediaType; id: number };
      if (!detail) return;
      setType(detail.type);
      setId(detail.id);
      setOpen(true);
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb?path=/${detail.type}/${detail.id}`);
        const data = await res.json();
        setItem(data);
        if (detail.type === "tv") {
          const seasons = (data.seasons || []).filter((s: { season_number: number; episode_count?: number | null }) => 
    s.season_number > 0 && (s.episode_count ?? 0) > 0
  );
          const initial = seasons.length ? seasons[0].season_number : 1;
          setSeason(initial);
        }
      } catch {}
      setLoading(false);
    }
    window.addEventListener("app:title-modal", onOpen);
    return () => window.removeEventListener("app:title-modal", onOpen);
  }, []);

  // Fetch episodes when TV season changes
  useEffect(() => {
    if (!hasTV || season == null || id == null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/tmdb?path=/tv/${id}/season/${season}`);
        const data = await res.json();
        if (cancelled) return;
        const eps = (data.episodes || []).map((ep: { episode_number: number; name: string }) => ({ 
      episode_number: ep.episode_number, 
      name: ep.name 
    })) as TMDBEpisode[];
        setEpisodes(eps);
        setEpisode(eps.length ? eps[0].episode_number : 1);
      } catch {
        if (!cancelled) { setEpisodes([]); setEpisode(null); }
      }
    })();
    return () => { cancelled = true; };
  }, [hasTV, season, id]);

  const canPlay = useMemo(() => {
    if (type === "movie") return id != null;
    return id != null && season != null && episode != null;
  }, [type, id, season, episode]);

  // helpers for drag scroll
  function onMouseDown(ref: React.RefObject<HTMLDivElement>, dragRef: React.MutableRefObject<{ isDown: boolean; startX: number; scrollLeft: number }>, setDragging: (v: boolean) => void) {
    return (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      dragRef.current.isDown = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.scrollLeft = ref.current.scrollLeft;
      setDragging(true);
    };
  }
  function onMouseMove(ref: React.RefObject<HTMLDivElement>, dragRef: React.MutableRefObject<{ isDown: boolean; startX: number; scrollLeft: number }>) {
    return (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current || !dragRef.current.isDown) return;
      e.preventDefault();
      const delta = e.clientX - dragRef.current.startX;
      ref.current.scrollLeft = dragRef.current.scrollLeft - delta;
    };
  }
  function onMouseUp(dragRef: React.MutableRefObject<{ isDown: boolean; startX: number; scrollLeft: number }>, setDragging: (v: boolean) => void) {
    return () => { dragRef.current.isDown = false; setDragging(false); };
  }

  if (!open) return null;
  const title = item?.title || item?.name || "Title";
  const poster = item?.poster_path;
  const backdrop = item?.backdrop_path;
  const detailsHref = type && id != null ? `/title/${type}/${id}` : "#";
  const playHref = type && id != null ? (type === "movie" ? `/watch/movie/${id}` : season && episode ? `/watch/tv/${id}/${season}/${episode}` : "#") : "#";

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
      <div className="relative w-full max-w-5xl max-h-[88vh] overflow-auto rounded-xl bg-neutral-950 border border-neutral-800" onClick={(e) => e.stopPropagation()}>
        {/* Backdrop banner */}
        <div className="relative w-full h-44 sm:h-64 md:h-72">
          {backdrop ? (
            <Image
              src={`https://image.tmdb.org/t/p/w780${backdrop}`}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
        </div>

        <div className="p-4 sm:p-6 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="relative w-28 sm:w-36 md:w-40 aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
              {poster ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w342${poster}`}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 144px, 160px"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-neutral-400 text-xs">No image</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h2>
              {loading ? (
                <p className="text-neutral-400">Loading...</p>
              ) : (
                <p className="text-neutral-300 text-sm sm:text-base whitespace-pre-line line-clamp-6 md:line-clamp-none">{item?.overview || ""}</p>
              )}

              {/* TV season/episode selectors */}
              {hasTV && (
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-neutral-300 text-sm mb-2">Season</div>
                    <div
                      ref={seasonRowRef}
                      onMouseDown={onMouseDown(seasonRowRef, seasonDrag, setDraggingSeasons)}
                      onMouseMove={onMouseMove(seasonRowRef, seasonDrag)}
                      onMouseLeave={onMouseUp(seasonDrag, setDraggingSeasons)}
                      onMouseUp={onMouseUp(seasonDrag, setDraggingSeasons)}
                      className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
                      style={{ cursor: draggingSeasons ? "grabbing" : "grab", userSelect: draggingSeasons ? "none" as const : undefined }}
                    >
                      {(item?.seasons || [])
                        ?.filter((s) => (s.season_number ?? 0) > 0)
                        .map((s) => {
                          const selected = s.season_number === season;
                          return (
                            <button
                              key={s.season_number}
                              onClick={() => setSeason(s.season_number)}
                              className={`px-3 py-1 rounded-full text-sm border transition-colors whitespace-nowrap ${
                                selected
                                  ? "bg-red-600 border-red-600 text-white"
                                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                              }`}
                            >
                              {s.name || `Season ${s.season_number}`}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-300 text-sm mb-2">Episode</div>
                    <div
                      ref={episodeRowRef}
                      onMouseDown={onMouseDown(episodeRowRef, episodeDrag, setDraggingEpisodes)}
                      onMouseMove={onMouseMove(episodeRowRef, episodeDrag)}
                      onMouseLeave={onMouseUp(episodeDrag, setDraggingEpisodes)}
                      onMouseUp={onMouseUp(episodeDrag, setDraggingEpisodes)}
                      className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
                      style={{ cursor: draggingEpisodes ? "grabbing" : "grab", userSelect: draggingEpisodes ? "none" as const : undefined }}
                    >
                      {episodes.map((ep) => {
                        const selected = ep.episode_number === episode;
                        return (
                          <button
                            key={ep.episode_number}
                            onClick={() => setEpisode(ep.episode_number)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors whitespace-nowrap ${
                              selected
                                ? "bg-red-600 border-red-600 text-white"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                            }`}
                            title={ep.name}
                          >
                            {`E${ep.episode_number}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <a
                  href={canPlay ? playHref : "#"}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded font-semibold text-sm ${canPlay ? "bg-white text-black hover:bg-gray-100" : "bg-white/20 text-white cursor-not-allowed"}`}
                  onClick={(e) => { if (!canPlay) e.preventDefault(); }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Play
                </a>
                <a href={detailsHref} className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-white/20 border border-white/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  View Details
                </a>
              </div>
            </div>
          </div>
        </div>

        <button onClick={close} aria-label="Close" className="absolute top-3 right-3 text-white/80 hover:text-white">✕</button>
      </div>
    </div>
  );
} 