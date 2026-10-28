package com.cinematch.service;

import com.cinematch.config.AppConfig;
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
 * Production-ready TMDB (The Movie Database) Gateway built in pure Java 17.
 * Provides high-speed multi-movie search, weekly trending catalogs,
 * high-resolution poster artwork, and automatic entity conversion.
 */
public class TmdbService {
    private static final String BASE_URL = "https://api.themoviedb.org/3";
    private final String apiKey;
    private final HttpClient httpClient;

    // TMDB Genre ID to CineMatch Genre Mapping
    private static final Map<Integer, Genre> TMDB_GENRE_MAP = Map.ofEntries(
            Map.entry(28, Genre.ACTION),
            Map.entry(12, Genre.ADVENTURE),
            Map.entry(16, Genre.ANIMATION),
            Map.entry(35, Genre.COMEDY),
            Map.entry(80, Genre.CRIME),
            Map.entry(99, Genre.DOCUMENTARY),
            Map.entry(18, Genre.DRAMA),
            Map.entry(10751, Genre.FAMILY),
            Map.entry(14, Genre.FANTASY),
            Map.entry(36, Genre.HISTORY),
            Map.entry(27, Genre.HORROR),
            Map.entry(10402, Genre.MUSIC),
            Map.entry(9648, Genre.MYSTERY),
            Map.entry(10749, Genre.ROMANCE),
            Map.entry(878, Genre.SCI_FI),
            Map.entry(53, Genre.THRILLER),
            Map.entry(10752, Genre.WAR),
            Map.entry(37, Genre.WESTERN)
    );

    public TmdbService(String apiKey) {
        this.apiKey = (apiKey != null && !apiKey.trim().isEmpty()) ? apiKey.trim() : AppConfig.get("TMDB_API_KEY", "dc05a7a16fbda5c670c70b8a988ba204");
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public TmdbService() {
        this(null);
    }

    /**
     * Dynamically searches TMDB for movies matching the query.
     */
    public List<Movie> searchMovies(String query) {
        if (query == null || query.trim().isEmpty()) return Collections.emptyList();
        try {
            String encoded = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
            String url = BASE_URL + "/search/movie?api_key=" + apiKey + "&query=" + encoded + "&include_adult=false";
            return executeAndParseList(url);
        } catch (Exception e) {
            System.err.println("Warning: TMDB search failed for query '" + query + "': " + e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Fetches current global trending movies dynamically.
     */
    public List<Movie> getTrendingMovies() {
        try {
            String url = BASE_URL + "/trending/movie/week?api_key=" + apiKey;
            return executeAndParseList(url);
        } catch (Exception e) {
            System.err.println("Warning: Failed to fetch TMDB trending movies: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<Movie> executeAndParseList(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(6))
                .header("User-Agent", "CineMatch-Java17-Client/2.0")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            return Collections.emptyList();
        }

        return parseTmdbResults(response.body());
    }

    private List<Movie> parseTmdbResults(String json) {
        List<Movie> list = new ArrayList<>();
        Pattern p = Pattern.compile("\\{[^{}]*\"id\"\\s*:\\s*(\\d+)[^{}]*\\}");
        Matcher m = p.matcher(json);

        while (m.find()) {
            String movieObj = m.group(0);
            try {
                String id = "tmdb_" + extractRegex(movieObj, "\"id\"\\s*:\\s*(\\d+)", "0");
                String title = extractRegex(movieObj, "\"title\"\\s*:\\s*\"([^\"]*)\"", "");
                if (title.isEmpty()) {
                    title = extractRegex(movieObj, "\"original_title\"\\s*:\\s*\"([^\"]*)\"", "Untitled");
                }

                String releaseDate = extractRegex(movieObj, "\"release_date\"\\s*:\\s*\"([^\"]*)\"", "");
                int year = 2024;
                if (releaseDate.length() >= 4) {
                    try { year = Integer.parseInt(releaseDate.substring(0, 4)); } catch (Exception ignored) {}
                }

                String posterPath = extractRegex(movieObj, "\"poster_path\"\\s*:\\s*\"([^\"]*)\"", "");
                String posterUrl = (!posterPath.isEmpty() && !posterPath.equals("null"))
                        ? "https://image.tmdb.org/t/p/w500" + posterPath
                        : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";

                String overview = extractRegex(movieObj, "\"overview\"\\s*:\\s*\"([^\"]*)\"", "No synopsis available.");
                overview = overview.replace("\\\"", "\"").replace("\\\\", "\\");

                double voteAvg = 7.5;
                try {
                    String v = extractRegex(movieObj, "\"vote_average\"\\s*:\\s*([0-9.]+)", "7.5");
                    voteAvg = Math.round(Double.parseDouble(v) * 10.0) / 10.0;
                } catch (Exception ignored) {}

                int voteCount = 1000;
                try {
                    String vc = extractRegex(movieObj, "\"vote_count\"\\s*:\\s*(\\d+)", "1000");
                    voteCount = Integer.parseInt(vc);
                } catch (Exception ignored) {}

                // Extract Genre IDs
                Set<Genre> genres = new HashSet<>();
                Matcher gm = Pattern.compile("(\\d+)").matcher(extractRegex(movieObj, "\"genre_ids\"\\s*:\\s*\\[([^\\]]*)\\]", ""));
                while (gm.find()) {
                    try {
                        int gid = Integer.parseInt(gm.group(1));
                        if (TMDB_GENRE_MAP.containsKey(gid)) {
                            genres.add(TMDB_GENRE_MAP.get(gid));
                        }
                    } catch (Exception ignored) {}
                }
                if (genres.isEmpty()) genres.add(Genre.DRAMA);

                list.add(new Movie(id, title, year, "Feature Film", genres, posterUrl, overview, voteAvg, voteCount));
            } catch (Exception ignored) {}
        }

        return list;
    }

    private String extractRegex(String source, String regex, String defaultValue) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(source);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return defaultValue;
    }
}

