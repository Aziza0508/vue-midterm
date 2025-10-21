<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMovieDetails } from '../composables/useTmdb'
import { imgBackdrop, imgPoster, yearOf } from '../utils/format'
import TrailerModal from '../components/TrailerModal.vue'
import RatingStars from '../components/RatingStars.vue'
import { useFavorites } from '../composables/useFavorites'

const route = useRoute()
const id = Number(route.params.id)
const { data, isLoading, error, trailerKey } = useMovieDetails(id)
const showTrailer = ref(false)

const poster = computed(() => imgPoster(data.value?.poster_path, 'w500'))
const backdrop = computed(() => imgBackdrop(data.value?.backdrop_path, 'w1280'))
const year = computed(() => yearOf(data.value?.release_date))

const { has, toggle } = useFavorites()
</script>

<template>
  <div v-if="error" class="empty">{{ error }}</div>

  <div v-else-if="isLoading" class="grid">
    <div class="skeleton" style="height:320px; grid-column:1/-1"></div>
    <div class="skeleton" style="height:24px; width:60%"></div>
    <div class="skeleton" style="height:16px; width:40%"></div>
    <div class="skeleton" style="height:200px"></div>
  </div>

  <div v-else-if="data">
    <div v-if="backdrop" style="border-radius:16px; overflow:hidden; margin-bottom:12px">
      <img :src="backdrop" alt="" style="width:100%; display:block; object-fit:cover;">
    </div>

    <div style="display:grid; grid-template-columns: 220px 1fr; gap: 18px;">
      <img v-if="poster" :src="poster" :alt="data.title" style="width:100%; border-radius:16px; border:1px solid rgba(255,255,255,0.06)">

      <div style="display:grid; gap: 10px;">
        <h1 style="margin:0">{{ data.title }} 
          <span style="color:var(--muted); font-size:0.8em;">{{ year }}</span>
        </h1>

        <RatingStars :value="data.vote_average" />

        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <span v-for="g in data.genres || []" :key="g.id" class="badge">{{ g.name }}</span>
        </div>

        <p style="color:var(--muted)">{{ data.overview }}</p>

        <div style="display:flex; gap:8px; flex-wrap:wrap">
          <button class="btn primary" v-if="trailerKey" @click="showTrailer = true">Watch Trailer</button>
          <button class="btn" @click="toggle(data)">{{ has(data.id) ? '★ Favorited' : '☆ Add Favorite' }}</button>
        </div>

        <div>
          <h3>Top Cast</h3>
          <div style="display:flex; gap:10px; flex-wrap:wrap">
            <div v-for="c in (data.credits?.cast || []).slice(0,10)" :key="c.id" class="badge">
              {{ c.name }} — <span style="opacity:.8">{{ c.character }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <TrailerModal v-if="showTrailer" :ytKey="trailerKey" @close="showTrailer=false" />
</template>
