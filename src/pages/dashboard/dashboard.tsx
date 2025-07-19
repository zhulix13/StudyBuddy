import { Clock, Users, FileText, Target, Bell, Calendar, Plus, TrendingUp } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600">{stat.label}</p>
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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div
              key={index}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.action}</span>{" "}
                  {activity.target}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuickActions = () => {
  const actions = [
    { label: "Create Group", icon: Plus, color: "from-blue-500 to-blue-600" },
    {
      label: "Join Session",
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    { label: "New Note", icon: FileText, color: "from-green-500 to-green-600" },
    { label: "Set Goal", icon: Target, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`
                flex items-center space-x-3 p-4 rounded-xl text-white font-medium
                bg-gradient-to-r ${action.color} hover:shadow-lg transform hover:scale-105
                transition-all duration-200
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = ({user, profile}: {user: User | null, profile: Profile | null}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {profile?.username || user?.user_metadata?.name ||  'User'} ! Here's your study overview.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:shadow-lg transition-all">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-4 h-4 inline mr-2" />
            New Session
          </button>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity />
        <QuickActions />
      </div>

      {/* Progress Chart Placeholder */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Study Progress</h2>
        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">
              Progress chart will be implemented here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;