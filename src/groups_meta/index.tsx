"use client"

import { useState } from "react"
import { Sidebar } from "./components/Sidebar"
import { GroupTabs } from "./components/GroupTabs"

export default function MetaPage() {
  const [activeGroup, setActiveGroup] = useState<null | {
    id: string
    name: string
    description: string
  }>(null)

  return (
    <div className="flex py-10">
      <Sidebar
        onSelectGroup={(group) => setActiveGroup(group)}
        activeGroupId={activeGroup?.id ?? null}
      />

      <main className="flex-1 ml-[260px] p-6">
        {activeGroup ? (
          <div>
            <h1 className="text-xl font-bold">{activeGroup.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{activeGroup.description}</p>
            {/* Later: add Tabs (Notes, Chat, etc) here */}
            <GroupTabs />
            {/* Later: add group-specific content here */}
          </div>
        ) : (
          <p className="text-muted-foreground">Select a group to get started.</p>
        )}
      </main>
    </div>
  )
}
