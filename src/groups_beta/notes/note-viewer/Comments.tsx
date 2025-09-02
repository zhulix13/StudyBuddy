'use client'

import React, { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Heart, Send, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCommentsByNoteId, useAddComment, useUpdateComment, useDeleteComment } from "@/hooks/useComments"
import { useLikeButton } from "@/hooks/useLikes"
import CommentMenu from "./CommentMenu"
import EditCommentForm from "./EditComment"
import DeleteCommentDialog from "./DeleteCommentDialog"

interface CommentsSectionProps {
  noteId: string
  currentUserId?: string
  currentUserRole?: 'admin' | 'user' // Add role for permissions
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  noteId,
  currentUserId,
  currentUserRole
}) => {
  const [newComment, setNewComment] = useState("")
  const [showAllComments, setShowAllComments] = useState(false)
  
  // Fetch comments using the hook
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

  const displayedComments = showAllComments 
    ? comments 
    : comments.slice(0, 3)

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
        <form onSubmit={handleCommentSubmit} className="space-y-4 mb-8">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
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
              Post Comment
            </Button>
          </div>
        </form>

        <Separator className="mb-6" />

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {displayedComments.map((comment, index) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                isFirst={index === 0}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}

        {comments.length > 3 && !showAllComments && (
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
  )
}

interface CommentItemProps {
  comment: any // Replace with your Comment type
  isFirst: boolean
  currentUserId?: string
  currentUserRole?: 'admin' | 'user'
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  isFirst, 
  currentUserId,
  currentUserRole 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const { count: likesCount, isLiked, toggle: toggleLike, isToggling } = useLikeButton(comment.id, 'comment')
  const updateComment = useUpdateComment()
  const deleteComment = useDeleteComment()

  // Permission checks
  const isAuthor = currentUserId === comment.author?.id
  const isAdmin = currentUserRole === 'admin'
  const canEdit = isAuthor
  const canDelete = isAuthor || isAdmin

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = (newContent: string) => {
    updateComment.mutate(
      { commentId: comment.id, content: newContent },
      {
        onSuccess: () => {
          setIsEditing(false)
        }
      }
    )
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    deleteComment.mutate(comment.id, {
      onSuccess: () => {
        setShowDeleteDialog(false)
      }
    })
  }

  return (
    <>
      <div className={`group ${!isFirst ? 'pt-6 border-t border-slate-100 dark:border-slate-800' : ''}`}>
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 ring-2 ring-slate-100 dark:ring-slate-800">
            <AvatarImage src={comment.author?.avatar_url || "/placeholder.svg"} alt={comment.author?.name} />
            <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white text-sm">
              {comment.author?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {comment.author?.name}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  {comment.updated_at && comment.updated_at !== comment.created_at && (
                    <span className="ml-1 text-xs">(edited)</span>
                  )}
                </span>
              </div>
              
              <CommentMenu
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canEdit}
                canDelete={canDelete}
                isDeleting={deleteComment.isPending}
              />
            </div>
            
            {isEditing ? (
              <EditCommentForm
                initialContent={comment.content}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                isLoading={updateComment.isPending}
              />
            ) : (
              <>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {comment.content}
                </p>
                
                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLike}
                    disabled={isToggling}
                    className={`flex items-center gap-2 text-xs ${
                      isLiked 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-slate-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    {likesCount}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteCommentDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteComment.isPending}
        commentAuthor={comment.author?.name}
      />
    </>
  )
}

export default CommentsSection