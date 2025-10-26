// services/supabase-messages.ts (UPDATED WITH NOTIFICATIONS)
import { supabase } from "./supabase";
import type { Profile } from "@/types/profile";
import type { Note } from "@/types/notes";
import MessageStatusesService from "./message-statuses";
import { NotificationTriggers } from "./notifications/trigger";

export type Message = {
  id: string;
  group_id: string;
  sender_id: string;
  content: string | null;
  message_type: string | null;
  reply_to?: string | null;
  note_id: string | null;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  note?: Note;
  statuses?: Array<{
    id: string;
    message_id: string;
    user_id: string;
    status: "sent" | "delivered" | "seen";
    created_at: string;
  }>;
};

export type PaginatedMessagesResponse = {
  messages: Message[];
  hasMore: boolean;
  oldestTimestamp: string | null;
};

class MessagesService {
  // ... (keep all existing fetch methods unchanged)

  // 🔹 Create a new message
  static async createMessage(
    groupId: string,
    content?: string,
    noteId?: string
  ): Promise<Message> {
    const { data, error } = await supabase.rpc("send_message", {
      p_group_id: groupId,
      p_content: content ?? null,
      p_note_id: noteId ?? null,
    });

    if (error) throw error;
    console.log("Message created:", data);
    
    // 🔥 TRIGGER NOTIFICATIONS (fire and forget)
    if (noteId) {
      // This is a note share
      this.sendNoteSharedNotification(groupId, noteId, data.sender_id, content).catch(err => {
        console.error('Failed to send note shared notification:', err);
      });
    } else if (content && !noteId) {
      // This is a regular message
      this.sendMessageNotification(groupId, data.id, data.sender_id, content).catch(err => {
        console.error('Failed to send message notification:', err);
      });
    }
    
    return data as Message;
  }

  // 🔹 Reply to a message
  static async replyToMessage(
    groupId: string,
    senderId: string,
    messageId: string,
    replyContent: string,
    noteId?: string | null
  ): Promise<Message> {
    // Fetch the original message to validate it exists
    const originalMessageRes = await supabase
      .from("group_messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (originalMessageRes.error) throw originalMessageRes.error;
    const originalMessage = originalMessageRes.data;
    if (!originalMessage) throw new Error("Original message not found");

    // Create the reply message
    const { data, error } = await supabase
      .from("group_messages")
      .insert([
        {
          group_id: groupId,
          sender_id: senderId,
          reply_to: originalMessage.id,
          content: replyContent ?? null,
          note_id: noteId ?? null,
        },
      ])
      .select(
        `
        *,
        sender:profiles(*),
        note:notes(*),
        statuses:message_statuses(*)
      `
      )
      .single();

    if (error) throw error;

    // ✅ Record "sent" status for sender
    if (data) {
      await MessageStatusesService.createStatus(data.id, senderId, "sent");
    }

    // 🔥 TRIGGER NOTIFICATION (fire and forget)
    this.sendMessageReplyNotification(
      groupId,
      originalMessage.sender_id,
      senderId,
      replyContent
    ).catch(err => {
      console.error('Failed to send message reply notification:', err);
    });

    return data as Message;
  }

  // 🔥 NEW: Send notification for regular message
  private static async sendMessageNotification(
    groupId: string,
    messageId: string,
    senderId: string,
    messageContent: string
  ) {
    try {
      // Get group members
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);
      
      if (membersError || !members || members.length === 0) {
        console.error('Failed to fetch group members:', membersError);
        return;
      }
      
      // Get group details
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select('name')
        .eq('id', groupId)
        .single();
      
      if (groupError || !group) {
        console.error('Failed to fetch group details:', groupError);
        return;
      }
      
      // Get sender profile
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', senderId)
        .single();
      
      const memberIds = members.map(m => m.user_id);
      
      await NotificationTriggers.notifyMessageSent(
        memberIds,
        senderId,
        {
          groupId,
          groupName: group.name,
          messageId,
          messagePreview: messageContent?.substring(0, 100),
          actorName: senderProfile?.full_name || 'Someone',
          actorAvatar: senderProfile?.avatar_url,
        }
      );
    } catch (error) {
      console.error('Error in sendMessageNotification:', error);
    }
  }

