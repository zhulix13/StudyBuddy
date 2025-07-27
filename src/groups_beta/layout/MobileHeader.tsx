"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, MoreVertical } from "lucide-react"
import { useState } from "react"
import type { StudyGroup } from "@/types/groups"
import { useGroupStore } from "@/store/groupStore"
import GroupDetailsMobile from "./GroupDetailsMobile"

export const MobileHeader = ({ group: activeGroup }: { group: StudyGroup | null }) => {
  const setSidebarOpen = useGroupStore((s) => s.setSidebarOpen)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function onMenuClick() {
    setSidebarOpen(true)
  }

  const handleLeaveGroup = () => {
    console.log("Leave group clicked")
    setIsModalOpen(false)
    // Add leave group logic here
  }

  const handleSaveEdit = (formData) => {
    console.log("Save edit:", formData)
    // Add save edit logic here
  }

  const handleDeleteGroup = () => {
    console.log("Delete group clicked")
    setIsModalOpen(false)
    // Add delete group logic here
  }

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-30">
      <Button variant="ghost" size="sm" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>

      {activeGroup && (
        <>
          <div className="flex items-center gap-3 flex-1 justify-center">
            {/* Group Info - Clickable Area */}
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors flex-1 max-w-xs"
              onClick={() => setIsModalOpen(true)}
            >
              <Avatar className="w-8 h-8 ring-1 ring-gray-200">
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
                <h1 className="font-semibold text-sm truncate">{activeGroup.name}</h1>
                <p className="text-xs text-gray-500 truncate">{activeGroup.subject}</p>
              </div>
            </div>

            {/* More Options Button */}
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)} className="p-2 h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Group Details Mobile - Full Screen */}
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
