import React, { createContext, useContext, useEffect, useState } from 'react';
import { WatchlistItem, Movie } from '../types';
import { movieApi } from '../services/api';
import { useAuth } from './AuthContext';

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  loading: boolean;
  addToWatchlist: (movie: Movie, status?: 'plan_to_watch' | 'watched') => Promise<void>;
  removeFromWatchlist: (movieId: string) => Promise<void>;
  toggleStatus: (movieId: string) => Promise<void>;
  isInWatchlist: (movieId: string) => boolean;
  getItemStatus: (movieId: string) => 'plan_to_watch' | 'watched' | null;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const activeUserId = user?.id || profile.id || 'guest_user';
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const items = await movieApi.getWatchlist(activeUserId);
      setWatchlist(items);
    } catch {
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [activeUserId]);

  const addToWatchlist = async (movie: Movie, status: 'plan_to_watch' | 'watched' = 'plan_to_watch') => {
    const item = await movieApi.addToWatchlist(activeUserId, movie.id, status);
    item.movie = movie;
    setWatchlist(prev => [item, ...prev.filter(w => w.movieId !== movie.id)]);
  };

  const removeFromWatchlist = async (movieId: string) => {
    await movieApi.removeFromWatchlist(activeUserId, movieId);
    setWatchlist(prev => prev.filter(w => w.movieId !== movieId));
  };

  const toggleStatus = async (movieId: string) => {
    const current = watchlist.find(w => w.movieId === movieId);
    if (!current) return;
    const nextStatus = current.status === 'plan_to_watch' ? 'watched' : 'plan_to_watch';
    const updated = await movieApi.addToWatchlist(activeUserId, movieId, nextStatus);
    updated.movie = current.movie;
    setWatchlist(prev => prev.map(w => w.movieId === movieId ? updated : w));
  };

  const isInWatchlist = (movieId: string) => {
    return watchlist.some(w => w.movieId === movieId);
  };

  const getItemStatus = (movieId: string) => {
    const item = watchlist.find(w => w.movieId === movieId);
    return item ? item.status : null;
  };

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      loading,
      addToWatchlist,
      removeFromWatchlist,
      toggleStatus,
      isInWatchlist,
      getItemStatus,
      refreshWatchlist: fetchWatchlist
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within a WatchlistProvider');
  return context;
};

