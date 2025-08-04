import { useState } from "react";
import { NotesList } from "./NotesList";
import { NoteEditor } from "./NoteEditor";
import { NoteViewer } from "./NoteViewer";
import type { Note, NewNote } from "@/types/notes";
import { useSearchParams } from "react-router-dom";
import { useNoteStore } from "@/store/noteStore";

interface NotesViewProps {
  groupId: string;
}

export const NotesView = ({ groupId }: NotesViewProps) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();

  const mode = useNoteStore((s) => s.mode);
  const setMode = useNoteStore((s) => s.setMode);

  const handleCreateNote = (note: NewNote) => {
    // Here you would typically save to your backend
    console.log("Creating note:", note);
    
    // Optionally refresh the notes list
  };

  const handleSelectNote = (note: Note) => {
    setMode("view");
    setSelectedNote(note);
    setSearchParams({ n: note.id, m: "view" }); 
  };

  const handleBackToList = () => {
    setMode(null);
    setSelectedNote(null);
    setSearchParams({}); // Clear URL parameters
  };

  const handleStartCreating = () => {
    setMode("create");
    setSearchParams({ m: "create" }); // Update URL to indicate creation mode
  };

  const handleCancelCreating = () => {
    setMode(null);
    setSearchParams({}); // Clear URL parameters
  };

  if (mode === "create" ) {
    return (
      <NoteEditor
        groupId={groupId}
        onSave={handleCreateNote}
        onCancel={handleCancelCreating}
      />
    );
  }

  if (selectedNote && mode === "view") {
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
