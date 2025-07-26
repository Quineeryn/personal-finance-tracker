import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/transactions';

const getAuthHeaders = (token) => {
  return { headers: { 'x-access-token': token } };
};

const getTransactions = (token) => {
  return axios.get(API_URL, getAuthHeaders(token));
};

export default {
  getTransactions,
};