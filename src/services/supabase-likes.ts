// services/supabase-likes.ts (UPDATED WITH COMMENT LIKE NOTIFICATIONS)
import { supabase } from "./supabase";
import { NotificationTriggers } from "./notifications/trigger";

type TargetType = 'note' | 'comment';

export default class LikesService {
    static async toggleLike(targetId: string, targetType: TargetType) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError ?? new Error("Not authenticated");

        const { data: existingLike } = await supabase
            .from("likes")
            .select("id")
            .eq("user_id", user.id)
            .eq("target_id", targetId)
            .eq("target_type", targetType)
            .maybeSingle();

        if (existingLike) {
            // Unlike - remove the like
            const { error } = await supabase
                .from("likes")
                .delete()
                .eq("id", existingLike.id);

            if (error) throw new Error(`Error removing like: ${error.message}`);
            return { liked: false };
        } else {
            // Like - add the like
            const { data, error } = await supabase
                .from("likes")
                .insert([{
                    user_id: user.id,
                    target_id: targetId,
                    target_type: targetType
                }])
                .select()
                .single();

            if (error) throw new Error(`Error adding like: ${error.message}`);
            
            // 🔥 TRIGGER NOTIFICATION (fire and forget - don't block the response)
            if (targetType === 'note') {
                this.sendNoteLikeNotification(targetId, user.id).catch(err => {
                    console.error('Failed to send note like notification:', err);
                });
            } else if (targetType === 'comment') {
                this.sendCommentLikeNotification(targetId, user.id).catch(err => {
                    console.error('Failed to send comment like notification:', err);
                });
            }
            
            return { liked: true, data };
        }
    }
    
    // 🔥 Send notification for note like
    private static async sendNoteLikeNotification(noteId: string, likerId: string) {
        try {
            // Fetch note owner and details
            const { data: note, error: noteError } = await supabase
                .from('notes')
                .select('user_id, title')
                .eq('id', noteId)
                .single();
            
            if (noteError || !note) {
                console.error('Note not found for notification:', noteError);
                return;
            }
            
            // Don't notify if user liked their own note
            if (note.user_id === likerId) return;
            
            // Fetch liker profile
            const { data: likerProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', likerId)
                .single();
            
            // Send notification
            await NotificationTriggers.notifyNoteLiked(
                note.user_id,
                likerId,
                {
                    noteId,
                    noteTitle: note.title,
                    actorName: likerProfile?.full_name || 'Someone',
                    actorAvatar: likerProfile?.avatar_url,
                }
            );
        } catch (error) {
            // Log but don't throw - notification failure shouldn't break likes
            console.error('Error in sendNoteLikeNotification:', error);
        }
    }
    
    // 🔥 NEW: Send notification for comment like
    private static async sendCommentLikeNotification(commentId: string, likerId: string) {
        try {
            // Fetch comment owner and details
            const { data: comment, error: commentError } = await supabase
                .from('comments')
                .select('author_id, content, note_id')
                .eq('id', commentId)
                .single();
            
            if (commentError || !comment) {
                console.error('Comment not found for notification:', commentError);
                return;
            }
            
            // Don't notify if user liked their own comment
            if (comment.author_id === likerId) return;
            
            // Fetch liker profile
            const { data: likerProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', likerId)
                .single();
            
            // Get note title for context (optional but helpful)
            const { data: note } = await supabase
                .from('notes')
                .select('title')
                .eq('id', comment.note_id)
                .single();
            
            // Send notification
            await NotificationTriggers.notifyCommentLiked(
                comment.author_id,
                likerId,
                {
                    commentId,
                    noteId: comment.note_id,
                    commentPreview: comment.content?.substring(0, 50) || 'your comment',
                    noteTitle: note?.title,
                    actorName: likerProfile?.full_name || 'Someone',
                    actorAvatar: likerProfile?.avatar_url,
                }
            );
        } catch (error) {
            // Log but don't throw - notification failure shouldn't break likes
            console.error('Error in sendCommentLikeNotification:', error);
        }
    }

    // ... (keep all other existing methods unchanged)
    static async getLikesCount(targetId: string, targetType: TargetType) {
        const { count, error } = await supabase
            .from("likes")
            .select("*", { count: 'exact', head: true })
            .eq("target_id", targetId)
            .eq("target_type", targetType);

        if (error) throw new Error(`Error fetching likes count: ${error.message}`);
        return count || 0;
    }

    static async isLikedByUser(targetId: string, targetType: TargetType, userId?: string) {
        if (!userId) {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return false;
            userId = user.id;
        }

        const { data, error } = await supabase
            .from("likes")
            .select("id")
            .eq("user_id", userId)
            .eq("target_id", targetId)
            .eq("target_type", targetType)
            .maybeSingle();

        if (error) throw new Error(`Error checking like status: ${error.message}`);
        return !!data;
    }

    static async getLikesWithUsers(targetId: string, targetType: TargetType) {
        const { data: likes, error } = await supabase
            .from("likes")
            .select("*, user_id")
            .eq("target_id", targetId)
            .eq("target_type", targetType)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`Error fetching likes: ${error.message}`);
        if (!likes || likes.length === 0) return [];

        const userIds = [...new Set(likes.map(like => like.user_id))];

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', userIds);

        const profileMap = new Map(
            (profiles || []).map(profile => [profile.id, profile])
        );

        return likes.map(like => {
            const profile = profileMap.get(like.user_id);
            return {
                ...like,
                user: profile ? {
                    id: profile.id,
                    name: profile.full_name || 'Unknown User',
                    username: profile.username,
                    avatar_url: profile.avatar_url
                } : {
                    id: like.user_id,
                    name: 'Unknown User',
                    username: null,
                    avatar_url: null
                }
            };
        });
    }

    static async getBulkLikesData(targets: Array<{id: string, type: TargetType}>) {
        const { data: { user } } = await supabase.auth.getUser();
        
        const targetIds = targets.map(t => t.id);
        
        const { data: likes, error } = await supabase
            .from("likes")
            .select("target_id, target_type, user_id")
            .in("target_id", targetIds);

        if (error) throw new Error(`Error fetching bulk likes data: ${error.message}`);

        const result = targets.map(target => {
            const targetLikes = likes?.filter(
                like => like.target_id === target.id && like.target_type === target.type
            ) || [];
            
            return {
                targetId: target.id,
                targetType: target.type,
                count: targetLikes.length,
                isLikedByCurrentUser: user ? targetLikes.some(like => like.user_id === user.id) : false
            };
        });

        return result;
    }
}