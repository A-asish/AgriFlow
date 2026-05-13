import axios from "axios";
const API_URL = import.meta.env.VITE_API_BASE_URL || "/api/";
console.log("🔵 API initialized with baseURL:", API_URL);
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});
let requestCount = 0;
let isRedirecting = false;
api.interceptors.request.use((config) => {
    requestCount++;
    console.log(`📤 [Request #${requestCount}] ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`   Token present: ${!!localStorage.getItem("access_token")}`);
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
});
api.interceptors.response.use((response) => {
    console.log(`📥 [Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
}, async (error) => {
    console.error(`⚠️ [Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`);
    const originalRequest = error.config;
    if (error.response?.status !== 401) {
        return Promise.reject(error);
    }
    if (originalRequest._retry) {
        console.log("🚨 Already retried this request, redirecting to login");
        if (!isRedirecting) {
            isRedirecting = true;
            localStorage.clear();
            window.location.href = "/auth";
        }
        return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
        const refresh = localStorage.getItem("refresh_token");
        console.log(`🔄 Attempting token refresh. Refresh token present: ${!!refresh}`);
        if (!refresh) {
            console.log("❌ No refresh token, redirecting to login");
            if (!isRedirecting) {
                isRedirecting = true;
                localStorage.clear();
                window.location.href = "/auth";
            }
            return Promise.reject(error);
        }
        const response = await axios.post(`${API_URL}auth/token/refresh/`, { refresh });
        if (response.data.access) {
            console.log("✅ Token refresh successful");
            localStorage.setItem("access_token", response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return api(originalRequest);
        }
        throw new Error("Refresh failed");
    }
    catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        if (!isRedirecting) {
            isRedirecting = true;
            localStorage.clear();
            window.location.href = "/auth";
        }
        return Promise.reject(refreshError);
    }
});
var stdin_default = api;
export { stdin_default as default };
