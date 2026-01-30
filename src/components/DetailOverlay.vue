<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9999] flex">
      <!-- LEFT Panel -->
      <div
        ref="panel"
        class="h-full w-[30vw] min-w-[360px] max-w-[520px] bg-gradient-to-b from-slate-900 via-slate-900/95 to-black border-r border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] p-6 overflow-y-auto"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-extrabold text-emerald-400">
            {{ data.title || "Details" }}
          </h2>
          <button
            class="text-white/60 hover:text-white text-2xl"
            @click="close"
          >
            ✕
          </button>
        </div>

        <!-- Description -->
        <p v-if="data.description" class="text-slate-300 mb-6">
          {{ data.description }}
        </p>

        <!-- Stats -->
        <div class="space-y-3 mb-6">
          <div
            v-for="(v, k) in data.stats"
            :key="k"
            class="flex justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-2"
          >
            <span class="text-slate-400">{{ k }}</span>
            <span class="text-white font-semibold">{{ v }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <a
            v-if="data.link"
            :href="data.link"
            target="_blank"
            class="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/30 transition"
          >
            Open
          </a>

          <a
            v-if="data.configFile"
            :href="data.configFile"
            download
            class="px-4 py-2 rounded-lg bg-sky-500/20 border border-sky-400 text-sky-300 hover:bg-sky-500/30 transition"
          >
            Download Config
          </a>
        </div>
      </div>

      <!-- Backdrop (RIGHT SIDE) -->
      <div class="flex-1 bg-black/60 backdrop-blur-md" @click="close"></div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import gsap from "gsap";

const props = defineProps({
  show: Boolean,
  data: Object,
});
const emit = defineEmits(["close"]);
const panel = ref(null);

function close() {
  emit("close");
}

watch(
  () => props.show,
  async (v) => {
    if (v) {
      await nextTick();
      gsap.fromTo(
        panel.value,
        { x: "-100%", opacity: 0 },
        {
          x: "0%",
          opacity: 1,
          duration: 0.5,
          ease: "power4.out",
        }
      );
    }
  }
);
</script>
