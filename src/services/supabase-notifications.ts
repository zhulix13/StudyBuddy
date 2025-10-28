// services/supabase-notifications.ts
import { supabase } from "./supabase";
import type { Notification, NotificationAction, NotificationCategory, NotificationMetadata } from "@/types/notifications";

class NotificationsService {
  // 🔹 Create a notification
   
  static async createNotification(
    userId: string | string[],
    action: NotificationAction,
    metadata: NotificationMetadata,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      groupKey?: string;
    }
  ): Promise<void> {
    const userIds = Array.isArray(userId) ? userId : [userId];
    
    // Check preferences before creating
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .in('user_id', userIds);
    
    const filteredUserIds = this.filterByPreferences(userIds, action, preferences || []);
    
    if (filteredUserIds.length === 0) return;
    
    // Generate notification content
    const { title, message, category, actionUrl } = this.generateContent(action, metadata);
    
    // Check for existing similar notifications (batching)
    const groupKey = options?.groupKey || this.generateGroupKey(action, metadata);
    
    // 🔥 FIX: Only batch if groupKey is explicitly provided
    if (options?.groupKey) {
      const existing = await this.findSimilarNotifications(filteredUserIds, groupKey);
      if (existing.length > 0) {
        await this.batchNotifications(existing, metadata);
        return;
      }
    }
    
    // Create notifications
    const notifications = filteredUserIds.map(uid => ({
      user_id: uid,
      category,
      action,
      priority: options?.priority || 'normal',
      title,
      message,
      metadata,
      action_url: actionUrl,
      group_key: groupKey,
    }));
    
    const { error } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (error) throw error;
  }
  
  // 🔹 Get user notifications with pagination
  static async getNotifications(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      category?: NotificationCategory;
    }
  ) {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('archived', false)
      .order('created_at', { ascending: false });
    
    if (options?.unreadOnly) {
      query = query.eq('read', false);
    }
    
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { notifications: data as Notification[], total: count || 0 };
  }
  
  // 🔹 Mark as read
  static async markAsRead(notificationIds: string | string[]) {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .in('id', ids);
    
    if (error) throw error;
  }
  
  // 🔹 Mark all as read
  static async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
  }
  
  // 🔹 Archive notification
  static async archiveNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ archived: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  }
  
  // 🔹 Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
      .eq('archived', false);
    
    if (error) throw error;
    return count || 0;
  }
  
  // 🔹 Helper: Generate notification content

