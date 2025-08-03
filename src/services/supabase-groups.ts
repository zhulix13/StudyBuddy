import type {
  StudyGroup,
  GroupMember,
  CreateGroupData,
  UpdateGroupData,
} from "@/types/groups";
import { supabase } from "./supabase";

// GET groups where user is creator or public
export async function getUserGroups(): Promise<StudyGroup[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
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

  const membershipMap = memberships?.reduce((acc, cur) => {
    acc[cur.group_id] = cur.role;
    return acc;
  }, {} as Record<string, string>) ?? {};

  const { data: memberCounts } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", groupIds);

  const countMap = memberCounts?.reduce((acc, cur) => {
    acc[cur.group_id] = (acc[cur.group_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  return groups.map((group) => ({
    ...group,
    user_role: membershipMap[group.id] ?? null,
    member_count: countMap[group.id] ?? 0,
  }));
}



// Create a new group
// Requires user to be authenticated

export async function createGroup(
  groupData: CreateGroupData
): Promise<StudyGroup> {
  const { data: { user } } = await supabase.auth.getUser();
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

// Update group details
// Only allow updates to name, avatar, subject, description, and privacy status
export async function updateGroup(groupId: string, updates: UpdateGroupData) {
  const { error } = await supabase
    .from("study_groups")
    .update(updates)
    .eq("id", groupId);

  if (error) throw error;
}

// Join a group
// Requires user to be authenticated
export async function joinGroup(groupId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
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
      return { success: false, message: "You are already a member of this group" };
    }

    // Check if group exists and is not private
    const { data: group } = await supabase
      .from("study_groups")
      .select("is_private")
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

    return { success: true, message: "Successfully joined group" };
  } catch (error) {
    console.error("Error in joinGroup:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function leaveGroup(groupId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
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
        return { success: false, message: "Cannot leave: You are the only admin. Please assign another admin first." };
      }
    }

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

    return { success: true, message: "Successfully left the group" };
  } catch (error) {
    console.error("Error in leaveGroup:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from("group_members")
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data || [];
}


// Get public groups (not private)
// This is used to display groups that anyone can join without being invited
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

  const countMap = memberCounts?.reduce((acc, cur) => {
    acc[cur.group_id] = (acc[cur.group_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  return data.map((group) => ({
    ...group,
    member_count: countMap[group.id] ?? 0,
  }));
}



// Delete a group (admin)

export async function deleteOwnGroup(groupId: string): Promise< { success: boolean; message: string; data?: any; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    // Optional: Get group details before deletion (for confirmation/logging)
    const { data: groupData, error: groupError } = await supabase
      .from('study_groups')
      .select('id, name, created_by')
      .eq('id', groupId)
      .single();

    if (groupError) {
      return {
        success: false,
        message: 'Group not found or access denied',
        error: groupError.message
      };
    }

    // Verify user is the creator (optional check, RLS will handle this too)
    if (groupData.created_by !== user.id) {
      return {
        success: false,
        message: 'You can only delete groups you created'
      };
    }

    // Delete the group - RLS policy will handle permission check
    // CASCADE DELETE will automatically remove group_members
    const { error: deleteError } = await supabase
      .from('study_groups')
      .delete()
      .eq('id', groupId);

    if (deleteError) {
      return {
        success: false,
        message: 'Failed to delete group',
        error: deleteError.message
      };
    }

    return {
      success: true,
      message: `Group "${groupData.name}" deleted successfully`,
      data: {
        deletedGroupId: groupId,
        deletedGroupName: groupData.name
      }
    };

  } catch (error) {
    console.error('Delete group error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : String(error)
    };
  }
}
// Get a particular group by its ID
export async function getGroupById(groupId: string): Promise<StudyGroup | null> {
  const { data: group, error } = await supabase
    .from("study_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) throw error;
  if (!group) return null;

  // Get member count
  const { data: memberCounts } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("group_id", groupId);

  const member_count = memberCounts ? memberCounts.length : 0;

  // Get current user's role in the group
  const { data: { user } } = await supabase.auth.getUser();
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

// Get groups where user is a member (not just creator)
export async function getGroupsWhereUserIsMember(): Promise<StudyGroup[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error("Not authenticated");

  // Get group memberships for user
  const { data: memberships, error: memberError } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", user.id);

  if (memberError) throw memberError;
  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.group_id);

  // Get group details
  const { data: groups, error: groupError } = await supabase
    .from("study_groups")
    .select("*")
    .in("id", groupIds);

  if (groupError) throw groupError;

  // Get member counts
  const { data: memberCounts } = await supabase
    .from("group_members")
    .select("group_id");

  const countMap = memberCounts?.reduce((acc, cur) => {
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

