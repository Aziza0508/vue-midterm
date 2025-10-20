import { ref, computed, watchEffect, unref, reactive, type Ref } from 'vue'

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

async function get(path: string, params: Record<string, any> = {}) {
  const url = new URL(`${API}${path}`)
  url.searchParams.set('api_key', KEY)
  url.searchParams.set('language', 'en-US')
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Failed to fetch ${path}`)
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
  
  const filters = reactive({
    query: '',
    genreId: undefined as number | undefined,
    year: undefined as number | undefined,
    sortBy: 'popularity.desc'
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
      let data
      
      if (filters.query.trim()) {
        data = await searchMovies(filters.query, p)
        
        let filteredResults = data.results
        
        if (filters.genreId) {
          filteredResults = filteredResults.filter((movie: Movie) => 
            movie.genre_ids?.includes(filters.genreId!)
          )
        }
        
        if (filters.year) {
          filteredResults = filteredResults.filter((movie: Movie) => {
            if (!movie.release_date) return false
            const movieYear = new Date(movie.release_date).getFullYear()
            return movieYear === filters.year
          })
        }
        
  
        if (filters.sortBy === 'vote_average.desc') {
          filteredResults.sort((a: Movie, b: Movie) => b.vote_average - a.vote_average)
        } else if (filters.sortBy === 'primary_release_date.desc') {
          filteredResults.sort((a: Movie, b: Movie) => {
            const dateA = a.release_date ? new Date(a.release_date).getTime() : 0
            const dateB = b.release_date ? new Date(b.release_date).getTime() : 0
            return dateB - dateA
          })
        } else if (filters.sortBy === 'primary_release_date.asc') {
          filteredResults.sort((a: Movie, b: Movie) => {
            const dateA = a.release_date ? new Date(a.release_date).getTime() : 0
            const dateB = b.release_date ? new Date(b.release_date).getTime() : 0
            return dateA - dateB
          })
        }

        movies.value = filteredResults
        totalPages.value = Math.min(data.total_pages, 500)
      } else {

        const params: Record<string, any> = {
          page: p,
          sort_by: filters.sortBy,
          include_adult: false
        }
        
        if (filters.genreId) {
          params.with_genres = filters.genreId
        }
        
        if (filters.year) {
          params.primary_release_year = filters.year
        }
        
        data = await fetchMovies(params)
        movies.value = data.results
        totalPages.value = Math.min(data.total_pages, 500)
      }
      
      page.value = p
    } catch (e: any) {
      error.value = e.message || 'Unknown error'
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

  loadGenres()

  return { 
    movies, 
    genres,
    page, 
    totalPages, 
    loading, 
    error, 
    filters,
    fetchPage, 
    next, 
    prev 
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
        append_to_response: 'credits,videos'
      })
    } catch (e: any) {
      error.value = e.message || 'Failed to load movie details'
    } finally {
      isLoading.value = false
    }
  }

  watchEffect(() => {
    if (unref(id)) load()
  })

  const trailerKey = computed(() => {
    const vids = data.value?.videos?.results || []
    const yt = vids.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') || vids.find((v: any) => v.site === 'YouTube')
    return yt?.key
  })

  return { data, isLoading, error, reload: load, trailerKey }
}