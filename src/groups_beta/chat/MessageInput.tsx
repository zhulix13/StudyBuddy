// src/components/chat/MessageInput.tsx (UPDATED)
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, Loader2 } from "lucide-react";
import type { Message } from "@/services/supabase-messages";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendReply?: (replyToId: string, content: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  // 🆕 Typing indicator callbacks
  onStartTyping?: () => void;
  onStopTyping?: () => void;
}

export const MessageInput = ({
  onSendMessage,
  onSendReply,
  disabled = false,
  isLoading = false,
  replyingTo,
  onCancelReply,
  onStartTyping,
  onStopTyping,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // 🆕 Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Start typing
    if (value.trim() && onStartTyping) {
      onStartTyping();
      
      // Reset stop timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) {
          onStopTyping();
        }
      }, 3000);
    } else if (!value.trim() && onStopTyping) {
      // Stop typing if input is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onStopTyping();
    }
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || isLoading) return;

    // Stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onStopTyping) {
      onStopTyping();
    }

    if (replyingTo && onSendReply) {
      onSendReply(replyingTo.id, trimmedMessage);
    } else {
      onSendMessage(trimmedMessage);
    }

    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (onStopTyping) {
        onStopTyping();
      }
    };
  }, [onStopTyping]);

  return (
    <div className="p-4 space-y-3">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-start gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border-l-4 border-blue-500">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
              Replying to {replyingTo.sender?.username || "User"}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {replyingTo.content || (replyingTo.note ? "📝 Note" : "Message")}
            </div>
          </div>
          <Button
            onClick={onCancelReply}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || isLoading}
            className="min-h-[44px] max-h-[200px] resize-none pr-12 py-3 rounded-2xl border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
            rows={1}
          />
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isLoading}
          size="icon"
          className="h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
};