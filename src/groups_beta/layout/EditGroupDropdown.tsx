"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, X, Trash2, Loader2, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { updateGroup, deleteOwnGroup } from "@/services/supabase-groups"
import { uploadGroupAvatar } from "@/services/upload"

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const EditGroupDropdown = ({ group, isOpen, onClose, onSave, onDelete, triggerRef }) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  const [formData, setFormData] = useState({
    name: group.name,
    subject: group.subject,
    description: group.description,
    avatar_url: group.avatar_url || null,
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(group.avatar_url || null)

  // Position dropdown relative to trigger
  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const dropdownWidth = 380 // Approximate dropdown width
      const dropdownHeight = 500 // Approximate dropdown height
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let left = triggerRect.right + 8 // Position to the right of trigger
      let top = triggerRect.top

      // Adjust if dropdown would go off-screen horizontally
      if (left + dropdownWidth > viewportWidth - 16) {
        left = triggerRect.left - dropdownWidth - 8 // Position to the left instead
      }
      if (left < 16) {
        left = 16
      }

      // Adjust if dropdown would go off-screen vertically
      if (top + dropdownHeight > viewportHeight - 16) {
        top = viewportHeight - dropdownHeight - 16
      }
      if (top < 16) {
        top = 16
      }

      setDropdownPosition({ top, left })
    }
  }, [isOpen, triggerRef])

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async (updateData) => {
      const finalUpdateData: Record<string, any> = {
        ...(typeof updateData === "object" && updateData !== null ? updateData : {}),
      }

      // Upload avatar if a new file was selected
      if (avatarFile) {
        try {
          const avatarResult = await uploadGroupAvatar(group.id, avatarFile)
          finalUpdateData.avatar_url = avatarResult.publicUrl
        } catch (error) {
          const errorMessage =
            typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error)
          throw new Error(`Failed to upload avatar: ${errorMessage}`)
        }
      }

      // Update group details
      await updateGroup(group.id, finalUpdateData)
      return finalUpdateData
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] })
      queryClient.invalidateQueries({ queryKey: ["group", group.id] })
      toast.success("Group updated successfully!")
      onSave?.({ ...group, ...updatedData })
      onClose()
    },
    onError: (error: any) => {
      console.error("Update group error:", error)
      toast.error(error?.message || "Failed to update group")
    },
  })

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: () => deleteOwnGroup(group.id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["user-groups"] })
        toast.success(result.message)
        onDelete?.(group.id)
        onClose()
      } else {
        toast.error(result.message || "Failed to delete group")
      }
    },
    onError: (error: any) => {
      console.error("Delete group error:", error)
      toast.error("Failed to delete group")
    },
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setAvatarFile(file)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)

    // Cleanup previous preview URL
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }

  const handleSave = () => {
    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Group name is required")
      return
    }
    if (!formData.subject.trim()) {
      toast.error("Subject is required")
      return
    }

    const updateData = {
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      is_private: formData.is_private,
    }

    updateGroupMutation.mutate(updateData)
  }

  const handleDelete = () => {
    // Show confirmation toast
    toast.warning(`Are you sure you want to delete "${group.name}"?`, {
      action: {
        label: "Delete",
        onClick: () => deleteGroupMutation.mutate(),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      duration: 10000,
    })
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  const isLoading = updateGroupMutation.isPending || deleteGroupMutation.isPending

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
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-60"
            onClick={onClose}
          />

          {/* Edit Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className="fixed z-70 w-full max-w-sm mx-4 sm:mx-0 sm:w-96"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-lg font-semibold text-gray-900">Edit Group</h3>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {/* Avatar Upload Section */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="relative">
                    <Avatar className="w-16 h-16 ring-2 ring-white shadow-md">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Group avatar" />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                          {formData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {avatarFile && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                        <Upload className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isLoading}
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 font-medium hover:bg-blue-50 px-3 py-2 rounded-lg"
                    >
                      <Camera className="w-4 h-4" />
                      {avatarFile ? "Change Avatar" : "Upload Avatar"}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG only</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:opacity-50 transition-all"
                      placeholder="Enter group name"
                      maxLength={50}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">{formData.name.length}/50</div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:opacity-50 transition-all"
                      placeholder="e.g., Mathematics, Physics, etc."
                      maxLength={30}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">{formData.subject.length}/30</div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      disabled={isLoading}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:opacity-50 transition-all"
                      placeholder="Brief description of the study group..."
                      maxLength={200}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {formData.description ? formData.description.length : 0}/200
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50 hover:bg-red-50 px-3 py-2 rounded-lg"
                >
                  {deleteGroupMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleteGroupMutation.isPending ? "Deleting..." : "Delete"}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 hover:bg-gray-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading || !formData.name.trim() || !formData.subject.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] justify-center font-medium shadow-sm"
                  >
                    {updateGroupMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {updateGroupMutation.isPending ? "Saving..." : "Save"}
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
