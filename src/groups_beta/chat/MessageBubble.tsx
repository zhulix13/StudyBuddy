import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Check, CheckCheck, Reply } from "lucide-react";
import { useUpdateMessage, useDeleteMessage, useMessage } from "@/hooks/useMessages";
import type { Message } from "@/services/supabase-messages";
import { MessageEditor } from "./MessageEditor";
import { SwipeableMessage } from "./SwipeableMessage";
import { useAuth } from "@/context/Authcontext";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  groupId: string;
  onReply?: (message: Message) => void;
}

export const MessageBubble = ({ message, isOwn, groupId, onReply }: MessageBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const updateMessageMutation = useUpdateMessage(groupId);
  const deleteMessageMutation = useDeleteMessage(groupId);
  const { profile } = useAuth();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const handleEdit = async (newContent: string) => {
    try {
      await updateMessageMutation.mutateAsync({
        messageId: message.id,
        content: newContent,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessageMutation.mutateAsync(message.id);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
  };

  const handleReply = () => {
    onReply?.(message);
  };

  // Render status indicators
  const renderStatusIndicators = () => {
    if (!isOwn) return null;

    const statuses = message.statuses || [];
    const recipientStatuses = statuses.filter(s => s.user_id !== profile?.id);
    
    if (recipientStatuses.length === 0) {
      return (
        <div className="flex items-center ml-2">
          <Check className="w-3 h-3 text-blue-200/60" />
        </div>
      );
    }

    const allSeen = recipientStatuses.every(s => s.status === "seen");
    if (allSeen) {
      return (
        <div className="flex items-center ml-2">
          <CheckCheck className="w-3 h-3 text-blue-400" />
        </div>
      );
    }

    const allDelivered = recipientStatuses.every(s => 
      s.status === "delivered" || s.status === "seen"
    );
    if (allDelivered) {
      return (
        <div className="flex items-center ml-2">
          <CheckCheck className="w-3 h-3 text-blue-200/80" />
        </div>
      );
    }

    return (
      <div className="flex items-center ml-2">
        <Check className="w-3 h-3 text-blue-200/60" />
      </div>
    );
  };

  // Render replied message preview
 const renderRepliedMessage = () => {
    if (!message.reply_to) return null;

    // Fetch the original message
    const { data: originalMessage } = useMessage(message.reply_to);

    const getOriginalMessageContent = () => {
      if (!originalMessage) return <em className="text-slate-400">Loading...</em>;
      
      if (originalMessage.note) {
        return (
          <div className="flex items-center gap-1">
            <span>📝</span>
            <span className="truncate">{originalMessage.note.title}</span>
          </div>
        );
      }
      
      if (!originalMessage.content) {
        return <em className="text-slate-400">No content</em>;
      }
      
      // Truncate long messages
      const content = originalMessage.content;
      const maxLength = 100;
      const truncated = content.length > maxLength 
        ? content.substring(0, maxLength) + "..." 
        : content;
      
      return <span className="line-clamp-2">{truncated}</span>;
    };

    const getOriginalSenderName = () => {
      if (!originalMessage?.sender) return "User";
      return originalMessage.sender.username || "Unknown";
    };

    return (
      <div className="mb-2 pl-3 border-l-2 border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 rounded-r-lg py-2 px-3">
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
          Replying to {getOriginalSenderName()}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {getOriginalMessageContent()}
        </div>
      </div>
    );
  };

  const renderMessageContent = () => {
    if (message.note) {
      return (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              📝 Shared Note
            </span>
          </div>
          <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">
            {message.note.title}
          </h4>
          {message.note.content && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {message.note.content.substring(0, 100)}
              {message.note.content.length > 100 && "..."}
            </p>
          )}
        </div>
      );
    }

    if (isEditing) {
      return (
        <MessageEditor
          initialContent={message.content || ""}
          onSave={handleEdit}
          onCancel={() => setIsEditing(false)}
          isLoading={updateMessageMutation.isPending}
        />
      );
    }

    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {message.content}
      </p>
    );
  };

  const messageContent = (
    <div className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar (only for others' messages) */}
      {!isOwn && (
        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender?.username || "Avatar"}
              className="w-full h-full object-cover rounded-full"
            />
          ) : null}
        </Avatar>
      )}

      {/* Message Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name (only for others' messages) */}
        {!isOwn && (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 px-1">
            {message.sender?.username || "Unknown"}
          </span>
        )}

        {/* Message Bubble */}
        <div className="relative group/message">
          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 ${
              isOwn
                ? "bg-blue-600 text-white rounded-br-md shadow-blue-500/20"
                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 rounded-bl-md shadow-slate-500/10"
            }`}
          >
            {renderRepliedMessage()}
            {renderMessageContent()}

            {/* Timestamp and status */}
            <div className={`flex items-center justify-end mt-2 gap-1 ${
              isOwn ? "text-blue-100/80" : "text-slate-500 dark:text-slate-400"
            }`}>
              <span className="text-xs">
                {formatTimestamp(message.created_at)}
              </span>
              {message.updated_at && message.updated_at !== message.created_at ? (
                <span className="text-xs opacity-70">(edited)</span>
              ) : null}
              {renderStatusIndicators()}
            </div>
          </div>

          {/* Desktop Actions Menu */}
          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute -top-2 ${isOwn ? '-right-2' : '-left-2'} w-8 h-8 p-0 opacity-0 group-hover/message:opacity-100 transition-opacity shadow-sm ${
                    isOwn 
                      ? 'bg-blue-600 hover:bg-blue-700 text-blue-100 border-blue-500' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-32">
                <DropdownMenuItem onClick={handleReply}>
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                {isOwn && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      disabled={!!message.note_id}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600 dark:text-red-400"
                      disabled={deleteMessageMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );

  // Wrap with swipeable component for mobile
  return (
    <SwipeableMessage 
      onReply={handleReply} 
      isOwn={isOwn}
      disabled={isEditing}
    >
      {messageContent}
    </SwipeableMessage>
  );
};