import React, { useState } from 'react';
import { BookOpen, X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const Header: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle auth logic here
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              StudyBuddy
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Pricing
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsSignUp(false);
                setShowAuth(true);
              }}
              className="px-5 py-2.5 text-slate-700 hover:text-slate-900 font-semibold transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setShowAuth(true);
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

    

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-600">
                {isSignUp ? 'Join thousands of students already studying together' : 'Sign in to continue your learning journey'}
              </p>
            </div>

            <div className="space-y-6">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-slate-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-700 font-semibold ml-1 transition-colors"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;