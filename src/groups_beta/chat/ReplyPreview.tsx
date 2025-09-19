import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Message } from "@/services/supabase-messages";
import { useAuth } from "@/context/Authcontext";

interface ReplyPreviewProps {
  message: Message;
  onCancel: () => void;
}

export const ReplyPreview = ({ message, onCancel }: ReplyPreviewProps) => {
  const { profile } = useAuth();
  const renderPreviewContent = () => {
    if (message.note) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400">📝</span>
          <span className="font-medium">{message.note.title}</span>
        </div>
      );
    }

    return (
      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
        {message.content || "No content"}
      </p>
    );
  };

  return (
    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-3 relative">
        {/* Reply indicator line */}
        <div className="w-1 bg-blue-500 rounded-full self-stretch min-h-[40px]" />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Replying to {
                message.sender_id === profile?.id
                  ? "You"
                  : message.sender?.username || "Unknown"
              }
            </span>
          </div>
          {renderPreviewContent()}
        </div>

        {/* Cancel button */}
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};