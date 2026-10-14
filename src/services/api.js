
import axios from "axios";

const serverUrl = import.meta.env.VITE_API_URL
  || "http://localhost:8080";

const baseUrl = serverUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const API = axios.create({
  baseURL: `${baseUrl}/api`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (config.data && typeof config.data === "object") {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default API;
