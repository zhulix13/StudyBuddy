import { motion } from "framer-motion";

const AuthLoader = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center h-[80vh] space-y-6">
    {/* Animated dots instead of basic spinner */}
    <motion.div
      className="flex space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="w-4 h-4 bg-blue-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
      />
      <motion.span
        className="w-4 h-4 bg-blue-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
      />
      <motion.span
        className="w-4 h-4 bg-blue-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
      />
    </motion.div>

    {/* Text with fade/slide animation */}
    <motion.p
      className="text-lg font-medium text-gray-700"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {text}
    </motion.p>
  </div>
);

export default AuthLoader;
