// hooks/useProfiles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProfilesService from "@/services/supabase-profiles";
import type { Profile } from "@/types/profile";

// Query keys
export const profileKeys = {
  all: ["profiles"] as const,
  byId: (userId: string) => [...profileKeys.all, userId] as const,
  list: (userIds: string[]) => [...profileKeys.all, "list", userIds] as const,
};

// 🔹 Get a single profile
export function useProfile(userId: string) {
  return useQuery<Profile>({
    queryKey: profileKeys.byId(userId),
    queryFn: () => ProfilesService.getProfileById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 🔹 Get multiple profiles by ids
export function useProfilesByIds(userIds: string[]) {
  return useQuery<Profile[]>({
    queryKey: profileKeys.list(userIds),
    queryFn: () => ProfilesService.getProfilesByIds(userIds),
    enabled: userIds.length > 0,
  });
}

// 🔹 Get all profiles
export function useAllProfiles() {
  return useQuery<Profile[]>({
    queryKey: profileKeys.all,
    queryFn: ProfilesService.getAllProfiles,
  });
}

// 🔹 Check username availability
export function useCheckUsername(username: string, currentUserId: string, enabled: boolean = true) {
  return useQuery<boolean>({
    queryKey: ["username-check", username, currentUserId],
    queryFn: () => ProfilesService.checkUsernameAvailability(username, currentUserId),
    enabled: enabled && username.length >= 3, // Only check if username is at least 3 chars
    staleTime: 0, // Always check fresh
  });
}

// 🔹 Update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Profile>;
    }) => ProfilesService.updateProfile(userId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.byId(data.id), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// 🔹 Update avatar
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, avatarUrl }: { userId: string; avatarUrl: string }) =>
      ProfilesService.updateAvatar(userId, avatarUrl),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.byId(data.id), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}