import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Group } from "../types"

interface GroupCardProps {
  group: Group
  isActive: boolean
  onClick: () => void
}

export const GroupCard = ({ group, isActive, onClick }: GroupCardProps) => (
  <div
    onClick={onClick}
    className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
      isActive ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
    }`}
  >
    <div className="flex items-center gap-3">
      <Avatar className="w-12 h-12">
        <AvatarImage src={group.avatar} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          {group.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm truncate">{group.name}</h3>
          {group.unreadCount && group.unreadCount > 0 && (
            <Badge variant="default" className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
              {group.unreadCount}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{group.description}</p>
        <p className="text-xs text-gray-400 mt-1">{group.lastActivity}</p>
      </div>
    </div>
  </div>
)