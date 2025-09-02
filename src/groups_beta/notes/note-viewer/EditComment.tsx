import React, { useState, useEffect } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface EditCommentFormProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
  isLoading?: boolean
}

const EditCommentForm: React.FC<EditCommentFormProps> = ({
  initialContent,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && content.trim() !== initialContent) {
      onSave(content.trim())
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

  const hasChanges = content.trim() !== initialContent && content.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[80px] resize-none border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500"
        disabled={isLoading}
        autoFocus
      />
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Cmd+Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Esc</kbd> to cancel
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="h-8 px-3"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          
          <Button
            type="submit"
            size="sm"
            disabled={!hasChanges || isLoading}
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>
    </form>
  )
}

export default EditCommentForm