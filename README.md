# Bayelsa State Professional AI Training Expedition — Registration

A premium, animated registration site for the Bayelsa State Professional AI
Training Expedition, built with React, GSAP (+ ScrollTrigger), and Lenis
smooth scrolling.

## What this includes

- Cinematic hero, facts strip, course showcase, and "how it works" sections
  with scroll-triggered GSAP reveals.
- A 5-step animated registration form that preserves every field from the
  original site (personal info, background, tech/gadgets, courses &
  attendance, payment).
- A Netlify Function (`netlify/functions/register.js`) that assigns a
  **server-side, storage-verified unique Registration ID** (format
  `BAY-AI-XXXXX`) and stores the full registration record using
  [Netlify Blobs](https://docs.netlify.com/blobs/overview/) — no external
  database needed.
- A dedicated `/registration/:id` page that renders a cinematic success
  sequence, regenerates the participant's registration card (matching the
  reference design) on a `<canvas>`, and lets them download it as a PNG,
  send it to the WhatsApp group, email it to the organisers, or copy their
  ID. The page also works on a fresh visit/refresh — it fetches the stored
  record via `netlify/functions/get-registration.js`.

## Not included in this pass

- Three.js/React Three Fiber scenes and the React Bits component library
  were intentionally left out in favour of CSS/SVG/GSAP effects, to keep
  the build reliable rather than risk something fragile. They can be added
  incrementally later.
- An admin dashboard for looking up registrations (the data is stored and
  indexable by ID and by payment reference in Netlify Blobs, so this is a
  reasonably small follow-up).

## Local development

```bash
npm install
npm run dev
```

Netlify Functions only run when deployed on Netlify (or via `netlify dev`
with the Netlify CLI installed). Outside of that, registration still works:
the app falls back to a locally generated ID so nobody is blocked from
getting their card, but the ID won't be server-verified as unique.

## Deploy

Connect this repo to Netlify (or run `netlify deploy`). `netlify.toml`
already points the build at `dist/`, wires up `netlify/functions/`, and
adds the SPA redirect needed for React Router.

## Deploying on Render

This app now runs as a single Render Web Service: it builds the React
frontend (`npm run build`) and serves it from a small Express server
(`server/index.js`) that also exposes the registration/admin API and talks
to Supabase (Postgres) directly — no Netlify-specific pieces are used.

1. In Supabase, open the SQL editor and run `supabase-schema.sql` once to
   create the `registrations` table.
2. In your Render service → **Environment**, set:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — the service-role key (Settings → API in
     Supabase). This key bypasses Row Level Security, so keep it out of the
     frontend — it's only ever read server-side, in `server/supabaseServer.js`.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — login for `/admin`
3. Build command: `npm install && npm run build`
   Start command: `npm start` (runs `server/index.js`)

`render.yaml` documents this as a Blueprint if you'd rather provision the
service from it directly.
