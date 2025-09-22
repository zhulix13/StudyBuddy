export type GroupInviteStatus = "pending" | "accepted" | "declined" | "expired";

export interface GroupInvite {
  id: string;
  group_id: string;
  invited_by: string;
  invitee_id?: string | null;  // optional FK to profiles
  email?: string | null;       // optional raw email
  token: string;
  status: GroupInviteStatus;
  created_at: string;          // ISO string timestamp
  expires_at: string;          // ISO string timestamp
}