// components/NotificationToast.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useHighPriorityNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types/notifications";
import { Link } from "react-router-dom";

export const NotificationToast = () => {
  const { data: highPriorityNotifications = [] } = useHighPriorityNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Add new high-priority notifications to visible list
    highPriorityNotifications.forEach((notif) => {
      if (!visibleNotifications.find(v => v.id === notif.id)) {
        setVisibleNotifications(prev => [...prev, notif]);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setVisibleNotifications(prev => prev.filter(v => v.id !== notif.id));
        }, 5000);
      }
    });
  }, [highPriorityNotifications]);

  const handleDismiss = (notificationId: string) => {
    setVisibleNotifications(prev => prev.filter(v => v.id !== notificationId));
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-l-4 border-red-500 p-4 animate-slide-in-right"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
              {notification.action_url && (
                <Link
                  to={notification.action_url}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                  onClick={() => handleDismiss(notification.id)}
                >
                  View →
                </Link>
              )}
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};