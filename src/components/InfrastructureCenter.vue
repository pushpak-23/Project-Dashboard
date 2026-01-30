<template>
  <div
    class="w-full bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 shadow-2xl"
  >
    <h1 class="text-3xl font-extrabold text-red-400 mb-6 text-center">
      Infrastructure Layer
    </h1>

    <div class="flex flex-col sm:flex-row gap-6">
      <!-- OpenStack -->
      <div
        class="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)] rounded-2xl p-5"
      >
        <h2 class="text-2xl text-red-400 mb-4 text-center">OpenStack</h2>
        <div class="flex flex-wrap gap-3 justify-center">
          <div
            v-for="s in infra.openstack"
            :key="s.name"
            class="service-btn group hover:border-red-400 hover:bg-[rgba(248,113,113,0.2)]"
            @click="onServiceClick(s)"
          >
            <img
              :src="`https://cdn.simpleicons.org/${s.logo}/D14A43`"
              class="w-8 h-8"
            />
            <span class="flex-1">{{ s.name }}</span>

            <!-- Details button (only on hover) -->
            <button
              class="ml-auto text-xs px-2 py-1 rounded border border-amber-400/40 text-amber-300 hover:bg-amber-400/20 transition opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
              @click.stop="openDetails(s)"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      <!-- Ceph -->
      <div
        class="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)] rounded-2xl p-5"
      >
        <h2 class="text-2xl text-orange-400 mb-4 text-center">Ceph</h2>
        <div class="flex flex-wrap gap-3 justify-center">
          <div
            v-for="s in infra.ceph"
            :key="s.name"
            class="service-btn group hover:border-red-400 hover:bg-[rgba(248,113,113,0.2)]"
            @click="onServiceClick(s)"
          >
            <img
              :src="`https://cdn.simpleicons.org/${s.logo}/FB923C`"
              class="w-8 h-8"
            />
            <span class="flex-1">{{ s.name }}</span>

            <button
              class="ml-auto text-xs px-2 py-1 rounded border border-amber-400/40 text-amber-300 hover:bg-amber-400/20 transition opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
              @click.stop="openDetails(s)"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAILS OVERLAY -->
    <teleport to="body">
      <div v-if="show" class="fixed inset-0 z-[9999] flex">
        <div
          ref="panel"
          class="w-[30vw] min-w-[360px] bg-gradient-to-b from-slate-900 to-black p-6 border-r border-[rgba(255,255,255,0.1)] shadow-2xl"
        >
          <div class="flex justify-between mb-4">
            <h2 class="text-2xl font-bold text-emerald-400">
              {{ active.name }}
            </h2>
            <button class="text-white/60 hover:text-white" @click="close">
              ✕
            </button>
          </div>

          <p class="text-slate-300 mb-5">{{ active.about }}</p>

          <h3 class="text-slate-400 mb-3">Config Files</h3>
          <div class="space-y-2 mb-5">
            <div v-for="c in active.configs" :key="c.file" class="config-row">
              <div class="flex-1">
                <p class="text-emerald-300 font-semibold">{{ c.file }}</p>
                <p class="path-text">{{ c.path }}{{ c.file }}</p>
              </div>
              <div class="flex items-center gap-2">
                <!-- COPY -->
                <div class="relative group">
                  <button
                    class="icon-btn emerald"
                    @click="copy(c.path + c.file)"
                  >
                    <!-- Copy Icon -->
                    <svg viewBox="0 0 24 24" class="icon">
                      <path d="M8 8h11v13H8z" opacity="0.4" />
                      <path d="M5 3h11v13H5z" />
                    </svg>
                  </button>
                  <span class="tooltip">Copy Path</span>
                </div>

                <!-- SSH -->
                <div class="relative group">
                  <button
                    class="icon-btn sky"
                    @click="openViaSSH(c.path + c.file)"
                  >
                    <!-- Terminal Icon -->
                    <svg viewBox="0 0 24 24" class="icon">
                      <path d="M4 5h16v14H4z" opacity="0.3" />
                      <path d="M7 9l3 3-3 3M12 15h5" />
                    </svg>
                  </button>
                  <span class="tooltip">Open via SSH</span>
                </div>

                <!-- COPIED BADGE -->
                <span
                  v-if="copiedText === c.path + c.file"
                  class="copied-badge"
                >
                  Copied!
                </span>
              </div>
            </div>
          </div>

          <h3 class="text-slate-400 mb-2">Logs</h3>
          <div class="config-row mb-5">
            <p class="path-text flex-1">{{ active.logs }}</p>
            <div class="relative group">
              <button class="icon-btn emerald" @click="copy(active.logs)">
                <svg viewBox="0 0 24 24" class="icon">
                  <path d="M8 8h11v13H8z" opacity="0.4" />
                  <path d="M5 3h11v13H5z" />
                </svg>
              </button>
              <span class="tooltip">Copy Log Path</span>
            </div>

            <span v-if="copiedText === active.logs" class="copied-badge"
              >Copied!</span
            >
          </div>

          <div class="flex gap-3 mt-6">
            <a
              v-if="active.url"
              :href="active.url"
              target="_blank"
              class="action-btn emerald"
            >
              Open Dashboard
            </a>
            <button class="action-btn sky" @click="openViaSSH()">
              SSH Node
            </button>
          </div>
        </div>

        <div class="flex-1 bg-black/60" @click="close"></div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import gsap from "gsap";
