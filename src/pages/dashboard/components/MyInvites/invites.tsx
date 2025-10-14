// InvitesPage.tsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Clock,
  Check,
  XCircle,
  CalendarX,
  UserX,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Users,
  User,
  Loader2,
  RefreshCw,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  useMyInvites,
  useAcceptInvite,
  useDeclineInvite,
  useDeleteInvite,
} from "@/hooks/useInvites";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ConfirmationModal from "@/groups_beta/layout/modals/invites/ConfirmationModal";
import { useGroupStore } from "@/store/groupStore";

type GroupInviteStatus = "pending" | "accepted" | "declined" | "expired" | "revoked";

interface GroupInvite {
  id: string;
  group_id: string;
  invited_by: string;
  invitee_id?: string | null;
  email?: string | null;
  token: string;
  status: GroupInviteStatus;
  created_at: string;
  expires_at: string;
  deleted_at: string | null;
  study_groups?: {
    name: string;
    subject: string;
    avatar_url?: string;
  };
}

const InvitesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GroupInviteStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "accept" | "decline" | "delete";
    invite?: GroupInvite;
  }>({ isOpen: false, type: "accept" });

  const { data: invites = [], isLoading, refetch, isRefetching } = useMyInvites();
  const acceptInviteMutation = useAcceptInvite();
  const declineInviteMutation = useDeclineInvite();
  const deleteInviteMutation = useDeleteInvite();

  const setActiveGroup = useGroupStore((s) => s.setActiveGroup)

  // Filter and search invites
  const filteredInvites = useMemo(() => {
    let filtered = invites.filter((invite: GroupInvite) => {
      // Add expiry status dynamically
      const expired = new Date(invite.expires_at) < new Date();
      const actualStatus = expired && invite.status === "pending" ? "expired" : invite.status;

      // Status filter
      if (statusFilter !== "all" && actualStatus !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const groupName = invite.study_groups?.name?.toLowerCase() || "";
        const groupSubject = invite.study_groups?.subject?.toLowerCase() || "";

        return groupName.includes(query) || groupSubject.includes(query);
      }

      return true;
    });

    return filtered;
  }, [invites, searchQuery, statusFilter]);

  // Group invites by status
  const groupedInvites = useMemo(() => {
    const pending = filteredInvites.filter((inv: GroupInvite) => {
      const expired = new Date(inv.expires_at) < new Date();
      return inv.status === "pending" && !expired;
    });
    const expired = filteredInvites.filter((inv: GroupInvite) => {
      const isExpired = new Date(inv.expires_at) < new Date();
      return inv.status === "pending" && isExpired;
    });
    const accepted = filteredInvites.filter((inv: GroupInvite) => inv.status === "accepted");
    const declined = filteredInvites.filter((inv: GroupInvite) => inv.status === "declined");
    const revoked = filteredInvites.filter((inv: GroupInvite) => inv.status === "revoked");

    return { pending, expired, accepted, declined, revoked };
  }, [filteredInvites]);

  const handleAcceptInvite = async (invite: GroupInvite) => {
    try {
      const result = await acceptInviteMutation.mutateAsync(invite.token);
      toast.success(`"Invite Accepted!", "You've successfully joined the group"`);
      setConfirmModal({ isOpen: false, type: "accept" });
      
      // Navigate to the group after accepting
      if (result?.group_id) {
        setTimeout(() => {
         setActiveGroup(result.study_groups)
          navigate(`/groups/${result.group_id}`);
        }, 1000);
      }
    } catch (error: any) {
      toast.error("Failed to Accept Invite", error.message || "Please try again");
    }
  };

  const handleDeclineInvite = async (invite: GroupInvite) => {
    try {
      await declineInviteMutation.mutateAsync(invite.token);
      toast.success("Invite Declined");
      setConfirmModal({ isOpen: false, type: "decline" });
    } catch (error: any) {
      toast.error("Failed to Decline Invite", error.message || "Please try again");
    }
  };

  const handleDeleteInvite = async (invite: GroupInvite) => {
    try {
      await deleteInviteMutation.mutateAsync(invite.token);
      toast.success("Invite Deleted");
      setConfirmModal({ isOpen: false, type: "delete" });
    } catch (error: any) {
      toast.error("Failed to Delete Invite", error.message || "Please try again");
    }
  };

  const getInviteStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
      case "accepted":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "declined":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "expired":
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700";
      case "revoked":
        return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700";
    }
  };

  const getInviteStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "accepted":
        return <Check className="w-3 h-3" />;
      case "declined":
        return <XCircle className="w-3 h-3" />;
      case "expired":
        return <CalendarX className="w-3 h-3" />;
      case "revoked":
        return <UserX className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return formatDate(dateString);
    }
  };

  const InviteCard = ({ invite }: { invite: GroupInvite }) => {
    const expired = isExpired(invite.expires_at);
    const actualStatus = expired && invite.status === "pending" ? "expired" : invite.status;
    const isPending = invite.status === "pending" && !expired;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 sm:p-5 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Group Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-slate-700 to-indigo-600 flex items-center justify-center">
              {invite.study_groups?.avatar_url ? (
                <img
                  src={invite.study_groups.avatar_url}
                  alt={invite.study_groups.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {invite.study_groups?.name || "Unknown Group"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {invite.study_groups?.subject || "No subject"}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getInviteStatusColor(
                  actualStatus
                )}`}
              >
                {getInviteStatusIcon(actualStatus)}
                {actualStatus}
              </span>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Sent {formatRelativeTime(invite.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {expired ? "Expired" : `Expires ${formatDate(invite.expires_at)}`}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {isPending && (
                <>
                  <button
                    onClick={() =>
                      setConfirmModal({ isOpen: true, type: "accept", invite })
                    }
                    disabled={acceptInviteMutation.isPending}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {acceptInviteMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Accept
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setConfirmModal({ isOpen: true, type: "decline", invite })
                    }
                    disabled={declineInviteMutation.isPending}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </>
              )}

              {!isPending && invite.status === "accepted" && (
                <button
                  onClick={() => {
                     setActiveGroup(null)
                     navigate(`/groups/${invite.group_id}`)}}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Group
                </button>
              )}

              {!isPending && (
                <button
                  onClick={() =>
                    setConfirmModal({ isOpen: true, type: "delete", invite })
                  }
                  disabled={deleteInviteMutation.isPending}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen  pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-slate-600 to-indigo-600 text-white px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">My Invites</h1>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <p className="text-blue-100 text-sm sm:text-base">
            Manage your group invitations
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold">
                {groupedInvites.pending.length}
              </div>
              <div className="text-xs sm:text-sm text-blue-100">Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold">
                {groupedInvites.accepted.length}
              </div>
              <div className="text-xs sm:text-sm text-blue-100">Accepted</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold">
                {groupedInvites.expired.length}
              </div>
              <div className="text-xs sm:text-sm text-blue-100">Expired</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold">
                {groupedInvites.declined.length + groupedInvites.revoked.length}
              </div>
              <div className="text-xs sm:text-sm text-blue-100">Other</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by group name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">
                {statusFilter === "all" ? "All Status" : statusFilter}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {showFilters && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                {["all", "pending", "accepted", "declined", "expired", "revoked"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as GroupInviteStatus | "all");
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors capitalize first:rounded-t-lg last:rounded-b-lg ${
                        statusFilter === status
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {status === "all" ? "All Status" : status}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading invites...</p>
            </div>
          </div>
        ) : filteredInvites.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No matching invites"
                : "No invites yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "You haven't received any group invitations yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredInvites.map((invite: GroupInvite) => (
                <InviteCard key={invite.id} invite={invite} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.invite && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, type: "accept" })}
          onConfirm={() => {
            if (confirmModal.type === "accept") {
              handleAcceptInvite(confirmModal.invite!);
            } else if (confirmModal.type === "decline") {
              handleDeclineInvite(confirmModal.invite!);
            } else {
              handleDeleteInvite(confirmModal.invite!);
            }
          }}
          title={
            confirmModal.type === "accept"
              ? "Accept Invitation"
              : confirmModal.type === "decline"
              ? "Decline Invitation"
              : "Delete Invitation"
          }
          message={
            confirmModal.type === "accept"
              ? `Are you sure you want to join "${confirmModal.invite.study_groups?.name}"?`
              : confirmModal.type === "decline"
              ? `Are you sure you want to decline this invitation to "${confirmModal.invite.study_groups?.name}"?`
              : `Are you sure you want to permanently delete this invitation? This action cannot be undone.`
          }
          type={
            confirmModal.type === "accept"
              ? "info"
              : confirmModal.type === "decline"
              ? "warning"
              : "danger"
          }
          confirmText={
            confirmModal.type === "accept"
              ? "Join Group"
              : confirmModal.type === "decline"
              ? "Decline"
              : "Delete"
          }
          cancelText="Cancel"
          isLoading={
            acceptInviteMutation.isPending ||
            declineInviteMutation.isPending ||
            deleteInviteMutation.isPending
          }
        />
      )}
    </div>
  );
};

export default InvitesPage;