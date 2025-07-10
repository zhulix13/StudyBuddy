// Modified EditGroupModal with Delete functionality
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { updateGroup, deleteOwnGroup } from "@/services/supabase-groups"
import type { StudyGroup, UpdateGroupData } from "@/types/groups"

interface EditGroupModalProps {
  group: StudyGroup
  onGroupUpdated: () => void
}

export function EditGroupModal({ group, onGroupUpdated }: EditGroupModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateGroupData>({
    name: group.name,
    subject: group.subject || "",
    description: group.description || "",
    is_private: group.is_private,
  })

  useEffect(() => {
    setFormData({
      name: group.name,
      subject: group.subject || "",
      description: group.description || "",
      is_private: group.is_private,
    })
  }, [group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) return

    setLoading(true)
    try {
      await updateGroup(group.id, {
        ...formData,
        subject: formData.subject || undefined,
        description: formData.description || undefined,
      })

      setOpen(false)
      onGroupUpdated()
    } catch (error) {
      console.error("Error updating group:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle group deletion
  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const result = await deleteOwnGroup(group.id)
      if (result.success) {
        setOpen(false)
        onGroupUpdated()
      } else {
        alert(`Failed to delete group: ${result.message}`)
      }
    } catch (error) {
      console.error("Error deleting group:", error)
      alert("An error occurred while deleting the group")
    } finally {
      setDeleteLoading(false)
    }
  }

  // Only show edit button if user is admin
  if (group.user_role !== "admin") {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Study Group</DialogTitle>
          <DialogDescription>Update your study group details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Group Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subject">Subject</Label>
            <Input
              id="edit-subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Mathematics, Physics, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this group is about..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-private"
              checked={formData.is_private}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_private: !!checked }))}
            />
            <Label htmlFor="edit-private" className="text-sm">
              Make this group private
            </Label>
          </div>

          <div className="flex justify-between gap-2 pt-4">
            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the group "{group.name}" 
                    and remove all members from the group.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteLoading ? "Deleting..." : "Delete Group"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Update/Cancel Buttons */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.name?.trim()}>
                {loading ? "Updating..." : "Update Group"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}