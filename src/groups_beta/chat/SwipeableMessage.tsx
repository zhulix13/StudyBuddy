import React, { useState, useRef, useEffect } from "react";
import { Reply } from "lucide-react";

interface SwipeableMessageProps {
  children: React.ReactNode;
  onReply: () => void;
  isOwn: boolean;
  disabled?: boolean;
}

export const SwipeableMessage = ({ 
  children, 
  onReply, 
  isOwn, 
  disabled = false 
}: SwipeableMessageProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isReplying, setIsReplying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const REPLY_THRESHOLD = 80;
  const MAX_SWIPE = 120;

  // Reset position
  const resetPosition = () => {
    setTranslateX(0);
    setIsReplying(false);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    isDragging.current = true;
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || disabled) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    // Only allow swipe in the correct direction
    const allowedDirection = isOwn ? deltaX < 0 : deltaX > 0; // Own messages: swipe left, Others: swipe right
    
    if (allowedDirection) {
      const clampedDelta = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, Math.abs(deltaX)));
      const finalDelta = isOwn ? -clampedDelta : clampedDelta;
      setTranslateX(finalDelta);
      setIsReplying(Math.abs(finalDelta) > REPLY_THRESHOLD);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!isDragging.current || disabled) return;
    isDragging.current = false;

    if (Math.abs(translateX) > REPLY_THRESHOLD) {
      onReply();
    }
    
    resetPosition();
  };

  // Handle mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    currentX.current = startX.current;
    isDragging.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || disabled) return;
    
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    
    const allowedDirection = isOwn ? deltaX < 0 : deltaX > 0;
    
    if (allowedDirection) {
      const clampedDelta = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, Math.abs(deltaX)));
      const finalDelta = isOwn ? -clampedDelta : clampedDelta;
      setTranslateX(finalDelta);
      setIsReplying(Math.abs(finalDelta) > REPLY_THRESHOLD);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current || disabled) return;
    isDragging.current = false;

    if (Math.abs(translateX) > REPLY_THRESHOLD) {
      onReply();
    }
    
    resetPosition();
  };

  // Add global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      currentX.current = e.clientX;
      const deltaX = currentX.current - startX.current;
      
      const allowedDirection = isOwn ? deltaX < 0 : deltaX > 0;
      
      if (allowedDirection) {
        const clampedDelta = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, Math.abs(deltaX)));
        const finalDelta = isOwn ? -clampedDelta : clampedDelta;
        setTranslateX(finalDelta);
        setIsReplying(Math.abs(finalDelta) > REPLY_THRESHOLD);
      }
    };

    const handleGlobalMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (Math.abs(translateX) > REPLY_THRESHOLD) {
        onReply();
      }
      
      resetPosition();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [translateX, onReply, isOwn]);

  return (
    <div className="relative">
      {/* Reply indicator */}
      {Math.abs(translateX) > 0 && (
        <div 
          className={`absolute top-1/2 -translate-y-1/2 z-0 transition-all duration-200 ${
            isOwn ? 'right-0 mr-2' : 'left-0 ml-2'
          }`}
          style={{
            opacity: Math.min(Math.abs(translateX) / REPLY_THRESHOLD, 1),
            transform: `scale(${Math.min(Math.abs(translateX) / REPLY_THRESHOLD, 1)})`
          }}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isReplying 
              ? 'bg-blue-500 text-white' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}>
            <Reply className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Message content */}
      <div
        ref={containerRef}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative z-10 cursor-pointer select-none"
      >
        {children}
      </div>
    </div>
  );
};