package com.cinematch.model;

/**
 * Value object binding a recommended movie with an algorithm score and explanation.
 */
public class MovieRecommendation implements Comparable<MovieRecommendation> {
    private final Movie movie;
    private final double score;
    private final String reason;

    public MovieRecommendation(Movie movie, double score, String reason) {
        this.movie = movie;
        this.score = score;
        this.reason = reason;
    }

    public Movie getMovie() { return movie; }
    public double getScore() { return score; }
    public String getReason() { return reason; }

    public int getMatchPercentage() {
        return Math.min(99, Math.max(50, (int) Math.round(score * 100)));
    }

    @Override
    public int compareTo(MovieRecommendation o) {
        return Double.compare(o.score, this.score);
    }
}

