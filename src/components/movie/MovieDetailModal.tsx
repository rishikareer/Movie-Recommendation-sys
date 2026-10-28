import React, { useState, useEffect } from 'react';
import { X, Star, Bookmark, Check, User, Send } from 'lucide-react';
import { Movie, Rating } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';
import { useAuth } from '../../context/AuthContext';
import { movieApi } from '../../services/api';

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted?: () => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  isOpen,
  onClose,
  onRatingSubmitted
}) => {
  const { isInWatchlist, getItemStatus, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { user, profile } = useAuth();
  const activeUserId = user?.id || profile.id || 'guest_user';

  const [selectedScore, setSelectedScore] = useState<number>(5);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (movie) {
      movieApi.getRatings(movie.id).then(setRecentRatings);
      setSuccessMsg('');
      setReviewText('');
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  const bookmarked = isInWatchlist(movie.id);
  const watchlistStatus = getItemStatus(movie.id);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRating(true);
    try {
      const r = await movieApi.submitRating(activeUserId, movie.id, selectedScore, reviewText);
      setRecentRatings(prev => [r, ...prev.filter(item => item.userId !== activeUserId)]);
      setSuccessMsg('Rating saved.');
      if (onRatingSubmitted) onRatingSubmitted();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setSuccessMsg('Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Header Info Grid */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Poster */}
            <div className="w-32 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-medium text-neutral-300">
                    {movie.releaseYear}
                  </span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white text-black text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-black text-black" />
                    <span>IMDb {movie.imdbRating.toFixed(1)}/10</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    ({movie.voteCount.toLocaleString()} votes)
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                  {movie.title}
                </h2>

                <p className="text-xs text-neutral-400 mb-3 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-neutral-500" />
                  <span>Directed by <strong className="text-neutral-200">{movie.director}</strong></span>
                </p>

                {/* Genres */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {movie.genres.map(g => (
                    <span 
                      key={g} 
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-900 text-neutral-300 border border-neutral-800"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Watchlist Action */}
              <div className="flex items-center gap-2 pt-3 border-t border-neutral-900">
                <button
                  onClick={() => bookmarked ? removeFromWatchlist(movie.id) : addToWatchlist(movie, 'plan_to_watch')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    bookmarked
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'bg-white text-black hover:bg-neutral-200'
                  }`}
                >
                  {bookmarked ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{bookmarked ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>

                {bookmarked && (
                  <button
                    onClick={() => addToWatchlist(movie, watchlistStatus === 'watched' ? 'plan_to_watch' : 'watched')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
                  >
                    Status: <strong className="uppercase">{watchlistStatus === 'watched' ? 'Watched' : 'Plan to Watch'}</strong>
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Synopsis */}
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-900">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Synopsis</h4>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{movie.plot}</p>
          </div>

          {/* Minimal Rating Section */}
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-900">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-white" />
              <span>Rate this film</span>
            </h4>

            {successMsg && (
              <div className="mb-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitRating} className="space-y-3">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setSelectedScore(star)}
                    onMouseEnter={() => setHoverScore(star)}
                    onMouseLeave={() => setHoverScore(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        (hoverScore || selectedScore) >= star
                          ? 'fill-white text-white'
                          : 'text-neutral-700 hover:text-neutral-400'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-semibold text-neutral-300">
                  {hoverScore || selectedScore} / 5
                </span>
              </div>

              <textarea
                placeholder="Notes or quick review (optional)..."
                rows={2}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submittingRating ? 'Saving...' : 'Post Rating'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
