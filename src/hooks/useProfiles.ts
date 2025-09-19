// hooks/useProfiles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProfilesService from "@/services/supabase-profiles";
import type { Profile } from "@/types/profile";

// 🔹 Get a single profile
export function useProfile(userId: string) {
  return useQuery<Profile>({
    queryKey: ["profiles", userId],
    queryFn: () => ProfilesService.getProfileById(userId),
    enabled: !!userId, // only fetch when userId is defined
  });
}

// 🔹 Get multiple profiles by ids
export function useProfilesByIds(userIds: string[]) {
  return useQuery<Profile[]>({
    queryKey: ["profiles", "list", userIds],
    queryFn: () => ProfilesService.getProfilesByIds(userIds),
    enabled: userIds.length > 0,
  });
}

// 🔹 Get all profiles
export function useAllProfiles() {
  return useQuery<Profile[]>({
    queryKey: ["profiles", "all"],
    queryFn: ProfilesService.getAllProfiles,
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
      // ✅ update cache for this user
      queryClient.setQueryData(["profiles", data.id], data);

      // optionally invalidate all profiles if you use them in listings
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}
