import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Star, 
  Eye, 
  Heart,
  Grid3X3,
  List,
  Clock
} from "lucide-react"
import { useState } from "react"
import type { Note } from "../types"

interface NoteExtended extends Note{
  views?: any,
 
  likes?: any,
  isFavorite: boolean
}

// Mock data - move this to a separate file or fetch from API


const dummyNotes: NoteExtended[] = [
  {
    id: "1",
    title: "Quadratic Equations",
    content: "The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. This fundamental equation helps solve any quadratic equation and is essential for understanding parabolic functions in mathematics.",
    createdAt: "2 hours ago",
    author: "Alex",
    tags: ["algebra", "formulas"],
    views: 12,
    likes: 3,
    isFavorite: false
  },
  {
    id: "2",
    title: "React Hooks Deep Dive",
    content: "useState and useEffect are the most commonly used hooks in React. Understanding their lifecycle and optimization patterns is crucial for building efficient React applications.",
    createdAt: "1 day ago",
    author: "Sarah",
    tags: ["react", "javascript"],
    views: 24,
    likes: 8,
    isFavorite: true
  },
  {
    id: "3",
    title: "Database Normalization",
    content: "Understanding 1NF, 2NF, and 3NF is crucial for designing efficient relational databases. Here's a practical guide with real-world examples.",
    createdAt: "3 days ago",
    author: "Mike",
    tags: ["database", "sql"],
    views: 18,
    likes: 5,
    isFavorite: false
  },
  {
    id: "4",
    title: "Advanced CSS Grid",
    content: "CSS Grid provides powerful layout capabilities that go beyond flexbox. Learn how to create complex, responsive layouts with ease.",
    createdAt: "1 week ago",
    author: "Emma",
    tags: ["css", "frontend"],
    views: 32,
    likes: 12,
    isFavorite: false
  },
  {
    id: "5",
    title: "Machine Learning Basics",
    content: "Introduction to supervised and unsupervised learning algorithms. Understanding the fundamentals before diving into complex models.",
    createdAt: "2 weeks ago",
    author: "David",
    tags: ["ml", "python", "ai"],
    views: 45,
    likes: 15,
    isFavorite: true
  }
]

interface NotesListProps {
  groupId: string
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
}

const getAuthorInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getAuthorColor = (name: string) => {
  const colors = [
    'from-blue-500 to-purple-500',
    'from-pink-500 to-red-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-yellow-500',
    'from-indigo-500 to-blue-500',
    'from-purple-500 to-pink-500'
  ]
  const index = name.length % colors.length
  return colors[index]
}

const getTagColor = (tag: string) => {
  const colorMap: Record<string, string> = {
    'algebra': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    'formulas': 'bg-green-100 text-green-700 hover:bg-green-200',
    'react': 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
    'javascript': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    'database': 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    'sql': 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    'css': 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    'frontend': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    'ml': 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    'python': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    'ai': 'bg-violet-100 text-violet-700 hover:bg-violet-200'
  }
  return colorMap[tag] || 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}

export const NotesList = ({ groupId, onSelectNote, onCreateNote }: NotesListProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredNotes = dummyNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'favorites' && note.isFavorite) ||
                         (activeFilter === 'recent' && ['2 hours ago', '1 day ago'].includes(note.createdAt))
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
              <p className="text-gray-600 mt-1">{filteredNotes.length} notes • Last updated 2 hours ago</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1 bg-gray-50">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="p-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Actions */}
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              
              <Button onClick={onCreateNote} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>
          
          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">Quick filters:</span>
            {[
              { key: 'all', label: 'All Notes' },
              { key: 'recent', label: 'Recent' },
              { key: 'favorites', label: 'Favorites' }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter.key)}
                className={`text-xs ${
                  activeFilter === filter.key 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <Card 
                  key={note.id} 
                  className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-purple-200 group"
                  onClick={() => onSelectNote(note)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`bg-gradient-to-br ${getAuthorColor(note.author)} text-white text-sm font-semibold`}>
                            {getAuthorInitials(note.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{note.author}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {note.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <Star className={`w-4 h-4 ${note.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2">
                      {note.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {note.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {note.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className={`text-xs cursor-pointer transition-colors ${getTagColor(tag)}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {note.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {note.likes}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add Note Card */}
              <Card 
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 border-dashed border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50"
                onClick={onCreateNote}
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-900 mb-2">
                    Create New Note
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Share your knowledge with the group
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <Card 
                  key={note.id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-purple-200"
                  onClick={() => onSelectNote(note)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getAuthorColor(note.author)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate pr-2">{note.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500">{note.createdAt}</span>
                            <Star className={`w-4 h-4 ${note.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-2">{note.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">by {note.author}</span>
                            <div className="flex gap-1">
                              {note.tags.slice(0, 2).map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={`text-xs ${getTagColor(tag)}`}
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 2 && (
                                <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {note.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {note.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a note in this group'}
              </p>
              <Button onClick={onCreateNote} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Note
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}