"use client"

import type React from "react"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Heart, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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

interface CommentsSectionProps {
  comments: Comment[]
  onComment: (comment: string) => void
  onCommentLike: (commentId: string) => void
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, onComment, onCommentLike }) => {
  const [comment, setComment] = useState("")
  const [showAllComments, setShowAllComments] = useState(false)

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim()) {
      onComment(comment.trim())
      setComment("")
    }
  }

  const displayedComments = showAllComments ? comments : comments?.slice(0, 3)

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6">Comments ({comments?.length || 0})</h3>

        {/* Add Comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-4 mb-6">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!comment.trim()} size="sm" className="px-4">
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </form>

        <Separator className="mb-6" />

        {/* Comments List */}
        {comments && comments.length > 0 && (
          <div className="space-y-4">
            {displayedComments?.map((comment, index) => (
              <div key={comment.id} className={`${index > 0 ? "pt-4 border-t" : ""}`}>
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.author.avatar_url || "/placeholder.svg"} alt={comment.author.name} />
                    <AvatarFallback className="text-xs">
                      {comment.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/90 leading-relaxed mb-2">{comment.content}</p>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCommentLike(comment.id)}
                      className={`h-auto p-1 text-xs ${
                        comment.isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
                      }`}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
                      {comment.likes}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {comments && comments.length > 3 && !showAllComments && (
          <div className="text-center pt-4 border-t mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllComments(true)}
              className="text-primary hover:text-primary/80"
            >
              Show {comments.length - 3} more comments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CommentsSection
