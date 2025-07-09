import type {
  StudyGroup,
  GroupMember,
  CreateGroupData,
  UpdateGroupData,
} from "@/types/groups";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserGroups(): Promise<StudyGroup[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("study_groups")
    .select(
      `
      *,
      group_members!inner (
        role,
        user_id
      ),
      member_count:group_members(count)
    `
    )
    .eq("group_members.user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((group) => ({
    ...group,
    member_count: group.member_count?.[0]?.count || 0,
    user_role: group.group_members[0]?.role,
  }));
}

export async function createGroup(
  groupData: CreateGroupData
): Promise<StudyGroup> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Create the group
  const { data: group, error: groupError } = await supabase
    .from("study_groups")
    .insert({
      ...groupData,
      created_by: user.id,
    })
    .select()
    .single();

  if (groupError) throw groupError;

  // Add creator as admin member
  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "admin",
  });

  if (memberError) throw memberError;

  return { ...group, member_count: 1, user_role: "admin" };
}

export async function updateGroup(
  groupId: string,
  updates: UpdateGroupData
): Promise<void> {
  const { error } = await supabase
    .from("study_groups")
    .update(updates)
    .eq("id", groupId);

  if (error) throw error;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      *,
      profiles (
        username,
        full_name
      )
    `
    )
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function leaveGroup(groupId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  if (error) throw error;
}
