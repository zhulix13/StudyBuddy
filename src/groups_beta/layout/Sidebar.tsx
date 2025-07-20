import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Loader2 } from "lucide-react"
import { GroupCard } from "../layout/GroupCard"
import { getGroupsWhereUserIsMember } from "@/services/supabase-groups" // Adjust import path as needed
import type { StudyGroup } from "@/types/groups"
import { toast } from "sonner"

interface SidebarProps {
  setActiveGroup: (group: StudyGroup) => void
  activeGroupId: string | null
  isOpen?: boolean
  setsidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

export const Sidebar = ({ setActiveGroup, activeGroupId, isOpen, setsidebarOpen }: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const userGroups = await getGroupsWhereUserIsMember()
        setGroups(userGroups)
         if (userGroups.length === 0) {
            toast.info("You have no groups yet. Join or create one to get started.")
         }
         toast.success("Groups loaded successfully")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load groups")
        toast.error("Failed to load groups")
        console.error("Error fetching groups:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [])
 
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleGroupClick = (group: StudyGroup) => {
    setActiveGroup(group)
      navigate(`/groups/${group.id}`)
      setsidebarOpen(false) // Close sidebar after selecting a group
   //  onClose?.()
  }

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-3" />
      <p className="text-sm text-gray-500">Loading your groups...</p>
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 mb-1">
        {searchTerm ? "No groups found" : "No study groups yet"}
      </p>
      <p className="text-xs text-gray-400">
        {searchTerm ? "Try a different search term" : "Join or create a group to get started"}
      </p>
    </div>
  )

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
        <Search className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-sm text-red-600 mb-1">Failed to load groups</p>
      <p className="text-xs text-gray-400">{error}</p>
    </div>
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
            disabled={isLoading}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : filteredGroups.length === 0 ? (
            <EmptyState />
          ) : (
            filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                isActive={group.id === activeGroupId}
                onClick={() => handleGroupClick(group)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
  
  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setsidebarOpen}>
        <SheetContent side="left" className="w-[320px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
     
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-16  h-full w-[320px] border-r bg-white z-10">
        {sidebarContent}
      </aside>
    </>
  )
}