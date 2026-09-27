import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, getMe } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }
    setLoadingUser(true);
    getMe()
      .then(setUser)
      .catch(() => {
        // Token is present but no longer valid (expired, user deactivated) —
        // treat this exactly like a logout rather than leaving a broken half-state.
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoadingUser(false));
  }, [token]);

  async function login(email, password) {
    const data = await apiLogin(email, password);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loadingUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}