import { supabase } from "../supabase";

type LikeEvent = {
  type: "INSERT" | "DELETE" | "UPDATE";
  new: any;
  old: any;
};

export function subscribeToLikes(
  targetId: string,
  targetType: "note" | "comment",
  callback: (event: LikeEvent) => void
) {
  const channel = supabase
    .channel(`likes-${targetType}-${targetId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "likes",
        filter: `target_id=eq.${targetId}`,
      },
      (payload) => {
        callback({
          type: payload.eventType as LikeEvent["type"],
          new: payload.new,
          old: payload.old,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
