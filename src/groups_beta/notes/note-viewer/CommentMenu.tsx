import React, { useState } from 'react'
import { MoreVertical, Edit3, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface CommentMenuProps {
  onEdit: () => void
  onDelete: () => void
  canEdit: boolean
  canDelete: boolean
  isDeleting?: boolean
}

const CommentMenu: React.FC<CommentMenuProps> = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  isDeleting = false
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Don't render if user has no permissions
  if (!canEdit && !canDelete) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={isDeleting}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {canEdit && (
          <DropdownMenuItem
            onClick={() => {
              onEdit()
              setIsOpen(false)
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              onDelete()
              setIsOpen(false)
            }}
            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CommentMenu