// services/supabase-dashboard.ts
import { supabase } from "./supabase";

export interface DashboardStats {
  activeGroups: number;
  notesCreated: number;
  goalsAchieved: number;
  studyHours: number;
  groupsChange: number;
  notesChange: number;
  goalsChange: number;
  studyHoursChange: number;
}

/**
 * Fetch dashboard statistics for the current user
 * Includes counts and percentage changes from previous period
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error("Not authenticated");

  // Calculate date ranges for comparison
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Fetch all counts in parallel for better performance
  const [
    groupsCount,
    groupsCountPrevious,
    notesCount,
    notesCountPrevious,
    // Add goals and study hours queries when those tables are ready
  ] = await Promise.all([
    // Current active groups count
    supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),

    // Previous period groups count (joined before 30 days ago)
    supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lt("joined_at", thirtyDaysAgo.toISOString()),

    // Current notes count
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("deleted_at", null),

    // Previous period notes count (created before 30 days ago)
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .lt("created_at", thirtyDaysAgo.toISOString()),
  ]);

  // Calculate current counts
  const currentGroups = groupsCount.count || 0;
  const currentNotes = notesCount.count || 0;

  // Calculate previous counts
  const previousGroups = groupsCountPrevious.count || 0;
  const previousNotes = notesCountPrevious.count || 0;

  // Calculate changes (new items in the last 30 days)
  const groupsChange = currentGroups - previousGroups;
  const notesChange = currentNotes - previousNotes;

  return {
    activeGroups: currentGroups,
    notesCreated: currentNotes,
    goalsAchieved: 0, // TODO: Implement when goals table is ready
    studyHours: 0, // TODO: Implement when study sessions table is ready
    groupsChange,
    notesChange,
    goalsChange: 0, // TODO: Implement when goals table is ready
    studyHoursChange: 0, // TODO: Implement when study sessions table is ready
  };
}

/**
 * Get user's recent activity count (last 7 days)
 * Useful for activity trends
 */
export async function getRecentActivity(): Promise<{
  recentNotes: number;
  recentGroupJoins: number;
}> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error("Not authenticated");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [recentNotesCount, recentGroupsCount] = await Promise.all([
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString())
      .is("deleted_at", null),

    supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("joined_at", sevenDaysAgo.toISOString()),
  ]);

  return {
    recentNotes: recentNotesCount.count || 0,
    recentGroupJoins: recentGroupsCount.count || 0,
  };
}