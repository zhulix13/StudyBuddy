import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  Bell, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronDown,
  User,
  LogOut,
  Home,
  LayoutDashboard,
  Users,
  Compass
} from "lucide-react";
import { useAuth } from "../../context/Authcontext";
import { supabase } from "../../services/supabase";
import { toast } from "sonner";

// Notification Item Component
interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'message' | 'group' | 'system';
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  title, 
  message, 
  time, 
  isRead, 
  type 
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'message': return 'bg-blue-500';
      case 'group': return 'bg-green-500';
      case 'system': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
      !isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor()}`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
            {title}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {time}
          </p>
        </div>
        {!isRead && (
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
        )}
      </div>
    </div>
  );
};

// Notifications Dropdown Component
const NotificationsDropdown: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  // Placeholder notifications data
  const notifications = [
    {
      id: 1,
      title: "New message in Math Study Group",
      message: "John shared a new calculus problem",
      time: "2 minutes ago",
      isRead: false,
      type: 'message' as const
    },
    {
      id: 2,
      title: "Study session reminder",
      message: "Physics group meeting in 30 minutes",
      time: "28 minutes ago",
      isRead: false,
      type: 'group' as const
    },
    {
      id: 3,
      title: "Welcome to StudyBuddy!",
      message: "Complete your profile to get started",
      time: "1 hour ago",
      isRead: true,
      type: 'system' as const
    },
    {
      id: 4,
      title: "Group invitation",
      message: "Sarah invited you to Chemistry Study Group",
      time: "2 hours ago",
      isRead: true,
      type: 'group' as const
    }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              {...notification}
            />
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};

// Theme Toggle Component
const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
};

// Profile Dropdown Component
const ProfileDropdown: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSignOut: () => void;
  user: any;
  profile: any;
}> = ({ isOpen, onClose, onSignOut, user, profile }) => {
  const fullName = user?.user_metadata?.full_name;

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{fullName?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {profile?.username || fullName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <User className="w-4 h-4" />
          Profile Settings
        </button>
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

// Mobile Navigation Component
const MobileNavigation: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  currentPath: string;
}> = ({ isOpen, onClose, currentPath }) => {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/groups', label: 'Groups', icon: Users },
    { path: '/discover', label: 'Discover', icon: Compass },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 left-0 w-full h-full bg-white dark:bg-gray-900 transform transition-transform">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3" onClick={onClose}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                StudyBuddy
              </span>
            </Link>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-lg transition-colors ${
                  currentPath === path
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

// Main Header Component
const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fullName = user?.user_metadata?.full_name;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      toast.success("Signing out...");
      const { error } = await supabase.auth.signOut();
      localStorage.clear();
      
      if (error) {
        console.error("Signout error:", error);
        toast.error("Failed to sign out.");
        return;
      }
      
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out.");
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/groups', label: 'Groups' },
    { path: '/discover', label: 'Discover' },
  ];

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent hidden xs:block">
                StudyBuddy
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`font-medium transition-colors ${
                    location.pathname === path
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  {/* Theme Toggle */}
                  <ThemeToggle />

                  {/* Notifications */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(!isNotificationsOpen);
                        setIsProfileOpen(false);
                      }}
                      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </button>
                    <NotificationsDropdown 
                      isOpen={isNotificationsOpen} 
                      onClose={() => setIsNotificationsOpen(false)} 
                    />
                  </div>

                  {/* Profile */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => {
                        setIsProfileOpen(!isProfileOpen);
                        setIsNotificationsOpen(false);
                      }}
                      className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span>{fullName?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
                        {profile?.username || fullName}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                    </button>
                    <ProfileDropdown 
                      isOpen={isProfileOpen}
                      onClose={() => setIsProfileOpen(false)}
                      onSignOut={handleSignOut}
                      user={user}
                      profile={profile}
                    />
                  </div>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <button
                    onClick={() => navigate("/login")}
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentPath={location.pathname}
      />
    </>
  );
};

export default Header;