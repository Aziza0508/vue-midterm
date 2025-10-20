
import { ref, computed, watchEffect } from 'vue'
const API = 'https://api.themoviedb.org/3'
const KEY = import.meta.env.VITE_TMDB_KEY

export type Movie = {
  id: number
  title: string
  name?: string
  overview: string
  release_date?: string
  poster_path?: string
  backdrop_path?: string
  vote_average: number
  genre_ids?: number[]
}

export type Genre = { id: number; name: string }

async function get(path: string, params: Record<string, any> = {}) {
  const url = new URL(API + path)
  url.searchParams.set('api_key', KEY)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDb ${res.status}: ${await res.text()}`)
  return res.json()
}

export function useGenres() {
  const genres = ref<Genre[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const load = async () => {
    try {
      isLoading.value = true; error.value = null
      const data = await get('/genre/movie/list', { language: 'en-US' })
      genres.value = data.genres || []
    } catch (e: any) {
      error.value = e.message || 'Failed to load genres'
    } finally {
      isLoading.value = false
    }
  }

  if (!genres.value.length) load()
  return { genres, isLoading, error, reload: load }
}

export function useDiscover() {
  const items = ref<Movie[]>([])
  const page = ref(1)
  const totalPages = ref(1)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const query = ref('')
  const genreId = ref<number | undefined>()
  const year = ref<number | undefined>()
  const sortBy = ref<string>('popularity.desc')

  async function fetchPage(p = 1) {
    try {
      isLoading.value = true; error.value = null
      page.value = p
      const endpoint = query.value ? '/search/movie' : '/discover/movie'
      const params: Record<string, any> = {
        include_adult: false,
        page: p,
        language: 'en-US',
        sort_by: sortBy.value
      }
      if (query.value) params.query = query.value
      if (genreId.value) params.with_genres = genreId.value
      if (year.value) params.primary_release_year = year.value

      const data = await get(endpoint, params)
      items.value = data.results || []
      totalPages.value = data.total_pages || 1
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch movies'
    } finally {
      isLoading.value = false
    }
  }

  function next() { if (page.value < totalPages.value) fetchPage(page.value + 1) }
  function prev() { if (page.value > 1) fetchPage(page.value - 1) }

  return { items, page, totalPages, isLoading, error, query, genreId, year, sortBy, fetchPage, next, prev }
}

export function useMovieDetails(id: number) {
  const data = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    try {
      isLoading.value = true; error.value = null
      data.value = await get(`/movie/${id}`, {
        language: 'en-US',
        append_to_response: 'credits,videos'
      })
    } catch (e: any) {
      error.value = e.message || 'Failed to load movie details'
    } finally {
      isLoading.value = false
    }
  }

  watchEffect(() => { if (id) load() })
  const trailerKey = computed(() => {
    const vids = data.value?.videos?.results || []
    const yt = vids.find((v: any) => v.site === 'YouTube' and v.type === 'Trailer') || vids.find((v: any) => v.site === 'YouTube')
    return yt?.key
  })

  return { data, isLoading, error, reload: load, trailerKey }
}
