"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, MoreVertical, ArrowLeft } from "lucide-react"
import { useState } from "react"
import type { StudyGroup } from "@/types/groups"
import { useGroupStore } from "@/store/groupStore"
import GroupDetailsMobile from "./GroupDetailsMobile"

export const MobileHeader = ({ group: activeGroup }: { group: StudyGroup | null }) => {
  const sidebarOpen = useGroupStore((s) => s.sidebarOpen)
  const setSidebarOpen = useGroupStore((s) => s.setSidebarOpen)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function onMenuClick() {
    console.log("Menu clicked")
    setSidebarOpen(true)
  }

  const handleLeaveGroup = () => {
    console.log("Leave group clicked")
    setIsModalOpen(false)
  }

  const handleSaveEdit = (formData: FormData) => {
    console.log("Save edit:", formData)
  }

  const handleDeleteGroup = () => {
    console.log("Delete group clicked")
    setIsModalOpen(false)
  }

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onMenuClick}
        className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        <ArrowLeft className="w-7 h-7" />
      </Button>

      {activeGroup && (
        <>
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 px-3 py-2 rounded-lg transition-colors flex-1 max-w-xs"
              onClick={() => setIsModalOpen(true)}
            >
              <Avatar className="w-8 h-8 ring-1 ring-gray-200 dark:ring-gray-700">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                  {activeGroup.avatar_url ? (
                    <img
                      src={activeGroup.avatar_url || "/placeholder.svg"}
                      alt={activeGroup.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    activeGroup.name.charAt(0).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {activeGroup.name}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {activeGroup.subject}
                </p>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsModalOpen(true)} 
              className="p-2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          <GroupDetailsMobile
            group={activeGroup}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onLeaveGroup={handleLeaveGroup}
            onSaveEdit={handleSaveEdit}
            onDeleteGroup={handleDeleteGroup}
          />
        </>
      )}
    </div>
  )
}