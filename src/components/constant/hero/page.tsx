import { Users, BookOpen, ArrowRight, Globe, Sparkles } from 'lucide-react';
import React from 'react';
import GridBackground from '@/components/ui/gridbackground';

// Grid Background Component
// const GridBackground = ({ className = "", gridSize = 40, fadeIntensity = 20, children }) => {
//   const gridStyles = {
//     backgroundSize: `${gridSize}px ${gridSize}px`,
//     backgroundImage: [
//       'linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px)',
//       'linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)'
//     ].join(', ')
//   };

//   const darkGridStyles = {
//     backgroundSize: `${gridSize}px ${gridSize}px`,
//     backgroundImage: [
//       'linear-gradient(to right, rgba(71, 85, 105, 0.4) 1px, transparent 1px)',
//       'linear-gradient(to bottom, rgba(71, 85, 105, 0.4) 1px, transparent 1px)'
//     ].join(', ')
//   };

//   return (
//     <div className={`relative ${className}`}>
//       {/* Light mode grid */}
//       <div className="absolute inset-0 dark:hidden" style={gridStyles} />
      
//       {/* Dark mode grid */}  
//       <div className="absolute inset-0 hidden dark:block" style={darkGridStyles} />
      
//       {/* Radial fade overlay */}
//       <div 
//         className="pointer-events-none absolute inset-0 bg-white dark:bg-gray-900"
//         style={{
//           maskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`
//         }}
//       />
      
//       {children}
//     </div>
//   );
// };

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Grid Background */}
      <GridBackground className="absolute inset-0" gridSize={50} fadeIntensity={25} />
      
      {/* Animated gradient orbs - reduced intensity */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-slate-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-slate-400/15 to-emerald-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-emerald-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Spotlight effect overlay - reduced intensity */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-slate-50/30 dark:from-blue-950/30 dark:via-transparent dark:to-slate-950/30" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          {/* Announcement Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-950/50 dark:to-emerald-950/50 border border-blue-200/50 dark:border-blue-800/50 rounded-full px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 50K+ students worldwide</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-gray-900 mr-3 dark:text-white">Study</span>
              
              <span className="bg-gradient-to-r ml-3 from-blue-600 via-blue-700 to-slate-800 dark:from-blue-400 dark:via-blue-300 dark:to-slate-200 bg-clip-text text-transparent">
                Together
              </span>
              <br />
              <span className="text-gray-900 dark:text-white text-4xl sm:text-5xl lg:text-6xl">
                Achieve More
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              Connect with fellow students, collaborate in real-time, and track your progress together. 
              Transform your learning experience with powerful study groups.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="/signup" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-2xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 border border-blue-500/20"
            >
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-emerald-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
            </a>
            
            <a
              href="/discover" 
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Discover Groups
              <Globe className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-20">
            {[
              { icon: <Users className="w-4 h-4" />, text: "50K+ Students" },
              { icon: <BookOpen className="w-4 h-4" />, text: "Real-time Notes" },
              { text: "Free Forever" },
              { text: "No Credit Card" }
            ].map((pill, index) => (
              <div 
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm"
              >
                {pill.icon}
                <span>{pill.text}</span>
              </div>
            ))}
          </div>

          {/* Demo Preview Cards */}
          <div className="relative max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Live Collaboration Card */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Live Collaboration
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Edit notes together in real-time with your study partners
                  </p>
                  
                  {/* Simulated typing indicators */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Sarah is typing...</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-xs text-gray-600 dark:text-gray-300">
                      "Just added the chemistry formulas!"
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Groups Card */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 md:translate-y-4">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Study Groups
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Join subject-specific groups or create your own
                  </p>
                  
                  {/* Avatar stack */}
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div 
                        key={i}
                        className="w-6 h-6 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white font-medium"
                      >
                        {i}
                      </div>
                    ))}
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                      +5
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Tracking Card */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-6 h-6 text-white">📊</div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Track Progress
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Monitor your learning journey and achievements
                  </p>
                  
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Weekly Goal</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connecting lines animation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden md:block">
              <div className="w-32 h-32 border border-dashed border-blue-300 dark:border-blue-700 rounded-full animate-spin opacity-20" style={{animationDuration: '20s'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;