import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCommentsByParentId } from "@/hooks/useComments"
import NestedCommentItem from "./NestedCommentItem"

interface RepliesSectionProps {
  parentCommentId: string
  noteId: string
  currentUserId?: string
  currentUserRole?: 'admin' | 'user'
  currentUserAvatar?: string
  currentUserName?: string
  depth?: number
  isVisible: boolean
}

const RepliesSection: React.FC<RepliesSectionProps> = ({
  parentCommentId,
  noteId,
  currentUserId,
  currentUserRole,
  currentUserAvatar,
  currentUserName,
  depth = 1,
  isVisible
}) => {
  const [showAll, setShowAll] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 3

  const { data: replies = [], isLoading } = useCommentsByParentId(parentCommentId, {
    enabled: isVisible
  })

  if (!isVisible || replies.length === 0) {
    return null
  }

  const displayedReplies = showAll 
    ? replies.slice(0, page * pageSize)
    : replies.slice(0, pageSize)

  const hasMoreReplies = replies.length > displayedReplies.length

  return (
    <div className="relative">
      {/* YouTube-style connection line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
      
      <div className="space-y-4 mt-4">
        {isLoading && (
          <div className="flex items-center justify-center py-4 ml-10">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          </div>
        )}
        
        {displayedReplies.map((reply, index) => (
          <NestedCommentItem
            key={reply.id}
            comment={reply}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            currentUserAvatar={currentUserAvatar}
            currentUserName={currentUserName}
            depth={depth}
          />
        ))}
        
        {/* Load more replies */}
        {hasMoreReplies && (
          <div className="ml-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!showAll) {
                  setShowAll(true)
                } else {
                  setPage(prev => prev + 1)
                }
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs h-7 px-3 font-medium"
            >
              <ChevronDown className="w-3 h-3 mr-1" />
              Show {Math.min(pageSize, replies.length - displayedReplies.length)} more {
                replies.length - displayedReplies.length === 1 ? 'reply' : 'replies'
              }
            </Button>
          </div>
        )}
        
        {/* Show less option when expanded */}
        {showAll && page > 1 && (
          <div className="ml-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAll(false)
                setPage(1)
              }}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs h-7 px-3"
            >
              <ChevronUp className="w-3 h-3 mr-1" />
              Show less
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RepliesSection