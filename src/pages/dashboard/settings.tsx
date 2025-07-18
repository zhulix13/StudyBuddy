import type { User as User } from '@supabase/supabase-js';
import type { Profile as Profile } from '@/types/profile';


const SettingsPage = ({user, profile}: {user: User | null, profile: Profile | null}) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>
        <div className="space-y-4">
          {[
            { label: 'Email notifications', description: 'Receive email updates about your groups' },
            { label: 'Push notifications', description: 'Get notified about new messages' },
            { label: 'Study reminders', description: 'Receive reminders for scheduled sessions' },
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Profile visibility</p>
              <p className="text-sm text-gray-600">Control who can see your profile</p>
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Public</option>
              <option>Friends only</option>
              <option>Private</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;