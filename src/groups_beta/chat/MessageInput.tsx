import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
}

export const MessageInput = ({ onSendMessage, placeholder = "Type a message..." }: MessageInputProps) => {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 border-t">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="sm">
          <Paperclip className="w-4 h-4" />
        </Button>
        <Textarea
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[40px] max-h-[120px] resize-none"
        />
        <Button onClick={handleSend} disabled={!message.trim()} size="sm">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}