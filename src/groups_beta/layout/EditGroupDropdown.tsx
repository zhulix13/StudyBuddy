"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Camera, Save, X, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Edit Group Dropdown Component with slide-in from right animation
const slideVariants = {
  hidden: { opacity: 0, x: 20, scaleX: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scaleX: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, x: 20, scaleX: 0.95, transition: { duration: 0.2 } },
}

const EditGroupDropdown = ({ group, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: group.name,
    subject: group.subject,
    description: group.description,
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent/75 backdrop-blur-xs   z-20"
            onClick={onClose}
          />

          {/* Edit Dropdown */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            className="absolute top-0 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 origin-left"
            style={{ transform: "translateX(100%)" }}
          >
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Edit Group</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar Upload */}
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {formData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <Camera className="w-4 h-4" />
                  Change Avatar
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Group
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default EditGroupDropdown
