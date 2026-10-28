package com.cinematch.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Clean environment and configuration loader.
 * Prioritizes:
 * 1. Root .env file
 * 2. System environment variables
 * 3. cinematch.properties
 * 4. Fallback defaults
 */
public class AppConfig {
    private static final Map<String, String> configMap = new HashMap<>();

    static {
        loadEnvFile(new File(".env.example"));
        loadEnvFile(new File("env.template"));
        loadEnvFile(new File(".env.local"));
        loadEnvFile(new File(".env"));
    }

    private static void loadEnvFile(File file) {
        if (!file.exists()) return;
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                int eq = line.indexOf('=');
                if (eq > 0) {
                    String key = line.substring(0, eq).trim();
                    String val = line.substring(eq + 1).trim();
                    // Strip quotes if present
                    if ((val.startsWith("\"") && val.endsWith("\"")) ||
                        (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.substring(1, val.length() - 1);
                    }
                    configMap.put(key, val);
                }
            }
        } catch (IOException ignored) {}
    }

    public static String get(String key, String defaultValue) {
        // 1. Check loaded .env map
        if (configMap.containsKey(key) && !configMap.get(key).isEmpty()) {
            return configMap.get(key);
        }
        // 2. Check System env
        String sysEnv = System.getenv(key);
        if (sysEnv != null && !sysEnv.isEmpty()) {
            return sysEnv;
        }
        // 3. Check VITE_ prefixed version
        String viteKey = "VITE_" + key;
        if (configMap.containsKey(viteKey) && !configMap.get(viteKey).isEmpty()) {
            return configMap.get(viteKey);
        }
        String sysVite = System.getenv(viteKey);
        if (sysVite != null && !sysVite.isEmpty()) {
            return sysVite;
        }

        return defaultValue;
    }

    public static int getInt(String key, int defaultValue) {
        try {
            return Integer.parseInt(get(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public static String getSupabaseUrl() {
        return get("SUPABASE_URL", "");
    }

    public static String getSupabaseAnonKey() {
        return get("SUPABASE_ANON_KEY", "");
    }

    public static String getImdbApiKey() {
        return get("IMDB_API_KEY", get("VITE_IMDB_API_KEY", get("TMDB_API_KEY", "ab92397b")));
    }

    public static int getServerPort() {
        return getInt("PORT", 8080);
    }
}

