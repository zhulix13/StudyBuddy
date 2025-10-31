import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, X, Lock, Eye, EyeOff } from 'lucide-react';
import { auth } from '@/services/supabase';

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
        redirectTo: `${window.location.origin}/forgot-password`,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          addNotification('error', 'Too many requests. Please wait a moment before trying again.');
        } else {
          addNotification('error', 'If this email exists in our system, you will receive a reset link.');
        }
        return;
      }

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
        <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-700 dark:to-slate-900 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Forgot password?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            We'll send you reset instructions
          </p>
        </div>
      </div>

      <div className="space-y-4">
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
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={isLoading}
          className="w-full py-3.5 bg-slate-900 dark:bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>

        {/* Back to Login */}
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full flex items-center justify-center gap-2 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;