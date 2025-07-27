"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileText, MessageCircle, MoreVertical } from "lucide-react"
import { ChatView } from "../chat/ChatView"
import { NotesView } from "../notes/NotesViews"
import { useGroupStore } from "@/store/groupStore"
import GroupDetailsDesktop from "./GroupDetailsDesktop"
import { useState, useRef } from "react"
import type { StudyGroup } from "@/types/groups"

// Main Group Header Component
const GroupHeader = ({ group }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const triggerRef = useRef(null)

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
    <div className="hidden md:block border-b bg-white sticky top-0 ">
      {/* Main Header */}
      <div className="p-6 w-full">
        <div className="flex items-center justify-between">
          {/* Left side - Group info */}
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="w-12 h-12 ring-2 ring-blue-100">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {group.avatar_url ? (
                  <img
                    src={group.avatar_url || "/placeholder.svg"}
                    alt={group.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  group.name.charAt(0).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{group.name}</h1>
              <p className="text-sm text-gray-500 truncate">{group.description}</p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <button
              ref={triggerRef}
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors rounded-lg"
              title="Group Details"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Group Details Modal */}
      <GroupDetailsDesktop
        group={group}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeaveGroup={handleLeaveGroup}
        onSaveEdit={handleSaveEdit}
        onDeleteGroup={handleDeleteGroup}
        triggerRef={triggerRef}
      />
    </div>
  )
}

const GroupContent = ({ group }: { group: StudyGroup }) => {
  const activeTab = useGroupStore((s) => s.activeTab)
  const setActiveTab = useGroupStore((s) => s.setActiveTab)

  return (
    <div className="flex-1 flex flex-col relative">
      <GroupHeader group={group} />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4 bg-gray-100">
          <TabsTrigger
            value="notes"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </TabsTrigger>
        </TabsList>
        <TabsContent value="notes" className="flex-1 mt-4">
          <NotesView groupId={group.id} />
        </TabsContent>
        <TabsContent value="chat" className="flex-1 mt-4">
          <ChatView groupId={group.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GroupContent
