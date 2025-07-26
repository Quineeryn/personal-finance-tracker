import axios from 'axios';

const API_URL = 'import.meta.env.VITE_API_URL'; // URL Backend kita

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