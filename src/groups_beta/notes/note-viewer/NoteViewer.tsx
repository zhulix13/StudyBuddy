'use client'

import React, { useState } from "react"
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
  Bookmark
} from 'lucide-react'
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
import { useCommentsByNoteId } from "@/hooks/useComments"
import type { Note } from "@/types/notes"

interface NoteViewerProps {
  noteId: string
  currentUserId: string
  isUserAdmin?: boolean
  onBookmark?: (noteId: string) => void
  onShare?: (noteId: string) => void
  onEdit?: (note: Note) => void
  onDelete?: (noteId: string) => void
  onBack?: () => void
  showComments?: boolean
}

const NoteViewer: React.FC<NoteViewerProps> = ({ 
  noteId,
  currentUserId,
  isUserAdmin,
  onBookmark,
  onShare,
  onEdit,
  onDelete,
  onBack,
  showComments = true 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Fetch note data using the hook
  const { data: note, isLoading, error } = useNoteById(noteId)
  
  // Get comments count for engagement section
  const { data: comments = [] } = useCommentsByNoteId(noteId)

  const canEditOrDelete = currentUserId === note?.author?.id || isUserAdmin 

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading note...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Failed to load note
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The note could not be found or you don't have permission to view it.
            </p>
            <Button onClick={onBack} variant="outline">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Note not found
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The requested note doesn't exist or has been deleted.
            </p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12 overflow-y-scroll hide-scrollbar relative bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-full  mx-auto p-4 md:p-6 lg:p-8">
        {/* Header with Back Button */}
        <div className="mb-6 absolute top-6 left-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
        </div>

        {/* Author Card  */}
        <Card className="my-12 border-l-4 border-l-blue-500 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-14 h-14 ring-2 ring-blue-100 dark:ring-blue-900">
                    <AvatarImage src={note?.author?.avatar_url || "/placeholder.svg"} alt={note?.author?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                      {note?.author?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {currentUserId === note?.author?.id && isUserAdmin ? (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                      <Crown className="w-3 h-3 text-yellow-700" />
                    </div>
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">
                      {note?.author?.name}
                    </h3>
                    {currentUserId === note?.author?.id && isUserAdmin ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs px-2 py-1 rounded-md">
                        Admin
                        </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </div>
                    {note.updated_at && note.updated_at !== note.created_at && (
                      <Badge variant="outline" className="text-xs dark:text-gray-400">
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
                    <MoreHorizontal className="w-4 dark:text-gray-400 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Note
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBookmark}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    {note.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                  </DropdownMenuItem>
                  
                  {canEditOrDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Note
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Note
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Note Content Card */}
        <Card className="mb-6 bg-white dark:bg-gray-900 border-0 shadow-lg">
          <CardContent className="p-8">
            {/* Pinned Badge */}
            {note.pinned && (
              <div className="mb-4">
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                  📌 Pinned
                </Badge>
              </div>
            )}

            {/* Title */}
            {note.title && (
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                {note.title}
              </h1>
            )}

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {note.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none prose-lg">
              <TipTapContent 
                content={note.content} 
                className="text-slate-700 dark:text-slate-300 leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>

        {/* Engagement Section - Now a separate component */}
        <EngagementSection
          noteId={noteId}
          commentsCount={comments.length}
          isBookmarked={note.isBookmarked}
          onBookmark={handleBookmark}
          onShare={handleShare}
          showComments={showComments}
        />

        {/* Comments Section - Now a separate component */}
        {showComments && (
          <CommentsSection
            noteId={noteId}
            currentUserId={currentUserId}
          />
        )}
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
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default NoteViewer