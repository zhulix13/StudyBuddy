import React, { useState } from 'react'
import { Send, X, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ReplyFormProps {
  onSubmit: (content: string) => void
  onCancel: () => void
  isLoading?: boolean
  currentUserAvatar?: string
  currentUserName?: string
  placeholder?: string
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  currentUserAvatar,
  currentUserName,
  placeholder = "Write a reply..."
}) => {
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content.trim())
      setContent("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div className="flex gap-3 mt-4">
      <Avatar className="w-8 h-8 ring-2 ring-slate-100 dark:ring-slate-800 flex-shrink-0">
        <AvatarImage src={currentUserAvatar || "/placeholder.svg"} alt={currentUserName} />
        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs">
          {currentUserName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <form onSubmit={handleSubmit} className="flex-1 space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[60px] resize-none border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 text-sm"
          disabled={isLoading}
          autoFocus
        />
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Cmd+Enter</kbd> to post
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
              className="h-7 px-3 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
            
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isLoading}
              className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Send className="w-3 h-3 mr-1" />
              )}
              Reply
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ReplyForm