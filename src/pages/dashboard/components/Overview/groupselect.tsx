import { useEffect, useRef, useState } from "react";
import { X, Users, Loader2, AlertCircle } from "lucide-react";
import { useUserMemberGroups } from "@/hooks/useGroups";
import type { StudyGroup } from "@/types/groups";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface GroupSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroup: (group: StudyGroup) => void;
  anchorRef: React.RefObject<HTMLElement>;
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export const GroupSelectModal = ({
  isOpen,
  onClose,
  onSelectGroup,
  anchorRef,
}: GroupSelectModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { data: groups = [], isLoading, error } = useUserMemberGroups();
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  
  const [position, setPosition] = useState({ top: 0, left: 0, arrowPosition: 'left' as 'left' | 'top' });

  // Calculate position based on screen size
  useEffect(() => {
    if (!anchorRef.current || !isOpen) return;

    const buttonRect = anchorRef.current.getBoundingClientRect();
    const modalWidth = 320; // w-80
    const modalHeight = 400; // max-h-[400px]
    const spacing = 12;
    const arrowSize = 8;

    const isMobile = windowWidth < 640; // sm breakpoint

    if (isMobile) {
      // On mobile, position above the button
      const top = buttonRect.top - modalHeight - spacing - arrowSize;
      const left = Math.max(
        spacing,
        Math.min(
          buttonRect.left + buttonRect.width / 2 - modalWidth / 2,
          windowWidth - modalWidth - spacing
        )
      );

      setPosition({
        top: Math.max(spacing, top),
        left,
        arrowPosition: 'top',
      });
    } else {
      // On desktop, position to the left of the button
      const top = Math.max(
        spacing,
        Math.min(
          buttonRect.top + buttonRect.height / 2 - modalHeight / 2,
          windowHeight - modalHeight - spacing
        )
      );
      const left = buttonRect.left - modalWidth - spacing - arrowSize;

      setPosition({
        top,
        left: Math.max(spacing, left),
        arrowPosition: 'left',
      });
    }
  }, [anchorRef, isOpen, windowWidth, windowHeight]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const LoadingState = () => (
    <div className="space-y-2 p-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-3 rounded-lg">
          <Skeleton height={16} width="70%" className="mb-2 dark:bg-gray-700" />
          <Skeleton height={12} width="40%" className="dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
        <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">
        No study groups yet
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Create or join a group to start taking notes
      </p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
        <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      <p className="text-sm text-red-600 dark:text-red-400 mb-1 font-medium">
        Failed to load groups
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Please try again later
      </p>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Arrow pointing to button */}
        {position.arrowPosition === 'left' ? (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45 border-r border-t border-gray-200 dark:border-gray-700" />
        ) : (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45 border-l border-b border-gray-200 dark:border-gray-700" />
        )}

        {/* Modal Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 sm:w-96 max-h-[400px] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Create New Note
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Select a group
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Groups List */}
          <div className="overflow-y-auto max-h-[320px] custom-scrollbar">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState />
            ) : groups.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="p-2">
                {groups.map((group: StudyGroup) => (
                  <button
                    key={group.id}
                    onClick={() => onSelectGroup(group)}
                    className="w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {group.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {group.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {group.description || "No description"}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-green-500 dark:group-hover:border-green-400 transition-colors flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-transparent group-hover:bg-green-500 dark:group-hover:bg-green-400 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </>
  );
};