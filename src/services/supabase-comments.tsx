import { supabase } from "./supabase";
import type {Comment} from "../types/comments";

export default class CommentsService{
    static async  addComment (noteId: string,content: string, parentCommentId?: string | null) {
        const { data, error } = await supabase
            .from("comments")
            .insert([{ note_id: noteId, parent_comment_id: parentCommentId, content }])
        return { data, error }
    }
}