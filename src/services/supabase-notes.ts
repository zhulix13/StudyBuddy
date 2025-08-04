import type { Note, NewNote } from "@/types/notes";
import { supabase } from "./supabase";

class NotesService {
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
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error creating note: ${error.message}`);
    }
    
    // Transform the response to match Note interface
    return {
      ...data,
      author: data.author ? {
        id: data.author.id,
        name: data.author.full_name,
        username: data.author.username,
        avatar_url: data.author.avatar_url
      } : undefined
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
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
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

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching notes: ${error.message}`);
    }

    // Transform the response to match Note interface
    return (data || []).map(note => ({
      ...note,
      author: note.author ? {
        id: note.author.id,
        name: note.author.full_name,
        username: note.author.username,
        avatar_url: note.author.avatar_url
      } : undefined
    }));
  }

  /**
   * Fetch a specific note by ID.
   * @param noteId - The ID of the note to fetch.
   * @returns A promise that resolves to the note with author info or null if not found.
   */
  static async getNoteById(noteId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
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

    // Transform the response to match Note interface
    return {
      ...data,
      author: data.author ? {
        id: data.author.id,
        name: data.author.full_name,
        username: data.author.username,
        avatar_url: data.author.avatar_url
      } : undefined
    };
  }

  /**
   * Update a note.
   * @param noteId - The ID of the note to update.
   * @param updates - The fields to update.
   * @returns A promise that resolves to the updated note with author info.
   */
  static async updateNote(noteId: string, updates: Partial<Omit<Note, 'id' | 'user_id' | 'created_by' | 'created_at' | 'author'>>) {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error updating note: ${error.message}`);
    }

    // Transform the response to match Note interface
    return {
      ...data,
      author: data.author ? {
        id: data.author.id,
        name: data.author.full_name,
        username: data.author.username,
        avatar_url: data.author.avatar_url
      } : undefined
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
    const { data, error } = await supabase
      .from('notes')
      .update({ pinned, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error toggling pin status: ${error.message}`);
    }

    // Transform the response to match Note interface
    return {
      ...data,
      author: data.author ? {
        id: data.author.id,
        name: data.author.full_name,
        username: data.author.username,
        avatar_url: data.author.avatar_url
      } : undefined
    };
  }
}

export const notesService = new NotesService();