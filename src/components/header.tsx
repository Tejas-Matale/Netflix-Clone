"use client";
import Link from "next/link";
import UserMenu from "@/components/user-menu";
import { useEffect, useRef, useState } from "react";

function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Array<{ id: number; title: string; type: "movie" | "tv" }>>([]);
  const [idx, setIdx] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setResults([]); setOpen(false); return; }
      try {
        const res = await fetch(`/api/tmdb?path=/search/multi&query=${encodeURIComponent(q)}`);
        const data = await res.json();
        const items = (data.results || [])
          .filter((x: { media_type: string }) => x.media_type === "movie" || x.media_type === "tv")
          .slice(0, 6)
          .map((x: { id: number; title?: string; name?: string; media_type: "movie" | "tv" }) => ({ 
            id: x.id, 
            title: x.title || x.name || "Unknown", 
            type: x.media_type 
          }));
        setResults(items); setOpen(true); setIdx(0);
      } catch {}
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => (i + 1) % results.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => (i - 1 + results.length) % results.length); }
    if (e.key === "Enter") {
      const sel = results[idx];
      if (sel) window.location.href = `/title/${sel.type}/${sel.id}`;
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        type="text"
        name="q"
        placeholder="Search..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q && setOpen(true)}
        onKeyDown={onKey}
        className="w-full bg-neutral-900/70 border border-neutral-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder:text-neutral-400"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-black/95 border border-neutral-800 rounded-md shadow-xl z-50">
          <ul>
            {results.map((r, i) => (
              <li key={`${r.type}-${r.id}`} className={`px-3 py-2 text-sm ${i === idx ? "bg-white/10" : ""}`}>
                <a href={`/title/${r.type}/${r.id}`} className="block">
                  {r.title}
                  <span className="ml-2 text-[10px] px-1 py-0.5 rounded bg-red-600 text-white">{r.type === "tv" ? "TV" : "Movie"}</span>
                </a>
              </li>
            ))}
            <li className="px-3 py-2 text-xs text-neutral-400">Press Enter to open selected</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-black via-black/90 to-transparent backdrop-blur-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
        {/* Netflix Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-red-600 text-white font-black text-2xl px-2 py-1 rounded group-hover:bg-red-500 transition-colors duration-200">
            NETFLIX
          </div>
        </Link>

        {/* Search (Desktop) */}
        <div className="hidden md:block flex-1 max-w-md">
          <SearchBox />
        </div>

        {/* Main Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-white hover:text-gray-300 transition-colors duration-200 relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/tv" className="text-gray-300 hover:text-white transition-colors duration-200 relative group">
            TV Shows
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/movies" className="text-gray-300 hover:text-white transition-colors duration-200 relative group">
            Movies  
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/anime" className="text-gray-300 hover:text-white transition-colors duration-200 relative group">
            Anime
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/my-list" className="text-gray-300 hover:text-white transition-colors duration-200 relative group">
            My List
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        {/* Mobile Icons */}
        <div className="flex items-center gap-2">
          <Link href="/search" className="md:hidden text-white p-2" aria-label="Search">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </Link>
          {/* Mobile Menu Button - placeholder */}
          <button className="lg:hidden text-white p-2" aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <UserMenu />
      </div>
    </header>
  );
}

