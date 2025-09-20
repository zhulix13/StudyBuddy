import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit3,
  Trash2,
  Check,
  CheckCheck,
  Reply,
  ExternalLink,
  FileText,
} from "lucide-react";
import {
  useUpdateMessage,
  useDeleteMessage,
  useMessage,
} from "@/hooks/useMessages";
import type { Message } from "@/services/supabase-messages";
import { MessageEditor } from "./MessageEditor";
import { SwipeableMessage } from "./SwipeableMessage";
import { useAuth } from "@/context/Authcontext";
import { useProfile } from "@/hooks/useProfiles";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  groupId: string;
  onReply?: (message: Message) => void;
  onNoteClick?: (noteId: string) => void; // New prop for note navigation
}

export const MessageBubble = ({
  message,
  isOwn,
  groupId,
  onReply,
  onNoteClick,
}: MessageBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const updateMessageMutation = useUpdateMessage(groupId);
  const deleteMessageMutation = useDeleteMessage(groupId);
  const { profile } = useAuth();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
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
        toast.success("Message deleted");
      } catch (error) {
        console.error("Failed to delete message:", error);
        toast.error("Failed to delete message");
      }
    }
  };

  const handleReply = () => {
    onReply?.(message);
  };

  // Handle note click navigation
  const handleNoteClick = () => {
    if (message.note?.id) {
      onNoteClick?.(message.note.id);
    }
  };

  // Extract text preview from note content
  const getNotePreview = (content: any, maxLength: number = 120) => {
    try {
      if (!content) return "No content available";

      // Simple text extraction from TipTap JSON structure
      const extractText = (node: any): string => {
        if (node.type === "text") {
          return node.text || "";
        }
        if (node.content) {
          return node.content.map(extractText).join("");
        }
        return "";
      };

      const fullText = extractText(content);
      return fullText.length > maxLength
        ? fullText.substring(0, maxLength) + "..."
        : fullText;
    } catch {
      return "Unable to preview content";
    }
  };

  // Render status indicators
  const renderStatusIndicators = () => {
    if (!isOwn) return null;

    const statuses = message.statuses || [];
    const recipientStatuses = statuses.filter((s) => s.user_id !== profile?.id);

    if (recipientStatuses.length === 0) {
      return (
        <div className="flex items-center ml-2">
          <Check className="w-3 h-3 text-blue-200/60" />
        </div>
      );
    }

    const allSeen = recipientStatuses.every((s) => s.status === "seen");
    if (allSeen) {
      return (
        <div className="flex items-center ml-2">
          <CheckCheck className="w-3 h-3 text-blue-400" />
        </div>
      );
    }

    const allDelivered = recipientStatuses.every(
      (s) => s.status === "delivered" || s.status === "seen"
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
      if (!originalMessage)
        return <em className="text-slate-400">Loading...</em>;

      if (originalMessage.note) {
        return (
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
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
      const truncated =
        content.length > maxLength
          ? content.substring(0, maxLength) + "..."
          : content;

      return <span className="line-clamp-2">{truncated}</span>;
    };

    const getOriginalSenderName = () => {
      if (!originalMessage?.sender) return "User";
      return originalMessage.sender_id === profile?.id
        ? "You"
        : message.sender?.username || "Unknown";
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
    // Enhanced note rendering with caption support
    if (message.note) {
      const { data: noteAuthor } = useProfile(message.note.user_id);

      return (
        <div className="flex flex-col gap-2">
          {/* 🔹 Caption (if exists) */}
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* 🔹 Note card */}
          <div
            className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border-l-4 border-blue-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group/note"
            onClick={handleNoteClick}
          >
            {/* Note Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Shared Note
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {noteAuthor?.full_name
                    ? noteAuthor.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : noteAuthor?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                by {noteAuthor?.username || "Unknown"}
              </span>
            </div>

            {/* Note Content */}
            <div className="space-y-2">
              {message.note.title && (
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 text-sm">
                  {message.note.title}
                </h4>
              )}

              {message.note.content && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {getNotePreview(message.note.content)}
                </p>
              )}

              {/* Tags */}
              {message.note.tags && message.note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.note.tags.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5"
                    >
                      #{tag}
                    </Badge>
                  ))}
                  {message.note.tags.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      +{message.note.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* View Note CTA */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="group-hover/note:text-blue-600 dark:group-hover/note:text-blue-400 transition-colors">
                  Click to view full note
                </span>
                <span>📝</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Regular text message fallback...
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
    <div
      className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar (only for others' messages) */}
      {!isOwn && (
        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender?.username || "Avatar"}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <AvatarFallback className="bg-slate-500 text-white text-xs">
              {message.sender?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>
      )}

      {/* Message Container */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* Sender name (only for others' messages) */}
        {!isOwn && (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 px-1">
            {message.sender?.username || "Unknown"}
          </span>
        )}

        {/* Message Bubble */}
        <div className="relative group/message">
          <div
            className={`rounded-2xl shadow-sm transition-all duration-200 ${
              message.note
                ? "p-0 bg-transparent" // No padding/background for note messages
                : `px-4 py-2.5 ${
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-md shadow-blue-500/20"
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 rounded-bl-md shadow-slate-500/10"
                  }`
            }`}
          >
            {renderRepliedMessage()}
            {renderMessageContent()}

            {/* Timestamp and status for regular messages */}
            {!message.note && (
              <div
                className={`flex items-center justify-end mt-2 gap-1 ${
                  isOwn
                    ? "text-blue-100/80"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span className="text-xs">
                  {formatTimestamp(message.created_at)}
                </span>
                {message.updated_at &&
                  message.updated_at !== message.created_at && (
                    <span className="text-xs opacity-70">(edited)</span>
                  )}
                {renderStatusIndicators()}
              </div>
            )}
          </div>

          {/* Timestamp for note messages (outside the note card) */}
          {message.note && (
            <div
              className={`flex items-center mt-2 gap-1 text-xs ${
                isOwn
                  ? "justify-end text-slate-500 dark:text-slate-400"
                  : "justify-start text-slate-500 dark:text-slate-400"
              }`}
            >
              <span>{formatTimestamp(message.created_at)}</span>
              {message.updated_at &&
                message.updated_at !== message.created_at && (
                  <span className="opacity-70">(edited)</span>
                )}
              {renderStatusIndicators()}
            </div>
          )}

          {/* Desktop Actions Menu */}
          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute -top-2 ${
                    isOwn ? "-right-2" : "-left-2"
                  } w-8 h-8 p-0 opacity-0 group-hover/message:opacity-100 transition-opacity shadow-sm ${
                    isOwn
                      ? "bg-blue-600 hover:bg-blue-700 text-blue-100 border-blue-500"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isOwn ? "end" : "start"}
                className="w-40"
              >
                <DropdownMenuItem onClick={handleReply}>
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                {message.note && (
                  <DropdownMenuItem onClick={handleNoteClick}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Note
                  </DropdownMenuItem>
                )}
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
    <SwipeableMessage onReply={handleReply} isOwn={isOwn} disabled={isEditing}>
      {messageContent}
    </SwipeableMessage>
  );
};
