package com.cinematch.model;

import java.time.Instant;

/**
 * Encapsulates a user review with a 1 to 5 star rating, optional review text, and timestamp.
 */
public class Rating {
    private String id;
    private String userId;
    private String movieId;
    private int score; // 1 to 5
    private String reviewText;
    private String createdAt;

    public Rating(String id, String userId, String movieId, int score, String reviewText, String createdAt) {
        this.id = id != null ? id : java.util.UUID.randomUUID().toString();
        this.userId = userId;
        this.movieId = movieId;
        this.score = Math.max(1, Math.min(5, score));
        this.reviewText = (reviewText != null) ? reviewText.trim() : "";
        this.createdAt = (createdAt != null) ? createdAt : Instant.now().toString();
    }

    public Rating(String userId, String movieId, int score, String reviewText) {
        this(null, userId, movieId, score, reviewText, null);
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getMovieId() { return movieId; }
    public int getScore() { return score; }
    public String getReviewText() { return reviewText; }
    public String getCreatedAt() { return createdAt; }
}

