"use client"

import { Button } from "@/components/ui/button"
import { Grid3X3, List, LayoutGrid, Eye } from "lucide-react"

export type ViewMode = "grid" | "list" | "details" | "compact"

interface ViewModeSelectorProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export const ViewModeSelector = ({ viewMode, onViewModeChange }: ViewModeSelectorProps) => {
  const viewModes = [
    { value: "grid" as ViewMode, icon: Grid3X3, label: "Grid" },
    { value: "list" as ViewMode, icon: List, label: "List" },
    { value: "details" as ViewMode, icon: LayoutGrid, label: "Details" },
    { value: "compact" as ViewMode, icon: Eye, label: "Compact" },
  ]

  return (
    <div className="flex items-center gap-1 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-700/90 rounded-lg p-1.5 shadow-sm border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
      {viewModes.map((mode) => {
        const Icon = mode.icon
        const isActive = viewMode === mode.value
        return (
          <Button
            key={mode.value}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange(mode.value)}
            className={`h-8 px-2 sm:px-3 transition-all duration-300 hover:scale-105 rounded-md border ${
              isActive
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 dark:shadow-blue-500/20 border-blue-400 hover:shadow-blue-500/40"
                : "hover:bg-white/80 dark:hover:bg-slate-600/60 border-transparent hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
            title={mode.label}
          >
            <Icon className={`w-4 h-4 ${
              isActive 
                ? 'text-white' 
                : 'text-slate-600 dark:text-slate-400'
            }`} />
            <span className={`hidden md:inline ml-2 text-sm font-medium ${
              isActive 
                ? 'text-white' 
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {mode.label}
            </span>
          </Button>
        )
      })}
    </div>
  )
}