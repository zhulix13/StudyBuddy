import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import type { NewNote } from "../types"

interface NoteEditorProps {
  groupId: string
  onSave: (note: NewNote) => void
  onCancel: () => void
}

export const NoteEditor = ({ groupId, onSave, onCancel }: NoteEditorProps) => {
  const [newNote, setNewNote] = useState<NewNote>({ title: "", content: "", tags: "" })

  const handleSave = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      onSave(newNote)
      setNewNote({ title: "", content: "", tags: "" })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold">New Note</h2>
        </div>
        <Button onClick={handleSave} disabled={!newNote.title.trim() || !newNote.content.trim()}>
          Save Note
        </Button>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <Input
          placeholder="Note title..."
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          className="text-lg font-medium"
        />
        <Input
          placeholder="Tags (comma separated)"
          value={newNote.tags}
          onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
        />
        <Textarea
          placeholder="Write your note here..."
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          className="min-h-[400px] resize-none"
        />
      </div>
    </div>
  )
}