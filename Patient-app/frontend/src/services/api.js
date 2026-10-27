import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login    = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe    = ()     => API.get('/auth/me');

// ── Patients ──────────────────────────────────────────────────────────────────
export const getPatients   = (params) => API.get('/patients', { params });
export const getPatient    = (id)     => API.get(`/patients/${id}`);
export const createPatient = (data)   => API.post('/patients', data);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id)     => API.delete(`/patients/${id}`);

// ── Consultations ─────────────────────────────────────────────────────────────
export const getConsultations   = (params) => API.get('/consultations', { params });
export const createConsultation = (data)   => API.post('/consultations', data);
export const updateConsultation = (id, data) => API.put(`/consultations/${id}`, data);
export const deleteConsultation = (id)     => API.delete(`/consultations/${id}`);

// ── Rendez-vous ───────────────────────────────────────────────────────────────
export const getRendezVous   = (params) => API.get('/rendez-vous', { params });
export const createRendezVous = (data)  => API.post('/rendez-vous', data);
export const updateRendezVous = (id, data) => API.put(`/rendez-vous/${id}`, data);
export const deleteRendezVous = (id)    => API.delete(`/rendez-vous/${id}`);

// ── Ordonnances ───────────────────────────────────────────────────────────────
export const getOrdonnances   = (params) => API.get('/ordonnances', { params });
export const createOrdonnance = (data)   => API.post('/ordonnances', data);
export const deleteOrdonnance = (id)     => API.delete(`/ordonnances/${id}`);

// ── Examens ───────────────────────────────────────────────────────────────────
export const getExamens   = (params) => API.get('/examens', { params });
export const createExamen = (data)   => API.post('/examens', data);
export const updateExamen = (id, data) => API.put(`/examens/${id}`, data);

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getDashboardStats = () => API.get('/stats/dashboard');
