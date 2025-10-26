// services/supabase-invites.ts (UPDATED WITH NOTIFICATIONS)
import { supabase } from "./supabase";
import { sendInviteViaEmail } from "./email/invite";
import { NotificationTriggers } from "./notifications/trigger";

export class InvitesService {
  // ... (keep getNonMembers unchanged)

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

    if (options?.inviteeId && options?.email) {
      throw new Error("Provide only one of user ID or email, not both.");
    }

    // 1. Block if email belongs to a registered user
    if (options?.email) {
      const { data: existingUser, error: userCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", options.email)
        .maybeSingle();

      if (userCheckError) throw userCheckError;
      if (existingUser) {
        throw new Error(
          "This email already belongs to a registered user. Use 'Invite Users' instead."
        );
      }
    }

    // 2. Block if a pending invite already exists
    const { data: existingInvite, error: inviteCheckError } = await supabase
      .from("group_invites")
      .select("id, expires_at, status")
      .eq("group_id", groupId)
      .eq(
        options.inviteeId ? "invitee_id" : "email",
        options.inviteeId ?? options.email
      )
      .eq("status", "pending")
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (inviteCheckError) throw inviteCheckError;
    if (existingInvite) {
      throw new Error("An active invite already exists for this user/email.");
    }

    // Generate token
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
      console.error("Database error creating invite:", error);
      throw error;
    }

    let emailWarning: string | null = null;

    // Send email if this was email-based
    if (options?.email && options.groupName) {
      const appUrl = import.meta.env.VITE_APP_URL;
      const inviteLink = `${appUrl}/invites/${token}`;

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
        console.error("Failed to send invite email:", emailError);
        emailWarning = "Invite created, but email delivery failed.";
      }
    }

    // 🔥 TRIGGER NOTIFICATION (only for registered users, not emails)
    if (options?.inviteeId) {
      sendInviteNotification(
        groupId,
        options.inviteeId,
        user.id,
        token,
        options.groupName
      ).catch(err => {
        console.error('Failed to send invite notification:', err);
      });
    }

    return { invite, warning: emailWarning };
  }

  // ... (keep all other methods unchanged: getGroupInvites, getMyInvites, validateInvite, acceptInvite, declineInvite, revokeInvite, deleteInvite)

  static async getGroupInvites(groupId: string) {
    const { data, error } = await supabase
      .from("group_invites")
      .select(
        `
        *,
        invited_profile:profiles!group_invites_invitee_id_fkey(full_name, username, avatar_url),
        study_groups(name, subject, avatar_url)
      `
      )
      .eq("group_id", groupId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  static async getMyInvites() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw authError ?? new Error("Not authenticated");

    const { data: invites, error } = await supabase
      .from("group_invites")
      .select("*")
      .eq("invitee_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invites:", error);
      throw error;
    }

    if (invites && invites.length > 0) {
      const groupIds = invites.map(inv => inv.group_id);
      const { data: groups, error: groupError } = await supabase
        .from("study_groups")
        .select("id, name, avatar_url, subject")
        .in("id", groupIds);

      if (groupError) {
        console.error("Error fetching groups:", groupError);
        return invites;
      }

      const invitesWithGroups = invites.map(invite => ({
        ...invite,
        study_groups: groups?.find(g => g.id === invite.group_id) || null
      }));

      return invitesWithGroups;
    }

    return invites ?? [];
  }

  static async validateInvite(token: string) {
    const { data, error } = await supabase.rpc("validate_invite", {
      p_token: token,
    });
    if (error) throw error;
    return data;
  }

  static async acceptInvite(token: string) {
    const { data, error } = await supabase.rpc("accept_invite", {
      p_token: token,
    });
    if (error) throw error;
    return data;
  }

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

  static async revokeInvite(token: string) {
    const { data, error } = await supabase
      .from("group_invites")
      .update({ status: "revoked" })
      .eq("token", token)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteInvite(token: string) {
    const { data, error } = await supabase
      .from("group_invites")
      .update({ deleted_at: new Date().toISOString() })
      .eq("token", token)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getNonMembers(groupId: string) {
    const { data: members, error: memberError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (memberError) throw memberError;
    const memberIds = members?.map((m) => m.user_id) ?? [];

    const { data: invited, error: inviteError } = await supabase
      .from("group_invites")
      .select("invitee_id")
      .eq("group_id", groupId)
      .eq("status", "pending")
      .gte("expires_at", new Date().toISOString());

    if (inviteError) throw inviteError;
    const invitedIds = invited?.map((i) => i.invitee_id).filter(Boolean) ?? [];

    const excludeIds = [...memberIds, ...invitedIds];

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, email")
      .not(
        "id",
        "in",
        excludeIds.length ? `(${excludeIds.join(",")})` : "(NULL)"
      );

    if (profileError) throw profileError;
    return profiles ?? [];
  }
}

// 🔥 NEW: Send notification for group invite (registered users only)
async function sendInviteNotification(
  groupId: string,
  inviteeId: string,
  inviterId: string,
  inviteToken: string,
  groupName?: string
) {
  try {
    // Get inviter profile
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', inviterId)
      .single();

    // Get group details if not provided
    let finalGroupName = groupName;
    let groupAvatar: string | undefined;

    if (!finalGroupName) {
      const { data: group } = await supabase
        .from('study_groups')
        .select('name, avatar_url')
        .eq('id', groupId)
        .single();

      finalGroupName = group?.name || 'a group';
      groupAvatar = group?.avatar_url;
    }

    await NotificationTriggers.notifyGroupInvite(
      inviteeId,
      inviterId,
      {
        groupId,
        groupName: finalGroupName,
        groupAvatar,
        inviterName: inviterProfile?.full_name || 'Someone',
        inviterAvatar: inviterProfile?.avatar_url,
        inviteToken,
      }
    );
  } catch (error) {
    console.error('Error in sendInviteNotification:', error);
  }
}