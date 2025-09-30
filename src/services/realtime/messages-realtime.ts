// src/hooks/useMessagesRealtime.ts
import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useQueryClient } from "@tanstack/react-query";
import MessagesService, { type Message } from "@/services/supabase-messages";
import { messageQueryKeys } from "@/hooks/useMessages";
import { useAuth } from "@/context/Authcontext";

export function useMessagesRealtime(groupId: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  useEffect(() => {
    if (!groupId || !profile) return;

    const channel = supabase
      .channel(`messages:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          try {
            // Fetch the FULL message with relations
            const fullMessage = await MessagesService.getMessageById(
              payload.new.id,
              profile.id
            );
            
            if (!fullMessage) return;

            // 🔹 UPDATED: Add to infinite query structure (last page = most recent)
            queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
              if (!old?.pages) return old;
              
              const pages = [...old.pages];
              const lastPage = pages[pages.length - 1];
              
              // Check if message already exists (prevent duplicates from optimistic updates)
              const allMessages = pages.flatMap(p => p.messages || []);
              const exists = allMessages.some(msg => 
                msg.id === fullMessage.id || 
                (msg.id.startsWith('temp-') && Math.abs(
                  new Date(msg.created_at).getTime() - 
                  new Date(fullMessage.created_at).getTime()
                ) < 2000) // Within 2 seconds
              );
              
              if (exists) {
                // Replace temp/existing with real message in all pages
                const updatedPages = pages.map(page => ({
                  ...page,
                  messages: page.messages.map((msg: Message) => 
                    msg.id === fullMessage.id || 
                    (msg.id.startsWith('temp-') && Math.abs(
                      new Date(msg.created_at).getTime() - 
                      new Date(fullMessage.created_at).getTime()
                    ) < 2000)
                      ? fullMessage 
                      : msg
                  ),
                }));
                
                return {
                  ...old,
                  pages: updatedPages,
                };
              }
              
              // Add new message to last page
              pages[pages.length - 1] = {
                ...lastPage,
                messages: [...lastPage.messages, fullMessage],
              };
              
              return {
                ...old,
                pages,
              };
            });
          } catch (error) {
            console.error("❌ Failed to fetch full message:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          try {
            const fullMessage = await MessagesService.getMessageById(
              payload.new.id,
              profile.id
            );
            
            if (!fullMessage) return;

            // Update message in all pages
            queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
              if (!old?.pages) return old;
              
              const updatedPages = old.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: Message) =>
                  msg.id === fullMessage.id ? fullMessage : msg
                ),
              }));
              
              return {
                ...old,
                pages: updatedPages,
              };
            });
          } catch (error) {
            console.error("❌ Failed to fetch updated message:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          // Remove message from all pages
          queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
            if (!old?.pages) return old;
            
            const updatedPages = old.pages.map((page: any) => ({
              ...page,
              messages: page.messages.filter((msg: Message) => msg.id !== payload.old.id),
            }));
            
            return {
              ...old,
              pages: updatedPages,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, profile, queryClient]);
}