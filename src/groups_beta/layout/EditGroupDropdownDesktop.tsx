"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Trash2, Loader2, Upload, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { updateGroup, deleteOwnGroup } from "@/services/supabase-groups"
import { uploadGroupAvatar } from "@/services/upload"

const GroupDetailsEditDesktop = ({ group, onClose, onSave, onDelete }) => {
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
      const finalUpdateData: Record<string, any> = {
        ...(typeof updateData === "object" && updateData !== null ? updateData : {}),
      }

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

      await updateGroup(group.id, finalUpdateData)
      return finalUpdateData
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] })
      queryClient.invalidateQueries({ queryKey: ["group", group.id] })
      toast.success("Group updated successfully!")
      onSave?.({ ...group, ...updatedData })
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

  const handleSave = () => {
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
    }

    updateGroupMutation.mutate(updateData)
  }

  const handleDelete = () => {
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

  const isLoading = updateGroupMutation.isPending || deleteGroupMutation.isPending

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">Edit Group</h3>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
              rows={4}
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
      <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
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
  )
}

export default GroupDetailsEditDesktop
