"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileText, MessageCircle } from "lucide-react"
import { ChatView } from "../chat/ChatView"
import { NotesView } from "../notes/NotesViews"
import { useGroupStore } from "@/store/groupStore"
import GroupDetailsDropdown from "./GroupDetails"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
// Assuming Group type is defined somewhere
import type { StudyGroup } from "@/types/groups"

// Mock data for demonstration
// const mockGroup = {
//   id: "1",
//   name: "MEE CLASS'25",
//   subject: "Mechanical Engineering",
//   description: "Who wants to be our new class rep pls?",
//   avatar_url: null,
//   memberCount: 45,
//   notesCount: 127,
//   adminCount: 3,
//   isUserAdmin: true,
//   user_role: "admin",
//   member_count: 45,
//   created_at: "10/28/2021 6:49 PM",
// }

// Main Group Header Component
const GroupHeader = ({ group }: any) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleLeaveGroup = () => {
    console.log("Leave group clicked")
    // Add leave group logic here
  }

  const handleSaveEdit = (formData) => {
    console.log("Save edit:", formData)
    // Add save edit logic here
  }

  const handleDeleteGroup = () => {
    console.log("Delete group clicked")
    // Add delete group logic here
  }

  return (
   <div className="hidden md:block border-b ">
     {/* Main Header - sticky */}
     <div className="p-6 w-full   bg-white">
      <div className="flex items-center justify-between">
        {/* Left side - Group info */}
        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={handleToggleExpanded}>
         <Avatar className="w-12 h-12">
           <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            {group.avatar_url
              ? <img src={group.avatar_url} alt={group.name} className="w-full h-full object-cover rounded-full" />
              : group.name.charAt(0)
            }
           </AvatarFallback>
         </Avatar>
         <div className="flex-1">
           <h1 className="text-xl font-bold">{group.name}</h1>
           <p className="text-sm text-gray-500">{group.description}</p>
         </div>
         <div className="text-gray-400">
           {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
         </div>
        </div>
      </div>
     </div>

     {/* Expandable Details */}
     <GroupDetailsDropdown
      group={group}
      isExpanded={isExpanded}
      onLeaveGroup={handleLeaveGroup}
      onSaveEdit={handleSaveEdit}
      onDeleteGroup={handleDeleteGroup}
     />
   </div>
  )
}

const GroupContent = ({ group }: { group: StudyGroup }) => {
  const activeTab = useGroupStore((s) => s.activeTab)
  const setActiveTab = useGroupStore((s) => s.setActiveTab)

  return (
    <div className="flex-1 flex flex-col  relative">
      <GroupHeader group={group } />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col  ">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
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
