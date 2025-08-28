import { supabase } from "./supabase";

type TargetType = 'note' | 'comment';

export default class LikesService {
    static async toggleLike(targetId: string, targetType: TargetType) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError ?? new Error("Not authenticated");

        // Check if like already exists
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
            return { liked: true, data };
        }
    }

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

        // Get unique user IDs
        const userIds = [...new Set(likes.map(like => like.user_id))];

        // Fetch all user profiles in one query
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', userIds);

        // Create a map of user_id to profile for quick lookup
        const profileMap = new Map(
            (profiles || []).map(profile => [profile.id, profile])
        );

        // Transform likes to include user info
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

    // Bulk operations for efficiency
    static async getBulkLikesData(targets: Array<{id: string, type: TargetType}>) {
        const { data: { user } } = await supabase.auth.getUser();
        
        const targetIds = targets.map(t => t.id);
        
        // Get all likes for these targets
        const { data: likes, error } = await supabase
            .from("likes")
            .select("target_id, target_type, user_id")
            .in("target_id", targetIds);

        if (error) throw new Error(`Error fetching bulk likes data: ${error.message}`);

        // Process the data
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