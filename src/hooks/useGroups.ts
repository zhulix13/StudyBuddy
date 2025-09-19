// hooks/useGroups.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUserGroups,
  createGroup,
  updateGroup,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  getGroupById,
  deleteOwnGroup,
} from "@/services/supabase-groups"
import type { CreateGroupData, UpdateGroupData, GroupMember } from "@/types/groups"

// Query keys
export const groupKeys = {
  all: ["groups"] as const,
  byId: (groupId: string) => [...groupKeys.all, "group", groupId] as const,
  members: (groupId: string) => [...groupKeys.all, "group", groupId, "members"] as const,
}

// Fetch all groups for user
export const useUserGroups = () => {
  return useQuery({
    queryKey: groupKeys.all,
    queryFn: getUserGroups,
  })
}

// Fetch single group
export const useGroupById = (groupId: string) => {
  return useQuery({
    queryKey: groupKeys.byId(groupId),
    queryFn: () => getGroupById(groupId),
    enabled: !!groupId,
  })
}

// Fetch group members

export const useGroupMembers = (groupId: string) => {
  return useQuery<GroupMember[]>({
    queryKey: groupKeys.members(groupId),
    queryFn: async () => {
      const rawMembers = await getGroupMembers(groupId)
      return rawMembers.map((member: any) => ({
        ...member,
        profile: member.profiles
          ? {
              id: String(member.profiles.id),
              avatar_url: member.profiles.avatar_url ?? undefined,
              username: member.profiles.username ?? null,
              full_name: member.profiles.full_name ?? null,
            }
          : null,
      }))
    },
    enabled: !!groupId,
  })
}


// Create a group
export const useCreateGroup = (p0: { onSuccess: (newGroup: any) => void; onError: (error: any) => void }) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroupData) => createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
    },
  })
}

// Update a group
export const useUpdateGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, updates }: { groupId: string; updates: UpdateGroupData }) => updateGroup(groupId, updates),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.byId(groupId) })
    },
  })
}

// Join group
export const useJoinGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => joinGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.byId(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) })
    },
  })
}

// Leave group
export const useLeaveGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
      queryClient.invalidateQueries({ queryKey: groupKeys.byId(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) })
    },
  })
}

// Delete group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => deleteOwnGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
    },
  })
}
