export type Theme = "light" | "dark" | "system"

export const DEFAULT_THEME: Theme = "system"

export function getSystemTheme(): Theme {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export function getStorageTheme(): Theme {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('theme') as Theme) || DEFAULT_THEME
  }
  return DEFAULT_THEME
}

export function setStorageTheme(theme: Theme): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme)
  }
}

export function applyTheme(theme: Theme): void {
  const root = window.document.documentElement
  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark')
  
  root.classList.toggle('dark', isDark)
} 