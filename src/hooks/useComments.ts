import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CommentsService from '@/services/supabase-comments';
import type { Comment } from '@/types/comments';

// Query keys
export const commentsKeys = {
  all: ['comments'] as const,
  byNoteId: (noteId: string) => [...commentsKeys.all, 'note', noteId] as const,
  byId: (commentId: string) => [...commentsKeys.all, 'comment', commentId] as const,
  byParentId: (parentId: string) => [...commentsKeys.all, 'parent', parentId] as const,
  rootComments: (noteId: string) => [...commentsKeys.all, 'note', noteId, 'root'] as const,
};

// Hook to fetch root comments by note ID (comments without parent)
export const useCommentsByNoteId = (noteId: string) => {
  return useQuery({
    queryKey: commentsKeys.rootComments(noteId),
    queryFn: () => CommentsService.getRootCommentsByNoteId(noteId), // Only root comments
    enabled: !!noteId,
  });
};

// Hook to fetch replies by parent comment ID
export const useCommentsByParentId = (parentCommentId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: commentsKeys.byParentId(parentCommentId),
    queryFn: () => CommentsService.getCommentsByParentId(parentCommentId),
    enabled: !!parentCommentId && (options?.enabled !== false),
  });
};

// Hook to fetch a single comment by ID
export const useCommentById = (commentId: string) => {
  return useQuery({
    queryKey: commentsKeys.byId(commentId),
    queryFn: () => CommentsService.getCommentById(commentId),
    enabled: !!commentId,
  });
};

// Hook to get replies count for a comment
export const useRepliesCount = (commentId: string) => {
  return useQuery({
    queryKey: [...commentsKeys.byId(commentId), 'count'],
    queryFn: () => CommentsService.getRepliesCount(commentId),
    enabled: !!commentId,
  });
};

// Hook to create a comment
export const useAddComment = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: ({ noteId, content, parentCommentId }: {
      noteId: string;
      content: string;
      parentCommentId?: string | null;
    }) =>
      CommentsService.addComment(noteId, content, parentCommentId),
    onSuccess: (newComment) => {
      // If it's a root comment, invalidate root comments
      if (!newComment.parent_comment_id) {
        queryClient.invalidateQueries({
          queryKey: commentsKeys.rootComments(newComment.note_id),
        });
      } else {
        // If it's a reply, invalidate parent's replies
        queryClient.invalidateQueries({
          queryKey: commentsKeys.byParentId(newComment.parent_comment_id),
        });
        
        // Also invalidate the replies count for the parent
        queryClient.invalidateQueries({
          queryKey: [...commentsKeys.byId(newComment.parent_comment_id), 'count'],
        });
      }
      
      // Add the new comment to cache
      queryClient.setQueryData(
        commentsKeys.byId(newComment.id),
        newComment
      );
    },
  });
};

// Hook to update a comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: {
      commentId: string;
      content: string;
    }) =>
      CommentsService.updateComment(commentId, content),
    onSuccess: (updatedComment) => {
      // Update the specific comment in cache
      queryClient.setQueryData(
        commentsKeys.byId(updatedComment.id),
        updatedComment
      );
      
      // Invalidate relevant queries
      if (!updatedComment.parent_comment_id) {
        queryClient.invalidateQueries({
          queryKey: commentsKeys.rootComments(updatedComment.note_id),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: commentsKeys.byParentId(updatedComment.parent_comment_id),
        });
      }
    },
  });
};

// Hook to delete a comment (soft delete)
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => CommentsService.deleteComment(commentId),
    onSuccess: (deletedComment) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: commentsKeys.byId(deletedComment.id),
      });
      
      // Invalidate relevant queries
      if (!deletedComment.parent_comment_id) {
        queryClient.invalidateQueries({
          queryKey: commentsKeys.rootComments(deletedComment.note_id),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: commentsKeys.byParentId(deletedComment.parent_comment_id),
        });
        
        // Update replies count for parent
        queryClient.invalidateQueries({
          queryKey: [...commentsKeys.byId(deletedComment.parent_comment_id), 'count'],
        });
      }
    },
  });
};