# Belvedere — Block Management System

A simple web system for a block of flats' management company. It helps
directors, the secretary, landlords, renters and maintenance helpers stay up to
date with the building: announcements, meetings & minutes, a register of board
decisions, a shared document library, and a basic tracker for ongoing
projects/cases.

Functionality and ease of use come first; the UI is deliberately plain.

## Tech

- **Next.js** (App Router, TypeScript) — UI + server actions in one codebase
- **Prisma + SQLite** — a single-file database (easy to back up: copy the file)
- **Auth.js (NextAuth v5)** — email + password login, invite-based sign-up
- **Resend** — transactional email (console-logged in development)
- **Tailwind CSS** — minimal styling

## Roles

| Role | Can do |
| --- | --- |
| **Director** | Everything (admin by definition) |
| **Secretary** | Everything (admin by definition) |
| **Landlord** | View public announcements, meetings, minutes, decisions, documents |
| **Renter** | Same as landlord |
| **Helper** | View public items; update projects assigned to them |

Every content item is either **Public** (residents can see it) or **Internal**
(board & secretary only).

## Running locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env          # defaults work out of the box (no external services)
npx prisma migrate dev        # create the SQLite database
npm run seed                  # add sample data + test accounts
npm run dev                   # http://localhost:3000
```

In development, emails are printed to the terminal instead of being sent, so you
can test invitations and announcements with no email account.

### Test accounts (after seeding)

All use the password **`password123`**:

- `director@belvedere.test` — Director (admin)
- `secretary@belvedere.test` — Secretary (admin)
- `landlord@belvedere.test` — Landlord
- `renter@belvedere.test` — Renter
- `helper@belvedere.test` — Helper

## How accounts work

There is no public sign-up. A director or the secretary adds a person under
**People**; the system emails them a secure link to set their password. The same
action re-sends an invite or resets a password.

## Useful scripts

```bash
npm run dev         # start the dev server
npm run build       # production build
npm run start       # run the production build
npm run seed        # (re)seed sample data
npm run typecheck   # TypeScript check
npm run lint        # ESLint
npm run test        # unit tests (permissions, invites)
npx prisma studio   # browse/edit the database in a GUI
```

## Deployment

The app needs a host with a **persistent disk** so the SQLite file and uploaded
documents survive restarts (e.g. Render, Railway, Fly.io, or any VPS).

👉 **Deploying to Render? See [DEPLOY-RENDER.md](./DEPLOY-RENDER.md)** — the repo
includes a `render.yaml` blueprint for one-click setup.

For any host, set these environment variables in production:

```
DATABASE_URL="file:/data/belvedere.db"   # on the persistent volume
AUTH_SECRET="<openssl rand -base64 32>"
APP_URL="https://your-domain"
NEXTAUTH_URL="https://your-domain"
EMAIL_PROVIDER="resend"
RESEND_API_KEY="<from resend.com>"
EMAIL_FROM="Belvedere <noreply@your-domain>"
UPLOAD_DIR="/data/uploads"               # on the persistent volume
```

Then run `npx prisma migrate deploy` once on the server before `npm run build`
and `npm run start`.

> Scaling to multiple buildings later? Switch the Prisma `provider` to
> `postgresql` and move uploads to S3 — the application code barely changes.
