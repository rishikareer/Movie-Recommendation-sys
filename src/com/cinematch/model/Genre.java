package com.cinematch.model;

/**
 * Standardized movie genres with clean display names and string parsing.
 */
public enum Genre {
    ACTION("Action"),
    ADVENTURE("Adventure"),
    ANIMATION("Animation"),
    COMEDY("Comedy"),
    CRIME("Crime"),
    DOCUMENTARY("Documentary"),
    DRAMA("Drama"),
    FAMILY("Family"),
    FANTASY("Fantasy"),
    HISTORY("History"),
    HORROR("Horror"),
    MUSIC("Music"),
    MYSTERY("Mystery"),
    ROMANCE("Romance"),
    SCI_FI("Sci-Fi"),
    THRILLER("Thriller"),
    WAR("War"),
    WESTERN("Western");

    private final String displayName;

    Genre(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Genre fromString(String text) {
        if (text == null || text.trim().isEmpty()) return null;
        String clean = text.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
        for (Genre g : values()) {
            String nameClean = g.name().toLowerCase().replaceAll("[^a-z0-9]", "");
            String displayClean = g.displayName.toLowerCase().replaceAll("[^a-z0-9]", "");
            if (nameClean.equals(clean) || displayClean.equals(clean)) {
                return g;
            }
        }
        if (clean.contains("scifi") || clean.contains("sciencefiction")) return SCI_FI;
        return null;
    }
}

