"use client"

import type React from "react"
import { Bell } from "lucide-react"

// Notification Item Component
interface NotificationItemProps {
  title: string
  message: string
  time: string
  isRead: boolean
  type: "message" | "group" | "system"
}

const NotificationItem: React.FC<NotificationItemProps> = ({ title, message, time, isRead, type }) => {
  const getTypeColor = () => {
    switch (type) {
      case "message":
        return "bg-blue-500"
      case "group":
        return "bg-green-500"
      case "system":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div
      className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
        !isRead ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor()}`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{title}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{time}</p>
        </div>
        {!isRead && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
      </div>
    </div>
  )
}

// Notifications Dropdown Component
interface NotificationsDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  // Placeholder notifications data
  const notifications = [
    {
      id: 1,
      title: "New message in Math Study Group",
      message: "John shared a new calculus problem",
      time: "2 minutes ago",
      isRead: false,
      type: "message" as const,
    },
    {
      id: 2,
      title: "Study session reminder",
      message: "Physics group meeting in 30 minutes",
      time: "28 minutes ago",
      isRead: false,
      type: "group" as const,
    },
    {
      id: 3,
      title: "Welcome to StudyBuddy!",
      message: "Complete your profile to get started",
      time: "1 hour ago",
      isRead: true,
      type: "system" as const,
    },
    {
      id: 4,
      title: "Group invitation",
      message: "Sarah invited you to Chemistry Study Group",
      time: "2 hours ago",
      isRead: true,
      type: "group" as const,
    },
  ]

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (!isOpen) return null

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{unreadCount} new</span>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => <NotificationItem key={notification.id} {...notification} />)
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            Mark all as read
          </button>
        </div>
      )}
    </div>
  )
}
