import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import instance from "../api/api";
import {
  getAuthStateFromToken,
  initialAuthState,
} from "../auth/tokenClaims";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "../auth/tokenStorage";
import {
  clearAuthService,
  registerAuthService,
} from "../auth/authService";

const AuthContext = createContext(initialAuthState);

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialAuthState);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const applyAccessToken = useCallback((token) => {
    try {
      const nextAuthState = getAuthStateFromToken(token);
      setAuthState(nextAuthState);
      return nextAuthState.isLoggedIn;
    } catch (e) {
      console.error("Token decode failed:", e);
      setAuthState(initialAuthState);
    }
    return false;
  }, []);

  const logout = useCallback(async (callBackend = true) => {
    clearStoredAccessToken();
    setAuthState(initialAuthState);

    if (callBackend) {
      try {
        await instance.delete("/auth/logout");
      } catch (e) {
        console.warn("Backend logout failed:", e);
      }
    }
    navigate("/login", { replace: true });
  }, [navigate]);

  const login = useCallback((accessToken) => {
    if (applyAccessToken(accessToken)) {
      setStoredAccessToken(accessToken);
    } else {
      logout(false);
    }
  }, [applyAccessToken, logout]);

  const updateToken = useCallback((accessToken) => {
    if (applyAccessToken(accessToken)) {
      setStoredAccessToken(accessToken);
      return true;
    }

    clearStoredAccessToken();
    return false;
  }, [applyAccessToken]);

  useEffect(() => {
    registerAuthService({ logout, updateToken });
    return () => {
      clearAuthService();
    };
  }, [logout, updateToken]);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (token) {
      applyAccessToken(token);
    }
    setLoading(false);
  }, [applyAccessToken]);

  return (
    <AuthContext.Provider
      value={{ authState, login, logout, updateToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => useContext(AuthContext);
