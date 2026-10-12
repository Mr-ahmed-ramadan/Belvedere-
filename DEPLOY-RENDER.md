# Deploying Belvedere to Render

Belvedere uses a SQLite database and stores uploaded documents on disk, so it
needs a service with a **persistent disk**. On Render that means a paid instance
(**Starter, ~$7/month**) — the free tier has no persistent disk and would lose
your data on every restart.

There are two ways to set it up. The Blueprint way is easiest.

---

## Option A — One-click Blueprint (recommended)

The repo includes `render.yaml`, which describes the whole service.

1. Push this branch to GitHub (already done): `claude/magical-bardeen-rxzf1g`.
2. In Render: **New +** → **Blueprint**.
3. Select this repository and the branch, then **Apply**.
4. Render reads `render.yaml` and creates:
   - a **Web Service** named `belvedere` on the Starter plan,
   - a **1 GB persistent disk** mounted at `/var/data`,
   - a generated `AUTH_SECRET`,
   - the other environment variables (database path, upload dir, email mode).
5. Wait for the first deploy to finish. Your app is at
   `https://belvedere-xxxx.onrender.com` (Render shows the URL).

That's it — the app is live. Now create your first login (see **First login** below).

> The blueprint defaults `region` to Oregon and the plan to Starter. Edit
> `render.yaml` (or change it in the dashboard) if you want a different region.

---

## Option B — Manual setup in the dashboard

If you'd rather click through it instead of using the blueprint:

1. **New +** → **Web Service** → connect this repo, branch
   `claude/magical-bardeen-rxzf1g`.
2. Settings:
   - **Runtime:** Node
   - **Build command:** `npm ci --include=dev && npm run build`
   - **Start command:** `npx prisma migrate deploy && npm run start`
   - **Plan:** Starter (or higher)
   - **Health check path:** `/login`
3. Add a **Disk**: name `belvedere-data`, mount path `/var/data`, size 1 GB.
4. Add these **Environment Variables**:

   | Key | Value |
   | --- | --- |
   | `NODE_VERSION` | `22.22.0` |
   | `DATABASE_URL` | `file:/var/data/belvedere.db` |
   | `UPLOAD_DIR` | `/var/data/uploads` |
   | `AUTH_SECRET` | click **Generate** |
   | `EMAIL_PROVIDER` | `console` (for now) |
   | `EMAIL_FROM` | `Belvedere <noreply@example.com>` |

5. **Create Web Service** and wait for the deploy.

---

## First login

There is no public sign-up, so you need a starting admin account. Easiest for a
first look is to load the sample data once:

1. Open your service in Render → **Shell** tab.
2. Run:
   ```bash
   npm run seed
   ```
3. Go to your app URL and sign in as **`director@belvedere.test`** with password
   **`password123`**.

> ⚠️ The seed creates demo accounts with a known password. Before real use:
> go to **People**, add your real directors/secretary/residents, then
> **deactivate or delete the demo accounts** (and never keep `password123`).

Prefer to start empty instead? Tell me and I'll add a small
`npm run create-admin` script that creates a single director from
`ADMIN_EMAIL` / `ADMIN_NAME` env vars and emails them a set-password link.

---

## Turning on real email

While `EMAIL_PROVIDER=console`, invitation and announcement emails are written to
the **Render logs** rather than sent. To send real email:

1. Create a free account at [resend.com](https://resend.com) and verify a sending
   domain (or use their test domain to start).
2. In Render → **Environment**, set:
   - `EMAIL_PROVIDER` = `resend`
   - `RESEND_API_KEY` = your key (add as a **secret**, never commit it)
   - `EMAIL_FROM` = e.g. `Belvedere <noreply@yourdomain>`
3. Save — Render redeploys and emails now go out for real.

---

## Notes

- **Invite links** automatically use your Render URL (via `RENDER_EXTERNAL_URL`).
  If you later add a **custom domain**, set `APP_URL` to it so links point there.
- **Backups:** your whole dataset is the single file `/var/data/belvedere.db`.
  You can download it from the Shell, or add a Render disk snapshot.
- **Migrations** run automatically on every deploy (`prisma migrate deploy`).
