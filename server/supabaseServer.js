import { createClient } from "@supabase/supabase-js";

// Render env vars — accepts a few common naming conventions so this works
// whatever you named them when you set them up. Check your Render service's
// Environment tab if the server logs a "Supabase env vars missing" warning.
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "[supabase] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars — " +
      "set them in Render → your service → Environment. The site will still " +
      "load, but registration and admin routes will fail until this is set."
  );
}

// Server-only client. This file must never be imported by frontend code —
// if a service-role key is used, it must stay off the browser bundle.
// A syntactically-valid placeholder URL is used when unset so createClient()
// doesn't throw at boot (which would crash the whole server, including the
// static frontend) — API calls will instead fail per-request with a clear
// network error until the real env vars are set.
export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_KEY || "placeholder"
);
