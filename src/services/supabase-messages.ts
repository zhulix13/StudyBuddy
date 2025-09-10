// 2. Updated Messages Service to include statuses - src/services/supabase-messages.ts
import { supabase } from "./supabase";
import type { Profile } from "@/types/profile";
import type { Note } from "@/types/notes";
import MessageStatusesService from "./message-statuses";

export type Message = {
  id: string;
  group_id: string;
  sender_id: string;
  content: string | null;
  message_type : string | null;
  reply_to? : string | null;
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

class MessagesService {
  // 🔹 Fetch all messages in a group (with sender + note + statuses info)
  static async getMessagesByGroupId(
    groupId: string,
    currentUserId: string
  ): Promise<Message[]> {
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
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // ✅ Mark all messages as delivered for current user (except own messages)
    if (data?.length) {
      const deliverable = data.filter((m) => m.sender_id !== currentUserId);
      await Promise.all(
        deliverable.map((m) =>
          MessageStatusesService.updateStatus(m.id, currentUserId, "delivered")
        )
      );
    }

    return data as Message[];
  }

  // 🔹 Fetch single message by ID
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

    // ✅ If not sender, mark delivered
    if (data && data.sender_id !== currentUserId) {
      await MessageStatusesService.updateStatus(
        data.id,
        currentUserId,
        "delivered"
      );
    }

    return data as Message | null;
  }

  // 🔹 Create a new message (text or note)
  static async createMessage(
    groupId: string,
    senderId: string,
    content?: string,
    noteId?: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from("group_messages")
      .insert([
        {
          group_id: groupId,
          sender_id: senderId,
          content: content ?? null,
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

    return data as Message;
  }

  // Other methods remain the same...
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
}

export default MessagesService;