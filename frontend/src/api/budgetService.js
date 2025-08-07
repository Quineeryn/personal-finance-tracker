import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = (token) => {
  return { headers: { 'x-access-token': token } };
};

const getBudgets = (token) => {
  return axios.get(`${API_BASE_URL}/api/v1/budgets`, getAuthHeaders(token));
};

const createBudget = (token, budgetData) => {
  return axios.post(`${API_BASE_URL}/api/v1/budgets`, budgetData, getAuthHeaders(token));
};

const updateBudget = (token, id, budgetData) => {
  return axios.put(`${API_BASE_URL}/api/v1/budgets/${id}`, budgetData, getAuthHeaders(token));
};

const deleteBudget = (token, id) => {
  return axios.delete(`${API_BASE_URL}/api/v1/budgets/${id}`, getAuthHeaders(token));
};

export default {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};