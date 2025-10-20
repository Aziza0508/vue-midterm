<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useFavorites } from '../composables/useFavorites'
import type { Movie } from '../composables/useTmdb'

const props = defineProps<{ movie: Movie }>()

const { toggle, has } = useFavorites()

const posterUrl = computed(() =>
  props.movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${props.movie.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Image'
)

const isFavorite = computed(() => has(props.movie.id))

function toggleFavorite(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  toggle(props.movie)
}
</script>

<template>
  <div class="movie-card">
    <RouterLink :to="`/movie/${props.movie.id}`" class="card-link">
      <div class="poster-wrapper">
        <img :src="posterUrl" :alt="props.movie.title" class="poster" />
        <div class="overlay">
          <div class="rating" v-if="props.movie.vote_average">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {{ props.movie.vote_average.toFixed(1) }}
          </div>
        </div>
      </div>
      
      <div class="info">
        <h3 class="title">{{ props.movie.title || props.movie.name }}</h3>
        <p class="date" v-if="props.movie.release_date">
          {{ new Date(props.movie.release_date).getFullYear() }}
        </p>
      </div>
    </RouterLink>

    <button 
      class="favorite-btn" 
      :class="{ active: isFavorite }"
      @click="toggleFavorite"
      :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
    >
      <svg width="20" height="20" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.movie-card {
  position: relative;
  background: var(--card);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.movie-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.poster-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .poster {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.movie-card:hover .overlay {
  opacity: 1;
}

.rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  color: #ffd700;
  font-size: 13px;
  font-weight: 600;
}

.info {
  padding: 12px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--text);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.6em;
}

.date {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 15, 25, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  cursor: pointer;
  color: var(--text);
  transition: all 0.2s ease;
  z-index: 2;
}

.favorite-btn:hover {
  background: rgba(11, 15, 25, 0.9);
  transform: scale(1.1);
  border-color: rgba(255,255,255,0.2);
}

.favorite-btn.active {
  background: rgba(239, 83, 80, 0.2);
  border-color: rgba(239, 83, 80, 0.3);
  color: #ef5350;
}

.favorite-btn.active:hover {
  background: rgba(239, 83, 80, 0.3);
}

.favorite-btn svg {
  transition: transform 0.2s ease;
}

.favorite-btn:active svg {
  transform: scale(0.9);
}
</style>