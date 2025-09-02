import React from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteCommentDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
  commentAuthor?: string
}

const DeleteCommentDialog: React.FC<DeleteCommentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  commentAuthor
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Comment
          </AlertDialogTitle>
          <AlertDialogDescription>
            {commentAuthor ? (
              <>Are you sure you want to delete <span className="font-medium">{commentAuthor}'s</span> comment? This action cannot be undone.</>
            ) : (
              "Are you sure you want to delete this comment? This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCommentDialog