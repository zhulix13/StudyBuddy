
import { supabase } from "../supabase";

export async function sendInviteViaEmail(payload: {
  to: string;
  groupName: string;
  inviterName: string;
  inviteLink: string;
  expiresAt: string;
}) {
  console.log('Sending invite email with payload:', payload);

  // Get the current user's session for authorization
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('Session error:', sessionError);
    throw new Error('User must be authenticated to send invites');
  }

  console.log('User authenticated:', session.user.email);

  try {
    const { data, error } = await supabase.functions.invoke("send-invite-email", {
      body: payload,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Function invocation error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Try to get more details from the error
      if (error.details) {
        console.error('Error details:', error.details);
      }
      
      throw error;
    }
    
    console.log('Function response:', data);
    return data;
  } catch (err: any) {
    console.error('Caught error:', err);
    throw err;
  }
}