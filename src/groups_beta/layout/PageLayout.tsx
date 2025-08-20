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
import { motion, AnimatePresence } from "framer-motion"
import { useNoteStore } from "@/store/noteStore"

// Main Group Header Component
const GroupHeader = ({ group }: { group: StudyGroup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const triggerRef = useRef(null)

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
    <div className="border-b hidden md:block bg-white sticky top-0 ">
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
  const mode = useNoteStore((s) => s.mode)

  // hide header + tabs when editing/creating
  const hideUI = mode === "create" || mode === "edit" || mode === "view";

  return (
    <div className="flex flex-col h-screen">
      {/* Animate Header */}
      <AnimatePresence>
        {!hideUI && (
          <motion.div
            key="header"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GroupHeader group={group} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animate Tabs */}
      <AnimatePresence>
        {!hideUI && (
          <motion.div
            key="tabs"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="sticky top-[80px] z-20 bg-white border-b"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-full w-full">
              <TabsList className="grid max-w-[96%] w-full grid-cols-2 mx-auto my-4 bg-gray-100">
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
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar max-w-full w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="notes" className="h-full">
            <NotesView group={group} />
          </TabsContent>
          <TabsContent value="chat" className="h-full">
            <ChatView groupId={group.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default GroupContent
