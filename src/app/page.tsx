import Header from "@/components/header";
import HeroCarousel from "@/components/hero-carousel";
import Row from "@/components/row";
import { fetchTmdb, TmdbListResult, TmdbMedia } from "@/lib/tmdb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getTrending() {
  try {
    const data = await fetchTmdb<TmdbListResult<TmdbMedia>>("/trending/all/week?language=en-US");
    return data.results.slice(0, 12);
  } catch (error) {
    console.error('TMDB trending API error:', error);
    return [];
  }
}

async function getMore() {
  try {
    const topRatedMovies = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/movie/top_rated?language=en-US"));
    const topRatedTv = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/tv/top_rated?language=en-US"));
    const popularMovies = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/movie/popular?language=en-US"));
    const popularTv = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/tv/popular?language=en-US"));
    return {
      topRatedMovies: topRatedMovies.results,
      topRatedTv: topRatedTv.results,
      popularMovies: popularMovies.results,
      popularTv: popularTv.results,
    };
  } catch (error) {
    console.error('TMDB more data API error:', error);
    return {
      topRatedMovies: [],
      topRatedTv: [],
      popularMovies: [],
      popularTv: [],
    };
  }
}

async function getContinueWatching(): Promise<(TmdbMedia & { href?: string; positionMs?: number; durationMs?: number })[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];
    const db = prisma;
    const items = await db.history.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    interface HistoryItem {
      tmdbId: number;
      mediaType: string;
      title: string;
      posterPath: string | null;
      positionMs: number;
      durationMs: number | null;
      season: number | null;
      episode: number | null;
    }
    
    const unique = new Map<string, HistoryItem>();
    for (const it of items) {
      const key = `${it.mediaType}:${it.tmdbId}`;
      if (!unique.has(key)) unique.set(key, it);
    }
    return Array.from(unique.values()).map((it) => {
      const base = {
        id: it.tmdbId,
        title: it.title,
        name: it.title,
        poster_path: it.posterPath,
        media_type: it.mediaType,
        positionMs: it.positionMs ?? undefined,
        durationMs: it.durationMs ?? undefined,
        href: ""
      };
      if (it.mediaType === "tv" && it.season && it.episode) {
        base.href = `/watch/tv/${it.tmdbId}/${it.season}/${it.episode}`;
      } else if (it.mediaType === "movie") {
        base.href = `/watch/movie/${it.tmdbId}`;
      }
      return base;
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const trending = await getTrending();
  const { topRatedMovies, topRatedTv, popularMovies, popularTv } = await getMore();

  return (
    <main className="min-h-dvh">
      <Header />
      {trending.length > 0 && <HeroCarousel items={trending} />}
      <div className="space-y-6 pb-10">
        {trending.length > 0 && <Row title="Trending Now" items={trending} />}
        {topRatedMovies.length > 0 && <Row title="Top Rated Movies" items={topRatedMovies.slice(0, 18)} forceType="movie" />}
        {topRatedTv.length > 0 && <Row title="Top Rated TV Shows" items={topRatedTv.slice(0, 18)} forceType="tv" />}
        {popularMovies.length > 0 && <Row title="Popular Movies" items={popularMovies.slice(0, 18)} forceType="movie" />}
        {popularTv.length > 0 && <Row title="Popular TV Shows" items={popularTv.slice(0, 18)} forceType="tv" />}
        
        {trending.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">Content will be available once API keys are configured.</p>
          </div>
        )}
      </div>
    </main>
  );
}
