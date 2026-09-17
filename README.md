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
