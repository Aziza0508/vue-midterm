<script setup lang="ts">
import { onMounted } from 'vue'
import { useDiscover } from '../composables/useTmdb'
import MovieCard from '../components/MovieCard.vue'
import FilterBar from '../components/FilterBar.vue'

const {
  movies,
  genres,
  page,
  totalPages,
  loading,
  error,
  filters,
  fetchPage,
  next,
  prev,
} = useDiscover()

function apply() {
  // При любом изменении набора фильтров начинаем сначала
  fetchPage(1)
}

onMounted(() => {
  // Первая загрузка
  fetchPage(1)
})
</script>

<template>
  <div class="home">
    <h1 class="title">Discover</h1>

    <FilterBar :genres="genres" v-model="filters" @apply="apply" />

    <div v-if="error" class="empty">{{ error }}</div>

    <div v-if="loading" class="grid">
      <div class="skeleton" v-for="i in 12" :key="i"></div>
    </div>

    <div v-else class="grid">
      <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
    </div>

    <div class="pagination" v-if="!loading && movies.length">
      <button class="btn" :disabled="page <= 1" @click="prev">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Prev
      </button>
      <span class="badge">Page {{ page }} / {{ totalPages }}</span>
      <button class="btn" :disabled="page >= totalPages" @click="next">
        Next
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 16px;
}

.title {
  margin: 8px 0 16px 0;
  font-size: 24px;
  font-weight: 600;
}

.empty {
  text-align: center;
  color: var(--danger);
  padding: 48px 24px;
  border: 1px dashed rgba(239, 83, 80, 0.3);
  border-radius: 16px;
  background: rgba(239, 83, 80, 0.05);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.skeleton {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.06),
    rgba(255,255,255,0.12),
    rgba(255,255,255,0.06)
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin: 32px 0 16px 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.06);
  color: var(--text);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.12);
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
}
</style>