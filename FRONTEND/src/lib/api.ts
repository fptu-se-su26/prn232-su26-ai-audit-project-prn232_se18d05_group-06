import axios from 'axios';

// NOTE: Backend (ASP.NET Core) returns JSON field names in camelCase (e.g. productName,
// currentQty, createdAt). Previously this file ran a "normalizeKeys" pass that
// lower-cased every PascalCase letter (turning "productName" into "productname"),
// which broke every UC007 page because the React components were reading
// `item.productName` (undefined) instead of `item.productname`. The interceptor
// now leaves the payload untouched so the camelCase keys match the TypeScript
// types defined in each page.

const api = axios.create({
  baseURL: 'http://localhost:5184/api',
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
