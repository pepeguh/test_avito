import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

const API_URL = "http://localhost:3001/api/v1";

export const fetchAds = async (params = {}) => {
  const response = await axios.get(`${API_URL}/ads`, { params });
  return response.data; 
};

export const getAd = async (id) => {
  const response = await apiClient.get(`/ads/${id}`);
  return response.data;
};

export const approveAd = async (id) => {
  const response = await apiClient.post(`/ads/${id}/approve`);
  return response.data;
};

export const rejectAd = async (id, { reason, comment }) => {
  const response = await apiClient.post(`/ads/${id}/reject`, { reason, comment });
  return response.data;
};

export const requestChanges = async (id, { reason, comment }) => {
  const response = await apiClient.post(`/ads/${id}/request-changes`, {
    reason,
    comment,
  });
  return response.data;
};

export async function fetchSummary(period = "week") {
  const res = await apiClient.get(`/stats/summary`, { params: { period } });
  return res.data;
}

export async function fetchActivity(period = "week") {
  const res = await apiClient.get(`/stats/chart/activity`, { params: { period } });
  return res.data;
}

export async function fetchDecisions(period = "week") {
  const res = await apiClient.get(`/stats/chart/decisions`, { params: { period } });
  return res.data;
}

export async function fetchCategories(period = "week") {
  const res = await apiClient.get(`/stats/chart/categories`, { params: { period } });
  return res.data;
}