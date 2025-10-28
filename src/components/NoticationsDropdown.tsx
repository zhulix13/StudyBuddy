// components/NotificationsDropdown.tsx
"use client"

import type React from "react"
import { Bell, Loader2, Check, Settings } from "lucide-react"
import { Link } from "react-router-dom"
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkAsRead,
  useMarkAllAsRead 
} from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import type { Notification } from "@/types/notifications"
import { useNotificationNavigation } from "@/utils/nav-helper"

interface NotificationsDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  const { data: unreadCount = 0 } = useUnreadCount();
  const { 
    data, 
    isLoading 
  } = useNotifications({
    unreadOnly: false,
    enableRealtime: true,
    enableBrowserNotifications: true,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const { navigateToNotification } = useNotificationNavigation();

  // Get first 5 notifications from first page
  const notifications = data?.pages[0]?.notifications.slice(0, 5) ?? [];

  const getNotificationIcon = (category: string) => {
    const icons: Record<string, string> = {
      social: '💬',
      group: '👥',
      invite: '✉️',
      content: '📝',
      system: '🔔',
    };
    return icons[category] || '🔔';
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

     if (notification.action_url) {
      navigateToNotification(notification.action_url);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
            <Link 
              to="/dashboard/settings" 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onClick={() => handleNotificationClick(notification)}
            />
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="flex-1 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
            >
              {markAllAsRead.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Marking...
                </span>
              ) : (
                'Mark all as read'
              )}
            </button>
          )}
          <Link
            to="/dashboard/notifications"
            onClick={onClose}
            className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
};

// Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (e: React.MouseEvent, id: string) => void;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead,
  onClick 
}) => {
  const getNotificationIcon = (category: string) => {
    const icons: Record<string, string> = {
      social: '💬',
      group: '👥',
      invite: '✉️',
      content: '📝',
      system: '🔔',
    };
    return icons[category] || '🔔';
  };

  const content = (
    <div
      className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors ${
        !notification.read ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-xl flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
              {notification.title}
            </p>
            {notification.priority === 'high' && (
              <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded flex-shrink-0">
                !
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.read && (
            <button
              onClick={(e) => onMarkAsRead(e, notification.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Mark as read"
            >
              <Check className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
          )}
          <div className={`w-2 h-2 rounded-full ${!notification.read ? 'bg-blue-600' : 'bg-transparent'}`} />
        </div>
      </div>
    </div>
  );

  // Wrap in Link if there's an action URL
  if (notification.action_url) {
    return (
      <Link to={notification.action_url} className="block">
        {content}
      </Link>
    );
  }

  return content;
};