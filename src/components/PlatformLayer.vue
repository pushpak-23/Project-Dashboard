<template>
  <div
    class="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl text-center"
  >
    <h1 class="text-2xl sm:text-3xl font-bold text-sky-400 mb-6 sm:mb-8">
      Platform Layer
    </h1>

    <!-- Platform Tabs -->
    <div class="flex flex-col items-center relative">
      <div class="flex w-full justify-evenly gap-4 sm:gap-6 mb-4">
        <div
          v-for="p in data.platforms"
          :key="p.name"
          class="platform-btn text-lg sm:text-xl font-semibold cursor-pointer px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-white/20 bg-white/5 text-white/80 hover:text-sky-300 transition-all duration-300 flex-grow text-center flex items-center justify-center gap-3"
          @mouseenter="p.clusters && showClusters(p)"
          @mouseleave="p.clusters && onPlatformLeave()"
          @click="onPlatformClick(p)"
        >
          <span class="flex-2 text-center">{{ p.name }}</span>
          <img
            v-if="p.icon"
            :src="`https://cdn.simpleicons.org/${p.icon}/38bdf8`"
            class="w-14 h-14"
            @error="$event.target.style.display = 'none'"
          />
        </div>
      </div>

      <!-- Floating Cluster Panel -->
      <div
        ref="panel"
        class="w-full h-full max-w-full bg-slate-900/95 border border-sky-400 rounded-2xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 opacity-0 scale-95 pointer-events-none shadow-xl overflow-hidden transition-all duration-300"
        :style="{ maxHeight: panelHeight + 'px' }"
        @mouseenter="onPanelEnter"
        @mouseleave="onPanelLeave"
      >
        <!-- Cluster Card -->
        <div
          v-for="c in activeClusters"
          :key="c.name"
          class="cluster-btn bg-white/5 border border-white/20 rounded-xl p-3 text-sm sm:text-base flex items-center gap-3 transition-all duration-300 cursor-pointer hover:scale-[1.03]"
          @click="openDashboard(c.url)"
        >
          <img
            :src="`https://cdn.simpleicons.org/${c.icon}/38bdf8`"
            class="w-8 h-8"
            @error="$event.target.style.display = 'none'"
          />
          <div class="text-left flex-1">
            <p class="font-semibold text-sky-300">{{ c.name }}</p>
            <p class="text-xs sm:text-sm text-slate-400">{{ c.ip }}</p>
          </div>

          <!-- Details Button -->
          <button
            class="detail-btn text-xs px-2 py-1 rounded-md border border-amber-400/40 text-amber-300 hover:bg-amber-400/20"
            @click.stop="openClusterDetails(c)"
          >
            Details
          </button>
        </div>
      </div>
    </div>

    <!-- Universal Detail Overlay -->
    <DetailOverlay
      :show="showDetail"
      :data="detailData"
      @close="showDetail = false"
    />
  </div>
</template>

<style scoped>
.platform-btn {
  transition: transform 0.4s ease, box-shadow 0.4s ease, background 0.4s ease;
}
.platform-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: white;
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 20px 40px rgba(56, 189, 248, 0.25);
}

.cluster-btn {
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.cluster-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  box-shadow: 0 12px 24px rgba(56, 189, 248, 0.3);
}

.detail-btn {
  transition: all 0.25s ease;
}
.detail-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.45);
}
</style>

<script setup>
import { ref, nextTick } from "vue";
import gsap from "gsap";
import data from "../data/platform.json";
import DetailOverlay from "@/components/DetailOverlay.vue";

const activeClusters = ref([]);
const panel = ref(null);
const panelHeight = ref(0);

const showDetail = ref(false);
const detailData = ref({});

let hoveringPlatform = false;
let hoveringPanel = false;
let hideTimeout = null;

/* ---------- Hover logic for platforms ---------- */
function showClusters(platform) {
  if (!platform.clusters || !platform.clusters.length) return;

  activeClusters.value = platform.clusters;
  hoveringPlatform = true;

  nextTick(() => {
    const el = panel.value;
    const h = el.scrollHeight;

    gsap.to(panelHeight, { value: h, duration: 0.1, ease: "power2.out" });
    gsap.to(el, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.5)",
      pointerEvents: "auto",
    });
  });
}

function onPlatformClick(p) {
  // If it has clusters → hover only
  if (p.clusters && p.clusters.length) return;
  // Otherwise open directly
  if (p.url) window.open(p.url, "_blank", "noopener,noreferrer");
}

/* ---------- Cluster click logic ---------- */
function openDashboard(url) {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

/* ---------- Details from JSON ---------- */
function openClusterDetails(c) {
  if (!c.details) return;

  detailData.value = {
    title: c.name,
    description: "Cluster runtime and resource details",
    stats: {
      Nodes: c.details.nodes,
      CPU: c.details.cpu,
      Memory: c.details.memory,
      Pods: c.details.pods,
      Status: c.details.status,
    },
    link: c.url,
    configFile: c.details.config,
  };
  showDetail.value = true;
}

/* ---------- Hide logic ---------- */
function onPlatformLeave() {
  hoveringPlatform = false;
  scheduleHide();
}
function onPanelEnter() {
  hoveringPanel = true;
  if (hideTimeout) clearTimeout(hideTimeout);
}
function onPanelLeave() {
  hoveringPanel = false;
  scheduleHide();
}
function scheduleHide() {
  if (hideTimeout) clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    if (!hoveringPlatform && !hoveringPanel) hideClusters();
  }, 200);
}
function hideClusters() {
  gsap.to(panel.value, {
    opacity: 0,
    scale: 0.95,
    duration: 0.2,
    pointerEvents: "none",
  });
  gsap.to(panelHeight, { value: 0, duration: 0.2, ease: "power2.in" });
}
</script>
