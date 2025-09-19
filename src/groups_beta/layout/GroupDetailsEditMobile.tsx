"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Trash2, Loader2, Upload, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useUpdateGroup } from "@/hooks/useGroups"
import { uploadGroupAvatar } from "@/services/upload"

const slideVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 40 },
  },
}

const GroupDetailsEditMobile = ({
  group,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: {
  group: any
  isOpen: boolean
  onClose: () => void
  onSave?: (updatedGroup: any) => void
  onDelete?: () => void
}) => {
  const updateGroupMutation = useUpdateGroup()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: group.name,
    subject: group.subject,
    description: group.description,
    avatar_url: group.avatar_url || null,
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(group.avatar_url || null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setAvatarFile(file)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Group name is required")
      return
    }
    if (!formData.subject.trim()) {
      toast.error("Subject is required")
      return
    }

    const updateData: any = {
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
    }

    // Handle avatar upload if there's a new file
    if (avatarFile) {
      try {
        const avatarResult = await uploadGroupAvatar(group.id, avatarFile)
        updateData.avatar_url = avatarResult.publicUrl
      } catch (error) {
        toast.error("Failed to upload avatar")
        return
      }
    }

    updateGroupMutation.mutate(
      { groupId: group.id, updates: updateData },
      {
        onSuccess: (data) => {
          toast.success("Group updated successfully!")
          onSave?.({ ...group, ...updateData })
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to update group")
        },
      },
    )
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  const isLoading = updateGroupMutation.isPending

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideVariants}
          className="fixed inset-0 bg-white dark:bg-[#111827] z-60 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Group</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isLoading || !formData.name.trim() || !formData.subject.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Avatar Section */}
            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700">
              <div className="relative inline-block mb-4">
                <Avatar className="w-32 h-32 ring-4 ring-white dark:ring-gray-600 shadow-lg">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Group avatar" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-4xl">
                      {formData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {avatarFile && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Upload className="w-4 h-4 text-white" />
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
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg mx-auto"
              >
                <Camera className="w-5 h-5" />
                {avatarFile ? "Change Photo" : "Add Photo"}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Max 5MB • JPG, PNG</p>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-50 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter group name"
                  maxLength={50}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  {formData.name.length}/50
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-50 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Mathematics, Physics, etc."
                  maxLength={30}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  {formData.subject.length}/30
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-50 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Brief description of the study group..."
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  {formData.description ? formData.description.length : 0}/200
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Danger Zone</h3>
              <button
                onClick={onDelete}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 p-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors rounded-lg border border-red-200 dark:border-red-800 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete Group</span>
              </button>
            </div>

            {/* Bottom Padding for safe area */}
            <div className="h-8" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GroupDetailsEditMobile
