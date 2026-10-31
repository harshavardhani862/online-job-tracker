import axios from "axios";

/**
 * Vercel build environment:
 * VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com/api
 *
 * The normalizer also accepts the backend origin without /api and appends it,
 * preventing Spring from receiving /reminders instead of /api/reminders.
 */
function getApiBaseUrl(): string {
  const configuredUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  const rawUrl =
    configuredUrl || "https://online-job-tracker-backend.onrender.com/api";

  const normalized = rawUrl.replace(/\/+$/, "");
  return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Attach the JWT token to protected requests.
api.interceptors.request.use(
  (config) => {
    const url = config.url ?? "";

    if (!url.includes("/auth/")) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors consistently.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    console.error("API request failed:", {
      baseURL: error.config?.baseURL,
      url,
      status,
      message: error.message,
      response: error.response?.data,
    });

    if (status === 401 && !url.includes("/auth/")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/signin") {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
