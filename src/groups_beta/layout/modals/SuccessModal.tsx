import { motion, AnimatePresence } from "framer-motion"
import {CheckCircle, AlertCircle} from 'lucide-react'


// Success Modal Component
export const SuccessModal = ({ isOpen, onClose, groupName, desktopBackdropVariants, modalVariants }: { 
  isOpen: boolean; 
  onClose: () => void; 
  groupName: string;
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[500] dark:bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[600] w-full max-w-md mx-4 sm:mx-0"
          >
            <div className="bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Group Created Successfully!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  "{groupName}" has been created and you're now the admin.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}