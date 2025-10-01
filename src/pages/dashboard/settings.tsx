// src/pages/dashboard/settings.tsx
import { useState } from "react";
import { useAuth } from "@/context/Authcontext";

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reminders: false,
  });
  const [privacy, setPrivacy] = useState("public");

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
          Manage your account and preferences
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
          Notifications
        </h2>
        <div className="space-y-4">
          {[
            { key: 'email' as const, label: 'Email notifications', description: 'Receive email updates about your groups' },
            { key: 'push' as const, label: 'Push notifications', description: 'Get notified about new messages' },
            { key: 'reminders' as const, label: 'Study reminders', description: 'Receive reminders for scheduled sessions' },
          ].map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {setting.label}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {setting.description}
                </p>
              </div>
              <button
                onClick={() => toggleNotification(setting.key)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  notifications[setting.key]
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    notifications[setting.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
          Privacy
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                Profile visibility
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Control who can see your profile
              </p>
            </div>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none"
            >
              <option value="public">Public</option>
              <option value="friends">Friends only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;