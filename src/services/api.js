// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ── Attach token to every request ─────────────────────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Handle responses globally ─────────────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status     = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isAuthRoute = requestUrl.includes("/auth/");

    if (status === 401 && !isAuthRoute) {
      // Clear stale credentials immediately
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Fire a global event so AuthContext can show the session-expired modal
      // instead of doing a hard redirect with no explanation
      window.dispatchEvent(new CustomEvent("session:expired"));
    }

    return Promise.reject(error);
  }
);

export default API;