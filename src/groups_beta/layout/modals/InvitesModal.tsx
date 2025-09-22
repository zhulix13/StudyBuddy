"use client"

import React, { useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/Authcontext"
import { 
  X, 
  Mail, 
  Users, 
  UserPlus, 
  Clock, 
  Check, 
  XCircle, 
  MoreHorizontal,
  Send,
  CalendarX,
  AlertCircle,
  User
} from "lucide-react"
import { 
  useGroupInvites, 
  useNonMembers, 
  useCreateInvite,
  useDeclineInvite
} from "@/hooks/useInvites"
import type { GroupInvite } from "@/types/invites"

interface InvitesModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  groupName: string
}

type TabType = "all" | "users" | "email"

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

const InvitesModal: React.FC<InvitesModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [emailInput, setEmailInput] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const { data: invites = [], isLoading: invitesLoading } = useGroupInvites(groupId)

  const { data: nonMembers = [], isLoading: usersLoading } = useNonMembers(groupId)
  const createInviteMutation = useCreateInvite()
  const declineInviteMutation = useDeclineInvite()
  const { profile } = useAuth()
  const handleEmailInvite = () => {
    if (!emailInput.trim()) return


    createInviteMutation.mutate(
      {
        groupId,
        options: {
          email: emailInput.trim(),
          groupName,
          inviterName: profile?.full_name || "Current User", // Replace with actual user name
        }
      },
      {
        onSuccess: () => {
          setEmailInput("")
        }
      }
    )
  }

  const handleUserInvite = (user: any) => {
    createInviteMutation.mutate(
      {
        groupId,
        options: {
          inviteeId: user.id,
          groupName,
          inviterName: profile?.full_name || "Current User", // Replace with actual user name
        }
      },
      {
        onSuccess: () => {
          setSelectedUser(null)
        }
      }
    )
  }

  const handleRevokeInvite = (invite: GroupInvite) => {
    declineInviteMutation.mutate(invite.token, {
      onSuccess: () => {
        setOpenDropdown(null)
      }
    })
  }

  const getInviteStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
      case "accepted": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
      case "declined": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
      case "expired": return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20"
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20"
    }
  }

  const getInviteStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3 h-3" />
      case "accepted": return <Check className="w-3 h-3" />
      case "declined": return <XCircle className="w-3 h-3" />
      case "expired": return <CalendarX className="w-3 h-3" />
      default: return <AlertCircle className="w-3 h-3" />
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] dark:bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants as any}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[250] w-full max-w-4xl max-h-[80vh] bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Invites
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {groupName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <Mail className="w-4 h-4" />
            All Invites
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "users"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Invite Users
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "email"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Invite by Email
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* All Invites Tab */}
          {activeTab === "all" && (
            <div className="space-y-4">
              {invitesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : invites.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No invites yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Start inviting users to your group
                  </p>
                </div>
              ) : (
                invites.map((invite) => {
                  const expired = isExpired(invite.expires_at)
                  const actualStatus = expired && invite.status === "pending" ? "expired" : invite.status

                  return (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {invite.email || "User Invite"}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getInviteStatusColor(actualStatus)}`}>
                              {getInviteStatusIcon(actualStatus)}
                              {actualStatus}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Expires: {formatDate(invite.expires_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === invite.id ? null : invite.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {openDropdown === invite.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            {invite.status === "pending" && !expired && (
                              <button
                                onClick={() => handleRevokeInvite(invite)}
                                disabled={declineInviteMutation.isPending}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-t-lg transition-colors disabled:opacity-50"
                              >
                                Revoke Invite
                              </button>
                            )}
                            <button
                              onClick={() => console.log("Delete invite", invite.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
                            >
                              Delete Invite
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Invite Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : nonMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No available users</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    All registered users are already in this group
                  </p>
                </div>
              ) : (
                nonMembers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || user.username || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.full_name || user.username || "Unknown User"}
                        </p>
                        {user.username && user.full_name && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{user.username}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedUser(user)}
                      disabled={createInviteMutation.isPending}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Invite by Email Tab */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-300">
                    Invite by Email
                  </h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                  Send an invitation to someone who doesn't have an account yet
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <button
                    onClick={handleEmailInvite}
                    disabled={!emailInput.trim() || createInviteMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {createInviteMutation.isPending ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </div>
              
              {/* Success/Error Messages */}
              {createInviteMutation.isSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-green-800 dark:text-green-300 font-medium">
                      Invite sent successfully!
                    </p>
                  </div>
                </div>
              )}
              
              {createInviteMutation.isError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-800 dark:text-red-300 font-medium">
                      Failed to send invite. Please try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* User Confirmation Modal */}
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Invitation
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Do you want to invite{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedUser.full_name || selectedUser.username || "this user"}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {groupName}
              </span>?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUserInvite(selectedUser)}
                disabled={createInviteMutation.isPending}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createInviteMutation.isPending ? "Inviting..." : "Send Invite"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default InvitesModal