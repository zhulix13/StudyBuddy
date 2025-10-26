// src/pages/dashboard/settings.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/Authcontext";
import { 
  useNotificationPreferences, 
  useUpdateNotificationPreferences 
} from "@/hooks/useNotificationPreferences";
import { useRequestNotificationPermission } from "@/hooks/useNotifications";
import { Bell, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const { permission: browserPermission, request: requestBrowserPermission } = useRequestNotificationPermission();

  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  // Track changes
  useEffect(() => {
    if (preferences && localPreferences) {
      const changed = JSON.stringify(preferences) !== JSON.stringify(localPreferences);
      setHasChanges(changed);
    }
  }, [preferences, localPreferences]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!localPreferences) return;
    setLocalPreferences({
      ...localPreferences,
      [key]: !localPreferences[key],
    });
  };

  const handleNumberChange = (key: keyof NotificationPreferences, value: number) => {
if (!localPreferences) return;
setLocalPreferences({
...localPreferences,
[key]: value,
});
};

  const handleSave = async () => {
    if (!localPreferences || !hasChanges) return;

    try {
      const { user_id, updated_at, ...updates } = localPreferences;
      await updatePreferences.mutateAsync(updates);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  };

  const handleRequestBrowserPermission = async () => {
    const result = await requestBrowserPermission();
    if (result === 'granted') {
      alert('Browser notifications enabled!');
    } else if (result === 'denied') {
      alert('Browser notifications were denied. Please enable them in your browser settings.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!localPreferences) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 mx-auto max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
          Manage your account and notification preferences
        </p>
      </div>

      {/* Save Bar */}
      {hasChanges && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            You have unsaved changes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-blue-700 dark:text-blue-300"
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updatePreferences.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updatePreferences.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-900 dark:text-green-100">
            Settings saved successfully!
          </p>
        </div>
      )}

      {/* Browser Notifications */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Browser Notifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get instant notifications for high-priority events
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            browserPermission === 'granted' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : browserPermission === 'denied'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {browserPermission === 'granted' ? 'Enabled' : browserPermission === 'denied' ? 'Blocked' : 'Not Set'}
          </div>
        </div>

        {browserPermission !== 'granted' && (
          <Button
            onClick={handleRequestBrowserPermission}
            variant="outline"
            className="w-full"
          >
            <Bell className="w-4 h-4 mr-2" />
            Enable Browser Notifications
          </Button>
        )}
      </div>

      {/* Category Toggles */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Notification Categories
        </h2>
        <div className="space-y-3">
          {[
            { 
              key: 'social_enabled' as const, 
              label: 'Social notifications', 
              description: 'Likes, comments, and replies on your content' 
            },
            { 
              key: 'group_enabled' as const, 
              label: 'Group notifications', 
              description: 'Group joins, leaves, and member activity' 
            },
            { 
              key: 'invite_enabled' as const, 
              label: 'Invitations', 
              description: 'Group invitations from other users' 
            },
            { 
              key: 'content_enabled' as const, 
              label: 'Content notifications', 
              description: 'New notes and shared content in your groups' 
            },
          ].map((setting) => (
            <ToggleItem
              key={setting.key}
              label={setting.label}
              description={setting.description}
              checked={localPreferences[setting.key]}
              onChange={() => handleToggle(setting.key)}
            />
          ))}
        </div>
      </div>

      {/* Specific Notifications */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Specific Notifications
        </h2>
        <div className="space-y-3">
          {[
            { 
              key: 'note_likes_enabled' as const, 
              label: 'Note likes', 
              description: 'When someone likes your note',
              category: 'social_enabled'
            },
            { 
              key: 'note_comments_enabled' as const, 
              label: 'Comments & replies', 
              description: 'When someone comments or replies',
              category: 'social_enabled'
            },
            { 
              key: 'message_replies_enabled' as const, 
              label: 'Message replies', 
              description: 'When someone replies to your messages',
              category: 'social_enabled'
            },
            { 
              key: 'new_notes_enabled' as const, 
              label: 'New notes in groups', 
              description: 'When members post new notes (can be noisy)',
              category: 'content_enabled'
            },
            { 
              key: 'member_joins_enabled' as const, 
              label: 'Member joins', 
              description: 'When new members join your groups (admins only)',
              category: 'group_enabled'
            },
          ].map((setting) => (
            <ToggleItem
              key={setting.key}
              label={setting.label}
              description={setting.description}
              checked={localPreferences[setting.key]}
              onChange={() => handleToggle(setting.key)}
              disabled={!localPreferences[setting.category as keyof typeof localPreferences]}
            />
          ))}
        </div>
      </div>

      {/* Batching Settings */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Notification Batching
        </h2>
        <div className="space-y-4">
          <ToggleItem
            label="Batch similar notifications"
            description="Combine multiple similar notifications into one"
            checked={localPreferences.batch_similar}
            onChange={() => handleToggle('batch_similar')}
          />
          
          {localPreferences.batch_similar && (
            <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch window (minutes)
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Notifications within this time window will be combined
              </p>
              <input
                type="number"
                min="5"
                max="120"
                step="5"
                value={localPreferences.batch_window_minutes}
                onChange={(e) => handleNumberChange('batch_window_minutes', parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Quiet Hours
        </h2>
        <div className="space-y-4">
          <ToggleItem
            label="Enable quiet hours"
            description="Pause notifications during specific hours"
            checked={localPreferences.quiet_hours_enabled}
            onChange={() => handleToggle('quiet_hours_enabled')}
          />
          
          {localPreferences.quiet_hours_enabled && (
            <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start time (24-hour format)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={localPreferences.quiet_start_hour}
                  onChange={(e) => handleNumberChange('quiet_start_hour', parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">:00</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End time (24-hour format)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={localPreferences.quiet_end_hour}
                  onChange={(e) => handleNumberChange('quiet_end_hour', parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">:00</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Toggle Item Component
interface NotificationPreferences {
  social_enabled: boolean;
  group_enabled: boolean;
  invite_enabled: boolean;
  content_enabled: boolean;
  note_likes_enabled: boolean;
  note_comments_enabled: boolean;
  message_replies_enabled: boolean;
  new_notes_enabled: boolean;
  member_joins_enabled: boolean;
  batch_similar: boolean;
  batch_window_minutes: number;
  quiet_hours_enabled: boolean;
  quiet_start_hour: number;
  quiet_end_hour: number;
}

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false 
}) => (
  <div className={`flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl ${
    disabled ? 'opacity-50' : ''
  }`}>
    <div className="flex-1 min-w-0 pr-4">
      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
        {label}
      </p>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked
          ? 'bg-blue-500 dark:bg-blue-600'
          : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

export default SettingsPage;