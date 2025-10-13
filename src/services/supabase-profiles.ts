// services/supabase-profiles.ts
import { supabase } from "./supabase";
import type { Profile } from "@/types/profile";

export default class ProfilesService {
  // 🔹 Fetch a user profile by ID
  static async getProfileById(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data as Profile;
  }

  // 🔹 Fetch all profiles (optionally filtered by list of ids)
  static async getProfilesByIds(userIds: string[]): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (error) throw error;
    return data as Profile[];
  }

  // 🔹 Fetch all profiles (no filter)
  static async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) throw error;
    return data as Profile[];
  }

  // 🔹 Update a profile by ID
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }

  // 🔹 Check if username is available
  static async checkUsernameAvailability(username: string, currentUserId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", currentUserId)
      .maybeSingle();

    if (error) throw error;
    
    // If data exists, username is taken
    return !data;
  }

  // 🔹 Update avatar URL
  static async updateAvatar(userId: string, avatarUrl: string): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }
}