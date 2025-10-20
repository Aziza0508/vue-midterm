
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Genre } from '../composables/useTmdb'

const props = defineProps<{
  genres: Genre[]
  modelValue: { query: string; genreId?: number; year?: number; sortBy: string }
}>()
const emit = defineEmits(['update:modelValue', 'apply'])

const local = ref({ ...props.modelValue })

watch(() => props.modelValue, (v) => local.value = { ...v })

function apply() {
  emit('update:modelValue', { ...local.value })
  emit('apply')
}
</script>

<template>
  <div style="display:grid; gap:10px; grid-template-columns: 1fr 150px 120px 160px; align-items:end; margin-bottom: 16px">
    <div>
      <label>Search</label>
      <input class="input" placeholder="movie title…" v-model="local.query" @keydown.enter="apply">
    </div>
    <div>
      <label>Genre</label>
      <select v-model.number="local.genreId">
        <option :value="undefined">Any</option>
        <option v-for="g in genres" :key="g.id" :value="g.id">{{ g.name }}</option>
      </select>
    </div>
    <div>
      <label>Year</label>
      <input class="input" type="number" placeholder="e.g., 2023" v-model.number="local.year">
    </div>
    <div>
      <label>Sort by</label>
      <select v-model="local.sortBy">
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
