import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Group {
  id: string
  name: string
  description: string
}




type TabType = "notes" | "chat" | "settings"

interface GroupStore {
  activeGroup: Group | null
  setActiveGroup: (group: Group | null) => void

  activeTab: TabType
  setActiveTab: (tab: TabType) => void
   sidebarOpen: boolean
   setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

export const useGroupStore = create<GroupStore>()(
  persist(
    (set) => ({
      activeGroup: null,
      setActiveGroup: (group) => set({ activeGroup: group }),

      activeTab: "notes",
      setActiveTab: (tab) => set({ activeTab: tab }),

      sidebarOpen: true,
      setSidebarOpen: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
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
