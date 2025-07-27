"use client"

import { Users, Crown, LogOut, Edit3, X } from "lucide-react"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import EditGroupDropdown from "./EditGroupDropdown"

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

const GroupDetailsModal = ({ group, isOpen, onClose, onLeaveGroup, onSaveEdit, onDeleteGroup, triggerRef }) => {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const modalWidth = 400 // Approximate modal width
      const viewportWidth = window.innerWidth

      // Position below the trigger element
      let left = rect.left
      let top = rect.bottom + 8

      // Adjust if modal would go off-screen horizontally
      if (left + modalWidth > viewportWidth - 16) {
        left = viewportWidth - modalWidth - 16
      }
      if (left < 16) {
        left = 16
      }

      // Adjust if modal would go off-screen vertically
      const modalHeight = 400 // Approximate modal height
      if (top + modalHeight > window.innerHeight - 16) {
        top = rect.top - modalHeight - 8
      }

      setModalPosition({ top, left })
    }
  }, [isOpen, triggerRef])

  const handleSaveEdit = (formData) => {
    onSaveEdit(formData)
    setIsEditOpen(false)
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="fixed z-50 w-full max-w-md mx-4 sm:mx-0 sm:w-96"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-lg font-semibold text-gray-900">Group Details</h3>
                <div className="flex items-center gap-2">
                  {group.user_role === "admin" && (
                    <button
                      onClick={() => setIsEditOpen(!isEditOpen)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-white/50"
                      title="Edit Group"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Group Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Members</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-700">{group.member_count}</span>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Notes</span>
                    </div>
                    <span className="text-2xl font-bold text-green-700">{group.notesCount}</span>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Admins</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-700">{group.adminCount}</span>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-purple-900 mb-1">Created</span>
                      <span className="text-xs text-purple-700 font-medium">
                        {new Date(group.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">Subject</span>
                    <span className="text-gray-900 font-medium">{group.subject}</span>
                  </div>
                </div>

                {/* Description if available */}
                {group.description && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-700">Description</span>
                      <span className="text-gray-900 text-sm">{group.description}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={onLeaveGroup}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors hover:bg-red-50 px-3 py-2 rounded-lg w-full justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Group
                </button>
              </div>

              {/* Edit Group Dropdown */}
              <EditGroupDropdown
                group={group}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={handleSaveEdit}
                onDelete={onDeleteGroup}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default GroupDetailsModal
