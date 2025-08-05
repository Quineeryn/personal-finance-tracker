// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function AuthProvider({ children }) {
  // Ambil user dari localStorage, parse dari JSON
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const token = user?.accessToken; // Ambil token dari objek user

  useEffect(() => {
    if (user) {
      // Simpan seluruh objek user sebagai string JSON
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const valueToShare = { user, token, login, logout };

  return (
    <AuthContext.Provider value={valueToShare}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };