import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null, // 'hr' | 'employee' | null
    employeeId: null,
    companyName: null,
    companyCode: null,
  });

  const login = ({ role, employeeId, companyName, companyCode }) => {
    setAuth({
      isAuthenticated: true,
      role,
      employeeId: employeeId || null,
      companyName: companyName || null,
      companyCode: companyCode || null,
    });
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      role: null,
      employeeId: null,
      companyName: null,
      companyCode: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// This hook intentionally shares the context module with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
