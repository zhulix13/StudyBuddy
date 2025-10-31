
import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, X, Lock, Eye, EyeOff } from 'lucide-react';
import { auth } from '@/services/supabase';


// Reset Password Form (when user clicks the link from email)
const ResetPasswordForm = ({ 
  isLoading,
  setIsLoading,
  addNotification,
  onSuccess
}: any) => {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validatePasswords = () => {
    const newErrors: {[key: string]: string} = {};

    if (!passwords.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswords()) {
      addNotification('error', 'Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await auth.updateUser({
        password: passwords.newPassword
      });

      if (error) {
        addNotification('error', error.message || 'Failed to update password');
        return;
      }

      addNotification('success', 'Password updated successfully!');
      onSuccess();
    } catch (error: any) {
      addNotification('error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
            Set new password
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create a strong password for your account
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleInputChange}
              className={`w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                errors.newPassword ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
              }`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleInputChange}
              className={`w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-slate-100 ${
                errors.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
              }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleUpdatePassword}
          disabled={isLoading}
          className="w-full py-3.5 bg-slate-900 dark:bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating password...' : 'Update password'}
        </button>
      </div>
    </div>
  );
};
export default ResetPasswordForm;