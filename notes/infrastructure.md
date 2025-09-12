## 0) Local + repo prep (Cursor)

1. Open your repo in **Cursor**.
2. Install **Node 20 LTS** and **pnpm**.
3. At repo root, initialize:

   * `pnpm init -y`
   * Create `.gitignore` (node\_modules, .next, dist, etc.), `.editorconfig`, and `.nvmrc` (`v20`).
4. Convert to **workspaces**:

   * Add to root `package.json`:

     * `"private": true`
     * `"workspaces": ["apps/*", "packages/*"]`
   * Add root scripts placeholders: `build`, `typecheck`, `lint`, `test`.

---

## 1) Monorepo folders

1. Create:

   ```
   apps/web
   apps/api
   apps/ops/{nginx,pm2,deploy,runbooks}
   packages/{types,tsconfig}
   ```
2. Root `README.md`: document structure and environments.

---

## 2) Shared TS configs & types

1. **packages/tsconfig**: create `base.json` (strict, bundler resolution), `web.json`, `api.json` (extends base; `outDir`=dist for API).
2. **packages/types**:

   * `package.json`: `"name": "@whitepine/types"`, `"type": "module"`, `"main": ""` (TS-only), `"types": "index.d.ts"`.
   * Add initial `src/index.ts` with a couple of shared interfaces (can be empty to start).

---

## 3) Next.js (App Router) + Tailwind + MDX + shadcn (apps/web)

1. Scaffold Next.js (TS, App Router).
2. Install **Tailwind**; create base config and global CSS.
3. Enable **MDX** for App Router (marketing/blog from files under `apps/web/content`).
4. Initialize **shadcn/ui**:

   * Set up theme tokens (light/dark).
   * Generate a couple of base components (e.g., Button) to validate pipeline.
5. Decide **ISR windows** (you’ll set revalidate per page later):

   * Mostly static: 60–120 min
   * Feature pages: 10–30 min
   * Pricing/announcements/blog: 1–5 min (or on-demand revalidate)

---

## 4) Express API in TypeScript (ESM) with tsup (apps/api)

1. `package.json`:

   * `"type": "module"`
   * scripts for `dev` (tsx watch), `build` (tsup → `dist`), `start` (node `dist/server.js`)
2. Dependencies you’ll add:

   * core: `express`, `helmet`, `cors`, `pino`, `zod`
   * auth: `passport`, `passport-google-oauth20`, `cookie-session` (or express-session)
   * db: `mongoose`
   * rate limits: `rate-limiter-flexible`
   * aws: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
   * dev: `tsx`, `tsup`, `typescript`, `vitest`, `@vitest/ui`, `supertest`, `@types/*`
3. **ESM runtime**: keep API ESM; **exception** for migrations (see §6) which will be compiled to CJS for `migrate-mongo` compatibility.
4. **Ports**:

   * Prod: web `3000`, api `4000`
   * Dev host: web `3001`, api `4001`

---

## 5) Path aliases & shared types

1. In both apps, set TS path aliases:

   * `@shared/*` → `packages/types/src/*`
   * `@api/*` → `apps/api/src/*`
   * `@web/*` → `apps/web/*`
2. Ensure bundlers respect paths:

   * Next handles TS paths automatically.
   * `tsup` respects paths; confirm in its config or `tsconfig`.

---

## 6) Migrations with migrate-mongo (TS-authored, CJS-built)

1. Add `migrate-mongo` **to apps/api**.
2. Author migrations in **TS** under `apps/api/src/migrations`.
3. Configure `tsup` to **also** build migrations to `apps/api/migrations` **in CJS format** (so `migrate-mongo` runs them cleanly).
4. Decide migration conventions:

   * Timestamped filenames
   * Separate index creation from heavy data backfills
   * TTL indexes (24h) for ephemera (sessions, tokens)

---

## 7) Testing with Vitest

1. Add Vitest config in web and api (API: node environment; Web: jsdom for components).
2. Add scripts:

   * root `test` → `pnpm -r test`
   * per app `test` and `test:ui` (optional)

---

## 8) OAuth (Google)

1. In Google Cloud console:

   * Create OAuth client (Web).
   * Authorized redirect URIs:

     * `https://whitepine.jpkramer.com/api/auth/google/callback`
     * `https://whitepinedev.jpkramer.com/api/auth/google/callback`
2. Record `GOOGLE_CLIENT_ID`/`SECRET` for env.

---

## 9) S3 uploads

1. Buckets: `whitepine-uploads-prod`, `whitepine-uploads-dev` (Block public access **ON**).
2. IAM user with least-privilege; note keys in secrets.
3. Configure CORS on both buckets for your two origins.
4. Flow: client asks API for **presigned URL** → direct upload to S3.

---

## 10) Root package: scripts & workspaces wiring

1. Root scripts:

   * `build:web`, `build:api`, `build` (`pnpm -r run build`)
   * `dev:web`, `dev:api`
   * `migrate:up` / `migrate:down` (CD into `apps/api` and call `migrate-mongo`)
   * `typecheck`, `lint`, `test`
