import { createContext, useState } from 'react';

// 1. Buat Context-nya
const AuthContext = createContext();

// 2. Buat Provider-nya (Komponen yang akan menyediakan data)
function AuthProvider({ children }) {
  const [token, setToken] = useState(null); // State untuk menyimpan token

  // Nilai yang akan dibagikan ke seluruh aplikasi
  const valueToShare = {
    token,
    setToken,
  };

  return (
    <AuthContext.Provider value={valueToShare}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Export Context dan Provider
export { AuthContext, AuthProvider };