// services/supabase-notification-preferences.ts
import { supabase } from "./supabase";

export interface NotificationPreferences {
  user_id: string;
  
  // Category toggles
  social_enabled: boolean;
  group_enabled: boolean;
  invite_enabled: boolean;
  content_enabled: boolean;
  
  // Specific action toggles
  note_likes_enabled: boolean;
  note_comments_enabled: boolean;
  message_replies_enabled: boolean;
  new_notes_enabled: boolean;
  member_joins_enabled: boolean;
  
  // Batching preferences
  batch_similar: boolean;
  batch_window_minutes: number;
  
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_start_hour: number;
  quiet_end_hour: number;
  
  updated_at: string;
}

class NotificationPreferencesService {
  // Get user preferences (creates default if doesn't exist)
  static async getPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    // If no preferences exist, create default ones
    if (!data) {
      return this.createDefaultPreferences(userId);
    }
    
    return data as NotificationPreferences;
  }
  
  // Create default preferences for new user
  static async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    const defaultPrefs = {
      user_id: userId,
      social_enabled: true,
      group_enabled: true,
      invite_enabled: true,
      content_enabled: true,
      note_likes_enabled: true,
      note_comments_enabled: true,
      message_replies_enabled: true,
      new_notes_enabled: false, // Off by default (can be noisy)
      member_joins_enabled: false, // Off by default (admin preference)
      batch_similar: true,
      batch_window_minutes: 30,
      quiet_hours_enabled: false,
      quiet_start_hour: 22,
      quiet_end_hour: 8,
    };
    
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert(defaultPrefs)
      .select()
      .single();
    
    if (error) throw error;
    return data as NotificationPreferences;
  }
  
  // Update preferences
  static async updatePreferences(
    userId: string, 
    updates: Partial<Omit<NotificationPreferences, 'user_id' | 'updated_at'>>
  ): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as NotificationPreferences;
  }
}

export default NotificationPreferencesService;