import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

// =========================================================
// REQUEST INTERCEPTOR
// Automatically attach JWT to every API request
// =========================================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// =========================================================
// RESPONSE INTERCEPTOR
// Handle authentication errors globally
// =========================================================

api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {

        // Server responded with 401
        if (error.response?.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Avoid redirect loop if already on login page
            if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/register"
            ) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);


export default api;