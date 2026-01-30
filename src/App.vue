<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200 p-6"
  >
    <h1 class="text-center text-3xl font-bold text-sky-400 mb-8">
      Infrastructure Control Plane
    </h1>
    <Dashboard />
  </div>
</template>
<script setup>
import Dashboard from "./views/Dashboard.vue";
</script>
