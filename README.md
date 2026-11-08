# Private Notes App

A full-stack notes app where each user can only see and manage their own notes.

## Tech stack
- **Frontend:** React, Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **Database & Auth:** Supabase (Auth + Postgres with Row Level Security)

## How it works
1. The user logs in through React. Express checks the details with Supabase Auth.
2. Express stores the JWT in an HTTP-only cookie.
3. Middleware checks that cookie on every notes request.
4. Supabase Row Level Security only returns notes where `user_id` matches the logged-in user.

## API routes
| Method | Route | Protected |
|---|---|---|
| POST | /api/auth/signup | No |
| POST | /api/auth/login | No |
| POST | /api/auth/logout | Yes |
| GET | /api/notes | Yes |
| POST | /api/notes | Yes |
| PUT | /api/notes/:id | Yes |
| DELETE | /api/notes/:id | Yes |

## Setup

### 1. Supabase
Create a project, then run this in the SQL Editor:

```sql
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz default now()
);

alter table notes enable row level security;

create policy "Users can view own notes" on notes for select using (auth.uid() = user_id);
create policy "Users can create own notes" on notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on notes for delete using (auth.uid() = user_id);
```

In Supabase, turn off **Confirm email** (Authentication → Sign In / Providers) while testing.

### 2. Backend
```bash
cd server
npm install
```
Create `server/.env`:
```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-publishable-key
PORT=5000
CLIENT_URL=http://localhost:5173
```
Run it:
```bash
node --watch server.js
```

### 3. Frontend
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173

## Author
Neo Mmethi, Melsoft Academy