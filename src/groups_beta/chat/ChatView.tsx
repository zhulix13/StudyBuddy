import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreVertical } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import type { Message } from "../types"

// Mock data - move this to a separate file or fetch from API
const dummyMessages: Message[] = [
  { id: "1", content: "Hey everyone! Did you solve the quadratic equation homework?", author: "Alex", timestamp: "10:30 AM", isOwn: false },
  { id: "2", content: "Yes! I used the quadratic formula. The discriminant was positive so we got two real solutions.", author: "You", timestamp: "10:32 AM", isOwn: true },
  { id: "3", content: "Can someone share the notes from yesterday's class?", author: "Sarah", timestamp: "10:35 AM", isOwn: false },
  { id: "4", content: "I'll upload them to the notes section", author: "Mike", timestamp: "10:37 AM", isOwn: false },
]

interface ChatViewProps {
  groupId: string
}

export const ChatView = ({ groupId }: ChatViewProps) => {
  const handleSendMessage = (message: string) => {
    // Here you would typically send to your backend
    console.log("Sending message:", message)
    console.log("Group ID:", groupId)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Group Chat</h2>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {dummyMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}