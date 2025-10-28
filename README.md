#Link: https://youtu.be/ZrQBLI2aCZw
# Movie Recommendation Hub (Vue 3 + Vite + Pinia + TMDb)

A well-structured Vue 3 app that showcases TMDb data with discover/search, detailed pages, favorites, charts, CSV/PDF export, and trailer modals. Designed to hit midterm rubric + bonus tasks.

## Features
- Routes: Home (Trending/Discover), Movie Details, Favorites
- Reusable components: MovieCard, FilterBar, HeaderNav, TrailerModal, RatingStars, SkeletonCard
- State management: Pinia (movies & user)
- Composition functions: useTmdb (API), useFavorites (localStorage)
- Extras: loading/error states, route & card transitions, charts, CSV/PDF export
- Optional Supabase wiring (stubs) for reviews (extend if desired)

## Setup
```bash
npm install
cp .env.example .env.local
# Put your TMDb API key in VITE_TMDB_KEY
npm run dev
```

## Environment
```
VITE_TMDB_KEY=3a12d0afa9bebf8d80369ec842de8fab
```

## Credits
- TMDb API v3 docs (search, discover, details, genres, videos).
- Images via `image.tmdb.org` per TMDb image basics.
