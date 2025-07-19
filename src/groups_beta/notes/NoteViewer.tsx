import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit3 } from "lucide-react"
import type { Note } from "../types"

interface NoteViewerProps {
  note: Note
  onBack: () => void
  onEdit?: () => void
}

export const NoteViewer = ({ note, onBack, onEdit }: NoteViewerProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{note.title}</h2>
            <p className="text-sm text-gray-500">by {note.author} • {note.createdAt}</p>
          </div>
        </div>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 p-4">
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            {note.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{note.content}</p>
        </div>
      </div>
    </div>
  )
}