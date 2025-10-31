import React, { useState, useEffect } from "react";
import { BookOpen, Mail, Lock, Eye, EyeOff, Github, User, CheckCircle, AlertCircle, X, Users } from "lucide-react";
import {auth} from '@/services/supabase'
import { Link } from "react-router-dom";
import SignUpForm from "./SignupForm";
import SignUpHero from "./SignupHero";

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





// Main Component
export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
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
      addNotification('info', 'Create your account to join the study group');
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

  const handleSuccessfulSignup = (user: any) => {
    const successMessage = pendingInvite 
      ? 'Account created! Please verify your email to join your study group.'
      : 'Account created successfully! Please check your email to verify your account.';
      
    addNotification('success', successMessage);
    
    setTimeout(() => {
      addNotification('info', 'Redirecting to login...');
    }, 2000);
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
      
      {/* Left Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 min-h-screen">
        <div className="w-full mx-auto flex flex-col py-4">
          <SignUpForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            addNotification={addNotification}
            pendingInvite={pendingInvite}
            handleSuccessfulSignup={handleSuccessfulSignup}
          />
          
          {/* Login CTA at bottom - simple hypertext */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-slate-900 dark:text-slate-100 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero */}
      <SignUpHero pendingInvite={pendingInvite} />
    </div>
  );
};

export default SignupPage;