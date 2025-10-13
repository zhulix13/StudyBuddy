// src/pages/dashboard/Profile.tsx
import React, { useState } from "react";
import { useAuth } from "@/context/Authcontext";
import { useProfile } from "@/hooks/useProfiles";
import { 
  Mail, 
  User, 
  Calendar, 
  Edit3, 
  Loader2,
  MapPin,
  Briefcase,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "./edit";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id || "");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Format join date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col sm:flex-row gap-6">
            <Skeleton circle width={120} height={120} />
            <div className="flex-1 space-y-3">
              <Skeleton width={200} height={32} />
              <Skeleton width={150} height={20} />
              <Skeleton width="100%" height={60} />
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height={150} />
          <Skeleton height={150} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-0" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-blue-500/20 dark:ring-blue-400/20 bg-gradient-to-br from-blue-500 to-slate-600">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || 
                       user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
                      {profile?.full_name || "Unnamed User"}
                    </h1>
                    {profile?.username && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        @{profile.username}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    size="sm"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </Button>
                </div>

                {/* Bio */}
                {profile?.bio ? (
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic mb-4">
                    No bio added yet. Click "Edit Profile" to add one.
                  </p>
                )}

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(user?.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Account Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {profile?.full_name || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Username</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {profile?.username ? `@${profile.username}` : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(user?.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              Profile Stats
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Profile Completeness</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {(() => {
                    let score = 40; // Base score
                    if (profile?.full_name) score += 20;
                    if (profile?.username) score += 20;
                    if (profile?.bio) score += 20;
                    return `${score}%`;
                  })()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-green-600 h-full transition-all duration-500"
                  style={{
                    width: `${(() => {
                      let score = 40;
                      if (profile?.full_name) score += 20;
                      if (profile?.username) score += 20;
                      if (profile?.bio) score += 20;
                      return score;
                    })()}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Complete your profile to unlock all features
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        userId={user?.id || ""}
      />
    </>
  );
};