package com.cinematch.model;

import java.util.*;
import java.util.stream.Collectors;

/**
 * User profile entity mapped to Supabase auth user and preferences.
 */
public class UserProfile {
    private String id;
    private String username;
    private String avatarUrl;
    private Set<Genre> preferredGenres;

    public UserProfile(String id, String username, String avatarUrl, Set<Genre> preferredGenres) {
        this.id = id != null ? id : "guest_user";
        this.username = (username != null && !username.trim().isEmpty()) ? username.trim() : "Guest User";
        this.avatarUrl = avatarUrl;
        this.preferredGenres = (preferredGenres != null) ? new HashSet<>(preferredGenres) : new HashSet<>();
    }

    public UserProfile(String id, String username) {
        this(id, username, null, new HashSet<>(Arrays.asList(Genre.SCI_FI, Genre.ACTION, Genre.DRAMA)));
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getAvatarUrl() { return avatarUrl; }
    public Set<Genre> getPreferredGenres() { return Collections.unmodifiableSet(preferredGenres); }

    public void setUsername(String username) { this.username = username; }
    public void setPreferredGenres(Set<Genre> genres) {
        this.preferredGenres.clear();
        if (genres != null) this.preferredGenres.addAll(genres);
    }

    public void addPreferredGenre(Genre genre) {
        if (genre != null) preferredGenres.add(genre);
    }

    public String getFormattedPreferredGenres() {
        if (preferredGenres.isEmpty()) return "None selected";
        return preferredGenres.stream().map(Genre::getDisplayName).collect(Collectors.joining(", "));
    }
}

