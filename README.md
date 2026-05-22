# Vault

Vault is a personal knowledge hub for saving the useful things you do not want to lose: AI prompts, bookmarks, YouTube links, quick notes, and reusable code snippets. It is built as a full-stack single-page app with a React frontend and a Supabase backend.

The app is designed around private, per-user collections. After signing in, each user only sees and edits their own data through Supabase Row Level Security policies.

## What It Does

Vault includes five main sections:

- **Prompts**: save AI prompts, templates, system messages, and favorite prompts.
- **Bookmarks**: collect links with titles, descriptions, favicons, tags, and search.
- **YouTube**: store YouTube videos with thumbnails, channels, tags, and watched status.
- **Notepad**: write notes in a split list/editor layout with pinning and tags.
- **Code Snippets**: save reusable code blocks with language labels, descriptions, tags, and copy support.

Across the app, users can create, read, update, delete, search, filter, and tag content.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State and data fetching**: React hooks, React Context, TanStack React Query
- **Backend**: Supabase Auth, Postgres, Row Level Security, Realtime
- **Auth**: email/password plus optional GitHub OAuth
- **Offline support**: localStorage snapshots for read fallback, plus React Query caching

## Project Structure

```text
src/
  components/
    auth/          Sign in and sign up UI
    layout/        Main app shell and section navigation
    links/         Bookmark board
    notepad/       Notes editor
    prompts/       Prompt storage panel
    snippets/      Code snippets section
    youtube/       YouTube link board
    ui/            Shared UI components
  context/         Auth context
  hooks/           Supabase CRUD hooks and realtime/cache helpers
  lib/             Supabase and React Query clients
  types/           Shared TypeScript models

supabase/
  schema.sql       Database tables, indexes, RLS policies, and realtime setup
```

## Supabase Setup

Create a Supabase project, then add your frontend environment variables in `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Only use the publishable/anon key in the frontend. Do not put a service role key in this app.

This project uses Vite, so environment variables must start with `VITE_`. Supabase examples for Next.js often use `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `@supabase/ssr`, `page.tsx`, and middleware helpers. Those are only needed for a Next.js server-rendered app. Vault uses a browser client in `src/lib/supabase.ts` instead:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

Next, open the Supabase SQL Editor and run the SQL from:

```text
supabase/schema.sql
```

That schema creates:

- `prompts`
- `links`
- `yt_links`
- `notes`
- `snippets`

Each table includes a `user_id` column, timestamps, indexes, and RLS policies so authenticated users can only access their own rows.

## Authentication

Email/password auth works through Supabase Auth. GitHub OAuth is also wired in the UI, but it must be enabled in Supabase:

1. Go to **Authentication > Providers**.
2. Enable **GitHub**.
3. Add the Supabase callback URL to your GitHub OAuth app.
4. Add your GitHub client ID and secret in Supabase.

## Realtime and Caching

The app subscribes to Supabase realtime changes per table and invalidates React Query caches when the signed-in user's data changes.

Local snapshots are stored in `localStorage`, so previously loaded data can still render if the network is temporarily unavailable.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Current Status

The MVP is implemented:

- Auth screen
- Responsive app shell
- Five content sections
- Supabase CRUD hooks
- Realtime invalidation
- Per-user database schema with RLS
- Search, tags, and useful item-specific actions

Planned improvements:

- Full offline mutation queue
- Supabase Storage attachments
- Markdown notes
- Syntax highlighting for snippets
- Bulk import/export
- Shareable route state
