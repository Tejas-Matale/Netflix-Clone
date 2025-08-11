import Header from "@/components/header";
import HeroCarousel from "@/components/hero-carousel";
import Row from "@/components/row";
import { fetchTmdb, TmdbListResult, TmdbMedia } from "@/lib/tmdb";

async function getData() {
  try {
    const trending = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/trending/all/day?language=en-US")).results;
    const nowPlaying = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/movie/now_playing?language=en-US"))?.results ?? [];
    const airingToday = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/tv/airing_today?language=en-US"))?.results ?? [];
    return { trending, nowPlaying, airingToday };
  } catch (error) {
    console.error('TMDB new releases API error during build:', error);
    return { 
      trending: [], 
      nowPlaying: [], 
      airingToday: [] 
    };
  }
}

export default async function NewPopularPage() {
  const { trending, nowPlaying, airingToday } = await getData();
  
  return (
    <main className="min-h-dvh">
      <Header />
      {trending.length > 0 && <HeroCarousel items={trending.slice(0, 10)} />}
      <div className="space-y-6 pb-10">
        {trending.length > 0 && <Row title="Trending Today" items={trending.slice(0, 18)} />}
        {nowPlaying.length > 0 && <Row title="Now Playing Movies" items={nowPlaying.slice(0, 18)} forceType="movie" />}
        {airingToday.length > 0 && <Row title="Airing Today" items={airingToday.slice(0, 18)} forceType="tv" />}
        
        {trending.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">Content will be available once API keys are configured.</p>
          </div>
        )}
      </div>
    </main>
  );
}

