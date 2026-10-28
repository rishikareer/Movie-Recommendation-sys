import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw } from 'lucide-react';
import { Movie, MovieRecommendation } from '../../types';
import { MovieCard } from '../movie/MovieCard';
import { useAuth } from '../../context/AuthContext';
import { movieApi } from '../../services/api';

interface RecommendationsViewProps {
  onOpenDetail: (m: Movie) => void;
  onOpenRate: (m: Movie) => void;
  onOpenPreferences: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  onOpenDetail,
  onOpenRate,
  onOpenPreferences
}) => {
  const { user, profile } = useAuth();
  const activeUserId = user?.id || profile.id || 'guest_user';

  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await movieApi.getRecommendations(activeUserId);
      setRecommendations(recs);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeUserId, profile.preferredGenres]);

  return (
    <div className="space-y-6">
      
      {/* Sleek Minimal Header */}
      <div className="border-b border-neutral-900 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Curated For {profile.username}
          </h2>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
            <span>Affinities:</span>
            {profile.preferredGenres.map(g => (
              <span key={g} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium text-[11px]">
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPreferences}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-200 transition-colors"
          >
            <Sliders className="w-3 h-3" />
            <span>Tune Preferences</span>
          </button>

          <button
            onClick={fetchRecommendations}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-neutral-950 border border-neutral-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendations.map(rec => (
            <MovieCard
              key={rec.movie.id}
              movie={rec.movie}
              matchScore={rec.matchPercentage}
              matchReason={rec.reason}
              onOpenDetail={onOpenDetail}
              onOpenRate={onOpenRate}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-neutral-950 border border-neutral-900 rounded-2xl p-8">
          <p className="text-neutral-400 text-xs mb-3">No recommendations currently available.</p>
          <button
            onClick={onOpenPreferences}
            className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200"
          >
            Select Genres
          </button>
        </div>
      )}

    </div>
  );
};
