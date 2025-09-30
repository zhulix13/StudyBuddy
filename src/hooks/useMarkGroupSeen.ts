// src/hooks/useMarkGroupSeen.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MessageStatusesService from "@/services/message-statuses";
import { messageQueryKeys } from "./useMessages";
import type { Message } from "@/services/supabase-messages";

export const useMarkGroupSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      return await MessageStatusesService.markGroupAsSeen(groupId, userId);
    },
    
    // ✨ UPDATED: Optimistic update for infinite query structure
    onMutate: async ({ groupId, userId }) => {
      await queryClient.cancelQueries({ 
        queryKey: messageQueryKeys.byGroup(groupId) 
      });

      const previousData = queryClient.getQueryData(messageQueryKeys.byGroup(groupId));

      // Update all pages in the infinite query
      queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
        if (!old?.pages) return old;
        
        const updatedPages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: Message) => {
            // Only update messages from other users
            if (msg.sender_id === userId) return msg;
            
            // Check if user already has a "seen" status
            const hasSeenStatus = msg.statuses?.some(
              (s) => s.user_id === userId && s.status === "seen"
            );
            
            if (hasSeenStatus) return msg;
            
            // Add or update to "seen" status
            const updatedStatuses = msg.statuses?.filter(
              (s) => s.user_id !== userId
            ) || [];
            
            updatedStatuses.push({
              id: `temp-${Date.now()}-${msg.id}`,
              message_id: msg.id,
              user_id: userId,
              status: "seen",
              created_at: new Date().toISOString(),
            });
            
            return {
              ...msg,
              statuses: updatedStatuses,
            };
          }),
        }));

        return {
          ...old,
          pages: updatedPages,
        };
      });

      return { previousData };
    },
    
    // ❌ Rollback on error
    onError: (err, { groupId }, context) => {
      console.error("❌ Failed to mark group as seen:", err);
      if (context?.previousData) {
        queryClient.setQueryData(
          messageQueryKeys.byGroup(groupId),
          context.previousData
        );
      }
    },
    
    // ✅ Background refetch to sync with server
    onSettled: (data, error, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: messageQueryKeys.byGroup(groupId),
        refetchType: 'none',
      });
      
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: messageQueryKeys.byGroup(groupId),
          type: 'active',
        });
      }, 2000);
    },
  });
};