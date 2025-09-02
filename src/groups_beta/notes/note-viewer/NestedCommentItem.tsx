import React, { useState } from 'react'
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLikeButton } from "@/hooks/useLikes"
import { useAddComment, useUpdateComment, useDeleteComment } from "@/hooks/useComments"
import CommentMenu from "./CommentMenu"
import EditCommentForm from "./EditComment"
import DeleteCommentDialog from "./DeleteCommentDialog"
import ReplyForm from "./ReplyForm"

interface NestedCommentItemProps {
  comment: any // Replace with your Comment type
  currentUserId?: string
  currentUserRole?: 'admin' | 'user'
  currentUserAvatar?: string
  currentUserName?: string
  depth?: number
  maxDepth?: number
  showReplies?: boolean
  onToggleReplies?: () => void
  repliesCount?: number
}

const NestedCommentItem: React.FC<NestedCommentItemProps> = ({
  comment,
  currentUserId,
  currentUserRole,
  currentUserAvatar,
  currentUserName,
  depth = 0,
  maxDepth = 3,
  showReplies = false,
  onToggleReplies,
  repliesCount = 0
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  
  const { count: likesCount, isLiked, toggle: toggleLike, isToggling } = useLikeButton(comment.id, 'comment')
  const addComment = useAddComment()
  const updateComment = useUpdateComment()
  const deleteComment = useDeleteComment()

  // Permission checks
  const isAuthor = currentUserId === comment.author?.id
  const isAdmin = currentUserRole === 'admin'
  const canEdit = isAuthor
  const canDelete = isAuthor || isAdmin
  const canReply = depth < maxDepth

  const handleEdit = () => setIsEditing(true)
  const handleCancelEdit = () => setIsEditing(false)

  const handleSaveEdit = (newContent: string) => {
    updateComment.mutate(
      { commentId: comment.id, content: newContent },
      {
        onSuccess: () => setIsEditing(false)
      }
    )
  }

  const handleDelete = () => setShowDeleteDialog(true)

  const handleConfirmDelete = () => {
    deleteComment.mutate(comment.id, {
      onSuccess: () => setShowDeleteDialog(false)
    })
  }

  const handleReply = (content: string) => {
    addComment.mutate({
      noteId: comment.note_id,
      content,
      parentCommentId: comment.id
    }, {
      onSuccess: () => setShowReplyForm(false)
    })
  }

  // Calculate indentation and connection line styles
  const isNested = depth > 0
  const avatarSize = isNested ? "w-8 h-8" : "w-10 h-10"
  const textSize = isNested ? "text-sm" : "text-base"

  return (
    <>
      <div className="group relative">
        {/* YouTube-style connection line for nested comments */}
        {isNested && (
          <div className="absolute left-5 top-0 w-6 h-6 border-l-2 border-b-2 border-slate-200 dark:border-slate-700 rounded-bl-lg" />
        )}
        
        <div className={`flex gap-3 ${isNested ? 'ml-10 pt-4' : ''}`}>
          <Avatar className={`${avatarSize} ring-2 ring-slate-100 dark:ring-slate-800 flex-shrink-0`}>
            <AvatarImage src={comment.author?.avatar_url || "/placeholder.svg"} alt={comment.author?.name} />
            <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white text-xs">
              {comment.author?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`font-semibold text-slate-900 dark:text-slate-100 ${isNested ? 'text-sm' : ''}`}>
                  {comment.author?.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  {comment.updated_at && comment.updated_at !== comment.created_at && (
                    <span className="ml-1">(edited)</span>
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
                <p className={`text-slate-700 dark:text-slate-300 leading-relaxed ${textSize}`}>
                  {comment.content}
                </p>
                
                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLike}
                    disabled={isToggling}
                    className={`flex items-center gap-1 text-xs h-7 px-2 ${
                      isLiked 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-slate-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                    {likesCount > 0 && <span>{likesCount}</span>}
                  </Button>
                  
                  {canReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="flex items-center gap-1 text-xs h-7 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Reply
                    </Button>
                  )}
                  
                  {/* Show replies toggle for parent comments */}
                  {!isNested && repliesCount > 0 && onToggleReplies && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleReplies}
                      className="flex items-center gap-1 text-xs h-7 px-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {showReplies ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Hide replies
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
            
            {/* Reply Form */}
            {showReplyForm && (
              <ReplyForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                isLoading={addComment.isPending}
                currentUserAvatar={currentUserAvatar}
                currentUserName={currentUserName}
                placeholder={`Reply to ${comment.author?.name}...`}
              />
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

export default NestedCommentItem