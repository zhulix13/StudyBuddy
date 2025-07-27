"use client"

import { Users, Crown, LogOut, Edit3, ArrowLeft } from "lucide-react"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import GroupDetailsEditMobile from "./EditGroupMobile"

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

const GroupDetailsMobile = ({ group, isOpen, onClose, onLeaveGroup, onSaveEdit, onDeleteGroup }) => {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleSaveEdit = (formData) => {
    onSaveEdit(formData)
    setIsEditOpen(false)
  }

  const handleEditClose = () => {
    setIsEditOpen(false)
  }

  // Close on escape key (for external keyboards)
  useEffect(() => {
    const handleEscape = (e) => {
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideVariants}
          className="fixed inset-0 bg-white z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Group Info</h1>
            </div>
            {group.user_role === "admin" && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
                title="Edit Group"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Group Avatar & Basic Info */}
            <div className="p-6 text-center border-b border-gray-100">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h2>
              <p className="text-gray-600 text-lg">{group.subject}</p>
              {group.description && (
                <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-sm mx-auto">{group.description}</p>
              )}
            </div>

            {/* Stats Section */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Members</p>
                      <p className="text-sm text-blue-700">Active participants</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-700">{group.member_count}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Notes</p>
                      <p className="text-sm text-green-700">Shared documents</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-700">{group.notesCount}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Admins</p>
                      <p className="text-sm text-yellow-700">Group moderators</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-yellow-700">{group.adminCount}</span>
                </div>
              </div>
            </div>

            {/* Group Details */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {new Date(group.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Your Role</span>
                  <span className="font-medium text-gray-900 capitalize">{group.user_role}</span>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="p-6">
              <button
                onClick={onLeaveGroup}
                className="w-full flex items-center justify-center gap-3 p-4 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors rounded-lg border border-red-200"
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
            onDelete={onDeleteGroup}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GroupDetailsMobile
