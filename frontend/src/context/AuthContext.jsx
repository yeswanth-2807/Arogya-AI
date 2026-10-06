import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("arogya_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    const formatted = { ...userData, role: userData.role || "patient" };
    setUser(formatted);
    localStorage.setItem("arogya_user", JSON.stringify(formatted));
    if (token) localStorage.setItem("arogya_token", token);
  };

  const loginDoctor = (doctorData, token) => {
    const formatted = { ...doctorData, role: "doctor" };
    setUser(formatted);
    localStorage.setItem("arogya_user", JSON.stringify(formatted));
    if (token) localStorage.setItem("arogya_token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("arogya_user");
    localStorage.removeItem("arogya_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, loginDoctor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
