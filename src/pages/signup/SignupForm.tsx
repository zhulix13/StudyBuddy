import React, { useState, useEffect } from "react";
import { BookOpen, Mail, Lock, Eye, EyeOff, Github, User, CheckCircle, AlertCircle, X, Users } from "lucide-react";
import {auth} from '@/services/supabase'
import { Link } from "react-router-dom";

// Sign Up Form Component
const SignUpForm = ({ 
  formData, 
  setFormData, 
  formErrors, 
  setFormErrors,
  isLoading, 
  setIsLoading,
  addNotification,
  pendingInvite,
  handleSuccessfulSignup 
}: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = "You must agree to the Terms of Service and Privacy Policy";
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

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification('error', 'Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim(),
          },
        },
      });

      if (error) {
        addNotification('error', error.message || 'Failed to create account');
        return;
      }

      if (data?.user) {
        handleSuccessfulSignup(data.user);
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
        ? `${window.location.origin}/invites/${pendingInvite}`
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

  return (
    <div className="w-full mx-auto max-w-md space-y-4">
      <div className="text-center space-y-3">
        <div className="lg:hidden w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-700 dark:to-slate-900 rounded-2xl flex items-center justify-center mx-auto">
          {pendingInvite ? <Users className="w-7 h-7 text-white" /> : <BookOpen className="w-7 h-7 text-white" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            {pendingInvite ? 'Join the study group' : 'Create your account'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-light">
            Start your collaborative learning journey
          </p>
        </div>
      </div>

      <form onSubmit={handleEmailSignup} className="space-y-4">
        {/* Social Sign Up */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialAuth('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
            <span className="text-sm">Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialAuth('github')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm">GitHub</span>
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
              Or with email
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                  formErrors.name ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {formErrors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                  formErrors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {formErrors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-11 pr-12 py-2.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                  formErrors.password ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                }`}
                placeholder="Create a password"
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
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full pl-11 pr-12 py-2.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                  formErrors.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.confirmPassword}</p>
            )}
          </div>

          <div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className={`mt-0.5 rounded border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 shadow-sm focus:ring-slate-500 dark:focus:ring-slate-400 bg-white dark:bg-slate-800 ${
                  formErrors.agreeToTerms ? 'border-red-300 dark:border-red-700' : ''
                }`}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 underline font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 underline font-medium"
                >
                  Privacy Policy
                </a>
              </span>
            </div>
            {formErrors.agreeToTerms && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.agreeToTerms}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : (pendingInvite ? "Create Account & Join Group" : "Create Account")}
          </button>
        </div>
      </form>
    </div>
  );
};
export default SignUpForm;