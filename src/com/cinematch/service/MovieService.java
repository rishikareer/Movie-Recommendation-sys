package com.cinematch.service;

import com.cinematch.model.Genre;
import com.cinematch.model.Movie;
import com.cinematch.model.Rating;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Production-ready Movie Service managing an active dynamic catalog.
 * Combines in-memory $O(1)$ fast lookups with transparent on-demand discovery
 * from TMDB and OMDb. Users can look up any movie without having to manually
 * import or fetch it first.
 */
public class MovieService {
    private final Map<String, Movie> movieCatalog = new ConcurrentHashMap<>();
    private final TmdbService tmdbService;
    private final ImdbService imdbService;

    public MovieService(TmdbService tmdbService, ImdbService imdbService) {
        this.tmdbService = (tmdbService != null) ? tmdbService : new TmdbService();
        this.imdbService = (imdbService != null) ? imdbService : new ImdbService();
        seedInitialCatalog();
        loadTrendingCatalogAsync();
    }

    public MovieService() {
        this(new TmdbService(), new ImdbService());
    }

    public List<Movie> getAllMovies() {
        return new ArrayList<>(movieCatalog.values());
    }

    /**
     * Resolves a movie by ID. If not found in cache, transparently queries
     * the external gateways, caches the result, and returns it.
     */
    public Optional<Movie> getMovieById(String id) {
        if (id == null || id.isEmpty()) return Optional.empty();

        Movie cached = movieCatalog.get(id);
        if (cached != null) {
            return Optional.of(cached);
        }

        // Auto-fetch if missing and valid IMDb ID
        if (id.toLowerCase().startsWith("tt") && id.length() >= 7) {
            try {
                ImdbService.ImdbMovieDTO dto = imdbService.fetchMovieById(id);
                Movie movie = imdbService.toMovieEntity(dto);
                saveMovie(movie);
                return Optional.of(movie);
            } catch (Exception ignored) {}
        }

        return Optional.empty();
    }

