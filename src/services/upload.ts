// src/services/upload.ts

import { supabase } from "./supabase";

export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Overwrite if already exists
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
};
