// src/hooks/useMarkGroupSeen.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MessageStatusesService from "@/services/message-statuses";
import { messageQueryKeys } from "./useMessages";

export const useMarkGroupSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      return await MessageStatusesService.markGroupAsSeen(groupId, userId);
    },
    onSuccess: (data, { groupId }) => {
      // 🔄 Invalidate group messages so status updates reflect immediately
      queryClient.invalidateQueries({
        queryKey: messageQueryKeys.byGroup(groupId),
      });
    },
    onError: (error) => {
      console.error("❌ Failed to mark group as seen:", error);
    },
  });
};
