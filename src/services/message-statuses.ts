import { supabase } from "./supabase";

export type MessageStatus = "sent" | "delivered" | "seen";




export type MessageStatusRow = {
  id: string;
  message_id: string;
  user_id: string;
  status: MessageStatus;
  created_at: string;
};


class MessageStatusesService {
  // 🔹 Insert status (usually "sent")
  static async createStatus(
    messageId: string,
    userId: string,
    status: MessageStatus
  ) {
    const { data, error } = await supabase
      .from("message_statuses")
      .insert([{ message_id: messageId, user_id: userId, status }])
      .select()
      .single();

    if (error) throw error;
    return data as MessageStatusRow;
  }

  // 🔹 Update (or upsert) a user’s message status (delivered/seen)
  static async updateStatus(
    messageId: string,
    userId: string,
    status: MessageStatus
  ) {
    const { data, error } = await supabase
      .from("message_statuses")
      .upsert([{ message_id: messageId, user_id: userId, status }], {
        onConflict: "message_id,user_id", // prevent duplicate rows
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 🔹 Get all statuses for a given message 
  static async getStatusesForMessage(messageId: string) {
    const { data, error } = await supabase
      .from("message_statuses")
      .select("*, user:profiles(*)")
      .eq("message_id", messageId);

    if (error) throw error;
    return data;
  }

  // 🔹 Mark all messages in a group as seen for current user
  static async markGroupAsSeen(groupId: string, userId: string) {
    const { data: messages, error: msgError } = await supabase
      .from("group_messages")
      .select("id")
      .eq("group_id", groupId);

    if (msgError) throw msgError;
    if (!messages?.length) return [];

    const messageIds = messages.map((m) => m.id);

    const { data, error } = await supabase
      .from("message_statuses")
      .update({ status: "seen" })
      .eq("user_id", userId)
      .in("message_id", messageIds)
      .select();

    if (error) throw error;
    return data;
  }
}

export default MessageStatusesService;
