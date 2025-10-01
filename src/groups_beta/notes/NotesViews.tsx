import { NotesList } from "./noteslist/NotesList"
import NoteEditor from "./NoteEditor"
import NoteViewer from "./note-viewer/NoteViewer"
import type { Note, NewNote } from "@/types/notes"
import { useSearchParams } from "react-router-dom"
import { useNoteStore } from "@/store/noteStore"
import { useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotes"
import { useGroupStore } from "@/store/groupStore"
import { toast } from "sonner"
import { useAuth } from "@/context/Authcontext"
import type { StudyGroup } from "@/types/groups"
import { useEffect } from "react"

interface NotesViewProps {
  group: StudyGroup
}

export const NotesView = ({ group }: NotesViewProps) => {
  const groupId = group.id
  const [searchParams, setSearchParams] = useSearchParams()

  const { mode, setMode, editingNote, setEditingNote, draftNote, clearLocalDraft } = useNoteStore()
  const setActiveTab = useGroupStore((s) => s.setActiveTab)

  const { user } = useAuth()

  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNote()

  const isUserAdmin = group?.created_by === user?.id
  const noteId = searchParams.get("n")

  /** --- Create New Note (Published) --- */
  const handleCreateNote = async (note: NewNote) => {
    try {
      const newNote = await createNoteMutation.mutateAsync({
        groupId,
        note: { ...note, status: "published" },
      })
      toast.success("Note published successfully!")
      clearLocalDraft(groupId)
      setMode("view")
      setSearchParams({ n: newNote.id, m: "view" })
    } catch (error) {
      console.error(error)
      toast.error("Failed to publish note.")
    }
  }

  /** --- Save as Draft --- */
  const handleSaveDraft = async (note: NewNote) => {
    try {
      const newNote = await createNoteMutation.mutateAsync({
        groupId,
        note: { ...note, status: "draft" },
      })
      toast.success("Draft saved successfully!")
      clearLocalDraft(groupId)
      setMode("view")
      setSearchParams({ n: newNote.id, m: "view" })
    } catch (error) {
      console.error(error)
      toast.error("Failed to save draft.")
    }
  }

  /** --- Update Existing Note --- */
  const handleUpdateNote = async (note: NewNote) => {
    if (!editingNote) return
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
      })
      toast.success("Note updated successfully!")
      clearLocalDraft(groupId)
      setMode("view")
      setSearchParams({ n: editingNote.id, m: "view" })
      setEditingNote(null)
    } catch (error) {
      console.error(error)
      toast.error("Failed to update note.")
    }
  }

  /** --- Delete Note --- */
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId)
      toast.success("Note deleted successfully!")
      handleBackToList()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete note.")
    }
  }

  const handleSelectNote = (note: Note) => {
    setMode("view")
    setEditingNote(null)
    setSearchParams({ n: note.id, m: "view" })
  }

  function handleBackToList() {
    setMode(null)
    setEditingNote(null)
    setSearchParams({})
  }

  function handleStartCreating() {
    setMode("create")
    setEditingNote(null)
    setSearchParams({ m: "create" })
  }

  function handleCancelCreating() {
    setMode(null)
    setEditingNote(null)
    setSearchParams({})
  }

  const handleStartEditing = (note: Note) => {
    setMode("edit")
    setEditingNote(note)
    setSearchParams({ n: note.id, m: "edit" })
  }

  function handleCancelEditing() {
    if (editingNote) {
      setMode("view")
      setSearchParams({ n: editingNote.id, m: "view" })
    } else {
      handleBackToList()
    }
    setEditingNote(null)
  }

  // Handle switching to chat after sharing a note
  const handleSwitchToChat = () => {
    setActiveTab("chat")
  }

  /** --- Restore local draft when starting create --- */
  // useEffect(() => {
  //   if (mode === "create" && draftNote) {
  //     toast.info("Restored draft from local storage.")
  //   }
  // }, [mode, draftNote])

  /** --- CREATE MODE --- */
  if (mode === "create") {
    return (
      <div className="h-full overflow-scroll hide-scrollbar w-full">
        <NoteEditor
          groupId={groupId}
          initialNote={draftNote || undefined}
          onSave={handleCreateNote}
          onSaveDraft={handleSaveDraft}
          onCancel={handleCancelCreating}
          isEditing={false}
          isLoading={createNoteMutation.isPending}
        />
      </div>
    )
  }

  /** --- EDIT MODE --- */
  if (mode === "edit" && editingNote) {
    return (
      <div className="h-full overflow-scroll hide-scrollbar w-full">
        <NoteEditor
          groupId={groupId}
          initialNote={editingNote}
          onSave={handleUpdateNote}
          onSaveDraft={handleSaveDraft}
          onCancel={handleCancelEditing}
          isEditing={true}
          isLoading={updateNoteMutation.isPending}
        />
      </div>
    )
  }

  /** --- VIEW MODE --- */
  if (noteId && mode === "view") {
    return (
      <div className="h-full overflow-scroll hide-scrollbar w-full note-bg">
        <NoteViewer
          noteId={noteId}
          onBack={handleBackToList}
          onEdit={handleStartEditing}
          currentUserId={user?.id || ""}
          groupId={groupId}
          isUserAdmin={isUserAdmin}
          onDelete={handleDeleteNote}
          onSwitchToChat={handleSwitchToChat}
        />
      </div>
    )
  }

  /** --- LIST MODE --- */
  return (
    <div className="h-full overflow-scroll hide-scrollbar w-full">
      <NotesList groupId={groupId} onSelectNote={handleSelectNote} onCreateNote={handleStartCreating} />
    </div>
  )
}