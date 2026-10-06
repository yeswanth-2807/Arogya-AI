import React, { createContext, useContext, useState, useEffect } from "react";

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("arogya_theme");
    if (saved !== null) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("arogya_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("arogya_theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
