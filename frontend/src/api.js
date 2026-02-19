import axios from 'axios';

// In Docker, nginx proxies /api to the backend.
// In development, you can set REACT_APP_API_URL to http://localhost:8000
const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
    baseURL: `${API_BASE}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Auth ─────────────────────────────────────────────

export const login = (username, password) =>
    api.post('/token/', { username, password });

export const refreshToken = (refresh) =>
    api.post('/token/refresh/', { refresh });

// ── Tickets ──────────────────────────────────────────

export const getTickets = (params = {}) => api.get('/tickets/', { params });

export const createTicket = (data) => api.post('/tickets/', data);

export const updateTicket = (id, data) => api.patch(`/tickets/${id}/`, data);

export const deleteTicket = (id) => api.delete(`/tickets/${id}/`);

// ── Stats ────────────────────────────────────────────

export const getStats = () => api.get('/tickets/stats/');

// ── LLM Classification ──────────────────────────────

export const classifyTicket = (description) =>
    api.post('/tickets/classify/', { description });

export default api;
