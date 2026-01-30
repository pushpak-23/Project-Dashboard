<template>
  <div
    class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl"
  >
    <h1 class="text-center text-3xl font-extrabold text-emerald-400 mb-10">
      Software Layer
    </h1>

    <div
      ref="grid"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8"
    >
      <div
        v-for="s in data.softwares"
        :key="s.name"
        class="relative"
        @mouseenter="enter(s.name)"
        @mouseleave="leave(s.name)"
      >
        <!-- Card -->
        <div
          :class="[
            'card relative z-10 rounded-2xl border p-5 cursor-pointer backdrop-blur-xl bg-white/5 transition-all duration-300',
            active === s.name
              ? 'border-emerald-400 shadow-[0_20px_40px_rgba(52,211,153,0.25)] scale-[1.03]'
              : 'border-white/10 hover:border-emerald-500/50',
          ]"
          @click="!s.children && go(s.url)"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="flex-grow pr-8">
              <h2
                class="text-lg font-bold mb-2"
                :class="active === s.name ? 'text-emerald-300' : 'text-white'"
              >
                {{ s.name }}
              </h2>
              <p class="text-sm text-slate-300">{{ s.desc }}</p>
            </div>

            <img
              v-if="s.icon && hasLogo(s.icon)"
              :src="`https://cdn.simpleicons.org/${normalizeIcon(
                s.icon
              )}/6EE7B7`"
              class="logo w-10 h-10"
              @error="onIconError"
            />
          </div>
        </div>

        <!-- PANEL -->
        <div
          v-show="active === s.name"
          :ref="(el) => setPanelRef(el, s.name)"
          class="panel relative mt-3 z-10 bg-slate-900/95 border border-emerald-400/40 rounded-2xl p-4 shadow-2xl"
          @mouseenter="enter(s.name)"
          @mouseleave="leave(s.name)"
        >
          <!-- Header -->
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-semibold text-emerald-300">
              {{ s.children ? "Services" : "Cluster Info" }}
            </h3>
            <button
              class="panel-details-btn"
              @click.stop="openClusterDetails(s)"
            >
              Details
            </button>
          </div>

          <!-- Children -->
          <div v-if="s.children" class="grid grid-cols-1 gap-3">
            <div
              v-for="c in s.children"
              :key="c.name"
              class="child flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer"
              @click.stop="go(c.url)"
            >
              <div class="flex-grow">
                <h3 class="text-sm font-semibold text-emerald-300">
                  {{ c.name }}
                </h3>
                <p class="text-[11px] text-slate-300 break-all">{{ c.url }}</p>
              </div>
              <img
                v-if="c.icon && hasLogo(c.icon)"
                :src="`https://cdn.simpleicons.org/${normalizeIcon(
                  c.icon
                )}/6EE7B7`"
                class="logo w-8 h-8"
                @error="onIconError"
              />
            </div>
          </div>

          <!-- No children -->
          <div v-else class="text-slate-400 text-sm italic text-center py-4">
            No child services. Use “Details” to view cluster configuration.
          </div>
        </div>
      </div>
    </div>

    <!-- DETAILS OVERLAY -->
    <teleport to="body">
      <div v-if="showClusterDetail" class="fixed inset-0 z-[9999] flex">
        <div
          class="w-[30vw] min-w-[360px] bg-gradient-to-b from-slate-900 to-black p-6 border-r border-white/10 shadow-2xl overflow-y-auto"
        >
          <div class="flex justify-between mb-4">
            <h2 class="text-2xl font-bold text-amber-300">
              {{ clusterDetail.name }}
            </h2>
            <button
              class="text-white/60 hover:text-white"
              @click="showClusterDetail = false"
            >
              ✕
            </button>
          </div>

          <p class="text-slate-300 mb-4">{{ clusterDetail.desc }}</p>

          <div class="space-y-2 mb-4 text-emerald-200 text">
            <div class="info-row">
              <span>URL</span><span>{{ clusterDetail.url || "N/A" }}</span>
            </div>
            <div class="info-row">
              <span>Services</span
              ><span>{{ clusterDetail.children?.length || 0 }}</span>
            </div>
          </div>

          <!-- CONFIG FILES -->
          <h3 class="text-amber-300 mb-2">Config Files</h3>
          <div v-if="clusterDetail.configs?.length" class="space-y-2 mb-4">
            <div
              v-for="c in clusterDetail.configs"
              :key="c.file"
              class="info-row flex-col items-start"
              @click="loadYaml(c.path)"
            >
              <span
                class="text-emerald-300 font-semibold cursor-pointer hover:underline"
              >
                {{ c.file }}
              </span>
              <span class="text-xs text-slate-400">{{ c.path }}</span>
            </div>
          </div>
          <div v-else class="text-slate-500 text-sm mb-4">
            No config files provided.
          </div>

          <h3 class="text-amber-300 mb-2">Cluster YAML</h3>

          <div class="yaml-wrapper">
            <!-- Header -->
            <div class="yaml-header">
              <span class="yaml-title">cluster.yaml</span>
              <button class="yaml-copy-btn" @click="copyYaml">
                <!-- Modern copy icon -->
                <svg viewBox="0 0 24 24" class="yaml-icon">
                  <path d="M9 9h10v12H9z" opacity="0.3" />
                  <path d="M5 3h10v12H5z" />
                </svg>
                <span v-if="copiedYaml" class="copied-text">Copied</span>
              </button>
            </div>

            <!-- Content -->
            <pre class="yaml-box">{{ clusterDetail.yaml || yamlText }}</pre>
          </div>
        </div>
        <div
          class="flex-1 bg-black/60"
          @click="showClusterDetail = false"
        ></div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import gsap from "gsap";
import data from "../data/software.json";

const active = ref(null);
const grid = ref(null);
const panelMap = new Map();
let closeTimer = null;
let inside = false;

const showClusterDetail = ref(false);
const clusterDetail = ref({});
const yamlText = ref("");
const copiedYaml = ref(false);

async function loadYaml(path) {
  try {
    const res = await fetch(path);
    yamlText.value = await res.text();
  } catch {
    yamlText.value = "Failed to load YAML file.";
  }
}

function openClusterDetails(cluster) {
  clusterDetail.value = cluster;
  yamlText.value = "";
  showClusterDetail.value = true;

  if (cluster.configs?.length) {
    loadYaml(cluster.configs[0].path); // auto load first file
  }
}

function copyYaml() {
  navigator.clipboard.writeText(clusterDetail.value.yaml || yamlText.value);
  copiedYaml.value = true;
  setTimeout(() => (copiedYaml.value = false), 1500);
}

function setPanelRef(el, name) {
  if (el) panelMap.set(name, el);
}

function enter(name) {
  inside = true;
  clearTimeout(closeTimer);
  if (active.value !== name) {
    active.value = name;
    nextTick(() => animateOpen(name));
  }
}

function leave(name) {
  inside = false;
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    if (!inside && active.value === name) {
      animateClose(name);
      active.value = null;
    }
  }, 400);
}

function animateOpen(name) {
  const panel = panelMap.get(name);
  if (!panel) return;
  const children = panel.querySelectorAll(".child");
  gsap.fromTo(
    panel,
    { opacity: 0, scale: 0.94, y: 14 },
    { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.6)" }
  );
  gsap.fromTo(
    children,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, stagger: 0.06, duration: 0.4 }
  );
}

function animateClose(name) {
  const panel = panelMap.get(name);
  if (!panel) return;
  gsap.to(panel, { opacity: 0, scale: 0.94, y: 14, duration: 0.2 });
}

function go(url) {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

const normalizeIcon = (icon) => icon?.toLowerCase().trim();
const onIconError = (e) => (e.target.style.display = "none");
const hasLogo = (icon) =>
  [
    "elasticsearch",
    "solr",
    "redis",
    "minio",
    "kafka",
    "mongodb",
    "mariadb",
    "harbor",
    "gitlab",
    "druid",
  ].includes(normalizeIcon(icon));

onMounted(() => {
  gsap.fromTo(
    grid.value.children,
    { opacity: 0, y: 40, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.6 }
  );
});
</script>

<style scoped>
.card {
  transition: 0.4s;
}
.card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 25px 50px rgba(52, 211, 153, 0.15);
}
.child:hover {
  background: rgba(52, 211, 153, 0.15);
  border-color: #34d399;
  transform: scale(1.04);
}
.panel-details-btn {
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fcd34d;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
}
.panel-details-btn:hover {
  background: rgba(251, 191, 36, 0.2);
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
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.6);
}

.yaml-box {
  background: rgba(0, 0, 0, 0.6);
  border: rgba(251, 191, 36, 0.4);
  color: #6ee7b7;
  padding: 10px;
  border-radius: 10px;
  font-size: 12px;
  margin-bottom: 10px;
}
.yaml-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgba(251, 191, 36, 0.08);
  border-bottom: 1px solid rgba(251, 191, 36, 0.25);
}

.yaml-title {
  font-size: 12px;
  color: #fcd34d;
  font-weight: 600;
}

.yaml-copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #fcd34d;
  border: 1px solid rgba(251, 191, 36, 0.4);
  padding: 3px 8px;
  border-radius: 999px;
  transition: 0.25s;
}

.yaml-copy-btn:hover {
  background: rgba(251, 191, 36, 0.2);
  transform: scale(1.05);
}

.yaml-icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.copied-text {
  font-size: 10px;
  color: #86efac;
}

.logo {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
}
.child > .logo {
  width: 1.75rem;
  height: 1.75rem;
}
</style>
