import React, { useState, useEffect } from 'react';
import { ViewType, Movie } from './types';
import { Navbar } from './components/layout/Navbar';
import { HeroBanner } from './components/movie/HeroBanner';
import { MovieDetailModal } from './components/movie/MovieDetailModal';
import { CatalogView } from './components/views/CatalogView';
import { RecommendationsView } from './components/views/RecommendationsView';
import { WatchlistView } from './components/views/WatchlistView';
import { AuthModal } from './components/auth/AuthModal';
import { PreferencesModal } from './components/auth/PreferencesModal';
import { movieApi } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('catalog');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Featured hero movie
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  // Modals state
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);

  useEffect(() => {
    movieApi.getMovies().then(movies => {
      if (movies.length > 0) {
        const top = movies.find(m => m.id === 'tt15239678') || movies[0];
        setFeaturedMovie(top);
      }
    });
  }, []);

  const handleOpenDetail = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailOpen(true);
  };

  const handleOpenRate = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-neutral-100 selection:bg-white selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        
        {/* Cinematic Hero Banner on Catalog view when not searching */}
        {currentView === 'catalog' && !searchQuery.trim() && featuredMovie && (
          <HeroBanner
            movie={featuredMovie}
            onOpenDetail={handleOpenDetail}
            onOpenRate={handleOpenRate}
          />
        )}

        {/* View Router */}
        {currentView === 'catalog' && (
          <CatalogView
            searchQuery={searchQuery}
            onOpenDetail={handleOpenDetail}
            onOpenRate={handleOpenRate}
          />
        )}

        {currentView === 'recommendations' && (
          <RecommendationsView
            onOpenDetail={handleOpenDetail}
            onOpenRate={handleOpenRate}
            onOpenPreferences={() => setIsPreferencesOpen(true)}
          />
        )}

        {currentView === 'watchlist' && (
          <WatchlistView
            onOpenDetail={handleOpenDetail}
            onOpenRate={handleOpenRate}
            onExploreCatalog={() => setCurrentView('catalog')}
          />
        )}

      </main>

      {/* Modals */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  );
};
