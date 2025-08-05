import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Pin, 
  Lock, 
  Unlock, 
  Clock,
  User,
  Loader2,
  FileText
} from "lucide-react"
import { useState } from "react"
import { useNotesByGroup } from "@/hooks/useNotes"
import type { Note } from "@/types/notes"
import { formatDistanceToNow } from "date-fns"

interface NotesListProps {
  groupId: string
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
}

export const NotesList = ({ groupId, onSelectNote, onCreateNote }: NotesListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  
  const { data: notes = [], isLoading, error } = useNotesByGroup(groupId)

  // Filter notes based on search term
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Sort notes: pinned first, then by updated_at
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  const getContentPreview = (content: any): string => {
    if (typeof content === 'string') return content.slice(0, 150)
    if (content?.content) {
      // Extract text from TipTap JSON content
      const extractText = (node: any): string => {
        if (node.type === 'text') return node.text || ''
        if (node.content) {
          return node.content.map(extractText).join('')
        }
        return ''
      }
      const text = content.content.map(extractText).join(' ')
      return text.slice(0, 150)
    }
    return 'No content'
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notes</h1>
            <Button onClick={onCreateNote} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search notes..."
              className="pl-10"
              disabled
            />
          </div>
        </div>

        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading notes...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notes</h1>
            <Button onClick={onCreateNote} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {/* Error State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load notes</div>
            <div className="text-sm text-gray-500">Please try refreshing the page</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notes</h1>
          <Button onClick={onCreateNote} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">New Note</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-sm text-center mb-4 max-w-sm">
              {searchTerm 
                ? 'Try adjusting your search terms or create a new note.'
                : 'Get started by creating your first note for this group.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={onCreateNote} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {sortedNotes.map((note) => (
              <Card 
                key={note.id} 
                className="cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white"
                onClick={() => onSelectNote(note)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {note.pinned && (
                          <Pin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {note.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          {note.is_private ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                          <span className="hidden sm:inline">
                            {note.is_private ? 'Private' : 'Shared'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                          </span>
                        </div>

                        {note.author && (
                          <div className="flex items-center gap-1">
                            <img src={note.author.avatar_url} alt={note.author.name} className="w-4 h-4 rounded-full" />
                            <span className="truncate max-w-20 sm:max-w-none">
                              {note.author.name || note.author.username}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {getContentPreview(note.content)}
                  </p>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {sortedNotes.length > 0 && (
        <div className="p-4 border-t bg-white">
          <div className="text-xs text-gray-500 text-center">
            {sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>
      )}
    </div>
  )
}