import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'jsr:@supabase/supabase-js@2';
// @ts-ignore
import { Resend } from "npm:resend";
// @ts-ignore
const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  try {
    // ✅ Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // ✅ Create Supabase client to verify the user
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // ✅ Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // ✅ Parse request body
    const { to, groupName, inviterName, inviteLink, expiresAt } = await req.json();

    // ✅ Validate required fields
    if (!to || !groupName || !inviterName || !inviteLink || !expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, groupName, inviterName, inviteLink, expiresAt' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log('Sending email to:', to, 'for group:', groupName);

    const subject = `You've been invited to join ${groupName} on StudyBuddy`;
    const html = `
      <p>Hi,</p>
      <p><strong>${inviterName}</strong> has invited you to join the group <strong>${groupName}</strong> on StudyBuddy.</p>
      <p>
        <a href="${inviteLink}" style="padding:10px 20px; background:#2563eb; color:white; text-decoration:none; border-radius:5px;">
          Accept Invite
        </a>
      </p>
      <p>This invite will expire on <strong>${new Date(expiresAt).toLocaleString()}</strong>.</p>
      <br/>
      <p>Thanks,<br/>The StudyBuddy Team</p>
    `;

    // ✅ Check if Resend API key exists
    // @ts-ignore
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "StudyBuddy <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: error.message || 'Failed to send email' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({ success: true, data }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('Error in send-invite-email function:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});