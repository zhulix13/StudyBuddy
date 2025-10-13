// src/pages/dashboard/sidebar.tsx
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  Bell,
  Settings,
  BookOpen,
  ChevronRight,
  X,
  Award,
  Mail
} from "lucide-react";
import type { User as Usertype } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";

const Sidebar = ({
  isOpen,
  toggleSidebar,
  user,
  profile,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
  user: Usertype | null;
  profile: Profile | null;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "profile", label: "Profile", icon: User, path: "/dashboard/profile" },
    { id: "invites", label: "My Invites", icon: Mail, path: "/dashboard/invites" },  
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/dashboard/notifications",
    },
    { id: "settings", label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  const isActivePath = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

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
        fixed bottom-0 inset-y-0 lg:top-[55px] left-0 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl 
        border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl transform transition-transform 
        duration-300 ease-in-out z-50 lg:z-20 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-slate-600 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="logo" className="h-8 w-auto" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent">
                StudyBuddy
              </h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <img
              src={
                profile?.avatar_url ||
                user?.user_metadata.avatar_url ||
                "https://via.placeholder.com/150"
              }
              alt={user?.user_metadata.name || "User Avatar"}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {profile?.full_name || user?.user_metadata.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left
                  transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-slate-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-6 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent">
          <div className="bg-gradient-to-r from-blue-500 to-slate-600 rounded-xl p-4 text-white">
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