// services/supabase-comments.ts
import { supabase } from './supabase'
import type { Comment } from '@/types/comments'

class CommentsService {
  // Add a new comment (can be root or reply)
  static async addComment(
    noteId: string, 
    content: string, 
    parentCommentId?: string | null
  ): Promise<Comment> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw authError ?? new Error("Not authenticated");

    const { data, error } = await supabase
      .from('comments')
      .insert([{ note_id: noteId, parent_comment_id: parentCommentId, content, author_id: user.id }])
      .select()
      .single();

    if (error) throw new Error(`Error creating comment: ${error.message}`);

    // Fetch the author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    return {
      ...data,
      author: profile ? {
        id: profile.id,
        name: profile.full_name || user.email || 'Unknown User',
        username: profile.username,
        avatar_url: profile.avatar_url
      } : {
        id: user.id,
        name: user.email || 'Unknown User',
        username: null,
        avatar_url: null
      }
    };
  }

  // Get all comments for a note (matches old service behavior)
  static async getCommentsByNoteId(noteId: string): Promise<Comment[]> {
    const { data: comments, error } = await supabase
      .from('comments')
      .select("*")
      .eq('note_id', noteId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Error fetching comments: ${error.message}`);
    if (!comments || comments.length === 0) return [];

    // Get unique author IDs
    const authorIds = [...new Set(comments.map(comment => comment.author_id))];

    // Fetch all author profiles in one query
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', authorIds);

    // Create a map of author_id to profile for quick lookup
    const profileMap = new Map(
      (profiles || []).map(profile => [profile.id, profile])
    );

    // Transform comments to include author info
    return comments.map(comment => {
      const profile = profileMap.get(comment.author_id);
      return {
        ...comment,
        author: profile ? {
          id: profile.id,
          name: profile.full_name || 'Unknown User',
          username: profile.username,
          avatar_url: profile.avatar_url
        } : {
          id: comment.author_id,
          name: 'Unknown User',
          username: null,
          avatar_url: null
        }
      };
    });
  }

  // Get root comments for a note (no parent)
  static async getRootCommentsByNoteId(noteId: string): Promise<Comment[]> {
    const { data: comments, error } = await supabase
      .from('comments')
      .select("*")
      .eq('note_id', noteId)
      .is('parent_comment_id', null)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch comments: ${error.message}`);
    if (!comments || comments.length === 0) return [];

    // Get unique author IDs
    const authorIds = [...new Set(comments.map(comment => comment.author_id))];

    // Fetch all author profiles in one query
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', authorIds);

    // Create a map of author_id to profile for quick lookup
    const profileMap = new Map(
      (profiles || []).map(profile => [profile.id, profile])
    );

    // Transform comments to include author info
    return comments.map(comment => {
      const profile = profileMap.get(comment.author_id);
      return {
        ...comment,
        author: profile ? {
          id: profile.id,
          name: profile.full_name || 'Unknown User',
          username: profile.username,
          avatar_url: profile.avatar_url
        } : {
          id: comment.author_id,
          name: 'Unknown User',
          username: null,
          avatar_url: null
        }
      };
    });
  }

  // Get replies for a specific comment
  static async getCommentsByParentId(parentCommentId: string): Promise<Comment[]> {
    const { data: comments, error } = await supabase
      .from('comments')
      .select("*")
      .eq('parent_comment_id', parentCommentId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch replies: ${error.message}`);
    if (!comments || comments.length === 0) return [];

    // Get unique author IDs
    const authorIds = [...new Set(comments.map(comment => comment.author_id))];

    // Fetch all author profiles in one query
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', authorIds);

    // Create a map of author_id to profile for quick lookup
    const profileMap = new Map(
      (profiles || []).map(profile => [profile.id, profile])
    );

    // Transform comments to include author info
    return comments.map(comment => {
      const profile = profileMap.get(comment.author_id);
      return {
        ...comment,
        author: profile ? {
          id: profile.id,
          name: profile.full_name || 'Unknown User',
          username: profile.username,
          avatar_url: profile.avatar_url
        } : {
          id: comment.author_id,
          name: 'Unknown User',
          username: null,
          avatar_url: null
        }
      };
    });
  }

  // Get replies count for a comment
  static async getRepliesCount(commentId: string): Promise<number> {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('parent_comment_id', commentId)
      .eq('is_deleted', false)

    if (error) throw new Error(`Failed to fetch replies count: ${error.message}`);
    return count || 0;
  }

  // Update comment content
  static async updateComment(commentId: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw new Error(`Error updating comment: ${error.message}`);

    // Fetch the author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', data.author_id)
      .maybeSingle();

    return {
      ...data,
      author: profile ? {
        id: profile.id,
        name: profile.full_name || 'Unknown User',
        username: profile.username,
        avatar_url: profile.avatar_url
      } : {
        id: data.author_id,
        name: 'Unknown User',
        username: null,
        avatar_url: null
      }
    };
  }

  // Soft delete a comment
  static async deleteComment(commentId: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw new Error(`Error deleting comment: ${error.message}`);
    return data;
  }

  // Get single comment by ID
  static async getCommentById(commentId: string): Promise<Comment | null> {
    const { data: comment, error } = await supabase
      .from('comments')
      .select("*")
      .eq('id', commentId)
      .eq('is_deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching comment: ${error.message}`);
    }

    // Fetch the author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', comment.author_id)
      .maybeSingle();

    return {
      ...comment,
      author: profile ? {
        id: profile.id,
        name: profile.full_name || 'Unknown User',
        username: profile.username,
        avatar_url: profile.avatar_url
      } : {
        id: comment.author_id,
        name: 'Unknown User',
        username: null,
        avatar_url: null
      }
    };
  }
}

export default CommentsService