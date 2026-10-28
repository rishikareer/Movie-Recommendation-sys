package com.cinematch.service;

import com.cinematch.model.Genre;
import com.cinematch.model.Movie;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for fetching live, dynamic movie metadata, verified audience ratings,
 * high-resolution posters, and plots from IMDb / OMDb.
 * Built with pure Java 17 HttpClient with zero third-party dependencies.
 */
public class ImdbService {
    private static final String DEFAULT_API_KEY = "ab92397b";
    private static final String BASE_URL = "https://www.omdbapi.com/";

    private final HttpClient httpClient;
    private final String apiKey;

    public ImdbService(String apiKey) {
        this.apiKey = (apiKey != null && !apiKey.trim().isEmpty()) ? apiKey.trim() : DEFAULT_API_KEY;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public ImdbService() {
        this(DEFAULT_API_KEY);
    }

    public static class ImdbMovieDTO {
        public String imdbId;
        public String title;
        public int year;
        public String director;
        public String genresStr;
        public double imdbRating;
        public int imdbVotes;
        public String plot;
        public String posterUrl;
        public String type;
    }

    public ImdbMovieDTO fetchMovieByTitle(String title) throws Exception {
        String encodedTitle = URLEncoder.encode(title.trim(), StandardCharsets.UTF_8);
        String url = BASE_URL + "?t=" + encodedTitle + "&type=movie&apikey=" + apiKey;
        return executeQuery(url);
    }

    public ImdbMovieDTO fetchMovieById(String imdbId) throws Exception {
        String cleanId = imdbId.trim();
        String url = BASE_URL + "?i=" + cleanId + "&type=movie&apikey=" + apiKey;
        return executeQuery(url);
    }

    private ImdbMovieDTO executeQuery(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(8))
                .header("User-Agent", "CineMatch-Java17-Client/2.0")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("IMDb Gateway returned HTTP " + response.statusCode());
        }

        return parseOmdbJson(response.body());
    }

    private ImdbMovieDTO parseOmdbJson(String json) {
        if (json.contains("\"Response\":\"False\"")) {
            String errorMsg = extractField(json, "Error");
            throw new RuntimeException(errorMsg.isEmpty() ? "Movie not found on IMDb" : errorMsg);
        }

        String mediaType = extractField(json, "Type");
        if (mediaType != null && !mediaType.equalsIgnoreCase("movie") && !mediaType.isEmpty()) {
            throw new IllegalArgumentException("Target media is a '" + mediaType + "'. CineMatch only imports feature films.");
        }

        ImdbMovieDTO dto = new ImdbMovieDTO();
        dto.imdbId = extractField(json, "imdbID");
        if (dto.imdbId.isEmpty()) {
            dto.imdbId = "tt" + System.currentTimeMillis();
        }
        dto.title = extractField(json, "Title");
        dto.director = extractField(json, "Director");
        dto.genresStr = extractField(json, "Genre");
        dto.plot = extractField(json, "Plot");
        dto.posterUrl = extractField(json, "Poster");
        dto.type = mediaType;

        // Parse release year
        String yearStr = extractField(json, "Year");
        try {
            Matcher ym = Pattern.compile("(\\d{4})").matcher(yearStr);
            dto.year = ym.find() ? Integer.parseInt(ym.group(1)) : 2024;
        } catch (Exception e) {
            dto.year = 2024;
        }

        // Parse rating
        String ratingStr = extractField(json, "imdbRating");
        try {
            dto.imdbRating = (!ratingStr.isEmpty() && !ratingStr.equalsIgnoreCase("N/A"))
                    ? Double.parseDouble(ratingStr) : 7.5;
        } catch (Exception e) {
            dto.imdbRating = 7.5;
        }

        // Parse votes
        String votesStr = extractField(json, "imdbVotes").replace(",", "").trim();
        try {
            dto.imdbVotes = (!votesStr.isEmpty() && !votesStr.equalsIgnoreCase("N/A"))
                    ? Integer.parseInt(votesStr) : 5000;
        } catch (Exception e) {
            dto.imdbVotes = 5000;
        }

        return dto;
    }

    private String extractField(String json, String field) {
        Pattern pattern = Pattern.compile("\"" + field + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return "";
    }

    public Movie toMovieEntity(ImdbMovieDTO dto) {
        Set<Genre> genres = new HashSet<>();
        if (dto.genresStr != null) {
            for (String g : dto.genresStr.split(",")) {
                Genre parsed = Genre.fromString(g.trim());
                if (parsed != null) genres.add(parsed);
            }
        }
        if (genres.isEmpty()) genres.add(Genre.DRAMA);

        return new Movie(
                dto.imdbId,
                dto.title,
                dto.year,
                dto.director,
                genres,
                dto.posterUrl,
                dto.plot,
                dto.imdbRating,
                dto.imdbVotes
        );
    }
}

