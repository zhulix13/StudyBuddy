// services/realtime/commentsRealtime.ts
import { supabase } from "../supabase";

export type CommentEvent = {
  type: "INSERT" | "DELETE" | "UPDATE";
  new: any;
  old: any;
};

export function subscribeToComments(
  noteId: string,
  callback: (event: CommentEvent) => void
) {
  const channel = supabase
    .channel(`comments-${noteId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments",
        filter: `note_id=eq.${noteId}`,
      },
      (payload) => {
        callback({
          type: payload.eventType as CommentEvent["type"],
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
