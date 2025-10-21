<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Genre } from '../composables/useTmdb'

type Filters = { query: string; genreId?: number; year?: number; sortBy: string }

const props = defineProps<{
  genres: Genre[]
  modelValue: Filters
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: Filters): void
  (e: 'apply'): void
}>()

// Локальная копия для удобного ввода
const local = ref<Filters>({ ...props.modelValue })

// Если снаружи фильтры поменялись — синхронизируем
watch(
  () => props.modelValue,
  (v) => { local.value = { ...v } },
  { deep: true }
)

// Универсальный пуш наверх (с приведением типов)
function push() {
  emit('update:modelValue', {
    query: local.value.query ?? '',
    genreId:
      local.value.genreId === undefined ||
      local.value.genreId === null ||
      (local.value.genreId as unknown as string) === ''
        ? undefined
        : Number(local.value.genreId),
    year:
      local.value.year === undefined ||
      local.value.year === null ||
      (local.value.year as unknown as string) === ''
        ? undefined
        : Number(local.value.year),
    sortBy: local.value.sortBy || 'popularity.desc',
  })
}

// Handlers: сразу обновляем модель при изменениях
function onQueryInput(e: Event) {
  local.value.query = (e.target as HTMLInputElement).value
  push()
}

function onGenreChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value
  local.value.genreId = raw === '' ? undefined : Number(raw)
  push()
}

function onYearInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  local.value.year = raw === '' ? undefined : Number(raw)
  push()
}

function onSortChange(e: Event) {
  local.value.sortBy = (e.target as HTMLSelectElement).value
  push()
}

function apply() {
  // гарантируем актуальную модель и просим родителя перезагрузить
  push()
  emit('apply')
}
</script>

<template>
  <div
    style="display:grid; gap:10px; grid-template-columns: 1fr 150px 120px 160px; align-items:end; margin-bottom: 16px"
  >
    <div>
      <label>Search</label>
      <input
        class="input"
        placeholder="movie title…"
        :value="local.query"
        @input="onQueryInput"
        @keydown.enter="apply"
      />
    </div>

    <div>
      <label>Genre</label>
      <select :value="local.genreId ?? ''" @change="onGenreChange">
        <option value="">Any</option>
        <option v-for="g in genres" :key="g.id" :value="g.id">{{ g.name }}</option>
      </select>
    </div>

    <div>
      <label>Year</label>
      <input
        class="input"
        type="number"
        placeholder="e.g., 2023"
        :value="local.year ?? ''"
        @input="onYearInput"
      />
    </div>

    <div>
      <label>Sort by</label>
      <select :value="local.sortBy" @change="onSortChange">
        <option value="popularity.desc">Popularity ↓</option>
        <option value="popularity.asc">Popularity ↑</option>
        <option value="vote_average.desc">Rating ↓</option>
        <option value="primary_release_date.desc">Release date ↓</option>
        <option value="primary_release_date.asc">Release date ↑</option>
      </select>
    </div>

    <div style="grid-column: 1 / -1; display:flex; gap:10px; justify-content:flex-end">
      <button class="btn" @click="apply">Apply</button>
    </div>
  </div>
</template>

<style scoped>
label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  margin-bottom: 6px;
}

.input,
select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--text);
  font-size: 14px;
  transition: all 0.2s ease;
}

.input:focus,
select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.btn {
  padding: 8px 24px;
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  background: rgba(99, 102, 241, 0.25);
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  div[style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
  }

  .btn {
    width: 100%;
  }
}
</style>