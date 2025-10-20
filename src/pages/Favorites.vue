<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useFavorites } from '../composables/useFavorites'
import MovieCard from '../components/MovieCard.vue'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const { list, clear } = useFavorites()

const pieChartRef = ref<HTMLCanvasElement | null>(null)
const barChartRef = ref<HTMLCanvasElement | null>(null)
let pieChart: Chart | null = null
let barChart: Chart | null = null

const genreMap: Record<number, string> = {
  28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',
  18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',
  9648:'Mystery',10749:'Romance',878:'Science Fiction',10770:'TV Movie',
  53:'Thriller',10752:'War',37:'Western'
}

const genreCounts = computed(() => {
  const counts: Record<string, number> = {}
  list.value.forEach(m => {
    (m.genre_ids || []).forEach(g => {
      const name = genreMap[g] || String(g)
      counts[name] = (counts[name] || 0) + 1
    })
  })
  return counts
})

const ratings = computed(() => list.value.map(m => Number(m.vote_average || 0)).filter(Boolean))

function createCharts() {
  if (!list.value.length) return
  
  if (pieChart) pieChart.destroy()
  if (barChart) barChart.destroy()

  if (pieChartRef.value) {
    const genreLabels = Object.keys(genreCounts.value)
    const genreData = Object.values(genreCounts.value)
    
    pieChart = new Chart(pieChartRef.value, {
      type: 'pie',
      data: {
        labels: genreLabels,
        datasets: [{
          data: genreData,
          backgroundColor: [
            '#64b5f6', '#81c784', '#ffa726', '#ef5350', '#ab47bc',
            '#26c6da', '#ffee58', '#ff7043', '#78909c', '#9ccc65'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#f3f6ff',
              padding: 12,
              font: { size: 11 }
            }
          },
          title: {
            display: false
          }
        }
      }
    })
  }

  if (barChartRef.value) {
    barChart = new Chart(barChartRef.value, {
      type: 'bar',
      data: {
        labels: list.value.map(m => m.title.slice(0, 12) + (m.title.length > 12 ? '...' : '')),
        datasets: [{
          label: 'Rating',
          data: ratings.value,
          backgroundColor: '#64b5f6',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9aa3b2', font: { size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#9aa3b2', font: { size: 10 } }
          }
        },
        plugins: {
          legend: { display: false },
          title: { display: false }
        }
      }
    })
  }
}

watch(() => list.value.length, () => {
  setTimeout(createCharts, 100)
}, { immediate: false })

onMounted(() => {
  if (list.value.length) {
    createCharts()
  }
})

function downloadCSV() {
  if (!list.value.length) return
  const csv = Papa.unparse(list.value.map(m => ({
    id: m.id, title: m.title, rating: m.vote_average
  })))
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'favorites.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function downloadPDF() {
  if (!list.value.length) return
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Favorites', 14, 18)
  doc.setFontSize(12)
  let y = 28
  list.value.slice(0, 40).forEach(m => {
    doc.text(`${m.title}  —  ${m.vote_average}`, 14, y)
    y += 8
    if (y > 280) { doc.addPage(); y = 20 }
  })
  doc.save('favorites.pdf')
}
</script>

<template>
  <div class="favorites">
    <h1 class="title">Favorites</h1>

    <div v-if="!list.length" class="empty">
      <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      <p>No favorites yet</p>
      <span>Start adding movies to your collection</span>
    </div>

    <div v-else class="content">
      <!-- Кнопки действий -->
      <div class="actions">
        <button class="btn btn-primary" @click="downloadCSV">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
        <button class="btn btn-primary" @click="downloadPDF">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Export PDF
        </button>
        <div style="margin-left: auto"></div>
        <span class="badge">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {{ list.length }} {{ list.length === 1 ? 'movie' : 'movies' }}
        </span>
        <button class="btn btn-danger" @click="clear">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Clear All
        </button>
      </div>

      <div class="grid">
        <MovieCard v-for="m in list" :key="m.id" :movie="m as any" />
      </div>

      <!-- Графики -->
      <div class="charts-container" v-if="list.length">
        <div class="chart-card">
          <h3 class="chart-title">Genre Distribution</h3>
          <canvas ref="pieChartRef"></canvas>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">Movie Ratings</h3>
          <canvas ref="barChartRef"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites {
  padding: 16px;
}

.title {
  margin: 8px 0 16px 0;
  font-size: 24px;
  font-weight: 600;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  border: 1px dashed rgba(255,255,255,0.12);
  border-radius: 16px;
  color: var(--muted);
  text-align: center;
}

.empty svg {
  opacity: 0.5;
}

.empty p {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--text);
}

.empty span {
  font-size: 14px;
}

.content {
  display: grid;
  gap: 24px;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255,255,255,0.06);
  color: var(--text);
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

.btn-primary {
  background: rgba(100, 181, 246, 0.15);
  color: #64b5f6;
}

.btn-primary:hover:not(:disabled) {
  background: rgba(100, 181, 246, 0.25);
}

.btn-danger {
  background: rgba(239, 83, 80, 0.15);
  color: #ef5350;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 83, 80, 0.25);
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

.badge svg {
  opacity: 0.7;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.chart-card {
  background: var(--card);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}

.chart-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.chart-card canvas {
  max-height: 280px;
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .actions > div[style*="margin-left"] {
    display: none;
  }
}
</style>