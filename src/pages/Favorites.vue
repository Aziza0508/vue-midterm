
<script setup lang="ts">
import { computed } from 'vue'
import { useFavorites } from '../composables/useFavorites'
import MovieCard from '../components/MovieCard.vue'
import { Chart, registerables } from 'chart.js'
import { Bar, Pie } from 'vue-chart-3'
import Papa from 'papaparse'
import jsPDF from 'jspdf'

Chart.register(...registerables)

const { list, clear } = useFavorites()

const genreMap: Record<number, string> = {
  28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Science Fiction',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western'
}

const genreCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const m of list.value) {
    (m.genre_ids || []).forEach(g => {
      const name = genreMap[g] || String(g)
      counts[name] = (counts[name] || 0) + 1
    })
  }
  return counts
})

const ratings = computed(() => list.value.map(m => Number(m.vote_average || 0)).filter(Boolean))

function downloadCSV() {
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
  <h1 style="margin: 8px 0 16px 0">Favorites</h1>

  <div v-if="!list.length" class="empty">
    No favorites yet.
  </div>

  <div v-else style="display:grid; gap:18px">
    <div style="display:flex; gap:8px; flex-wrap:wrap">
      <button class="btn" @click="downloadCSV">Export CSV</button>
      <button class="btn" @click="downloadPDF">Export PDF</button>
      <button class="btn danger" @click="clear">Clear</button>
    </div>

    <div class="grid">
      <MovieCard v-for="m in list" :key="m.id" :movie="m as any" />
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div>
        <h3>Genre Distribution</h3>
        <Pie :chart-data="{
          labels: Object.keys(genreCounts),
          datasets: [{ data: Object.values(genreCounts) }]
        }" :options="{ responsive: true, plugins: {legend: {position:'bottom'}} }" />
      </div>
      <div>
        <h3>Ratings Histogram</h3>
        <Bar :chart-data="{
          labels: ratings.map((_,i)=>i+1),
          datasets: [{ data: ratings }]
        }" :options="{ responsive:true, plugins:{legend:{display:false}} }" />
      </div>
    </div>
  </div>
</template>
