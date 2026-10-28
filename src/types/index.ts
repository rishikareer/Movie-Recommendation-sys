export interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  director: string;
  genres: string[];
  posterUrl: string;
  plot: string;
  imdbRating: number;
  voteCount: number;
  averageRating: number;
  ratingCount: number;
}

export interface Rating {
  id: string;
  userId: string;
  movieId: string;
  score: number;
  reviewText?: string;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: string;
  status: 'plan_to_watch' | 'watched';
  createdAt: string;
  movie?: Movie;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  preferredGenres: string[];
}

export interface MovieRecommendation {
  movie: Movie;
  score: number;
  matchPercentage: number;
  reason: string;
}

export type ViewType = 'catalog' | 'recommendations' | 'watchlist';

