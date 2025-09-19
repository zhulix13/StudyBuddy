// src/components/Profile.tsx
import React, { useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile as ProfileType } from "@/types/profile";
import { uploadAvatar } from "@/services/upload";
import { supabase } from "@/services/supabase";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ProfileProps = {
  user: User | null;
  profile: ProfileType | null;
};

export const Profile: React.FC<ProfileProps> = ({ user, profile }) => {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  console.log(avatarUrl)
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
        if (error) {
          throw error;
        }
     

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

      // Refresh profile context manually if needed
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (updatedProfile) {
        location.reload(); // Simple page reload to reflect new avatar + data
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10">
      {/* Profile Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={
                avatarUrl ||
                user?.user_metadata?.avatar_url ||
                "https://via.placeholder.com/150"
              }
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/30"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              Change Avatar
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {fullName || user?.user_metadata?.name || "Unnamed User"}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Editable Profile Form */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email (read-only)
            </label>
            <Input value={user?.email || ""} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Bio
            </label>
            <Textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};


