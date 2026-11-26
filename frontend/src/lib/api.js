import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname === '');

let API_BASE = isLocalhost 
  ? '' 
  : (import.meta.env.VITE_API_URL || 'https://jane-ai-1.onrender.com');

if (API_BASE && !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
  API_BASE = `https://${API_BASE}`;
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Voice & Real-time Interaction ───────────────────────────
export const voiceChat = (data) => api.post('/voice/chat', data).then(r => r.data);
export const bookAppointmentDirect = (data) => api.post('/voice/book-appointment', data).then(r => r.data);
export const transcribeAudio = (formData) =>
  api.post('/voice/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

// ── Leads ────────────────────────────────────────────────────
export const createLead = (data) => api.post('/leads/new', data).then(r => r.data);
export const getLeads = (params) => api.get('/leads', { params }).then(r => r.data);
export const getLead = (id) => api.get(`/leads/${id}`).then(r => r.data);
export const seedDemoLeads = () => api.post('/leads/demo/seed').then(r => r.data);

// ── Calls ────────────────────────────────────────────────────
export const getCalls = (params) => api.get('/calls', { params }).then(r => r.data);
export const getCallDetail = (id) => api.get(`/calls/${id}`).then(r => r.data);

// ── Dashboard & Courses ──────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats').then(r => r.data);
export const getCourses = () => api.get('/dashboard/courses').then(r => r.data);
export const getAppointments = () => api.get('/dashboard/appointments').then(r => r.data);
export const updateAppointmentStatus = (id, status) =>
  api.put(`/dashboard/appointments/${id}/status`, null, { params: { status } }).then(r => r.data);

// Backward compatibility alias for rm queue
export const getRmQueue = () => api.get('/dashboard/appointments').then(r => ({ queue: r.data }));
export const updateRmStatus = (id, status) => updateAppointmentStatus(id, status);

// ── Health ───────────────────────────────────────────────────
export const getHealth = () => api.get('/health').then(r => r.data);

export default api;
