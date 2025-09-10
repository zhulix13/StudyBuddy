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
    
    // 🔹 1. Listen for new messages → auto-mark delivered ONLY for others
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
          // console.log("📡 New message event:", payload);
          const newMessage = payload.new;
          
          // 🚫 CRITICAL FIX: Only mark as delivered if NOT your own message
          if (newMessage.sender_id !== profile.id) {
            // console.log("🔵 Marking message as delivered for user:", profile.id);
            await MessageStatusesService.updateStatus(
              newMessage.id,
              profile.id,
              "delivered"
            );
          } else {
            // console.log("🔵 Skipping delivered status - this is my own message");
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
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "message_statuses",
        },
        (payload) => {
          // console.log("📡 Status update event:", payload);
          
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newStatus = payload.new as MessageStatusRow;
            
            queryClient.setQueryData(
              messageQueryKeys.byGroup(groupId),
              (old: any[] | undefined) => {
                if (!old) return old;
                
                return old.map((msg) => {
                  if (msg.id === newStatus.message_id) {
                    let updatedStatuses = msg.statuses || [];
                    
                    // Find existing status for this user or add new one
                    const existingIndex = updatedStatuses.findIndex(
                      (s: any) => s.user_id === newStatus.user_id
                    );
                    
                    if (existingIndex >= 0) {
                      updatedStatuses[existingIndex] = newStatus;
                    } else {
                      updatedStatuses.push(newStatus);
                    }
                    
                    return { ...msg, statuses: updatedStatuses };
                  }
                  return msg;
                });
              }
            );
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [groupId, profile, queryClient]);
}