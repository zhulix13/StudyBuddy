import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText } from "lucide-react"
import type { Note } from "../types"

// Mock data - move this to a separate file or fetch from API
const dummyNotes: Note[] = [
  {
    id: "1",
    title: "Quadratic Equations",
    content: "The quadratic formula is x = (-b ± √(b²-4ac)) / 2a",
    createdAt: "2 hours ago",
    author: "Alex",
    tags: ["algebra", "formulas"]
  },
  {
    id: "2",
    title: "React Hooks",
    content: "useState and useEffect are the most commonly used hooks...",
    createdAt: "1 day ago",
    author: "Sarah",
    tags: ["react", "javascript"]
  }
]

interface NotesListProps {
  groupId: string
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
}

export const NotesList = ({ groupId, onSelectNote, onCreateNote }: NotesListProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Notes</h2>
        <Button onClick={onCreateNote} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {dummyNotes.map((note) => (
            <Card key={note.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectNote(note)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{note.title}</CardTitle>
                    <CardDescription className="text-sm">
                      by {note.author} • {note.createdAt}
                    </CardDescription>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{note.content}</p>
                <div className="flex gap-2">
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}