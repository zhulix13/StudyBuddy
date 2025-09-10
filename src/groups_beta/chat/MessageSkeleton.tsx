import React from "react";

interface MessageSkeletonProps {
  isOwn?: boolean;
}

export const MessageSkeleton = ({ isOwn = false }: MessageSkeletonProps) => {
  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar skeleton (only for others' messages) */}
      {!isOwn && (
        <div className="w-8 h-8 mt-1 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
      )}

      {/* Message Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name skeleton (only for others' messages) */}
        {!isOwn && (
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
        )}

        {/* Message Bubble Skeleton */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm animate-pulse ${
            isOwn
              ? "bg-blue-200 dark:bg-blue-800/50 rounded-br-md"
              : "bg-slate-200 dark:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 rounded-bl-md"
          }`}
        >
          {/* Content lines */}
          <div className="space-y-2">
            <div className={`h-4 rounded ${
              isOwn 
                ? "bg-blue-300 dark:bg-blue-700/70" 
                : "bg-slate-300 dark:bg-slate-600"
            } ${Math.random() > 0.5 ? "w-full" : "w-3/4"}`} />
            
            {Math.random() > 0.3 && (
              <div className={`h-4 rounded ${
                isOwn 
                  ? "bg-blue-300 dark:bg-blue-700/70" 
                  : "bg-slate-300 dark:bg-slate-600"
              } ${Math.random() > 0.5 ? "w-2/3" : "w-1/2"}`} />
            )}
          </div>

          {/* Timestamp skeleton */}
          <div className={`h-3 w-12 mt-2 rounded ${
            isOwn 
              ? "bg-blue-300 dark:bg-blue-700/70" 
              : "bg-slate-300 dark:bg-slate-600"
          }`} />
        </div>
      </div>
    </div>
  );
};