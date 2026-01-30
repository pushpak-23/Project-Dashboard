<template>
  <div
    class="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-2xl text-center"
  >
    <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-300 mb-6 sm:mb-8">
      Hardware Layer
    </h1>

    <!-- Categories -->
    <div class="flex flex-col items-center relative">
      <div class="flex w-full justify-evenly gap-4 sm:gap-6 mb-4">
        <div
          v-for="cat in data.categories"
          :key="cat"
          class="card group relative overflow-hidden text-lg sm:text-xl font-semibold cursor-pointer px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 transition-all duration-300 flex-grow hover:border-slate-400/60 hover:text-white"
          @mouseenter="showDevices(cat)"
          @mouseleave="onCategoryLeave"
        >
          {{ cat.toUpperCase() }}
        </div>
      </div>

      <!-- Device Panel -->
      <div
        ref="panel"
        class="w-full bg-slate-900/95 border border-white/20 rounded-2xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 opacity-0 scale-95 pointer-events-none shadow-2xl overflow-hidden transition-all duration-300"
        :style="{ maxHeight: panelHeight + 'px' }"
        @mouseenter="onPanelEnter"
        @mouseleave="onPanelLeave"
      >
        <div
          v-for="d in activeDevices"
          :key="d.name"
          class="child bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-slate-400 transition"
          @click="openIDRAC(d.url)"
        >
          <img
            :src="`https://cdn.simpleicons.org/${d.icon}/d1d5db`"
            class="w-8 h-8"
            @error="$event.target.style.display = 'none'"
          />
          <div class="flex-1 text-left">
            <p class="font-semibold text-slate-200">{{ d.name }}</p>
            <p class="text-xs text-slate-400">Mgmt: {{ d.mgmt_ip }}</p>
            <p class="text-xs text-slate-500">SSH: {{ d.internal_ip }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <button class="action-btn details-btn" @click.stop="openDetails(d)">
              Details
            </button>
            <button
              class="action-btn text-sky-300 border-sky-400/40 hover:bg-sky-400/20"
              @click.stop="sshTo(d)"
            >
              SSH
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PREMIUM DETAILS OVERLAY -->
    <teleport to="body">
      <div v-if="showDetail" class="fixed inset-0 z-[9999] flex">
        <!-- Panel -->
        <div
          ref="detailPanel"
          class="w-[30vw] min-w-[360px] bg-gradient-to-b from-slate-900 via-slate-900/95 to-black border-r border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] p-6 backdrop-blur-xl"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-extrabold text-emerald-400">
              {{ detailDevice.name }}
            </h2>
            <button
              class="text-white/60 hover:text-white text-xl"
              @click="closeDetails"
            >
              ✕
            </button>
          </div>

          <!-- Info Cards -->
          <div class="grid gap-3 mb-6">
            <div class="info-row">
              <span>Management IP</span>
              <b>{{ detailDevice.mgmt_ip }}</b>
            </div>
            <div class="info-row">
              <span>Internal IP</span>
              <b>{{ detailDevice.internal_ip }}</b>
            </div>
            <div class="info-row">
              <span>SSH User</span>
              <b>{{ detailDevice.ssh_user }}</b>
            </div>
            <div class="info-row">
              <span>Vendor</span>
              <b>{{ detailDevice.icon }}</b>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <a
              :href="detailDevice.url"
              target="_blank"
              class="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/30 transition"
            >
              Open Dashboard
            </a>
            <button
              class="px-4 py-2 rounded-lg bg-sky-500/20 border border-sky-400 text-sky-300 hover:bg-sky-500/30 transition"
              @click="sshTo(detailDevice)"
            >
              SSH
            </button>
          </div>
        </div>

        <!-- Backdrop -->
        <div
          class="flex-1 bg-black/60 backdrop-blur-md"
          @click="closeDetails"
        ></div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from "vue";
import gsap from "gsap";
import data from "../data/hardware.json";

const activeDevices = ref([]);
const panel = ref(null);
const panelHeight = ref(0);

const showDetail = ref(false);
const detailDevice = ref({});
const detailPanel = ref(null);

let hoveringCategory = false;
let hoveringPanel = false;
let hideTimeout = null;

/* Hover logic */
function showDevices(category) {
  activeDevices.value = data[category] || [];
  hoveringCategory = true;
  nextTick(() => {
    const h = panel.value.scrollHeight;
    gsap.to(panelHeight, { value: h, duration: 0.1 });
    gsap.to(panel.value, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      pointerEvents: "auto",
    });
  });
}
function onCategoryLeave() {
  hoveringCategory = false;
  scheduleHide();
}
function onPanelEnter() {
  hoveringPanel = true;
  clearTimeout(hideTimeout);
}
function onPanelLeave() {
  hoveringPanel = false;
  scheduleHide();
}
function scheduleHide() {
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    if (!hoveringCategory && !hoveringPanel) hideDevices();
  }, 200);
}
function hideDevices() {
  gsap.to(panel.value, {
    opacity: 0,
    scale: 0.95,
    duration: 0.2,
    pointerEvents: "none",
  });
  gsap.to(panelHeight, { value: 0, duration: 0.2 });
}

/* Actions */
function openIDRAC(url) {
  if (url) window.open(url, "_blank");
}
function openDetails(device) {
  detailDevice.value = device;
  showDetail.value = true;
}
function closeDetails() {
  showDetail.value = false;
}
function sshTo(device) {
  const host = device.internal_ip;
  const user = device.ssh_user || "root";
  if (!host) return alert("No internal IP for SSH");
  window.open(`ssh://${user}@${host}`);
}

/* Animate details panel */
watch(showDetail, async (v) => {
  if (v) {
    await nextTick();
    gsap.fromTo(
      detailPanel.value,
      { x: "-100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 0.5, ease: "power4.out" }
    );
  }
});
</script>

<style scoped>
.action-btn {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #6ee7b7;
  background: transparent;
  transition: all 0.25s ease;
}
.action-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.4);
}
.action-btn.details-btn {
  border: 1px solid rgba(255, 159, 28, 0.4); /* amber border */
  color: #fbbf24; /* amber text */
  background-color: transparent;
  transition: all 0.25s ease;
}

.action-btn.details-btn:hover {
  background-color: rgba(251, 146, 60, 0.2); /* hover effect */
  transform: scale(1.08);
  box-shadow: 0 0 12px rgba(251, 146, 60, 0.4);
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}
.info-row b {
  color: white;
}
</style>
