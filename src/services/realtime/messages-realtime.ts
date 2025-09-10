// src/hooks/useMessagesRealtime.ts
import { useEffect } from "react";
import { supabase } from "../supabase";
import { useQueryClient } from "@tanstack/react-query";
import { type Message } from "@/services/supabase-messages";
import { messageQueryKeys } from "@/hooks/useMessages"; // reuse query keys

export function useMessagesRealtime(groupId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`messages:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // console.log("📡 Realtime message event:", payload);

          if (payload.eventType === "INSERT") {
            queryClient.setQueryData<Message[]>(
              messageQueryKeys.byGroup(groupId),
              (old) => (old ? [...old, payload.new as Message] : [payload.new as Message])
            );
          }

          if (payload.eventType === "UPDATE") {
            queryClient.setQueryData<Message[]>(
              messageQueryKeys.byGroup(groupId),
              (old) =>
                old?.map((msg) =>
                  msg.id === payload.new.id ? (payload.new as Message) : msg
                ) ?? []
            );
          }

          if (payload.eventType === "DELETE") {
            queryClient.setQueryData<Message[]>(
              messageQueryKeys.byGroup(groupId),
              (old) => old?.filter((msg) => msg.id !== payload.old.id) ?? []
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, queryClient]);
}
