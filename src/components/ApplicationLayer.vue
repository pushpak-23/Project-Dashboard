<template>
  <div
    class="overflow-hidden rounded-[2.5rem] border border-white/20 bg-linear-to-br from-white/10 via-white/5 to-white/10 p-6 shadow-[0_0_40px_rgba(251,191,36,0.2)] backdrop-blur-2xl md:p-8"
  >
    <h1
      class="text-center text-2xl sm:text-3xl font-bold text-amber-400 mb-6 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]"
    >
      Application Layer
    </h1>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      <div
        v-for="a in data.applications"
        :key="a.name"
        class="group relative min-w-0 overflow-hidden rounded-3xl border border-white/30 bg-white/10 p-4 text-center cursor-pointer text-white/80 transition-all duration-300 hover:scale-[1.04] hover:border-amber-400 hover:bg-amber-400/90 hover:text-black hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] sm:p-6"
        @click="go(a.url)"
      >
        <!-- shine sweep -->
        <span
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700"
        ></span>

        <h2 class="relative z-10 mb-2 text-lg font-semibold">{{ a.name }}</h2>
        <p class="text-sm text-slate-300 group-hover:text-black relative z-10">
          {{ a.desc }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDashboardResource } from "../composables/useDashboardResource";

const { data } = useDashboardResource("applications", { applications: [] });

const go = (url) => {
  if (!url) return;
  window.open(url, "_blank");
};
</script>
