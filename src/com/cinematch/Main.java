package com.cinematch;

import com.cinematch.config.AppConfig;
import com.cinematch.server.ApiServer;
import com.cinematch.service.ImdbService;
import com.cinematch.service.MovieService;
import com.cinematch.service.RecommendationService;
import com.cinematch.service.SupabaseService;

/**
 * CineMatch Core Java 17 Application Entry Point.
 * Bootstraps the backend services and launches the lightweight HTTP API server.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("Starting CineMatch Core Java 17 Engine...");

        try {
            int port = AppConfig.getServerPort();

            ImdbService imdbService = new ImdbService(AppConfig.getImdbApiKey());
            com.cinematch.service.TmdbService tmdbService = new com.cinematch.service.TmdbService();
            MovieService movieService = new MovieService(tmdbService, imdbService);
            RecommendationService recommendationService = new RecommendationService(movieService);
            SupabaseService supabaseService = new SupabaseService();

            ApiServer server = new ApiServer(port, movieService, recommendationService, imdbService, supabaseService);
            server.start();

            // Keep main thread alive
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("Shutting down CineMatch Server...");
                server.stop();
            }));

        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to launch CineMatch Server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

