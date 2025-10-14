export type GroupInviteStatus = "pending" | "accepted" | "declined" | "expired" | "revoked";

  export interface GroupInvite {
    id: string
    group_id: string
    invited_by: string
    invitee_id?: string | null
    email?: string | null
    token: string
    status: GroupInviteStatus
    created_at: string
    expires_at: string
    deleted_at: string,
    invited_profile?: {
      full_name: string
      username: string
      avatar_url?: string
    }
    study_groups?: {
      name: string
      subject: string
      avatar_url?: string
    }
  }
