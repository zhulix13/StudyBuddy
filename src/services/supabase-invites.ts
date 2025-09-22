// services/invitesService.ts
import { supabase } from "./supabase";
import { sendInviteViaEmail } from "./email/invite";

export class InvitesService {
  // 🔹 Get all profiles not already in the group
  static async getNonMembers(groupId: string) {
    const { data: members, error: memberError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (memberError) throw memberError;
    const memberIds = members?.map((m) => m.user_id) ?? [];

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .not(
        "id",
        "in",
        memberIds.length ? `(${memberIds.join(",")})` : "(NULL)"
      );

    if (profileError) throw profileError;
    return profiles ?? [];
  }

// Updated createInvite method with debugging
static async createInvite(
  groupId: string,
  options: {
    inviteeId?: string;
    email?: string;
    expiresAt?: string;
    groupName?: string;
    inviterName?: string;
  }
) {


  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error("Not authenticated");

  if (!options?.inviteeId && !options?.email) {
    throw new Error("Invite must target either a user or an email");
  }

  const token = crypto.randomUUID();

  const { data: invite, error } = await supabase
    .from("group_invites")
    .insert({
      group_id: groupId,
      invited_by: user.id,
      invitee_id: options?.inviteeId ?? null,
      email: options?.email ?? null,
      token,
      expires_at:
        options?.expiresAt ??
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    console.error('Database error creating invite:', error);
    throw error;
  }

 

  // Send email if this was email-based
  if (options?.email && options.groupName) {
    // Check if VITE_APP_URL is defined
    const appUrl = import.meta.env.VITE_APP_URL;

    
    
    const inviteLink = `${appUrl || 'http://localhost:5173'}/invites/${token}`;
    
    const emailPayload = {
      to: options.email,
      groupName: options.groupName,
      inviterName: options.inviterName ?? user.email ?? "Someone",
      inviteLink,
      expiresAt: invite.expires_at,
    };
    

    
    try {
      await sendInviteViaEmail(emailPayload);
      
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
      // Don't throw here - the invite was created successfully
      // You might want to show a warning to the user instead
    }
  }

  return invite;
}

  // 🔹 Get all invites for a group (admin only)
  static async getGroupInvites(groupId: string) {
    const { data, error } = await supabase
      .from("group_invites")
      .select(
        `
    *,
    invited_profile:profiles!fk_invited_by_profiles(full_name, username, avatar_url),
    study_groups(name, subject, avatar_url)
  `
      )
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  // 🔹 Get all invites for the logged-in user
  static async getMyInvites() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw authError ?? new Error("Not authenticated");

    const { data: invites, error } = await supabase
      .from("group_invites")
      .select(
        `
        *,
        study_groups(name, avatar, subject)
      `
      )
      .or(`invitee_id.eq.${user.id},email.eq.${user.email ?? ""}`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return invites ?? [];
  }

  // 🔹 Validate invite (RPC)
  static async validateInvite(token: string) {
    const { data, error } = await supabase.rpc("validate_invite", { token });
    if (error) throw error;
    return data;
  }

  // 🔹 Accept invite (RPC)
  static async acceptInvite(token: string) {
    const { data, error } = await supabase.rpc("accept_invite", { token });
    if (error) throw error;
    return data;
  }

  // 🔹 Decline invite
  static async declineInvite(token: string) {
    const { data, error } = await supabase
      .from("group_invites")
      .update({ status: "declined" })
      .eq("token", token)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
