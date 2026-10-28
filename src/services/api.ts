import { Movie, MovieRecommendation, Rating, WatchlistItem, UserProfile } from '../types';

const API_BASE = 'http://localhost:8080/api';

const DEFAULT_MOVIES: Movie[] = [
  {
    id: 'tt15398776',
    title: 'Oppenheimer',
    releaseYear: 2023,
    director: 'Christopher Nolan',
    genres: ['Drama', 'History'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    plot: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    imdbRating: 8.9,
    voteCount: 780000,
    averageRating: 4.5,
    ratingCount: 780000
  },
  {
    id: 'tt15239678',
    title: 'Dune: Part Two',
    releaseYear: 2024,
    director: 'Denis Villeneuve',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    plot: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    imdbRating: 8.6,
    voteCount: 520000,
    averageRating: 4.3,
    ratingCount: 520000
  },
  {
    id: 'tt0816692',
    title: 'Interstellar',
    releaseYear: 2014,
    director: 'Christopher Nolan',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    plot: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
    imdbRating: 8.7,
    voteCount: 2100000,
    averageRating: 4.4,
    ratingCount: 2100000
  },
  {
    id: 'tt1856101',
    title: 'Blade Runner 2049',
    releaseYear: 2017,
    director: 'Denis Villeneuve',
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    plot: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
    imdbRating: 8.0,
    voteCount: 650000,
    averageRating: 4.0,
    ratingCount: 650000
  },
  {
    id: 'tt1375666',
    title: 'Inception',
    releaseYear: 2010,
    director: 'Christopher Nolan',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    imdbRating: 8.8,
    voteCount: 2500000,
    averageRating: 4.4,
    ratingCount: 2500000
  },
  {
    id: 'tt9362722',
    title: 'Spider-Man: Across the Spider-Verse',
    releaseYear: 2023,
    director: 'Joaquim Dos Santos',
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    plot: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    imdbRating: 8.6,
    voteCount: 380000,
    averageRating: 4.3,
    ratingCount: 380000
  },
  {
    id: 'tt0468569',
    title: 'The Dark Knight',
    releaseYear: 2008,
    director: 'Christopher Nolan',
    genres: ['Action', 'Crime', 'Drama'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    plot: 'When the menace known as the Joker wreaks havoc and chaos on Gotham City, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    imdbRating: 9.0,
    voteCount: 2900000,
    averageRating: 4.5,
    ratingCount: 2900000
  },
  {
    id: 'tt6710474',
    title: 'Everything Everywhere All at Once',
    releaseYear: 2022,
    director: 'Daniel Kwan',
    genres: ['Action', 'Adventure', 'Comedy', 'Sci-Fi'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYPqrlexP0272xfv0qZKLv.jpg',
    plot: 'A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes.',
    imdbRating: 7.8,
    voteCount: 540000,
    averageRating: 3.9,
    ratingCount: 540000
  },
  {
    id: 'tt6751668',
    title: 'Parasite',
    releaseYear: 2019,
    director: 'Bong Joon Ho',
    genres: ['Drama', 'Thriller', 'Comedy'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    plot: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    imdbRating: 8.5,
    voteCount: 920000,
    averageRating: 4.3,
    ratingCount: 920000
  },
  {
    id: 'tt2582802',
    title: 'Whiplash',
    releaseYear: 2014,
    director: 'Damien Chazelle',
    genres: ['Drama', 'Music'],
    posterUrl: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    plot: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    imdbRating: 8.5,
    voteCount: 980000,
    averageRating: 4.3,
    ratingCount: 980000
  }
];

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'dc05a7a16fbda5c670c70b8a988ba204';

const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

function mapTmdbGenreIds(ids?: number[]): string[] {
  if (!ids || ids.length === 0) return ['Drama'];
  return ids.map(id => TMDB_GENRES[id]).filter(Boolean);
}

export const movieApi = {
  async fetchTmdbTrending(): Promise<Movie[]> {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).map((m: any) => ({
        id: 'tt_' + m.id,
        title: m.title || m.original_title,
        releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : 2024,
        director: 'Trending Acclaimed Release',
        genres: mapTmdbGenreIds(m.genre_ids),
        posterUrl: m.poster_path
          ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
          : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
        plot: m.overview || 'No synopsis available.',
        imdbRating: Math.round(m.vote_average * 10) / 10,
        voteCount: m.vote_count || 1000,
        averageRating: Math.round((m.vote_average / 2) * 10) / 10,
        ratingCount: m.vote_count || 1000
      }));
    } catch {
      return [];
    }
  },

  async getMovies(params?: { q?: string; genre?: string; era?: string; sort?: string }): Promise<Movie[]> {
    try {
      const query = new URLSearchParams();
      if (params?.q) query.set('q', params.q);
      if (params?.genre) query.set('genre', params.genre);
      if (params?.era) query.set('era', params.era);
      if (params?.sort) query.set('sort', params.sort);

      const res = await fetch(`${API_BASE}/movies?${query.toString()}`);
      if (!res.ok) throw new Error('Backend error');
      const backendMovies: Movie[] = await res.json();

      // If no query and viewing catalog, optionally blend top trending from TMDB
      if (!params?.q && (!params?.genre || params.genre === 'All') && params?.era === 'all') {
        const trending = await this.fetchTmdbTrending();
        const existingIds = new Set(backendMovies.map(m => m.title.toLowerCase()));
        const uniqueTrending = trending.filter(t => !existingIds.has(t.title.toLowerCase())).slice(0, 10);
        return [...backendMovies, ...uniqueTrending];
      }

      return backendMovies;
    } catch {
      // Client-side fallback filter with TMDB
      let list = [...DEFAULT_MOVIES];
      try {
        const trending = await this.fetchTmdbTrending();
        if (trending.length > 0) {
          const ids = new Set(list.map(m => m.title.toLowerCase()));
          list = [...list, ...trending.filter(t => !ids.has(t.title.toLowerCase()))];
        }
      } catch {}
      if (params?.q) {
        const q = params.q.toLowerCase();
        list = list.filter(m => m.title.toLowerCase().includes(q) || m.director.toLowerCase().includes(q));
      }
      if (params?.genre && params.genre !== 'all') {
        list = list.filter(m => m.genres.some(g => g.toLowerCase() === params.genre!.toLowerCase()));
      }
      if (params?.sort === 'highest_rated') {
        list.sort((a, b) => b.imdbRating - a.imdbRating);
      } else if (params?.sort === 'newest') {
        list.sort((a, b) => b.releaseYear - a.releaseYear);
      }
      return list;
    }
  },

  async getRecommendations(userId: string): Promise<MovieRecommendation[]> {
    try {
      const res = await fetch(`${API_BASE}/recommendations?userId=${encodeURIComponent(userId)}&limit=10`);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return await res.json();
    } catch {
      return DEFAULT_MOVIES.slice(0, 6).map((movie, idx) => ({
        movie,
        score: 0.95 - (idx * 0.05),
        matchPercentage: 98 - (idx * 5),
        reason: 'Personalized match based on your favorite genres and community acclaim'
      }));
    }
  },

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    try {
      const res = await fetch(`${API_BASE}/watchlist?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('Failed to fetch watchlist');
      return await res.json();
    } catch {
      const stored = localStorage.getItem(`cinematch_watchlist_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
  },

  async addToWatchlist(userId: string, movieId: string, status: 'plan_to_watch' | 'watched'): Promise<WatchlistItem> {
    try {
      const res = await fetch(`${API_BASE}/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, movieId, status })
      });
      if (!res.ok) throw new Error('Failed to update watchlist');
      return await res.json();
    } catch {
      const movie = DEFAULT_MOVIES.find(m => m.id === movieId);
      const item: WatchlistItem = {
        id: 'w_' + Date.now(),
        userId,
        movieId,
        status,
        createdAt: new Date().toISOString(),
        movie
      };
      const stored = localStorage.getItem(`cinematch_watchlist_${userId}`);
      const list: WatchlistItem[] = stored ? JSON.parse(stored) : [];
      const updated = [item, ...list.filter(w => w.movieId !== movieId)];
      localStorage.setItem(`cinematch_watchlist_${userId}`, JSON.stringify(updated));
      return item;
    }
  },

  async removeFromWatchlist(userId: string, movieId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/watchlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, movieId })
      });
      return res.ok;
    } catch {
      const stored = localStorage.getItem(`cinematch_watchlist_${userId}`);
      if (stored) {
        const list: WatchlistItem[] = JSON.parse(stored);
        const filtered = list.filter(w => w.movieId !== movieId);
        localStorage.setItem(`cinematch_watchlist_${userId}`, JSON.stringify(filtered));
      }
      return true;
    }
  },

  async submitRating(userId: string, movieId: string, score: number, reviewText?: string): Promise<Rating> {
    try {
      const res = await fetch(`${API_BASE}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, movieId, score, reviewText: reviewText || '' })
      });
      if (!res.ok) throw new Error('Failed to submit rating');
      return await res.json();
    } catch {
      const rating: Rating = {
        id: 'r_' + Date.now(),
        userId,
        movieId,
        score,
        reviewText,
        createdAt: new Date().toISOString()
      };
      const key = `cinematch_ratings_${userId}`;
      const stored = localStorage.getItem(key);
      const list: Rating[] = stored ? JSON.parse(stored) : [];
      const updated = [rating, ...list.filter(r => r.movieId !== movieId)];
      localStorage.setItem(key, JSON.stringify(updated));
      return rating;
    }
  },

  async getRatings(movieId: string): Promise<Rating[]> {
    try {
      const res = await fetch(`${API_BASE}/ratings?movieId=${encodeURIComponent(movieId)}`);
      if (!res.ok) throw new Error('Failed to fetch ratings');
      return await res.json();
    } catch {
      return [];
    }
  },

  async searchLiveImdb(query: string): Promise<Movie> {
    const res = await fetch(`${API_BASE}/imdb/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to search IMDb' }));
      throw new Error(err.error || 'Failed to search IMDb');
    }
    return await res.json();
  },

  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/profile?userId=${encodeURIComponent(profile.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return await res.json();
    } catch {
      localStorage.setItem('cinematch_user_profile', JSON.stringify(profile));
      return profile;
    }
  }
};

