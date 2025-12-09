import axios from "axios";

// 1. Create the instance
const api = axios.create({
  baseURL: "http://localhost:8080", // Adjust port if needed
  withCredentials: true, // IMPORTANT: Allows sending Cookies (JSESSIONID) to backend
});

// 2. Add a Request Interceptor
// This runs BEFORE every request is sent
api.interceptors.request.use(
  (config) => {
    // Check if you have a token in localStorage
    // (Replace 'token' with whatever key you used to save it, e.g., 'authToken', 'jwt')
    const token = localStorage.getItem("token"); 

    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Add a Response Interceptor (Optional but helpful)
// This runs AFTER every response. Good for catching 401/403 globally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout if token is expired or invalid
      // localStorage.clear();
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;