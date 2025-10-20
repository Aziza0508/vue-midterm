
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
    <Transition name="fade" mode="out-in">
      <RouterView />
    </Transition>
  </main>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
