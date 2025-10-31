import React, { useState, useEffect } from "react";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { auth } from "@/services/supabase";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetPasswordForm from "./ResetPasswordForm";

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// Notification Component
const NotificationContainer = ({
  notifications,
  removeNotification,
}: {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {notifications.map((notification) => (
      <div
        key={notification.id}
        className={`max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 ${
          notification.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
            : notification.type === "error"
            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
        }`}
      >
        {notification.type === "success" && (
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        )}
        {notification.type === "error" && (
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
        )}
        {notification.type === "info" && (
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        )}

        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              notification.type === "success"
                ? "text-emerald-800 dark:text-emerald-200"
                : notification.type === "error"
                ? "text-red-800 dark:text-red-200"
                : "text-blue-800 dark:text-blue-200"
            }`}
          >
            {notification.message}
          </p>
        </div>

        <button
          onClick={() => removeNotification(notification.id)}
          className={`${
            notification.type === "success"
              ? "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
              : notification.type === "error"
              ? "text-red-600 hover:text-red-800 dark:text-red-400"
              : "text-blue-600 hover:text-blue-800 dark:text-blue-400"
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
);

// Success State Component
const SuccessState = ({
  email,
  onBackToLogin,
}: {
  email: string;
  onBackToLogin: () => void;
}) => (
  <div className="w-full mx-auto max-w-md space-y-6 text-center">
    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
      <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
    </div>

    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Check your email
      </h1>
      <div className="space-y-2">
        <p className="text-slate-600 dark:text-slate-400">
          We've sent a password reset link to
        </p>
        <p className="text-slate-900 dark:text-slate-100 font-medium">
          {email}
        </p>
      </div>
    </div>

    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div className="flex items-start gap-3 text-left">
        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
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
        className="w-full py-3.5 bg-slate-900 dark:bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-200"
      >
        Back to Sign In
      </button>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        Didn't receive the email?{" "}
        <button
          onClick={() => window.location.reload()}
          className="text-slate-900 dark:text-slate-100 underline font-medium"
        >
          Try again
        </button>
      </p>
    </div>
  </div>
);

// Main Component
export const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Check if user came from password reset link
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");

    if (type === "recovery") {
      setIsResettingPassword(true);
    }
  }, []);

  // Auto-remove notifications
  useEffect(() => {
    notifications.forEach((notification) => {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    });
  }, [notifications]);

  const addNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  const handlePasswordResetSuccess = () => {
    addNotification("success", "Password updated! Redirecting to login...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  const handleBackToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <style>{`
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
      `}</style>

      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />

      <div className="w-full">
        {isResettingPassword ? (
          <ResetPasswordForm
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            addNotification={addNotification}
            onSuccess={handlePasswordResetSuccess}
          />
        ) : showSuccess ? (
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
  );
};

export default ForgotPasswordPage;
