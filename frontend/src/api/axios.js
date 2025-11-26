// frontend/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 5000, // fail fast if backend doesn't respond
});

// helpful: log network errors globally (optional)
api.interceptors.response.use(
  r => r,
  err => {
    console.warn('API error:', err?.message || err);
    return Promise.reject(err);
  }
);

export default api;
