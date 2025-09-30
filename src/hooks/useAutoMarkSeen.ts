// src/hooks/useAutoMarkSeen.ts
import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/Authcontext";
import { useMarkGroupSeen } from "@/hooks/useMarkGroupSeen";
import { useMessageStatusesRealtime } from "@/services/realtime/messageStatus-realtime";
import { useQueryClient } from "@tanstack/react-query";
import { messageQueryKeys } from "./useMessages";

// ⏱️ Debounce utility
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

export function useAutoMarkSeen(groupId: string, activeTab: string) {
  const { profile } = useAuth();
  const markGroupSeen = useMarkGroupSeen();
  const queryClient = useQueryClient();
  const hasMarkedRef = useRef(false);

  // 1️⃣ Realtime subscription
  useMessageStatusesRealtime(groupId);

  // 2️⃣ Debounced mark as seen function
  const debouncedMarkSeen = useDebounce(
    (groupId: string, userId: string) => {
      if (!hasMarkedRef.current) {
        hasMarkedRef.current = true;
        markGroupSeen.mutate(
          { groupId, userId },
          {
            onSettled: () => {
              setTimeout(() => {
                hasMarkedRef.current = false;
              }, 1000);
            },
          }
        );
      }
    },
    1500
  );

  // 3️⃣ UPDATED: Check for unseen messages in infinite query structure
  useEffect(() => {
    if (!groupId || !profile || activeTab !== "chat") {
      return;
    }

    // Get cached data (infinite query format)
    const data: any = queryClient.getQueryData(
      messageQueryKeys.byGroup(groupId)
    );
    
    if (!data?.pages) return;

    // Flatten all messages from all pages
    const allMessages = data.pages.flatMap((page: any) => page.messages || []);
    
    if (allMessages.length === 0) return;

    // Only check messages from OTHER users
    const othersMessages = allMessages.filter(
      (msg: any) => msg.sender_id !== profile.id
    );

    // Check for any messages not yet seen by this user
    const unseen = othersMessages.filter(
      (msg: any) =>
        !msg.statuses?.some(
          (s: any) => s.user_id === profile.id && s.status === "seen"
        )
    );

    if (unseen.length > 0 && !hasMarkedRef.current) {
      debouncedMarkSeen(groupId, profile.id);
    }
  }, [activeTab, groupId, profile]);

  // 4️⃣ Reset flag when switching groups or tabs
  useEffect(() => {
    hasMarkedRef.current = false;
  }, [groupId, activeTab]);
}