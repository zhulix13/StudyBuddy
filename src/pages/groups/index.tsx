

import { useState } from "react"
import { Users, BookOpen } from "lucide-react"
import { CreateGroupModal } from "@/components/groups/create-group-modal"
import { MyGroupsList } from "@/components/groups/my-groups-list"

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
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">My Groups</h3>
          </div>
          <p className="text-2xl font-bold mt-2">-</p>
          <p className="text-sm text-muted-foreground">Groups you've joined</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Active Chats</h3>
          </div>
          <p className="text-2xl font-bold mt-2">-</p>
          <p className="text-sm text-muted-foreground">Recent conversations</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Total Members</h3>
          </div>
          <p className="text-2xl font-bold mt-2">-</p>
          <p className="text-sm text-muted-foreground">Across all groups</p>
        </div>
      </div>

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
