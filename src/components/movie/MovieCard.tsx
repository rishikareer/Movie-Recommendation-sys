import React from 'react';
import { Star, Bookmark, Check } from 'lucide-react';
import { Movie } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';

interface MovieCardProps {
  movie: Movie;
  matchScore?: number;
  matchReason?: string;
  onOpenDetail: (m: Movie) => void;
  onOpenRate: (m: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  matchScore,
  matchReason,
  onOpenDetail,
  onOpenRate
}) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const bookmarked = isInWatchlist(movie.id);

  return (
    <div className="group relative bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden hover:border-neutral-700 transition-all duration-200 flex flex-col">
      
      {/* Poster Image Container */}
      <div 
        className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900 cursor-pointer"
        onClick={() => onOpenDetail(movie)}
      >
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60" />

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
          {/* IMDb Score Badge */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-neutral-800 text-white text-[11px] font-bold pointer-events-auto">
            <Star className="w-3 h-3 fill-white text-white" />
            <span>{movie.imdbRating.toFixed(1)}</span>
          </div>

          {/* Quick Watchlist Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              bookmarked ? removeFromWatchlist(movie.id) : addToWatchlist(movie);
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center backdrop-blur-md border transition-colors pointer-events-auto ${
              bookmarked
                ? 'bg-white text-black border-white'
                : 'bg-black/70 text-neutral-300 border-neutral-800 hover:bg-white hover:text-black hover:border-white'
            }`}
            title={bookmarked ? "Remove from watchlist" : "Add to watchlist"}
          >
            {bookmarked ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Match Percentage Badge */}
        {matchScore !== undefined && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold">
            <span>{matchScore}% MATCH</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
          <span>{movie.releaseYear}</span>
          <span className="truncate max-w-[110px]">{movie.director}</span>
        </div>

        <h3 
          onClick={() => onOpenDetail(movie)}
          className="font-semibold text-xs text-white group-hover:text-neutral-300 transition-colors line-clamp-1 cursor-pointer mb-2"
          title={movie.title}
        >
          {movie.title}
        </h3>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1 mb-2.5">
          {movie.genres.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800"
            >
              {g}
            </span>
          ))}
          {movie.genres.length > 2 && (
            <span className="text-[10px] text-neutral-600 self-center">
              +{movie.genres.length - 2}
            </span>
          )}
        </div>

        {/* Reason Pill */}
        {matchReason && (
          <p className="text-[10px] text-neutral-300 line-clamp-1 mb-2.5 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
            {matchReason}
          </p>
        )}

        {/* Bottom Actions */}
        <div className="mt-auto pt-2 border-t border-neutral-900 flex items-center justify-between text-xs">
          <button
            onClick={() => onOpenRate(movie)}
            className="text-neutral-500 hover:text-white transition-colors font-medium flex items-center gap-1"
          >
            <Star className="w-3 h-3" />
            <span>Rate</span>
          </button>

          <button
            onClick={() => onOpenDetail(movie)}
            className="text-neutral-400 hover:text-white font-medium"
          >
            Details &rarr;
          </button>
        </div>

      </div>

    </div>
  );
};
