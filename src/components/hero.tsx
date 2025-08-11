import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  overview?: string | null;
  backdropPath?: string | null;
  id?: number;
  type?: "movie" | "tv";
};

export default function Hero({ title, overview, backdropPath, id, type }: Props) {
  return (
    <section className="relative h-[56vw] max-h-[80vh] min-h-[400px] mb-8 overflow-hidden">
      {/* Background Image */}
      {backdropPath && (
        <div className="absolute inset-0">
          <Image
            src={`https://image.tmdb.org/t/p/original${backdropPath}`}
            alt={title}
            fill
            priority
            className="object-cover scale-105 transition-transform duration-700 [image-rendering:-webkit-optimize-contrast]"
            sizes="100vw"
          />
        </div>
      )}
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 pointer-events-none [box-shadow:inset_0_0_200px_rgba(0,0,0,0.6)]" />
      
      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
        <div className="max-w-2xl animate-fade-in">
          {/* Netflix Original Badge (optional) */}
          <div className="mb-3">
            <span className="inline-block bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-white/20">
              Netflix Original
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 drop-shadow-2xl leading-tight">
            {title}
          </h1>
          
          {/* Overview */}
          {overview && (
            <p className="text-lg md:text-xl text-gray-100/90 mb-6 leading-relaxed drop-shadow-lg line-clamp-3 font-light">
              {overview}
            </p>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href={id && type ? (type === "movie" ? `/watch/movie/${id}` : `/watch/tv/${id}/1/1`) : "#"}
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-md font-bold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play
            </Link>
            
            <Link 
              href={id && type ? `/title/${type}/${id}` : "#"}
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              More Info
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}

