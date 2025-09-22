"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Crown, UserCheck, Clock } from "lucide-react"
import type { StudyGroup } from "@/types/groups"

interface GroupCardProps {
  group: StudyGroup
  isActive: boolean
  onClick: () => void
}

export const GroupCard = ({ group, isActive, onClick }: GroupCardProps) => {
  const getRoleIcon = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      case "moderator":
        return <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
      default:
        return <Users className="w-3 h-3 text-gray-500 dark:text-gray-400" />
    }
  }

  const getRoleColor = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50"
      case "moderator":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50"
    }
  }

  return (
    <div
      onClick={onClick}
      className={`group p-4 mb-2  rounded-xl cursor-pointer transition-all duration-200 border backdrop-blur-sm ${
        isActive
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700/50 shadow-md shadow-blue-100/50 dark:shadow-blue-900/20"
          : "bg-white/80 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12 ring-2 ring-white/50 dark:ring-gray-700/50 group-hover:ring-gray-200 dark:group-hover:ring-gray-600 transition-all duration-200">
            <AvatarImage src={group.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 via-slate-700 to-indigo-600 text-white font-semibold text-sm shadow-inner">
              {group.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {group.unreadCount && group.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-white dark:ring-gray-800">
              {group.unreadCount > 99 ? "99+" : group.unreadCount}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
              {group.name}
            </h3>
            {isActive && (
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse ml-2 flex-shrink-0" />
            )}
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-3 font-medium">{group.subject}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {group.user_role && (
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all duration-200 ${getRoleColor(group.user_role)}`}
                >
                  {getRoleIcon(group.user_role)}
                  <span className="capitalize">{group.user_role}</span>
                </div>
              )}

              {group.member_count && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/30 px-2 py-1 rounded-md">
                  <Users className="w-3 h-3" />
                  <span className="font-medium">{group.member_count}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{group.lastActivity || "No activity"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
