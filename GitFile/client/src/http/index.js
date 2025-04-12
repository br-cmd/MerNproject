// ======= CLIENT SIDE (api.js) =======
import axios from "axios";

const api = axios.create({
  baseURL: "https://mer-nproject-gamma.vercel.app/api/v1", // ✅ baseURL is correct
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Request Interceptor to Add Access Token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); // Assuming you store it here
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`; // Add Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Auth API's
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getUser = () => api.get("/user/get-user");
export const logout = () => api.get("/auth/logout");

// ✅ Job API's
export const getJobs = () => api.get("/job/get-jobs");
export const addJob = (data) => api.post("/job/create-job", data);
export const deleteJob = (id) => api.delete(`/job/delete-job/${id}`);
export const filterJobs = (params) =>
  api.get(
    `/job/get-jobs?page=${params.page}&status=${params.status}&workType=${params.workType}&sort=${params.sort}&search=${params.search}`
  );

// ✅ Response Interceptor for Refreshing Token
api.interceptors.response.use(
  (response) => response, // ✅ Pass through successful responses
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      try {
        const refreshResponse = await axios.get(
          "/auth/refresh", // 🛠️ Use the API instance's baseURL
          { withCredentials: true }
        );

        // Assuming your server returns a new accessToken in the response data
        const newAccessToken = refreshResponse.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken); // Update stored token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // Retry with new token
          return api.request(originalRequest);
        } else {
          // Handle the case where refresh doesn't return a new token (e.g., logout)
          console.log("Token refresh failed: No new access token received");
          // Optionally, redirect to login
          // window.location.href = '/login';
          return Promise.reject(error); // Re-throw the error
        }
      } catch (refreshError) {
        console.log("Token refresh failed:", refreshError.message);
        // Optionally, redirect to login on refresh failure
        // window.location.href = '/login';
        return Promise.reject(refreshError); // Re-throw the refresh error
      }
    }

    throw error; // Re-throw other errors
  }
);

export default api;
