import { MessageCircle, Users, BookOpen, Sparkles } from "lucide-react";
import { Sidebar } from "../layout/Sidebar";
import { useGroupStore } from "@/store/groupStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const GroupHome = () => {
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const setActiveGroup = useGroupStore((s) => s.setActiveGroup);
  const sidebarOpen = useGroupStore((s) => s.sidebarOpen);
  const setSidebarOpen = useGroupStore((s) => s.setSidebarOpen);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeGroup) {
      const currentGroupId = window.location.pathname.split('/groups/')[1]?.split('/')[0];
      
      if (currentGroupId !== activeGroup.id) {
        navigate(`/groups/${activeGroup.id}${window.location.search}`);
      }
    }
  }, [activeGroup]);

  const features = [
    {
      icon: Users,
      title: "Collaborate",
      description: "Work together with your study group"
    },
    {
      icon: MessageCircle,
      title: "Chat",
      description: "Discuss topics in real-time"
    },
    {
      icon: BookOpen,
      title: "Learn",
      description: "Share resources and knowledge"
    }
  ];

  return (
    <>
      <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        <div className="max-w-2xl px-8 text-center">
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              duration: 0.6 
            }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-600 rounded-full blur-2xl opacity-20 animate-pulse" />
            <motion.div 
              className="relative w-32 h-32 mx-auto"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src="/logo.png" 
                alt="StudyBuddy" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-slate-700 to-blue-600 bg-clip-text text-transparent">
                Welcome to StudyBuddy
              </h1>
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 15, 0],
                  scale: [1, 1.2, 1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Sparkles className="w-8 h-8 text-blue-500" />
              </motion.div>
            </div>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
              Select a group from the sidebar to start collaborating with your study buddies
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-br from-blue-500 to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Floating Particles Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="h-screen block md:hidden">
        <Sidebar
          setActiveGroup={setActiveGroup}
          activeGroupId={activeGroup?.id ?? null}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>
    </>
  );
};

export default GroupHome;