

export interface Comment {
  id: string
  note_id: string
  parent_comment_id?: string
  author_id : string,
  content: string
  author?: {
    id: string
    name: string
    avatar_url?: string
  }
  created_at: string
  updated_at?: string
  is_deleted?: boolean
  depth: number
  likes?: number
  isLiked?: boolean
}
