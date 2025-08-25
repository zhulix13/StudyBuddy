"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "../layout/Sidebar"
import { useGroupStore } from "@/store/groupStore"
import { Outlet } from "react-router-dom"
import { useNavigate } from "react-router-dom"

const GroupLayout = () => {
  const activeGroup = useGroupStore((s) => s.activeGroup)
  const setActiveGroup = useGroupStore((s) => s.setActiveGroup)

  const sidebarOpen = useGroupStore((s) => s.sidebarOpen)
  const setSidebarOpen = useGroupStore((s) => s.setSidebarOpen)

  const [isExpanded, setIsExpanded] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    if (activeGroup) {
      const currentGroupId = window.location.pathname.split("/groups/")[1]?.split("/")[0]

      // Only navigate if we're on a different group or not on a group page
      if (currentGroupId !== activeGroup.id) {
        navigate(`/groups/${activeGroup.id}${window.location.search}`)
      }
    }
  }, [activeGroup])

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      <Sidebar
        setActiveGroup={setActiveGroup}
        activeGroupId={activeGroup?.id ?? null}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      <main
        className={`flex-1 transition-all duration-300 ease-in-out flex flex-col bg-white dark:bg-gray-900 ${
          isExpanded ? "md:ml-[320px]" : "md:ml-[72px]"
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default GroupLayout
