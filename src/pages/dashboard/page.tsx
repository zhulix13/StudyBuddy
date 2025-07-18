import { useState } from "react";
import { useAuth } from "../../context/Authcontext";
import Profile  from '@/pages/dashboard/profile';
import SettingsPage from "./settings";
import Sidebar from "./sidebar";
import type { User as Usertype } from "@supabase/supabase-js";
import Dashboard from "./dashboard";
import type { Profile as Profiletype } from "@/types/profile";

import {
  BookOpen,
 
  Menu,
 
} from "lucide-react";

 export default function StudyBuddyApp() {
  const { user, loading, profile }: { user: Usertype | null; loading: boolean; profile: Profiletype | null   } = useAuth();

  // While loading auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Checking session...</p>
      </div>
    );
  }

  // If no user and finished loading
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }
  
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState("dashboard");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);


  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={user} profile={profile} />;
      case "profile":
        return <Profile user={user} profile={profile} />;
      case "settings":
        return <SettingsPage user={user}  profile={profile} />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h2>
              <p className="text-gray-600">This page is coming soon!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        profile={profile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen mx-auto p-4 max-w-7xl lg:ml-72">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200/50 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudyBuddy
              </h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">{renderPage()}</main>
      </div>
    </div>
  );
}
