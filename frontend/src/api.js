import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
});

export const getMuseums = () => api.get("/museums").then((r) => r.data);
export const getRoutes = () => api.get("/routes").then((r) => r.data);
export const getEvaluations = () => api.get("/evaluations").then((r) => r.data);
export const getEvaluationStats = () => api.get("/evaluations/stats").then((r) => r.data);
export const postEvaluation = (payload) => api.post("/evaluations", payload).then((r) => r.data);

// Admin
const authApi = axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
    withCredentials: true,
});
export const loginAdmin = (email, password) => authApi.post("/auth/login", { email, password }).then((r) => r.data);
export const logoutAdmin = () => authApi.post("/auth/logout").then((r) => r.data);
export const getMe = () => authApi.get("/auth/me").then((r) => r.data);
export const uploadMuseumImage = (slug, formData) =>
    authApi.post(`/admin/museums/${slug}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
export const deleteMuseumImage = (slug, url) =>
    authApi.delete(`/admin/museums/${slug}/images`, { params: { url } }).then((r) => r.data);

// Audio guías
export const getAudioPrice = (routeId) => api.get(`/audioguides/${routeId}/price`).then((r) => r.data);
export const unlockAudioGuide = (routeId, code) => api.post("/audioguides/unlock", { route_id: routeId, code }).then((r) => r.data);
export const getAdminAudioguides = () => authApi.get("/admin/audioguides").then((r) => r.data);
export const uploadAudioguide = (routeId, formData) =>
    authApi.post(`/admin/audioguides/${routeId}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
export const deleteAudioguide = (routeId) => authApi.delete(`/admin/audioguides/${routeId}`).then((r) => r.data);

export default api;
