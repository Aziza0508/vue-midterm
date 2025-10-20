
<script setup lang="ts">
defineProps<{ value: number }>()
const stars = [1,2,3,4,5]
</script>

<template>
  <div aria-label="Rating" title="Average rating" style="display:flex; gap:4px; align-items:center">
    <span v-for="s in stars" :key="s" :style="{opacity: value/2 >= s ? 1 : 0.25}">★</span>
    <small style="color:var(--muted); margin-left:6px">{{ (value).toFixed(1) }}</small>
  </div>
</template>
