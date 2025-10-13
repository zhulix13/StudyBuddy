// src/pages/dashboard/notifications.tsx
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "invite",
      title: "Group Invitation",
      message: "You've been invited to join Mathematics Study Group",
      time: "2h ago",
      unread: true,
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message: "Sarah posted in Physics Notes",
      time: "4h ago",
      unread: true,
    },
    {
      id: 3,
      type: "achievement",
      title: "Achievement Unlocked!",
      message: "You've completed 7 day study streak",
      time: "1d ago",
      unread: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stay updated with your study activities
          </p>
        </div>
        <Button variant="outline" size="sm" className="dark:border-gray-700">
          <Check className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
              notification.unread ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {notification.time}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="p-2">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}