    /**
     * Dynamic Search:
     * 1. Looks up existing cached movies matching query.
     * 2. If fewer than 6 matches, automatically fetches from TMDB in the background,
     *    caches the new films in memory, and returns the merged list.
     */
    public List<Movie> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllMovies();
        }

        String clean = query.trim().toLowerCase();
        List<Movie> localMatches = movieCatalog.values().stream()
                .filter(m -> m.getTitle().toLowerCase().contains(clean) ||
                             m.getDirector().toLowerCase().contains(clean))
                .collect(Collectors.toList());

        // Dynamic auto-fetch: transparently expand catalog when user searches for something new
        if (localMatches.size() < 6 && clean.length() >= 2) {
            try {
                List<Movie> tmdbResults = tmdbService.searchMovies(clean);
                for (Movie m : tmdbResults) {
                    saveMovie(m);
                }
                // Re-filter to get merged set
                return movieCatalog.values().stream()
                        .filter(m -> m.getTitle().toLowerCase().contains(clean) ||
                                     m.getDirector().toLowerCase().contains(clean))
                        .collect(Collectors.toList());
            } catch (Exception ignored) {}
        }

        return localMatches;
    }

    public List<Movie> filter(String query, String genreStr, String era, String sort) {
        List<Movie> results = search(query);

        // Filter by Genre
        if (genreStr != null && !genreStr.equalsIgnoreCase("all") && !genreStr.trim().isEmpty()) {
            Genre targetGenre = Genre.fromString(genreStr);
            if (targetGenre != null) {
                results = results.stream()
                        .filter(m -> m.getGenres().contains(targetGenre))
                        .collect(Collectors.toList());
            }
        }

        // Filter by Era
        if (era != null && !era.equalsIgnoreCase("all") && !era.trim().isEmpty()) {
            if (era.contains("2020")) {
                results = results.stream().filter(m -> m.getReleaseYear() >= 2020).collect(Collectors.toList());
            } else if (era.contains("2010")) {
                results = results.stream().filter(m -> m.getReleaseYear() >= 2010 && m.getReleaseYear() <= 2019).collect(Collectors.toList());
            } else if (era.contains("2000")) {
                results = results.stream().filter(m -> m.getReleaseYear() >= 2000 && m.getReleaseYear() <= 2009).collect(Collectors.toList());
            } else if (era.contains("1990")) {
                results = results.stream().filter(m -> m.getReleaseYear() >= 1990 && m.getReleaseYear() <= 1999).collect(Collectors.toList());
            } else if (era.contains("classic") || era.contains("pre-1990")) {
                results = results.stream().filter(m -> m.getReleaseYear() < 1990).collect(Collectors.toList());
            }
        }

        // Sort results
        if (sort != null) {
            switch (sort.toLowerCase()) {
                case "highest_rated":
                    results.sort(Comparator.comparingDouble(Movie::getImdbRating).reversed());
                    break;
                case "most_voted":
                    results.sort(Comparator.comparingInt(Movie::getVoteCount).reversed());
                    break;
                case "oldest":
                    results.sort(Comparator.comparingInt(Movie::getReleaseYear));
                    break;
                case "title":
                    results.sort(Comparator.comparing(Movie::getTitle, String.CASE_INSENSITIVE_ORDER));
                    break;
                case "newest":
                default:
                    results.sort(Comparator.comparingInt(Movie::getReleaseYear).reversed()
                            .thenComparing(Comparator.comparingDouble(Movie::getImdbRating).reversed()));
                    break;
            }
        }

        return results;
    }

    public Movie saveMovie(Movie movie) {
        if (movie != null && !movie.getId().isEmpty()) {
            movieCatalog.put(movie.getId(), movie);
        }
        return movie;
    }

    public void updateMovieRatings(String movieId, List<Rating> ratings) {
        Movie m = movieCatalog.get(movieId);
        if (m != null && ratings != null) {
            m.recalculateRating(ratings);
        }
    }

    private void loadTrendingCatalogAsync() {
        Thread bg = new Thread(() -> {
            try {
                List<Movie> trending = tmdbService.getTrendingMovies();
                for (Movie m : trending) {
                    saveMovie(m);
                }
            } catch (Exception ignored) {}
        });
        bg.setDaemon(true);
        bg.setName("CineMatch-TrendingLoader");
        bg.start();
    }

    private void seedInitialCatalog() {
        saveMovie(new Movie(
                "tt15398776", "Oppenheimer", 2023, "Christopher Nolan",
                Set.of(Genre.DRAMA, Genre.HISTORY),
                "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
                8.9, 780000
        ));

        saveMovie(new Movie(
                "tt15239678", "Dune: Part Two", 2024, "Denis Villeneuve",
                Set.of(Genre.SCI_FI, Genre.ADVENTURE, Genre.ACTION),
                "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
                8.6, 520000
        ));

        saveMovie(new Movie(
                "tt0816692", "Interstellar", 2014, "Christopher Nolan",
                Set.of(Genre.SCI_FI, Genre.DRAMA, Genre.ADVENTURE),
                "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
                8.7, 2100000
        ));

        saveMovie(new Movie(
                "tt1856101", "Blade Runner 2049", 2017, "Denis Villeneuve",
                Set.of(Genre.SCI_FI, Genre.MYSTERY, Genre.THRILLER),
                "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
                "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
                8.0, 650000
        ));

        saveMovie(new Movie(
                "tt1375666", "Inception", 2010, "Christopher Nolan",
                Set.of(Genre.ACTION, Genre.SCI_FI, Genre.THRILLER),
                "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
                "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                8.8, 2500000
        ));

        saveMovie(new Movie(
                "tt9362722", "Spider-Man: Across the Spider-Verse", 2023, "Joaquim Dos Santos",
                Set.of(Genre.ANIMATION, Genre.ACTION, Genre.ADVENTURE, Genre.SCI_FI),
                "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
                "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
                8.6, 380000
        ));

        saveMovie(new Movie(
                "tt0468569", "The Dark Knight", 2008, "Christopher Nolan",
                Set.of(Genre.ACTION, Genre.CRIME, Genre.DRAMA),
                "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                "When the menace known as the Joker wreaks havoc and chaos on Gotham City, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                9.0, 2900000
        ));

        saveMovie(new Movie(
                "tt6710474", "Everything Everywhere All at Once", 2022, "Daniel Kwan",
                Set.of(Genre.ACTION, Genre.ADVENTURE, Genre.COMEDY, Genre.SCI_FI),
                "https://image.tmdb.org/t/p/w500/w3LxiVYPqrlexP0272xfv0qZKLv.jpg",
                "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes.",
                7.8, 540000
        ));

        saveMovie(new Movie(
                "tt6751668", "Parasite", 2019, "Bong Joon Ho",
                Set.of(Genre.DRAMA, Genre.THRILLER, Genre.COMEDY),
                "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
                "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
                8.5, 920000
        ));

        saveMovie(new Movie(
                "tt2582802", "Whiplash", 2014, "Damien Chazelle",
                Set.of(Genre.DRAMA, Genre.MUSIC),
                "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
                "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
                8.5, 980000
        ));
    }
}
