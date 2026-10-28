package com.cinematch.model;

import java.time.Instant;

/**
 * Watchlist item tracking user bookmarks and status ('plan_to_watch' vs 'watched').
 */
public class WatchlistItem {
    private String id;
    private String userId;
    private String movieId;
    private String status; // 'plan_to_watch' or 'watched'
    private String createdAt;
    private Movie movie; // attached movie object for easy client rendering

    public WatchlistItem(String id, String userId, String movieId, String status, String createdAt) {
        this.id = id != null ? id : java.util.UUID.randomUUID().toString();
        this.userId = userId;
        this.movieId = movieId;
        this.status = (status != null && status.equalsIgnoreCase("watched")) ? "watched" : "plan_to_watch";
        this.createdAt = (createdAt != null) ? createdAt : Instant.now().toString();
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getMovieId() { return movieId; }
    public String getStatus() { return status; }
    public String getCreatedAt() { return createdAt; }
    public Movie getMovie() { return movie; }

    public void setStatus(String status) {
        if ("watched".equalsIgnoreCase(status) || "plan_to_watch".equalsIgnoreCase(status)) {
            this.status = status.toLowerCase();
        }
    }

    public void setMovie(Movie movie) { this.movie = movie; }
}

