"use client"

import { useState } from "react"
import { Sidebar } from "./components/Sidebar"

export default function MetaPage() {
  const [activeGroup, setActiveGroup] = useState<null | {
    id: string
    name: string
    description: string
  }>(null)

  return (
    <div className="flex py-20">
      <Sidebar
        onSelectGroup={(group) => setActiveGroup(group)}
        activeGroupId={activeGroup?.id ?? null}
      />

      <main className="flex-1 p-6">
        {activeGroup ? (
          <div>
            <h1 className="text-xl font-bold">{activeGroup.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{activeGroup.description}</p>
            {/* Later: add Tabs (Notes, Chat, etc) here */}
          </div>
        ) : (
          <p className="text-muted-foreground">Select a group to get started.</p>
        )}
      </main>
    </div>
  )
}
