import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, UserCheck } from "lucide-react"
import type { StudyGroup } from "@/types/groups"

interface GroupCardProps {
  group: StudyGroup
  isActive: boolean
  onClick: () => void
}

export const GroupCard = ({ group, isActive, onClick }: GroupCardProps) => {
  const getRoleIcon = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Crown className="w-3 h-3 text-yellow-600" />
      case 'moderator':
        return <UserCheck className="w-3 h-3 text-blue-600" />
      default:
        return <Users className="w-3 h-3 text-gray-500" />
    }
  }

  const getRoleColor = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'moderator':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div
      onClick={onClick}
      className={`p-3  mb-2 rounded-lg  cursor-pointer transition-all duration-200 hover:bg-gray-50 border ${
        isActive 
          ? "bg-blue-50 border-blue-200 shadow-sm" 
          : "border-transparent hover:border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={group.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
            {group.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm truncate">{group.name}</h3>
            <div className="flex items-center gap-1">
              {group.unreadCount && group.unreadCount > 0 && (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] justify-center">
                  {group.unreadCount > 99 ? '99+' : group.unreadCount}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 truncate mb-2">{group.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {group.user_role && (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${getRoleColor(group.user_role)}`}>
                  {getRoleIcon(group.user_role)}
                  <span className="capitalize">{group.user_role}</span>
                </div>
              )}
              
              {group.member_count && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{group.member_count}</span>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-400">{group.lastActivity || "No activity"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}