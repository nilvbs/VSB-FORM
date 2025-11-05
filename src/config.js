// API Configuration
// This file helps manage different API URLs for development and production

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  saveToSharePoint: `${API_BASE_URL}/api/saveToSharePoint`,
  downloadCSV: `${API_BASE_URL}/api/download-csv`,
  viewData: `${API_BASE_URL}/api/view-data`,
  health: `${API_BASE_URL}/api/health`,
};

export default API_ENDPOINTS;

