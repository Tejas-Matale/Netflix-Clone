import Header from "@/components/header";
import HeroCarousel from "@/components/hero-carousel";
import Row from "@/components/row";
import { fetchTmdb, TmdbListResult, TmdbMedia } from "@/lib/tmdb";

async function getData() {
  try {
    const trending = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/trending/movie/week?language=en-US")).results;
    const popular = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/movie/popular?language=en-US"))?.results ?? [];
    const topRated = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/movie/top_rated?language=en-US"))?.results ?? [];
    const upcoming = (await fetchTmdb<TmdbListResult<TmdbMedia>>("/movie/upcoming?language=en-US"))?.results ?? [];
    return { trending, popular, topRated, upcoming };
  } catch (error) {
    console.error('TMDB API error during build:', error);
    // Return empty arrays for build-time failures
    return { 
      trending: [], 
      popular: [], 
      topRated: [], 
      upcoming: [] 
    };
  }
}

export default async function MoviesPage() {
  const { trending, popular, topRated, upcoming } = await getData();
  
  return (
    <main className="min-h-dvh">
      <Header />
      {trending.length > 0 && <HeroCarousel items={trending.slice(0, 10)} forceType="movie" />}
      <div className="space-y-6 pb-10">
        {trending.length > 0 && <Row title="Trending Movies" items={trending.slice(0, 18)} forceType="movie" />}
        {popular.length > 0 && <Row title="Popular Movies" items={popular.slice(0, 18)} forceType="movie" />}
        {topRated.length > 0 && <Row title="Top Rated Movies" items={topRated.slice(0, 18)} forceType="movie" />}
        {upcoming.length > 0 && <Row title="Upcoming Movies" items={upcoming.slice(0, 18)} forceType="movie" />}
        
        {trending.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">Content will be available once API keys are configured.</p>
          </div>
        )}
      </div>
    </main>
  );
}

