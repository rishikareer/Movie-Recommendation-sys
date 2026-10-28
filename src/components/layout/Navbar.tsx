import React, { useState } from 'react';
import { Bookmark, User as UserIcon, Sliders, LogIn, LogOut, Search } from 'lucide-react';
import { ViewType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useWatchlist } from '../../context/WatchlistContext';

interface NavbarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuth: () => void;
  onOpenPreferences: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onOpenAuth,
  onOpenPreferences
}) => {
  const { user, profile, isConfigured, signOut } = useAuth();
  const { watchlist } = useWatchlist();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-neutral-900 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Text-Only Logo (No icon, no '17 Core' badge) */}
        <div 
          onClick={() => onViewChange('catalog')}
          className="cursor-pointer select-none py-1"
        >
          <span className="text-base font-extrabold tracking-[0.25em] text-white uppercase hover:text-neutral-300 transition-colors">
            CINEMATCH
          </span>
        </div>

        {/* Minimal Search Input */}
        <div className="hidden md:flex flex-1 max-w-sm relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search films or directors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
          />
        </div>

        {/* Sleek Monochrome Navigation Pills */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-900">
          <button
            onClick={() => onViewChange('catalog')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentView === 'catalog'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Catalog
          </button>

          <button
            onClick={() => onViewChange('recommendations')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentView === 'recommendations'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            For You
          </button>

          <button
            onClick={() => onViewChange('watchlist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentView === 'watchlist'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>Watchlist</span>
            {watchlist.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                currentView === 'watchlist' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'
              }`}>
                {watchlist.length}
              </span>
            )}
          </button>
        </div>

        {/* Monochrome Account Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
              {profile.username.slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-neutral-300">
              {profile.username}
            </span>
          </button>

          {showProfileMenu && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-150"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="px-3 py-2 border-b border-neutral-800 mb-1">
                <p className="text-[11px] text-neutral-500">Signed in as</p>
                <p className="text-xs font-semibold text-white truncate">{profile.username}</p>
              </div>

              <button
                onClick={onOpenPreferences}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                Favorite Genres
              </button>

              {user ? (
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors mt-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white hover:bg-neutral-800 transition-colors mt-0.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In with Supabase
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
