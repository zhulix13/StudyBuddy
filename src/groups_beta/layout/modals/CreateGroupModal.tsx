// Desktop Create Group Panel with Supabase Integration

"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  X,
  Camera,
  Upload,
  Loader2,
  Info,
  Lock,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useCreateGroup } from "@/hooks/useGroups";
import type { CreateGroupData } from "@/types/groups";
import { MobileCreateGroupPanel } from "./CreateGroupModalMobile";
import { SuccessModal } from "./SuccessModal";
import { ErrorModal } from "./ErrorModal";
// Desktop Panel Variants
const desktopPanelVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.4,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
      duration: 0.3,
    },
  },
};

const desktopBackdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Modal variants for success/error
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
};



// Desktop Create Group Panel
const DesktopCreateGroupPanel = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (group: any) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
    is_private: false,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Supabase mutation
  const createGroupMutation = useCreateGroup({
    onSuccess: (newGroup) => {
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        resetForm();
        onSuccess?.(newGroup);
        onClose();
      }, 2000);
    },
    onError: (error) => {
      console.error("Create group error:", error);
      setShowErrorModal(true);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      description: "",
      is_private: false,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    createGroupMutation.reset();
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      createGroupMutation.error = new Error("Please select a valid image file");
      setShowErrorModal(true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      createGroupMutation.error = new Error("Image size must be less than 5MB");
      setShowErrorModal(true);
      return;
    }

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      createGroupMutation.error = new Error("Group name is required");
      setShowErrorModal(true);
      return;
    }
    if (!formData.subject.trim()) {
      createGroupMutation.error = new Error("Subject is required");
      setShowErrorModal(true);
      return;
    }

    const createData: CreateGroupData = {
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      is_private: formData.is_private,
    };

    // TODO: Handle avatar upload to storage and add avatar_url to createData
    // For now, we'll create without avatar

    createGroupMutation.mutate(createData);
  };

  const handleClose = () => {
    if (!createGroupMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !createGroupMutation.isPending) {
      handleClose();
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !createGroupMutation.isPending) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, createGroupMutation.isPending]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={desktopBackdropVariants}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] dark:bg-black/40"
              onClick={handleBackdropClick}
            />

            {/* Panel */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={desktopPanelVariants}
              className="fixed top-0 right-0 h-full w-[480px] bg-white dark:bg-[#111827] shadow-2xl z-[150] border-l border-gray-200 dark:border-gray-700 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create Study Group
                </h2>
                <button
                  onClick={handleClose}
                  disabled={createGroupMutation.isPending}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 ring-2 ring-gray-200 dark:ring-gray-700 rounded-full overflow-hidden">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Group avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-2xl flex items-center justify-center">
                            {formData.name.charAt(0).toUpperCase() || "G"}
                          </div>
                        )}
                      </div>
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
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Group Name *
                      </label>
                      <input
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter group name"
                        maxLength={50}
                        disabled={createGroupMutation.isPending}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        {formData.name.length}/50
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <input
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange("subject", e.target.value)
                        }
                        placeholder="e.g., Mathematics, Physics, Computer Science"
                        maxLength={30}
                        disabled={createGroupMutation.isPending}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        {formData.subject.length}/30
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Brief description of what this group is about..."
                        maxLength={200}
                        rows={3}
                        disabled={createGroupMutation.isPending}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        {formData.description.length}/200
                      </div>
                    </div>

                    {/* Privacy Setting */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="private"
                          checked={formData.is_private}
                          onChange={(e) =>
                            handleInputChange("is_private", e.target.checked)
                          }
                          disabled={createGroupMutation.isPending}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="private"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            Make this group private
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                          >
                            <div className="flex items-start gap-2">
                              {formData.is_private ? (
                                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="text-sm text-blue-800 dark:text-blue-200">
                                {formData.is_private ? (
                                  <>
                                    <p className="font-medium mb-1">
                                      Private Group
                                    </p>
                                    <p>
                                      Only you can view this group. People can
                                      only join when you invite them directly.
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-medium mb-1">
                                      Public Group
                                    </p>
                                    <p>
                                      Anyone can discover and join this group.
                                      It will appear in search results.
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Inline Error Display */}
                    {createGroupMutation.error && !showErrorModal && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {createGroupMutation.error.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={createGroupMutation.isPending}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createGroupMutation.isPending ||
                      !formData.name.trim() ||
                      !formData.subject.trim()
                    }
                    className="min-w-[100px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
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
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      {createPortal(
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          groupName={formData.name}
          desktopBackdropVariants={desktopBackdropVariants}
          modalVariants={modalVariants}
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
          desktopBackdropVariants={desktopBackdropVariants}
          modalVariants={modalVariants}
        />,
        document.body
      )}
    </>
  );
};

// Main Create Group Slider Panel Component
export const CreateGroupSliderPanel = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (group: any) => void;
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileCreateGroupPanel
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  return createPortal(
    <DesktopCreateGroupPanel
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />,
    document.body
  );
};
