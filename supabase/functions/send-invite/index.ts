import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from 'jsr:@supabase/supabase-js@2';
// @ts-ignore
import nodemailer from "npm:nodemailer";

serve(async (req: Request) => {
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
    // ✅ Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabase = createClient(
      // @ts-ignore
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // ✅ Parse body
    const { to, groupName, inviterName, inviteLink, expiresAt } = await req.json();

    if (!to || !groupName || !inviterName || !inviteLink || !expiresAt) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // ✅ Setup nodemailer transport (Brevo SMTP)
    const transporter = nodemailer.createTransport({
      // @ts-ignore
    
      host: Deno.env.get("BREVO_HOST"),
      // @ts-ignore
      port: Number(Deno.env.get("BREVO_PORT")),
      secure: false,
      auth: {
        // @ts-ignore
        user: Deno.env.get("BREVO_USER"),
        // @ts-ignore
        pass: Deno.env.get("BREVO_PASS"),
      },
    });

    const subject = `You’ve been invited to join ${groupName} on StudyBuddy`;
    const html = `
      <p><strong>${inviterName}</strong> has invited you to join <strong>${groupName}</strong>.</p>
      <p><a href="${inviteLink}" style="padding:10px 20px; background:#2563eb; color:white; text-decoration:none; border-radius:5px;">
        Accept Invite
      </a></p>
      <p>This invite will expire on <strong>${new Date(expiresAt).toLocaleString()}</strong>.</p>
    `;

    const info = await transporter.sendMail({
      // @ts-ignore
      from: `"StudyBuddy" <${Deno.env.get("BREVO_SENDER")}>`,
      to,
      subject,
      html,
    });

    console.log("Message sent:", info.messageId);

    return new Response(JSON.stringify({ success: true, id: info.messageId }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (err: any) {
    console.error("Send-invite error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
