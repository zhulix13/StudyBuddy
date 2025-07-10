"use client"

import { useState, useEffect } from "react"
import { Loader2, Users } from "lucide-react"
import { GroupCard } from "./group-card"
import { getUserGroups } from "@/services/supabase-groups"
import type { StudyGroup } from "@/types/groups"

interface MyGroupsListProps {
  refreshTrigger: number
}

export function MyGroupsList({ refreshTrigger }: MyGroupsListProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserGroups()
      setGroups(data)
    } catch (err) {
      console.error("Error fetching groups:", err)
      setError("Failed to load groups")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <button onClick={fetchGroups} className="text-sm text-muted-foreground hover:text-foreground">
          Try again
        </button>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No study groups yet</h3>
        <p className="text-muted-foreground mb-4">Create your first study group to start collaborating with others.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} onGroupUpdated={fetchGroups} 
        showJoinButton={!group.is_private}
        />
      ))}
    </div>
  )
}
