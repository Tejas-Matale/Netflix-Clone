import Header from "@/components/header";
import HeroCarousel from "@/components/hero-carousel";
import Row from "@/components/row";
import { fetchTmdb, TmdbListResult, TmdbMedia } from "@/lib/tmdb";

async function getData() {
  try {
    const trending = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/trending/tv/week?language=en-US")).results;
    const popular = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/tv/popular?language=en-US"))?.results ?? [];
    const topRated = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/tv/top_rated?language=en-US"))?.results ?? [];
    return { trending, popular, topRated };
  } catch (error) {
    console.error('TMDB TV API error during build:', error);
    return { 
      trending: [], 
      popular: [], 
      topRated: [] 
    };
  }
}

export default async function TvPage() {
  const { trending, popular, topRated } = await getData();
  
  return (
    <main className="min-h-dvh">
      <Header />
      {trending.length > 0 && <HeroCarousel items={trending.slice(0, 10)} forceType="tv" />}
      <div className="space-y-6 pb-10">
        {trending.length > 0 && <Row title="Trending TV Shows" items={trending.slice(0, 18)} forceType="tv" />}
        {popular.length > 0 && <Row title="Popular TV Shows" items={popular.slice(0, 18)} forceType="tv" />}
        {topRated.length > 0 && <Row title="Top Rated TV Shows" items={topRated.slice(0, 18)} forceType="tv" />}
        
        {trending.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">Content will be available once API keys are configured.</p>
          </div>
        )}
      </div>
    </main>
  );
}

