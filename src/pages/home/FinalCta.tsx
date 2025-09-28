import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Users, Sparkles, CheckCircle, Star, Shield, Zap } from 'lucide-react';

const FinalCTASection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: CheckCircle, text: "Free Forever" },
    { icon: Shield, text: "Secure & Private" },
    { icon: Zap, text: "Instant Setup" },
    { icon: Users, text: "50K+ Students" }
  ];

  const testimonialStats = [
    { value: "4.9/5", label: "Student Rating", icon: Star },
    { value: "50K+", label: "Active Users", icon: Users },
    { value: "10K+", label: "Study Groups", icon: BookOpen },
    { value: "98%", label: "Success Rate", icon: CheckCircle }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Moving gradient orbs */}
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-slate-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Spotlight effect */}
        <div 
          className="absolute pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 200,
            top: mousePosition.y - 200,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }}
        />

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Content */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-400/30 rounded-full px-6 py-3 text-sm font-medium text-blue-200 backdrop-blur-sm mb-8">
            <Sparkles className="w-5 h-5" />
            <span>Join the learning revolution</span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Ready to 
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent"> Transform </span>
            <br />
            Your Study Experience?
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            Join thousands of students who have already discovered the power of collaborative learning. 
            Start your journey today and achieve more together.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <a
              href="/signup"
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-gray-900 bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
            >
              <span className="relative z-10">Start Learning Together</span>
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-300 to-blue-300 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
            </a>
            
            <a
              href="/discover"
              className="group inline-flex items-center justify-center px-12 py-5 text-xl font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-blue-400/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Browse Study Groups
              <BookOpen className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            </a>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-3 p-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30">
                    <Icon className="w-6 h-6 text-blue-300" />
                  </div>
                  <span className="text-gray-300 font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 md:p-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-white mb-4">
              Trusted by Students Worldwide
            </h3>
            <p className="text-gray-300 text-lg">
              See why StudyBuddy is the #1 choice for collaborative learning
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {testimonialStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-blue-400/30">
                    <Icon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="text-4xl font-bold  mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Final Push */}
          <div className="text-center mt-12 pt-8 border-t border-white/10">
            <p className="text-gray-300 mb-6 text-lg">
              Don't study alone anymore. Your perfect study group is waiting.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Free forever plan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default FinalCTASection;