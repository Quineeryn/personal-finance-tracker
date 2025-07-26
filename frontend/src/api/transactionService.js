import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = (token) => {
  return { headers: { 'x-access-token': token } };
};

const getTransactions = (token) => {
  return axios.get(API_URL, getAuthHeaders(token));
};

export default {
  getTransactions,
};