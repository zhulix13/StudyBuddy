import { motion, AnimatePresence } from "framer-motion"
import {CheckCircle, AlertCircle} from 'lucide-react'

// Error Modal Component
export const ErrorModal = ({ isOpen, onClose, error, onRetry, desktopBackdropVariants, modalVariants }: { 
  isOpen: boolean; 
  onClose: () => void; 
  error: string;
  onRetry?: () => void;
  desktopBackdropVariants: any;
  modalVariants: any;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={desktopBackdropVariants}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] dark:bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[250] w-full max-w-md mx-4 sm:mx-0"
          >
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to Create Group</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error || "An unexpected error occurred. Please try again."}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}