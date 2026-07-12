import axios from 'axios';
import { isUserAuthorized } from './repoPermissions';

const api = axios.create({
  baseURL: 'http://localhost:5200/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

function getStoredUserRole(): string {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      return '';
    }

    const parsedUser = JSON.parse(rawUser);
    return parsedUser?.role || parsedUser?.Role || '';
  } catch {
    return '';
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  const userRole = getStoredUserRole();
  const isAuthRequest = config.url?.includes('/auth/');

  if (isAuthRequest) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  if (userEmail && !isUserAuthorized(userEmail, userRole)) {
    return Promise.reject(new Error('User not authorized'));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

export const uploadReconciliationFile = async (formData: FormData): Promise<{ blob: Blob, criticalCount: number }> => {
  const response = await api.post('/Reconciliation/compare', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob', // Important for file download
  });
  
  const criticalCountStr = response.headers['x-critical-alerts-count'];
  const criticalCount = criticalCountStr ? parseInt(criticalCountStr, 10) : 0;
  
  return { blob: response.data, criticalCount };
};
