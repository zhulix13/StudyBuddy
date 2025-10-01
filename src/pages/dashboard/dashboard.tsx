import { Clock, Users, FileText, Target, Bell, Calendar, Plus, TrendingUp } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile as ProfileType } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/Authcontext";

const DashboardStats = () => {
  const stats = [
    {
      label: "Study Hours",
      value: "24h",
      change: "+12%",
      icon: Clock,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Active Groups",
      value: "5",
      change: "+2",
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Notes Created",
      value: "32",
      change: "+8",
      icon: FileText,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Goals Achieved",
      value: "12",
      change: "+3",
      icon: Target,
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stat.value}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

const RecentActivity = () => {
  const activities = [
    {
      action: "Joined",
      target: "Mathematics Study Group",
      time: "2h ago",
      icon: Users,
    },
    {
      action: "Created",
      target: "Physics Notes: Quantum Mechanics",
      time: "4h ago",
      icon: FileText,
    },
    {
      action: "Completed",
      target: "Weekly Study Goal",
      time: "1d ago",
      icon: Target,
    },
    {
      action: "Scheduled",
      target: "Group Session: Chemistry",
      time: "2d ago",
      icon: Calendar,
    },
  ];

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
        Recent Activity
      </h2>
      <div className="space-y-3 sm:space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div
              key={index}
              className="flex items-center space-x-3 sm:space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                  <span className="font-medium">{activity.action}</span>{" "}
                  <span className="hidden sm:inline">{activity.target}</span>
                  <span className="sm:hidden">{activity.target.substring(0, 20)}...</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuickActions = () => {
  const navigate = useNavigate();
  
  const actions = [
    { label: "Create Group", icon: Plus, color: "from-blue-500 to-blue-600", action: () => navigate('/groups') },
    { label: "Join Session", icon: Users, color: "from-purple-500 to-purple-600", action: () => {} },
    { label: "New Note", icon: FileText, color: "from-green-500 to-green-600", action: () => navigate('/groups') },
    { label: "Set Goal", icon: Target, color: "from-orange-500 to-orange-600", action: () => {} },
  ];

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`
                flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3 
                p-3 sm:p-4 rounded-xl text-white font-medium text-sm sm:text-base
                bg-gradient-to-r ${action.color} hover:shadow-lg transform hover:scale-105
                transition-all duration-200
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs sm:text-base">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  
  return (
    <div className="space-y-6 max-w-full w-full sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Welcome back, {profile?.username || user?.user_metadata?.name || "User"}! Here's your study overview.
          </p>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-sm sm:text-base">
            <Plus className="w-4 h-4 inline mr-2" />
            <span className="hidden sm:inline">New Session</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <RecentActivity />
        <QuickActions />
      </div>

      {/* Progress Chart Placeholder */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
          Study Progress
        </h2>
        <div className="h-48 sm:h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center">
          <div className="text-center px-4">
            <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 dark:text-blue-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Progress chart will be implemented here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;