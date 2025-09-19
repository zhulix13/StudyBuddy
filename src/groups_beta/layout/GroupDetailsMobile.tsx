"use client"

import { Users, Crown, LogOut, Edit3, ArrowLeft } from "lucide-react"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import GroupDetailsEditMobile from "./GroupDetailsEditMobile"
import { useUpdateGroup, useLeaveGroup, useDeleteGroup, useGroupMembers } from "@/hooks/useGroups"
import ConfirmationModalMobile from "./modals/ConfirmationModalMobile"
import GroupMembersModalMobile from "./modals/GroupMembersModalMobile"

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

const GroupDetailsMobile = ({
  group,
  isOpen,
  onClose,
}: {
  group: any
  isOpen: boolean
  onClose: () => void
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)

  const updateGroupMutation = useUpdateGroup()
  const leaveGroupMutation = useLeaveGroup()
  const deleteGroupMutation = useDeleteGroup()
  const { data: groupMembers } = useGroupMembers(group.id || "")

  const handleSaveEdit = (formData: any) => {
    if (!group.id) return

    const updates = {
      name: formData.name,
      subject: formData.subject,
      description: formData.description,
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants as any}
            className="fixed inset-0 bg-white dark:bg-[#111827] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Group Info</h1>
              </div>
              {group.user_role === "admin" && (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Edit Group"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Group Avatar & Basic Info */}
              <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {group.avatar_url ? (
                    <img
                      src={group.avatar_url || "/placeholder.svg"}
                      alt={group.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    group.name.charAt(0).toUpperCase()
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">{group.subject}</p>
                {group.description && (
                  <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm leading-relaxed max-w-sm mx-auto">
                    {group.description}
                  </p>
                )}
              </div>

              {/* Stats Section */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Statistics</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowMembersModal(true)}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-blue-900 dark:text-blue-300">Members</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">Active participants</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{group.member_count}</span>
                  </button>

                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-300">Notes</p>
                        <p className="text-sm text-green-700 dark:text-green-400">Shared documents</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-400">{group.notesCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-300">Admins</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">Group moderators</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{group.adminCount}</span>
                  </div>
                </div>
              </div>

              {/* Group Details */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(group.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Your Role</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{group.user_role}</span>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="p-6">
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="w-full flex items-center justify-center gap-3 p-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors rounded-lg border border-red-200 dark:border-red-800"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Leave Group</span>
                </button>
              </div>

              {/* Bottom Padding for safe area */}
              <div className="h-8" />
            </div>

            {/* Edit Modal - Full Screen Overlay */}
            <GroupDetailsEditMobile
              group={group}
              isOpen={isEditOpen}
              onClose={handleEditClose}
              onSave={handleSaveEdit}
              onDelete={() => setShowDeleteConfirm(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-specific Confirmation Modals */}
      <ConfirmationModalMobile
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeaveGroup}
        title="Leave Group"
        message={`Are you sure you want to leave "${group.name}"? You'll lose access to all group content.`}
        confirmText="Leave Group"
        confirmVariant="danger"
        isLoading={leaveGroupMutation.isPending}
      />

      <ConfirmationModalMobile
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Group"
        message={`Are you sure you want to permanently delete "${group.name}"? This action cannot be undone and all group data will be lost.`}
        confirmText="Delete Group"
        confirmVariant="danger"
        isLoading={deleteGroupMutation.isPending}
      />

      <GroupMembersModalMobile
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        groupId={group.id || ""}
        groupName={group.name || ""}
      />
    </>
  )
}

export default GroupDetailsMobile
