import Header from "@/components/header";
import { fetchTmdb, TmdbMedia } from "@/lib/tmdb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Script from "next/script";

async function saveHistoryDirect(userId: string, id: string, details: TmdbMedia) {
  const db = prisma;
  const existing = await db.history.findFirst({ where: { userId, tmdbId: Number(id), mediaType: "movie" } });
      const data = { 
      title: details.title || details.name || "Movie", 
      posterPath: details.poster_path || undefined 
    };
  if (existing) {
    await db.history.update({ where: { id: existing.id }, data });
  } else {
    await db.history.create({ data: { userId, tmdbId: Number(id), mediaType: "movie", positionMs: 0, ...data } });
  }
}

type Props = { params: Promise<{ id: string }> };

export default async function WatchMoviePage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const details = await fetchTmdb<TmdbMedia>(`/movie/${id}?language=en-US`);
  const title = (details.title || details.name || "Movie") + " • Watch";
  const src = `https://321movies.co.uk/embed/movie/${id}`;

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    await saveHistoryDirect(session.user.id, id, details);
  }

  return (
    <main className="min-h-dvh">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">{title}</h1>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            id="movie-player"
            src={src}
            title={`${title} player`}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            allowFullScreen
          />
        </div>
      </div>
      {/* Lightweight progress updater – estimates using time since open (fallback) */}
      <Script id="movie-progress-updater" strategy="afterInteractive">{`
        (function(){
          const start = Date.now();
          const tmdbId = ${JSON.stringify(id)};
          let lastSent = 0;
          function tick(){
            const now = Date.now();
            if (now - lastSent < 15000) return; // every 15s
            lastSent = now;
            const positionMs = now - start;
            fetch('/api/history', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tmdbId: Number(tmdbId), mediaType: 'movie', positionMs })
            }).catch(()=>{});
          }
          setInterval(tick, 5000);
        })();
      `}</Script>
    </main>
  );
}

