// Modified GroupCard with Join functionality
"use client"

import { useState } from "react"
import { Users, Lock, Globe, MessageCircle, Calendar, MoreVertical, LogOut, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditGroupModal } from "./edit-group-modal"
import { leaveGroup, joinGroup } from "@/services/supabase-groups"
import type { StudyGroup } from "@/types/groups"

interface GroupCardProps {
  group: StudyGroup
  onGroupUpdated: () => void
  showJoinButton?: boolean // New prop to control join button visibility
}

export function GroupCard({ group, onGroupUpdated, showJoinButton = false }: GroupCardProps) {
  const [loading, setLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)

  const handleOpenChat = () => {
    // TODO: Implement group chat navigation
    // This is a placeholder for the chat opening logic
    // You might want to navigate to a chat page or open a modal
    console.log("Opening chat for group:", group.id)
    // For now, just show an alert
    alert(`Opening chat for "${group.name}" - Feature coming soon!`)
  }

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return

    setLoading(true)
    try {
      const result = await leaveGroup(group.id)
      if (result.success) {
        onGroupUpdated()
      } else {
        alert(`Failed to leave group: ${result.message}`)
      }
    } catch (error) {
      console.error("Error leaving group:", error)
      alert("An error occurred while leaving the group")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    setJoinLoading(true)
    try {
      const result = await joinGroup(group.id)
      if (result.success) {
        onGroupUpdated()
      } else {
        alert(`Failed to join group: ${result.message}`)
      }
    } catch (error) {
      console.error("Error joining group:", error)
      alert("An error occurred while joining the group")
    } finally {
      setJoinLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Determine if user is a member of this group
  const isMember = group.user_role !== undefined && group.user_role !== null

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{group.name}</h3>
              {group.is_private ? (
                <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            {group.subject && (
              <Badge variant="secondary" className="text-xs">
                {group.subject}
              </Badge>
            )}
          </div>

          {/* Only show dropdown menu if user is a member */}
          {isMember && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditGroupModal group={group} onGroupUpdated={onGroupUpdated} />
                <DropdownMenuItem
                  onClick={handleLeaveGroup}
                  disabled={loading}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {loading ? "Leaving..." : "Leave Group"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {group.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{group.description}</p>}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {group.member_count} member{group.member_count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(group.created_at)}</span>
            </div>
          </div>

          {group.user_role === "admin" && (
            <Badge variant="outline" className="text-xs">
              Admin
            </Badge>
          )}
        </div>

        {/* Show different buttons based on membership status */}
        {isMember ? (
          <Button onClick={handleOpenChat} className="w-full gap-2" variant="default">
            <MessageCircle className="h-4 w-4" />
            Open Group Chat
          </Button>
        ) : showJoinButton && !group.is_private ? (
          <Button 
            onClick={handleJoinGroup} 
            className="w-full gap-2" 
            variant="default"
            disabled={joinLoading}
          >
            <UserPlus className="h-4 w-4" />
            {joinLoading ? "Joining..." : "Join Group"}
          </Button>
        ) : (
          <Button className="w-full gap-2" variant="outline" disabled>
            <Lock className="h-4 w-4" />
            {group.is_private ? "Private Group" : "View Only"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}