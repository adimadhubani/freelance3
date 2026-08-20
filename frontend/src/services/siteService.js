import api from './api';

export const getClientProfile = async () => {
  const response = await api.get('/client/profile');
  return response.data;
};

export const getClientSites = async () => {
  const response = await api.get('/client/sites');
  return response.data;
};

export const getSiteDashboard = async (siteId) => {
  const response = await api.get(`/client/sites/${siteId}/dashboard`);
  return response.data;
};

// Admin Services (using multipart/form-data for file uploads)
export const createClient = async (formData) => {
  const response = await api.post('/admin/clients', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createSite = async (siteData) => {
  const response = await api.post('/admin/sites', siteData);
  return response.data;
};

export const uploadMonthlyData = async (formData) => {
  const response = await api.post('/admin/monthly-data', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadFinalProduct = async (formData) => {
  const response = await api.post('/admin/final-product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
