// src/hooks/useMessagesRealtime.ts
import { useEffect } from "react";
import { supabase } from "../supabase";
import { useQueryClient } from "@tanstack/react-query";
import { messageQueryKeys } from "@/hooks/useMessages";
import MessageStatusesService from "@/services/message-statuses";
import { useAuth } from "@/context/Authcontext";
import type { MessageStatusRow } from "@/services/message-statuses";

export function useMessageStatusesRealtime(groupId: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  useEffect(() => {
    if (!groupId || !profile) return;

    // 🔹 1. Listen for new messages → auto-mark delivered
    const messageChannel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          console.log("📡 New message event:", payload);

          const newMessage = payload.new;

          // 🚫 Don't update your own messages
          if (newMessage.sender_id !== profile.id) {
            await MessageStatusesService.updateStatus(
              newMessage.id,
              profile.id,
              "delivered"
            );
          }

          // Optimistically add new message to cache
          queryClient.setQueryData(
            messageQueryKeys.byGroup(groupId),
            (old: any[] | undefined) => {
              if (!old) return [newMessage];
              return [...old, newMessage];
            }
          );
        }
      )
      .subscribe();

    // 🔹 2. Listen for status updates → sync delivered/seen ticks
    const statusChannel = supabase
      .channel(`message_statuses:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "message_statuses",
        },
        (payload) => {
          console.log("📡 Status update event:", payload);

          const newStatus = payload.new as MessageStatusRow;

          queryClient.setQueryData(
            messageQueryKeys.byGroup(groupId),
            (old: any[] | undefined) => {
              if (!old) return old;

              return old.map((msg) => {
                if (msg.id === newStatus.message_id) {
                  let updatedStatuses = msg.statuses || [];

                  // Replace the status for that user
                  updatedStatuses = updatedStatuses.map((s: any) =>
                    s.user_id === newStatus.user_id ? newStatus : s
                  );

                  return { ...msg, statuses: updatedStatuses };
                }
                return msg;
              });
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [groupId, profile, queryClient]);
}
