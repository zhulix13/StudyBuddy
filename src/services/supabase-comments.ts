import { supabase } from "./supabase";
import type { Comment } from "../types/comments";

export default class CommentsService {
    static async addComment(noteId: string, content: string, parentCommentId?: string | null) {
        const { data, error } = await supabase
            .from("comments")
            .insert([{ note_id: noteId, parent_comment_id: parentCommentId, content }])
            .select()
            .single();
        return { data, error };
    }

    static async getCommentsByNoteId(noteId: string) {
        const { data, error } = await supabase
            .from("comments")
            .select("*, author_id")
            .eq("note_id", noteId)
            .eq("is_deleted", false)
            .order("created_at", { ascending: true });
        return { data, error };
    }

    static async updateComment(commentId: string, content: string) {
        const { data, error } = await supabase
            .from("comments")
            .update({ content })
            .eq("id", commentId)
            .select()
            .single();
        return { data, error };
    }

    static async deleteComment(commentId: string) {
        const { data, error } = await supabase
            .from("comments")
            .update({ is_deleted: true })
            .eq("id", commentId)
            .select()
            .single();
        return { data, error };
    }

    static async getCommentById(commentId: string) {
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("id", commentId)
            .eq("is_deleted", false)
            .single();
        return { data, error };
    }
}