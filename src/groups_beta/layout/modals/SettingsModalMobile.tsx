"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, User, Bell, Shield, Palette, HelpCircle, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createPortal } from "react-dom"
import { useEffect } from "react"

const modalVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { type: "spring", stiffness: 400, damping: 40 },
  },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

interface SettingsModalMobileProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModalMobile = ({ isOpen, onClose }: SettingsModalMobileProps) => {
  const settingsItems = [
    {
      icon: User,
      title: "Profile",
      description: "Manage your profile and preferences",
      onClick: () => console.log("Profile clicked"),
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure notification settings",
      onClick: () => console.log("Notifications clicked"),
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Control your privacy and security settings",
      onClick: () => console.log("Privacy clicked"),
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Customize theme and display options",
      onClick: () => console.log("Appearance clicked"),
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help and contact support",
      onClick: () => console.log("Help clicked"),
    },
  ]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  return (
    isOpen &&
    createPortal(
      <AnimatePresence>
        <>
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 dark:bg-black/40"
            onClick={onClose}
          />

          {/* Modal - Full screen mobile */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants as any}
            className="fixed inset-0 bg-white dark:bg-[#111827] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* User Profile Section */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-2xl">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">John Doe</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">john.doe@example.com</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Member since Jan 2024</p>
                  </div>
                </div>
              </div>

              {/* Settings Items */}
              <div className="p-4">
                <div className="space-y-1">
                  {settingsItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group active:bg-gray-100 dark:active:bg-gray-700"
                    >
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                        <item.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-base">{item.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 bg-transparent h-12 text-base font-medium"
                onClick={() => console.log("Sign out clicked")}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>

            {/* Bottom Padding for safe area */}
            <div className="h-8" />
          </motion.div>
        </>
      </AnimatePresence>,
      document.body,
    )
  )
}

export default SettingsModalMobile
