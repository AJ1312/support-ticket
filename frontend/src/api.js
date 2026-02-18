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

// ── Tickets ──────────────────────────────────────────

export const getTickets = (params = {}) => api.get('/tickets/', { params });

export const createTicket = (data) => api.post('/tickets/', data);

export const updateTicket = (id, data) => api.patch(`/tickets/${id}/`, data);

// ── Stats ────────────────────────────────────────────

export const getStats = () => api.get('/tickets/stats/');

// ── LLM Classification ──────────────────────────────

export const classifyTicket = (description) =>
    api.post('/tickets/classify/', { description });

export default api;
