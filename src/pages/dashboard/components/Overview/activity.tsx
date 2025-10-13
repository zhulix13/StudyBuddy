import { Clock, Users, FileText, Target, Bell, Calendar, Plus, TrendingUp } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile as ProfileType } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/Authcontext";
import { useGroupStore } from "@/store/groupStore";
import { useNoteStore } from "@/store/noteStore";
import { useSearchParams } from "react-router-dom"


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

export default RecentActivity