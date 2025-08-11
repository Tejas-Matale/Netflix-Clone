import Header from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { fetchTmdb, TmdbListResult, TmdbMedia } from "@/lib/tmdb";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

async function searchTitles(query: string): Promise<TmdbMedia[]> {
  const path = `/search/multi?language=en-US&include_adult=false&query=${encodeURIComponent(query)}`;
  const res = await fetchTmdb<TmdbListResult<TmdbMedia & { media_type?: string }>>(path);
  return (res.results ?? []).filter((r) => r.media_type === "movie" || r.media_type === "tv");
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q ?? "").trim();
  const results = query ? await searchTitles(query) : [];

  return (
    <main className="min-h-dvh">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Search</h1>

        <form action="/search" className="mb-6">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search for movies, TV shows..."
            className="w-full bg-neutral-900/70 border border-neutral-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder:text-neutral-400"
            autoFocus
          />
        </form>

        {query.length === 0 ? (
          <p className="text-neutral-400">Start typing to find titles.</p>
        ) : results.length === 0 ? (
          <p className="text-neutral-400">No results found for “{query}”.</p>
        ) : (
          <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {results.map((item) => {
              const type = item.media_type === "tv" ? "tv" : "movie";
              const title = item.title || item.name || "Untitled";
              const href = `/title/${type}/${item.id}`;

              return (
                <li key={`${type}-${item.id}`} className="group">
                  <Link href={href} className="block">
                    <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]">
                      {item.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                          alt={title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-sm text-neutral-400">
                          No image
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-600 text-white font-medium">
                            {type === "tv" ? "TV" : "Movie"}
                          </span>
                          <span className="text-xs text-white/90 line-clamp-1">{title}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
} 