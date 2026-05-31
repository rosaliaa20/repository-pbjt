import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { toast } from "react-hot-toast";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

// ==========================================
// AXIOS GLOBAL INTERCEPTORS
// ==========================================
// 1. Request Interceptor: Otomatis tambahkan Token JWT ke Header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Otomatis logout jika token kadaluarsa (401)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hanya tampilkan alert jika user sebelumnya login
      if (localStorage.getItem("token")) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      toast(
        (t) => (
          <span>
            Versi baru tersedia.{" "}
            <button
              className="font-semibold underline"
              onClick={() => {
                updateSW();
                toast.dismiss(t.id);
              }}
            >
              Muat ulang
            </button>
          </span>
        ),
        {
          duration: Infinity,
        },
      );
    },
    onOfflineReady() {
      toast.success("Aplikasi sekarang bisa digunakan offline.");
    },
  });
} else if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}
