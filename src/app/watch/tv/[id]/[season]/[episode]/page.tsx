import Header from "@/components/header";
import Row from "@/components/row";
import { fetchTmdb, TmdbListResult, TmdbMedia } from "@/lib/tmdb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Script from "next/script";
import { TMDBTVShow, TMDBSeasonDetails } from "@/types/tmdb";

type Props = { params: Promise<{ id: string; season: string; episode: string }> };

async function getTvData(id: string, season: string) {
  const show = await fetchTmdb<TMDBTVShow>(`/tv/${id}?language=en-US`);
  const seasonData = await fetchTmdb<TMDBSeasonDetails>(`/tv/${id}/season/${season}?language=en-US`);
  const recommendations = (await fetchTmdb<TmdbListResult<TmdbMedia>>(`/tv/${id}/recommendations?language=en-US`))
    .results;
  return { show, seasonData, recommendations };
}

async function saveTvHistory(userId: string, id: string, season: string, episode: string, show: { name?: string; poster_path?: string | null }) {
  const db = prisma;
  const where = { userId, tmdbId: Number(id), mediaType: "tv" as const, season: Number(season), episode: Number(episode) };
  const existing = await db.history.findFirst({ where });
  const data = { title: show.name || "TV Show", posterPath: show.poster_path || undefined };
  if (existing) {
    await db.history.update({ where: { id: existing.id }, data });
  } else {
    await db.history.create({ data: { ...where, positionMs: 0, ...data } });
  }
}

export default async function WatchTvPage({ params }: Props) {
  const resolvedParams = await params;
  const { id, season, episode } = resolvedParams;
  const { show, seasonData, recommendations } = await getTvData(id, season);
  const title = `${show.name ?? "TV Show"} • S${season}E${episode} • Watch`;
  const src = `https://321movies.co.uk/embed/tv/${id}/${season}/${episode}`;

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    await saveTvHistory(session.user.id, id, season, episode, show);
  }

  return (
    <main className="min-h-dvh">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">{title}</h1>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            id="tv-player"
            src={src}
            title={`${title} player`}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            allowFullScreen
          />
        </div>

        {seasonData?.episodes?.length ? (
          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Episodes • Season {season}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {seasonData.episodes.map((ep: { id: number; episode_number: number; name: string; overview?: string }) => (
                <li key={ep.id} className="bg-neutral-800 rounded p-3">
                  <a
                    href={`/watch/tv/${id}/${season}/${ep.episode_number}`}
                    className="block hover:opacity-90"
                  >
                    <div className="font-medium">E{ep.episode_number}: {ep.name}</div>
                    {ep.overview && <p className="text-sm text-gray-300 mt-1 line-clamp-2">{ep.overview}</p>}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {recommendations.length > 0 && (
          <div className="mt-10">
            <Row title="You Might Also Like" items={recommendations.slice(0, 18)} forceType="tv" />
          </div>
        )}
      </div>
      <Script id="tv-progress-updater" strategy="afterInteractive">{`
        (function(){
          const start = Date.now();
          const tmdbId = ${JSON.stringify(id)};
          const season = ${JSON.stringify(season)};
          const episode = ${JSON.stringify(episode)};
          let lastSent = 0;
          function tick(){
            const now = Date.now();
            if (now - lastSent < 15000) return;
            lastSent = now;
            const positionMs = now - start;
            fetch('/api/history', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tmdbId: Number(tmdbId), mediaType: 'tv', season: Number(season), episode: Number(episode), positionMs })
            }).catch(()=>{});
          }
          setInterval(tick, 5000);
        })();
      `}</Script>
    </main>
  );
}

