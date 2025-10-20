
<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useGenres, useDiscover } from '../composables/useTmdb'
import MovieCard from '../components/MovieCard.vue'
import SkeletonCard from '../components/SkeletonCard.vue'
import FilterBar from '../components/FilterBar.vue'

const { genres } = useGenres()
const discover = useDiscover()

const filters = reactive({
  query: '',
  genreId: undefined as number | undefined,
  year: undefined as number | undefined,
  sortBy: 'popularity.desc'
})

function apply() {
  discover.query.value = filters.query
  discover.genreId.value = filters.genreId
  discover.year.value = filters.year
  discover.sortBy.value = filters.sortBy
  discover.fetchPage(1)
}

onMounted(() => discover.fetchPage(1))
</script>

<template>
  <h1 style="margin: 8px 0 16px 0">Discover</h1>
  <FilterBar :genres="genres" v-model="filters" @apply="apply" />

  <div v-if="discover.error" class="empty">
    {{ discover.error }}
  </div>

  <div v-if="discover.isLoading" class="grid">
    <SkeletonCard v-for="i in 12" :key="i" />
  </div>

  <div v-else class="grid">
    <MovieCard v-for="m in discover.items" :key="m.id" :movie="m" />
  </div>

  <div style="display:flex; gap:8px; justify-content:center; margin: 16px 0">
    <button class="btn" :disabled="discover.page <= 1" @click="discover.prev()">Prev</button>
    <span class="badge">Page {{ discover.page }} / {{ discover.totalPages }}</span>
    <button class="btn" :disabled="discover.page >= discover.totalPages" @click="discover.next()">Next</button>
  </div>
</template>
