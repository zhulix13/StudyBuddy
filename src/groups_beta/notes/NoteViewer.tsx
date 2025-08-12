'use client'

import React, { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import TipTapContent from "./tiptap-content"
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  User, 
  Calendar, 
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Crown,
  Send
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import type {Note} from "@/types/notes"


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
  note: Note & {
    comments?: Comment[]
    isLiked?: boolean
    isBookmarked?: boolean
    pinned?: boolean
    likes?: number
  }
  currentUserId: string
  isUserAdmin?: boolean
  onLike?: (noteId: string) => void
  onBookmark?: (noteId: string) => void
  onComment?: (noteId: string, comment: string) => void
  onCommentLike?: (commentId: string) => void
  onShare?: (noteId: string) => void
  onEdit?: () => void
  onDelete?: (noteId: string) => void
  onBack?: () => void
  showComments?: boolean
}

// Mock comments for demonstration
const mockComments: Comment[] = [
  {
    id: "1",
    content: "Great insights! This really helped me understand the concept better. Thanks for sharing your knowledge with the community.",
    author: {
      id: "user1",
      name: "Sarah Chen",
      avatar_url: undefined
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likes: 12,
    isLiked: false
  },
  {
    id: "2", 
    content: "I have a question about the third point you mentioned. Could you elaborate on that part?",
    author: {
      id: "user2",
      name: "Michael Rodriguez",
      avatar_url: undefined
    },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    likes: 5,
    isLiked: true
  },
  {
    id: "3",
    content: "Bookmarked this for later reference! 📚",
    author: {
      id: "user3", 
      name: "Emma Thompson",
      avatar_url: undefined
    },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    likes: 8,
    isLiked: false
  },
  {
    id: "4",
    content: "This is exactly what I was looking for! The examples you provided are really helpful. Would love to see more content like this.",
    author: {
      id: "user4",
      name: "David Kim", 
      avatar_url: undefined
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    likes: 15,
    isLiked: true
  }
]

const NoteViewer: React.FC<NoteViewerProps> = ({ 
  note, 
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
  showComments = true 
}) => {
  const [comment, setComment] = useState("")
  const [showAllComments, setShowAllComments] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Use mock comments if none provided
  const comments = note.comments || mockComments

  const canEditOrDelete = currentUserId === note?.author?.id || isUserAdmin 

  const handleLike = () => {
    onLike?.(note.id)
  }

  const handleBookmark = () => {
    onBookmark?.(note.id)
  }

  const handleShare = () => {
    onShare?.(note.id)
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim()) {
      onComment?.(note.id, comment.trim())
      setComment("")
    }
  }

  const handleCommentLike = (commentId: string) => {
    onCommentLike?.(commentId)
  }

  const handleDelete = () => {
    onDelete?.(note.id)
    setShowDeleteDialog(false)
  }

  const displayedComments = showAllComments 
    ? comments 
    : comments?.slice(0, 3)

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
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

        {/* Author Card - Clearly Separated */}
        <Card className="my-12 border-l-4 border-l-blue-500 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-14 h-14 ring-2 ring-blue-100 dark:ring-blue-900">
                    <AvatarImage src={note?.author?.avatar_url || "/placeholder.svg"} alt={note?.author?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                      {note?.author?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isUserAdmin && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                      <Crown className="w-3 h-3 text-yellow-700" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">
                      {note?.author?.name}
                    </h3>
                    {isUserAdmin && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Admin
                      </Badge>
                    )}
                  </div>
                  {/* {note.author.bio && (
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                      {note.author.bio}
                    </p>
                  )} */}
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </div>
                    {/* {note.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {note.views.toLocaleString()} views
                      </div>
                    )} */}
                    {note.updated_at && note.updated_at !== note.created_at && (
                      <Badge variant="outline" className="text-xs">
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
                      <DropdownMenuItem onClick={onEdit}>
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
        <Card className="mb-6  bg-white dark:bg-gray-900 border-0 shadow-lg">
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

        {/* Engagement Section - Clearly Separated */}
        <Card className="mb-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleLike}
                  className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200 ${
                    note.isLiked 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900' 
                      : 'text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${note.isLiked ? 'fill-current' : ''}`} />
                  {/* <span className="font-semibold">{note.likes.toLocaleString()}</span> */}
                </Button>

                {showComments && (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex items-center gap-3 px-4 py-2 rounded-full text-slate-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">{comments?.length || 0}</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleBookmark}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    note.isBookmarked 
                      ? 'text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900' 
                      : 'text-slate-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${note.isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleShare}
                  className="p-3 rounded-full text-slate-600 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        {showComments && (
          <Card className="shadow-sm bg-white dark:bg-gray-900 border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Comments ({comments?.length || 0})
              </h3>
              
              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-4 mb-8">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="min-h-[100px] resize-none border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!comment.trim()}
                    className="px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </form>

              <Separator className="mb-6" />

              {/* Comments List */}
              {comments && comments.length > 0 && (
                <div className="space-y-6">
                  {displayedComments?.map((comment, index) => (
                    <div key={comment.id} className={`${index > 0 ? 'pt-6 border-t border-slate-100 dark:border-slate-800' : ''}`}>
                      <div className="flex gap-4">
                        <Avatar className="w-10 h-10 ring-2 ring-slate-100 dark:ring-slate-800">
                          <AvatarImage src={comment.author.avatar_url || "/placeholder.svg"} alt={comment.author.name} />
                          <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white text-sm">
                            {comment.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {comment.author.name}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {comment.content}
                          </p>
                          
                          <div className="flex items-center gap-4 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCommentLike(comment.id)}
                              className={`flex items-center gap-2 text-xs ${
                                comment.isLiked 
                                  ? 'text-red-500 hover:text-red-600' 
                                  : 'text-slate-500 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                              {comment.likes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {comments && comments.length > 3 && !showAllComments && (
                <div className="text-center pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllComments(true)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Show {comments.length - 3} more comments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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