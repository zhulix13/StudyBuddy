"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Crown, User, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createPortal } from "react-dom"
import { useGroupMembers } from "@/hooks/useGroups"

interface GroupMembersModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  groupName: string
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
    case "moderator":
      return <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    default:
      return <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
  }
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
    case "moderator":
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
  }
}

const GroupMembersModal = ({ isOpen, onClose, groupId, groupName }: GroupMembersModalProps) => {
  const { data: members, isLoading, error } = useGroupMembers(groupId)

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Group Members</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{groupName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading members...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">Failed to load members</p>
              </div>
            ) : !members || members.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">No members found</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-gray-600 shadow-sm">
                      {member.profiles?.avatar_url ? (
                        <AvatarImage
                          src={member.profiles.avatar_url || "/placeholder.svg"}
                          alt={member.profiles.full_name || member.profiles.username || "User"}
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {(member.profiles?.full_name || member.profiles?.username || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {member.profiles?.full_name || member.profiles?.username || "Unknown User"}
                        </p>
                        {getRoleIcon(member.role)}
                      </div>
                      {member.profiles?.username && member.profiles?.full_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">@{member.profiles.username}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)}`}
                    >
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {members && members.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {members.length} member{members.length !== 1 ? "s" : ""} total
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

export default GroupMembersModal
