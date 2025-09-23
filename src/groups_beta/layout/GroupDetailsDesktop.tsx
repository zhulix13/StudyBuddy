"use client"

import type React from "react"

import { Users, Crown, LogOut, Edit3, X, Mail } from "lucide-react"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import GroupDetailsEditDesktop from "./GroupDetailsEditDesktop"
import type { StudyGroup } from "@/types/groups"
import { createPortal } from "react-dom"
import { useUpdateGroup, useLeaveGroup, useDeleteGroup, useGroupMembers } from "@/hooks/useGroups"
import ConfirmationModal from "./modals/ConfirmationModal"
import GroupMembersModal from "./modals/GroupMembersModal"
import InvitesModal from "./modals/invites/InviteModal"

interface StudyGroupExtended extends StudyGroup {
  member_count: number
  notesCount: number
  adminCount: number
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

const containerVariants = {
  details: {
    width: "400px",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  expanded: {
    width: "800px",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const GroupDetailsDesktop = ({
  group,
  isOpen,
  onClose,
  triggerRef,
  onLeaveGroup
}: {
  group: Partial<StudyGroupExtended>
  isOpen: boolean
  onClose: () => void
  onLeaveGroup: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showInvitesModal, setShowInvitesModal] = useState(false)

  const updateGroupMutation = useUpdateGroup()
  const leaveGroupMutation = useLeaveGroup()
  const deleteGroupMutation = useDeleteGroup()
  const { data: groupMembers } = useGroupMembers(group.id || "")

  useEffect(() => {
    if (isOpen) {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const modalWidth = isEditOpen ? 800 : 400
      const modalHeight = 500

      // Center the modal
      const left = (viewportWidth - modalWidth) / 2
      const top = Math.max(60, (viewportHeight - modalHeight) / 2)

      setModalPosition({ top, left })
    }
  }, [isOpen, isEditOpen])

  const handleSaveEdit = (formData: FormData) => {
    if (!group.id) return

    const updates = {
      name: formData.get("name") as string,
      subject: formData.get("subject") as string,
      description: formData.get("description") as string,
    }

    updateGroupMutation.mutate(
      { groupId: group.id, updates },
      {
        onSuccess: () => {
          setIsEditOpen(false)
        },
      },
    )
  }

  const handleLeaveGroup = () => {
    if (!group.id) return

    leaveGroupMutation.mutate(group.id, {
      onSuccess: () => {
        setShowLeaveConfirm(false)
        onClose()
        localStorage.removeItem("group-ui-store")
      },
    })
  }

  const handleDeleteGroup = () => {
    if (!group.id) return

    deleteGroupMutation.mutate(group.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false)
        onClose()
      },
    })
  }

  const handleEditClose = () => {
    setIsEditOpen(false)
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditOpen) {
          setIsEditOpen(false)
        } else {
          onClose()
        }
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, isEditOpen, onClose])

  return (
    isOpen &&
    createPortal(
      <AnimatePresence>
        <>
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed h-[100vh] inset-0 bg-black/20 backdrop-blur-sm z-[100] dark:bg-black/40"
            onClick={() => !isEditOpen && onClose()}
          />

          {/* Modal Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants as any}
            className="fixed z-[150]"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
            }}
          >
            <motion.div
              variants={containerVariants as any}
              animate={isEditOpen ? "expanded" : "details"}
              className="bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex max-h-[80vh]"
            >
              {/* Details Panel */}
              <div className="w-[400px] flex flex-col flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Group Details</h3>
                  <div className="flex items-center gap-2">
                    {group.user_role === "admin" && (
                      <>
                        <button
                          onClick={() => setShowInvitesModal(true)}
                          className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
                          title="Manage Invites"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsEditOpen(true)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
                          title="Edit Group"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Group Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowMembersModal(true)}
                      className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Members</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{group.member_count}</span>
                    </button>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-300">Notes</span>
                      </div>
                      <span className="text-2xl font-bold text-green-700 dark:text-green-400">{group.notesCount}</span>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-900 dark:text-yellow-300">Admins</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                        {group.adminCount}
                      </span>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">Created</span>
                        <span className="text-xs text-purple-700 dark:text-purple-400 font-medium">
                          {group.created_at ? String(new Date(group.created_at).toLocaleDateString()) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</span>
                      <span className="text-gray-900 dark:text-white font-medium">{group.subject}</span>
                    </div>
                  </div>

                  {/* Description if available */}
                  {group.description && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
                        <span className="text-gray-900 dark:text-white text-sm">{group.description}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg w-full justify-center"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Group
                  </button>
                </div>
              </div>

              {/* Edit Panel - Slides in from left */}
              <AnimatePresence>
                {isEditOpen && (
                  <motion.div
                    initial={{ x: -400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -400, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-[400px] border-l border-gray-200 dark:border-gray-700 flex-shrink-0"
                  >
                    <GroupDetailsEditDesktop
                      group={group as any}
                      onClose={handleEditClose}
                      onSave={handleSaveEdit}
                      onDelete={() => setShowDeleteConfirm(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Confirmation Modals */}
          <ConfirmationModal
            isOpen={showLeaveConfirm}
            onClose={() => setShowLeaveConfirm(false)}
            onConfirm={handleLeaveGroup}
            title="Leave Group"
            message={`Are you sure you want to leave "${group.name}"? You'll lose access to all group content.`}
            confirmText="Leave Group"
            confirmVariant="danger"
            isLoading={leaveGroupMutation.isPending}
          />

          <ConfirmationModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDeleteGroup}
            title="Delete Group"
            message={`Are you sure you want to permanently delete "${group.name}"? This action cannot be undone and all group data will be lost.`}
            confirmText="Delete Group"
            confirmVariant="danger"
            isLoading={deleteGroupMutation.isPending}
          />

          {/* Group Members Modal */}
          <GroupMembersModal
            isOpen={showMembersModal}
            onClose={() => setShowMembersModal(false)}
            groupId={group.id || ""}
            groupName={group.name || ""}
          />

          {/* Invites Modal */}
          <InvitesModal
            isOpen={showInvitesModal}
            onClose={() => setShowInvitesModal(false)}
            groupId={group.id || ""}
            groupName={group.name || ""}
          />
        </>
      </AnimatePresence>,
      document.body,
    )
  )
}

export default GroupDetailsDesktop