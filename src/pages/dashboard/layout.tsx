// src/pages/dashboard/DashboardLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/Authcontext";
import Sidebar from "./sidebar";
import { BookOpen, Menu } from "lucide-react";

export default function DashboardLayout() {
  const { user, loading, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // While loading auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400 text-lg">Checking session...</p>
      </div>
    );
  }

  // If no user and finished loading
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Please log in
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be logged in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        profile={profile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen mx-auto p-4 max-w-full md:max-w-[80%] lg:ml-72">
        {/* Mobile Header */}
        <div className="lg:hidden rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-900 dark:text-gray-100" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-slate-600 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="Logo"  />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent">
                StudyBuddy
              </h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page Content - Outlet renders child routes */}
        <main className="flex-1  w-full max-w-full p-2 lg:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}