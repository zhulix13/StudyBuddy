import {
  Home,
  User,
  Target,
  Calendar,
  Award,
  Bell,
  Settings,
  BookOpen,
  ChevronRight,
  X,
} from "lucide-react";
import type { User as Usertype } from "@supabase/supabase-js";

const Sidebar = ({
  isOpen,
  toggleSidebar,
  currentPage,
  setCurrentPage,
  user,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: Usertype | null;
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "goals", label: "Study Goals", icon: Target, path: "/goals" },
    { id: "schedule", label: "Schedule", icon: Calendar, path: "/schedule" },
    {
      id: "achievements",
      label: "Achievements",
      icon: Award,
      path: "/achievements",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed bottom-0  inset-y-0 lg:top-[73px] left-0 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 
  shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:z-20
  flex flex-col
  ${isOpen ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudyBuddy
              </h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <img
              src={
                user?.user_metadata.avatar_url ||
                "https://via.placeholder.com/150"
              }
              alt={user?.user_metadata.name || "User Avatar"}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.user_metadata.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left
                  transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-blue-600"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-6 bg-gradient-to-t from-gray-50 to-transparent">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Study Streak</span>
            </div>
            <p className="text-sm opacity-90">7 days strong! 🔥</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
