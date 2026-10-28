package com.cinematch.model;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced Movie domain model supporting posters, plots, and dual ratings
 * (Global IMDb score + local community average).
 */
public class Movie {
    private String id;
    private String title;
    private int releaseYear;
    private String director;
    private Set<Genre> genres;
    private String posterUrl;
    private String plot;
    private double imdbRating; // e.g. 8.9 / 10
    private int voteCount;
    private double averageRating; // 1.0 to 5.0 scale
    private int ratingCount;

    public Movie(String id, String title, int releaseYear, String director, Set<Genre> genres,
                 String posterUrl, String plot, double imdbRating, int voteCount) {
        this.id = Objects.requireNonNull(id, "ID cannot be null");
        this.title = (title != null) ? title.trim() : "Untitled";
        this.releaseYear = releaseYear;
        this.director = (director != null && !director.isEmpty()) ? director : "Unknown";
        this.genres = (genres != null) ? new HashSet<>(genres) : new HashSet<>();
        this.posterUrl = (posterUrl != null && !posterUrl.isEmpty() && !posterUrl.equals("N/A"))
                ? posterUrl : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
        this.plot = (plot != null && !plot.isEmpty() && !plot.equals("N/A")) ? plot : "No synopsis available.";
        this.imdbRating = Math.max(0.0, Math.min(10.0, imdbRating));
        this.voteCount = Math.max(0, voteCount);
        // Default local average from IMDb score (scaled to 1-5)
        this.averageRating = Math.round((this.imdbRating / 2.0) * 10.0) / 10.0;
        this.ratingCount = this.voteCount > 0 ? this.voteCount : 1;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public int getReleaseYear() { return releaseYear; }
    public String getDirector() { return director; }
    public Set<Genre> getGenres() { return Collections.unmodifiableSet(genres); }
    public String getPosterUrl() { return posterUrl; }
    public String getPlot() { return plot; }
    public double getImdbRating() { return imdbRating; }
    public int getVoteCount() { return voteCount; }
    public double getAverageRating() { return averageRating; }
    public int getRatingCount() { return ratingCount; }

    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public void setPlot(String plot) { this.plot = plot; }

    public void recalculateRating(List<Rating> userRatings) {
        if (userRatings == null || userRatings.isEmpty()) return;
        double sum = userRatings.stream().mapToInt(Rating::getScore).sum();
        this.averageRating = Math.round((sum / userRatings.size()) * 10.0) / 10.0;
        this.ratingCount = userRatings.size();
    }

    public String getFormattedGenres() {
        if (genres.isEmpty()) return "General";
        return genres.stream().map(Genre::getDisplayName).collect(Collectors.joining(", "));
    }
}

