import Header from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import Row from "@/components/row";
import FavoriteButton from "@/components/favorite-button";
import { fetchTmdb, TmdbListResult, TmdbMedia } from "@/lib/tmdb";
import { TMDBTVShow, TMDBMovie } from "@/types/tmdb";

type Props = { params: Promise<{ type: "movie" | "tv"; id: string }> };

async function getData(type: "movie" | "tv", id: string) {
  const base = `/${type}/${id}`;
  const details = await fetchTmdb<TMDBTVShow | TMDBMovie>(`${base}?language=en-US`);
  const recommendations = (await fetchTmdb<TmdbListResult<TmdbMedia>>(`${base}/recommendations?language=en-US`)).results;
  let seasons: { id: number; season_number: number; episode_count: number; name: string }[] = [];
  if (type === "tv" && 'seasons' in details) {
    seasons = details.seasons ?? [];
  }
  return { details, recommendations, seasons };
}

export default async function TitlePage({ params }: Props) {
  const { type, id } = await params;
  const { details, recommendations, seasons } = await getData(type, id);
  const title = ('title' in details ? details.title : details.name) || "Title";
  const poster = details.poster_path;
  const overview = details.overview;

  return (
    <main className="min-h-dvh">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="relative w-40 md:w-56 aspect-[2/3] rounded overflow-hidden bg-neutral-900">
            {poster && (
              <Image
                src={`https://image.tmdb.org/t/p/w342${poster}`}
                alt={title}
                fill
                sizes="(max-width: 768px) 40vw, 20vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {overview && <p className="mt-2 text-gray-300 max-w-2xl">{overview}</p>}
            <div className="mt-4 flex gap-3 flex-wrap items-center">
              {type === "movie" ? (
                <Link href={`/watch/movie/${id}`} className="bg-white text-black px-4 py-2 rounded font-medium text-sm md:text-base">
                  Play
                </Link>
              ) : (
                <Link href={`/watch/tv/${id}/1/1`} className="bg-white text-black px-4 py-2 rounded font-medium text-sm md:text-base">
                  Play S1:E1
                </Link>
              )}
              <FavoriteButton
                tmdbId={Number(id)}
                mediaType={type}
                title={title}
                posterPath={poster}
              />
            </div>
          </div>
        </div>

        {type === "tv" && seasons.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Seasons</h2>
            <ul className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {seasons.map((s) => (
                <li key={s.id ?? s.season_number} className="shrink-0">
                  <Link
                    href={`/watch/tv/${id}/${s.season_number}/1`}
                    className="block bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-2 text-sm"
                  >
                    Season {s.season_number}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recommendations.length > 0 && (
          <div className="mt-10">
            <Row title="More Like This" items={recommendations.slice(0, 18)} forceType={type} />
          </div>
        )}
      </div>
    </main>
  );
}

