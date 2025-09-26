import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, X, HelpCircle, Lock } from 'lucide-react';
import { auth } from '@/services/supabase';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

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

// Success State Component
const SuccessState = ({ email, onBackToLogin }: { email: string, onBackToLogin: () => void }) => (
  <div className="w-full mx-auto max-w-md space-y-6 text-center">
    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
      <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
    </div>
    
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-serif">
        Check your email
      </h1>
      <div className="space-y-2">
        <p className="text-slate-600 dark:text-slate-400 font-light">
          We've sent a password reset link to
        </p>
        <p className="text-slate-900 dark:text-slate-100 font-medium">
          {email}
        </p>
      </div>
    </div>

    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="text-left">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            Next steps:
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>1. Check your inbox (and spam folder)</li>
            <li>2. Click the reset link in the email</li>
            <li>3. Create your new password</li>
          </ol>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <button
        onClick={onBackToLogin}
        className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Back to Sign In
      </button>
      
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Didn't receive the email?{' '}
        <button 
          onClick={() => window.location.reload()}
          className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 underline font-medium"
        >
          Try again
        </button>
      </p>
    </div>
  </div>
);

// Forgot Password Form Component
const ForgotPasswordForm = ({ 
  formData, 
  setFormData, 
  formErrors, 
  setFormErrors,
  isLoading, 
  setIsLoading,
  addNotification,
  onSuccess,
  onBackToLogin 
}: any) => {

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev: any) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      addNotification('error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('rate limit')) {
          addNotification('error', 'Too many requests. Please wait a moment before trying again.');
        } else if (error.message.includes('not found') || error.message.includes('invalid')) {
          addNotification('error', 'If this email exists in our system, you will receive a reset link.');
        } else {
          addNotification('error', error.message || 'Failed to send reset email');
        }
        return;
      }

      // Success - show success state
      onSuccess();
      addNotification('success', 'Password reset email sent successfully!');

    } catch (error: any) {
      addNotification('error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleResetPassword();
    }
  };

  return (
    <div className="w-full mx-auto max-w-md space-y-6">
      <div className="text-center space-y-4">
        <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-700 dark:to-slate-900 rounded-2xl flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Forgot your password?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 font-light">
            Don't worry, we'll send you reset instructions
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Email Input */}
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
              onKeyPress={handleKeyPress}
              className={`w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                formErrors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
              }`}
              placeholder="Enter your email address"
              autoComplete="email"
              autoFocus
            />
          </div>
          {formErrors.email && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
          )}
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            We'll send a reset link to this email address
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={isLoading}
          className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending reset link...' : 'Send reset link'}
        </button>

        {/* Back to Login */}
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center gap-2 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium mb-1">Having trouble?</p>
            <p>
              If you don't receive an email within a few minutes, check your spam folder or{' '}
              <a 
                href="/support" 
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hero Component
const ForgotPasswordHero = () => (
  <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-10">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>
    </div>
    
    <div className="relative z-10 text-center space-y-8">
      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto">
        <Lock className="w-10 h-10 text-white" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-serif">
          We've got you covered
        </h1>
        <p className="text-white/90 text-lg max-w-md font-light leading-relaxed">
          Forgot your password? No worries! It happens to the best of us. 
          Let's get you back to learning in no time.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-400/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm">Secure password reset</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm">Email verification</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm">Account protection</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
export const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  const handleBackToLogin = () => {
    window.location.href = '/login';
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
      <ForgotPasswordHero />

      {/* Right Side - Form or Success State */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 min-h-screen">
        <div className="w-full mx-auto flex flex-col">
          {showSuccess ? (
            <SuccessState 
              email={formData.email}
              onBackToLogin={handleBackToLogin}
            />
          ) : (
            <ForgotPasswordForm
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              addNotification={addNotification}
              onSuccess={handleSuccess}
              onBackToLogin={handleBackToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;