<template>
  <div
    class="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 md:p-8 shadow-[0_0_40px_rgba(251,191,36,0.2)]"
  >
    <h1
      class="text-center text-2xl sm:text-3xl font-bold text-amber-400 mb-6 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]"
    >
      Application Layer
    </h1>

    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
      <div
        v-for="a in data.applications"
        :key="a.name"
        class="group relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-4 sm:p-6 text-center cursor-pointer text-white/80 transition-all duration-300 hover:scale-110 hover:text-black hover:border-amber-400 hover:bg-amber-400/90 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
        @click="go(a.url)"
      >
        <!-- shine sweep -->
        <span
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700"
        ></span>

        <h2 class="text-lg font-semibold mb-2 relative z-10">{{ a.name }}</h2>
        <p class="text-sm text-slate-300 group-hover:text-black relative z-10">
          {{ a.desc }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import data from "../data/application.json";

const go = (url) => {
  if (!url) return;
  window.open(url, "_blank");
};
</script>
