
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

class MessagesService {
  // 🔹 Fetch all messages in a group (with sender + note + statuses info)

static async getMessagesByGroupId(
  groupId: string,
  currentUserId: string
): Promise<Message[]> {
  // 1️⃣ Get the user's joined_at timestamp from group_members
  const { data: membership, error: membershipError } = await supabase
    .from("group_members")
    .select("joined_at")
    .eq("group_id", groupId)
    .eq("user_id", currentUserId)
    .single();

  if (membershipError) throw membershipError;
  if (!membership) throw new Error("User is not a member of this group");

  // 2️⃣ Fetch messages created on/after joined_at
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
    .gte("created_at", membership.joined_at) // 👈 filter by join date
    .order("created_at", { ascending: true });

  if (error) throw error;

  // 3️⃣ Mark messages as delivered (except own messages)
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

  // 🔹 Create a new message (text or note share)
 static async createMessage(
  groupId: string,
  content?: string,
  noteId?: string
): Promise<Message> {
  const { data, error } = await supabase.rpc("send_message", {
    p_group_id: groupId,        // must be UUID
    p_content: content ?? null, // string for text/caption
    p_note_id: noteId ?? null   // UUID for note if provided
  });

  if (error) throw error;
  console.log("Message created:", data);
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

    return data as Message;
  }

  // 🔹 Update message
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

  // 🔹 Delete message
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