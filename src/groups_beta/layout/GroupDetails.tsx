"use client"

import { Users, Crown, LogOut, Edit3 } from "lucide-react"
import { FileText } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import EditGroupDropdown from "./EditGroupDropdown"

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scaleY: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, y: -10, scaleY: 0.95, transition: { duration: 0.2 } },
}

const GroupDetailsDropdown = ({ group, isExpanded, onLeaveGroup, onSaveEdit, onDeleteGroup }) => {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleSaveEdit = (formData) => {
    onSaveEdit(formData)
    setIsEditOpen(false)
  }

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dropdownVariants}
          className="bg-gray-50 border-t origin-top relative"
        >
          <div className="px-6 py-4 space-y-4">
            {/* Header with Edit Button */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Group Details</h3>
              {group.user_role === "admin" && (
                <button
                  onClick={() => setIsEditOpen(!isEditOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-200"
                  title="Edit Group"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Group Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Members:</span>
                <span className="font-medium">{group.member_count}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">Notes:</span>
                <span className="font-medium">{group.notesCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600">Admins:</span>
                <span className="font-medium">{group.adminCount}</span>
              </div>
                <div className="text-sm">
                  <span className="text-gray-600">Created:</span>
                  {new Date(group.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <span className="text-sm text-gray-600">Subject: </span>
              <span className="font-medium text-sm">{group.subject}</span>
            </div>

            {/* Leave Group Button */}
            <div className="pt-2 border-t">
              <button
                onClick={onLeaveGroup}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Leave Group
              </button>
            </div>
          

          {/* Edit Group Dropdown - positioned to slide from right */}
          <EditGroupDropdown
            group={group}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSave={handleSaveEdit}
            onDelete={onDeleteGroup}
          />
        </motion.div>
      )}
   
    </AnimatePresence>
  )
}

export default GroupDetailsDropdown
