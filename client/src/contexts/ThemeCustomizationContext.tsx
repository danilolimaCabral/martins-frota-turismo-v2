/**
 * Contexto de Personalização de Temas
 * Gerencia temas, cores de acento e preferências de aparência
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'cyan';

export interface ThemeCustomization {
  mode: ThemeMode;
  accentColor: AccentColor;
  fontSize: 'small' | 'normal' | 'large';
  compactMode: boolean;
}

interface ThemeContextType {
  theme: ThemeCustomization;
  setTheme: (theme: Partial<ThemeCustomization>) => void;
  resetTheme: () => void;
  isDarkMode: boolean;
}

const defaultTheme: ThemeCustomization = {
  mode: 'auto',
  accentColor: 'blue',
  fontSize: 'normal',
  compactMode: false,
};

const ThemeCustomizationContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeCustomizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeCustomization>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Carregar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('martins_theme_customization');
    if (savedTheme) {
      try {
        setThemeState(JSON.parse(savedTheme));
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      }
    }

    // Verificar preferência do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  // Aplicar tema ao documento
  useEffect(() => {
    const html = document.documentElement;

    // Determinar modo escuro
    const isDark =
      theme.mode === 'dark' || (theme.mode === 'auto' && isDarkMode);

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Aplicar cor de acento
    const accentColors: Record<AccentColor, string> = {
      blue: '#3b82f6',
      purple: '#a855f7',
      green: '#10b981',
      orange: '#f97316',
      red: '#ef4444',
      pink: '#ec4899',
      cyan: '#06b6d4',
    };

    html.style.setProperty('--accent-color', accentColors[theme.accentColor]);

    // Aplicar tamanho de fonte
    const fontSizes: Record<string, string> = {
      small: '0.875rem',
      normal: '1rem',
      large: '1.125rem',
    };

    html.style.setProperty('--font-size-base', fontSizes[theme.fontSize]);

    // Aplicar modo compacto
    if (theme.compactMode) {
      html.classList.add('compact-mode');
    } else {
      html.classList.remove('compact-mode');
    }

    // Salvar tema
    localStorage.setItem('martins_theme_customization', JSON.stringify(theme));
  }, [theme, isDarkMode]);

  const setTheme = (updates: Partial<ThemeCustomization>) => {
    setThemeState((prev) => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setThemeState(defaultTheme);
    localStorage.removeItem('martins_theme_customization');
  };

  return (
    <ThemeCustomizationContext.Provider
      value={{
        theme,
        setTheme,
        resetTheme,
        isDarkMode,
      }}
    >
      {children}
    </ThemeCustomizationContext.Provider>
  );
};

export const useThemeCustomization = () => {
  const context = useContext(ThemeCustomizationContext);
  if (!context) {
    throw new Error(
      'useThemeCustomization deve ser usado dentro de ThemeCustomizationProvider'
    );
  }
  return context;
};
