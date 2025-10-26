// services/realtime/notifications-realtime.ts
import { supabase } from '../supabase';
import type { Notification } from '@/types/notifications';

export type NotificationRealtimeEvent = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  notification: Notification;
};

/**
 * Subscribe to real-time notification changes for a specific user
 * Handles high-priority notifications with immediate browser notifications
 */
export function subscribeToNotifications(
  userId: string,
  onEvent: (event: NotificationRealtimeEvent) => void,
  options?: {
    enableBrowserNotifications?: boolean;
    priorityFilter?: 'high' | 'normal' | 'low' | 'all';
  }
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const notification = payload.new as Notification;
        const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
        
        // Filter by priority if specified
        if (options?.priorityFilter && options.priorityFilter !== 'all') {
          if (notification.priority !== options.priorityFilter) {
            return;
          }
        }
        
        // Trigger callback
        onEvent({
          type: eventType,
          notification: eventType === 'DELETE' ? (payload.old as Notification) : notification,
        });
        
        // Handle browser notifications for high-priority items
        if (
          options?.enableBrowserNotifications && 
          eventType === 'INSERT' && 
          notification.priority === 'high' &&
          'Notification' in window
        ) {
          sendBrowserNotification(notification);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Send browser notification for high-priority notifications
 */
async function sendBrowserNotification(notification: Notification) {
  // Check permission
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  
  if (Notification.permission === 'granted') {
    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico', // Your app icon
      badge: '/badge-icon.png', // Optional badge
      tag: notification.id, // Prevent duplicates
      requireInteraction: notification.priority === 'high', // Stay on screen for high priority
    });
    
    // Handle click - navigate to the notification target
    browserNotif.onclick = () => {
      window.focus();
      if (notification.action_url) {
        window.location.href = notification.action_url;
      }
      browserNotif.close();
    };
  }
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return 'denied';
  }
  
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  
  return Notification.permission;
}