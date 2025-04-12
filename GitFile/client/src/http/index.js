// ======= CLIENT SIDE (api.js) =======
import axios from "axios";

// ✅ Axios instance with only basic settings
const api = axios.create({
  baseURL: "https://mer-nproject-gamma.vercel.app/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Auth API functions (no token handling)
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
