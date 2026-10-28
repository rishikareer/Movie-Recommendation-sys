package com.cinematch.server;

import com.cinematch.model.*;

import java.util.*;

/**
 * Lightweight, zero-dependency JSON serializer and parser in pure Java 17.
 */
public class JsonUtils {

    public static String escape(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        String t = "000" + Integer.toHexString(c);
                        sb.append("\\u").append(t.substring(t.length() - 4));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    public static String movieToJson(Movie m) {
        if (m == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":\"").append(escape(m.getId())).append("\",");
        sb.append("\"title\":\"").append(escape(m.getTitle())).append("\",");
        sb.append("\"releaseYear\":").append(m.getReleaseYear()).append(",");
        sb.append("\"director\":\"").append(escape(m.getDirector())).append("\",");
        sb.append("\"posterUrl\":\"").append(escape(m.getPosterUrl())).append("\",");
        sb.append("\"plot\":\"").append(escape(m.getPlot())).append("\",");
        sb.append("\"imdbRating\":").append(m.getImdbRating()).append(",");
        sb.append("\"voteCount\":").append(m.getVoteCount()).append(",");
        sb.append("\"averageRating\":").append(m.getAverageRating()).append(",");
        sb.append("\"ratingCount\":").append(m.getRatingCount()).append(",");
        sb.append("\"genres\":[");
        int i = 0;
        for (Genre g : m.getGenres()) {
            if (i++ > 0) sb.append(",");
            sb.append("\"").append(g.getDisplayName()).append("\"");
        }
        sb.append("]}");
        return sb.toString();
    }

    public static String ratingToJson(Rating r) {
        if (r == null) return "null";
        return "{" +
                "\"id\":\"" + escape(r.getId()) + "\"," +
                "\"userId\":\"" + escape(r.getUserId()) + "\"," +
                "\"movieId\":\"" + escape(r.getMovieId()) + "\"," +
                "\"score\":" + r.getScore() + "," +
                "\"reviewText\":\"" + escape(r.getReviewText()) + "\"," +
                "\"createdAt\":\"" + escape(r.getCreatedAt()) + "\"" +
                "}";
    }

    public static String watchlistItemToJson(WatchlistItem w) {
        if (w == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":\"").append(escape(w.getId())).append("\",");
        sb.append("\"userId\":\"").append(escape(w.getUserId())).append("\",");
        sb.append("\"movieId\":\"").append(escape(w.getMovieId())).append("\",");
        sb.append("\"status\":\"").append(escape(w.getStatus())).append("\",");
        sb.append("\"createdAt\":\"").append(escape(w.getCreatedAt())).append("\",");
        sb.append("\"movie\":").append(w.getMovie() != null ? movieToJson(w.getMovie()) : "null");
        sb.append("}");
        return sb.toString();
    }

    public static String recommendationToJson(MovieRecommendation rec) {
        if (rec == null) return "null";
        return "{" +
                "\"movie\":" + movieToJson(rec.getMovie()) + "," +
                "\"score\":" + rec.getScore() + "," +
                "\"matchPercentage\":" + rec.getMatchPercentage() + "," +
                "\"reason\":\"" + escape(rec.getReason()) + "\"" +
                "}";
    }

    public static String userProfileToJson(UserProfile u) {
        if (u == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":\"").append(escape(u.getId())).append("\",");
        sb.append("\"username\":\"").append(escape(u.getUsername())).append("\",");
        sb.append("\"avatarUrl\":").append(u.getAvatarUrl() != null ? "\"" + escape(u.getAvatarUrl()) + "\"" : "null").append(",");
        sb.append("\"preferredGenres\":[");
        int i = 0;
        for (Genre g : u.getPreferredGenres()) {
            if (i++ > 0) sb.append(",");
            sb.append("\"").append(g.getDisplayName()).append("\"");
        }
        sb.append("]}");
        return sb.toString();
    }

    public static <T> String listToJson(List<T> list, java.util.function.Function<T, String> mapper) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(mapper.apply(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Extracts a string field from a flat JSON payload using regex.
     */
    public static String getString(String json, String fieldName, String defaultValue) {
        if (json == null) return defaultValue;
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"" + fieldName + "\"\\s*:\\s*\"([^\"]*)\"");
        java.util.regex.Matcher m = p.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return defaultValue;
    }

    /**
     * Extracts an integer field from a flat JSON payload.
     */
    public static int getInt(String json, String fieldName, int defaultValue) {
        if (json == null) return defaultValue;
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"" + fieldName + "\"\\s*:\\s*(\\d+)");
        java.util.regex.Matcher m = p.matcher(json);
        if (m.find()) {
            try {
                return Integer.parseInt(m.group(1));
            } catch (NumberFormatException ignored) {}
        }
        return defaultValue;
    }

    /**
     * Extracts a list of strings from a JSON array field.
     */
    public static List<String> getStringList(String json, String fieldName) {
        List<String> result = new ArrayList<>();
        if (json == null) return result;
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"" + fieldName + "\"\\s*:\\s*\\[([^\\]]*)\\]");
        java.util.regex.Matcher m = p.matcher(json);
        if (m.find()) {
            String arrayContent = m.group(1);
            java.util.regex.Matcher itemMatcher = java.util.regex.Pattern.compile("\"([^\"]*)\"").matcher(arrayContent);
            while (itemMatcher.find()) {
                result.add(itemMatcher.group(1));
            }
        }
        return result;
    }
}

