import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NotesService from '@/services/supabase-notes';
import type { Note, NewNote } from '@/types/notes';

// Query keys
export const notesKeys = {
  all: ['notes'] as const,
  byGroup: (groupId: string) => [...notesKeys.all, 'group', groupId] as const,
  byId: (noteId: string) => [...notesKeys.all, 'note', noteId] as const,
};

// Hook to fetch notes by group
export const useNotesByGroup = (groupId: string) => {
  return useQuery({
    queryKey: notesKeys.byGroup(groupId),
    queryFn: () => NotesService.getNotesByGroup(groupId),
    enabled: !!groupId,
  });
};

// Hook to fetch a single note by ID
export const useNoteById = (noteId: string) => {
  return useQuery({
    queryKey: notesKeys.byId(noteId),
    queryFn: () => NotesService.getNoteById(noteId),
    enabled: !!noteId,
  });
};

// Hook to create a note
export const useCreateNote = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: ({ groupId, note }: { groupId: string; note: NewNote }) =>
      NotesService.createNote(groupId, note),
    onSuccess: (newNote) => {
      // Invalidate and refetch notes for the group
      queryClient.invalidateQueries({
        queryKey: notesKeys.byGroup(newNote.group_id),
      });
      
      // Optionally add the new note to the cache
      queryClient.setQueryData(
        notesKeys.byId(newNote.id),
        newNote
      );
    },
  });
};

// Hook to update a note
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, updates }: { 
      noteId: string; 
      updates: Partial<Omit<Note, 'id' | 'user_id' | 'created_by' | 'created_at' | 'author'>>
    }) =>
      NotesService.updateNote(noteId, updates),
    onSuccess: (updatedNote) => {
      // Update the specific note in cache
      queryClient.setQueryData(
        notesKeys.byId(updatedNote.id),
        updatedNote
      );
      
      // Invalidate and refetch notes for the group
      queryClient.invalidateQueries({
        queryKey: notesKeys.byGroup(updatedNote.group_id),
      });
    },
  });
};

// Hook to delete a note (soft delete)
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => NotesService.softDeleteNote(noteId),
    onSuccess: (deletedNote) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: notesKeys.byId(deletedNote.id),
      });
      
      // Invalidate group notes to refetch
      queryClient.invalidateQueries({
        queryKey: notesKeys.byGroup(deletedNote.group_id),
      });
    },
  });
};

// Hook to toggle pin status
export const useTogglePinNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, pinned }: { noteId: string; pinned: boolean }) =>
      NotesService.togglePinNote(noteId, pinned),
    onSuccess: (updatedNote) => {
      // Update the specific note in cache
      queryClient.setQueryData(
        notesKeys.byId(updatedNote.id),
        updatedNote
      );
      
      // Invalidate and refetch notes for the group
      queryClient.invalidateQueries({
        queryKey: notesKeys.byGroup(updatedNote.group_id),
      });
    },
  });
};