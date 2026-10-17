import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
});

export const getMuseums = () => api.get("/museums").then((r) => r.data);
export const getRoutes = () => api.get("/routes").then((r) => r.data);
export const getEvaluations = () => api.get("/evaluations").then((r) => r.data);
export const getEvaluationStats = () => api.get("/evaluations/stats").then((r) => r.data);
export const postEvaluation = (payload) => api.post("/evaluations", payload).then((r) => r.data);

export default api;
