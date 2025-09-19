"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, User, Bell, Shield, Palette, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createPortal } from "react-dom"

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
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

  return (
    isOpen && createPortal(
      <AnimatePresence>
      
        <>
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants as any}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-full max-w-md mx-4 sm:mx-0"
          >
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* User Profile Section */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-xl">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">John Doe</h3>
                      <p className="text-sm text-gray-500">john.doe@example.com</p>
                      <p className="text-xs text-gray-400 mt-1">Member since Jan 2024</p>
                    </div>
                  </div>
                </div>

                {/* Settings Items */}
                <div className="p-4">
                  <div className="space-y-2">
                    {settingsItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={item.onClick}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                          <item.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
                    onClick={() => console.log("Sign out clicked")}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      
    </AnimatePresence>,
      document.body
    )
  )
}

export default SettingsModal
