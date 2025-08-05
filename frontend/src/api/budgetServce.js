import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = (token) => {
  return { headers: { 'x-access-token': token } };
};

const getBudgets = (token) => {
  return axios.get(`${API_BASE_URL}/api/v1/budgets`, getAuthHeaders(token));
};

export default {
  getBudgets,
};