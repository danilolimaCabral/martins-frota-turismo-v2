import { createContext, useContext, useState, useEffect } from "react";

export type AppTheme = "light" | "dark";

interface AppThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    // Recuperar tema do localStorage
    const saved = localStorage.getItem("app_theme");
    return (saved as AppTheme) || "light";
  });

  useEffect(() => {
    // Salvar tema no localStorage
    localStorage.setItem("app_theme", theme);
    
    // Aplicar classe ao documento
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <AppThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return context;
}
