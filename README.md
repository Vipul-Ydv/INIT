# INIT

Build one profile, get applications prefilled everywhere.

Upload your resume once, connect the job boards you care about, and review
prefilled application details before applying — instead of retyping the same
information on every company's site.

## Stack

- Next.js (App Router, TypeScript)
- Prisma + SQLite (dev) via the `better-sqlite3` driver adapter
- Tailwind CSS
- Cookie-based sessions (`jose`), `bcryptjs` for password hashing

## How it works

1. **Sign up** and fill in your **profile** (name, contact info, links, a
   default cover note) and upload a PDF **resume** — it's parsed to plain text
   with `pdf-parse`.
2. **Connect** a company's public job board. Only ATS platforms with public,
   documented job-listing APIs are supported for the MVP:
   - [Greenhouse Job Board API](https://developers.greenhouse.io/job-board.html)
   - [Lever Postings API](https://github.com/lever/postings-api)
3. Open jobs from connected boards show up on the **Jobs** page. Reviewing a
   job shows your profile data prefilled next to the listing, then links out
   to the real application page so **you** submit it yourself. Mark it as
   applied once you're done.

This intentionally stops short of logging into third-party sites or
auto-submitting applications on your behalf — most major job boards (LinkedIn,
Indeed, etc.) prohibit automated applications in their terms of service, and
their application forms aren't exposed as stable public APIs. Sticking to ATS
platforms with public read APIs keeps this safe to use and to build on.

## Getting started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set a `SESSION_SECRET` environment variable before deploying to production
(a random 32+ character string).

## Project structure

- `prisma/schema.prisma` — data model (User, Profile, Connection, Job, Application)
- `src/lib/auth.ts` — session cookie signing/verification
- `src/lib/ats/` — Greenhouse/Lever job board API clients
- `src/app/dashboard/` — profile, connections, and jobs pages
- `src/app/api/` — REST endpoints backing the dashboard
