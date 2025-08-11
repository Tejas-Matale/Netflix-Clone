import Header from "@/components/header";
import HeroCarousel from "@/components/hero-carousel";
import Row from "@/components/row";
import { fetchTmdb, TmdbListResult, TmdbMedia } from "@/lib/tmdb";

async function getAnimeData() {
  try {
    // Search for anime content using TMDB
    const animeSearch = await fetchTmdb<TmdbListResult<TmdbMedia>>("/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc&language=en-US");
    const topAnime = await fetchTmdb<TmdbListResult<TmdbMedia>>("/discover/tv?with_genres=16&with_origin_country=JP&sort_by=vote_average.desc&vote_count.gte=100&language=en-US");
    const recentAnime = await fetchTmdb<TmdbListResult<TmdbMedia>>("/discover/tv?with_genres=16&with_origin_country=JP&sort_by=first_air_date.desc&language=en-US");
    
    return {
      popular: animeSearch.results || [],
      topRated: topAnime.results || [],
      recent: recentAnime.results || [],
    };
  } catch (error) {
    console.error('TMDB anime API error during build:', error);
    return {
      popular: [],
      topRated: [],
      recent: [],
    };
  }
}

export default async function AnimePage() {
  const { popular, topRated, recent } = await getAnimeData();
  
  return (
    <main className="min-h-dvh">
      <Header />
      {popular.length > 0 && <HeroCarousel items={popular.slice(0, 10)} forceType="tv" />}
      <div className="space-y-6 pb-10">
        {popular.length > 0 && <Row title="Popular Anime" items={popular.slice(0, 18)} forceType="tv" />}
        {topRated.length > 0 && <Row title="Top Rated Anime" items={topRated.slice(0, 18)} forceType="tv" />}
        {recent.length > 0 && <Row title="Recent Anime" items={recent.slice(0, 18)} forceType="tv" />}
        
        {popular.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">Content will be available once API keys are configured.</p>
          </div>
        )}
      </div>
    </main>
  );
} 