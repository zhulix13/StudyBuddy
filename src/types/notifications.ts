// types/notifications.ts
export type NotificationCategory = 
  | 'system'      // Welcome messages, app updates
  | 'social'      // Likes, comments, replies
  | 'group'       // Group activities, joins, leaves
  | 'invite'      // Group invitations
  | 'content';    // New notes, shared content

export type NotificationAction =
  // Social
  | 'note_liked'
  | 'note_commented'
  | 'comment_replied'
  | 'message_replied'
  | 'comment_liked'
  
  // Group
  | 'group_joined'
  | 'group_left'
  | 'member_joined'
  | 'group_invited'
  
  // Content
  | 'note_created'
  | 'note_shared'
  | 'message_sent'
  
  // System
  | 'welcome'
  | 'system_announcement';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface NotificationMetadata {
  // Actor (who performed the action)
  actor_id?: string;
  actor_name?: string;
  actor_avatar?: string;
  
  // Target (what was acted upon)
  target_id?: string;
  target_type?: 'note' | 'comment' | 'message' | 'group';
  target_title?: string;
  
  // Context
  group_id?: string;
  group_name?: string;
  
  // Additional data
  preview_text?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  user_id: string;
  category: NotificationCategory;
  action: NotificationAction;
  priority: NotificationPriority;
  
  title: string;
  message: string;
  metadata: NotificationMetadata;
  
  read: boolean;
  archived: boolean;
  
  // Navigation
  action_url?: string;
  
  // Grouping (for batching similar notifications)
  group_key?: string;
  
  created_at: string;
  read_at?: string;
}