// src/hooks/useMessages.ts
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MessagesService, { type Message } from "@/services/supabase-messages";
import { useAuth } from "@/context/Authcontext";

// Query keys
export const messageQueryKeys = {
  all: ["messages"] as const,
  byGroup: (groupId: string) => [...messageQueryKeys.all, "group", groupId] as const,
  single: (messageId: string) => [...messageQueryKeys.all, "single", messageId] as const,
};

// 🔹 UPDATED: Use infinite query for pagination
export function useMessages(groupId: string, limit: number = 50) {
  const { profile } = useAuth();
  
  return useInfiniteQuery({
    queryKey: messageQueryKeys.byGroup(groupId),
    queryFn: async ({ pageParam }) => {
      if (!profile) throw new Error("User profile not loaded");
      return MessagesService.getMessagesByGroupId(
        groupId,
        profile.id,
        limit,
        pageParam // beforeTimestamp for pagination
      );
    },
    enabled: !!groupId && !!profile,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      // Return the oldest timestamp if there are more messages
      return lastPage.hasMore ? lastPage.oldestTimestamp : undefined;
    },
    // Reverse pages order so oldest is first (UI shows bottom-to-top)
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });
}

// Helper to get all messages from infinite query
export function useAllMessages(groupId: string) {
  const { data } = useMessages(groupId);
  
  // Flatten all pages into single array
  const messages = data?.pages.flatMap((page) => page.messages) ?? [];
  
  return messages;
}

// 🔹 Fetch a single message (unchanged)
export function useMessage(messageId: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: messageQueryKeys.single(messageId),
    queryFn: () => {
      if (!profile) throw new Error("User profile not loaded");
      return MessagesService.getMessageById(messageId, profile.id);
    },
    enabled: !!messageId && !!profile,
  });
}

// 🔹 UPDATED: Create message with infinite query support
export function useCreateMessage(groupId: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: ({ content }: { content: string }) => {
      return MessagesService.createMessage(groupId, content);
    },
    
    onMutate: async ({ content }) => {
      await queryClient.cancelQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
      
      const previousData = queryClient.getQueryData(messageQueryKeys.byGroup(groupId));
      
      if (profile) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          group_id: groupId,
          sender_id: profile.id,
          content,
          message_type: "text",
          reply_to: null,
          note_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: profile,
          statuses: [],
        };
        
        // Add to the LAST page (most recent messages)
        queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
          if (!old) return old;
          
          const pages = [...old.pages];
          const lastPage = pages[pages.length - 1];
          
          pages[pages.length - 1] = {
            ...lastPage,
            messages: [...lastPage.messages, optimisticMessage],
          };
          
          return { ...old, pages };
        });
      }
      
      return { previousData };
    },
    
    onSuccess: (newMessage) => {
      // Replace temp message with real one
      queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
        if (!old) return old;
        
        const pages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: Message) =>
            msg.id.startsWith('temp-') ? newMessage : msg
          ),
        }));
        
        return { ...old, pages };
      });
    },
    
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(messageQueryKeys.byGroup(groupId), context.previousData);
      }
    },
  });
}

// 🔹 Share note to chat
export function useShareNoteToChat(groupId: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: ({ noteId, caption }: { noteId: string; caption: string | null }) => {
      return MessagesService.createMessage(groupId, caption ?? undefined, noteId);
    },
    
    onMutate: async ({ noteId, caption }) => {
      await queryClient.cancelQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
      
      const previousData = queryClient.getQueryData(messageQueryKeys.byGroup(groupId));
      
      if (profile) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          group_id: groupId,
          sender_id: profile.id,
          content: caption,
          message_type: "note",
          reply_to: null,
          note_id: noteId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: profile,
          statuses: [],
        };
        
        queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
          if (!old) return old;
          
          const pages = [...old.pages];
          const lastPage = pages[pages.length - 1];
          
          pages[pages.length - 1] = {
            ...lastPage,
            messages: [...lastPage.messages, optimisticMessage],
          };
          
          return { ...old, pages };
        });
      }
      
      return { previousData };
    },
    
    onSuccess: (newMessage) => {
      queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
        if (!old) return old;
        
        const pages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: Message) =>
            msg.id.startsWith('temp-') ? newMessage : msg
          ),
        }));
        
        return { ...old, pages };
      });
    },
    
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(messageQueryKeys.byGroup(groupId), context.previousData);
      }
    },
  });
}

