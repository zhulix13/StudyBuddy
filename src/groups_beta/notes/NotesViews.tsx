import { NotesList } from "./NotesList";
import NoteEditor from "./NoteEditor";
import NoteViewer from "./NoteViewer";
import type { Note, NewNote } from "@/types/notes";
import { useSearchParams } from "react-router-dom";
import { useNoteStore } from "@/store/noteStore";
import { useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotes";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";
import type { StudyGroup } from "@/types/groups";

interface NotesViewProps {
  group: StudyGroup;
}

export const NotesView = ({ group }: NotesViewProps) => {
  const groupId = group.id;
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    mode,
    setMode,
    notes,
    setNotes,
    selectedNote,
    setSelectedNote,
    editingNote,
    setEditingNote,
  } = useNoteStore();

  const { user } = useAuth();

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const isUserAdmin = group?.created_by === user?.id;

  const handleCreateNote = async (note: NewNote) => {
    try {
      await createNoteMutation.mutateAsync({ groupId, note });
      toast.success("Note created successfully!");
      handleCancelCreating();
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note. Please try again.");
    }
  };

  const handleUpdateNote = async (note: NewNote) => {
    if (!editingNote) return;
    try {
      await updateNoteMutation.mutateAsync({
        noteId: editingNote.id,
        updates: {
          title: note.title,
          content: note.content,
          tags: note.tags,
          is_private: note.is_private,
          pinned: note.pinned,
        },
      });
      toast.success("Note updated successfully!");
      handleCancelEditing();
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note. Please try again.");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId);
      toast.success("Note deleted successfully!");
      handleBackToList();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note. Please try again.");
    }
  };

  const handleSelectNote = (note: Note) => {
    setMode("view");
    setSelectedNote(note);
    setEditingNote(null);
    setNotes(notes); // If you’re refreshing notes list
    setSearchParams({ n: note.id, m: "view" });
  };

  function handleBackToList() {
    setMode(null);
    setSelectedNote(null);
    setEditingNote(null);
    setSearchParams({});
  }

  function handleStartCreating() {
    setMode("create");
    setSelectedNote(null);
    setEditingNote(null);
    setSearchParams({ m: "create" });
  }

  function handleCancelCreating() {
    setMode(null);
    setSelectedNote(null);
    setEditingNote(null);
    setSearchParams({});
  }

  const handleStartEditing = (note: Note) => {
    setMode("edit");
    setEditingNote(note);
    setSelectedNote(null);
    setSearchParams({ n: note.id, m: "edit" });
  };

  function handleCancelEditing() {
    setMode("view");
    if (editingNote) {
      setSelectedNote(editingNote);
      setSearchParams({ n: editingNote.id, m: "view" });
    } else {
      handleBackToList();
    }
    setEditingNote(null);
  }

  if (mode === "create") {
    return (
      <div className="h-full w-full">
        <NoteEditor
          groupId={groupId}
          onSave={handleCreateNote}
          onCancel={handleCancelCreating}
          isEditing={false}
          isLoading={createNoteMutation.isPending}
        />
      </div>
    );
  }

  if (mode === "edit" && editingNote) {
    return (
      <div className="h-full w-full">
        <NoteEditor
          groupId={groupId}
          initialNote={editingNote}
          onSave={handleUpdateNote}
          onCancel={handleCancelEditing}
          isEditing={true}
          isLoading={updateNoteMutation.isPending}
        />
      </div>
    );
  }

  if (selectedNote && mode === "view") {
    return (
      <div className="h-full w-full">
        <NoteViewer
          note={selectedNote}
          onBack={handleBackToList}
          onEdit={() => handleStartEditing(selectedNote)}
          currentUserId={user?.id || ""}
          isUserAdmin={isUserAdmin}
          onDelete={handleDeleteNote}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <NotesList
        groupId={groupId}
        onSelectNote={handleSelectNote}
        onCreateNote={handleStartCreating}
      />
    </div>
  );
};
