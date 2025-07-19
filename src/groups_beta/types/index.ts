export interface Group {
  id: string
  name: string
  description: string
  avatar?: string
  lastActivity?: string
  unreadCount?: number
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  author: string
  tags: string[]
}

export interface Message {
  id: string
  content: string
  author: string
  timestamp: string
  isOwn: boolean
}

export interface NewNote {
  title: string
  content: string
  tags: string
}