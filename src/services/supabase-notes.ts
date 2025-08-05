import type { Note, NewNote } from "@/types/notes";
import { supabase } from "./supabase";

export default class NotesService {
  /**
   * Create a note for a specific group.
   * @param groupId - The ID of the group to create the note for.
   * @param note - The note data to create.
   * @returns A promise that resolves to the created note with author info.
   */
  static async createNote(groupId: string, note: NewNote): Promise<Note> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw authError ?? new Error("Not authenticated");
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{ 
        user_id: user.id, 
        group_id: groupId, 
        ...note 
      }])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error creating note: ${error.message}`);
    }

    // Fetch the author profile separately (may not exist)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle missing profiles
    
    // Transform the response to match Note interface
    return {
      ...data,
      author: profile ? {
        id: profile.id,
        name: profile.full_name || user.email || 'Unknown User', // Fallback to email
        username: profile.username,
        avatar_url: profile.avatar_url
      } : {
        id: user.id,
        name: user.email || 'Unknown User', // Fallback when no profile exists
        username: null,
        avatar_url: null
      }
    };
  }

  /**
   * Fetch all notes for a specific group.
   * @param groupId - The ID of the group to fetch notes for.
   * @param options - Optional query options for filtering/sorting.
   * @returns A promise that resolves to an array of notes with author info.
   */
  static async getNotesByGroup(
    groupId: string, 
    options?: {
      includeDeleted?: boolean;
      sortBy?: 'created_at' | 'updated_at' | 'title';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
    }
  ) {
    let query = supabase
      .from('notes')
      .select('*')
      .eq('group_id', groupId);

    // Filter out deleted notes by default
    if (!options?.includeDeleted) {
      query = query.is('deleted_at', null);
    }

    // Apply sorting
    const sortBy = options?.sortBy || 'updated_at';
    const sortOrder = options?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply limit if specified
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data: notes, error } = await query;

    if (error) {
      throw new Error(`Error fetching notes: ${error.message}`);
    }

    if (!notes || notes.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(notes.map(note => note.user_id))];

    // Fetch all author profiles in one query
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);

    // Create a map of user_id to profile for quick lookup
    const profileMap = new Map(
      (profiles || []).map(profile => [profile.id, profile])
    );

    // Transform the response to match Note interface
    return notes.map(note => {
      const profile = profileMap.get(note.user_id);
      return {
        ...note,
        author: profile ? {
          id: profile.id,
          name: profile.full_name || 'Unknown User',
          username: profile.username,
          avatar_url: profile.avatar_url
        } : {
          id: note.user_id,
          name: 'Unknown User', // Fallback when no profile exists
          username: null,
          avatar_url: null
        }
      };
    });
  }

  /**
   * Fetch a specific note by ID.
   * @param noteId - The ID of the note to fetch.
   * @returns A promise that resolves to the note with author info or null if not found.
   */
  static async getNoteById(noteId: string) {
    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Error fetching note: ${error.message}`);
    }

    // Fetch the author profile (may not exist)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', note.user_id)
      .maybeSingle();

    // Transform the response to match Note interface
    return {
      ...note,
      author: profile ? {
        id: profile.id,
        name: profile.full_name || 'Unknown User',
        username: profile.username,
        avatar_url: profile.avatar_url
      } : {
        id: note.user_id,
        name: 'Unknown User',
        username: null,
        avatar_url: null
      }
    };
  }

  /**
   * Update a note.
   * @param noteId - The ID of the note to update.
   * @param updates - The fields to update.
   * @returns A promise that resolves to the updated note with author info.
   */
  static async updateNote(noteId: string, updates: Partial<Omit<Note, 'id' | 'user_id' | 'created_by' | 'created_at' | 'author'>>) {
    const { data: note, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error updating note: ${error.message}`);
    }

    // Fetch the author profile (may not exist)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', note.user_id)
      .maybeSingle();

    // Transform the response to match Note interface
    return {
      ...note,
      author: profile ? {
        id: profile.id,
        name: profile.full_name || 'Unknown User',
        username: profile.username,
        avatar_url: profile.avatar_url
      } : {
        id: note.user_id,
        name: 'Unknown User',
        username: null,
        avatar_url: null
      }
    };
  }

  /**
   * Soft delete a note (sets deleted_at timestamp).
   * @param noteId - The ID of the note to delete.
   * @returns A promise that resolves to the deleted note.
   */
  static async softDeleteNote(noteId: string) {
    const { data, error } = await supabase
      .from('notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error deleting note: ${error.message}`);
    }

    return data;
  }

  /**
   * Permanently delete a note from the database.
   * @param noteId - The ID of the note to permanently delete.
   * @returns A promise that resolves when the note is deleted.
   */
  static async permanentlyDeleteNote(noteId: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      throw new Error(`Error permanently deleting note: ${error.message}`);
    }
  }

  /**
   * Toggle the pinned status of a note.
   * @param noteId - The ID of the note to toggle.
   * @param pinned - Whether to pin or unpin the note.
   * @returns A promise that resolves to the updated note with author info.
   */
  static async togglePinNote(noteId: string, pinned: boolean) {
    const { data: note, error } = await supabase
      .from('notes')
      .update({ pinned, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error toggling pin status: ${error.message}`);
    }

    // Fetch the author profile (may not exist)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', note.user_id)
      .maybeSingle();

    // Transform the response to match Note interface
    return {
      ...note,
      author: profile ? {
        id: profile.id,
        name: profile.full_name || 'Unknown User',
        username: profile.username,
        avatar_url: profile.avatar_url
      } : {
        id: note.user_id,
        name: 'Unknown User',
        username: null,
        avatar_url: null
      }
    };
  }
}