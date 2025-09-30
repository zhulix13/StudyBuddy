// src/hooks/useTypingIndicator.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/context/Authcontext";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TypingUser = {
  user_id: string;
  username: string;
  avatar_url?: string;
};

export function useTypingIndicator(groupId: string) {
  const { profile } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!groupId || !profile) return;

    // Create presence channel
    const channel = supabase.channel(`typing:${groupId}`, {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    // Track presence state changes
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        
        // Extract typing users (exclude self)
        const users: TypingUser[] = [];
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id !== profile.id && presence.typing) {
              users.push({
                user_id: presence.user_id,
                username: presence.username,
                avatar_url: presence.avatar_url,
              });
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Initial presence state (not typing)
          await channel.track({
            user_id: profile.id,
            username: profile.username || "User",
            avatar_url: profile.avatar_url,
            typing: false,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [groupId, profile]);

  // Start typing
  const startTyping = useCallback(async () => {
    if (!channelRef.current || !profile) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Broadcast typing state
    await channelRef.current.track({
      user_id: profile.id,
      username: profile.username || "User",
      avatar_url: profile.avatar_url,
      typing: true,
      online_at: new Date().toISOString(),
    });

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [profile]);

  // Stop typing
  const stopTyping = useCallback(async () => {
    if (!channelRef.current || !profile) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await channelRef.current.track({
      user_id: profile.id,
      username: profile.username || "User",
      avatar_url: profile.avatar_url,
      typing: false,
      online_at: new Date().toISOString(),
    });
  }, [profile]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}