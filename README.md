# Tailor AI — Frontend (Vite + React)

## Project info

This repo contains the Tailor AI web app (landing, workflow, camera, store) built with Vite, React, TypeScript, Tailwind, and shadcn/ui.

## How can I edit this code?

There are several ways of editing your application.

## Getting started

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/Saeid202/Tailor-AI.git

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Supabase setup

1) Create a Supabase project. Copy your Project URL and anon (publishable) key.

2) Configure env vars (create `.env.local` or use the provided `.env.example`):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY
```

3) Apply database schema and policies:

- In the Supabase SQL Editor, run the migration file at `supabase/migrations/20251022090000_tailor_ai_core.sql`.
- This creates profiles, measurements, catalog, carts/orders, social tables, enables RLS, and sets storage buckets/policies.

4) Storage buckets:

- Buckets created by the migration: `product-images` (public), `pattern-assets` (public), `captures` (private)
- Upload assets to these buckets in the Storage UI.

5) Client usage:

- Supabase client: `src/integrations/supabase/client.ts`
- API helpers:
	- Catalog: `src/integrations/supabase/catalog.ts`
	- Cart: `src/integrations/supabase/cart.ts`
	- Measurements: `src/integrations/supabase/measurements.ts`

Replace any mock data fetches in components with these helpers.

## Deploy

- Vercel (recommended). Add environment variables above to project settings.
- For social previews, `index.html` points to `/api/og` which serves a dynamic PNG (Node Function) for rich link cards.

## Tech

- Vite, React, TypeScript
- Tailwind CSS, shadcn/ui
- Supabase (auth, Postgres, storage)
 
---

If you need help wiring specific components (store, camera measurements) to Supabase, open an issue or ask in chat.
