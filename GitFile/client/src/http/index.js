// ======= CLIENT SIDE (api.js) =======
import axios from "axios";

// ✅ Create an axios instance with proper settings
const api = axios.create({
  baseURL: "https://mer-nproject-gamma.vercel.app/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Request Interceptor to attach Access Token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor to handle 401 and refresh token
api.interceptors.response.use(
  (response) => response, // Successful response passthrough
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;

      try {
        // ✅ Call refresh endpoint using the same baseURL
        const refreshResponse = await api.get("/auth/refresh");

        const newAccessToken = refreshResponse.data?.accessToken;
        if (newAccessToken) {
          // ✅ Save the new token and retry the original request
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }

        console.warn("Refresh endpoint did not return new access token");
        return Promise.reject(error);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError.message);
        // Optional: redirect to login
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Auth API functions
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getUser = () => api.get("/user/get-user");
export const logout = () => api.get("/auth/logout");

// ✅ Job API functions
export const getJobs = () => api.get("/job/get-jobs");
export const addJob = (data) => api.post("/job/create-job", data);
export const deleteJob = (id) => api.delete(`/job/delete-job/${id}`);
export const filterJobs = (params) =>
  api.get(
    `/job/get-jobs?page=${params.page}&status=${params.status}&workType=${params.workType}&sort=${params.sort}&search=${params.search}`
  );

export default api;
