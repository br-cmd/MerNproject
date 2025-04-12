// ======= CLIENT SIDE (api.js) =======
import axios from "axios";

const api = axios.create({
  baseURL: "https://mer-nproject-gamma.vercel.app/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auth API's
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getUser = () => api.get("/user/get-user");
export const logout = () => api.get("/auth/logout");

// Job API's
export const getJobs = () => api.get("/job/get-jobs");
export const addJob = (data) => api.post("/job/create-job", data);
export const deleteJob = (data) => api.delete(`/job/delete-job/${data}`);
export const filterJobs = (params) =>
  api.get(
    `/job/get-jobs?page=${params.page}&status=${params.status}&workType=${params.workType}&sort=${params.sort}&search=${params.search}`
  );

// Response Interceptor for Refreshing Token
api.interceptors.response.use(
  (config) => config,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      try {
        await axios.get(
          "https://mer-nproject-gamma.vercel.app/api/v1/auth/refresh",
          { withCredentials: true }
        );
        return api.request(originalRequest);
      } catch (e) {
        console.log("Token refresh failed", e.message);
      }
    }
    throw error;
  }
);

export default api;
