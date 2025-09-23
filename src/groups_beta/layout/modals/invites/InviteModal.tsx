"use client"

import React, { useState, useMemo, useEffect } from "react"
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
  User,
  Search,
  Filter,
  UserX,
  Trash2,
  Eye,
  ChevronDown,
  Calendar
} from "lucide-react"
import { 
  useGroupInvites, 
  useNonMembers, 
  useCreateInvite,
  useRevokeInvite
} from "@/hooks/useInvites"
import ConfirmationModal from "./ConfirmationModal"
import Toast from "./SuccessToast"

// Types
type GroupInviteStatus = "pending" | "accepted" | "declined" | "expired" | "revoked"

interface GroupInvite {
  id: string
  group_id: string
  invited_by: string
  invitee_id?: string | null
  email?: string | null
  token: string
  status: GroupInviteStatus
  created_at: string
  expires_at: string
  invited_profile?: {
    full_name: string
    username: string
    avatar_url?: string
  }
  study_groups?: {
    name: string
    subject: string
    avatar_url?: string
  }
}

interface InvitesModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  groupName: string
}

type TabType = "all" | "users" | "email"
type InviteMethod = "user" | "email"

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
  const [inviteMethod, setInviteMethod] = useState<InviteMethod>("user")
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<GroupInviteStatus | "all">("all")
  const [showFilters, setShowFilters] = useState(false)
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: "revoke" | "delete"
    invite?: GroupInvite
  }>({ isOpen: false, type: "revoke" })
  
  // Toast states
  const [toast, setToast] = useState<{
    isOpen: boolean
    type: "success" | "error" | "warning" | "info"
    title: string
    message?: string
  }>({ isOpen: false, type: "success", title: "" })

  const { data: invites = [], isLoading: invitesLoading } = useGroupInvites(groupId)
  const { data: nonMembers = [], isLoading: usersLoading } = useNonMembers(groupId)
  const createInviteMutation = useCreateInvite()
  const revokeInviteMutation = useRevokeInvite()
  const { profile } = useAuth()

  // Auto-hide toast
  useEffect(() => {
    if (toast.isOpen) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, isOpen: false }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast.isOpen])

  // Filter and search invites
  const filteredInvites = useMemo(() => {
    let filtered = invites.filter(invite => {
      // Add expiry status dynamically
      const expired = new Date(invite.expires_at) < new Date()
      const actualStatus = expired && invite.status === "pending" ? "expired" : invite.status
      
      // Status filter
      if (statusFilter !== "all" && actualStatus !== statusFilter) {
        return false
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const email = invite.email?.toLowerCase() || ""
        const userName = invite.invited_profile?.full_name?.toLowerCase() || ""
        const username = invite.invited_profile?.username?.toLowerCase() || ""
        
        return email.includes(query) || userName.includes(query) || username.includes(query)
      }
      
      return true
    })
    
    return filtered
  }, [invites, searchQuery, statusFilter])

  const showToast = (type: "success" | "error" | "warning" | "info", title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message })
  }

  const handleEmailInvite = async () => {
    if (!emailInput.trim()) return

    try {
      const result = await createInviteMutation.mutateAsync({
        groupId,
        options: {
          email: emailInput.trim(),
          groupName,
          inviterName: profile?.full_name || "Current User",
        }
      })

      if (result.warning) {
        showToast("warning", "Invite Created", result.warning)
      } else {
        showToast("success", "Invite Sent Successfully", `Invitation sent to ${emailInput}`)
      }
      
      setEmailInput("")
    } catch (error: any) {
      showToast("error", "Failed to Send Invite", error.message || "Please try again")
    }
  }

  const handleUserInvite = async (user: any) => {
    try {
      await createInviteMutation.mutateAsync({
        groupId,
        options: {
          inviteeId: user.id,
          groupName,
          inviterName: profile?.full_name || "Current User",
        }
      })

      showToast("success", "Invite Sent Successfully", `Invitation sent to ${user.full_name || user.username}`)
      setSelectedUser(null)
    } catch (error: any) {
      showToast("error", "Failed to Send Invite", error.message || "Please try again")
    }
  }

  const handleRevokeInvite = async (invite: GroupInvite) => {
    try {
      await revokeInviteMutation.mutateAsync(invite.token)
      showToast("success", "Invite Revoked", "The invitation has been successfully revoked")
      setConfirmModal({ isOpen: false, type: "revoke" })
      setOpenDropdown(null)
    } catch (error: any) {
      showToast("error", "Failed to Revoke Invite", error.message || "Please try again")
    }
  }

  const handleDeleteInvite = (invite: GroupInvite) => {
    // TODO: Implement delete functionality when API is ready
    console.log("Delete invite:", invite.id)
    showToast("info", "Delete Feature", "Delete functionality will be implemented soon")
    setConfirmModal({ isOpen: false, type: "delete" })
    setOpenDropdown(null)
  }

  const getInviteStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      case "accepted": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "declined": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      case "expired": return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700"
      case "revoked": return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700"
    }
  }

  const getInviteStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3 h-3" />
      case "accepted": return <Check className="w-3 h-3" />
      case "declined": return <XCircle className="w-3 h-3" />
      case "expired": return <CalendarX className="w-3 h-3" />
      case "revoked": return <UserX className="w-3 h-3" />
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
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getInviteDisplayInfo = (invite: GroupInvite) => {
    if (invite.email) {
      return {
        name: invite.email,
        subtitle: "Email Invitation",
        avatar: null
      }
    } else if (invite.invited_profile) {
      return {
        name: invite.invited_profile.full_name || invite.invited_profile.username,
        subtitle: invite.invited_profile.username ? `@${invite.invited_profile.username}` : "User Invitation",
        avatar: invite.invited_profile.avatar_url
      }
    } else {
      return {
        name: "Unknown User",
        subtitle: "User Invitation",
        avatar: null
      }
    }
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
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[250] w-full max-w-5xl max-h-[85vh] bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
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
            <Eye className="w-4 h-4" />
            All Invites ({invites.length})
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
            Invite Users ({nonMembers.length})
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
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by email, name, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Filter className="w-4 h-4" />
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </button>
                  
                  {showFilters && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      {["all", "pending", "accepted", "declined", "expired", "revoked"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status as GroupInviteStatus | "all")
                            setShowFilters(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors capitalize ${
                            statusFilter === status
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {invitesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredInvites.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                    {searchQuery || statusFilter !== "all" ? "No matching invites found" : "No invites yet"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your search or filters"
                      : "Start inviting users to your group"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInvites.map((invite) => {
                    const expired = isExpired(invite.expires_at)
                    const actualStatus = expired && invite.status === "pending" ? "expired" : invite.status
                    const displayInfo = getInviteDisplayInfo(invite)

                    return (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-slate-600 flex items-center justify-center flex-shrink-0">
                            {displayInfo.avatar ? (
                              <img
                                src={displayInfo.avatar}
                                alt={displayInfo.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white truncate">
                                {displayInfo.name}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getInviteStatusColor(actualStatus)}`}>
                                {getInviteStatusIcon(actualStatus)}
                                {actualStatus}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{displayInfo.subtitle}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Sent: {formatDate(invite.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires: {formatDate(invite.expires_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === invite.id ? null : invite.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {openDropdown === invite.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                              {invite.status === "pending" && !expired && (
                                <button
                                  onClick={() => {
                                    setConfirmModal({ isOpen: true, type: "revoke", invite })
                                    setOpenDropdown(null)
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-2"
                                >
                                  <UserX className="w-4 h-4" />
                                  Revoke Invite
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setConfirmModal({ isOpen: true, type: "delete", invite })
                                  setOpenDropdown(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Invite
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Invite Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : nonMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No available users</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    All registered users are already in this group or have pending invitations
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nonMembers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name || user.username || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white" />
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
                          {user.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleUserInvite(user)}
                        disabled={createInviteMutation.isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invite by Email Tab */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <p className="text-gray-700 dark:text-gray-300">
                  Send an email invitation
                </p>
              </div>

              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  onClick={handleEmailInvite}
                  disabled={createInviteMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Invite
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.invite && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, type: "revoke" })}
          onConfirm={() =>
            confirmModal.type === "revoke"
              ? handleRevokeInvite(confirmModal.invite!)
              : handleDeleteInvite(confirmModal.invite!)
          }
          title={
            confirmModal.type === "revoke"
              ? "Revoke Invitation"
              : "Delete Invitation"
          }
          message={
            confirmModal.type === "revoke"
              ? "Are you sure you want to revoke this invitation? The user will no longer be able to join using this link."
              : "Are you sure you want to permanently delete this invitation? This action cannot be undone."
          }
          type={confirmModal.type === "revoke" ? "warning" : "danger"}
          confirmText={confirmModal.type === "revoke" ? "Revoke" : "Delete"}
          cancelText="Cancel"
          isLoading={revokeInviteMutation.isPending}
        />
      )}

      {/* Toast */}
      {toast.isOpen && (
        <Toast
          isOpen={toast.isOpen}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </AnimatePresence>,
    document.body
  )
}

export default InvitesModal