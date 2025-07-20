import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { StudyGroup } from "@/types/groups"






type TabType = "notes" | "chat" | "settings"

interface GroupStore {
  activeGroup: StudyGroup | null
  setActiveGroup: (group: StudyGroup | null) => void

  activeTab: TabType
  setActiveTab: (tab: TabType) => void
   sidebarOpen: boolean
   setSidebarOpen: (open: boolean ) => void
}

export const useGroupStore = create<GroupStore>()(
   persist(
      (set) => ({
         activeGroup: null,
         setActiveGroup: (group) => set({ activeGroup: group }),

         activeTab: "notes",
         setActiveTab: (tab) => set({ activeTab: tab }),

         sidebarOpen: false,
         setSidebarOpen: (open) => set({ sidebarOpen: open }),
      }),
      {
         name: "group-ui-store",
         partialize: (state) => ({
            activeGroup: state.activeGroup,
            activeTab: state.activeTab,
         }),
      }
   )
)
