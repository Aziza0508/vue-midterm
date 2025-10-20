
export function imgPoster(path?: string, size: 'w185'|'w342'|'w500'='w342') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder-poster.svg'
}
export function imgBackdrop(path?: string, size: 'w780'|'w1280'|'original'='w780') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : ''
}
export function yearOf(date?: string) {
  if (!date) return ''
  return new Date(date).getFullYear()
}
