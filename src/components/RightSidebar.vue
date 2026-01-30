<template>
  <div
    ref="sidebar"
    class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col gap-4 shadow-2xl"
  >
    <h2 ref="title" class="text-center text-3xl font-extrabold text-teal-400">
      Security
    </h2>

    <div v-for="item in data.items" :key="item.name" class="group relative">
      <!-- Parent -->
      <div
        class="card flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 text-white/80 font-semibold"
      >
        <span>{{ item.name }}</span>
        <img
          v-if="item.logo"
          :src="`https://cdn.simpleicons.org/${item.logo}/14b8a6`"
          class="w-7 h-7"
          @error="hideImg"
        />
      </div>

      <!-- Dropdown -->
      <div
        class="overflow-hidden max-h-0 group-hover:max-h-[300px] opacity-0 group-hover:opacity-100 translate-y-0 group-hover:translate-y-3 transition-all duration-500 mt-2 mb-4 flex flex-col gap-2 bg-slate-900/95 border border-teal-400/40 rounded-2xl p-4 shadow-2xl"
      >
        <div
          v-for="c in item.children"
          :key="c.name"
          class="child group/child flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
        >
          <!-- Click = Dashboard -->
          <div class="flex-1 cursor-pointer" @click="go(c.url)">
            <h4 class="text-sm font-semibold text-teal-300">{{ c.name }}</h4>
            <p class="text-[11px] text-slate-300 break-all">{{ c.url }}</p>
          </div>

          <!-- Details Button -->
          <button class="details-btn" @click.stop="openDetails(c)">
            Details
          </button>

          <img
            v-if="c.logo"
            :src="`https://cdn.simpleicons.org/${c.logo}/14b8a6`"
            class="w-6 h-6"
            @error="hideImg"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- DETAILS PANEL -->
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9999] flex">
      <div
        ref="panel"
        class="w-[30vw] min-w-[360px] bg-gradient-to-b from-slate-900 to-black p-6 border-l border-white/10 shadow-2xl overflow-y-auto"
      >
        <div class="flex justify-between mb-4">
          <h2 class="text-2xl font-bold text-teal-300">{{ active.name }}</h2>
          <button class="text-white/60 hover:text-white" @click="close">
            ✕
          </button>
        </div>

        <p class="text-slate-300 mb-4">{{ active.desc || "No description" }}</p>

        <!-- Configs -->
        <h3 class="text-teal-300 mb-2">Config Files</h3>
        <div v-if="active.configs?.length" class="space-y-2 mb-4">
          <div
            v-for="c in active.configs"
            :key="c.file"
            class="info-row cursor-pointer"
            @click="loadYaml(c.path)"
          >
            <span class="text-emerald-300 font-semibold">{{ c.file }}</span>
            <span class="text-xs text-slate-400">{{ c.path }}</span>
          </div>
        </div>
        <div v-else class="text-slate-500 text-sm mb-4">
          No configs defined.
        </div>

        <!-- YAML -->
        <h3 class="text-teal-300 mb-2">YAML</h3>

        <div class="yaml-wrapper">
          <div class="yaml-header">
            <span>config.yaml</span>
            <button class="yaml-copy-btn" @click="copyYaml">
              Copy
              <span v-if="copiedYaml" class="copied-text">Copied</span>
            </button>
          </div>
          <pre class="yaml-box">{{ active.yaml || yamlText }}</pre>
        </div>
      </div>

      <div class="flex-1 bg-black/60" @click="close"></div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { gsap } from "gsap";
import data from "../data/rightSidebar.json";

const sidebar = ref(null);
const title = ref(null);
const show = ref(false);
const active = ref({});
const panel = ref(null);
const yamlText = ref("");
const copiedYaml = ref(false);

const go = (url) => url && window.open(url, "_blank");
const hideImg = (e) => (e.target.style.display = "none");

async function loadYaml(path) {
  try {
    const res = await fetch(path);
    yamlText.value = await res.text();
  } catch {
    yamlText.value = "Failed to load YAML file.";
  }
}

function openDetails(c) {
  active.value = c;
  yamlText.value = "";
  show.value = true;

  if (c.configs?.length) loadYaml(c.configs[0].path);

  nextTick(() => {
    gsap.fromTo(
      panel.value,
      { x: "100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 0.5, ease: "power4.out" }
    );
  });
}

function close() {
  show.value = false;
}

function copyYaml() {
  navigator.clipboard.writeText(active.value.yaml || yamlText.value);
  copiedYaml.value = true;
  setTimeout(() => (copiedYaml.value = false), 1500);
}

onMounted(async () => {
  await nextTick();
  gsap.from(sidebar.value, { x: 300, opacity: 0, duration: 1 });
  gsap.from(title.value, { y: -40, opacity: 0, delay: 0.3, duration: 0.8 });
});
</script>

<style scoped>
.card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 25px 50px rgba(45, 212, 191, 0.25);
}

.child:hover {
  background: rgba(45, 212, 191, 0.15);
  border-color: #14b8a6;
  transform: translateY(-3px) scale(1.04);
}

.details-btn {
  opacity: 0;
  transform: scale(0.9);
  border: 1px solid rgba(45, 212, 191, 0.4);
  color: #5eead4;
  background: rgba(0, 0, 0, 0.4);
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  transition: 0.25s;
}
.group\/child:hover .details-btn {
  opacity: 1;
  transform: scale(1);
}
.details-btn:hover {
  background: rgba(45, 212, 191, 0.2);
  transform: scale(1.1);
}

.info-row {
  display: flex;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 10px;
  border-radius: 8px;
}

.yaml-wrapper {
  border: 1px solid rgba(45, 212, 191, 0.4);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.6);
}

.yaml-header {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(45, 212, 191, 0.08);
  border-bottom: 1px solid rgba(45, 212, 191, 0.25);
  color: #5eead4;
  font-size: 12px;
}

.yaml-copy-btn {
  border: 1px solid rgba(45, 212, 191, 0.4);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  transition: 0.25s;
}
.yaml-copy-btn:hover {
  background: rgba(45, 212, 191, 0.2);
}

.yaml-box {
  color: #6ee7b7;
  padding: 10px;
  font-size: 12px;
}

.copied-text {
  margin-left: 6px;
  color: #86efac;
}
</style>
