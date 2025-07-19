import  type { Message } from "../types"

interface MessageBubbleProps {
  message: Message
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${message.isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg px-4 py-2`}>
        {!message.isOwn && (
          <p className="text-xs font-medium text-blue-600 mb-1">{message.author}</p>
        )}
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  )
}