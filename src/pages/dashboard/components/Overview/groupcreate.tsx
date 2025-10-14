// QuickActionsCreateGroupModal.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Camera, 
  Upload, 
  Loader2, 
  Info, 
  Lock, 
  Globe, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { useCreateGroup } from "@/hooks/useGroups";
import type { CreateGroupData } from "@/types/groups";
import { toast } from "sonner";

interface QuickActionsCreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (group: any) => void;
  anchorRef: React.RefObject<HTMLElement>;
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export const QuickActionsCreateGroupModal = ({
  isOpen,
  onClose,
  onSuccess,
  anchorRef,
}: QuickActionsCreateGroupModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  
  const [position, setPosition] = useState({ 
    top: 0, 
    left: 0, 
    arrowPosition: 'left' as 'left' | 'top' 
  });
  
  const [showPrivateInfo, setShowPrivateInfo] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
    is_private: false,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const createGroupMutation = useCreateGroup({
    onSuccess: (newGroup) => {
      toast.success(`${newGroup.name} created successfully!`);
      resetForm();
      onSuccess(newGroup);
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create group");
    },
  });

  // Calculate position based on screen size
  useEffect(() => {
    if (!anchorRef.current || !isOpen) return;

    const buttonRect = anchorRef.current.getBoundingClientRect();
    const modalWidth = 400;
    const modalHeight = 580;
    const spacing = 12;
    const arrowSize = 8;

    const isMobile = windowWidth < 640;

    if (isMobile) {
      const top = buttonRect.top - modalHeight - spacing - arrowSize;
      const left = Math.max(
        spacing,
        Math.min(
          buttonRect.left + buttonRect.width / 2 - modalWidth / 2,
          windowWidth - modalWidth - spacing
        )
      );

      setPosition({
        top: Math.max(spacing, top),
        left,
        arrowPosition: 'top',
      });
    } else {
      const top = Math.max(
        spacing,
        Math.min(
          buttonRect.top + buttonRect.height / 2 - modalHeight / 2,
          windowHeight - modalHeight - spacing
        )
      );
      const left = buttonRect.left - modalWidth - spacing - arrowSize;

      setPosition({
        top,
        left: Math.max(spacing, left),
        arrowPosition: 'left',
      });
    }
  }, [anchorRef, isOpen, windowWidth, windowHeight]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        if (!createGroupMutation.isPending) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef, createGroupMutation.isPending]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createGroupMutation.isPending) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, createGroupMutation.isPending]);

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      description: "",
      is_private: false,
    });
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setShowPrivateInfo(false);
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
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (!formData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    const createData: CreateGroupData = {
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      is_private: formData.is_private,
    };

    createGroupMutation.mutate(createData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Arrow pointing to button */}
        {position.arrowPosition === 'left' ? (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45 border-r border-t border-gray-200 dark:border-gray-700" />
        ) : (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45 border-l border-b border-gray-200 dark:border-gray-700" />
        )}

        {/* Modal Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[400px] max-h-[580px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Create Study Group
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Start collaborating
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={createGroupMutation.isPending}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 ring-2 ring-gray-200 dark:ring-gray-700 rounded-full overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Group avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-slate-700 to-indigo-600 text-white font-semibold text-xl flex items-center justify-center">
                        {formData.name.charAt(0).toUpperCase() || "G"}
                      </div>
                    )}
                  </div>
                  {avatarFile && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
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
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-3 h-3" />
                  {avatarFile ? "Change" : "Add Photo"}
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Group Name *
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter group name"
                    maxLength={50}
                    disabled={createGroupMutation.isPending}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {formData.name.length}/50
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Subject *
                  </label>
                  <input
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="e.g., Mathematics, Physics"
                    maxLength={30}
                    disabled={createGroupMutation.isPending}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {formData.subject.length}/30
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description..."
                    maxLength={200}
                    rows={3}
                    disabled={createGroupMutation.isPending}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {formData.description.length}/200
                  </div>
                </div>

                {/* Privacy Setting */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private-quick"
                      checked={formData.is_private}
                      onChange={(e) => handleInputChange("is_private", e.target.checked)}
                      disabled={createGroupMutation.isPending}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label
                      htmlFor="private-quick"
                      className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                    >
                      Make this group private
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Privacy Info */}
                  <AnimatePresence>
                    {showPrivateInfo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2"
                      >
                        <div className="flex items-start gap-2">
                          {formData.is_private ? (
                            <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="text-xs text-blue-800 dark:text-blue-200">
                            {formData.is_private ? (
                              <p>Only invited members can join this group.</p>
                            ) : (
                              <p>Anyone can discover and join this group.</p>
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
            <div className="flex items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                type="button"
                onClick={onClose}
                disabled={createGroupMutation.isPending}
                className="flex-1 h-9 text-sm bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
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
                className="flex-1 h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {createGroupMutation.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>
    </>
  );
};