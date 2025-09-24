import React, { useState, useEffect } from 'react';
import { BookOpen, Mail, Lock, Eye, EyeOff, Github, CheckCircle, AlertCircle, X, Users } from 'lucide-react';
import { auth } from '../../services/supabase'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const INVITE_LS_KEY = "pending_invite_token";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
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

  // Handle messages from signup redirect
  useEffect(() => {
    if (location.state?.message) {
      addNotification('info', location.state.message);
    }
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  // Auto-remove notifications after 3 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 3000);
    });
  }, [notifications]);

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSuccessfulLogin = (user: any) => {
    addNotification('success', 'Welcome back! Redirecting...');
    
    // Determine redirect destination
    let redirectTo = '/dashboard';
    
    if (pendingInvite) {
      // If there's a pending invite, redirect to invites page
      redirectTo = `/invites/${pendingInvite}`;
    } else if (location.state?.from?.pathname) {
      // If there's a specific page they were trying to access
      redirectTo = location.state.from.pathname;
    }

    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 1000);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        // Handle specific auth errors
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
      console.error('Login error:', error);
      addNotification('error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      
      // Determine redirect URL based on pending invite
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

      // For OAuth, the redirect will happen automatically
      // No need to show success message as user will be redirected
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
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
      console.error('Reset password error:', error);
      addNotification('error', error.message || 'Failed to send reset email');
    }
  };

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : notification.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
          {notification.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />}
          
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              notification.type === 'success' 
                ? 'text-green-800' 
                : notification.type === 'error'
                ? 'text-red-800'
                : 'text-blue-800'
            }`}>
              {notification.message}
            </p>
          </div>
          
          <button
            onClick={() => removeNotification(notification.id)}
            className={`${
              notification.type === 'success' 
                ? 'text-green-600 hover:text-green-800' 
                : notification.type === 'error'
                ? 'text-red-600 hover:text-red-800'
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <NotificationContainer />
      
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90"></div>
        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto">
            {pendingInvite ? <Users className="w-10 h-10 text-white" /> : <BookOpen className="w-10 h-10 text-white" />}
          </div>
          <h1 className="text-4xl font-bold">
            {pendingInvite ? 'Join Your Study Group!' : 'Welcome Back!'}
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            {pendingInvite 
              ? 'Sign in to accept your group invitation and start collaborating with your study partners.'
              : 'Continue your learning journey with thousands of students worldwide.'
            }
          </p>
          <div className="flex items-center gap-4 text-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">50K+ Active Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm">10K+ Study Groups</span>
            </div>
          </div>
          
          {pendingInvite && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Group Invitation Pending</span>
              </div>
              <p className="text-xs text-blue-100">
                Complete your login to join the study group that invited you!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {pendingInvite ? <Users className="w-8 h-8 text-white" /> : <BookOpen className="w-8 h-8 text-white" />}
            </div>
            <h2 className="text-3xl font-bold text-slate-800">
              {pendingInvite ? 'Sign in to join group' : 'Sign in to your account'}
            </h2>
            <p className="text-slate-600 mt-2">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            {/* Social Login */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('github')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-50 text-slate-500">Or with email and password</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.email ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-12 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.password ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : (pendingInvite ? 'Sign In & Join Group' : 'Sign In')}
              </button>
            </div>
          </form>

          {/* Additional Links */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Having trouble?{' '}
              <Link
                to="/support"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;