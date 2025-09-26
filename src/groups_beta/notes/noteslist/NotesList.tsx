"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Filter, Loader2, FileText, Menu } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useNotesByGroup } from "@/hooks/useNotes"
import type { Note } from "@/types/notes"
import { FilterSidebar, type ViewFilter, type SortOption, type SortDirection } from "./FilterSidebar"
import { ViewModeSelector, type ViewMode } from "./ViewModeSelector"
import { NoteCard } from "./NoteCard"
import { useAuth } from "@/context/Authcontext"
  import useUiStore from "@/store/uiStore";


interface NotesListProps {
  groupId: string
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
}

export const NotesList = ({ groupId, onSelectNote, onCreateNote }: NotesListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("updated")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hideUI = useUiStore((s) => s.hideUI);
  const setHideUI = useUiStore((s) => s.setHideUI);

  const { data: notes = [], isLoading, error } = useNotesByGroup(groupId)
  const { user } = useAuth()

  useEffect(() => {
      const handleHideUI = () => {
        setHideUI(false);
      };
  
      handleHideUI()
      }, [hideUI])
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsMobileFilterOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile && viewMode === "details") {
      setViewMode("list")
    }
  }, [isMobile, viewMode])

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((note) => {
      note.tags?.forEach((tag: string) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [notes])

  const processedNotes = useMemo(() => {
    let filtered = [...notes]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (typeof note.content === "string" && note.content.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply view filter
    switch (viewFilter) {
      case "all":
        filtered = filtered.filter((note) => note.status === "published")
        break
      case "drafts":
        filtered = filtered.filter((note) => note.status === "draft")
        break
      case "private":
        filtered = filtered.filter((note) => note.is_private)
        break
      case "shared":
        filtered = filtered.filter((note) => note.user_id === user?.id)
        break
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) => selectedTags.some((tag) => note.tags?.includes(tag)))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      // Always prioritize pinned notes
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1

      switch (sortBy) {
        case "updated":
          comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          break
        case "created":
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "author":
          const aAuthor = a.author?.name || a.author?.username || ""
          const bAuthor = b.author?.name || b.author?.username || ""
          comparison = aAuthor.localeCompare(bAuthor)
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [notes, searchTerm, viewFilter, selectedTags, sortBy, sortDirection, user?.id])

  const handleSortChange = (sort: SortOption, direction: SortDirection) => {
    setSortBy(sort)
    setSortDirection(direction)
  }

  const getGridClasses = () => {
    switch (viewMode) {
      case "grid":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
      case "list":
      case "details":
        return "grid grid-cols-1 gap-3 sm:gap-4"
      case "compact":
        return "bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      default:
        return "grid grid-cols-1 gap-4"
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-[#fefeff] dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Notes</h1>
            <Button
              onClick={onCreateNote}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isMobile ? "New" : "New Note"}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading notes...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-[#fefeff]] dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Notes</h1>
            <Button
              onClick={onCreateNote}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isMobile ? "New" : "New Note"}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-red-500 dark:text-red-400 mb-2">Failed to load notes</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Please try refreshing the page</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex  note-bg relative">
      {/* Mobile filter overlay */}
      {isMobile && isMobileFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileFilterOpen(false)} 
        />
      )}

      {/* Filter Sidebar */}
      <div
        className={`
          ${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
                  isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"
                } shadow-2xl`
              : "relative"
          }
        `}
      >
        <FilterSidebar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewFilter={viewFilter}
          onViewFilterChange={setViewFilter}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          availableTags={availableTags}
          isCollapsed={!isMobile && isFilterCollapsed}
          onToggleCollapse={() => {
            if (isMobile) {
              setIsMobileFilterOpen(false)
            } else {
              setIsFilterCollapsed(!isFilterCollapsed)
            }
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-[#fcfcfd] dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {isMobile && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsMobileFilterOpen(true)} 
                  className="flex-shrink-0 lg:hidden border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Notes</h1>
              {!isMobile && isFilterCollapsed && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsFilterCollapsed(false)}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Show Filters</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden sm:block">
                <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
              </div>
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "list" ? "compact" : "list")}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {viewMode === "list" ? "Compact" : "List"}
                </Button>
              )}
              <Button
                onClick={onCreateNote}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Note</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || viewFilter !== "all" || selectedTags.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline flex-shrink-0">Active filters:</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden flex-shrink-0">Filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="text-xs max-w-32 truncate">
                  Search: "{searchTerm.length > 10 && isMobile ? searchTerm.slice(0, 10) + "..." : searchTerm}"
                </Badge>
              )}
              {viewFilter !== "all" && (
                <Badge variant="outline" className="text-xs dark:text-gray-400 capitalize">
                  {isMobile ? viewFilter : `View: ${viewFilter}`}
                </Badge>
              )}
              {selectedTags.slice(0, isMobile ? 2 : selectedTags.length).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs max-w-24 dark:text-gray-400 truncate">
                  {isMobile ? tag : `Tag: ${tag}`}
                </Badge>
              ))}
              {isMobile && selectedTags.length > 2 && (
                <Badge variant="outline" className="text-xs dark:text-gray-400">
                  +{selectedTags.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Notes Grid/List */}
        <div className="flex-1 overflow-y-scroll hide-scrollbar  p-4 sm:p-6">
          {processedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 px-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-6">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-2 text-center text-gray-700 dark:text-gray-300">
                {searchTerm || viewFilter !== "all" || selectedTags.length > 0 ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-sm text-center mb-6 max-w-sm text-gray-500 dark:text-gray-400">
                {searchTerm || viewFilter !== "all" || selectedTags.length > 0
                  ? "Try adjusting your filters or create a new note."
                  : "Get started by creating your first note for this group."}
              </p>
              {!searchTerm && viewFilter === "all" && selectedTags.length === 0 && (
                <Button
                  onClick={onCreateNote}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  size={isMobile ? "sm" : "default"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Note
                </Button>
              )}
            </div>
          ) : (
            <div className={getGridClasses()}>
              {processedNotes.map((note) => (
                <NoteCard key={note.id} note={note} viewMode={viewMode} onSelect={onSelectNote} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {processedNotes.length > 0 && (
          <div className="p-3 absolute inset-x-0 bottom-0 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {isMobile
                ? `${processedNotes.length}/${notes.length} notes`
                : `Showing ${processedNotes.length} of ${notes.length} note${notes.length !== 1 ? "s" : ""}`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}