"use client"

import { useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, X, Trash2, Loader2, Upload, Lock, Unlock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { updateGroup, deleteOwnGroup } from "@/services/supabase-groups"
import { uploadGroupAvatar } from "@/services/upload"

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
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: group.name,
    subject: group.subject,
    description: group.description,
    avatar_url: group.avatar_url || null,
  })
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(group.avatar_url || null)

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async (updateData) => {
      let finalUpdateData: Record<string, any> = { ...(typeof updateData === "object" && updateData !== null ? updateData : {}) }
      
      // Upload avatar if a new file was selected
      if (avatarFile) {
        try {
          const avatarResult = await uploadGroupAvatar(group.id, avatarFile)
          finalUpdateData.avatar_url = avatarResult.publicUrl
        } catch (error) {
          const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error)
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
    }
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
    }
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
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
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
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
    toast.warning(
      `Are you sure you want to delete "${group.name}"?`,
      {
        action: {
          label: "Delete",
          onClick: () => deleteGroupMutation.mutate(),
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
        duration: 10000,
      }
    )
  }

  const isLoading = updateGroupMutation.isPending || deleteGroupMutation.isPending

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
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
                <h3 className="font-semibold text-gray-900">Edit Group</h3>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar Upload */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Group avatar" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                        {formData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {avatarFile && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Upload className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                
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
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  {avatarFile ? "Change Avatar" : "Upload Avatar"}
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:opacity-50 transition-colors"
                    placeholder="Enter group name"
                    maxLength={50}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.name.length}/50 characters
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:opacity-50 transition-colors"
                    placeholder="e.g., Mathematics, Physics, etc."
                    maxLength={30}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.subject.length}/30 characters
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    disabled={isLoading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:opacity-50 transition-colors"
                    placeholder="Brief description of the study group..."
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                  {(formData.description ? formData.description.length : 0)}/200 characters
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50 hover:bg-red-50 px-2 py-1 rounded-md"
                >
                  {deleteGroupMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleteGroupMutation.isPending ? "Deleting..." : "Delete Group"}
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 hover:bg-gray-50 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading || !formData.name.trim() || !formData.subject.trim()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] justify-center"
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