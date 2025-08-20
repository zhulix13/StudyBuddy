"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Save, Trash2, ArrowLeft } from "lucide-react"

interface UnsavedChangesModalProps {
  isOpen: boolean
  onSaveDraft?: () => void
  onDiscardChanges: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function UnsavedChangesModal({
  isOpen,
  onSaveDraft,
  onDiscardChanges,
  onCancel,
  isLoading = false,
}: UnsavedChangesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-amber-600" />
            Unsaved Changes
          </DialogTitle>
          <DialogDescription>You have unsaved changes in your note. What would you like to do?</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button variant="destructive" onClick={onDiscardChanges} disabled={isLoading} className="w-full sm:w-auto">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Progress
          </Button>

          {onSaveDraft && (
            <Button onClick={onSaveDraft} disabled={isLoading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save to Draft
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
