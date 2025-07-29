import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL; // URL Backend kita

const login = (email, password) => {
  return axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
    email,
    password,
  });
};

const register = (name, email, password) => {
  return axios.post(`${API_BASE_URL}/api/v1/auth/register`, {
    name,
    email,
    password
  });
}

// Nanti kita tambahkan fungsi register, dll di sini

export default {
  login,
  register
};