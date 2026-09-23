"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { refreshAccessToken } from "@/api/api-client";

interface AuthContextType {
  accessToken: string;
  expirationTime: string;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");

    if (storedToken) {
      setAccessToken(storedToken);
    }

    setLoading(false);

    const handleTokenRefresh = () => {
      setAccessToken(localStorage.getItem("accessToken") || "");
    };
    const handleLogout = () => setAccessToken("");

    window.addEventListener("auth:token-refreshed", handleTokenRefresh);
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:token-refreshed", handleTokenRefresh);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    let expirationTime: number;
    try {
      const payload = JSON.parse(
        window.atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { exp?: number };
      expirationTime = (payload.exp ?? 0) * 1000;
    } catch {
      return;
    }

    if (!expirationTime) return;

    const refreshIn = Math.max(expirationTime - Date.now() - 60_000, 5_000);
    const timer = window.setTimeout(() => {
      void refreshAccessToken().catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth:logout"));
      });
    }, refreshIn);

    return () => window.clearTimeout(timer);
  }, [accessToken]);

  const login = (accessToken: string, refreshToken?: string) => {
    setAccessToken(accessToken);
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  };

  const logout = () => {
    setAccessToken("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        expirationTime: "",
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be within an AuthProvider");
  return context;
};
