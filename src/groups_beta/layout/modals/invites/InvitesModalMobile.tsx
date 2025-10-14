"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/Authcontext"
import {
  ArrowLeft,
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
  User,
  Search,
  X,
} from "lucide-react"
import { useGroupInvites, useNonMembers, useCreateInvite, useDeclineInvite } from "@/hooks/useInvites"
import type { GroupInvite } from "@/types/invites"

interface InvitesModalMobileProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  groupName: string
}

type TabType = "all" | "users" | "email"

const slideVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { type: "spring", stiffness: 400, damping: 40 },
  },
}

const InvitesModalMobile: React.FC<InvitesModalMobileProps> = ({ isOpen, onClose, groupId, groupName }) => {
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [emailInput, setEmailInput] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  const { data: invites = [], isLoading: invitesLoading } = useGroupInvites(groupId)
  const { data: nonMembers = [], isLoading: usersLoading } = useNonMembers(groupId)
  const createInviteMutation = useCreateInvite()
  const declineInviteMutation = useDeclineInvite()
  const { profile } = useAuth()

  const filteredInvites = useMemo(() => {
    if (!searchQuery.trim()) return invites
    return invites.filter(
      (invite) =>
        invite.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invite.invitee_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [invites, searchQuery])

  const filteredNonMembers = useMemo(() => {
    if (!searchQuery.trim()) return nonMembers
    return nonMembers.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [nonMembers, searchQuery])

  const handleEmailInvite = () => {
    if (!emailInput.trim()) return

    createInviteMutation.mutate(
      {
        groupId,
        options: {
          email: emailInput.trim(),
          groupName,
          inviterName: profile?.full_name || "Current User",
        },
      },
      {
        onSuccess: () => {
          setEmailInput("")
        },
      },
    )
  }

  const handleUserInvite = (user: any) => {
    createInviteMutation.mutate(
      {
        groupId,
        options: {
          inviteeId: user.id,
          groupName,
          inviterName: profile?.full_name || "Current User",
        },
      },
      {
        onSuccess: () => {
          setSelectedUser(null)
        },
      },
    )
  }

  const handleRevokeInvite = (invite: GroupInvite) => {
    declineInviteMutation.mutate(invite.token, {
      onSuccess: () => {
        setOpenDropdown(null)
      },
    })
  }

  const getInviteStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
      case "accepted":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
      case "declined":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
      case "expired":
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20"
    }
  }

  const getInviteStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />
      case "accepted":
        return <Check className="w-3 h-3" />
      case "declined":
        return <XCircle className="w-3 h-3" />
      case "expired":
        return <CalendarX className="w-3 h-3" />
      default:
        return <AlertCircle className="w-3 h-3" />
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideVariants as any}
          className="fixed inset-0 bg-white dark:bg-[#111827] z-60 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] sticky top-0 z-10 shadow-sm">
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Invites</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{groupName}</p>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {showSearch && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invites or users..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
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
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
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
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                activeTab === "email"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              By Email
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* All Invites Tab */}
            {activeTab === "all" && (
              <div className="p-4 space-y-3">
                {invitesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredInvites.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {searchQuery ? "No invites found" : "No invites yet"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {searchQuery ? "Try adjusting your search" : "Start inviting users to your group"}
                    </p>
                  </div>
                ) : (
                  filteredInvites.map((invite) => {
                    const expired = isExpired(invite.expires_at)
                    const actualStatus = expired && invite.status === "pending" ? "expired" : invite.status

                    return (
                      <div
                        key={invite.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {invite.email || invite.invited_profile.full_name || "User Invite"}
                            </span>
                          </div>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-1 ${getInviteStatusColor(actualStatus)}`}
                          >
                            {getInviteStatusIcon(actualStatus)}
                            {actualStatus}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Expires: {formatDate(invite.expires_at)}
                          </p>
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
              <div className="p-4 space-y-3">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredNonMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {searchQuery ? "No users found" : "No available users"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {searchQuery ? "Try adjusting your search" : "All registered users are already in this group"}
                    </p>
                  </div>
                ) : (
                  filteredNonMembers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url || "/placeholder.svg"}
                            alt={user.full_name || user.username || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {user.full_name || user.username || "Unknown User"}
                        </p>
                        {user.username && user.full_name && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">@{user.username}</p>
                        )}
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
              <div className="p-4 space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-300">Invite by Email</h4>
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
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    <button
                      onClick={handleEmailInvite}
                      disabled={!emailInput.trim() || createInviteMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      {createInviteMutation.isPending ? "Sending..." : "Send Invite"}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {createInviteMutation.isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <p className="text-green-800 dark:text-green-300 font-medium">Invite sent successfully!</p>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        They'll receive an email with instructions to join.
                      </p>
                    </motion.div>
                  )}

                  {createInviteMutation.isError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <p className="text-red-800 dark:text-red-300 font-medium">Failed to send invite</p>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        Please check the email address and try again.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Bottom Padding for safe area */}
            <div className="h-8" />
          </div>

          {/* User Confirmation Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/50 z-70 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl mx-4"
              >
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Invitation</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Do you want to invite{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.full_name || selectedUser.username || "this user"}
                  </span>{" "}
                  to <span className="font-medium text-gray-900 dark:text-white">{groupName}</span>?
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
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InvitesModalMobile