import infra from "../data/infrastructure.json";

const show = ref(false);
const active = ref({});
const panel = ref(null);

function onServiceClick(s) {
  if (s.url) window.open(s.url, "_blank");
}

function openDetails(s) {
  active.value = s;
  show.value = true;
  nextTick(() => {
    gsap.fromTo(
      panel.value,
      { x: "-100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 0.5, ease: "power4.out" }
    );
    gsap.fromTo(
      ".config-row",
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, delay: 0.15 }
    );
  });
}

function close() {
  show.value = false;
}

function copy(text) {
  navigator.clipboard.writeText(text);
}

function openViaSSH(file = "") {
  const user = active.value.ssh_user || "root";
  const node = active.value.node;
  if (!node) return;
  window.open(
    file ? `ssh://${user}@${node}?cmd=vi ${file}` : `ssh://${user}@${node}`
  );
}
</script>

<style scoped>
.service-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}
.service-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.config-row {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}
.config-row:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.03);
}

.path-text {
  font-family: monospace;
  font-size: 12px;
  color: #94a3b8;
  word-break: break-all;
}

.copy-btn,
.term-btn {
  padding: 4px 8px;
  border-radius: 6px;
  transition: 0.2s;
}
.copy-btn:hover {
  background: rgba(52, 211, 153, 0.2);
  transform: scale(1.2);
}
.term-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  transform: scale(1.2);
}

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  transition: 0.3s;
}
.action-btn.emerald {
  background: rgba(52, 211, 153, 0.2);
  border: 1px solid #34d399;
  color: #6ee7b7;
}
.action-btn.sky {
  background: rgba(56, 189, 248, 0.2);
  border: 1px solid #38bdf8;
  color: #7dd3fc;
}
.action-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}
.service-btn {
  position: relative;
}

.service-btn .group-hover\:opacity-100 {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
/* ICON BUTTON BASE */
.icon-btn {
  padding: 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: all 0.25s ease;
}

/* Emerald (Copy) */
.icon-btn.emerald {
  border-color: rgba(52, 211, 153, 0.4);
  color: #6ee7b7;
}
.icon-btn.emerald:hover {
  background: rgba(52, 211, 153, 0.2);
  transform: scale(1.15);
}

/* Sky (SSH) */
.icon-btn.sky {
  border-color: rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
}
.icon-btn.sky:hover {
  background: rgba(56, 189, 248, 0.2);
  transform: scale(1.15);
}

/* SVG COLOR */
.icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  stroke: currentColor;
}

/* TOOLTIP */
.tooltip {
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%) translateY(6px);
  background: rgba(15, 23, 42, 0.95);
  color: #e5e7eb;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s ease;
  z-index: 50;
}
.group:hover .tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* COPIED BADGE */
.copied-badge {
  font-size: 11px;
  color: #6ee7b7;
  font-weight: 600;
  margin-left: 4px;
  animation: pop 0.35s ease;
}

@keyframes pop {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  60% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
</style>
