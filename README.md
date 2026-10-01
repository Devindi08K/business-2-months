# Business Website Template

Production-ready Next.js template for small businesses (restaurants, salons, hotels, shops, tuition centres). One config file + admin panel = fast rebranding per client.

## Stack

- **Next.js 14** (App Router) + React + JavaScript
- **Tailwind CSS** (theme via CSS variables)
- **MongoDB Atlas** + Mongoose (serverless-safe cached connection)
- **Cloudinary** image uploads
- **Resend** email
- **Zod** validation, **jose** JWT cookies, **bcryptjs** passwords

## Quick start

```bash
cp .env.example .env.local
# Edit .env.local with MongoDB URI, JWT secrets, admin credentials
npm install
npm run seed
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## New client checklist

1. **Copy this repo** into a new folder or create a new Git repository.
2. **Edit `site.config.js`** — business name, tagline, colours, fonts, contact, social, feature toggles, currency, item labels (Menu / Services / Products), SEO defaults.
3. **Copy `.env.example` → `.env.local`** and fill every required variable (see below).
4. **Create a new MongoDB Atlas database** (or new database name on an existing cluster). Update `MONGODB_URI`.
5. **Run** `npm install` then `npm run seed` to create the owner admin and sample content.
6. **Deploy** to Vercel (preferred) or Netlify. Add the same env vars in the host dashboard.
7. **Connect a custom domain** and confirm HTTPS / SSL.
8. Log into `/admin`, replace sample content, upload a logo, and adjust settings.
9. Run `npm audit` periodically and keep dependencies updated.

Rebranding for most clients is: edit `site.config.js` → new MongoDB database → new env → seed → deploy.

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | Atlas connection string |
| `JWT_ACCESS_SECRET` | Yes | Sign short-lived access JWT |
| `JWT_REFRESH_SECRET` | Yes | Sign refresh JWT |
| `ADMIN_EMAIL` | Yes (seed) | First owner email |
| `ADMIN_PASSWORD` | Yes (seed) | First owner password (strong) |
| `ADMIN_NAME` | No | Default `Site Owner` |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Canonical site URL for SEO/sitemap |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud |
| `CLOUDINARY_API_KEY` | For uploads | API key |
| `CLOUDINARY_API_SECRET` | For uploads | API secret |
| `CLOUDINARY_FOLDER` | No | Default `business-site` |
| `RESEND_API_KEY` | For email | Resend API key |
| `EMAIL_FROM` | No | From address |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | No | Cloudflare Turnstile |
| `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` | No | Alternative captcha |

Generate secrets:

```bash
openssl rand -base64 48
```

---

## MongoDB Atlas setup

1. Create a project and cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Database Access** → add a user with password auth.
3. **Network Access** → allow your IP for local work; for Vercel/Netlify allow `0.0.0.0/0` (or use Atlas VPC peering if available).
4. **Connect** → Drivers → copy the URI. Replace `<password>` and set a database name, e.g. `client-harbor`.
5. Put the URI in `MONGODB_URI`.

Use a **separate database name per client** even on a shared cluster.

---

## Deploy on Vercel (preferred)

1. Push the repo to GitHub/GitLab.
2. Import the project in [vercel.com](https://vercel.com).
3. Framework: Next.js (auto-detected).
4. Add all environment variables from `.env.example`.
5. Deploy. Run seed **once** locally (or via `vercel env pull` + `npm run seed`) against the production database, or temporarily run seed from a CI one-off.
6. Set `NEXT_PUBLIC_SITE_URL` to `https://your-domain.com`.

### Custom domain on Vercel

1. Project → Settings → Domains → add domain.
2. At your DNS provider:
   - Apex: A record to `76.76.21.21` (or follow Vercel’s current instructions), **or**
   - Subdomain: CNAME to `cname.vercel-dns.com`.
3. Wait for SSL (automatic Let’s Encrypt).

---

## Deploy on Netlify

1. This repo includes `netlify.toml` and uses `@netlify/plugin-nextjs`.
2. Install the plugin if needed: `npm install -D @netlify/plugin-nextjs` (or enable Next.js runtime in Netlify UI).
3. Connect the repo in Netlify → set env vars → deploy.
4. Domain: Domain management → Add custom domain → follow DNS (Netlify nameservers or CNAME/A records). SSL is automatic via Let’s Encrypt.

---

## Admin panel

`/admin` (noindex, excluded from sitemap)

- Dashboard (unread messages, pending bookings, activity)
- Items + categories CRUD
- Gallery, testimonials, blog, page content
- Contact inbox (read, delete, reply by email)
- Bookings (confirm / cancel + customer email)
- Site settings (business, hours, social, SEO, hero, colours, features)
- Image upload to Cloudinary
- Users (owner: add/remove; everyone: change password)

Roles: **owner** | **editor**

---

## Security features

- bcrypt cost 12+, strong password rules
- JWT access (15m) + refresh (7d) in **httpOnly**, **Secure** (production), **SameSite=Strict** cookies
- Middleware + route-level auth on admin APIs/pages
- CSRF tokens for state-changing requests
- MongoDB-backed rate limits on login, contact, booking; account lockout after failed logins
- Zod validation, NoSQL operator stripping, DOMPurify on rich text, field whitelisting
- Security headers in `next.config.mjs` (CSP, HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy)
- Honeypot + optional Turnstile/reCAPTCHA
- Upload MIME/extension/size checks via Cloudinary
- Audit log for admin actions
- Generic client errors; detailed server logs only

Dependency hygiene: versions are pinned in `package.json`. Run:

```bash
npm audit
# or
npm run audit
```

---

## Project structure

```
site.config.js          # Per-client branding defaults
scripts/seed.js         # Admin + sample data
src/
  app/
    (site)/             # Public pages
    admin/              # Admin UI
    api/                # Route handlers
  components/
  lib/                  # db, auth, csrf, rate-limit, email, …
  models/
  i18n/                 # en + si dictionaries
```

---

## Localisation

English is default. Sinhala strings live in `src/i18n/si.js`. Enable `features.multiLanguage` in config/settings. Page content can be stored per locale in the Pages admin.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run seed` | Create admin + sample content |
| `npm run lint` | ESLint |
| `npm run audit` | npm audit (omit dev) |

---

## Notes

- Without Cloudinary env vars, the site still runs; image upload returns 503 until configured.
- Without `RESEND_API_KEY`, emails are logged to the server console (useful locally).
- Do not commit `.env` / `.env.local`.
