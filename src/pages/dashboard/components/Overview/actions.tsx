import { Clock, Users, FileText, Target, Bell, Calendar, Plus, TrendingUp } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile as ProfileType } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/Authcontext";
import { useGroupStore } from "@/store/groupStore";
import { useNoteStore } from "@/store/noteStore";
import { useSearchParams } from "react-router-dom"



const QuickActions = () => {
  const navigate = useNavigate();
  const {activeTab, setActiveTab} = useGroupStore();

  const {mode, setMode} = useNoteStore();

  
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

export default QuickActions