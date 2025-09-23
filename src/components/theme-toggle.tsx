"use client"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const themes: Array<"system" | "light" | "dark"> = ["system", "light", "dark"]
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-5 h-5" />
      case "dark":
        return <Moon className="w-5 h-5" />
      case "system":
        return <Monitor className="w-5 h-5" />
      default:
        return <Monitor className="w-5 h-5" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light mode"
      case "dark":
        return "Dark mode"
      case "system":
        return "System mode"
      default:
        return "System mode"
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Switch to next theme (current: ${getLabel()})`}
      title={getLabel()}
    >
      <span className="text-gray-600 dark:text-gray-400">{getIcon()}</span>
    </button>
  )
}
