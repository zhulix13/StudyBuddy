import React, { useState } from 'react';
import { X, Send, FileText, ThumbsUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Note: TipTapContent import removed as we're doing simple text extraction
import type { Note } from "@/types/notes";
import { motion, AnimatePresence } from 'framer-motion';

interface ShareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  onShare: (caption?: string) => Promise<void>;
  isLoading?: boolean;
}

const ShareNoteModal: React.FC<ShareNoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onShare,
  isLoading = false
}) => {
  const [caption, setCaption] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleShare = async () => {
    try {
      await onShare(caption.trim() || undefined);
      
      // Show success animation
      setShowSuccess(true);
      
      // Close modal after animation
      setTimeout(() => {
        setShowSuccess(false);
        setCaption('');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to share note:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleShare();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Extract text content from TipTap JSON for preview
  const getTextPreview = (content: any, maxLength: number = 150) => {
    try {
      if (!content) return 'No content available';
      
      // Simple text extraction from TipTap JSON structure
      const extractText = (node: any): string => {
        if (node.type === 'text') {
          return node.text || '';
        }
        if (node.content) {
          return node.content.map(extractText).join('');
        }
        return '';
      };

      const fullText = extractText(content);
      return fullText.length > maxLength 
        ? fullText.substring(0, maxLength) + '...'
        : fullText;
    } catch {
      return 'Unable to preview content';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Success Animation Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-green-50 dark:bg-green-900/20 flex items-center justify-center z-10 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <ThumbsUp className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      Note shared successfully!
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Share Note to Chat
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Note Preview */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-4">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={note.author?.avatar_url} alt={note.author?.name} />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {note.author?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Shared Note
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        by {note.author?.name}
                      </p>
                    </div>
                  </div>

                  {/* Note Content Preview */}
                  <div className="space-y-2">
                    {note.title && (
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {note.title}
                      </h3>
                    )}
                    
                    {note.content && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {getTextPreview(note.content)}
                      </p>
                    )}

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index}
                            variant="secondary" 
                            className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{note.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* View Note CTA */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Click to view full note</span>
                      <span>📝</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Caption Input */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Add a message (optional)
                </label>
                <Textarea
                  placeholder="What do you think about this note? Add context for your group..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="resize-none h-24 focus:border-blue-500 dark:focus:border-blue-400"
                  maxLength={500}
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Press Cmd/Ctrl + Enter to share
                  </p>
                  <span className="text-xs text-slate-400">
                    {caption.length}/500
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Share to Chat
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareNoteModal;