import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import LikesService from '@/services/supabase-likes';

type TargetType = 'note' | 'comment';

// Query keys
export const likesKeys = {
  all: ['likes'] as const,
  byTarget: (targetId: string, targetType: TargetType) => 
    [...likesKeys.all, 'target', targetId, targetType] as const,
  count: (targetId: string, targetType: TargetType) => 
    [...likesKeys.byTarget(targetId, targetType), 'count'] as const,
  userStatus: (targetId: string, targetType: TargetType, userId?: string) => 
    [...likesKeys.byTarget(targetId, targetType), 'user-status', userId] as const,
  withUsers: (targetId: string, targetType: TargetType) => 
    [...likesKeys.byTarget(targetId, targetType), 'with-users'] as const,
  bulk: (targets: Array<{id: string, type: TargetType}>) => 
    [...likesKeys.all, 'bulk', targets] as const,
};

// Hook to get likes count for a target
export const useLikesCount = (targetId: string, targetType: TargetType) => {
  return useQuery({
    queryKey: likesKeys.count(targetId, targetType),
    queryFn: () => LikesService.getLikesCount(targetId, targetType),
    enabled: !!targetId && !!targetType,
  });
};

// Hook to check if current user liked a target
export const useIsLikedByUser = (targetId: string, targetType: TargetType, userId?: string) => {
  return useQuery({
    queryKey: likesKeys.userStatus(targetId, targetType, userId),
    queryFn: () => LikesService.isLikedByUser(targetId, targetType, userId),
    enabled: !!targetId && !!targetType,
  });
};

// Hook to get likes with user info
export const useLikesWithUsers = (targetId: string, targetType: TargetType) => {
  return useQuery({
    queryKey: likesKeys.withUsers(targetId, targetType),
    queryFn: () => LikesService.getLikesWithUsers(targetId, targetType),
    enabled: !!targetId && !!targetType,
  });
};

// Hook to get bulk likes data for multiple targets
export const useBulkLikesData = (targets: Array<{id: string, type: TargetType}>) => {
  return useQuery({
    queryKey: likesKeys.bulk(targets),
    queryFn: () => LikesService.getBulkLikesData(targets),
    enabled: targets.length > 0,
  });
};

// Hook to toggle like/unlike
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId, targetType }: { 
      targetId: string; 
      targetType: TargetType;
    }) =>
      LikesService.toggleLike(targetId, targetType),
    onSuccess: (result, { targetId, targetType }) => {
      // Invalidate count query
      queryClient.invalidateQueries({
        queryKey: likesKeys.count(targetId, targetType),
      });
      
      // Invalidate user status query
      queryClient.invalidateQueries({
        queryKey: likesKeys.userStatus(targetId, targetType),
      });
      
      // Invalidate likes with users query
      queryClient.invalidateQueries({
        queryKey: likesKeys.withUsers(targetId, targetType),
      });
      
      // Invalidate bulk queries that might include this target
      queryClient.invalidateQueries({
        queryKey: likesKeys.all,
        predicate: (query) => {
          return query.queryKey.includes('bulk');
        },
      });

      // Optimistically update count cache
      queryClient.setQueryData(
        likesKeys.userStatus(targetId, targetType),
        result.liked
      );
    },
  });
};

// Combined hook for like button (count + user status + toggle)
export const useLikeButton = (targetId: string, targetType: TargetType) => {
  const { data: count = 0, isLoading: countLoading } = useLikesCount(targetId, targetType);
  const { data: isLiked = false, isLoading: statusLoading } = useIsLikedByUser(targetId, targetType);
  const toggleLike = useToggleLike();

  const handleToggle = () => {
    toggleLike.mutate({ targetId, targetType });
  };

  return {
    count,
    isLiked,
    isLoading: countLoading || statusLoading,
    isToggling: toggleLike.isPending,
    toggle: handleToggle,
  };
};