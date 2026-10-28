package com.cinematch.server;

import com.cinematch.config.AppConfig;
import com.cinematch.model.*;
import com.cinematch.service.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * Lightweight pure Java 17 HTTP API Server for CineMatch.
 * Zero external framework dependencies.
 */
public class ApiServer {
    private final int port;
    private final MovieService movieService;
    private final RecommendationService recommendationService;
    private final ImdbService imdbService;
    private final SupabaseService supabaseService;
    private HttpServer server;

    public ApiServer(int port, MovieService movieService, RecommendationService recommendationService,
                     ImdbService imdbService, SupabaseService supabaseService) {
        this.port = port;
        this.movieService = movieService;
        this.recommendationService = recommendationService;
        this.imdbService = imdbService;
        this.supabaseService = supabaseService;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newFixedThreadPool(16));

        // 1. Health check
        server.createContext("/api/health", new CorsHandler(exchange -> {
            String json = String.format("{\"status\":\"ok\",\"service\":\"CineMatch-Java-Core\",\"port\":%d,\"supabaseConfigured\":%b}",
                    port, supabaseService.isConfigured());
            CorsHandler.sendJson(exchange, 200, json);
        }));

        // 2. Movies Catalog & Search
        server.createContext("/api/movies", new CorsHandler(exchange -> {
            String method = exchange.getRequestMethod();
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getRawQuery());

            if ("GET".equalsIgnoreCase(method)) {
                String path = exchange.getRequestURI().getPath();
                String[] segments = path.split("/");
                // Specific movie by ID: /api/movies/{id}
                if (segments.length > 3 && !segments[3].isEmpty()) {
                    String movieId = segments[3];
                    Optional<Movie> movie = movieService.getMovieById(movieId);
                    if (movie.isPresent()) {
                        CorsHandler.sendJson(exchange, 200, JsonUtils.movieToJson(movie.get()));
                    } else {
                        CorsHandler.sendJson(exchange, 404, "{\"error\":\"Movie not found\"}");
                    }
                    return;
                }

                String query = params.getOrDefault("q", "");
                String genre = params.getOrDefault("genre", "all");
                String era = params.getOrDefault("era", "all");
                String sort = params.getOrDefault("sort", "newest");

                List<Movie> movies = movieService.filter(query, genre, era, sort);
                String json = JsonUtils.listToJson(movies, JsonUtils::movieToJson);
                CorsHandler.sendJson(exchange, 200, json);
            } else {
                CorsHandler.sendJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }));

        // 3. Personalized Recommendations
        server.createContext("/api/recommendations", new CorsHandler(exchange -> {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                Map<String, String> params = parseQueryParams(exchange.getRequestURI().getRawQuery());
                String userId = params.getOrDefault("userId", "guest_user");
                int limit = 12;
                try {
                    limit = Integer.parseInt(params.getOrDefault("limit", "12"));
                } catch (NumberFormatException ignored) {}

                UserProfile profile = supabaseService.getProfile(userId);
                List<Rating> ratings = supabaseService.getUserRatings(userId);

                List<MovieRecommendation> recs = recommendationService.getRecommendations(profile, ratings, limit);
                String json = JsonUtils.listToJson(recs, JsonUtils::recommendationToJson);
                CorsHandler.sendJson(exchange, 200, json);
            } else {
                CorsHandler.sendJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }));

        // 4. Watchlist
        server.createContext("/api/watchlist", new CorsHandler(exchange -> {
            String method = exchange.getRequestMethod();
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getRawQuery());

            if ("GET".equalsIgnoreCase(method)) {
                String userId = params.getOrDefault("userId", "guest_user");
                List<WatchlistItem> list = supabaseService.getUserWatchlist(userId);

                // Attach movie references
                for (WatchlistItem item : list) {
                    movieService.getMovieById(item.getMovieId()).ifPresent(item::setMovie);
                }

                String json = JsonUtils.listToJson(list, JsonUtils::watchlistItemToJson);
                CorsHandler.sendJson(exchange, 200, json);
            } else if ("POST".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                String userId = JsonUtils.getString(body, "userId", "guest_user");
                String movieId = JsonUtils.getString(body, "movieId", "");
                String status = JsonUtils.getString(body, "status", "plan_to_watch");

                if (movieId.isEmpty()) {
                    CorsHandler.sendJson(exchange, 400, "{\"error\":\"movieId is required\"}");
                    return;
                }

                WatchlistItem item = supabaseService.addToWatchlist(userId, movieId, status);
                movieService.getMovieById(movieId).ifPresent(item::setMovie);
                CorsHandler.sendJson(exchange, 201, JsonUtils.watchlistItemToJson(item));
            } else if ("DELETE".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                String userId = params.getOrDefault("userId", JsonUtils.getString(body, "userId", "guest_user"));
                String movieId = params.getOrDefault("movieId", JsonUtils.getString(body, "movieId", ""));

                boolean ok = supabaseService.removeFromWatchlist(userId, movieId);
                CorsHandler.sendJson(exchange, 200, String.format("{\"success\":%b}", ok));
            } else {
                CorsHandler.sendJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }));

