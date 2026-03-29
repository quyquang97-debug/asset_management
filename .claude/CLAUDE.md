# CLAUDE.md — Working Rules for This Repo

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | Express 5 (alpha), Knex + Bookshelf, MySQL |
| Frontend | React 17, Redux, Redux-Form, Material-UI v4 |
| Build | Webpack 4 (dev HMR / prod minified) |
| Auth | JWT (jsonwebtoken + bcrypt) |
| Logging | Winston + winston-daily-rotate-file |
| API Docs | Swagger (swagger-jsdoc, routes annotated inline) |

---

## Key Directories

| Path | Role |
|------|------|
| `server/` | Express app: routes, controllers, middlewares, models, migrations, config |
| `client/` | React app: components, actions, reducers, services, routers, store |
| `webpack/` | Build configs (`webpack.config.dev.js`, `webpack.config.prod.js`) |
| `public/` | Static shell (`index.html`, `css/`, `img/`) + vendored Swagger UI |
| `dist/` | **Generated** — Webpack output, never read or edit directly |
| `logs/` | **Runtime only** — Winston daily log files, never read directly |
| `node_modules/` | **Dependencies** — never read |
| `.env` | **Secret** — never read; see `.env.example` for shape |

---

## Common Commands

```bash
# Dev build + start (clears dist first)
npm run build

# Production build + start
npm run build:prod

# Lint client + server
npm run lint

# DB migrations
npm run migrate           # apply latest
npm run migrate:rollback  # rollback one step
npm run migrate:make      # create new migration file

# Webpack only (no server start)
npm run webpack:dev
npm run webpack:prod
```

---

## Reading Protocol

**Before reading any file, state the purpose.**

1. **Declare** — "I need to read X to understand Y."
2. **Read** — read only the file(s) needed.
3. **Summarize** — one sentence: what was found.
4. **Proceed** — next action, or stop if enough.

**Default:** start with diffs and error logs; expand reads only if needed.

```
git diff HEAD          # what changed
git log --oneline -10  # recent history
```

Do not speculatively read files not yet relevant to the task.

---

## Fix Procedure

```
1. Hypotheses  — list possible root causes (brief)
2. Verify      — read the minimum files needed to confirm
3. Fix         — make the change
4. Test        — run lint / build / manual check
5. Done        — state what was changed and why
```

---

## Log Pasting SOP

When a runtime error occurs:

1. Paste **only the relevant section** of the log (not the entire file).
2. Include the line with the error + ~5 lines above for context.
3. Log files are in `logs/YYYY-MM-DD-log.log` — open in editor, do not ask Claude to read them.
4. If the error is from Webpack, paste the terminal output directly.

---

## Absolute Prohibitions

- Never read `.env`, `*.pem`, `*.key`, `*.p12`, `*.keystore`, `id_rsa`, `**/secrets/**`, `**/credentials/**`
- Never propose or execute: `rm -rf`, `git reset --hard`, `git push --force`, `DROP TABLE`, `DROP DATABASE`, `mkfs`, `format`
- Never paste secrets, API keys, tokens, or passwords into any file under `docs/` or `.claude/`
- Never modify application source code during Phase 0 (only settings and documentation)

---

## Permission Model

Permissions are enforced via `.claude/settings.json`.
Priority: **deny > ask > allow**

| Tier | Coverage |
|------|----------|
| deny | Secrets, generated artifacts, dependencies, destructive commands |
| ask | Lockfiles, docs, migrations, rc configs |
| allow | `client/**`, `server/**`, `webpack/**`, core config files, safe npm/git commands |

---

## Do Not Read (enforced by `.claude/settings.json`)

| Path | Reason |
|------|--------|
| `.env` | Contains secrets (DB credentials, JWT secret) |
| `dist/**` | Generated minified bundles — 138k+ lines, unreadable |
| `node_modules/**` | Dependencies, not project code |
| `public/swagger/*.js` / `*.map` | Vendored Swagger UI — 8.8 MB, not project code |
| `logs/**` | Runtime output — paste relevant lines instead |
| `.git/objects/**` | Git internals |
| `public/img/**` | Binary assets |

---

## Ask Before Reading (Category C)

| Path | When it's useful |
|------|-----------------|
| `package-lock.json` | Only if debugging an exact transitive dep version |
| `readme.md` | Onboarding or writing documentation |
| `server/migrations/**` | Verifying DB schema when working on models |
| `.babelrc` / `.eslintrc` / `.prettierrc` | Changing transpile/lint/format config |
| `public/index.html` | Editing the SPA shell or CSP headers |

---

## Where Claude Gets Stuck — and How to Unblock

| Situation | Likely block | Resolution |
|-----------|-------------|------------|
| DB schema unclear | `migrations/` is ask-gated | Paste the migration file content, or approve the ask prompt |
| Lockfile version conflict | `package-lock.json` is ask-gated | Run `npm list <package>` in terminal and paste output |
| Runtime error not reproducible | `logs/` is denied | Paste the relevant log lines directly into the chat |
| Webpack bundle behavior unexpected | `dist/` is denied | Run `npm run webpack:dev` and paste the terminal output |
| Swagger endpoint shape unclear | `public/swagger/` is denied | Read `server/config/swagger.js` and route JSDoc annotations instead |
| `.env` value needed | `.env` is always denied | Paste only the non-secret key name; check `.env.example` for shape |
| Transitive dep issue | `node_modules/` is denied | Run `npm list <package>` or `npm why <package>` and paste output |

---

## Storage Locations

| Path | Purpose |
|------|---------|
| `docs/architecture/` | Living architecture decisions |
| `docs/standards/` | Coding and process standards |
| `docs/changes/` | Deliverables per ticket/PR |
| `docs/maintenance/` | Phase execution logs and evidence |
| `.claude/rules/` | Safety and operational rule files |

---

## Authoritative Sources

| Question | Source |
|----------|--------|
| Env var shape | `.env.example` |
| DB schema | `server/migrations/` (ask-gated) |
| Build scripts | `package.json` scripts |
| API endpoints | `server/routes/` + JSDoc annotations |
| Permissions | `.claude/settings.json` |
| Phase evidence | `docs/maintenance/phase*/` |
