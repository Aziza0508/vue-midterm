
<script setup lang="ts"></script>

<template>
  <header class="header">
    <div class="container nav">
      <RouterLink to="/">Discover</RouterLink>
      <RouterLink to="/favorites">Favorites</RouterLink>
      <div style="margin-left:auto"></div>
      <RouterLink to="/">MovieHub</RouterLink>
    </div>
  </header>

  <main class="container">
<RouterView v-slot="{ Component }" :key="$route.fullPath">
  <transition name="fade" mode="out-in">
    <component :is="Component" />
  </transition>
</RouterView>




  </main>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
