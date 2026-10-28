package com.cinematch.service;

import com.cinematch.model.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Intelligent recommendation engine implementing hybrid content-based filtering.
 * Balances explicit user preferences, historical rating tendencies, and overall movie quality.
 */
public class RecommendationService {
    private final MovieService movieService;

    public RecommendationService(MovieService movieService) {
        this.movieService = Objects.requireNonNull(movieService, "MovieService cannot be null");
    }

    public List<MovieRecommendation> getRecommendations(UserProfile user, List<Rating> userRatings, int limit) {
        List<Movie> allMovies = movieService.getAllMovies();
        Set<String> ratedMovieIds = (userRatings != null)
                ? userRatings.stream().map(Rating::getMovieId).collect(Collectors.toSet())
                : Collections.emptySet();

        Map<Genre, Double> genreAffinities = computeUserGenreAffinities(userRatings);
        boolean hasPastRatings = !genreAffinities.isEmpty();
        boolean hasPreferredGenres = user != null && !user.getPreferredGenres().isEmpty();

        List<MovieRecommendation> recommendations = new ArrayList<>();

        for (Movie movie : allMovies) {
            // Deduplication: skip movies the user already reviewed
            if (ratedMovieIds.contains(movie.getId())) {
                continue;
            }

            // Factor A: Explicit Genre Preference (0.0 to 1.0)
            double explicitScore = computeExplicitGenreScore(user, movie);

            // Factor B: Learned Rating Affinity (0.0 to 1.0)
            double learnedScore = computeLearnedScore(movie, genreAffinities);

            // Factor C: Normalized Community Rating (0.0 to 1.0)
            double ratingScore = movie.getImdbRating() / 10.0;

            // Factor D: Recency Boost (modern releases)
            double recencyScore = computeRecencyScore(movie);

            double finalScore;
            if (hasPastRatings && hasPreferredGenres) {
                finalScore = (0.40 * explicitScore) +
                             (0.25 * learnedScore) +
                             (0.20 * ratingScore) +
                             (0.15 * recencyScore);
            } else if (hasPreferredGenres) {
                finalScore = (0.50 * explicitScore) +
                             (0.30 * ratingScore) +
                             (0.20 * recencyScore);
            } else if (hasPastRatings) {
                finalScore = (0.50 * learnedScore) +
                             (0.30 * ratingScore) +
                             (0.20 * recencyScore);
            } else {
                finalScore = (0.60 * ratingScore) + (0.40 * recencyScore);
            }

            String explanation = buildExplanation(user, movie, explicitScore, learnedScore);
            recommendations.add(new MovieRecommendation(movie, finalScore, explanation));
        }

        Collections.sort(recommendations);
        if (recommendations.size() > limit && limit > 0) {
            return new ArrayList<>(recommendations.subList(0, limit));
        }
        return recommendations;
    }

    private double computeExplicitGenreScore(UserProfile user, Movie movie) {
        if (user == null || user.getPreferredGenres().isEmpty() || movie.getGenres().isEmpty()) {
            return 0.0;
        }
        Set<Genre> preferred = user.getPreferredGenres();
        long overlapCount = movie.getGenres().stream().filter(preferred::contains).count();
        return (double) overlapCount / movie.getGenres().size();
    }

    private Map<Genre, Double> computeUserGenreAffinities(List<Rating> userRatings) {
        if (userRatings == null || userRatings.isEmpty()) return Collections.emptyMap();

        Map<Genre, Integer> totalScores = new EnumMap<>(Genre.class);
        Map<Genre, Integer> countScores = new EnumMap<>(Genre.class);

        for (Rating r : userRatings) {
            movieService.getMovieById(r.getMovieId()).ifPresent(m -> {
                for (Genre g : m.getGenres()) {
                    totalScores.put(g, totalScores.getOrDefault(g, 0) + r.getScore());
                    countScores.put(g, countScores.getOrDefault(g, 0) + 1);
                }
            });
        }

        Map<Genre, Double> affinities = new EnumMap<>(Genre.class);
        for (Map.Entry<Genre, Integer> entry : totalScores.entrySet()) {
            Genre g = entry.getKey();
            int sum = entry.getValue();
            int count = countScores.get(g);
            double avg = (double) sum / count;
            // Normalize score from [1.0, 5.0] to [0.0, 1.0]
            affinities.put(g, (avg - 1.0) / 4.0);
        }

        return affinities;
    }

    private double computeLearnedScore(Movie movie, Map<Genre, Double> genreAffinities) {
        if (genreAffinities.isEmpty() || movie.getGenres().isEmpty()) {
            return 0.5;
        }
        double totalAffinity = 0.0;
        int evaluated = 0;
        for (Genre g : movie.getGenres()) {
            if (genreAffinities.containsKey(g)) {
                totalAffinity += genreAffinities.get(g);
                evaluated++;
            }
        }
        return evaluated > 0 ? (totalAffinity / evaluated) : 0.5;
    }

    private double computeRecencyScore(Movie movie) {
        int year = movie.getReleaseYear();
        if (year >= 2022) return 1.0;
        if (year >= 2018) return 0.9;
        if (year >= 2010) return 0.8;
        if (year >= 2000) return 0.6;
        return 0.4;
    }

    private String buildExplanation(UserProfile user, Movie movie, double explicitScore, double learnedScore) {
        if (user != null && !user.getPreferredGenres().isEmpty()) {
            List<String> matched = movie.getGenres().stream()
                    .filter(user.getPreferredGenres()::contains)
                    .map(Genre::getDisplayName)
                    .collect(Collectors.toList());
            if (!matched.isEmpty()) {
                return "Matches your passion for " + String.join(" & ", matched);
            }
        }
        if (movie.getImdbRating() >= 8.5) {
            return "Critically acclaimed worldwide (" + movie.getImdbRating() + "/10 on IMDb)";
        }
        if (movie.getReleaseYear() >= 2023) {
            return "Top trending recent release";
        }
        return "Popular community recommendation";
    }
}

