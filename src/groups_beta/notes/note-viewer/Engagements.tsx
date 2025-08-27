"use client"

import type React from "react"
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EngagementSectionProps {
  isLiked: boolean
  isBookmarked: boolean
  likesCount?: number
  commentsCount: number
  onLike: () => void
  onBookmark: () => void
  onShare: () => void
  showComments?: boolean
}

const EngagementSection: React.FC<EngagementSectionProps> = ({
  isLiked,
  isBookmarked,
  likesCount,
  commentsCount,
  onLike,
  onBookmark,
  onShare,
  showComments = true,
}) => {
  return (
    <Card className="border-0 bg-muted/30 dark:bg-muted/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`flex items-center gap-2 rounded-full px-3 py-2 transition-all ${
                isLiked
                  ? "text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-950"
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {likesCount && <span className="text-sm font-medium">{likesCount}</span>}
            </Button>

            {showComments && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 rounded-full px-3 py-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{commentsCount}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBookmark}
              className={`rounded-full p-2 transition-all ${
                isBookmarked
                  ? "text-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-950"
                  : "text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="rounded-full p-2 text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/50 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EngagementSection
