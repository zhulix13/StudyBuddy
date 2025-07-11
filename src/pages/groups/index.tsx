

import { useState } from "react"
import {  BookOpen } from "lucide-react"
import { CreateGroupModal } from "@/components/groups/create-group-modal"
import { MyGroupsList } from "@/components/groups/my-groups-list"
import GroupStatsCard from "@/components/groups/groups-stats-card"

export default function Groups() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleGroupCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Study Groups</h1>
            <p className="text-muted-foreground">Collaborate and learn together with your study groups</p>
          </div>
        </div>

        <CreateGroupModal onGroupCreated={handleGroupCreated} />
      </div>

      {/* Stats Cards */}
      <GroupStatsCard />

      {/* Groups List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Groups</h2>
        </div>

        <MyGroupsList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}
