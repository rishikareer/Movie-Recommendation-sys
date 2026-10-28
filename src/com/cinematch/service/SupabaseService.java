package com.cinematch.service;

import com.cinematch.config.AppConfig;
import com.cinematch.model.Rating;
import com.cinematch.model.UserProfile;
import com.cinematch.model.WatchlistItem;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service orchestrating cloud persistence with Supabase PostgreSQL via REST.
 * Provides fallback in-memory state for local/demo runs.
 */
public class SupabaseService {
    private final String supabaseUrl;
    private final String anonKey;
    private final HttpClient httpClient;
    private final boolean isConfigured;

    // Local fallback caches
    private final Map<String, UserProfile> localProfiles = new ConcurrentHashMap<>();
    private final List<Rating> localRatings = Collections.synchronizedList(new ArrayList<>());
    private final List<WatchlistItem> localWatchlist = Collections.synchronizedList(new ArrayList<>());

    public SupabaseService() {
        this.supabaseUrl = AppConfig.getSupabaseUrl();
        this.anonKey = AppConfig.getSupabaseAnonKey();
        this.isConfigured = !supabaseUrl.isEmpty() && !anonKey.isEmpty();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();

        // Seed default profile
        localProfiles.put("guest_user", new UserProfile("guest_user", "CineMatch Explorer"));
    }

    public boolean isConfigured() {
        return isConfigured;
    }

    // --- Profiles ---
    public UserProfile getProfile(String userId) {
        if (userId == null || userId.isEmpty()) userId = "guest_user";
        return localProfiles.computeIfAbsent(userId, id -> new UserProfile(id, "Cinephile User"));
    }

    public void saveProfile(UserProfile profile) {
        if (profile == null) return;
        localProfiles.put(profile.getId(), profile);
    }

    // --- Ratings ---
    public List<Rating> getUserRatings(String userId) {
        if (userId == null) return Collections.emptyList();
        return localRatings.stream()
                .filter(r -> userId.equals(r.getUserId()))
                .collect(Collectors.toList());
    }

    public List<Rating> getMovieRatings(String movieId) {
        if (movieId == null) return Collections.emptyList();
        return localRatings.stream()
                .filter(r -> movieId.equals(r.getMovieId()))
                .collect(Collectors.toList());
    }

    public Rating submitRating(Rating rating) {
        if (rating == null) return null;
        // Upsert locally
        localRatings.removeIf(r -> r.getUserId().equals(rating.getUserId()) && r.getMovieId().equals(rating.getMovieId()));
        localRatings.add(rating);

        if (isConfigured) {
            try {
                String endpoint = supabaseUrl + "/rest/v1/ratings";
                String body = String.format("{\"user_id\":\"%s\",\"movie_id\":\"%s\",\"score\":%d,\"review_text\":\"%s\"}",
                        rating.getUserId(), rating.getMovieId(), rating.getScore(), rating.getReviewText());

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .header("apikey", anonKey)
                        .header("Authorization", "Bearer " + anonKey)
                        .header("Content-Type", "application/json")
                        .header("Prefer", "resolution=merge-duplicates")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build();

                httpClient.sendAsync(req, HttpResponse.BodyHandlers.discarding());
            } catch (Exception ignored) {}
        }

        return rating;
    }

    // --- Watchlist ---
    public List<WatchlistItem> getUserWatchlist(String userId) {
        if (userId == null) return Collections.emptyList();
        return localWatchlist.stream()
                .filter(w -> userId.equals(w.getUserId()))
                .collect(Collectors.toList());
    }

    public WatchlistItem addToWatchlist(String userId, String movieId, String status) {
        if (userId == null || movieId == null) return null;

        // Remove existing if present to update
        localWatchlist.removeIf(w -> w.getUserId().equals(userId) && w.getMovieId().equals(movieId));

        WatchlistItem item = new WatchlistItem(null, userId, movieId, status, null);
        localWatchlist.add(0, item); // latest first

        if (isConfigured) {
            try {
                String endpoint = supabaseUrl + "/rest/v1/watchlist";
                String body = String.format("{\"user_id\":\"%s\",\"movie_id\":\"%s\",\"status\":\"%s\"}",
                        userId, movieId, item.getStatus());

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .header("apikey", anonKey)
                        .header("Authorization", "Bearer " + anonKey)
                        .header("Content-Type", "application/json")
                        .header("Prefer", "resolution=merge-duplicates")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build();

                httpClient.sendAsync(req, HttpResponse.BodyHandlers.discarding());
            } catch (Exception ignored) {}
        }

        return item;
    }

    public boolean removeFromWatchlist(String userId, String movieId) {
        if (userId == null || movieId == null) return false;
        boolean removed = localWatchlist.removeIf(w -> w.getUserId().equals(userId) && w.getMovieId().equals(movieId));

        if (isConfigured) {
            try {
                String endpoint = supabaseUrl + "/rest/v1/watchlist?user_id=eq." + userId + "&movie_id=eq." + movieId;
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .header("apikey", anonKey)
                        .header("Authorization", "Bearer " + anonKey)
                        .DELETE()
                        .build();

                httpClient.sendAsync(req, HttpResponse.BodyHandlers.discarding());
            } catch (Exception ignored) {}
        }

        return removed;
    }
}

