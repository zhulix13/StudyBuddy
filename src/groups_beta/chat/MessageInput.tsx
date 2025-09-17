import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic,
  Loader2 
} from "lucide-react";
import type { Message } from "@/services/supabase-messages";
import { ReplyPreview } from "./ReplyPreview";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendReply?: (replyToId: string, message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

export const MessageInput = ({ 
  onSendMessage, 
  onSendReply,
  disabled = false,
  isLoading = false,
  placeholder = "Type a message...",
  replyingTo = null,
  onCancelReply
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      if (replyingTo && onSendReply) {
        onSendReply(replyingTo.id, trimmedMessage);
        onCancelReply?.();
      } else {
        onSendMessage(trimmedMessage);
      }
      
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const canSend = message.trim().length > 0 && !disabled && !isLoading;
  const currentPlaceholder = replyingTo ? `Reply to ${replyingTo.sender?.username || "Unknown"}...` : placeholder;

  return (
    <div>
      {/* Reply Preview */}
      {replyingTo && onCancelReply && (
        <ReplyPreview 
          message={replyingTo} 
          onCancel={onCancelReply} 
        />
      )}

      {/* Message Input */}
      <div className="p-4">
        <div className="flex items-end gap-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
          
          {/* Left actions */}
          <div className="flex items-center gap-1 pl-4 pb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              disabled={disabled}
              title="Attach file (coming soon)"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>

          {/* Text input */}
          <Textarea
            ref={textareaRef}
            placeholder={currentPlaceholder}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="min-h-[40px] max-h-[120px] resize-none hide-scrollbar border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-3 px-0 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
            style={{ height: "40px" }}
          />

          {/* Right actions */}
          <div className="flex items-center gap-1 pr-4 pb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              disabled={disabled}
              title="Emojis (coming soon)"
            >
              <Smile className="w-4 h-4" />
            </Button>

            {message.trim() ? (
              <Button 
                onClick={handleSend}
                disabled={!canSend}
                size="sm"
                className="w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                disabled={disabled}
                title="Voice message (coming soon)"
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Character counter (optional) */}
        {message.length > 1000 && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">
            {message.length}/2000
          </div>
        )}
      </div>
    </div>
  );
};

