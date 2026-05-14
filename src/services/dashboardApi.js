const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function fetchDashboardResource(resource) {
  return request(`/api/resources/${resource}`);
}

export function createDashboardEntry(payload) {
  return request("/api/entries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshDashboardData() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("dashboard-data-changed"));
}