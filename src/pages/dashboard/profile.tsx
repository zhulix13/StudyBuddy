import type { User } from '@supabase/supabase-js';

const Profile = ({ user }: { user: User | null }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
        <div className="flex items-center space-x-6 mb-8">
          <img 
            src={user?.user_metadata.avatar_url || 'https://via.placeholder.com/150'} 
            alt={user?.user_metadata.name || 'User Avatar'}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user?.user_metadata.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center space-x-4 mt-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Active Learner
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                7 Day Streak
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <h3 className="text-2xl font-bold text-blue-700">156</h3>
            <p className="text-blue-600">Study Hours</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <h3 className="text-2xl font-bold text-purple-700">23</h3>
            <p className="text-purple-600">Groups Joined</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <h3 className="text-2xl font-bold text-green-700">89</h3>
            <p className="text-green-600">Notes Created</p>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input 
              type="text" 
              defaultValue={user?.user_metadata.name || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              defaultValue={user?.email || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea 
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;