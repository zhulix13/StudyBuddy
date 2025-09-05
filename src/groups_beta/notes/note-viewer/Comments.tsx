'use client'

import React, { useState } from "react"
import { Send, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCommentsByNoteId, useAddComment, useRepliesCount, useRealtimeComments } from "@/hooks/useComments"
import NestedCommentItem from "./NestedCommentItem"
import RepliesSection from "./RepliesSection"

interface CommentsSectionProps {
  noteId: string
  currentUserId?: string
  currentUserRole?: 'admin' | 'user'
  currentUserAvatar?: string
  currentUserName?: string
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  noteId,
  currentUserId,
  currentUserRole,
  currentUserAvatar,
  currentUserName
}) => {
  const [newComment, setNewComment] = useState("")
  const [showAllComments, setShowAllComments] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  
  // Listen for realtime comment updates
  useRealtimeComments(noteId)

  // Fetch root comments only
  const { data: comments = [], isLoading } = useCommentsByNoteId(noteId)
  
  const addComment = useAddComment()

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      addComment.mutate({
        noteId,
        content: newComment.trim()
      })
      setNewComment("")
    }
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const displayedComments = showAllComments 
    ? comments 
    : comments.slice(0, 5) // Show more initial comments for better UX

  if (isLoading) {
    return (
      <Card className="shadow-sm bg-white dark:bg-gray-900 border-0 sm:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm bg-white dark:bg-gray-900 border-0 sm:shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Comments ({comments.length})
        </h3>
        
        {/* Add Comment Form */}
        <div className="flex gap-4 mb-8">
          <Avatar className="w-10 h-10 ring-2 ring-slate-100 dark:ring-slate-800 flex-shrink-0">
            <AvatarImage src={currentUserAvatar || "/placeholder.svg"} alt={currentUserName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm">
              {currentUserName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <form onSubmit={handleCommentSubmit} className="flex-1 space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[100px] resize-none border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
              disabled={addComment.isPending}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || addComment.isPending}
                className="px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {addComment.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Comment
              </Button>
            </div>
          </form>
        </div>

        <Separator className="mb-6" />

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-0">
            {displayedComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                currentUserAvatar={currentUserAvatar}
                currentUserName={currentUserName}
                isExpanded={expandedReplies.has(comment.id)}
                onToggleReplies={() => toggleReplies(comment.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}

        {comments.length > 5 && !showAllComments && (
          <div className="text-center pt-6 border-t border-slate-100 dark:border-slate-800 mt-8">
            <Button
              variant="ghost"
              onClick={() => setShowAllComments(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Show {comments.length - 5} more comments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CommentThreadProps {
  comment: any // Replace with your Comment type
  currentUserId?: string
  currentUserRole?: 'admin' | 'user'
  currentUserAvatar?: string
  currentUserName?: string
  isExpanded: boolean
  onToggleReplies: () => void
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  currentUserId,
  currentUserRole,
  currentUserAvatar,
  currentUserName,
  isExpanded,
  onToggleReplies
}) => {
  const { data: repliesCount = 0 } = useRepliesCount(comment.id)

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-b-0 py-6 first:pt-0">
      <NestedCommentItem
        comment={comment}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        currentUserAvatar={currentUserAvatar}
        currentUserName={currentUserName}
        depth={0}
        showReplies={isExpanded}
        onToggleReplies={onToggleReplies}
        repliesCount={repliesCount}
      />
      
      {/* Replies Section */}
      <RepliesSection
        parentCommentId={comment.id}
        noteId={comment.note_id}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        currentUserAvatar={currentUserAvatar}
        currentUserName={currentUserName}
        depth={1}
        isVisible={isExpanded}
      />
    </div>
  )
}

export default CommentsSection