// hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getRecentActivity } from "@/services/supabase-dashboard";

// Query keys
export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
  activity: ["dashboard", "activity"] as const,
};

/**
 * Hook to fetch dashboard statistics
 * Includes active groups, notes created, goals achieved, and study hours
 * with percentage changes from previous period
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
};

/**
 * Hook to fetch recent activity (last 7 days)
 * Useful for showing activity trends
 */
export const useRecentActivity = () => {
  return useQuery({
    queryKey: dashboardKeys.activity,
    queryFn: getRecentActivity,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
  });
};