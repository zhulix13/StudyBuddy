// src/pages/dashboard/profile.tsx
import React, { useState, useRef } from "react";
import { useAuth } from "@/context/Authcontext";
import { uploadAvatar } from "@/services/upload";
import { supabase } from "@/services/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

export const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsLoading(true);
      const { publicUrl } = await uploadAvatar(user.id, file);

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (error) throw error;

      setAvatarUrl(publicUrl);
      toast.success("Avatar updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update avatar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          bio: bio,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated!");

      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (updatedProfile) {
        location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-10">
      {/* Profile Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="relative">
            <img
              src={
                avatarUrl ||
                user?.user_metadata?.avatar_url ||
                "https://via.placeholder.com/150"
              }
              alt="avatar"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-blue-500/30 dark:ring-blue-400/30"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="absolute bottom-0 right-0 p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white shadow-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {fullName || user?.user_metadata?.name || "Unnamed User"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Editable Profile Form */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          Profile Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email (read-only)
            </label>
            <Input
              value={user?.email || ""}
              disabled
              className="dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <Textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};