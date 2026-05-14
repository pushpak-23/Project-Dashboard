<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b,#020617_55%,#000_100%)] text-slate-100">
    <header class="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.45em] text-sky-300/70">
            Inventory control plane
          </p>
          <h1 class="text-3xl font-black tracking-tight sm:text-4xl">
            Infrastructure Control Plane
          </h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-300">
            Dashboard data now lives in SQLite, and the entry form writes new records straight into the database.
          </p>
        </div>

        <div class="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl shadow-black/30 sm:flex-nowrap">
          <button
            class="rounded-xl px-4 py-2 text-sm font-semibold transition sm:px-5"
            :class="activeView === 'dashboard' ? 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/20' : 'text-slate-300 hover:text-white'"
            @click="activeView = 'dashboard'"
          >
            Dashboard
          </button>
          <button
            class="rounded-xl px-4 py-2 text-sm font-semibold transition sm:px-5"
            :class="activeView === 'entry' ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20' : 'text-slate-300 hover:text-white'"
            @click="activeView = 'entry'"
          >
            Add Entry
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-screen-2xl px-4 pb-8 sm:px-6 lg:px-8">
      <Dashboard v-if="activeView === 'dashboard'" />
      <EntryForm v-else @saved="activeView = 'dashboard'" />
    </main>
  </div>
</template>
<script setup>
import { ref } from "vue";
import Dashboard from "./views/Dashboard.vue";
import EntryForm from "./components/EntryForm.vue";

const activeView = ref("dashboard");
</script>
