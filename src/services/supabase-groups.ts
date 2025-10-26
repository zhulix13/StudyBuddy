// services/supabase-groups.ts (UPDATED WITH NOTIFICATIONS)
import type {
  StudyGroup,
  GroupMember,
  CreateGroupData,
  UpdateGroupData,
} from "@/types/groups";
import { supabase } from "./supabase";
import { NotificationTriggers } from "./notifications/trigger";

// Join a group
export async function joinGroup(
  groupId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "Not authenticated" };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (existingMember) {
      return {
        success: false,
        message: "You are already a member of this group",
      };
    }

    // Check if group exists and is not private
    const { data: group } = await supabase
      .from("study_groups")
      .select("is_private, name, avatar_url")
      .eq("id", groupId)
      .single();

    if (!group) {
      return { success: false, message: "Group not found" };
    }

    if (group.is_private) {
      return { success: false, message: "Cannot join private group" };
    }

    // Insert new member
    const { error } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: user.id,
      role: "member",
    });

    if (error) {
      console.error("Error joining group:", error);
      return { success: false, message: "Failed to join group" };
    }

    // 🔥 TRIGGER NOTIFICATIONS (fire and forget)
    sendJoinGroupNotifications(
      groupId,
      user.id,
      group.name,
      group.avatar_url
    ).catch((err) => {
      console.error("Failed to send join group notifications:", err);
    });

    return { success: true, message: "Successfully joined group" };
  } catch (error) {
    console.error("Error in joinGroup:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

// 🔥 NEW: Send notifications when user joins group
async function sendJoinGroupNotifications(
  groupId: string,
  userId: string,
  groupName: string,
  groupAvatar?: string
) {
  try {
    // 1. Notify the user who joined
    await NotificationTriggers.notifyGroupJoined(userId, {
      groupId,
      groupName,
      groupAvatar,
    });

    // 2. Notify group admins about new member
    const { data: admins } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      // Get the new member's profile
      const { data: memberProfile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userId)
        .single();

      const adminIds = admins.map((a) => a.user_id);
      await NotificationTriggers.notifyMemberJoined(adminIds, userId, {
        groupId,
        groupName,
        memberName: memberProfile?.full_name || "Someone",
        memberAvatar: memberProfile?.avatar_url,
      });
    }
  } catch (error) {
    console.error("Error in sendJoinGroupNotifications:", error);
  }
}

export async function leaveGroup(
  groupId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "Not authenticated" };
    }

    // Check if user is actually a member
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return { success: false, message: "You are not a member of this group" };
    }

    // Check if user is the only admin
    if (membership.role === "admin") {
      const { data: adminCount } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("role", "admin");

      if (adminCount && adminCount.length <= 1) {
        return {
          success: false,
          message:
            "Cannot leave: You are the only admin. Please assign another admin first.",
        };
      }
    }

    // Get group details before leaving
    const { data: group } = await supabase
      .from("study_groups")
      .select("name, is_private")
      .eq("id", groupId)
      .single();

    // Remove member from group
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error leaving group:", error);
      return { success: false, message: "Failed to leave group" };
    }

    // 🔥 TRIGGER NOTIFICATION (fire and forget)
    if (group) {
      NotificationTriggers.notifyGroupLeft(user.id, {
        groupId,
        groupName: group.name,
        isPublic: !group.is_private,
      }).catch((err) => {
        console.error("Failed to send leave group notification:", err);
      });
    }

    return { success: true, message: "Successfully left the group" };
  } catch (error) {
    console.error("Error in leaveGroup:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

// ... (keep all other functions unchanged: getGroupMembers, getPublicGroups, deleteOwnGroup, getGroupById, getGroupsWhereUserIsMember)

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      id,
      group_id,
      user_id,
      role,
      joined_at,
      profiles!group_members_user_id_fkey1 (
        id,
        full_name,
        username,
        avatar_url
      )
    `
    )
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function getPublicGroups(): Promise<StudyGroup[]> {
  const { data, error } = await supabase
    .from("study_groups")
    .select("*")
    .eq("is_private", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const groupIds = data.map((g) => g.id);

  const { data: memberCounts } = await supabase
    .from("group_members")
    .select("group_id");

  const countMap =
    memberCounts?.reduce((acc, cur) => {
      acc[cur.group_id] = (acc[cur.group_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) ?? {};

  return data.map((group) => ({
    ...group,
    member_count: countMap[group.id] ?? 0,
  }));
}

export async function deleteOwnGroup(
  groupId: string
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const { data: groupData, error: groupError } = await supabase
      .from("study_groups")
      .select("id, name, created_by")
      .eq("id", groupId)
      .single();

    if (groupError) {
      return {
        success: false,
        message: "Group not found or access denied",
        error: groupError.message,
      };
    }

    if (groupData.created_by !== user.id) {
      return {
        success: false,
        message: "You can only delete groups you created",
      };
    }

    const { error: deleteError } = await supabase
      .from("study_groups")
      .delete()
      .eq("id", groupId);

    if (deleteError) {
      return {
        success: false,
        message: "Failed to delete group",
        error: deleteError.message,
      };
    }

    return {
      success: true,
      message: `Group "${groupData.name}" deleted successfully`,
      data: {
        deletedGroupId: groupId,
        deletedGroupName: groupData.name,
      },
    };
  } catch (error) {
    console.error("Delete group error:", error);
    return {
      success: false,
      message: "Internal server error",
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : String(error),
    };
  }
}

export async function getGroupById(
  groupId: string
): Promise<StudyGroup | null> {
  const { data: group, error } = await supabase
    .from("study_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) throw error;
  if (!group) return null;

  const { data: memberCounts } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("group_id", groupId);

  const member_count = memberCounts ? memberCounts.length : 0;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let user_role: string | null = null;
  if (user) {
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();
    user_role = membership?.role ?? null;
  }

  return {
    ...group,
    member_count,
    user_role,
  };
}

export async function getGroupsWhereUserIsMember(): Promise<StudyGroup[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error("Not authenticated");

  const { data: memberships, error: memberError } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", user.id);

  if (memberError) throw memberError;
  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.group_id);

  const { data: groups, error: groupError } = await supabase
    .from("study_groups")
    .select("*")
    .in("id", groupIds);

  if (groupError) throw groupError;

  const { data: memberCounts } = await supabase
    .from("group_members")
    .select("group_id");

  const countMap =
    memberCounts?.reduce((acc, cur) => {
      acc[cur.group_id] = (acc[cur.group_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) ?? {};

  const membershipMap = memberships.reduce((acc, cur) => {
    acc[cur.group_id] = cur.role;
    return acc;
  }, {} as Record<string, string>);

  return groups.map((group) => ({
    ...group,
    user_role: membershipMap[group.id] ?? null,
    member_count: countMap[group.id] ?? 0,
  }));
}

export async function getUserGroups(): Promise<StudyGroup[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error("Not authenticated");

  const { data: groups, error } = await supabase
    .from("study_groups")
    .select("*")
    .or(`created_by.eq.${user.id},is_private.eq.false`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const groupIds = groups.map((g) => g.id);

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", user.id)
    .in("group_id", groupIds);

  const membershipMap =
    memberships?.reduce((acc, cur) => {
      acc[cur.group_id] = cur.role;
      return acc;
    }, {} as Record<string, string>) ?? {};

  const { data: memberCounts } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", groupIds);

  const countMap =
    memberCounts?.reduce((acc, cur) => {
      acc[cur.group_id] = (acc[cur.group_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) ?? {};

  return groups.map((group) => ({
    ...group,
    user_role: membershipMap[group.id] ?? null,
    member_count: countMap[group.id] ?? 0,
  }));
}

export async function createGroup(
  groupData: CreateGroupData
): Promise<StudyGroup> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: group, error } = await supabase
    .from("study_groups")
    .insert({ ...groupData, created_by: user.id })
    .select()
    .single();

  if (error) throw error;

  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: user.id, role: "admin" });

  if (memberError) throw memberError;

  return { ...group, member_count: 1, user_role: "admin" };
}

export async function updateGroup(groupId: string, updates: UpdateGroupData) {
  const { error } = await supabase
    .from("study_groups")
    .update(updates)
    .eq("id", groupId);

  if (error) throw error;
}
