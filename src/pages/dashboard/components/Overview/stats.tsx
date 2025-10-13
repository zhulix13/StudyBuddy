import { Clock, Users, FileText, Target, Loader2, AlertCircle } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DashboardStats = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  const statItems = [
    {
      label: "Study Hours",
      value: stats?.studyHours || 0,
      change: stats?.studyHoursChange || 0,
      icon: Clock,
      color: "from-blue-500 to-blue-600",
      suffix: "h",
    },
    {
      label: "Active Groups",
      value: stats?.activeGroups || 0,
      change: stats?.groupsChange || 0,
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Notes Created",
      value: stats?.notesCreated || 0,
      change: stats?.notesChange || 0,
      icon: FileText,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Goals Achieved",
      value: stats?.goalsAchieved || 0,
      change: stats?.goalsChange || 0,
      icon: Target,
      color: "from-orange-500 to-orange-600",
    },
  ];

  // Format change display
  const formatChange = (change: number) => {
    if (change === 0) return "0";
    return change > 0 ? `+${change}` : `${change}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Skeleton circle width={48} height={48} className="dark:bg-gray-700" />
              <Skeleton width={50} height={24} className="rounded-full dark:bg-gray-700" />
            </div>
            <Skeleton width={60} height={32} className="mb-1 dark:bg-gray-700" />
            <Skeleton width={100} height={16} className="dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
              Failed to load statistics
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        const changeValue = stat.change;
        const isPositive = changeValue > 0;
        const isNeutral = changeValue === 0;

        return (
          <div
            key={index}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div
                className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              {!isNeutral && (
                <span
                  className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                    isPositive
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                      : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30"
                  }`}
                >
                  {formatChange(changeValue)}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stat.value}
              {stat.suffix && (
                <span className="text-base sm:text-lg ml-1 text-gray-600 dark:text-gray-400">
                  {stat.suffix}
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;