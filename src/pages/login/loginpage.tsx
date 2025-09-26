import React, { useState, useEffect } from 'react';
import { BookOpen, Mail, Lock, Eye, EyeOff, Github, CheckCircle, AlertCircle, X, Users } from 'lucide-react';
import { auth } from '@/services/supabase';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const INVITE_LS_KEY = "pending_invite_token";

// Notification Component
const NotificationContainer = ({ notifications, removeNotification }: { 
  notifications: Notification[], 
  removeNotification: (id: string) => void 
}) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {notifications.map(notification => (
      <div
        key={notification.id}
        className={`max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
            : notification.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}
      >
        {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />}
        {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />}
        {notification.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />}
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            notification.type === 'success' 
              ? 'text-emerald-800 dark:text-emerald-200' 
              : notification.type === 'error'
              ? 'text-red-800 dark:text-red-200'
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            {notification.message}
          </p>
        </div>
        
        <button
          onClick={() => removeNotification(notification.id)}
          className={`${
            notification.type === 'success' 
              ? 'text-emerald-600 hover:text-emerald-800 dark:text-emerald-400' 
              : notification.type === 'error'
              ? 'text-red-600 hover:text-red-800 dark:text-red-400'
              : 'text-blue-600 hover:text-blue-800 dark:text-blue-400'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
);

// Login Form Component
const LoginForm = ({ 
  formData, 
  setFormData, 
  formErrors, 
  setFormErrors,
  isLoading, 
  setIsLoading,
  addNotification,
  pendingInvite,
  handleSuccessfulLogin 
}: any) => {
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev: any) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) {
      addNotification('error', 'Please fix the errors below');
      return;
      
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          addNotification('error', 'Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          addNotification('error', 'Please check your email and confirm your account before signing in.');
        } else if (error.message.includes('Too many requests')) {
          addNotification('error', 'Too many login attempts. Please try again later.');
        } else {
          addNotification('error', error.message || 'Failed to sign in');
        }
        return;
      }

      if (data?.user) {
        handleSuccessfulLogin(data.user);
      }

    } catch (error: any) {
      addNotification('error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      
      const redirectTo = pendingInvite 
        ? `${window.location.origin}/invites`
        : `${window.location.origin}/dashboard`;
      
      const { data, error } = await auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        addNotification('error', error.message || `Failed to authenticate with ${provider}`);
        return;
      }
    } catch (error: any) {
      addNotification('error', error.message || `An error occurred during ${provider} authentication`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      addNotification('error', 'Please enter your email address first');
      return;
    }

    try {
      const { error } = await auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        addNotification('error', error.message || 'Failed to send reset email');
        return;
      }

      addNotification('success', 'Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      addNotification('error', error.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="w-full mx-auto max-w-md space-y-6">
      <div className="text-center space-y-4">
        <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-700 dark:to-slate-900 rounded-2xl flex items-center justify-center mx-auto">
          {pendingInvite ? <Users className="w-8 h-8 text-white" /> : <BookOpen className="w-8 h-8 text-white" />}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            {pendingInvite ? 'Sign in to join group' : 'Welcome back'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 font-light">
            Continue your learning journey
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Social Login */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialAuth('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialAuth('github')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
              Or with email and password
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                  formErrors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                }`}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            {formErrors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                  formErrors.password ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                }`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="rounded border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 shadow-sm focus:ring-slate-500 dark:focus:ring-slate-400 bg-white dark:bg-slate-800"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 underline font-medium transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="button"
            onClick={handleEmailLogin}
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : (pendingInvite ? 'Sign In & Join Group' : 'Sign In')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hero Component
const LoginHero = ({ pendingInvite }: { pendingInvite: string | null }) => (
  <div className="hidden lg:flex lg:w-1/2 login-bg p-12 flex-col justify-center items-center text-white relative overflow-hidden">
    {/* Dark overlay for better text readability */}
    <div className="absolute inset-0 bg-black/50"></div>
    
    <div className="relative z-10 text-center space-y-8">
      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto">
        {pendingInvite ? <Users className="w-10 h-10 text-white" /> : <BookOpen className="w-10 h-10 text-white" />}
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-serif">
          {pendingInvite ? 'Join Your Study Group!' : 'Welcome Back!'}
        </h1>
        <p className="text-white/90 text-lg max-w-md font-light leading-relaxed">
          {pendingInvite 
            ? 'Sign in to accept your group invitation and start collaborating with your study partners.'
            : 'Continue your learning journey with thousands of students worldwide.'
          }
        </p>
      </div>

      <div className="flex items-center justify-center gap-8 text-white/80 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <span>50K+ Active Students</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
          <span>10K+ Study Groups</span>
        </div>
      </div>
      
      {pendingInvite && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5" />
            <span className="font-medium">Group Invitation Pending</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            Complete your login to join the study group that invited you!
          </p>
        </div>
      )}
    </div>
  </div>
);

// Main Component
export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [pendingInvite, setPendingInvite] = useState<string | null>(null);

  // Check for pending invite
  useEffect(() => {
    const inviteToken = localStorage.getItem(INVITE_LS_KEY);
    if (inviteToken) {
      setPendingInvite(inviteToken);
      addNotification('info', 'Complete login to join your study group');
    }
  }, []);

  // Auto-remove notifications
  useEffect(() => {
    notifications.forEach(notification => {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    });
  }, [notifications]);

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSuccessfulLogin = (user: any) => {
    addNotification('success', 'Welcome back! Redirecting...');
    
    setTimeout(() => {
      if (pendingInvite) {
        addNotification('info', 'Redirecting to your study group...');
      } else {
        addNotification('info', 'Redirecting to dashboard...');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex overflow-y-auto">
      <style>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
      `}</style>
      
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      
      {/* Left Side - Hero */}
      <LoginHero pendingInvite={pendingInvite} />

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 min-h-screen">
        <div className="w-full mx-auto flex flex-col">
          <LoginForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            addNotification={addNotification}
            pendingInvite={pendingInvite}
            handleSuccessfulLogin={handleSuccessfulLogin}
          />
          
          {/* Sign Up CTA at bottom */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Don't have an account?
            </p>
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 font-medium border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
            >
              Create Account
            </a>
          </div>

          {/* Support Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Having trouble?{' '}
              <a
                href="/support"
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 underline font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;