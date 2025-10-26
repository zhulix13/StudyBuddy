// services/notifications/triggers.ts
import NotificationsService from '@/services/supabase-notifications';
import type { NotificationMetadata } from '@/types/notifications';
import { supabase } from '../supabase';
/**
 * Centralized notification triggers
 * Import and use these in your existing services
 */
export class NotificationTriggers {
  
  // 🔹 SOCIAL NOTIFICATIONS
  
  static async notifyNoteLiked(
    noteOwnerId: string,
    actorId: string,
    metadata: {
      noteId: string;
      noteTitle: string;
      actorName: string;
      actorAvatar?: string;
    }
  ) {
    // Don't notify if user liked their own note
    if (noteOwnerId === actorId) return;
    
    await NotificationsService.createNotification(
      noteOwnerId,
      'note_liked',
      {
        actor_id: actorId,
        actor_name: metadata.actorName,
        actor_avatar: metadata.actorAvatar,
        target_id: metadata.noteId,
        target_type: 'note',
        target_title: metadata.noteTitle,
      },
      {
        priority: 'low',
        groupKey: `note-like-${metadata.noteId}`, // Batch multiple likes
      }
    );
  }

    static async notifyCommentLiked(
    commentOwnerId: string,
    actorId: string,
    metadata: {
      commentId: string;
      noteId: string;
      commentPreview: string;
      noteTitle?: string;
      actorName: string;
      actorAvatar?: string;
    }
  ) {
    // Don't notify if user liked their own comment
    if (commentOwnerId === actorId) return;
    
    await NotificationsService.createNotification(
      commentOwnerId,
      'comment_liked',
      {
        actor_id: actorId,
        actor_name: metadata.actorName,
        actor_avatar: metadata.actorAvatar,
        target_id: metadata.commentId,
        target_type: 'comment',
        target_title: metadata.commentPreview,
        note_id: metadata.noteId, // To link back to the note
        note_title: metadata.noteTitle,
      },
      {
        priority: 'low',
        groupKey: `comment-like-${metadata.commentId}`, // Batch multiple likes
      }
    );
  }
  
  static async notifyNoteCommented(
    noteOwnerId: string,
    actorId: string,
    metadata: {
      noteId: string;
      noteTitle: string;
      commentId: string;
      commentPreview: string;
      actorName: string;
      actorAvatar?: string;
    }
  ) {
    if (noteOwnerId === actorId) return;
    
    await NotificationsService.createNotification(
      noteOwnerId,
      'note_commented',
      {
        actor_id: actorId,
        actor_name: metadata.actorName,
        actor_avatar: metadata.actorAvatar,
        target_id: metadata.noteId,
        target_type: 'note',
        target_title: metadata.noteTitle,
        preview_text: metadata.commentPreview,
      },
      {
        priority: 'normal',
      }
    );
  }
  
  static async notifyCommentReplied(
    commentOwnerId: string,
    actorId: string,
    metadata: {
      noteId: string;
      commentId: string;
      replyPreview: string;
      actorName: string;
      actorAvatar?: string;
    }
  ) {
    if (commentOwnerId === actorId) return;
    
    await NotificationsService.createNotification(
      commentOwnerId,
      'comment_replied',
      {
        actor_id: actorId,
        actor_name: metadata.actorName,
        actor_avatar: metadata.actorAvatar,
        target_id: metadata.commentId,
        target_type: 'comment',
        preview_text: metadata.replyPreview,
      },
      {
        priority: 'normal',
      }
    );
  }
  
  static async notifyMessageReplied(
    messageOwnerId: string,
    actorId: string,
    metadata: {
      groupId: string;
      groupName: string;
      messageId: string;
      replyPreview: string;
      actorName: string;
      actorAvatar?: string;
    }
  ) {
    if (messageOwnerId === actorId) return;
    
    await NotificationsService.createNotification(
      messageOwnerId,
      'message_replied',
      {
        actor_id: actorId,
        actor_name: metadata.actorName,
        actor_avatar: metadata.actorAvatar,
        group_id: metadata.groupId,
        group_name: metadata.groupName,
        target_id: metadata.messageId,
        target_type: 'message',
        preview_text: metadata.replyPreview,
      },
      {
        priority: 'normal',
      }
    );
  }
  
  // 🔹 GROUP NOTIFICATIONS
  
  static async notifyGroupJoined(
    userId: string,
    metadata: {
      groupId: string;
      groupName: string;
      groupAvatar?: string;
    }
  ) {
    await NotificationsService.createNotification(
      userId,
      'group_joined',
      {
        group_id: metadata.groupId,
        group_name: metadata.groupName,
      },
      {
        priority: 'normal',
      }
    );
  }
  
  static async notifyGroupLeft(
    userId: string,
    metadata: {
      groupId: string;
      groupName: string;
      isPublic: boolean;
    }
  ) {
    await NotificationsService.createNotification(
      userId,
      'group_left',
      {
        group_id: metadata.groupId,
        group_name: metadata.groupName,
        is_public: metadata.isPublic,
      },
      {
        priority: 'low',
      }
    );
  }
  