2. Confirm `pnpm install -w` installs across workspaces.

---

## 11) Lightsail instance (single box) prep

1. Ubuntu updates: `sudo apt update && sudo apt upgrade -y`
2. Install: `nginx`, `certbot` + `python3-certbot-nginx`, Node 20, pnpm, pm2, git, `apache2-utils` (for htpasswd).
3. Create folders:

   ```
   /var/www/whitepine/{releases,current,shared}
   /var/www/whitepine/shared/env
   /var/log/whitepine
   ```
4. Create a `deploy` user; set up SSH keys (you’ll add the private key to GitHub Actions).
5. **PM2**: enable on boot (`pm2 startup` → run suggested command).

---

## 12) Nginx + Let’s Encrypt (no LB)

1. Two vhosts:

   * `whitepine.jpkramer.com` → proxy `/` to `127.0.0.1:3000`, `/api/` to `127.0.0.1:4000`
   * `whitepinedev.jpkramer.com` → proxy to `3001/4001` and wrap entire server with **HTTP Basic Auth** (username: `dev`)
2. TLS:

   * `sudo certbot --nginx -d whitepine.jpkramer.com -d whitepinedev.jpkramer.com`
   * `sudo certbot renew --dry-run`
3. Hardening:

   * Enable gzip/br
   * After stable, enable HSTS
   * Add a strict CSP (allow only your domains, Next/Image hosts as needed)

---

## 13) PM2 processes (compiled outputs only)

* `next:prod` → `next start -p 3000` in `apps/web`
* `api:prod`  → `node apps/api/dist/server.js`
* `next:dev`  → `next start -p 3001`
* `api:dev`   → `node apps/api/dist/server.js` (with dev env)
* Save & boot: `pm2 save`

*(Environment separation comes from which env file each PM2 process loads; see next step.)*

---

## 14) Environment files (server, not committed)

Create:

```
/var/www/whitepine/shared/env/prod.env
/var/www/whitepine/shared/env/dev.env
```

Each includes:

* `NODE_ENV=production`
* `BASE_URL=...` (prod or dev host)
* `PORT_WEB`, `PORT_API` (optional)
* `MONGODB_URI=...` (env-specific user/db)
* `SESSION_SECRET=...`
* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
* `S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

---

## 15) CI/CD (GitHub Actions → SSH/rsync)

1. **Secrets** in GitHub:

   * `SSH_PRIVATE_KEY`, `LIGHTSAIL_HOST`, `LIGHTSAIL_USER` (`deploy`)
   * All env vars, split by environment (GitHub Environments or suffixes)
2. **Branch mapping**:

   * `main` → production
   * `develop` → dev host
3. **Workflow steps** (per env):

   1. Checkout; setup Node 20 + pnpm
   2. `pnpm i -w`
   3. `pnpm build` (web + api; tsup compiles API + migrations CJS)
   4. Package **artifacts**:

      * `apps/web/.next`, `apps/web/public`, minimal `package.json` for runtime
      * `apps/api/dist`, `apps/api/migrations` (compiled), `package.json`
      * `apps/ops` (nginx templates, pm2 ecosystem, deploy scripts)
   5. **rsync** to `/var/www/whitepine/releases/<timestamp>/`
   6. Write `/var/www/whitepine/shared/env/{prod|dev}.env` from secrets
   7. **Run migrations**: `migrate-mongo up` (working dir `apps/api`, migrations dir points to compiled folder)
   8. Flip `current` symlink → new release
   9. `pm2 reload` the two processes for that env
   10. `nginx -t && sudo systemctl reload nginx`
   11. Health checks: hit `GET /` and `/api/healthz` on the target host

**Rollback:** change `current` symlink to previous release; `pm2 reload` the two processes.

---

## 16) DNS

* Create/confirm Route 53 A records:

  * `whitepine.jpkramer.com` → Lightsail static IP
  * `whitepinedev.jpkramer.com` → same IP
* Keep TTL = 300s until stable.

---

## 17) MongoDB Atlas

* One cluster; two DBs: `whitepine_prod`, `whitepine_dev`.
* Separate DB users per env; least privilege.
* IP allow list: Lightsail static IP (and your workstation temp if needed).
* Enable backups + PITR.

---

## 18) Final verification

1. HTTPS works for both domains (certbot OK).
2. Dev host prompts **Basic Auth** (`dev` user).
3. Google OAuth flows complete on both hosts (callback allowed).
4. S3 presign/upload works (dev).
5. ISR updates appear within the chosen windows / via on-demand revalidate.
6. Migrations applied (check `_migrations` collection and created indexes).
7. PM2 logs healthy; Nginx access/error logs clean.

---

### Notes on ESM + migrations

* Your **API runtime** is **ESM**.
* **migrate-mongo** currently expects **CommonJS** migrations; hence you **compile only the migrations** to **CJS** in the build step (keep app ESM). This keeps everything smooth in CI and production.
