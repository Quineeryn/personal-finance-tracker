import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/auth'; // URL Backend kita

const login = (email, password) => {
  return axios.post(`${API_URL}/login`, {
    email,
    password,
  });
};

// Nanti kita tambahkan fungsi register, dll di sini

export default {
  login,
};