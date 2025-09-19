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
  getGroupsWhereUserIsMember,
} from "@/services/supabase-groups"
import type { CreateGroupData, UpdateGroupData, GroupMember, StudyGroup } from "@/types/groups"

// Query keys
export const groupKeys = {
  all: ["groups"] as const,
  userGroups: ["user-groups"] as const,
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

// Fetch groups where user is a member - NEW HOOK
export const useUserMemberGroups = () => {
  return useQuery<StudyGroup[]>({
    queryKey: groupKeys.userGroups,
    queryFn: getGroupsWhereUserIsMember,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
export const useCreateGroup = (callbacks?: { onSuccess?: (newGroup: any) => void; onError?: (error: any) => void }) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroupData) => createGroup(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
      queryClient.invalidateQueries({ queryKey: groupKeys.userGroups })
      callbacks?.onSuccess?.(data)
    },
    onError: (error) => {
      callbacks?.onError?.(error)
    }
  })
}

// Update a group
export const useUpdateGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, updates }: { groupId: string; updates: UpdateGroupData }) => updateGroup(groupId, updates),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.byId(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.userGroups })
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
      queryClient.invalidateQueries({ queryKey: groupKeys.userGroups })
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
      queryClient.invalidateQueries({ queryKey: groupKeys.userGroups })
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
      queryClient.invalidateQueries({ queryKey: groupKeys.userGroups })
    },
  })
}