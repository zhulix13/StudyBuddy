// Mobile Create Group Panel with Supabase Integration

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Upload, Loader2, Info, Lock, Globe, ChevronDown, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { createPortal } from "react-dom"
import { useCreateGroup } from "@/hooks/useGroups"
import type { CreateGroupData } from "@/types/groups"

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, groupName }: { isOpen: boolean; onClose: () => void; groupName: string }) => {
  const slideVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { type: "spring", stiffness: 400, damping: 40 },
    },
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideVariants}
          className="bg-white dark:bg-[#111827] rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700 w-full max-w-md mb-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Group Created!</h3>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base">
              "{groupName}" has been created successfully. You are now the admin of this group.
            </p>

            <button
              onClick={onClose}
              className="w-full px-4 py-4 text-base font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>

          {/* Safe area padding */}
          <div className="h-8" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Error Modal Component
const ErrorModal = ({ isOpen, onClose, error, onRetry }: { 
  isOpen: boolean; 
  onClose: () => void; 
  error: string;
  onRetry?: () => void;
}) => {
  const slideVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { type: "spring", stiffness: 400, damping: 40 },
    },
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideVariants}
          className="bg-white dark:bg-[#111827] rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700 w-full max-w-md mb-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Failed to Create Group</h3>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base">
              {error || "An unexpected error occurred. Please try again."}
            </p>

            <div className="space-y-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full px-4 py-4 text-base font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full px-4 py-4 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Safe area padding */}
          <div className="h-8" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export const MobileCreateGroupPanel = ({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (group: any) => void;
}) => {
  // Mobile Panel Variants
  const mobilePanelVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { type: "spring", stiffness: 400, damping: 40 },
    },
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPrivateInfo, setShowPrivateInfo] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
    is_private: false,
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Supabase mutation
  const createGroupMutation = useCreateGroup({
    onSuccess: (newGroup) => {
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        resetForm()
        onSuccess?.(newGroup)
        onClose()
      }, 2000)
    },
    onError: (error) => {
      console.error("Create group error:", error)
      setShowErrorModal(true)
    }
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      description: "",
      is_private: false,
    })
    setAvatarFile(null)
    setAvatarPreview(null)
    createGroupMutation.reset()
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      createGroupMutation.error = new Error("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      createGroupMutation.error = new Error("Image size must be less than 5MB")
      return
    }

    setAvatarFile(file)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      createGroupMutation.error = new Error("Group name is required")
      setShowErrorModal(true)
      return
    }
    if (!formData.subject.trim()) {
      createGroupMutation.error = new Error("Subject is required")
      setShowErrorModal(true)
      return
    }

    const createData: CreateGroupData = {
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      is_private: formData.is_private,
    }

    // TODO: Handle avatar upload to storage and add avatar_url to createData
    // For now, we'll create without avatar

    createGroupMutation.mutate(createData)
  }

  const handleClose = () => {
    if (!createGroupMutation.isPending) {
      resetForm()
      onClose()
    }
  }

  const handleRetry = () => {
    setShowErrorModal(false)
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobilePanelVariants}
            className="fixed inset-0 bg-white dark:bg-[#111827] z-150 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  disabled={createGroupMutation.isPending}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Create Study Group</h1>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 ring-2 ring-gray-200 dark:ring-gray-700 rounded-full overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Group avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-3xl flex items-center justify-center">
                          {formData.name.charAt(0).toUpperCase() || "G"}
                        </div>
                      )}
                    </div>
                    {avatarFile && (
                      <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
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
                    disabled={createGroupMutation.isPending}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={createGroupMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    {avatarFile ? "Change Photo" : "Add Photo"}
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Group Name *
                    </label>
                    <input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter group name"
                      maxLength={50}
                      disabled={createGroupMutation.isPending}
                      className="w-full h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                      {formData.name.length}/50
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Subject *
                    </label>
                    <input
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="e.g., Mathematics, Physics, Computer Science"
                      maxLength={30}
                      disabled={createGroupMutation.isPending}
                      className="w-full h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                      {formData.subject.length}/30
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Brief description of what this group is about..."
                      maxLength={200}
                      rows={4}
                      disabled={createGroupMutation.isPending}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                      {formData.description.length}/200
                    </div>
                  </div>

                  {/* Privacy Setting */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="private-mobile"
                        checked={formData.is_private}
                        onChange={(e) => handleInputChange("is_private", e.target.checked)}
                        disabled={createGroupMutation.isPending}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <label
                          htmlFor="private-mobile"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          Make this group private
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${showPrivateInfo ? "rotate-180" : ""}`}
                          />
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
                          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            {formData.is_private ? (
                              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              {formData.is_private ? (
                                <>
                                  <p className="font-medium mb-2">Private Group</p>
                                  <p>
                                    Only you can view this group. People can only join when you invite them directly.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="font-medium mb-2">Public Group</p>
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
              <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={createGroupMutation.isPending}
                  className="flex-1 h-12 text-base bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createGroupMutation.isPending || !formData.name.trim() || !formData.subject.trim()}
                  className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {createGroupMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      {createPortal(
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          groupName={formData.name}
        />,
        document.body
      )}

      {/* Error Modal */}
      {createPortal(
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          error={createGroupMutation.error?.message || ""}
          onRetry={handleRetry}
        />,
        document.body
      )}
    </>
  )
}