        // 5. Ratings
        server.createContext("/api/ratings", new CorsHandler(exchange -> {
            String method = exchange.getRequestMethod();
            if ("GET".equalsIgnoreCase(method)) {
                Map<String, String> params = parseQueryParams(exchange.getRequestURI().getRawQuery());
                String movieId = params.get("movieId");
                String userId = params.get("userId");

                List<Rating> ratings;
                if (movieId != null) {
                    ratings = supabaseService.getMovieRatings(movieId);
                } else if (userId != null) {
                    ratings = supabaseService.getUserRatings(userId);
                } else {
                    ratings = Collections.emptyList();
                }

                CorsHandler.sendJson(exchange, 200, JsonUtils.listToJson(ratings, JsonUtils::ratingToJson));
            } else if ("POST".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                String userId = JsonUtils.getString(body, "userId", "guest_user");
                String movieId = JsonUtils.getString(body, "movieId", "");
                int score = JsonUtils.getInt(body, "score", 5);
                String reviewText = JsonUtils.getString(body, "reviewText", "");

                if (movieId.isEmpty()) {
                    CorsHandler.sendJson(exchange, 400, "{\"error\":\"movieId is required\"}");
                    return;
                }

                Rating rating = new Rating(userId, movieId, score, reviewText);
                supabaseService.submitRating(rating);

                // Update movie aggregate in catalog
                List<Rating> allForMovie = supabaseService.getMovieRatings(movieId);
                movieService.updateMovieRatings(movieId, allForMovie);

                CorsHandler.sendJson(exchange, 201, JsonUtils.ratingToJson(rating));
            } else {
                CorsHandler.sendJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }));

        // 6. IMDb Dynamic Search & Import
        server.createContext("/api/imdb/search", new CorsHandler(exchange -> {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                Map<String, String> params = parseQueryParams(exchange.getRequestURI().getRawQuery());
                String query = params.getOrDefault("q", "");

                if (query.trim().isEmpty()) {
                    CorsHandler.sendJson(exchange, 400, "{\"error\":\"Search query 'q' is required\"}");
                    return;
                }

                try {
                    ImdbService.ImdbMovieDTO dto;
                    if (query.toLowerCase().startsWith("tt") && query.length() >= 7) {
                        dto = imdbService.fetchMovieById(query);
                    } else {
                        dto = imdbService.fetchMovieByTitle(query);
                    }
                    Movie movie = imdbService.toMovieEntity(dto);
                    movieService.saveMovie(movie); // Cache dynamically in memory catalog!

                    CorsHandler.sendJson(exchange, 200, JsonUtils.movieToJson(movie));
                } catch (Exception e) {
                    CorsHandler.sendJson(exchange, 404, "{\"error\":\"" + JsonUtils.escape(e.getMessage()) + "\"}");
                }
            } else {
                CorsHandler.sendJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }));

        // 7. User Profile & Preferences
        server.createContext("/api/profile", new CorsHandler(exchange -> {
            String method = exchange.getRequestMethod();
            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getRawQuery());
            String userId = params.getOrDefault("userId", "guest_user");

            if ("GET".equalsIgnoreCase(method)) {
                UserProfile profile = supabaseService.getProfile(userId);
                CorsHandler.sendJson(exchange, 200, JsonUtils.userProfileToJson(profile));
            } else if ("POST".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                String username = JsonUtils.getString(body, "username", "Cinephile User");
                List<String> genresStr = JsonUtils.getStringList(body, "preferredGenres");

                UserProfile profile = supabaseService.getProfile(userId);
                profile.setUsername(username);
                Set<Genre> updatedGenres = new HashSet<>();
                for (String gs : genresStr) {
                    Genre g = Genre.fromString(gs);
                    if (g != null) updatedGenres.add(g);
                }
                profile.setPreferredGenres(updatedGenres);
                supabaseService.saveProfile(profile);

                CorsHandler.sendJson(exchange, 200, JsonUtils.userProfileToJson(profile));
            } else {
                CorsHandler.sendJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }));

        server.start();
        System.out.println("=================================================================");
        System.out.println("  CINEMATCH JAVA 17 REST API SERVER RUNNING");
        System.out.println("  URL: http://localhost:" + port);
        System.out.println("  Supabase Integration: " + (supabaseService.isConfigured() ? "CONNECTED" : "LOCAL DEMO MODE"));
        System.out.println("=================================================================");
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    private static Map<String, String> parseQueryParams(String rawQuery) {
        Map<String, String> map = new HashMap<>();
        if (rawQuery == null || rawQuery.isEmpty()) return map;
        String[] pairs = rawQuery.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            try {
                if (idx > 0) {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    map.put(key, value);
                } else if (idx < 0) {
                    map.put(URLDecoder.decode(pair, StandardCharsets.UTF_8), "");
                }
            } catch (Exception ignored) {}
        }
        return map;
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }
}

