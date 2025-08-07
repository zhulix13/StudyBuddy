'use client'

import React, { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import TipTapContent from "./tiptap-content"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, User, Calendar, Eye } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar_url?: string
  }
  created_at: string
}

interface NoteViewerProps {
  note: {
    id: string
    title?: string
    content: any // TipTap JSON
    created_at: string
    updated_at?: string
    likes: number
    views?: number
    comments?: Comment[]
    tags?: string[]
    author: {
      id: string
      name: string
      avatar_url?: string
      bio?: string
    }
    isLiked?: boolean
    isBookmarked?: boolean
  }
  onLike?: (noteId: string) => void
  onBookmark?: (noteId: string) => void
  onComment?: (noteId: string, comment: string) => void
  onShare?: (noteId: string) => void
  showComments?: boolean
}

const NoteViewer: React.FC<NoteViewerProps> = ({ 
  note, 
  onLike, 
  onBookmark,
  onComment, 
  onShare,
  showComments = true 
}) => {
  const [comment, setComment] = useState("")
  const [showAllComments, setShowAllComments] = useState(false)

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

  const displayedComments = showAllComments 
    ? note.comments 
    : note.comments?.slice(0, 3)

  return (
    <Card className="max-w-6xl mx-auto shadow-sm my-4 border-0 bg-white dark:bg-gray-900">
      <CardHeader className="pb-4">
        {/* Author Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={note.author.avatar_url || "/placeholder.svg"} alt={note.author.name} />
              <AvatarFallback>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {note.author.name}
              </h3>
              {note.author.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {note.author.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </div>
                {note.views && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {note.views} views
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBookmark}>
                <Bookmark className="w-4 h-4 mr-2" />
                {note.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        {note.title && (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">
            {note.title}
          </h1>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {note.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Note Content */}
        <div className="prose-container">
          <TipTapContent 
            content={note.content} 
            className="text-gray-800 dark:text-gray-200 leading-relaxed"
          />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                note.isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${note.isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{note.likes}</span>
            </Button>

            {showComments && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{note.comments?.length || 0}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`${
                note.isBookmarked 
                  ? 'text-blue-500 hover:text-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${note.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-600 hover:text-green-500"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4">
            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!comment.trim()}
                  className="px-6"
                >
                  Post Comment
                </Button>
              </div>
            </form>

            {/* Comments List */}
            {note.comments && note.comments.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Comments ({note.comments.length})
                </h4>
                
                <div className="space-y-4">
                  {displayedComments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar_url || "/placeholder.svg"} alt={comment.author.name} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {note.comments.length > 3 && !showAllComments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllComments(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Show {note.comments.length - 3} more comments
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NoteViewer
