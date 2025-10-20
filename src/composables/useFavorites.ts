
import { reactive, computed, watch } from 'vue'
import type { Movie } from './useTmdb'

const KEY = 'mhub:favorites'

type Fav = { id: number; title: string; poster_path?: string; vote_average: number; genre_ids?: number[] }

const state = reactive<{ map: Record<number, Fav> }>({
  map: JSON.parse(localStorage.getItem(KEY) || '{}')
})

watch(() => state.map, (m) => {
  localStorage.setItem(KEY, JSON.stringify(m))
}, { deep: true })

export function useFavorites() {
  const list = computed(() => Object.values(state.map))
  function toggle(m: Movie) {
    if (state.map[m.id]) delete state.map[m.id]
    else state.map[m.id] = { id: m.id, title: m.title || m.name || '', poster_path: m.poster_path, vote_average: m.vote_average, genre_ids: m.genre_ids }
  }
  function has(id: number) { return !!state.map[id] }
  function clear() { state.map = {} as any }
  return { list, toggle, has, clear }
}
