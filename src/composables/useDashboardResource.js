import { onBeforeUnmount, onMounted, ref } from "vue";
import { fetchDashboardResource } from "../services/dashboardApi";

export function useDashboardResource(resource, fallbackValue) {
  const data = ref(fallbackValue);
  const loading = ref(true);
  const error = ref("");

  async function load() {
    loading.value = true;
    error.value = "";

    try {
      data.value = await fetchDashboardResource(resource);
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError);
      data.value = fallbackValue;
    } finally {
      loading.value = false;
    }
  }

  function handleRefresh() {
    load();
  }

  onMounted(() => {
    load();
    window.addEventListener("dashboard-data-changed", handleRefresh);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("dashboard-data-changed", handleRefresh);
  });

  return {
    data,
    loading,
    error,
    reload: load,
  };
}