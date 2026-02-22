# GE Auto Import – Deployment Guide

## 1. Database persistence (production)

- The app uses **PostgreSQL only** (no SQLite). Data is persistent as long as the PostgreSQL data directory is on disk (Docker volume or host).
- **Development (Windows):** Ensure PostgreSQL runs as a service or in Docker so it survives reboot. Use `DATABASE_URL` pointing to that instance.
- **Production:** Use `migrate:deploy` (or first-time `db:push` if no migrations exist). Never use in-memory or ephemeral DB in production.

### .env.production checklist

- `DATABASE_URL` – PostgreSQL connection string (persistent server or container).
- `NEXTAUTH_URL` – Full public URL (e.g. `https://yourdomain.com`).
- `NEXTAUTH_SECRET` – Strong secret: `openssl rand -base64 32`.
- `RESEND_API_KEY` (optional) – For transactional emails.
- `EMAIL_FROM` (optional) – Sender address for emails.

---

## 2. Mail configuration

### Resend (recommended)

1. Create account at [resend.com](https://resend.com), verify your domain.
2. Create an API key and set in `.env`:
   - `RESEND_API_KEY=re_xxxx`
   - `EMAIL_FROM="GE Auto Import <noreply@yourdomain.com>"`
3. If either is missing, the app still runs; emails are skipped (logged in dev).

### SMTP alternative

The codebase uses Resend. For SMTP you would add a small adapter in `lib/email/send.ts` (e.g. Nodemailer) and keep the same `sendEmail()` interface.

### Testing email

- In development, without `RESEND_API_KEY`, the app logs “Would send to…” instead of sending.
- With a valid key, send a test from the app (e.g. password reset or booking confirmation) and check Resend dashboard.

### Fallback behavior

- Emails are sent asynchronously (non-blocking). If sending fails, the error is logged and the main request still succeeds.

---

## 3. Nginx + HTTPS (VPS)

### Nginx

- Use `deploy/nginx.conf.example` as a template.
- Set `server_name` to your domain and proxy to `http://127.0.0.1:3000` (or your Node/PM2 port).
- Reload: `nginx -t && systemctl reload nginx`.

### Certbot (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

- Certbot adds the HTTPS server block and redirects HTTP → HTTPS.
- Auto-renewal: `sudo certbot renew --dry-run` (cron is usually added by the package).

---

## 4. Docker (recommended)

- **Build and run:**  
  Copy `.env.example` to `.env`, set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and optionally `POSTGRES_PASSWORD`.  
  Then: `docker compose up -d`
- The app runs migrations on startup (`prisma migrate deploy`). If no migrations exist yet, run once locally: `npx prisma migrate dev --name init`, commit `prisma/migrations`, then deploy.
- Database is stored in the `postgres_data` volume (persistent).

---

## 5. VPS install script (non-Docker)

- Run from repo root: `sudo bash scripts/install.sh`
- The script installs Node LTS, PostgreSQL, creates DB and user, installs deps, runs `prisma migrate deploy` (or `db push` if no migrations), builds the app, and sets up PM2 with restart on reboot.
- Set `.env` in the install directory (e.g. `/opt/ge-auto-import`) with production values, then `pm2 restart ge-auto-import`.

---

## 6. Security (production)

- **Passwords:** bcrypt with 12 rounds (already used in code).
- **Rate limiting:** Enabled on login, password reset, and public forms.
- **Headers:** Security headers set in Next.js middleware (X-Content-Type-Options, X-Frame-Options, etc.).
- **Admin routes:** Protected by session and ADMIN role.
- **Cookies:** NextAuth uses secure cookies when `NEXTAUTH_URL` is HTTPS.
- **JWT:** Session max age 30 days (configurable in `lib/auth.ts`).
- Avoid logging sensitive data (passwords, tokens); keep logs for errors only in production.

---

## 7. GitHub

- `.gitignore` already excludes `.env`, `node_modules`, `.next`. Do not commit `.env`.
- Commit `.env.example` and `prisma/migrations` (after creating initial migration if needed).
- README (see project root) includes installation via Docker and VPS script, env vars, and production checklist.
