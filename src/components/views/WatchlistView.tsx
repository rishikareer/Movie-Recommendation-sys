import React, { useState } from 'react';
import { Bookmark, Check, Trash2, Film, Star } from 'lucide-react';
import { Movie } from '../../types';
import { useWatchlist } from '../../context/WatchlistContext';

interface WatchlistViewProps {
  onOpenDetail: (m: Movie) => void;
  onOpenRate: (m: Movie) => void;
  onExploreCatalog: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  onOpenDetail,
  onOpenRate,
  onExploreCatalog
}) => {
  const { watchlist, removeFromWatchlist, toggleStatus, loading } = useWatchlist();
  const [filter, setFilter] = useState<'all' | 'plan_to_watch' | 'watched'>('all');

  const filteredItems = watchlist.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Watchlist
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cloud-synced with Supabase.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-900">
          {(['all', 'plan_to_watch', 'watched'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Watchlist Items */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-neutral-950 border border-neutral-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map(item => {
            const m = item.movie;
            if (!m) return null;

            return (
              <div 
                key={item.id}
                className="group relative bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors flex flex-col"
              >
                {/* Poster */}
                <div 
                  className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900 cursor-pointer"
                  onClick={() => onOpenDetail(m)}
                >
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Status Overlay Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white border border-neutral-800 backdrop-blur-md">
                      {item.status === 'watched' ? 'Watched' : 'Plan to Watch'}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(m.id);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/70 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info & Status Toggle */}
                <div className="p-3 flex flex-col flex-1">
                  <h4 
                    onClick={() => onOpenDetail(m)}
                    className="font-semibold text-xs text-white line-clamp-1 cursor-pointer hover:text-neutral-300 transition-colors mb-1"
                  >
                    {m.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-3">
                    <span>{m.releaseYear}</span>
                    <span className="flex items-center gap-1 text-white font-medium">
                      <Star className="w-3 h-3 fill-white text-white" />
                      {m.imdbRating.toFixed(1)}
                    </span>
                  </div>

                  {/* Toggle Status Button */}
                  <button
                    onClick={() => toggleStatus(m.id)}
                    className="mt-auto w-full py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800"
                  >
                    {item.status === 'watched' ? (
                      <>
                        <Bookmark className="w-3 h-3" />
                        <span>Move to Plan</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Mark as Watched</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-neutral-950 border border-neutral-900 rounded-2xl p-8">
          <Bookmark className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Your Watchlist is Empty</h3>
          <p className="text-xs text-neutral-400 mb-4 max-w-sm mx-auto">
            Bookmark movies to save them to your personal watchlist.
          </p>
          <button
            onClick={onExploreCatalog}
            className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-colors inline-flex items-center gap-2"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Browse Catalog</span>
          </button>
        </div>
      )}

    </div>
  );
};
