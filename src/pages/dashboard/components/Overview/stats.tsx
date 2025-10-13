import { Clock, Users, FileText, Target, Bell, Calendar, Plus, TrendingUp } from "lucide-react";
import type { User } from "@supabase/supabase-js";



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

export default DashboardStats