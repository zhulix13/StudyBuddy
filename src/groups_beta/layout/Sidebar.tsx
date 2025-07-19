import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { GroupCard } from "../layout/GroupCard"
import type { Group } from "../types/index"

// Mock data - move this to a separate file or fetch from API
const dummyGroups: Group[] = [
  { id: "1", name: "Algebra Squad", description: "Formulas & Practice", lastActivity: "2 min ago", unreadCount: 3 },
  { id: "2", name: "Dev Circle", description: "Frontend Engineers", lastActivity: "1 hour ago", unreadCount: 0 },
  { id: "3", name: "AI Think Tank", description: "Prompts & Projects", lastActivity: "3 hours ago", unreadCount: 1 },
  { id: "4", name: "History Buffs", description: "Ancient to Modern", lastActivity: "1 day ago", unreadCount: 0 },
  { id: "5", name: "Literature Lovers", description: "Books & Discussions", lastActivity: "2 days ago", unreadCount: 5 },
]

interface SidebarProps {
  onSelectGroup: (group: Group) => void
  activeGroupId: string | null
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar = ({ onSelectGroup, activeGroupId, isOpen, onClose }: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredGroups = dummyGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Study Groups</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isActive={group.id === activeGroupId}
              onClick={() => {
                onSelectGroup(group)
                onClose?.()
              }}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-[320px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-full w-[320px] border-r bg-white z-10">
        {sidebarContent}
      </aside>
    </>
  )
}