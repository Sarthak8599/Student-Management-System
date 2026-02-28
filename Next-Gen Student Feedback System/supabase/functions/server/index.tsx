import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// KV Store Helper Functions (inlined from kv_store.tsx)
const kvClient = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const kvGet = async (key: string): Promise<any> => {
  const client = kvClient();
  const { data, error } = await client.from("kv_store_40c29f38").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.value;
};

const kvSet = async (key: string, value: any): Promise<void> => {
  const client = kvClient();
  const { error } = await client.from("kv_store_40c29f38").upsert({ key, value });
  if (error) throw new Error(error.message);
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-40c29f38/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth Signup Endpoint
app.post("/make-server-40c29f38/signup", async (c) => {
  try {
    const { email, password, data } = await c.req.json();
    
    const { data: userData, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: data,
      email_confirm: true // Auto-confirm emails - no verification needed
    });

    if (error) {
       console.error("Signup error:", error);
       return c.json({ error: error.message }, 400);
    }

    // Trigger verification email
    if (userData.user && !userData.user.email_confirmed_at) {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (resendError) {
        console.error("Resend verification error:", resendError);
      }
    }

    return c.json({ user: userData.user });
  } catch (error: any) {
    console.error("Signup exception:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Resend Verification Email Endpoint
app.post("/make-server-40c29f38/resend-verification", async (c) => {
  try {
    const { email } = await c.req.json();
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
       console.error("Resend verification error:", error);
       return c.json({ error: error.message }, 400);
    }

    return c.json({ message: "Verification email sent" });
  } catch (error: any) {
    console.error("Resend verification exception:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Login Notification Email Endpoint
app.post("/make-server-40c29f38/login-notification", async (c) => {
  try {
    const { email, timestamp, device } = await c.req.json();
    
    // Get current timestamp in readable format
    const date = new Date(timestamp);
    const formattedTime = date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    
    // Send login notification email using Supabase's built-in email system
    // Using the invite email template as a workaround for custom emails
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        login_time: formattedTime,
        device: device || 'Unknown Device',
        message: `New login detected on your EduPulse account at ${formattedTime}`
      }
    });

    if (error) {
      // Log but don't fail the request - this is a non-critical notification
      console.error("Login notification error:", error);
      return c.json({ 
        message: "Login successful but notification email failed",
        notificationSent: false 
      });
    }

    return c.json({ 
      message: "Login notification sent",
      notificationSent: true 
    });
  } catch (error: any) {
    console.error("Login notification exception:", error);
    return c.json({ 
      message: "Login notification failed",
      error: error.message,
      notificationSent: false 
    }, 500);
  }
});

// KV Get
app.get("/make-server-40c29f38/kv/:key", async (c) => {
  const key = c.req.param("key");
  try {
    const value = await kvGet(key);
    return c.json({ value });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
});

// KV Set
app.post("/make-server-40c29f38/kv/:key", async (c) => {
  const key = c.req.param("key");
  try {
    const body = await c.req.json();
    await kvSet(key, body.value);
    return c.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);