private static generateContent(
  action: NotificationAction,
  metadata: NotificationMetadata
): { title: string; message: string; category: NotificationCategory; actionUrl?: string } {
  const actorName = metadata.actor_name || 'Someone';
  const targetTitle = metadata.target_title || 'your content';
  const groupName = metadata.group_name || 'a group';
  
  const templates: Record<NotificationAction, { title: string; message: string; category: NotificationCategory; url?: string }> = {
    // Social - Note related (opens group with notes tab and specific note)
    note_liked: {
      title: 'New like',
      message: `${actorName} liked your note "${targetTitle}"`,
      category: 'social',
      url: `/groups/${metadata.group_id}?tab=notes&n=${metadata.target_id}&m=view`,
    },
    note_commented: {
      title: 'New comment',
      message: `${actorName} commented on "${targetTitle}"`,
      category: 'social',
      url: `/groups/${metadata.group_id}?tab=notes&n=${metadata.target_id}&m=view`,
    },
    comment_liked: {
      title: 'New like',
      message: `${actorName} liked your comment: "${targetTitle}"`,
      category: 'social',
      url: `/groups/${metadata.group_id}?tab=notes&n=${metadata.note_id}&m=view`,
    },
    comment_replied: {
      title: 'New reply',
      message: `${actorName} replied to your comment`,
      category: 'social',
      url: `/groups/${metadata.group_id}?tab=notes&n=${metadata.note_id}&m=view`,
    },
    
    // Social - Message related (opens group with chat tab)
    message_replied: {
      title: 'New reply',
      message: `${actorName} replied to your message in ${groupName}`,
      category: 'social',
      url: `/groups/${metadata.group_id}?tab=chat`,
    },
    
    // Group
    group_joined: {
      title: 'Welcome!',
      message: `You joined ${groupName}. Start collaborating!`,
      category: 'group',
      url: `/groups/${metadata.group_id}?tab=notes`,
    },
    group_left: {
      title: 'Group left',
      message: `You left ${groupName}. You can rejoin if it's public.`,
      category: 'group',
      url: `/groups`,
    },
    member_joined: {
      title: 'New member',
      message: `${actorName} joined ${groupName}`,
      category: 'group',
      url: `/groups/${metadata.group_id}?tab=notes`, // Can open members modal from here
    },
    group_invited: {
      title: 'Group invitation',
      message: `${actorName} invited you to join ${groupName}`,
      category: 'invite',
      url: `/dashboard/notifications`, // View invites in notifications page
    },
    
    // Content
    note_created: {
      title: 'New note',
      message: `${actorName} posted "${targetTitle}" in ${groupName}`,
      category: 'content',
      url: `/groups/${metadata.group_id}?tab=notes&n=${metadata.target_id}&m=view`,
    },
    note_shared: {
      title: 'Note shared',
      message: `${actorName} shared a note in ${groupName}`,
      category: 'content',
      url: `/groups/${metadata.group_id}?tab=chat`,
    },
    message_sent: {
      title: 'New message',
      message: `${actorName} sent a message in ${groupName}`,
      category: 'content',
      url: `/groups/${metadata.group_id}?tab=chat`,
    },
    
    // System
    welcome: {
      title: 'Welcome to StudyBuddy!',
      message: 'Join groups, share notes, and collaborate with peers.',
      category: 'system',
      url: '/groups',
    },
    system_announcement: {
      title: metadata.target_title || 'Announcement',
      message: metadata.preview_text || 'Check out what\'s new',
      category: 'system',
    },
  };
  
  const template = templates[action];
  return {
    title: template.title,
    message: template.message,
    category: template.category,
    actionUrl: template.url,
  };
}

  // 🔥 NEW: Get high-priority unread notifications
  static async getHighPriorityNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .eq('archived', false)
      .eq('priority', 'high')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data as Notification[];
  }
  
   // 🔹 Helper: Filter users by preferences
  private static filterByPreferences(
    userIds: string[],
    action: NotificationAction,
    preferences: any[]
  ): string[] {
    return userIds.filter(userId => {
      const pref = preferences.find(p => p.user_id === userId);
      if (!pref) return true; // Default: all enabled if no preferences set
      
      // Map actions to preference fields
      const actionPreferenceMap: Record<NotificationAction, keyof any> = {
        // Social
        note_liked: 'note_likes_enabled',
        note_commented: 'note_comments_enabled',
        comment_replied: 'note_comments_enabled',
        message_replied: 'message_replies_enabled',
        comment_liked: 'note_comments_enabled',
        
        // Group
        group_joined: 'group_enabled',
        group_left: 'group_enabled',
        member_joined: 'member_joins_enabled',
        group_invited: 'invite_enabled',
        
        // Content
        note_created: 'new_notes_enabled',
        note_shared: 'content_enabled',
        message_sent: 'content_enabled',
        
        // System - always enabled
        welcome: 'social_enabled', // dummy, will always be true
        system_announcement: 'social_enabled', // dummy
      };
      
      const prefField = actionPreferenceMap[action];
      
      // System notifications always go through
      if (action === 'welcome' || action === 'system_announcement') {
        return true;
      }
      
      // Check if preference field exists and is enabled
      return pref[prefField] !== false;
    });
  }
  
  // 🔹 Helper: Generate group key for batching
  private static generateGroupKey(action: NotificationAction, metadata: NotificationMetadata): string {
    // Create unique keys for different notification types
    switch (action) {
      case 'note_liked':
        return `note-like-${metadata.target_id}`;
      case 'note_commented':
        return `note-comment-${metadata.target_id}`;
      case 'member_joined':
        return `member-join-${metadata.group_id}`;
      case 'note_created':
        return `note-create-${metadata.group_id}`;
      default:
        return `${action}-${metadata.target_id || metadata.group_id || 'general'}`;
    }
  }
  
  // 🔹 Helper: Find similar recent notifications
  private static async findSimilarNotifications(userIds: string[], groupKey: string) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .in('user_id', userIds)
      .eq('group_key', groupKey)
      .gte('created_at', thirtyMinutesAgo)
      .eq('read', false); // 🔥 FIX: Only batch unread notifications
    
    return data || [];
  }
  
  // 🔹 Helper: Batch similar notifications
  private static async batchNotifications(existing: Notification[], newMetadata: NotificationMetadata) {
    const notification = existing[0];
    const currentCount = (notification.metadata.count || 1) + 1;
    
    const updatedMetadata = {
      ...notification.metadata,
      count: currentCount,
      latest_actor: newMetadata.actor_name,
      latest_at: new Date().toISOString(),
    };
    
    // 🔥 FIX: Better batched message formatting
    const baseMessage = notification.message.split(' ').slice(2).join(' ');
    const updatedMessage = currentCount === 2
      ? `${newMetadata.actor_name} and 1 other ${baseMessage}`
      : `${newMetadata.actor_name} and ${currentCount - 1} others ${baseMessage}`;
    
    await supabase
      .from('notifications')
      .update({
        message: updatedMessage,
        metadata: updatedMetadata,
        read: false,
        created_at: new Date().toISOString(), // 🔥 FIX: Update timestamp for sorting
      })
      .eq('id', notification.id);
  }
  }

export default NotificationsService;