import api from './api';

// ─── Client Service ───────────────────────────────────────────────────────────

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

// ─── Admin – Create (multipart/form-data) ────────────────────────────────────

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

// ─── Admin – Client CRUD ──────────────────────────────────────────────────────

export const getAllClients = async () => {
  const response = await api.get('/admin/clients');
  return response.data;
};

export const getClientById = async (clientId) => {
  const response = await api.get(`/admin/clients/${clientId}`);
  return response.data;
};

export const updateClient = async (clientId, data) => {
  const response = await api.put(`/admin/clients/${clientId}`, data);
  return response.data;
};

export const updateClientPassword = async (clientId, newPassword) => {
  const response = await api.put(`/admin/clients/${clientId}/password`, { newPassword });
  return response.data;
};

export const deleteClient = async (clientId) => {
  const response = await api.delete(`/admin/clients/${clientId}`);
  return response.data;
};

// ─── Admin – Site CRUD ────────────────────────────────────────────────────────

export const getAllSites = async () => {
  const response = await api.get('/admin/sites');
  return response.data;
};

export const getSiteById = async (siteId) => {
  const response = await api.get(`/admin/sites/${siteId}`);
  return response.data;
};

export const updateSite = async (siteId, data) => {
  const response = await api.put(`/admin/sites/${siteId}`, data);
  return response.data;
};

export const deleteSite = async (siteId) => {
  const response = await api.delete(`/admin/sites/${siteId}`);
  return response.data;
};

// ─── Admin – Monthly Update CRUD ─────────────────────────────────────────────

export const getAllMonthlyUpdates = async () => {
  const response = await api.get('/admin/monthly-updates');
  return response.data;
};

export const updateMonthlyUpdate = async (updateId, data) => {
  const response = await api.put(`/admin/monthly-updates/${updateId}`, data);
  return response.data;
};

export const deleteMonthlyUpdate = async (updateId) => {
  const response = await api.delete(`/admin/monthly-updates/${updateId}`);
  return response.data;
};

// ─── Admin – Final Product CRUD ───────────────────────────────────────────────

export const getAllFinalProducts = async () => {
  const response = await api.get('/admin/final-products');
  return response.data;
};

export const updateFinalProduct = async (productId, data) => {
  const response = await api.put(`/admin/final-products/${productId}`, data);
  return response.data;
};

export const deleteFinalProduct = async (productId) => {
  const response = await api.delete(`/admin/final-products/${productId}`);
  return response.data;
};
