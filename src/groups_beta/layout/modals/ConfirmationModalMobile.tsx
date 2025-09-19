// Enhanced Confirmation Modal Mobile

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Loader2, CheckCircle, AlertCircle, Trash2, LogOut, UserMinus } from "lucide-react"

interface ConfirmationModalMobileProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  confirmVariant?: "danger" | "primary" | "warning"
  isLoading?: boolean
  icon?: "warning" | "danger" | "delete" | "leave" | "remove"
}

const slideVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 40 },
  },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const ConfirmationModalMobile = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmVariant = "primary",
  isLoading = false,
  icon = "warning",
}: ConfirmationModalMobileProps) => {
  if (!isOpen) return null

  // Icon mapping
  const getIcon = () => {
    switch (icon) {
      case "danger":
        return <AlertCircle className="w-6 h-6" />
      case "delete":
        return <Trash2 className="w-6 h-6" />
      case "leave":
        return <LogOut className="w-6 h-6" />
      case "remove":
        return <UserMinus className="w-6 h-6" />
      default:
        return <AlertTriangle className="w-6 h-6" />
    }
  }

  // Color mapping based on variant
  const getColors = () => {
    switch (confirmVariant) {
      case "danger":
        return {
          iconBg: "bg-red-100 dark:bg-red-900/20",
          iconColor: "text-red-600 dark:text-red-400",
          buttonBg: "bg-red-600 hover:bg-red-700",
          buttonText: "text-white",
        }
      case "warning":
        return {
          iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          buttonBg: "bg-yellow-600 hover:bg-yellow-700",
          buttonText: "text-white",
        }
      default:
        return {
          iconBg: "bg-blue-100 dark:bg-blue-900/20",
          iconColor: "text-blue-600 dark:text-blue-400",
          buttonBg: "bg-blue-600 hover:bg-blue-700",
          buttonText: "text-white",
        }
    }
  }

  const colors = getColors()

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideVariants}
          className="bg-white dark:bg-[#111827] rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700 w-full max-w-md mb-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.iconBg}`}>
                <div className={colors.iconColor}>
                  {getIcon()}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base">{message}</p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`w-full px-4 py-4 text-base font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${colors.buttonBg} ${colors.buttonText}`}
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {confirmText}
              </button>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-full px-4 py-4 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Safe area padding */}
          <div className="h-8" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConfirmationModalMobile