// src/pages/dashboard/EditProfileModal.tsx
import { useState, useRef, useEffect } from "react";
import { X, Camera, Loader2, Check, AlertCircle, User } from "lucide-react";
import { useUpdateProfile, useUpdateAvatar, useCheckUsername } from "@/hooks/useProfiles";
import { uploadAvatar } from "@/services/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Profile } from "@/types/profile";
import { useDebounce } from "@/hooks/useDebounce";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | undefined;
  userId: string;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  profile,
  userId,
}: EditProfileModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const updateProfileMutation = useUpdateProfile();
  const updateAvatarMutation = useUpdateAvatar();

  // Debounce username for availability check
  const debouncedUsername = useDebounce(username, 500);
  
  // Only check if username has changed from original
  const shouldCheckUsername = 
    debouncedUsername !== profile?.username && 
    debouncedUsername.length >= 3;

  const { data: isUsernameAvailable, isLoading: isCheckingUsername } = useCheckUsername(
    debouncedUsername,
    userId,
    shouldCheckUsername
  );

  // Sync with profile when it changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !updateProfileMutation.isPending) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, updateProfileMutation.isPending]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !updateProfileMutation.isPending
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, updateProfileMutation.isPending]);

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

  const handleSave = async () => {
    // Validate username format
    if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      toast.error("Username must be 3-20 characters and contain only letters, numbers, and underscores");
      return;
    }

    // Check username availability
    if (shouldCheckUsername && !isUsernameAvailable) {
      toast.error("Username is already taken");
      return;
    }

    try {
      // Upload avatar first if changed
      if (avatarFile) {
        setIsUploadingAvatar(true);
        const { publicUrl } = await uploadAvatar(userId, avatarFile);
        await updateAvatarMutation.mutateAsync({ userId, avatarUrl: publicUrl });
        setIsUploadingAvatar(false);
      }

      // Update profile info
      await updateProfileMutation.mutateAsync({
        userId,
        updates: {
          full_name: fullName.trim() || undefined,
          username: username.trim() || undefined,
          bio: bio.trim() || undefined,
        },
      });

      toast.success("Profile updated successfully!");
      onClose();

      // Cleanup
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const getUsernameStatus = () => {
    if (!username || username === profile?.username) return null;
    if (username.length < 3) {
      return { type: "error", message: "Too short (min 3 characters)" };
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return { type: "error", message: "Invalid format" };
    }
    if (isCheckingUsername) {
      return { type: "loading", message: "Checking..." };
    }
    if (isUsernameAvailable === true) {
      return { type: "success", message: "Available" };
    }
    if (isUsernameAvailable === false) {
      return { type: "error", message: "Already taken" };
    }
    return null;
  };

  const usernameStatus = getUsernameStatus();
  const canSave = 
    !updateProfileMutation.isPending && 
    !isUploadingAvatar &&
    (shouldCheckUsername ? isUsernameAvailable : true);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Edit Profile
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Update your personal information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={updateProfileMutation.isPending || isUploadingAvatar}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-blue-500/20 dark:ring-blue-400/20 bg-gradient-to-br from-blue-500 to-slate-600">
                  {avatarPreview || profile?.avatar_url ? (
                    <img
                      src={avatarPreview || profile?.avatar_url}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                      {fullName.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar || updateProfileMutation.isPending}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-not-allowed"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isUploadingAvatar || updateProfileMutation.isPending}
              />

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Click to upload a new avatar (max 5MB)
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  maxLength={50}
                  disabled={updateProfileMutation.isPending || isUploadingAvatar}
                  className="dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {fullName.length}/50
                </p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    @
                  </div>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="username"
                    maxLength={20}
                    disabled={updateProfileMutation.isPending || isUploadingAvatar}
                    className="pl-8 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100"
                  />
                  {usernameStatus && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus.type === "loading" && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                      {usernameStatus.type === "success" && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                      {usernameStatus.type === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {usernameStatus && (
                  <p
                    className={`text-xs mt-1 ${
                      usernameStatus.type === "success"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {usernameStatus.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={160}
                  disabled={updateProfileMutation.isPending || isUploadingAvatar}
                  className="resize-none dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100"
                  rows={4}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {bio.length}/160
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={updateProfileMutation.isPending || isUploadingAvatar}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};