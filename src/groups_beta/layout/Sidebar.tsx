"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Plus, Settings, ChevronLeft, ChevronRight, Users } from "lucide-react"
import { GroupCard } from "./GroupCard"
import { getGroupsWhereUserIsMember } from "@/services/supabase-groups"
import type { StudyGroup } from "@/types/groups"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import CreateGroupModal from "./CreateGroupModal"
import SettingsModal from "./SettingsModal"
import { useIsMobile } from "@/hooks/useIsMobile"
import { useNoteStore } from "@/store/noteStore"
import { UnsavedChangesModal } from "../notes/UnsavedChangesModal"

interface SidebarProps {
  setActiveGroup: (group: StudyGroup | null) => void
  activeGroupId: string | null
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}

export const Sidebar = ({
  setActiveGroup,
  activeGroupId,
  sidebarOpen,
  setSidebarOpen,
  isExpanded,
  setIsExpanded,
}: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingGroup, setPendingGroup] = useState<StudyGroup | null>(null)

  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const {
    data: groups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-groups"],
    queryFn: getGroupsWhereUserIsMember,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data: StudyGroup[]) => {
      if (data.length === 0) {
        toast.info("You have no groups yet. Join or create one to get started.")
      } else {
        toast.success("Groups loaded successfully")
        console.log("Groups loaded:", data)
      }
      // Check if the current persisted activeGroup.id exists in the new fetched list
      if (activeGroupId) {
        const stillValid = data.find((group: StudyGroup) => group.id === activeGroupId)
        if (stillValid) {
          setActiveGroup(stillValid)
        } else {
          setActiveGroup(null) // or reset logic if the group was deleted or user removed
        }
      }
    },
    onError: (err: any) => {
      toast.error("Failed to load groups")
      console.error("Error fetching groups:", err)
    },
  })

  const filteredGroups: StudyGroup[] = groups.filter((group: StudyGroup) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const { setMode, setNotes, setEditingNote, isDirty, clearLocalDraft } = useNoteStore()

  const handleGroupClick = (group: StudyGroup) => {
    // If there are unsaved changes, show confirmation modal
    if (isDirty) {
      setPendingGroup(group)
      setShowUnsavedModal(true)
      return
    }

    // Proceed with normal navigation
    proceedWithNavigation(group)
  }

  const proceedWithNavigation = (group: StudyGroup) => {
    setActiveGroup(group)
    navigate(`/groups/${group.id}`)
    setSidebarOpen(false)
    setMode(null)
    setNotes([])
    setEditingNote(null)
  }

  const handleSaveAndLeave = async () => {
    if (pendingGroup) {
      setShowUnsavedModal(false)
      setPendingGroup(null)
      // User stays in editor to save draft manually
      toast.info("Please save your draft from the editor, then navigate again")
    }
  }

  const handleDiscardAndLeave = () => {
    if (pendingGroup) {
      if (activeGroupId) {
        clearLocalDraft(activeGroupId)
      }
      setShowUnsavedModal(false)
      proceedWithNavigation(pendingGroup)
      setPendingGroup(null)
    }
  }

  const handleCancelNavigation = () => {
    setShowUnsavedModal(false)
    setPendingGroup(null)
  }

  const handleCreateSuccess = (newGroup: StudyGroup) => {
    setActiveGroup(newGroup)
    navigate(`/groups/${newGroup.id}`)
    setIsCreateModalOpen(false)
  }

  const LoadingState = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-3 border rounded-xl dark:border-gray-700">
          <Skeleton height={20} width={`60%`} />
          <Skeleton height={15} width={`40%`} className="mt-2" />
        </div>
      ))}
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
        <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
        {searchTerm ? "No groups found" : "No study groups yet"}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {searchTerm ? "Try a different search term" : "Join or create a group to get started"}
      </p>
    </div>
  )

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
        <Users className="w-8 h-8 text-red-400 dark:text-red-500" />
      </div>
      <p className="text-sm text-red-600 dark:text-red-400 mb-1">Failed to load groups</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{(error as Error)?.message}</p>
    </div>
  )

  const CollapsedSidebar = () => (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900/95 border-r border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
        {/* Expand Button */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="w-full h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Expand sidebar</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Action Buttons */}
        <div className="p-3 space-y-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full h-10 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                disabled={isLoading}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Create Group</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsModalOpen(true)}
                className="w-full h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Active Groups Indicators */}
        <div className="flex-1 p-2 space-y-2">
          {filteredGroups.slice(0, 8).map((group) => (
            <Tooltip key={group.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGroupClick(group)}
                  className={`w-full h-10 p-0 relative ${
                    group.id === activeGroupId
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {group.name.substring(0, 2).toUpperCase()}
                  </div>
                  {group.unreadCount && group.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {group.unreadCount > 9 ? "9+" : group.unreadCount}
                    </div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{group.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )

  const ExpandedSidebar = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900/95 border-r border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Study Groups</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="p-2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </Button>
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
            Create
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 h-9 w-9 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Groups List */}
      <ScrollArea className="flex-1 pb-4">
        <div className="p-4">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : filteredGroups.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {filteredGroups.map((group: StudyGroup) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isActive={group.id === activeGroupId}
                  onClick={() => handleGroupClick(group)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )

  const sidebarContent = isExpanded ? <ExpandedSidebar /> : <CollapsedSidebar />

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden block w-fit">
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-full p-0 bg-white dark:bg-gray-900">
              <ExpandedSidebar />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed left-0 top-16 h-full transition-all duration-300 ease-in-out z-10 ${
          isExpanded ? "w-[320px]" : "w-[72px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSaveDraft={handleSaveAndLeave}
        onDiscardChanges={handleDiscardAndLeave}
        onCancel={handleCancelNavigation}
      />
    </>
  )
}
