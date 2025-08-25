"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, SortAsc, SortDesc, Calendar, User, Tag, Lock, FileText, X, ChevronDown, ChevronRight, BookDashed } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export type ViewFilter = "all" | "drafts" | "private" | "shared"
export type SortOption = "updated" | "created" | "title" | "author"
export type SortDirection = "asc" | "desc"

interface FilterSidebarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  viewFilter: ViewFilter
  onViewFilterChange: (filter: ViewFilter) => void
  sortBy: SortOption
  sortDirection: SortDirection
  onSortChange: (sort: SortOption, direction: SortDirection) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  availableTags: string[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export const FilterSidebar = ({
  searchTerm,
  onSearchChange,
  viewFilter,
  onViewFilterChange,
  sortBy,
  sortDirection,
  onSortChange,
  selectedTags,
  onTagsChange,
  availableTags,
  isCollapsed = false,
  onToggleCollapse,
}: FilterSidebarProps) => {
  const [isTagsExpanded, setIsTagsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024)

  const viewOptions = [
    { value: "all" as ViewFilter, label: "All Published", icon: FileText, description: "Published notes" },
    { value: "drafts" as ViewFilter, label: "Your Drafts", icon: BookDashed, description: "Draft notes" },
    { value: "private" as ViewFilter, label: "Private Notes", icon: Lock, description: "Private only" },
    { value: "shared" as ViewFilter, label: "Shared by You", icon: User, description: "Your shared notes" },
  ]

  const sortOptions = [
    { value: "updated" as SortOption, label: "Last Updated", icon: Calendar },
    { value: "created" as SortOption, label: "Date Created", icon: Calendar },
    { value: "title" as SortOption, label: "Title", icon: FileText },
    { value: "author" as SortOption, label: "Author", icon: User },
  ]

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const clearAllFilters = () => {
    onSearchChange("")
    onViewFilterChange("all")
    onTagsChange([])
  }

  const hasActiveFilters = searchTerm || viewFilter !== "all" || selectedTags.length > 0

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gradient-to-b from-slate-50 via-white to-slate-100/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/80 border-r border-slate-200 dark:border-slate-700/60 flex flex-col items-center py-4 gap-3 shadow-sm backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-10 h-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-300 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          title="Show Filters"
        >
          <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </Button>

        <div className="w-px h-4 bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-600" />

        <div className="flex flex-col gap-2">
          {viewOptions.map((option) => {
            const Icon = option.icon
            const isActive = viewFilter === option.value
            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewFilterChange(option.value)}
                className={`w-10 h-10 p-0 hover:scale-105 transition-all duration-300 rounded-lg border ${
                  isActive
                    ? "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border-blue-400 dark:shadow-blue-500/20"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                }`}
                title={option.label}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
              </Button>
            )
          })}
        </div>

        {hasActiveFilters && (
          <>
            <div className="w-px h-4 bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-600" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="w-10 h-10 p-0 hover:bg-red-50 dark:hover:bg-red-950/50 hover:scale-105 transition-all duration-300 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-800"
              title="Clear all filters"
            >
              <X className="w-4 h-4 text-red-500 dark:text-red-400" />
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="w-80 bg-gradient-to-b from-slate-50 via-white to-slate-100/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50 border-r border-slate-200 dark:border-slate-700/60 flex flex-col shadow-xl dark:shadow-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/80 dark:border-slate-700/60 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-lg tracking-tight">Filters & Search</h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="w-8 h-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/50 hover:scale-110 transition-all duration-300 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-800"
                title="Clear all filters"
              >
                <X className="w-4 h-4 text-red-500 dark:text-red-400" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-8 h-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all duration-300 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              title="Collapse filters"
            >
              <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 z-10" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-600/80 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 transition-all duration-300 rounded-lg shadow-sm backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200"
            >
              <X className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            </Button>
          )}
        </div>
      </div>

      {/* View Filter */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          View
        </h3>
        <div className="space-y-2">
          {viewOptions.map((option) => {
            const Icon = option.icon
            const isActive = viewFilter === option.value
            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-auto px-4 py-3 transition-all duration-300 rounded-lg border ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 border-blue-400 hover:shadow-blue-500/40"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:scale-[1.01] border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
                }`}
                onClick={() => onViewFilterChange(option.value)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`} />
                  <div className="flex-1 text-left">
                    <div className={`font-medium text-sm ${
                      isActive 
                        ? 'text-white' 
                        : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {option.label}
                    </div>
                    <div className={`text-xs ${
                      isActive 
                        ? 'text-blue-100' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
          {sortDirection === "asc" ? 
            <SortAsc className="w-4 h-4 text-blue-500 dark:text-blue-400" /> : 
            <SortDesc className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          }
          Sort By
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-12 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-600/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300 rounded-lg shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                {sortOptions.find((opt) => opt.value === sortBy)?.icon && (
                  (() => {
                    const Icon = sortOptions.find((opt) => opt.value === sortBy)!.icon;
                    return <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
                  })()
                )}
                <div className="text-left">
                  <div className="font-medium text-sm text-slate-700 dark:text-slate-200">
                    {sortOptions.find((opt) => opt.value === sortBy)?.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {sortDirection === "asc" ? "Ascending" : "Descending"}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
            <DropdownMenuLabel className="font-semibold text-slate-700 dark:text-slate-300 px-3 py-2">
              Sort Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-slate-700/60" />
            {sortOptions.map((option) => {
              const Icon = option.icon
              const isActive = sortBy === option.value
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortChange(option.value, sortDirection)}
                  className={`flex items-center gap-3 p-3 transition-all duration-200 rounded-md m-1 cursor-pointer ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-medium flex-1">{option.label}</span>
                  {isActive && <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator className="bg-slate-200/80 dark:bg-slate-700/60" />
            <DropdownMenuItem
              onClick={() => onSortChange(sortBy, sortDirection === "asc" ? "desc" : "asc")}
              className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all duration-200 rounded-md m-1 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              {sortDirection === "asc" ? 
                <SortDesc className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : 
                <SortAsc className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              }
              <span className="font-medium">
                {sortDirection === "asc" ? "Switch to Descending" : "Switch to Ascending"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="p-6 flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Tags
              {selectedTags.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 text-xs bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  {selectedTags.length}
                </Badge>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTagsChange([])}
                  className="h-6 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 rounded-md transition-colors duration-200"
                >
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                className="h-6 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 rounded-md"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 text-slate-500 dark:text-slate-400 ${
                    isTagsExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Selected
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="text-xs cursor-pointer bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md rounded-md px-3 py-1 group border border-blue-400 hover:border-red-400 text-white"
                    onClick={() => handleTagToggle(tag)}
                  >
                    <span className="truncate max-w-20">{tag}</span>
                    <X className="w-3 h-3 ml-1 group-hover:scale-110 transition-transform duration-200" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Tags */}
          {(isTagsExpanded || selectedTags.length === 0) && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Available ({availableTags.filter((tag) => !selectedTags.includes(tag)).length})
              </div>
              <div className="max-h-48 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500">
                {availableTags
                  .filter((tag) => !selectedTags.includes(tag))
                  .map((tag) => (
                    <Button
                      key={tag}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTagToggle(tag)}
                      className="w-full justify-start h-8 px-3 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:via-indigo-950/20 dark:hover:to-purple-950/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 border border-slate-200 dark:border-slate-700 rounded-md text-xs group"
                    >
                      <Tag className="w-3 h-3 mr-2 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      <span className="truncate text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                        {tag}
                      </span>
                    </Button>
                  ))}
                {availableTags.filter((tag) => !selectedTags.includes(tag)).length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
                    All tags selected
                  </div>
                )}
              </div>
            </div>
          )}

          {!isTagsExpanded && selectedTags.length === 0 && availableTags.length > 0 && (
            <div className="text-center py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTagsExpanded(true)}
                className="text-xs border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-400 dark:hover:border-slate-500 rounded-md transition-all duration-200"
              >
                <ChevronDown className="w-3 h-3 mr-1 text-slate-500 dark:text-slate-400" />
                Show {availableTags.length} tag{availableTags.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">
            {hasActiveFilters ? "Filters active" : "No filters"}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 rounded-md transition-colors duration-200"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}