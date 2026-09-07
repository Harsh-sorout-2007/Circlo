import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        // Broadcast custom event so AuthContext can hear it, or simply redirect.
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;