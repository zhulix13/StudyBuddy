"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Trash2, Loader2, Upload, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useUpdateGroup } from "@/hooks/useGroups"
import { uploadGroupAvatar } from "@/services/upload"

const GroupDetailsEditDesktop = ({
  group,
  onClose,
  onSave,
  onDelete,
}: {
  group: { id: string; name: string; subject: string; description: string; avatar_url?: string | null }
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

  const isLoading = updateGroupMutation.isPending

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#111827]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Group</h3>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        {/* Avatar Upload Section */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Avatar className="w-16 h-16 ring-2 ring-white dark:ring-gray-600 shadow-md">
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
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg"
            >
              <Camera className="w-4 h-4" />
              {avatarFile ? "Change Avatar" : "Upload Avatar"}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 5MB, JPG/PNG only</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Group Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-50 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter group name"
              maxLength={50}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{formData.name.length}/50</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-50 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., Mathematics, Physics, etc."
              maxLength={30}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{formData.subject.length}/30</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isLoading}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-50 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Brief description of the study group..."
              maxLength={200}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {formData.description ? formData.description.length : 0}/200
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.name.trim() || !formData.subject.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] justify-center font-medium shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupDetailsEditDesktop
