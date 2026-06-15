import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5184/api', // Matches the .NET backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
