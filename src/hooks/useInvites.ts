// hooks/useInvites.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { InvitesService } from "@/services/supabase-invites"
import { groupKeys } from "./useGroups"   // 🔹 import groupKeys

// Query keys
export const inviteKeys = {
  all: ["invites"] as const,
  byGroup: (groupId: string) => [...inviteKeys.all, "group", groupId] as const,
  mine: ["my-invites"] as const,
  byToken: (token: string) => [...inviteKeys.all, "token", token] as const,
  nonMembers: (groupId: string) => [...inviteKeys.all, "non-members", groupId] as const,
}

// 🔹 Fetch all invites for a group (admin only)
export const useGroupInvites = (groupId: string) => {
  return useQuery({
    queryKey: inviteKeys.byGroup(groupId),
    queryFn: () => InvitesService.getGroupInvites(groupId),
    enabled: !!groupId,
  })
}

// 🔹 Fetch non-members (users not yet in a group)
export const useNonMembers = (groupId: string) => {
  return useQuery({
    queryKey: inviteKeys.nonMembers(groupId),
    queryFn: () => InvitesService.getNonMembers(groupId),
    enabled: !!groupId,
  });
};

// 🔹 Fetch invites for logged-in user (excluding deleted ones)
export const useMyInvites = () => {
  return useQuery({
    queryKey: inviteKeys.mine,
    queryFn: () => InvitesService.getMyInvites(),
  })
}

// 🔹 Create an invite
export const useCreateInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      options,
    }: {
      groupId: string
      options: {
        inviteeId?: string
        email?: string
        expiresAt?: string
        groupName?: string
        inviterName?: string
      }
    }) => InvitesService.createInvite(groupId, options),
    onSuccess: ({ invite, warning }) => {
      if (warning) {
        console.warn("Invite created with warning:", warning)
        
      }
      queryClient.invalidateQueries({ queryKey: inviteKeys.byGroup(invite.group_id) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.nonMembers(invite.group_id) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.mine })
      queryClient.invalidateQueries({ queryKey: groupKeys.members(invite.group_id) })
    },
  })
}

// 🔹 Accept invite
export const useAcceptInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => InvitesService.acceptInvite(token),
    onSuccess: (res) => {
      if (res?.group_id) {
        queryClient.invalidateQueries({ queryKey: inviteKeys.nonMembers(res.group_id) })
        queryClient.invalidateQueries({ queryKey: inviteKeys.byGroup(res.group_id) })
        queryClient.invalidateQueries({ queryKey: groupKeys.members(res.group_id) })
      }
      // 🔹 Always refresh user groups list
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
      queryClient.invalidateQueries({ queryKey: groupKeys.userGroups })
      queryClient.invalidateQueries({ queryKey: inviteKeys.mine })
    },
  })
}

// 🔹 Decline invite
export const useDeclineInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => InvitesService.declineInvite(token),
    onSuccess: (invite) => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.byGroup(invite.group_id) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.nonMembers(invite.group_id) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.mine })
      queryClient.invalidateQueries({ queryKey: groupKeys.members(invite.group_id) })
    },
  })
}

// 🔹 Revoke invite 
export const useRevokeInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => InvitesService.revokeInvite(token),
    onSuccess: (invite) => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.byGroup(invite.group_id) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.nonMembers(invite.group_id) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.mine })
      queryClient.invalidateQueries({ queryKey: groupKeys.members(invite.group_id) })
    },
  })
}

// 🔹 Delete invite (soft delete)
export const useDeleteInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => InvitesService.deleteInvite(token),
    onSuccess: (invite) => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.byGroup(invite.group_id) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.nonMembers(invite.group_id) })
      queryClient.invalidateQueries({ queryKey: inviteKeys.mine })
      queryClient.invalidateQueries({ queryKey: groupKeys.members(invite.group_id) })
    },
  })
}

// 🔹 Validate invite
export const useValidateInvite = (token: string) => {
  return useQuery({
    queryKey: inviteKeys.byToken(token),
    queryFn: () => InvitesService.validateInvite(token),
    enabled: !!token,
  })
}