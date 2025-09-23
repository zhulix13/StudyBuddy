"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: "light" | "dark" // The actual resolved theme (light or dark)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // Function to get system preference
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  }, [])

  // Function to resolve the actual theme based on current theme setting
  const resolveTheme = useCallback(
    (currentTheme: Theme): "light" | "dark" => {
      if (currentTheme === "system") {
        return getSystemTheme()
      }
      return currentTheme
    },
    [getSystemTheme],
  )

  // Apply theme to document
  const applyTheme = useCallback((themeToApply: Theme) => {
    const root = document.documentElement

    if (themeToApply === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
      setActualTheme(systemTheme)
      return
    }

    root.classList.toggle("dark", themeToApply === "dark")
    setActualTheme(themeToApply)
  }, [])

  // Handle system theme changes
  const handleSystemThemeChange = useCallback(
    (currentTheme: Theme) => {
      if (currentTheme === "system") {
        const newResolved = getSystemTheme()
        setActualTheme(newResolved)
        const root = document.documentElement
        root.classList.toggle("dark", newResolved === "dark")
      }
    },
    [getSystemTheme],
  )

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)

    // Get saved theme from localStorage or default to 'system'
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system"

    setTheme(savedTheme)
    applyTheme(savedTheme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = () => handleSystemThemeChange(savedTheme)

    mediaQuery.addEventListener("change", listener)
    return () => mediaQuery.removeEventListener("change", listener)
  }, [applyTheme, handleSystemThemeChange])

  // Update theme when theme state changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme)

      // Save to localStorage
      localStorage.setItem("theme", theme)

      // Update system theme listener
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const listener = () => handleSystemThemeChange(theme)

      mediaQuery.addEventListener("change", listener)
      return () => mediaQuery.removeEventListener("change", listener)
    }
  }, [theme, mounted, applyTheme, handleSystemThemeChange])

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme,
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    console.warn("useTheme used outside ThemeProvider")
    return { theme: "system" as Theme, setTheme: () => {}, actualTheme: "light" as const }
  }
  return context
}
