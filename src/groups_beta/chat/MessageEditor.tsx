import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Loader2 } from "lucide-react";

interface MessageEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MessageEditor = ({ 
  initialContent, 
  onSave, 
  onCancel, 
  isLoading = false 
}: MessageEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus and select all text when editing starts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleSave = () => {
    const trimmedContent = content.trim();
    if (trimmedContent && trimmedContent !== initialContent) {
      onSave(trimmedContent);
    } else if (!trimmedContent) {
      // Don't save empty messages
      onCancel();
    } else {
      // No changes made
      onCancel();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const hasChanges = content.trim() !== initialContent.trim();
  const canSave = content.trim().length > 0 && hasChanges;

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextareaChange}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
        className="min-h-[60px] max-h-[120px] resize-none text-sm leading-relaxed bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 focus-visible:border-blue-500 dark:focus-visible:border-blue-400"
        placeholder="Edit your message..."
      />
      
      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="h-8 px-3"
        >
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={!canSave || isLoading}
          size="sm"
          className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Check className="w-3 h-3 mr-1" />
          )}
          Save
        </Button>
      </div>
      
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Press Enter to save • Escape to cancel
      </div>
    </div>
  );
};