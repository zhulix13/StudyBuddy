// services/invitesService.ts
import { supabase } from "./supabase";
import { sendInviteViaEmail } from "./email/invite";

export class InvitesService {
  // ✅ Get all profiles not already in group OR already invited
  static async getNonMembers(groupId: string) {
    // 1. Get current members
    const { data: members, error: memberError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (memberError) throw memberError;
    const memberIds = members?.map((m) => m.user_id) ?? [];

    // 2. Get users with pending invites (not expired)
    const { data: invited, error: inviteError } = await supabase
      .from("group_invites")
      .select("invitee_id")
      .eq("group_id", groupId)
      .eq("status", "pending")
      .gte("expires_at", new Date().toISOString());

    if (inviteError) throw inviteError;
    const invitedIds = invited?.map((i) => i.invitee_id).filter(Boolean) ?? [];

    // 3. Exclude members + pending invitees
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

  // Updated createInvite method
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
      .eq("status", "pending") // 👈 check only active/pending invites
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
      const inviteLink = `${
        appUrl
      }/invites/${token}`;

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

    return { invite, warning: emailWarning };
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
    const { data, error } = await supabase.rpc("validate_invite", {
      p_token: token,
    });
    if (error) throw error;
    return data;
  }

  // 🔹 Accept invite (RPC)
  static async acceptInvite(token: string) {
    const { data, error } = await supabase.rpc("accept_invite", {
      p_token: token,
    });
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
}
