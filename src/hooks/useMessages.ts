// src/hooks/useMessages.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MessagesService, { type Message } from "@/services/supabase-messages";
import { useAuth } from "@/context/Authcontext";

// Query keys
export const messageQueryKeys = {
  all: ["messages"] as const,
  byGroup: (groupId: string) => [...messageQueryKeys.all, "group", groupId] as const,
  single: (messageId: string) => [...messageQueryKeys.all, "single", messageId] as const,
};

// 🔹 Fetch messages for a group
export function useMessages(groupId: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: messageQueryKeys.byGroup(groupId),
    queryFn: () => {
      if (!profile) throw new Error("User profile not loaded");
      return MessagesService.getMessagesByGroupId(groupId, profile.id);
    },
    enabled: !!groupId && !!profile,
  });
}

// 🔹 Fetch a single message
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

// 🔹 Create regular text message
// 🔹 Create regular text message
export function useCreateMessage(groupId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ content }: { content: string }) => {
      return MessagesService.createMessage(groupId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
    },
  });
}


// 🔹 Share note to chat (with optional caption)
// 🔹 Share note to chat (with optional caption)
export function useShareNoteToChat(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      caption
    }: {
      noteId: string;
      caption: string | null;
    }) => {
      return MessagesService.createMessage(
        groupId,          // ✅ required groupId
        caption || null,  // ✅ content
        noteId            // ✅ noteId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
    },
  });
}


// 🔹 Reply to message
export function useReplyToMessage(groupId: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: ({
      messageId,
      replyContent,
      noteId,
    }: {
      messageId: string;
      replyContent: string;
      noteId?: string | null;
    }) => {
      if (!profile) throw new Error("User profile not loaded");
      return MessagesService.replyToMessage(
        groupId, 
        profile.id, 
        messageId, 
        replyContent, 
        noteId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
    },
  });
}

// 🔹 Reply to message with note (for replying with a note reference)
export function useReplyWithNote(groupId: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: ({
      messageId,
      noteId,
      caption,
    }: {
      messageId: string;
      noteId: string;
      caption?: string;
    }) => {
      if (!profile) throw new Error("User profile not loaded");
      return MessagesService.replyToMessage(
        groupId, 
        profile.id, 
        messageId, 
        caption || "", // Empty string if no caption
        noteId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
    },
  });
}

// 🔹 Update message
export function useUpdateMessage(groupId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      MessagesService.updateMessage(messageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
    },
  });
}

// 🔹 Delete message
export function useDeleteMessage(groupId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: string) => MessagesService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageQueryKeys.byGroup(groupId) });
    },
  });
}