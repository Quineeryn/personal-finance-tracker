import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function AuthProvider({ children }) {
  // Coba ambil token dari localStorage saat pertama kali dijalankan
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // Efek ini akan berjalan setiap kali 'token' berubah
  useEffect(() => {
    if (token) {
      // Jika ada token, simpan di localStorage
      localStorage.setItem('authToken', token);
    } else {
      // Jika tidak ada token (saat logout), hapus dari localStorage
      localStorage.removeItem('authToken');
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  const valueToShare = {
    token,
    login, 
    logout,
  };

  return (
    <AuthContext.Provider value={valueToShare}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };