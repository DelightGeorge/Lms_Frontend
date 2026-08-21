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
      // Was there actually a session to expire? A first-time visitor (or anyone
      // simply not logged in) will hit 401 on protected routes too — that's not
      // an "expired session", it's just an anonymous request. Only treat it as
      // a real expiry if we had a token that the server just rejected.
      const hadToken = !!localStorage.getItem("token");

      // Clear stale credentials immediately
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (hadToken) {
        // Fire a global event so AuthContext can show the session-expired modal
        // instead of doing a hard redirect with no explanation
        window.dispatchEvent(new CustomEvent("session:expired"));
      } else {
        // Guest/anonymous 401 — let whichever screen made the call handle it
        // quietly (e.g. treat as logged-out, no modal, no interruption)
        window.dispatchEvent(new CustomEvent("auth:required"));
      }
    }

    return Promise.reject(error);
  }
);

export default API;