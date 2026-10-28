import React, { useState, useEffect } from 'react';
import { Movie } from '../../types';
import { MovieCard } from '../movie/MovieCard';
import { movieApi } from '../../services/api';

interface CatalogViewProps {
  searchQuery: string;
  onOpenDetail: (m: Movie) => void;
  onOpenRate: (m: Movie) => void;
}

const GENRES = [
  'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  searchQuery,
  onOpenDetail,
  onOpenRate
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('highest_rated');

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const data = await movieApi.getMovies({
        q: searchQuery,
        genre: selectedGenre,
        era: selectedEra,
        sort: selectedSort
      });
      setMovies(data);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenre, selectedEra, selectedSort]);

  return (
    <div className="space-y-6">
      
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-neutral-950 border border-neutral-900 p-3.5 rounded-xl">
        
        {/* Genre Pill Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedGenre === g
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <select
            value={selectedEra}
            onChange={(e) => setSelectedEra(e.target.value)}
            className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-neutral-500 cursor-pointer"
          >
            <option value="all">All Eras</option>
            <option value="2020">2020 – Present</option>
            <option value="2010">2010 – 2019</option>
            <option value="2000">2000 – 2009</option>
            <option value="1990">1990 – 1999</option>
            <option value="classic">Classics (&lt; 1990)</option>
          </select>

          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-neutral-500 cursor-pointer"
          >
            <option value="highest_rated">Highest Rated</option>
            <option value="newest">Newest First</option>
            <option value="most_voted">Most Voted</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-neutral-950 border border-neutral-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onOpenDetail={onOpenDetail}
              onOpenRate={onOpenRate}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-neutral-950 border border-neutral-900 rounded-2xl p-8">
          <p className="text-neutral-400 text-xs mb-3">No movies found matching current criteria.</p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSelectedEra('all');
              setSelectedSort('highest_rated');
            }}
            className="text-xs text-white hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
