// hooks/useNotifications.ts (ENHANCED VERSION)
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import NotificationsService from '@/services/supabase-notifications';
import { useAuth } from '@/context/Authcontext';
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { subscribeToNotifications, requestNotificationPermission } from '@/services/realtime/notifications-realtime';
import type { NotificationCategory } from '@/types/notifications';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: any) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// 🔹 Get notifications with infinite scroll + realtime
export const useNotifications = (options?: {
  unreadOnly?: boolean;
  category?: NotificationCategory;
  enableRealtime?: boolean;
  enableBrowserNotifications?: boolean;
}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const enableRealtime = options?.enableRealtime ?? true;
  const enableBrowserNotifications = options?.enableBrowserNotifications ?? false;
  
  const query = useInfiniteQuery({
    queryKey: notificationKeys.list(options),
    queryFn: ({ pageParam = 0 }) => {
      if (!profile) throw new Error("Not authenticated");
      return NotificationsService.getNotifications(profile.id, {
        limit: 20,
        offset: pageParam,
        unreadOnly: options?.unreadOnly,
        category: options?.category,
      });
    },
    enabled: !!profile,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((acc, page) => acc + page.notifications.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
  });
  
  // 🔥 REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!profile || !enableRealtime) return;
    
    const unsubscribe = subscribeToNotifications(
      profile.id,
      (event) => {
        // Invalidate queries to refetch
        queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
        queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        
        // Optionally: Optimistically update the cache for instant UI updates
        if (event.type === 'INSERT') {
          queryClient.setQueryData(notificationKeys.list(options), (old: any) => {
            if (!old) return old;
            
            // Add new notification to the first page
            const pages = [...old.pages];
            pages[0] = {
              ...pages[0],
              notifications: [event.notification, ...pages[0].notifications],
              total: pages[0].total + 1,
            };
            
            return { ...old, pages };
          });
        }
      },
      {
        enableBrowserNotifications,
        priorityFilter: 'all',
      }
    );
    
    return unsubscribe;
  }, [profile, enableRealtime, enableBrowserNotifications, queryClient, options]);
  
  return query;
};

// 🔹 Get unread count with realtime (enhanced)
export const useUnreadCount = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => {
      if (!profile) throw new Error("Not authenticated");
      return NotificationsService.getUnreadCount(profile.id);
    },
    enabled: !!profile,
    refetchInterval: 30000, // Backup polling every 30s
  });
  
  // Realtime subscription for instant updates
  useEffect(() => {
    if (!profile) return;
    
    const channel = supabase
      .channel('notifications-count-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          // Instantly refetch count
          queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, queryClient]);
  
  return query;
};

// 🔹 Mark as read (with optimistic updates)
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: (notificationIds: string | string[]) =>
      NotificationsService.markAsRead(notificationIds),
    onMutate: async (notificationIds) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      // Optimistically update unread count
      queryClient.setQueryData(notificationKeys.unreadCount(), (old: number | undefined) => {
        return Math.max(0, (old || 0) - ids.length);
      });
      
      // Optimistically update notification list
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (old: any) => {
        if (!old) return old;
        
        const pages = old.pages.map((page: any) => ({
          ...page,
          notifications: page.notifications.map((notif: any) =>
            ids.includes(notif.id) ? { ...notif, read: true, read_at: new Date().toISOString() } : notif
          ),
        }));
        
        return { ...old, pages };
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// 🔹 Mark all as read
export const useMarkAllAsRead = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      if (!profile) throw new Error("Not authenticated");
      return NotificationsService.markAllAsRead(profile.id);
    },
    onMutate: async () => {
      // Optimistically set count to 0
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
      
      // Mark all as read in cache
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (old: any) => {
        if (!old) return old;
        
        const pages = old.pages.map((page: any) => ({
          ...page,
          notifications: page.notifications.map((notif: any) => ({
            ...notif,
            read: true,
            read_at: new Date().toISOString(),
          })),
        }));
        
        return { ...old, pages };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

// 🔹 Archive notification
export const useArchiveNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationsService.archiveNotification(notificationId),
    onMutate: async (notificationId) => {
      // Remove from cache immediately
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (old: any) => {
        if (!old) return old;
        
        const pages = old.pages.map((page: any) => ({
          ...page,
          notifications: page.notifications.filter((notif: any) => notif.id !== notificationId),
          total: page.total - 1,
        }));
        
        return { ...old, pages };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

// 🔹 Request browser notification permission
export const useRequestNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  
  const request = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  };
  
  return { permission, request };
};

// 🔹 Get high-priority notifications (for prominent display)
export const useHighPriorityNotifications = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: [...notificationKeys.all, 'high-priority'],
    queryFn: () => {
      if (!profile) throw new Error("Not authenticated");
      return NotificationsService.getHighPriorityNotifications(profile.id);
    },
    enabled: !!profile,
    refetchInterval: 10000, // Check every 10s for high priority
  });
  
  // Realtime for instant high-priority notifications
  useEffect(() => {
    if (!profile) return;
    
    const unsubscribe = subscribeToNotifications(
      profile.id,
      () => {
        queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'high-priority'] });
      },
      {
        enableBrowserNotifications: true,
        priorityFilter: 'high', // Only listen to high priority
      }
    );
    
    return unsubscribe;
  }, [profile, queryClient]);
  
  return query;
};