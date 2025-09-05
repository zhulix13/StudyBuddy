import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LikesService from "@/services/supabase-likes";
import { subscribeToLikes } from "@/services/realtime/likes-realtime";

type TargetType = "note" | "comment";

// Query keys
export const likesKeys = {
  all: ["likes"] as const,
  byTarget: (targetId: string, targetType: TargetType) =>
    [...likesKeys.all, "target", targetId, targetType] as const,
  count: (targetId: string, targetType: TargetType) =>
    [...likesKeys.byTarget(targetId, targetType), "count"] as const,
  userStatus: (targetId: string, targetType: TargetType, userId?: string) =>
    [...likesKeys.byTarget(targetId, targetType), "user-status", userId] as const,
  withUsers: (targetId: string, targetType: TargetType) =>
    [...likesKeys.byTarget(targetId, targetType), "with-users"] as const,
  bulk: (targets: Array<{ id: string; type: TargetType }>) =>
    [...likesKeys.all, "bulk", targets] as const,
};

// Hook to get likes count for a target (with realtime)
export const useLikesCount = (targetId: string, targetType: TargetType) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: likesKeys.count(targetId, targetType),
    queryFn: () => LikesService.getLikesCount(targetId, targetType),
    enabled: !!targetId && !!targetType,
  });

  useEffect(() => {
    if (!targetId) return;

    const unsubscribe = subscribeToLikes(targetId, targetType, () => {
      queryClient.invalidateQueries({
        queryKey: likesKeys.count(targetId, targetType),
      });
    });

    return () => unsubscribe();
  }, [targetId, targetType, queryClient]);

  return query;
};

// Hook to check if current user liked a target (with realtime)
export const useIsLikedByUser = (
  targetId: string,
  targetType: TargetType,
  userId?: string
) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: likesKeys.userStatus(targetId, targetType, userId),
    queryFn: () => LikesService.isLikedByUser(targetId, targetType, userId),
    enabled: !!targetId && !!targetType,
  });

  useEffect(() => {
    if (!targetId) return;

    const unsubscribe = subscribeToLikes(targetId, targetType, () => {
      queryClient.invalidateQueries({
        queryKey: likesKeys.userStatus(targetId, targetType, userId),
      });
    });

    return () => unsubscribe();
  }, [targetId, targetType, userId, queryClient]);

  return query;
};

// Hook to get likes with user info (with realtime)
export const useLikesWithUsers = (targetId: string, targetType: TargetType) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: likesKeys.withUsers(targetId, targetType),
    queryFn: () => LikesService.getLikesWithUsers(targetId, targetType),
    enabled: !!targetId && !!targetType,
  });

  useEffect(() => {
    if (!targetId) return;

    const unsubscribe = subscribeToLikes(targetId, targetType, () => {
      queryClient.invalidateQueries({
        queryKey: likesKeys.withUsers(targetId, targetType),
      });
    });

    return () => unsubscribe();
  }, [targetId, targetType, queryClient]);

  return query;
};

// Hook to get bulk likes data for multiple targets
export const useBulkLikesData = (targets: Array<{ id: string; type: TargetType }>) => {
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
    mutationFn: ({ targetId, targetType }: { targetId: string; targetType: TargetType }) =>
      LikesService.toggleLike(targetId, targetType),
    onSuccess: (result, { targetId, targetType }) => {
      // Invalidate directly after mutation (optimistic)
      queryClient.invalidateQueries({
        queryKey: likesKeys.count(targetId, targetType),
      });

      queryClient.invalidateQueries({
        queryKey: likesKeys.userStatus(targetId, targetType),
      });

      queryClient.invalidateQueries({
        queryKey: likesKeys.withUsers(targetId, targetType),
      });

      queryClient.invalidateQueries({
        queryKey: likesKeys.all,
        predicate: (query) => query.queryKey.includes("bulk"),
      });

      // Optimistic cache update
      queryClient.setQueryData(
        likesKeys.userStatus(targetId, targetType),
        result.liked
      );
    },
  });
};

// Combined hook for like button (auto realtime from above hooks)
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
