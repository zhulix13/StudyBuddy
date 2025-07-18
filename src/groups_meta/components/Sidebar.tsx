'use client'

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GroupCard } from "./GroupCard"
import { Menu } from "lucide-react"

interface Group {
  id: string
  name: string
  description: string
}

const dummyGroups: Group[] = [
  { id: "1", name: "Algebra Squad", description: "Formulas & Practice" },
  { id: "2", name: "Dev Circle", description: "Frontend Engineers" },
  { id: "3", name: "AI Think Tank", description: "Prompts & Projects" },
   { id: "4", name: "History Buffs", description: "Ancient to Modern" },
   { id: "5", name: "Literature Lovers", description: "Books & Discussions" },
   { id: "6", name: "Science Explorers", description: "Physics & Chemistry" },
   { id: "7", name: "Language Learners", description: "English & More" },
   { id: "8", name: "Art Enthusiasts", description: "Painting & Drawing" },
   { id: "9", name: "Music Makers", description: "Instruments & Theory" },
   { id: "10", name: "Fitness Friends", description: "Health & Workouts" },
   { id: "11", name: "Cooking Club", description: "Recipes & Techniques" },
   { id: "12", name: "Travel Enthusiasts", description: "Destinations & Tips" },
   { id: "13", name: "Photography Club", description: "Capturing Moments" },
   

]




export const Sidebar = ({
  onSelectGroup,
  activeGroupId
}: {
  onSelectGroup: (group: Group) => void
  activeGroupId: string | null
}) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden p-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <ScrollArea className="h-full p-4">
              {dummyGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isActive={group.id === activeGroupId}
                  onClick={() => {
                    onSelectGroup(group)
                    setOpen(false)
                  }}
                />
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <aside className=" fixed  bottom-0 left-0 md:block w-[260px] border-r ">
        <h2 className="text-lg font-semibold  mb-4">Your Groups</h2>
        <ScrollArea className="h-[calc(100vh-100px)] pr-2">
          {dummyGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isActive={group.id === activeGroupId}
              onClick={() => onSelectGroup(group)}
            />
          ))}
        </ScrollArea>
      </aside>
    </>
  )
}
