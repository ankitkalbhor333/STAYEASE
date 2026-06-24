<<<<<<< HEAD
﻿import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export default api;
=======
import axios from "axios";  

const api=axios.create({
  baseURL: "http://localhost:8000/api",
})
console.log("API base URL:", api);

export default api;
>>>>>>> 01bb6bd (frontend)
