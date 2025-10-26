// services/supabase-notes.ts (UPDATED WITH NOTIFICATIONS)
import type { Note, NewNote } from "@/types/notes";
import { supabase } from "./supabase";
import { NotificationTriggers } from "./notifications/trigger";

export default class NotesService {
  /**
   * Create a note for a specific group.
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

    // Fetch the author profile separately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    
    const createdNote: Note = {
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

    // 🔥 TRIGGER NOTIFICATION (fire and forget)
    this.sendNewNoteNotification(groupId, data.id, user.id, note.title, profile).catch(err => {
      console.error('Failed to send new note notification:', err);
    });
    
    return createdNote;
  }

  // 🔥 NEW: Send notification for new note
  private static async sendNewNoteNotification(
    groupId: string,
    noteId: string,
    creatorId: string,
    noteTitle: string,
    creatorProfile: any
  ) {
    try {
      // Get all group members
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
      
      const memberIds = members.map(m => m.user_id);
      
      await NotificationTriggers.notifyNewNote(
        memberIds,
        creatorId,
        {
          groupId,
          groupName: group.name,
          noteId,
          noteTitle,
          actorName: creatorProfile?.full_name || 'Someone',
          actorAvatar: creatorProfile?.avatar_url,
        }
      );
    } catch (error) {
      console.error('Error in sendNewNoteNotification:', error);
    }
  }


  
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

    if (!options?.includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const sortBy = options?.sortBy || 'updated_at';
    const sortOrder = options?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

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

    const userIds = [...new Set(notes.map(note => note.user_id))];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map(profile => [profile.id, profile])
    );

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
          name: 'Unknown User',
          username: null,
          avatar_url: null
        }
      };
    });
  }

  static async getNoteById(noteId: string) {
    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching note: ${error.message}`);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', note.user_id)
      .maybeSingle();

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', note.user_id)
      .maybeSingle();

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

  static async permanentlyDeleteNote(noteId: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      throw new Error(`Error permanently deleting note: ${error.message}`);
    }
  }

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', note.user_id)
      .maybeSingle();

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