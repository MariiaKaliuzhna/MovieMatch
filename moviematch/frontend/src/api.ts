import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (userId) config.headers['x-user-id'] = userId;
  return config;
});

export default api;
