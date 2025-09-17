"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Loader2 } from "lucide-react"

interface ConfirmationModalMobileProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  confirmVariant?: "danger" | "primary"
  isLoading?: boolean
}

const slideVariants = {
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

const ConfirmationModalMobile = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmVariant = "primary",
  isLoading = false,
}: ConfirmationModalMobileProps) => {
  if (!isOpen) return null

  const confirmButtonClass =
    confirmVariant === "danger" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"

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
          className="bg-white dark:bg-[#111827] rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 mb-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  confirmVariant === "danger" ? "bg-red-100 dark:bg-red-900/20" : "bg-blue-100 dark:bg-blue-900/20"
                }`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${
                    confirmVariant === "danger" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                  }`}
                />
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
                className={`w-full px-4 py-4 text-base font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${confirmButtonClass}`}
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
