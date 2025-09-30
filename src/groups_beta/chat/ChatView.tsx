import React, { useRef, useEffect, useState } from "react";
import { useMessages, useCreateMessage, useReplyToMessage } from "@/hooks/useMessages";
import { useMessageStatusesRealtime } from "@/services/realtime/messageStatus-realtime";
import { useAuth } from "@/context/Authcontext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ChevronUp, Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { MessageSkeleton } from "./MessageSkeleton";
import type { Message } from "@/services/supabase-messages";
import { useMessagesRealtime } from "@/services/realtime/messages-realtime";

interface ChatViewProps {
  groupId: string;
  onNoteClick?: (noteId: string) => void;
}

export const ChatView = ({ groupId, onNoteClick }: ChatViewProps) => {
  const { profile } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const previousScrollHeightRef = useRef(0);

  // 🔹 UPDATED: Use infinite query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(groupId);

  // Flatten all pages into single messages array
  const messages = data?.pages.flatMap((page) => page.messages) ?? [];

  // Create message and reply mutations
  const createMessageMutation = useCreateMessage(groupId);
  const replyToMessageMutation = useReplyToMessage(groupId);

  // Real-time subscriptions
  useMessageStatusesRealtime(groupId);
  useMessagesRealtime(groupId);

  // Get scroll container
  const getScrollContainer = () => {
    return scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
  };

  // Auto-scroll to bottom
  const scrollToBottom = (smooth = true) => {
    const scrollContainer = getScrollContainer();
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && shouldAutoScroll) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length, shouldAutoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = (event: React.UIEvent) => {
    const target = event.target as HTMLElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  // 🔹 Load older messages when scrolling to top
  const handleLoadMore = async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return;

    // Save current scroll position
    const previousScrollHeight = scrollContainer.scrollHeight;
    previousScrollHeightRef.current = previousScrollHeight;

    await fetchNextPage();

    // Restore scroll position after new messages load
    setTimeout(() => {
      const newScrollHeight = scrollContainer.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight;
      scrollContainer.scrollTop = scrollDiff;
    }, 100);
  };

  const handleSendMessage = async (content: string) => {
    try {
      await createMessageMutation.mutateAsync({ content });
      setShouldAutoScroll(true);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSendReply = async (replyToId: string, content: string) => {
    try {
      await replyToMessageMutation.mutateAsync({
        messageId: replyToId,
        replyContent: content,
      });
      setShouldAutoScroll(true);
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }, 100);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <MessageSkeleton key={i} isOwn={i % 2 === 0} />
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/60">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Failed to load messages
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Something went wrong
        </p>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          size="sm"
        >
          {isRefetching ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Messages Area */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 px-4 py-6 overflow-hidden"
        onScroll={handleScroll}
      >
        {/* 🔹 Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center mb-4">
            <Button
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
              variant="outline"
              size="sm"
              className="shadow-sm"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading older messages...
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Load older messages
                </>
              )}
            </Button>
          </div>
        )}

        <div className="space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Start the conversation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Be the first to send a message in this group
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === profile?.id}
                groupId={groupId}
                onReply={handleReply}
                onNoteClick={onNoteClick}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {!shouldAutoScroll && (
        <Button
          onClick={() => {
            setShouldAutoScroll(true);
            scrollToBottom();
          }}
          className="absolute bottom-24 right-6 rounded-full w-12 h-12 shadow-lg z-10 bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          ↓
        </Button>
      )}

      {/* Message Input - Fixed at bottom */}
      <div className="border-t border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendReply={handleSendReply}
          disabled={createMessageMutation.isPending || replyToMessageMutation.isPending}
          isLoading={createMessageMutation.isPending || replyToMessageMutation.isPending}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
        />
      </div>
    </div>
  );
};