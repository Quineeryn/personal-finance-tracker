import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = (token) => {
  return { headers: { 'x-access-token': token } };
};

const getTransactions = (token) => {
  return axios.get(`${API_BASE_URL}/api/v1/transactions`, getAuthHeaders(token));
};

const createTransaction = (token, transactionData) => {
  return axios.post(`${API_BASE_URL}/api/v1/transactions`, transactionData, getAuthHeaders(token));
}

export default {
  getTransactions,
  createTransaction,
};