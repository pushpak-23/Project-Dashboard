<template>
  <section class="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
    <div class="mb-6 flex flex-col gap-3 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-emerald-300/70">Database entry form</p>
        <h2 class="text-3xl font-black text-white">Add a new record</h2>
        <p class="mt-2 max-w-3xl text-sm text-slate-300">
          Use the common fields for quick entries. Anything extra can go into the JSON metadata block and will be stored with the record.
        </p>
      </div>
      <div v-if="message" class="rounded-2xl border px-4 py-3 text-sm" :class="messageType === 'error' ? 'border-red-400/40 bg-red-400/10 text-red-200' : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'">
        {{ message }}
      </div>
    </div>

    <form class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" @submit.prevent="submitForm">
      <div class="grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="field">
            <span>Dataset</span>
            <select v-model="form.resource">
              <option v-for="option in resourceOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>

          <label class="field">
            <span>Record type</span>
            <select v-model="form.kind">
              <option v-for="option in kindOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>

          <label class="field">
            <span>Name</span>
            <input v-model="form.name" type="text" placeholder="New service name" />
          </label>

          <label class="field">
            <span>URL</span>
            <input v-model="form.url" type="url" placeholder="https://example.local" />
          </label>

          <label class="field sm:col-span-2">
            <span>Description</span>
            <input v-model="form.description" type="text" placeholder="Short descriptive label" />
          </label>

          <label class="field">
            <span>Icon</span>
            <input v-model="form.icon" type="text" placeholder="grafana, kubernetes, vault" />
          </label>

          <label class="field">
            <span>Logo</span>
            <input v-model="form.logo" type="text" placeholder="Optional alternate logo name" />
          </label>

          <label class="field">
            <span>Collection</span>
            <input v-model="form.collection" type="text" :placeholder="collectionPlaceholder" />
          </label>

          <label class="field">
            <span>Parent name</span>
            <input v-model="form.parentName" type="text" placeholder="Optional group or platform name" />
          </label>
        </div>

        <label class="field">
          <span>Metadata JSON</span>
          <textarea
            v-model="form.metadataJson"
            rows="10"
            spellcheck="false"
            placeholder='{"configs":[{"file":"config.yml","path":"/configs/config.yml"}]}'
          ></textarea>
        </label>
      </div>

      <div class="grid content-start gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
        <div class="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm text-sky-100">
          <p class="font-semibold text-sky-200">Preview payload</p>
          <pre class="mt-3 overflow-auto whitespace-pre-wrap text-xs text-sky-50/90">{{ previewPayload }}</pre>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p class="font-semibold text-white">Tips</p>
          <ul class="mt-2 space-y-2">
            <li>• Leave fields blank if a section does not use them.</li>
            <li>• Put nested arrays like configs, children, or details in metadata JSON.</li>
            <li>• Saving dispatches a refresh so the dashboard updates immediately.</li>
          </ul>
        </div>

        <button
          class="rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:scale-[1.01] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="saving"
          type="submit"
        >
          {{ saving ? "Saving..." : "Save entry" }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { createDashboardEntry, refreshDashboardData } from "../services/dashboardApi";

const emit = defineEmits(["saved"]);

const resourceOptions = [
  "applications",
  "leftsidebar",
  "rightsidebar",
  "infrastructure",
  "platform",
  "software",
  "hardware",
];

const kindOptionsByResource = {
  applications: ["application"],
  leftsidebar: ["group", "child"],
  rightsidebar: ["group", "child"],
  infrastructure: ["service"],
  platform: ["platform", "cluster"],
  software: ["software", "service"],
  hardware: ["device"],
};

const form = reactive({
  resource: "applications",
  kind: "application",
  collection: "",
  parentName: "",
  name: "",
  url: "",
  description: "",
  icon: "",
  logo: "",
  metadataJson: "{}",
});

const saving = ref(false);
const message = ref("");
const messageType = ref("success");

const kindOptions = computed(() => kindOptionsByResource[form.resource] ?? ["entry"]);

const collectionPlaceholder = computed(() => {
  if (form.resource === "hardware") {
    return "compute, storage, or network";
  }

  if (form.resource === "infrastructure") {
    return "openstack or ceph";
  }

  return "Optional collection or group label";
});

const previewPayload = computed(() => {
  try {
    return JSON.stringify(buildRequestPayload(), null, 2);
  } catch {
    return "Invalid JSON metadata";
  }
});

watch(
  () => form.resource,
  (resource) => {
    const nextKind = kindOptionsByResource[resource]?.[0] ?? "entry";
    form.kind = nextKind;
    if (resource === "hardware" && !form.collection) {
      form.collection = "compute";
    }
  },
  { immediate: true }
);

function buildRequestPayload() {
  let metadata = {};

  if (form.metadataJson.trim()) {
    metadata = JSON.parse(form.metadataJson);
  }

  return {
    resource: form.resource.trim(),
    kind: form.kind.trim(),
    collection: form.collection.trim(),
    parentName: form.parentName.trim(),
    name: form.name.trim(),
    url: form.url.trim(),
    description: form.description.trim(),
    icon: form.icon.trim(),
    logo: form.logo.trim(),
    metadata,
  };
}

async function submitForm() {
  message.value = "";

  if (!form.name.trim()) {
    messageType.value = "error";
    message.value = "Name is required.";
    return;
  }

  let payload;

  try {
    payload = buildRequestPayload();
  } catch {
    messageType.value = "error";
    message.value = "Metadata JSON must be valid JSON.";
    return;
  }

  saving.value = true;

  try {
    await createDashboardEntry(payload);
    refreshDashboardData();
    messageType.value = "success";
    message.value = "Entry saved successfully.";
    emit("saved");
  } catch (caughtError) {
    messageType.value = "error";
    message.value = caughtError instanceof Error ? caughtError.message : "Failed to save entry.";
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.field {
  display: grid;
  gap: 0.45rem;
}

.field span {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.85);
}

.field input,
.field select,
.field textarea {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(2, 6, 23, 0.75);
  padding: 0.9rem 1rem;
  color: #e2e8f0;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: rgba(56, 189, 248, 0.85);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.field textarea {
  min-height: 14rem;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
</style>