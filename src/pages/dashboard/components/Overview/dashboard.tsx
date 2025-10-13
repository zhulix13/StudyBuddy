import { Clock, Users, FileText, Target, Bell, Calendar, Plus, TrendingUp } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile as ProfileType } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/Authcontext";

import QuickActions from "./actions";
import DashboardStats from "./stats";
import RecentActivity from "./activity";








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
            Welcome back, {profile?.username.toUpperCase() || user?.user_metadata?.name || "User"}! Here's your study overview.
          </p>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button 
            onClick={() => navigate('/dashboard/notifications')}
            className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-slate-600 text-white rounded-xl hover:shadow-lg transition-all text-sm sm:text-base">
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