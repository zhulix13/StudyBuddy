// src/pages/InvitesPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  Clock,
  User
} from "lucide-react";
import { useAuth } from "@/context/Authcontext";
import { useGroupStore } from "@/store/groupStore";
import {
  useValidateInvite,
  useAcceptInvite,
  useDeclineInvite,
} from "@/hooks/useInvites";
import { Button } from "@/components/ui/button";
import Toast from "@/groups_beta/layout/modals/invites/SuccessToast";
import ConfirmModal from "./ConfirmModal";

const INVITE_LS_KEY = "pending_invite_token";

interface ToastState {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

interface ConfirmModalState {
  isOpen: boolean;
  type: "accept" | "decline" | null;
  title: string;
  message: string;
  confirmText: string;
  confirmVariant: "default" | "destructive";
}

const InvitesPage: React.FC = () => {
  const { token: urlToken } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const setActiveGroup = useGroupStore((s) => s.setActiveGroup);

  const [token, setToken] = useState<string | null>(null);
  const [redirectMessage, setRedirectMessage] = useState<string>("");
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const [hasValidatedToken, setHasValidatedToken] = useState(false);
  
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    confirmText: "",
    confirmVariant: "default",
  });

  // Helper functions for toast and modal
  const showToast = (type: ToastState["type"], title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }));
  };

  const showConfirmModal = (type: "accept" | "decline", groupName: string) => {
    if (type === "accept") {
      setConfirmModal({
        isOpen: true,
        type,
        title: "Join Study Group",
        message: `Are you sure you want to join "${groupName}"? You'll become a member and gain access to all group resources.`,
        confirmText: "Join Group",
        confirmVariant: "default",
      });
    } else {
      setConfirmModal({
        isOpen: true,
        type,
        title: "Decline Invitation",
        message: `Are you sure you want to decline the invitation to "${groupName}"? This action cannot be undone.`,
        confirmText: "Decline",
        confirmVariant: "destructive",
      });
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false, type: null }));
  };

  // Token handling effect - only set token, don't save to localStorage yet
  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      return;
    }

    // Only check localStorage if no URL token
    const stored = typeof window !== "undefined" ? localStorage.getItem(INVITE_LS_KEY) : null;
    if (stored) {
      setToken(stored);
      setHasValidatedToken(true); // Assume previously validated if in localStorage
    }
  }, [urlToken]);

  // Validate invite hook
  const validateQuery = useValidateInvite(token ?? "");
  const invite = useMemo(() => {
    const d = validateQuery.data as any;
    if (!d) return null;
    return Array.isArray(d) ? d[0] : d;
  }, [validateQuery.data]);

  // Handle successful validation
  useEffect(() => {
    if (validateQuery.isSuccess && invite && token && !hasValidatedToken) {
      // Save token to localStorage only after successful validation
      try {
        localStorage.setItem(INVITE_LS_KEY, token);
        setHasValidatedToken(true);
      } catch {
        // ignore storage errors
      }
    }
  }, [validateQuery.isSuccess, invite, token, hasValidatedToken]);

  // Redirect to signup effect - only after successful validation
  useEffect(() => {
    if (!user && token && hasValidatedToken && invite) {
      setRedirectMessage("Please sign up or log in to accept this group invitation. You'll be redirected back here after authentication.");
      setShowRedirectMessage(true);
      
      const timer = setTimeout(() => {
        setShowRedirectMessage(false);
        setTimeout(() => {
          navigate(`/signup?redirectTo=/invites`);
        }, 500);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, token, hasValidatedToken, invite, navigate]);

  // Accept & Decline mutations
  const acceptMutation = useAcceptInvite();
  const declineMutation = useDeclineInvite();

  const isProcessing = acceptMutation.isPending || declineMutation.isPending;

  const handleAcceptConfirm = async () => {
    if (!token) return;
    
    try {
      const res = await acceptMutation.mutateAsync(token);
      const row = Array.isArray(res) ? res[0] : res;
      
      // Clear stored token
      try {
        localStorage.removeItem(INVITE_LS_KEY);
      } catch {}

      // Show success toast
      showToast("success", "Welcome to the group!", "You've successfully joined the study group.");

      // Set active group in store
      if (row?.group_id && invite) {
        const groupData = {
          id: row.group_id,
          name: invite.group_name,
          subject: invite.group_subject,
          avatar_url: invite.group_avatar,
          description: invite.group_description,
        };
        setActiveGroup(groupData as any);
      }

      // Close modal and redirect after toast
      closeConfirmModal();
      setTimeout(() => {
        if (row?.group_id) {
          navigate(`/groups/${row.group_id}`);
        } else {
          navigate("/dashboard");
        }
      }, 2000);

    } catch (err: any) {
      console.error("Accept invite failed", err);
      showToast("error", "Failed to join group", err.message || "Something went wrong. Please try again.");
      closeConfirmModal();
    }
  };

  const handleDeclineConfirm = async () => {
    if (!token) return;
    
    try {
      await declineMutation.mutateAsync(token);
      
      // Clear stored token
      try {
        localStorage.removeItem(INVITE_LS_KEY);
      } catch {}

      showToast("info", "Invitation declined", "You've declined the group invitation.");
      
      closeConfirmModal();
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err: any) {
      console.error("Decline invite failed", err);
      showToast("error", "Failed to decline", err.message || "Something went wrong. Please try again.");
      closeConfirmModal();
    }
  };

  const handleAccept = () => {
    if (invite?.group_name) {
      showConfirmModal("accept", invite.group_name);
    }
  };

  const handleDecline = () => {
    if (invite?.group_name) {
      showConfirmModal("decline", invite.group_name);
    }
  };

  // Show redirect message
  if (showRedirectMessage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-slate-600 dark:text-slate-400" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {redirectMessage}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Redirecting in a moment...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Invalid token state
  if (!token && !validateQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Invalid Invite Link
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            This invite link is missing or invalid. Please check the link and try again.
          </p>
          <Button 
            onClick={() => navigate("/")} 
            className="w-full"
          >
            Go Home
          </Button>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (validateQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-6 h-6" />
          </motion.div>
          <span className="text-lg">Validating invitation...</span>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (validateQuery.isError || !invite) {
    const message = (validateQuery.error as any)?.message ?? "Invalid or expired invite";
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Invite Problem
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            {message}
          </p>
          <Button 
            onClick={() => navigate("/")} 
            variant="outline"
            className="w-full"
          >
            Go Home
          </Button>
        </motion.div>
      </div>
    );
  }

  // Main invite display
  const {
    group_name,
    group_description,
    group_subject,
    group_avatar,
    expires_at,
    status,
  } = invite as any;

  const isExpired = new Date(expires_at) < new Date();
  const expiresInDays = Math.ceil(
    (new Date(expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto p-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-slate-700 dark:from-blue-700 dark:to-slate-800 p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8" />
                <h1 className="text-2xl font-bold">Group Invitation</h1>
              </div>
              <p className="text-blue-100 dark:text-slate-200">You've been invited to join a study group</p>
            </div>

            {/* Group Info */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  {group_avatar ? (
                    <img 
                      src={group_avatar} 
                      alt={group_name} 
                      className="w-16 h-16 rounded-xl object-cover ring-4 ring-blue-100 dark:ring-slate-700" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-slate-600 dark:from-blue-600 dark:to-slate-700 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-blue-100 dark:ring-slate-700">
                      {(group_name || "G").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                    {group_name}
                  </h2>
                  {group_subject && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {group_subject}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {isExpired 
                          ? "Expired" 
                          : expiresInDays === 1 
                          ? "Expires tomorrow" 
                          : `Expires in ${expiresInDays} days`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        status === 'pending' ? 'bg-yellow-500' : 
                        status === 'accepted' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="capitalize">{status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About this group</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {group_description || "No description provided for this study group."}
                </p>
              </div>

              {/* Expiry Warning */}
              {!isExpired && expiresInDays <= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                        Invitation expires soon!
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        This invitation will expire on {new Date(expires_at).toLocaleDateString()} at {new Date(expires_at).toLocaleTimeString()}.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Expired State */}
              {isExpired && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-center"
                >
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                    Invitation Expired
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This invitation expired on {new Date(expires_at).toLocaleDateString()}.
                    Please contact the group admin for a new invitation.
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              {!isExpired && status === 'pending' && (
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={handleAccept} 
                      disabled={isProcessing}
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 dark:from-blue-700 dark:to-slate-800 dark:hover:from-blue-800 dark:hover:to-slate-900 transition-all duration-200"
                    >
                      {acceptMutation.isPending ? (
                        <>
                          <Loader2 className="animate-spin mr-2 w-5 h-5" />
                          Joining Group...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 w-5 h-5" />
                          Accept & Join Group
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleDecline} 
                    disabled={isProcessing}
                    className="w-full h-12 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border-gray-300 dark:border-gray-600"
                  >
                    {declineMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin mr-2 w-4 h-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 w-4 h-4" />
                        Decline Invitation
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Info Note */}
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-1">
                      New to our platform?
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                      If you're not signed up yet, you'll be redirected to create an account first. 
                      Don't worry - we'll bring you right back here to accept your invitation!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast Component */}
      <Toast
        isOpen={toast.isOpen}
        onClose={closeToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />

      {/* Confirmation Modal */}
      <div className="flex items-center justify-center">
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmModal.type === "accept" ? handleAcceptConfirm : handleDeclineConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          confirmVariant={confirmModal.confirmVariant}
          isLoading={isProcessing}
        />
      </div>
    </>
  );
};

export default InvitesPage;