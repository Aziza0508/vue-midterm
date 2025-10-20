
<script setup lang="ts">
const props = defineProps<{ ytKey: string | undefined }>()
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="ytKey" style="position:fixed; inset:0; background:rgba(0,0,0,0.7); display:grid; place-items:center; z-index:1000;">
    <div style="background:#000; border-radius:12px; width:min(960px, 95vw); aspect-ratio:16/9; position:relative;">
      <iframe :src="`https://www.youtube.com/embed/${ytKey}`" frameborder="0" allowfullscreen
              style="position:absolute; inset:0; width:100%; height:100%"></iframe>
    </div>
    <button class="btn danger" style="position:fixed; top:16px; right:16px" @click="emit('close')">Close</button>
  </div>
</template>
