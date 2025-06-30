import React, { useEffect, useState } from 'react'
import type { Theme } from '@/lib/theme'
import { 
  DEFAULT_THEME, 
  getSystemTheme, 
  getStorageTheme, 
  setStorageTheme, 
  applyTheme 
} from '@/lib/theme'
import { ThemeContext } from '@/contexts/theme-context'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = DEFAULT_THEME }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const storedTheme = getStorageTheme()
    setThemeState(storedTheme)
  }, [])

  useEffect(() => {
    const updateActualTheme = () => {
      const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
      setActualTheme(resolvedTheme as 'light' | 'dark')
      applyTheme(theme)
    }

    updateActualTheme()

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => updateActualTheme()
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    setStorageTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 