// 🔹 Reply to message
export function useReplyToMessage(groupId: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: ({ messageId, replyContent, noteId }: {
      messageId: string;
      replyContent: string;
      noteId?: string | null;
    }) => {
      if (!profile) throw new Error("User profile not loaded");
      return MessagesService.replyToMessage(groupId, profile.id, messageId, replyContent, noteId);
    },
    
    onMutate: async ({ messageId, replyContent, noteId }) => {
      await queryClient.cancelQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
      
      const previousData = queryClient.getQueryData(messageQueryKeys.byGroup(groupId));
      
      if (profile) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          group_id: groupId,
          sender_id: profile.id,
          content: replyContent,
          message_type: noteId ? "note" : "text",
          reply_to: messageId,
          note_id: noteId ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: profile,
          statuses: [],
        };
        
        queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
          if (!old) return old;
          
          const pages = [...old.pages];
          const lastPage = pages[pages.length - 1];
          
          pages[pages.length - 1] = {
            ...lastPage,
            messages: [...lastPage.messages, optimisticMessage],
          };
          
          return { ...old, pages };
        });
      }
      
      return { previousData };
    },
    
    onSuccess: (newMessage) => {
      queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
        if (!old) return old;
        
        const pages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: Message) =>
            msg.id.startsWith('temp-') ? newMessage : msg
          ),
        }));
        
        return { ...old, pages };
      });
    },
    
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(messageQueryKeys.byGroup(groupId), context.previousData);
      }
    },
  });
}

// 🔹 Reply with note (same pattern)
export function useReplyWithNote(groupId: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: ({ messageId, noteId, caption }: {
      messageId: string;
      noteId: string;
      caption?: string;
    }) => {
      if (!profile) throw new Error("User profile not loaded");
      return MessagesService.replyToMessage(groupId, profile.id, messageId, caption || "", noteId);
    },
    
    onMutate: async ({ messageId, noteId, caption }) => {
      await queryClient.cancelQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
      
      const previousData = queryClient.getQueryData(messageQueryKeys.byGroup(groupId));
      
      if (profile) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          group_id: groupId,
          sender_id: profile.id,
          content: caption || "",
          message_type: "note",
          reply_to: messageId,
          note_id: noteId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: profile,
          statuses: [],
        };
        
        queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
          if (!old) return old;
          
          const pages = [...old.pages];
          const lastPage = pages[pages.length - 1];
          
          pages[pages.length - 1] = {
            ...lastPage,
            messages: [...lastPage.messages, optimisticMessage],
          };
          
          return { ...old, pages };
        });
      }
      
      return { previousData };
    },
    
    onSuccess: (newMessage) => {
      queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
        if (!old) return old;
        
        const pages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: Message) =>
            msg.id.startsWith('temp-') ? newMessage : msg
          ),
        }));
        
        return { ...old, pages };
      });
    },
    
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(messageQueryKeys.byGroup(groupId), context.previousData);
      }
    },
  });
}

// 🔹 Update message
export function useUpdateMessage(groupId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      MessagesService.updateMessage(messageId, content),
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
        if (!old) return old;
        
        const pages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: Message) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          ),
        }));
        
        return { ...old, pages };
      });
    },
  });
}

// 🔹 Delete message
export function useDeleteMessage(groupId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: string) => MessagesService.deleteMessage(messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
      
      const previousData = queryClient.getQueryData(messageQueryKeys.byGroup(groupId));
      
      queryClient.setQueryData(messageQueryKeys.byGroup(groupId), (old: any) => {
        if (!old) return old;
        
        const pages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.filter((msg: Message) => msg.id !== messageId),
        }));
        
        return { ...old, pages };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(messageQueryKeys.byGroup(groupId), context.previousData);
      }
    },
  });
}