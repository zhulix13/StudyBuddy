"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Logo from '/mainlogo.png'
import Logo2 from '/logo1.png'

import {
  BookOpen,
  Bell,
  Menu,
  X,
  ChevronDown,
  UserIcon,
  LogOut,
  Home,
  LayoutDashboard,
  Users,
  Compass,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDropdown } from "@/components/NoticationsDropdown"
import { useAuth } from "@/context/Authcontext"
import {auth} from '@/services/supabase'
import type { Profile } from "@/types/profile"

interface AuthUser {
  user_metadata?: {
    full_name?: string
  }
  email?: string
}



// Profile Dropdown Component
const ProfileDropdown: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSignOut: () => void
  user: AuthUser | null
  profile: Profile | null
}> = ({ isOpen, onClose, onSignOut, user, profile }) => {
  const fullName = user?.user_metadata?.full_name

  if (!isOpen) return null

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url || "/placeholder.svg"}
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
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        <Link
          to="/profile"
          onClick={onClose}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <UserIcon className="w-4 h-4" />
          Profile Settings
        </Link>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

// Mobile Navigation Component
const MobileNavigation: React.FC<{
  isOpen: boolean
  onClose: () => void
  currentPath: string
}> = ({ isOpen, onClose, currentPath }) => {
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/groups", label: "Groups", icon: Users },
    { path: "/discover", label: "Discover", icon: Compass },
  ]

  // Helper function to check if path is active
  const isPathActive = (navPath: string, currentPath: string) => {
    if (navPath === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(navPath)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 left-0 w-full h-full bg-white dark:bg-gray-900 transform transition-transform">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3" onClick={onClose}>
              <div className="w-10 h-10 bg-transparent rounded-2xl border border-blue-600 flex items-center justify-center shadow-lg">
                <img src={Logo2} alt="Logo" className="w-fit h-fit" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                StudyBuddy
              </span>
            </Link>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
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
                  isPathActive(path, currentPath)
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
  )
}

// Main Header Component
export const Header: React.FC = () => {
  const { user, profile } = useAuth()

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState("/")

  const fullName = user?.user_metadata?.full_name

  // Update current path on mount and when location changes
  useEffect(() => {
    setCurrentPath(window.location.pathname)
    
    // Listen for route changes (if using React Router)
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    
    window.addEventListener('popstate', handleLocationChange)
    
    // Also listen for pushstate/replacestate changes
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args)
      handleLocationChange()
    }
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args)
      handleLocationChange()
    }
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".dropdown-container")) {
        setIsNotificationsOpen(false)
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      // Clear localStorage first
      localStorage.clear()

      // Sign out from Supabase
      const { error } = await auth.signOut()
      
      if (error) {
        console.error("Logout error:", error)
        // Still redirect even if there's an error
      }

      // Redirect to login page
      window.location.href = "/login"
      
    } catch (error) {
      console.error("Logout error:", error)
      // Force redirect even if there's an error
      window.location.href = "/login"
    }
  }

  // Helper function to check if path is active
  const isPathActive = (navPath: string, currentPath: string) => {
    if (navPath === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(navPath)
  }

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/groups", label: "Groups" },
    { path: "/discover", label: "Discover" },
  ]

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-transparent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <img src={Logo2} alt="Logo" className="w-fit h-fit" />
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
                    isPathActive(path, currentPath)
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
                  <ThemeToggle />

                  {/* Notifications */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(!isNotificationsOpen)
                        setIsProfileOpen(false)
                      }}
                      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </button>
                    <NotificationsDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                  </div>

                  {/* Profile */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => {
                        setIsProfileOpen(!isProfileOpen)
                        setIsNotificationsOpen(false)
                      }}
                      className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url || "/placeholder.svg"}
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
                  <Link 
                    to="/login"
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </Link>
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
        currentPath={currentPath}
      />
    </>
  )
}

export default Header