import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CommentsService from '@/services/supabase-comments';
import { subscribeToComments,type CommentEvent } from '@/services/realtime/comments-realtime';
import type { Comment } from '@/types/comments';
import { useEffect } from 'react';

// Query keys
export const commentsKeys = {
  all: ['comments'] as const,
  byNoteId: (noteId: string) => [...commentsKeys.all, 'note', noteId] as const,
  byId: (commentId: string) => [...commentsKeys.all, 'comment', commentId] as const,
  byParentId: (parentId: string) => [...commentsKeys.all, 'parent', parentId] as const,
  rootComments: (noteId: string) => [...commentsKeys.all, 'note', noteId, 'root'] as const,
};

// Hook to subscribe to realtime comment events for a note
export const useRealtimeComments = (noteId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!noteId) return;

    const unsubscribe = subscribeToComments(noteId, (event: CommentEvent) => {
      if (event.type === 'INSERT') {
        if (!event.new.parent_comment_id) {
          // Root comment
          queryClient.setQueryData<Comment[]>(
            commentsKeys.rootComments(noteId),
            (old = []) => [...old, event.new]
          );
        } else {
          // Reply
          queryClient.setQueryData<Comment[]>(
            commentsKeys.byParentId(event.new.parent_comment_id),
            (old = []) => [...old, event.new]
          );

          queryClient.invalidateQueries({
            queryKey: [...commentsKeys.byId(event.new.parent_comment_id), 'count'],
          });
        }

        queryClient.setQueryData(commentsKeys.byId(event.new.id), event.new);
      }

      if (event.type === 'UPDATE') {
        queryClient.setQueryData(commentsKeys.byId(event.new.id), event.new);
      }

      if (event.type === 'DELETE') {
        queryClient.removeQueries({ queryKey: commentsKeys.byId(event.old.id) });

        if (!event.old.parent_comment_id) {
          queryClient.setQueryData<Comment[]>(
            commentsKeys.rootComments(event.old.note_id),
            (old = []) => old.filter((c) => c.id !== event.old.id)
          );
        } else {
          queryClient.setQueryData<Comment[]>(
            commentsKeys.byParentId(event.old.parent_comment_id),
            (old = []) => old.filter((c) => c.id !== event.old.id)
          );

          queryClient.invalidateQueries({
            queryKey: [...commentsKeys.byId(event.old.parent_comment_id), 'count'],
          });
        }
      }
    });

    return unsubscribe;
  }, [noteId, queryClient]);
};

// ---- Queries ----

// Root comments
export const useCommentsByNoteId = (noteId: string) => {
  return useQuery({
    queryKey: commentsKeys.rootComments(noteId),
    queryFn: () => CommentsService.getRootCommentsByNoteId(noteId),
    enabled: !!noteId,
  });
};

// Replies
export const useCommentsByParentId = (parentCommentId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: commentsKeys.byParentId(parentCommentId),
    queryFn: () => CommentsService.getCommentsByParentId(parentCommentId),
    enabled: !!parentCommentId && (options?.enabled !== false),
  });
};

// Single comment
export const useCommentById = (commentId: string) => {
  return useQuery({
    queryKey: commentsKeys.byId(commentId),
    queryFn: () => CommentsService.getCommentById(commentId),
    enabled: !!commentId,
  });
};

// Replies count
export const useRepliesCount = (commentId: string) => {
  return useQuery({
    queryKey: [...commentsKeys.byId(commentId), 'count'],
    queryFn: () => CommentsService.getRepliesCount(commentId),
    enabled: !!commentId,
  });
};

// ---- Mutations ----

// Add comment
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, content, parentCommentId }: {
      noteId: string;
      content: string;
      parentCommentId?: string | null;
    }) => CommentsService.addComment(noteId, content, parentCommentId),
    onSuccess: (newComment) => {
      queryClient.setQueryData(commentsKeys.byId(newComment.id), newComment);
    },
  });
};

// Update comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: {
      commentId: string;
      content: string;
    }) => CommentsService.updateComment(commentId, content),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData(commentsKeys.byId(updatedComment.id), updatedComment);
    },
  });
};

// Delete comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => CommentsService.deleteComment(commentId),
    onSuccess: (deletedComment) => {
      queryClient.removeQueries({ queryKey: commentsKeys.byId(deletedComment.id) });
    },
  });
};
