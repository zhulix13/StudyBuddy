import { useState } from "react";
import { NotesList } from "./NotesList";
import { NoteEditor } from "./NoteEditor";
import { NoteViewer } from "./NoteViewer";
import type { Note, NewNote } from "../types";
import { useSearchParams } from "react-router-dom";

interface NotesViewProps {
  groupId: string;
}

export const NotesView = ({ groupId }: NotesViewProps) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleCreateNote = (note: NewNote) => {
    // Here you would typically save to your backend
    console.log("Creating note:", note);
    setIsCreating(false);
    // Optionally refresh the notes list
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setSearchParams({ n: note.id }); // Update URL with selected note ID
  };

  const handleBackToList = () => {
    setSelectedNote(null);
    setSearchParams({}); // Clear URL parameters
  };

  const handleStartCreating = () => {
    setIsCreating(true);
  };

  const handleCancelCreating = () => {
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <NoteEditor
        groupId={groupId}
        onSave={handleCreateNote}
        onCancel={handleCancelCreating}
      />
    );
  }

  if (selectedNote) {
    return (
      <NoteViewer
        note={selectedNote}
        onBack={handleBackToList}
        onEdit={() => {
          // TODO: Implement edit functionality
          console.log("Edit note:", selectedNote.id);
        }}
      />
    );
  }

  return (
    <NotesList
      groupId={groupId}
      onSelectNote={handleSelectNote}
      onCreateNote={handleStartCreating}
    />
  );
};
