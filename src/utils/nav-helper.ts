// utils/notification-navigation.ts (Alternative approach)
import { useGroupStore } from "@/store/groupStore";
import { useNoteStore } from "@/store/noteStore";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { getGroupById } from "@/services/supabase-groups";

export const useNotificationNavigation = () => {
  const navigate = useNavigate();
  const setActiveTab = useGroupStore((s) => s.setActiveTab);
  const setActiveGroup = useGroupStore((s) => s.setActiveGroup);
  const setMode = useNoteStore((s) => s.setMode);

  const navigateToNotification = useCallback(async (actionUrl?: string) => {
    if (!actionUrl) return;

    try {
      const url = new URL(actionUrl, window.location.origin);
      const searchParams = url.searchParams;
      const pathname = url.pathname;
      
      // Extract parameters
      const tab = searchParams.get('tab');
      const noteId = searchParams.get('n');
      const mode = searchParams.get('m');
      
      // Check if this is a group navigation
      const groupMatch = pathname.match(/^\/groups\/([^/]+)/);
      
      if (groupMatch) {
        const groupId = groupMatch[1];
        
        // Fetch and set the active group before navigating
        try {
          const group = await getGroupById(groupId);
          
          if (group) {
            console.log('Setting active group from notification:', group.name);
            setActiveGroup(group);
            
            // Small delay to ensure state is set
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (error) {
          console.error('Error fetching group for notification:', error);
          // Continue with navigation even if group fetch fails
        }
      }
      
      // Navigate to the path
      navigate(pathname);
      
      // Apply state changes after navigation
      setTimeout(() => {
        // Set active tab if specified
        if (tab) {
          console.log('Setting tab from notification:', tab);
          setActiveTab(tab);
        }
        
        // Handle note-specific navigation
        if (noteId && mode) {
          console.log('Setting note mode from notification:', mode, noteId);
          setMode(mode as any);
          
          // Update URL search params for the note
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('n', noteId);
          newUrl.searchParams.set('m', mode);
          if (tab) {
            newUrl.searchParams.set('tab', tab);
          }
          window.history.pushState({}, '', newUrl);
        } else if (tab) {
          // Just update tab in URL if no note
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('tab', tab);
          window.history.pushState({}, '', newUrl);
        }
      }, 150);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: just navigate to the URL as is
      navigate(actionUrl);
    }
  }, [navigate, setActiveTab, setActiveGroup, setMode]);

  return { navigateToNotification };
};