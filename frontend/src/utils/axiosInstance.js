import axios from "axios";
// import { VITE_BASE_URL } from "./apiPaths.js";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 60000, // ✅ 15000 → 60000
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    },
});

//* request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//* response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        //* handle common errors globally
        if (error.response) {
            if (error.response.status === 401) {
                //* redirect to login page
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else if (error.response.status === 500) {
                console.error("Server error. Please try again later.");
            }
        } else if (error.code === "ECONNABORTED") {
            console.warn("Request timeout");
            error.message = "Server is taking too long. Please try again.";
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;