'use client'

import React from "react"
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLikeButton } from "@/hooks/useLikes"

interface EngagementSectionProps {
  noteId: string
  commentsCount: number
  isBookmarked?: boolean
  onBookmark?: (noteId: string) => void
  onShare?: (noteId: string) => void
  showComments?: boolean
}

const EngagementSection: React.FC<EngagementSectionProps> = ({
  noteId,
  commentsCount,
  isBookmarked = false,
  onBookmark,
  onShare,
  showComments = true
}) => {
  const { count: likesCount, isLiked, toggle: toggleLike, isToggling } = useLikeButton(noteId, 'note')

  const handleBookmark = () => {
    onBookmark?.(noteId)
  }

  const handleShare = () => {
    onShare?.(noteId)
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleLike}
              disabled={isToggling}
              className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900' 
                  : 'text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{likesCount}</span>
            </Button>

            {showComments && (
              <Button
                variant="ghost"
                size="lg"
                className="flex items-center gap-3 px-4 py-2 rounded-full text-slate-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">{commentsCount}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleBookmark}
              className={`p-3 rounded-full transition-all duration-200 ${
                isBookmarked 
                  ? 'text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900' 
                  : 'text-slate-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
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
  )
}

export default EngagementSection