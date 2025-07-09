import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../../context/Authcontext"; // Adjust the import path as necessary
import { supabase } from "../../services/supabase";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAuth(); // Get user from Auth context
  const fullName = user?.user_metadata?.full_name;

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <header className="sticky top-0 left-0 right-0 z-20 px-6 py-4 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            StudyBuddy
          </span>
        </Link>
        {/* Navigation */}
       
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/groups"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Groups
          </NavLink>
          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Discover
          </NavLink>
        </nav>
        {/* Auth/Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                  {fullName?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{fullName}</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2  cursor-pointer text-white bg-red-500 hover:bg-red-600 rounded-full"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 text-slate-700 hover:text-slate-900 font-semibold transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
