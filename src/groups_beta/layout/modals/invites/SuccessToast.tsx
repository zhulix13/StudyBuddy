import React, { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, AlertTriangle, Info } from "lucide-react"

interface ToastProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
}

const Toast: React.FC<ToastProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  duration = 5000
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
          iconBg: "bg-green-100 dark:bg-green-800/30",
          iconColor: "text-green-600 dark:text-green-400",
          titleColor: "text-green-800 dark:text-green-300",
          messageColor: "text-green-700 dark:text-green-400",
          icon: <Check className="w-5 h-5" />
        }
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          iconBg: "bg-red-100 dark:bg-red-800/30",
          iconColor: "text-red-600 dark:text-red-400",
          titleColor: "text-red-800 dark:text-red-300",
          messageColor: "text-red-700 dark:text-red-400",
          icon: <X className="w-5 h-5" />
        }
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
          iconBg: "bg-yellow-100 dark:bg-yellow-800/30",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          titleColor: "text-yellow-800 dark:text-yellow-300",
          messageColor: "text-yellow-700 dark:text-yellow-400",
          icon: <AlertTriangle className="w-5 h-5" />
        }
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          iconBg: "bg-blue-100 dark:bg-blue-800/30",
          iconColor: "text-blue-600 dark:text-blue-400",
          titleColor: "text-blue-800 dark:text-blue-300",
          messageColor: "text-blue-700 dark:text-blue-400",
          icon: <Info className="w-5 h-5" />
        }
    }
  }

  const styles = getToastStyles()

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.9 }}
        className="fixed top-4 right-4 z-[400] max-w-md w-full"
      >
        <div className={`border rounded-lg p-4 shadow-lg ${styles.bg}`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
              <div className={styles.iconColor}>
                {styles.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${styles.titleColor}`}>
                {title}
              </h4>
              {message && (
                <p className={`text-sm mt-1 ${styles.messageColor}`}>
                  {message}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default Toast