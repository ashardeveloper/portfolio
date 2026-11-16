# Ashar Mahmood — Portfolio

Next.js (App Router) + TypeScript + Tailwind CSS, with Framer Motion, Lenis and Three.js (via @react-three/fiber), and a built-in admin dashboard for editing every section. Content is stored in MySQL on the live site and in plain files on your computer.

## Run

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. Production build: `npm run build`, then `npm run start`.

## Admin dashboard

Open http://localhost:3000/admin and sign in with the password in `.env.local` (`ADMIN_PASSWORD`).

| Page | What you can do |
|---|---|
| Dashboard | Counts, a "needs attention" list, and which sections are visible |
| Hero and profile | Name, role, rotating roles, photo, availability badge, email, links, CV |
| About | Bio paragraphs, stat counters, "now learning", languages |
| Skills | Add, edit, delete and reorder skill groups and the 3D cloud labels |
| Experience | Add, edit, delete and reorder roles, bullets, stack and metrics |
| Education / Certifications | Add, edit, delete and reorder entries |
| Projects | Add, edit, delete, reorder, hide or publish projects; upload screenshots; set the flagship |
| Section headings | Show or hide each section and edit its heading |

Saving updates the public site immediately. `Ctrl+S` saves; leaving a page with unsaved changes asks first.

### Setup

To run on your computer, copy `.env.example` to `.env.local` and set:

- `ADMIN_PASSWORD` — at least 8 characters
- `ADMIN_SESSION_SECRET` — at least 32 random characters

The admin stays locked until both are set. `.env.local` is not committed to git.

### Where content is stored

The site has two storage modes and picks one automatically:

| Mode | When | Text | Uploaded images and PDFs |
|---|---|---|---|
| Files | No database settings (your computer) | `data/content.json` | `data/uploads/` |
| Database | `DB_HOST`, `DB_USER` and `DB_NAME` are set (the live site) | `portfolio_content` table | `portfolio_uploads` table |

The dashboard shows the active mode under the welcome line. Uploads are served at `/media/...` in both modes.

In database mode the tables are created automatically. The first time the site runs against an empty database it copies in the content from `data/content.json` as it was when the site was built. After that the database is the source of truth: later changes to `data/content.json` do not reach the live site.

If the database is unreachable, the public site keeps showing the last content it loaded, and the admin shows a warning and refuses to save.

### Security

- Signed, http-only session cookie; 7-day expiry
- Login limited to 5 attempts per 15 minutes per IP
- Every save re-checks the session and validates the data against `src/lib/schema.ts`
- Database queries are parameterised; the database password stays in environment variables
- Uploads: signed-in only, same-origin only, 8 MB limit, type checked from the file's contents
- `/admin` is excluded from search engines

## Deploying to Hostinger

Needs a plan that includes Node.js web apps (Unlimited or higher; Premium does not). Content is stored in the MySQL database included in the plan, so there is nothing else to sign up for.

1. **Put the code on GitHub.** `.env.local` is not committed, so your password stays private.
2. **Create the database.** In hPanel open **Databases**, create a MySQL database and user, and note the database name, user name and password.
3. **Create the app.** In hPanel add a Node.js web app and import the GitHub repository. Hostinger detects the settings; they should be: application type `next`, build script `build`, output directory `.next`, Node.js 22.
4. **Add the environment variables** before the first deploy:

   | Variable | Value |
   |---|---|
   | `ADMIN_PASSWORD` | Your admin password (at least 8 characters) |
   | `ADMIN_SESSION_SECRET` | At least 32 random characters |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |
   | `DB_HOST` | `127.0.0.1`, or the host hPanel shows for the database |
   | `DB_PORT` | `3306` |
   | `DB_USER` | Database user name |
   | `DB_PASSWORD` | Database password |
   | `DB_NAME` | Database name |

5. **Deploy**, open the site once, then sign in at `/admin`. The dashboard should say "Storage: MySQL database".

`NEXT_PUBLIC_SITE_URL` is read during the build, so redeploy after changing it. Hostinger's guides: [Next.js](https://docs.hostinger.com/node.js/overview-1/next), [build settings](https://docs.hostinger.com/node.js/build-settings).

### After going live

- Edit content in the live admin. It is saved in the database and survives redeploys.
- Upload new images in the live admin too. Files uploaded on your computer go to `data/uploads/` and are not deployed.
- Running the site on your computer still uses the files in `data/`, so local experiments never touch the live content.
- Backups: Hostinger's daily backups cover the database. For your own copy, export the two `portfolio_` tables from phpMyAdmin.

### Other hosts

- **Any Node host with a writable disk** (a VPS): works in file mode without a database; keep `data/` on a persistent disk.
- **Vercel:** deployed files are read-only, so file mode cannot save there. Point the `DB_*` variables at a MySQL database reachable from Vercel.

## Project structure

| Path | Contains |
|---|---|
| `src/app/(site)` | Public pages |
| `src/app/admin` | Admin pages, server actions, upload endpoint |
| `src/components` | Public site components (`HeroScene.tsx` and `SkillsCloud.tsx` are the Three.js scenes) |
| `src/components/admin` | Form building blocks and the editor definitions (`schemas.ts`) |
| `src/lib` | Content schema, storage (`content.ts`, `uploads.ts`, `db.ts`), auth |
| `data` | Starting content, and uploads in file mode |

## Notes

- The contact form has no backend: it opens the visitor's email app with the message filled in.
- The CV is downloadable by anyone and includes a phone number.
