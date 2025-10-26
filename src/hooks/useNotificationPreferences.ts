// hooks/useNotificationPreferences.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NotificationPreferencesService from '@/services/notification-preferences';
import { useAuth } from '@/context/Authcontext';

export const notificationPreferencesKeys = {
  all: ['notification-preferences'] as const,
  byUser: (userId: string) => [...notificationPreferencesKeys.all, userId] as const,
};

export const useNotificationPreferences = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: notificationPreferencesKeys.byUser(profile?.id || ''),
    queryFn: () => {
      if (!profile) throw new Error("Not authenticated");
      return NotificationPreferencesService.getPreferences(profile.id);
    },
    enabled: !!profile,
  });
};

export const useUpdateNotificationPreferences = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Parameters<typeof NotificationPreferencesService.updatePreferences>[1]) => {
      if (!profile) throw new Error("Not authenticated");
      return NotificationPreferencesService.updatePreferences(profile.id, updates);
    },
    onSuccess: () => {
      if (profile) {
        queryClient.invalidateQueries({ 
          queryKey: notificationPreferencesKeys.byUser(profile.id) 
        });
      }
    },
  });
};