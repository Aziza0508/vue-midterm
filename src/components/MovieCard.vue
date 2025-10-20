
<script setup lang="ts">
import { computed } from 'vue'
import RatingStars from './RatingStars.vue'
import { imgPoster, yearOf } from '../utils/format'
import { useFavorites } from '../composables/useFavorites'
import type { Movie } from '../composables/useTmdb'

const props = defineProps<{ movie: Movie }>()

const { has, toggle } = useFavorites()
const poster = computed(() => imgPoster(props.movie.poster_path))
const year = computed(() => yearOf(props.movie.release_date))
</script>

<template>
  <div class="card" style="display:grid; grid-template-rows:auto 1fr">
    <RouterLink :to="`/movie/${movie.id}`">
      <img :src="poster" :alt="movie.title" style="width:100%; display:block; aspect-ratio:2/3; object-fit:cover">
    </RouterLink>
    <div style="padding: 10px; display:grid; gap:8px;">
      <RouterLink :to="`/movie/${movie.id}`" style="font-weight:600; line-height:1.2">
        {{ movie.title }}
      </RouterLink>
      <div style="display:flex; align-items:center; justify-content:space-between">
        <span class="badge">{{ year || '—' }}</span>
        <RatingStars :value="movie.vote_average" />
      </div>
      <button class="btn" @click="toggle(movie)">{{ has(movie.id) ? '★ Favorited' : '☆ Add Favorite' }}</button>
    </div>
  </div>
</template>
