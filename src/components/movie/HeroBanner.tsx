import React from 'react';
import { Bookmark, Check, Info, Star } from 'lucide-react';
import { Movie } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';

interface HeroBannerProps {
  movie: Movie;
  onOpenDetail: (movie: Movie) => void;
  onOpenRate: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onOpenDetail,
  onOpenRate
}) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const bookmarked = isInWatchlist(movie.id);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-900 bg-neutral-950 mb-10 min-h-[360px] sm:min-h-[420px] flex items-end">
      {/* Background Poster Overlay with Subtle Dark Vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 scale-100"
        style={{ backgroundImage: `url(${movie.posterUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-10 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-white text-black">
            Featured
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
            {movie.releaseYear}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Star className="w-3 h-3 text-white fill-white" />
            <span>IMDb {movie.imdbRating.toFixed(1)}</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
          {movie.title}
        </h1>

        <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 mb-6 max-w-xl leading-relaxed">
          {movie.plot}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => bookmarked ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              bookmarked
                ? 'bg-neutral-800 border border-neutral-700 text-white'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {bookmarked ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            {bookmarked ? 'In Watchlist' : 'Add to Watchlist'}
          </button>

          <button
            onClick={() => onOpenDetail(movie)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          <button
            onClick={() => onOpenRate(movie)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white border border-neutral-900 hover:border-neutral-800 transition-colors"
          >
            <Star className="w-3.5 h-3.5" />
            <span>Rate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