  // 🔥 NEW: Send notification for message reply
  private static async sendMessageReplyNotification(
    groupId: string,
    originalSenderId: string,
    replierId: string,
    replyContent: string
  ) {
    try {
      // Don't notify if replying to own message
      if (originalSenderId === replierId) return;
      
      // Get group details
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select('name')
        .eq('id', groupId)
        .single();
      
      if (groupError || !group) {
        console.error('Failed to fetch group details:', groupError);
        return;
      }
      
      // Get replier profile
      const { data: replierProfile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', replierId)
        .single();
      
      await NotificationTriggers.notifyMessageReplied(
        originalSenderId,
        replierId,
        {
          groupId,
          groupName: group.name,
          messageId: '', // We don't have this yet, but it's in metadata
          replyPreview: replyContent?.substring(0, 100) || '',
          actorName: replierProfile?.full_name || 'Someone',
          actorAvatar: replierProfile?.avatar_url,
        }
      );
    } catch (error) {
      console.error('Error in sendMessageReplyNotification:', error);
    }
  }

  // 🔥 NEW: Send notification for note shared in chat
  private static async sendNoteSharedNotification(
    groupId: string,
    noteId: string,
    senderId: string,
    caption?: string | null
  ) {
    try {
      // Get group members
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);
      
      if (membersError || !members || members.length === 0) {
        console.error('Failed to fetch group members:', membersError);
        return;
      }
      
      // Get group details
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select('name')
        .eq('id', groupId)
        .single();
      
      if (groupError || !group) {
        console.error('Failed to fetch group details:', groupError);
        return;
      }
      
      // Get note details
      const { data: note } = await supabase
        .from('notes')
        .select('title')
        .eq('id', noteId)
        .single();
      
      // Get sender profile
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', senderId)
        .single();
      
      const memberIds = members.map(m => m.user_id);
      
      await NotificationTriggers.notifyNoteShared(
        memberIds,
        senderId,
        {
          groupId,
          groupName: group.name,
          noteId,
          noteTitle: note?.title,
          actorName: senderProfile?.full_name || 'Someone',
          actorAvatar: senderProfile?.avatar_url,
        }
      );
    } catch (error) {
      console.error('Error in sendNoteSharedNotification:', error);
    }
  }

  // ... (keep update and delete methods unchanged)
  static async updateMessage(
    messageId: string,
    content: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from("group_messages")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", messageId)
      .select(
        `
        *,
        sender:profiles(*),
        note:notes(*),
        statuses:message_statuses(*)
      `
      )
      .single();

    if (error) throw error;
    return data as Message;
  }

  static async deleteMessage(messageId: string): Promise<Message> {
    const { data, error } = await supabase
      .from("group_messages")
      .delete()
      .eq("id", messageId)
      .select(
        `
        *,
        sender:profiles(*),
        note:notes(*),
        statuses:message_statuses(*)
      `
      )
      .single();

    if (error) throw error;
    return data as Message;
  }

  // Keep the existing getMessagesByGroupId and getMessageById methods unchanged
  static async getMessagesByGroupId(
    groupId: string,
    currentUserId: string,
    limit: number = 50,
    beforeTimestamp?: string
  ): Promise<PaginatedMessagesResponse> {
    const { data: membership, error: membershipError } = await supabase
      .from("group_members")
      .select("joined_at")
      .eq("group_id", groupId)
      .eq("user_id", currentUserId)
      .single();

    if (membershipError) throw membershipError;
    if (!membership) throw new Error("User is not a member of this group");

    let query = supabase
      .from("group_messages")
      .select(
        `
        *,
        sender:profiles(*),
        note:notes(*),
        statuses:message_statuses(*)
      `,
        { count: "exact" }
      )
      .eq("group_id", groupId)
      .gte("created_at", membership.joined_at);

    if (beforeTimestamp) {
      query = query.lt("created_at", beforeTimestamp);
    }

    query = query.order("created_at", { ascending: false }).limit(limit);

    const { data, error, count } = await query;

    if (error) throw error;

    const messages = (data || []).reverse() as Message[];
    const hasMore = messages.length === limit;
    const oldestTimestamp = messages.length > 0 ? messages[0].created_at : null;

    if (messages.length > 0) {
      const deliverable = messages.filter((m) => m.sender_id !== currentUserId);
      await Promise.all(
        deliverable.map((m) =>
          MessageStatusesService.updateStatus(m.id, currentUserId, "delivered")
        )
      );
    }

    return {
      messages,
      hasMore,
      oldestTimestamp,
    };
  }

  static async getMessageById(
    messageId: string,
    currentUserId: string
  ): Promise<Message | null> {
    const { data, error } = await supabase
      .from("group_messages")
      .select(
        `
        *,
        sender:profiles(*),
        note:notes(*),
        statuses:message_statuses(*)
      `
      )
      .eq("id", messageId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (data && data.sender_id !== currentUserId) {
      await MessageStatusesService.updateStatus(
        data.id,
        currentUserId,
        "delivered"
      );
    }

    return data as Message | null;
  }
}

export default MessagesService;