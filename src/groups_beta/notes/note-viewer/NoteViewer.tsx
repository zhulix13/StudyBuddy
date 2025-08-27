"use client"

import type React from "react"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import TipTapContent from "../tiptap-content"
import EngagementSection from "./Engagements"
import CommentsSection from "./Comments"
import {
  MoreHorizontal,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  Crown,
  Loader2,
  AlertTriangle,
  Share2,
  Bookmark,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNoteById } from "@/hooks/useNotes"
import type { Note } from "@/types/notes"

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar_url?: string
  }
  created_at: string
  likes?: number
  isLiked?: boolean
}

interface NoteViewerProps {
  noteId: string
  currentUserId: string
  isUserAdmin?: boolean
  onLike?: (noteId: string) => void
  onBookmark?: (noteId: string) => void
  onComment?: (noteId: string, comment: string) => void
  onCommentLike?: (commentId: string) => void
  onShare?: (noteId: string) => void
  onEdit?: (note: Note) => void
  onDelete?: (noteId: string) => void
  onBack?: () => void
  showComments?: boolean
}

// Mock comments for demonstration
const mockComments: Comment[] = [
  {
    id: "1",
    content:
      "Great insights! This really helped me understand the concept better. Thanks for sharing your knowledge with the community.",
    author: {
      id: "user1",
      name: "Sarah Chen",
      avatar_url: undefined,
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 12,
    isLiked: false,
  },
  {
    id: "2",
    content: "I have a question about the third point you mentioned. Could you elaborate on that part?",
    author: {
      id: "user2",
      name: "Michael Rodriguez",
      avatar_url: undefined,
    },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 5,
    isLiked: true,
  },
  {
    id: "3",
    content: "Bookmarked this for later reference! 📚",
    author: {
      id: "user3",
      name: "Emma Thompson",
      avatar_url: undefined,
    },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 8,
    isLiked: false,
  },
  {
    id: "4",
    content:
      "This is exactly what I was looking for! The examples you provided are really helpful. Would love to see more content like this.",
    author: {
      id: "user4",
      name: "David Kim",
      avatar_url: undefined,
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 15,
    isLiked: true,
  },
]

const NoteViewer: React.FC<NoteViewerProps> = ({
  noteId,
  currentUserId,
  isUserAdmin,
  onLike,
  onBookmark,
  onComment,
  onCommentLike,
  onShare,
  onEdit,
  onDelete,
  onBack,
  showComments = true,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch note data using the hook
  const { data: note, isLoading, error } = useNoteById(noteId)

  // Use mock comments if none provided
  const comments = note?.comments || mockComments

  const canEditOrDelete = currentUserId === note?.author?.id || isUserAdmin

  const handleLike = () => {
    if (note) {
      onLike?.(note.id)
    }
  }

  const handleBookmark = () => {
    if (note) {
      onBookmark?.(note.id)
    }
  }

  const handleShare = () => {
    if (note) {
      onShare?.(note.id)
    }
  }

  const handleComment = (comment: string) => {
    if (note) {
      onComment?.(note.id, comment)
    }
  }

  const handleCommentLike = (commentId: string) => {
    onCommentLike?.(commentId)
  }

  const handleDelete = () => {
    if (note) {
      onDelete?.(note.id)
      setShowDeleteDialog(false)
    }
  }

  const handleEdit = () => {
    if (note) {
      onEdit?.(note)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading note...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-destructive mb-4">
              <AlertTriangle className="w-10 h-10 mx-auto" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Failed to load note</h2>
            <p className="text-muted-foreground text-sm mb-4">
              The note could not be found or you don't have permission to view it.
            </p>
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Note not found
  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Note not found</h2>
            <p className="text-muted-foreground text-sm mb-4">The requested note doesn't exist or has been deleted.</p>
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
          <Button variant="ghost" onClick={onBack} size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Author Section */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={note?.author?.avatar_url || "/placeholder.svg"} alt={note?.author?.name} />
                      <AvatarFallback className="text-sm">
                        {note?.author?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isUserAdmin && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                        <Crown className="w-2.5 h-2.5 text-yellow-700" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{note?.author?.name}</h3>
                      {isUserAdmin && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </div>
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          Edited
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBookmark}>
                      <Bookmark className="w-4 h-4 mr-2" />
                      {note.isBookmarked ? "Unbookmark" : "Bookmark"}
                    </DropdownMenuItem>

                    {canEditOrDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Note Content */}
          <Card>
            <CardContent className="p-6">
              {/* Pinned Badge */}
              {note.pinned && (
                <div className="mb-4">
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">📌 Pinned</Badge>
                </div>
              )}

              {/* Title */}
              {note.title && <h1 className="text-2xl font-bold mb-4 text-balance">{note.title}</h1>}

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <TipTapContent content={note.content} className="leading-relaxed" />
              </div>
            </CardContent>
          </Card>

          {/* Engagement Section */}
          <EngagementSection
            isLiked={note.isLiked || false}
            isBookmarked={note.isBookmarked || false}
            likesCount={note.likes}
            commentsCount={comments?.length || 0}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onShare={handleShare}
            showComments={showComments}
          />

          {/* Comments Section */}
          {showComments && (
            <CommentsSection comments={comments} onComment={handleComment} onCommentLike={handleCommentLike} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default NoteViewer
