# CineMatch 2.0: Java 17 Core + Modern Web UI + Supabase

A sleek, modern movie recommendation, catalog, and watchlist platform built with a **high-performance Core Java 17+ backend** and a **clean, dark obsidian Web UI** powered by **TypeScript & Tailwind CSS**, with cloud accounts and data persistence backed by **Supabase**.

---

## 1. Architecture Highlights

```
CineMatch 2.0
├── Modern Web Frontend (TypeScript + React + Tailwind CSS)
│   ├── Cinematic Hero Banner & Dynamic Catalog
│   ├── Personalized "Curated For You" Feed
│   ├── Cloud Watchlist (Plan to Watch & Watched)
│   ├── Interactive 5-Star Rating & Review Dialog
│   └── Supabase Auth Modal (Email/Password & JWT Session)
│
├── Primary Core Backend (Java 17+ REST API on Port 8080)
│   ├── Hybrid Content-Based Recommendation Engine
│   ├── Live IMDb / OMDb Dynamic Gateway (Java 17 HttpClient)
│   ├── Supabase Cloud Gateway (PostgREST + Auth Sync)
│   └── In-Memory Catalog Cache & Fast Filters
│
└── Cloud Infrastructure (Supabase PostgreSQL)
    ├── User Profiles & Preferred Genres
    ├── Real-Time User Watchlists
    └── Community Ratings & Reviews
```

---

## 2. Quick Start Guide (1-Click)

### Option A: 1-Click Launch (Recommended)
Simply double-click:
- **`run.bat`**

This will automatically:
1. Compile the Java 17 backend sources into `bin/`.
2. Launch the Java REST API server on `http://localhost:8080`.
3. Launch the modern Web Frontend on `http://localhost:3000`.

### Option B: Individual Service Launch
- **Backend Only**: Run `run_backend.bat` (or `java -cp bin com.cinematch.Main`)
- **Frontend Only**: Run `run_frontend.bat` (or `npm run dev`)

---

## 3. Configuration & API Keys

Copy `.env.example` to `.env` in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# TMDB / IMDb API Key (Optional - free from https://www.themoviedb.org/settings/api)
VITE_TMDB_API_KEY=your-api-key-here
```

### Where to get your free keys:
1. **Supabase**:
   - Create a free project at [supabase.com](https://supabase.com).
   - In your dashboard, go to **Project Settings $\rightarrow$ API**.
   - Copy **Project URL** and **anon public key**.
   - Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
2. **TMDB / IMDb Gateway**:
   - Free API key from [The Movie Database](https://www.themoviedb.org/settings/api) or [OMDb](http://www.omdbapi.com/apikey.aspx).
3. **Smart Demo / Offline Mode**:
   - If keys are not configured yet, CineMatch will seamlessly run in **Local Demo Mode** with an initial catalog and mock user session.

---

## 4. Key Features

- **Transparent On-Demand Discovery**: Type any movie title or IMDb ID into the search bar. The Java 17 backend dynamically fetches metadata, verified IMDb ratings, and high-res posters from TMDB and OMDb in the background, with zero manual import required.
- **Personalized Watchlist**: Add movies to your personal watchlist with one click. Switch between *Plan to Watch* and *Watched* status tabs.
- **Hybrid Content-Based Recommendations**: Scored and ranked by our Java 17 algorithm:
  $$\text{Score} = 0.45 \times \text{GenreOverlap} + 0.35 \times \text{LearnedAffinity} + 0.20 \times \left(\frac{\text{Rating}}{5.0}\right)$$
- **Interactive 5-Star Rating & Review Modal**: Click on any movie card or detail view to submit your star rating and write reviews.
- **Customizable Genre Preferences**: Open the preferences modal anytime to tune your favorite movie genres.
