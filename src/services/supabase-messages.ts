import { supabase } from "./supabase";
import type { Profile } from "@/types/profile";
import type { Note } from "@/types/notes";
import MessageStatusesService from "./message-statuses";

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
  // 🔹 UPDATED: Fetch messages with pagination (most recent first)
  static async getMessagesByGroupId(
    groupId: string,
    currentUserId: string,
    limit: number = 50,
    beforeTimestamp?: string // Load messages older than this timestamp
  ): Promise<PaginatedMessagesResponse> {
    // 1️⃣ Get the user's joined_at timestamp from group_members
    const { data: membership, error: membershipError } = await supabase
      .from("group_members")
      .select("joined_at")
      .eq("group_id", groupId)
      .eq("user_id", currentUserId)
      .single();

    if (membershipError) throw membershipError;
    if (!membership) throw new Error("User is not a member of this group");

    // 2️⃣ Build query with pagination
    let query = supabase
      .from("group_messages")
      .select(
        `
        *,
        sender:profiles(*),
        note:notes(*),
        statuses:message_statuses(*)
      `,
        { count: "exact" } // Get total count for hasMore calculation
      )
      .eq("group_id", groupId)
      .gte("created_at", membership.joined_at); // Filter by join date

    // 3️⃣ Add cursor-based pagination (load older messages)
    if (beforeTimestamp) {
      query = query.lt("created_at", beforeTimestamp);
    }

    // 4️⃣ Order by newest first and limit
    query = query.order("created_at", { ascending: false }).limit(limit);

    const { data, error, count } = await query;

    if (error) throw error;

    // 5️⃣ Reverse the array to show oldest-to-newest in UI
    const messages = (data || []).reverse() as Message[];

    // 6️⃣ Calculate if there are more messages to load
    const hasMore = messages.length === limit;
    const oldestTimestamp = messages.length > 0 ? messages[0].created_at : null;

    // 7️⃣ Mark messages as delivered (except own messages)
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

  // 🔹 Fetch single message by ID (unchanged)
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

  // 🔹 Create a new message (unchanged)
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
    return data as Message;
  }

  // 🔹 Reply to a message (unchanged)
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

    return data as Message;
  }

  // 🔹 Update message (unchanged)
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

  // 🔹 Delete message (unchanged)
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