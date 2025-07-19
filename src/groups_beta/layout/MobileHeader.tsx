import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu } from "lucide-react"
import type { Group } from "../types"
import { useGroupStore } from "@/store/groupStore"


  const activeGroup = useGroupStore((s) => s.activeGroup || null)

 const sidebarOpen = useGroupStore((s) => s.sidebarOpen);
 const setSidebarOpen = useGroupStore((s) => s.setSidebarOpen);

   function onMenuClick() {
    setSidebarOpen(!sidebarOpen);
   }

export const MobileHeader = () => {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b">
      <Button variant="ghost" size="sm" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>
      {activeGroup && (
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
              {activeGroup.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-sm">{activeGroup.name}</h1>
            <p className="text-xs text-gray-500">{activeGroup.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}