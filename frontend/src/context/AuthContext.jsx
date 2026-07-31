import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = '/api';
const SESSION_KEY = 'fairlens_auth_session';
const emptyAuth = {
  isAuthenticated: false,
  token: null,
  role: null,
  userId: null,
  name: null,
  email: null,
  employeeId: null,
  companyName: null,
  companyCode: null,
  isChecking: false,
};

const AuthContext = createContext(null);

function readSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    return saved?.token && saved?.role ? { ...emptyAuth, ...saved, isAuthenticated: true, isChecking: true } : emptyAuth;
  } catch {
    return emptyAuth;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readSession);

  useEffect(() => {
    if (!auth.token || !auth.isChecking) return;
    const verifySession = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${auth.token}` } });
        if (!response.ok) throw new Error('Invalid session');
        setAuth(previous => ({ ...previous, isChecking: false }));
      } catch {
        localStorage.removeItem(SESSION_KEY);
        setAuth(emptyAuth);
      }
    };
    verifySession();
  }, [auth.token, auth.isChecking]);

  const login = async ({ email, password, role }) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Authentication failed (${response.status}). Restart the FairLens development server.`);
    }
    const session = {
      isAuthenticated: true,
      token: result.token,
      role: result.user.role,
      userId: result.user.id,
      name: result.user.name,
      email: result.user.email,
      employeeId: result.user.employeeId || null,
      companyName: result.user.companyName || null,
      companyCode: result.user.companyCode || null,
      isChecking: false,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuth(session);
    window.dispatchEvent(new CustomEvent('fairlens:auth-changed', { detail: session }));
    return session;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setAuth(emptyAuth);
    window.dispatchEvent(new CustomEvent('fairlens:auth-changed', { detail: emptyAuth }));
  };

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