  static async notifyMemberJoined(
    adminUserIds: string[], // Notify admins only
    actorId: string,
    metadata: {
      groupId: string;
      groupName: string;
      memberName: string;
      memberAvatar?: string;
    }
  ) {
    // Filter out the actor from admin list
    const recipientIds = adminUserIds.filter(id => id !== actorId);
    if (recipientIds.length === 0) return;
    
    await NotificationsService.createNotification(
      recipientIds,
      'member_joined',
      {
        actor_id: actorId,
        actor_name: metadata.memberName,
        actor_avatar: metadata.memberAvatar,
        group_id: metadata.groupId,
        group_name: metadata.groupName,
      },
      {
        priority: 'low',
        groupKey: `member-join-${metadata.groupId}`, // Batch multiple joins
      }
    );
  }
  
  static async notifyGroupInvite(
    inviteeId: string,
    inviterId: string,
    metadata: {
      groupId: string;
      groupName?: string;
      groupAvatar?: string;
      inviterName: string;
      inviterAvatar?: string;
      inviteToken: string;
    }
  ) {
    await NotificationsService.createNotification(
      inviteeId,
      'group_invited',
      {
        actor_id: inviterId,
        actor_name: metadata.inviterName,
        actor_avatar: metadata.inviterAvatar,
        group_id: metadata.groupId,
        group_name: metadata.groupName,
        invite_token: metadata.inviteToken,
      },
      {
        priority: 'high',
      }
    );
  }
  
  // 🔹 CONTENT NOTIFICATIONS
  
  static async notifyNewNote(
    groupMemberIds: string[],
    actorId: string,
    metadata: {
      groupId: string;
      groupName: string;
      noteId: string;
      noteTitle: string;
      notePreview?: string;
      actorName: string;
      actorAvatar?: string;
    }
  ) {
    // Don't notify the creator
    const recipientIds = groupMemberIds.filter(id => id !== actorId);
    if (recipientIds.length === 0) return;
    
    await NotificationsService.createNotification(
      recipientIds,
      'note_created',
      {
        actor_id: actorId,
        actor_name: metadata.actorName,
        actor_avatar: metadata.actorAvatar,
        group_id: metadata.groupId,
        group_name: metadata.groupName,
        target_id: metadata.noteId,
        target_type: 'note',
        target_title: metadata.noteTitle,
        preview_text: metadata.notePreview,
      },
      {
        priority: 'low',
        groupKey: `new-note-${metadata.groupId}`, // Batch multiple notes
      }
    );
  }
  
  static async notifyNoteShared(
    groupMemberIds: string[],
    actorId: string,
    metadata: {
      groupId: string;
      groupName: string;
      noteId: string;
      noteTitle?: string;
      actorName: string;
      actorAvatar?: string;
    }
  ) {
    const recipientIds = groupMemberIds.filter(id => id !== actorId);
    if (recipientIds.length === 0) return;
    
    await NotificationsService.createNotification(
      recipientIds,
      'note_shared',
      {
        actor_id: actorId,
        actor_name: metadata.actorName,
        actor_avatar: metadata.actorAvatar,
        group_id: metadata.groupId,
        group_name: metadata.groupName,
        target_id: metadata.noteId,
        target_type: 'note',
        target_title: metadata.noteTitle,
      },
      {
        priority: 'low',
      }
    );
  }

  static async notifyMessageSent(
    groupMemberIds: string[],
    actorId: string,
    metadata: {
      groupId: string;
      groupName: string;
      messageId: string;
      messagePreview?: string;
      actorName: string;
      actorAvatar?: string;
    }
  ) {
    const recipientIds = groupMemberIds.filter(id => id !== actorId);
    if (recipientIds.length === 0) return;  
    await NotificationsService.createNotification(
      recipientIds,
      'message_sent',
      {
        actor_id: actorId,
        actor_name: metadata.actorName,
        actor_avatar: metadata.actorAvatar,

        group_id: metadata.groupId,
        group_name: metadata.groupName,
        target_id: metadata.messageId,
        target_type: 'message',
        preview_text: metadata.messagePreview,
      },
      {
        priority: 'low',
      }
    );
  }
  
  // 🔹 SYSTEM NOTIFICATIONS
  
  static async sendWelcomeNotification(userId: string) {
    await NotificationsService.createNotification(
      userId,
      'welcome',
      {},
      {
        priority: 'normal',
      }
    );
  }
  
  static async sendSystemAnnouncement(
    userIds: string[],
    metadata: {
      title: string;
      message: string;
      actionUrl?: string;
    }
  ) {
    await NotificationsService.createNotification(
      userIds,
      'system_announcement',
      {
        target_title: metadata.title,
        preview_text: metadata.message,
      },
      {
        priority: 'high',
      }
    );
  }

   // 🔥 NEW: Helper to safely get profile data
  private static async getProfileData(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    
    return {
      name: data?.full_name || 'Someone',
      avatar: data?.avatar_url,
    };
  }
}