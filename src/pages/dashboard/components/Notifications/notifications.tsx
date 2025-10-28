// src/pages/dashboard/notifications.tsx
import { Bell, Check, X, Loader2, Filter, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead,
  useArchiveNotification 
} from "@/hooks/useNotifications";
import { useState } from "react";
import type { NotificationCategory, Notification } from "@/types/notifications"; 
import { formatDistanceToNow } from "date-fns";
import { useNotificationNavigation } from "@/utils/nav-helper"; 

export default function NotificationsPage() {
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useNotifications({
    unreadOnly: showUnreadOnly,
    category: filterCategory === 'all' ? undefined : filterCategory,
    enableRealtime: true,
    enableBrowserNotifications: true,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const archiveNotification = useArchiveNotification();
  const { navigateToNotification } = useNotificationNavigation(); // 🔥 ADD navigation helper

  const notifications = data?.pages.flatMap(page => page.notifications) ?? [];
  const unreadCount = notifications.filter(n => !n.read).length;

  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    
    // Navigate using helper
    if (notification.action_url) {
      navigateToNotification(notification.action_url);
    }
  };

  const getNotificationIcon = (category: NotificationCategory) => {
    const icons = {
      social: '💬',
      group: '👥',
      invite: '✉️',
      content: '📝',
      system: '🔔',
    };
    return icons[category] || '🔔';
  };

  const getNotificationColor = (priority: string) => {
    const colors = {
      high: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10',
      normal: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
      low: 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10',
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // 🔥 Prevent triggering the notification click
    markAsRead.mutate(notificationId);
  };

  const handleArchive = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // 🔥 Prevent triggering the notification click
    archiveNotification.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (window.confirm('Mark all notifications as read?')) {
      markAllAsRead.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Stay updated with your study activities
            {unreadCount > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                ({unreadCount} unread)
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="dark:border-gray-700"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCategory('all')}
        >
          All
        </Button>
        {(['social', 'group', 'invite', 'content', 'system'] as NotificationCategory[]).map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(cat)}
            className="capitalize"
          >
            {cat}
          </Button>
        ))}
        <div className="ml-auto">
          <Button
            variant={showUnreadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showUnreadOnly ? 'Unread only' : 'All'}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)} // 🔥 ADD click handler
                className={`p-4 sm:p-6 border-l-4 transition-colors cursor-pointer ${
                  notification.read 
                    ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' 
                    : getNotificationColor(notification.priority)
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="text-2xl flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {notification.title}
                        </h3>
                        {notification.priority === 'high' && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                            High
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                        {notification.action_url && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            Click to view →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2"
                        onClick={(e) => handleMarkAsRead(e, notification.id)} // 🔥 ADD event parameter
                        disabled={markAsRead.isPending}
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-2"
                      onClick={(e) => handleArchive(e, notification.id)} // 🔥 ADD event parameter
                      disabled={archiveNotification.isPending}
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasNextPage && (
              <div className="p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm mt-1">
              {showUnreadOnly 
                ? "You're all caught up!" 
                : "New notifications will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}