"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Upload, Loader2, Info, Lock, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { createGroup } from "@/services/supabase-groups"
import { uploadGroupAvatar } from "@/services/upload"
import { supabase } from "@/services/supabase" // Import supabase client
import type { StudyGroup } from "@/types/groups"

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (group: StudyGroup) => void
}

const CreateGroupModal = ({ isOpen, onClose, onSuccess }: CreateGroupModalProps) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPrivateInfo, setShowPrivateInfo] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
    is_private: false,
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: typeof formData) => {
      // Create the group first
      const newGroup = await createGroup(groupData)

      // Upload avatar if provided
      if (avatarFile) {
        try {
          const avatarResult = await uploadGroupAvatar(newGroup.id, avatarFile)
          // Update group with avatar URL
          const { data: updatedGroup } = await supabase
            .from("study_groups")
            .update({ avatar_url: avatarResult.publicUrl })
            .eq("id", newGroup.id)
            .select()
            .single()

          return { ...updatedGroup, member_count: 1, user_role: "admin" }
        } catch (error) {
          console.warn("Failed to upload avatar, but group was created:", error)
          return newGroup
        }
      }

      return newGroup
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] })
      toast.success("Group created successfully!")
      onSuccess(newGroup)
      resetForm()
    },
    onError: (error: any) => {
      console.error("Create group error:", error)
      toast.error(error?.message || "Failed to create group")
    },
  })

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      description: "",
      is_private: false,
    })
    setAvatarFile(null)
    setAvatarPreview(null)
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Group name is required")
      return
    }
    if (!formData.subject.trim()) {
      toast.error("Subject is required")
      return
    }

    createGroupMutation.mutate({
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      is_private: formData.is_private,
    })
  }

  const handleClose = () => {
    if (!createGroupMutation.isPending) {
      resetForm()
      onClose()
    }
  }

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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 sm:mx-0"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-xl font-semibold text-gray-900">Create Study Group</h2>
                <button
                  onClick={handleClose}
                  disabled={createGroupMutation.isPending}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white/50 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20 ring-2 ring-gray-200">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Group avatar" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-2xl">
                            {formData.name.charAt(0).toUpperCase() || "G"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {avatarFile && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Upload className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={createGroupMutation.isPending}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={createGroupMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      {avatarFile ? "Change Photo" : "Add Photo"}
                    </Button>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter group name"
                        maxLength={50}
                        disabled={createGroupMutation.isPending}
                        className="text-base"
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">{formData.name.length}/50</div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="e.g., Mathematics, Physics, Computer Science"
                        maxLength={30}
                        disabled={createGroupMutation.isPending}
                        className="text-base"
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">{formData.subject.length}/30</div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Brief description of what this group is about..."
                        maxLength={200}
                        rows={3}
                        disabled={createGroupMutation.isPending}
                        className="text-base resize-none"
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">{formData.description.length}/200</div>
                    </div>

                    {/* Privacy Setting */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="private"
                          checked={formData.is_private}
                          onCheckedChange={(checked) => handleInputChange("is_private", checked as boolean)}
                          disabled={createGroupMutation.isPending}
                        />
                        <div className="flex items-center gap-2">
                          <label htmlFor="private" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Make this group private
                          </label>
                          <button
                            type="button"
                            onMouseEnter={() => setShowPrivateInfo(true)}
                            onMouseLeave={() => setShowPrivateInfo(false)}
                            onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Privacy Info */}
                      <AnimatePresence>
                        {showPrivateInfo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                          >
                            <div className="flex items-start gap-2">
                              {formData.is_private ? (
                                <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Globe className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="text-sm text-blue-800">
                                {formData.is_private ? (
                                  <>
                                    <p className="font-medium mb-1">Private Group</p>
                                    <p>
                                      Only you can view this group. People can only join when you invite them directly.
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-medium mb-1">Public Group</p>
                                    <p>Anyone can discover and join this group. It will appear in search results.</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={createGroupMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createGroupMutation.isPending || !formData.name.trim() || !formData.subject.trim()}
                    className="min-w-[100px]"
                  >
                    {createGroupMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Group"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CreateGroupModal
