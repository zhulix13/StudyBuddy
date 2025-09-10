import { useEffect } from "react";
import { useAuth } from "@/context/Authcontext";
import { useMarkGroupSeen } from "@/hooks/useMarkGroupSeen";
import { useMessageStatusesRealtime } from "@/services/realtime/messageStatus-realtime";
import { useQueryClient } from "@tanstack/react-query";
import { messageQueryKeys } from "./useMessages";

export function useAutoMarkSeen(groupId: string, activeTab: string) {
  const { profile } = useAuth();
  const markGroupSeen = useMarkGroupSeen();
  const queryClient = useQueryClient();

  // 1️⃣ Realtime subscription (keeps cache in sync)
  useMessageStatusesRealtime(groupId);

  // 2️⃣ Auto-mark as seen whenever chat is open + new messages exist
  useEffect(() => {
    if (!groupId || !profile || activeTab !== "chat") return;

    // get cached messages
    const messages: any[] | undefined = queryClient.getQueryData(
      messageQueryKeys.byGroup(groupId)
    );
    if (!messages) return;

    // FIXED: Only check messages from OTHER users, not your own
    const othersMessages = messages.filter(msg => msg.sender_id !== profile.id);
    
    // check for any messages not yet seen by this user
    const unseen = othersMessages.filter(
      (msg) =>
        !msg.statuses?.some(
          (s: any) => s.user_id === profile.id && s.status === "seen"
        )
    );

    if (unseen.length > 0) {
      // console.log(`🔵 Marking ${unseen.length} messages as seen`);
      markGroupSeen.mutate({ groupId, userId: profile.id });
    }
  }, [activeTab, groupId, profile, markGroupSeen, queryClient]);
}
