export interface StudyGroup {
  id: string
  name: string
  subject: string | null
  description: string | null
  created_by: string
  is_private: boolean
  created_at: string
  member_count?: number
  user_role?: "member" | "admin"
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: "member" | "admin"
  joined_at: string
  profiles?: {
    username: string | null
    full_name: string | null
  }
}

export interface CreateGroupData {
  name: string
  subject?: string
  description?: string
  is_private: boolean
}

export interface UpdateGroupData {
  name?: string
  subject?: string
  description?: string
  is_private?: boolean
}
