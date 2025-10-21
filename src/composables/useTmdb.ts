// src/composables/useTmdb.ts
import { ref, computed, watchEffect, unref, type Ref } from 'vue'

const API = 'https://api.themoviedb.org/3'
const KEY = import.meta.env.VITE_TMDB_KEY

export type Movie = {
  id: number
  title?: string
  name?: string
  overview: string
  release_date?: string
  poster_path?: string
  vote_average: number
  genre_ids?: number[]
}

export type Genre = {
  id: number
  name: string
}

export type Filters = {
  query: string
  genreId?: number
  year?: number
  sortBy: string // e.g. 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'primary_release_date.asc'
}

async function get(path: string, params: Record<string, any> = {}) {
  const url = new URL(`${API}${path}`)
  url.searchParams.set('api_key', KEY)
  url.searchParams.set('language', 'en-US')
  url.searchParams.set('include_adult', 'false')

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v))
    }
  }

  const res = await fetch(url.toString(), { cache: 'no-store' }) // важно: выключаем кэш
  if (!res.ok) throw new Error(`Failed to fetch ${path} (${res.status})`)
  return res.json()
}

export async function fetchGenres() {
  const data = await get('/genre/movie/list')
  return data.genres as Genre[]
}

export async function fetchMovies(params: Record<string, any>) {
  return get('/discover/movie', params)
}

export async function searchMovies(query: string, page = 1) {
  return get('/search/movie', { query, page })
}

export function useDiscover() {
  const movies = ref<Movie[]>([])
  const genres = ref<Genre[]>([])
  const page = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ВАЖНО: filters — это ref, чтобы v-model корректно менял объект
  const filters = ref<Filters>({
    query: '',
    genreId: undefined,
    year: undefined,
    sortBy: 'popularity.desc',
  })

  async function loadGenres() {
    try {
      genres.value = await fetchGenres()
    } catch (e) {
      console.error('Failed to load genres:', e)
    }
  }

  async function fetchPage(p = 1) {
    loading.value = true
    error.value = null
    try {
      const f = filters.value // читаем актуальную ссылку один раз

      // Ветка поиска — сервер фильтрует по query, остальное фильтруем/сортируем локально
      if (f.query.trim()) {
        const data = await searchMovies(f.query, p)
        let results: Movie[] = Array.isArray(data.results) ? data.results : []

        if (f.genreId) {
          const gid = Number(f.genreId)
          results = results.filter(m => Array.isArray(m.genre_ids) && m.genre_ids.includes(gid))
        }

        if (f.year) {
          const y = Number(f.year)
          results = results.filter(m => {
            if (!m.release_date) return false
            const year = new Date(m.release_date).getFullYear()
            return year === y
          })
        }

        // Локальная сортировка
        if (f.sortBy === 'vote_average.desc') {
          results.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
        } else if (f.sortBy === 'primary_release_date.desc') {
          results.sort(
            (a, b) =>
              new Date(b.release_date ?? 0).getTime() -
              new Date(a.release_date ?? 0).getTime()
          )
        } else if (f.sortBy === 'primary_release_date.asc') {
          results.sort(
            (a, b) =>
              new Date(a.release_date ?? 0).getTime() -
              new Date(b.release_date ?? 0).getTime()
          )
        }
        // popularity.* оставляем как есть — search уже ранжирует по релевантности/популярности

        movies.value = results
        page.value = data.page ?? p
        totalPages.value = Math.min(data.total_pages ?? 1, 500)
        return
      }

      // Ветка discover — все фильтры уходим в query-параметры
      const params: Record<string, any> = {
        page: p,
        sort_by: f.sortBy || 'popularity.desc',
      }
      if (f.genreId) params.with_genres = Number(f.genreId)
      if (f.year) params.primary_release_year = Number(f.year)

      const d = await fetchMovies(params)
      movies.value = Array.isArray(d.results) ? d.results : []
      page.value = d.page ?? p
      totalPages.value = Math.min(d.total_pages ?? 1, 500)
    } catch (e: any) {
      error.value = e?.message || 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function next() {
    if (page.value < totalPages.value) fetchPage(page.value + 1)
  }

  function prev() {
    if (page.value > 1) fetchPage(page.value - 1)
  }

  // первая загрузка жанров (список фильмов грузится снаружи через apply)
  loadGenres()

  return {
    movies,
    genres,
    page,
    totalPages,
    loading,
    error,
    filters,     // ref<Filters>
    fetchPage,
    next,
    prev,
    loadGenres,
  }
}

// ======= Детали фильма =======
export function useMovieDetails(id: number | Ref<number>) {
  const data = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    const movieId = unref(id)
    if (!movieId) return
    try {
      isLoading.value = true
      error.value = null
      data.value = await get(`/movie/${movieId}`, {
        append_to_response: 'credits,videos',
      })
    } catch (e: any) {
      error.value = e?.message || 'Failed to load movie details'
    } finally {
      isLoading.value = false
    }
  }

  watchEffect(() => {
    if (unref(id)) load()
  })

  const trailerKey = computed(() => {
    const vids = data.value?.videos?.results || []
    const yt =
      vids.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') ||
      vids.find((v: any) => v.site === 'YouTube')
    return yt?.key
  })

  return { data, isLoading, error, reload: load, trailerKey }
}