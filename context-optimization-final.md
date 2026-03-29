# Context Optimization — Final Confirmed Report
> Repo: `express-react-boilerplate` | Date: 2026-03-28 | All measurements confirmed

---

## Repository Overview

| Item | Value |
|------|-------|
| Type | Single-package Node.js (not a true monorepo) |
| Stack | Express 5 (alpha) + React 17 / Redux |
| Build | Webpack 4 |
| ORM | Knex + Bookshelf |
| DB | MySQL |
| Logging | Winston + daily-rotate-file |
| API Docs | Swagger (swagger-jsdoc, inline JSDoc on routes) |

---

## Confirmed Directory Sizes

| Directory | Confirmed Size | Purpose |
|-----------|---------------|---------|
| `node_modules/` | **336 MB** | npm dependencies |
| `dist/` | **25 MB** | Webpack build output (generated) |
| `public/` | **8.8 MB** | Static assets — 8.8 MB is almost entirely Swagger vendor |
| `public/swagger/` | 8.8 MB | Vendored Swagger UI + source maps |
| `public/img/` | 8 KB | Static images (binary) |
| `public/css/` | 1 KB | Static CSS |
| `.git/` | ~19 MB | Git internals (18.4 MB pack file) |
| `client/` | 121 KB | React source — actual project code |
| `server/` | 63 KB | Express source — actual project code |
| `webpack/` | 8 KB | Build configs (2 files) |
| `logs/` | 10 KB | Runtime Winston logs |

**Key ratio:** `node_modules` + `dist` + `public/swagger` = ~370 MB of non-source vs ~184 KB of actual project code.

---

## Top 20 Largest Files (outside node_modules)

| # | Path | Size | Lines | Type |
|---|------|------|-------|------|
| 1 | `.git/objects/pack/*.pack` | 18.4 MB | — | Git pack |
| 2 | `dist/0.client.bundle.js` | 16.0 MB | 138,367 | Webpack bundle |
| 3 | `dist/client.bundle.js` | 9.9 MB | 114,938 | Webpack bundle |
| 4 | `public/swagger/swagger-ui-bundle.js.map` | 4.2 MB | — | Source map |
| 5 | `public/swagger/swagger-ui-standalone-preset.js.map` | 1.4 MB | — | Source map |
| 6 | `public/swagger/swagger-ui.js.map` | 1.3 MB | — | Source map |
| 7 | `public/swagger/swagger-ui-bundle.js` | 974 KB | 133 (minified) | Vendored JS |
| 8 | `package-lock.json` | 666 KB | 16,726 | Lockfile |
| 9 | `public/swagger/swagger-ui.css.map` | 483 KB | — | Source map |
| 10 | `public/swagger/swagger-ui.js` | 361 KB | — | Vendored JS |
| 11 | `public/swagger/swagger-ui-standalone-preset.js` | 307 KB | — | Vendored JS |
| 12 | `public/swagger/swagger-ui.css` | 142 KB | — | Vendored CSS |
| 13 | `dist/2.client.bundle.js` | 75 KB | 930 | Webpack chunk |
| 14 | `dist/1.client.bundle.js` | 60 KB | 720 | Webpack chunk |
| 15 | `dist/3.client.bundle.js` | 40 KB | 477 | Webpack chunk |
| 16 | `.git/objects/pack/*.idx` | 36 KB | — | Git index |
| 17 | `public/img/avatar5.png` | 8 KB | — | Binary image |
| 18 | `logs/2026-03-24-log.log` | 7 KB | — | Log file |
| 19 | `server/routes/user.route.js` | 6 KB | 254 | Source |
| 20 | `package.json` | 3.6 KB | 114 | Manifest |

---

## Top 15 Source Files by Line Count

| # | Path | Lines | Type |
|---|------|-------|------|
| 1 | `server/routes/user.route.js` | 254 | Source |
| 2 | `client/components/common/drawer/MiniDrawer.js` | 138 | Source |
| 3 | `server/controllers/user.controller.js` | 137 | Source |
| 4 | `client/utils/commonUtil.js` | 119 | Source |
| 5 | `package.json` | 114 | Manifest |
| 6 | `client/components/auth/SignUpForm.js` | 94 | Source |
| 7 | `client/components/auth/LoginForm.js` | 94 | Source |
| 8 | `server/routes/auth.route.js` | 83 | Source |
| 9 | `client/actions/crudAction.js` | 84 | Source |
| 10 | `client/components/common/header/Header.js` | 86 | Source |

---

## Existing .gitignore Rules

```
/.idea           → JetBrains IDE dir
/node_modules    → npm dependencies
.env             → secrets
/logs            → runtime logs
/dist            → build output
npm-debug.log    → npm debug log
```

> `dist/` and `logs/` are gitignored but **physically present** — visible to file-scanning tools.

---

## Exclusion Candidates

### A: Absolute Block — Secrets

| Path | Evidence | False-Exclusion Risk | Alternative |
|------|----------|---------------------|-------------|
| `.env` | 24 lines; gitignored; contains DB host/user/pass + JWT secret (confirmed via `.env.example`) | None | Read `.env.example` for key shape; user pastes non-secret values manually |

---

### B: Strongly Recommended — Huge Artifacts / Generated / Dependencies

| Path | Confirmed Size | Evidence | False-Exclusion Risk | Alternative |
|------|---------------|----------|---------------------|-------------|
| `node_modules/` | **336 MB** | npm deps; gitignored; never project code | Near zero | Read `package.json`; run `npm list <pkg>` in terminal |
| `dist/` | **25 MB** | Webpack output; 138k + 114k minified lines; gitignored | Low — source is in `client/` | Run `npm run build`; paste terminal output if needed |
| `public/swagger/` | **8.8 MB** | Vendored Swagger UI + `.map` files; zero project logic | Low — API docs are in route JSDoc annotations | Read `server/config/swagger.js` instead |
| `.git/objects/pack/` | **18.4 MB** | Git pack file; not human-readable | None | Use `git log` / `git diff` via shell |
| `package-lock.json` | **666 KB / 16,726 lines** | Lockfile; `package.json` (114 lines) has all actionable info | Low | Run `npm list <pkg>` or `npm why <pkg>` in terminal |
| `logs/` | **10 KB** (grows) | Runtime Winston logs; gitignored; changes every run | Low | User pastes relevant lines directly |
| `public/img/` | **8 KB** | Binary PNG files; not code | None | Reference by filename only |

---

### C: Needs Confirmation — Project-Dependent / Risk of False Exclusion

| Path | Evidence | False-Exclusion Risk | Alternative |
|------|----------|---------------------|-------------|
| `public/swagger/*.map` | Swagger's own internal source maps (4.2 MB largest); not project maps | Low | Exclude unless debugging Swagger UI rendering itself |
| `readme.md` | 57 lines; setup docs, API overview | Medium — useful for onboarding/docs tasks | Read on demand only |
| `server/migrations/` | 1 migration file; authoritative DB schema source | Medium — needed for model/DB work | Include when schema context is required |
| `.babelrc` / `.eslintrc` / `.prettierrc` | 10–25 lines each; relevant only when changing build/lint/format config | Low — small files | Include on demand |
| `public/index.html` | SPA HTML shell; rarely edited | Low | Include only when editing shell or CSP headers |

---

## Token-Saving Priority (high → low)

```
node_modules (336 MB)
  > dist/ (25 MB)
  > public/swagger/ (8.8 MB)
  > .git/objects/ (18.4 MB)
  > package-lock.json (666 KB / 16k lines)
  > logs/ (runtime, grows)
  > public/img/ (binary)
```

---

## Output Files

| File | Purpose |
|------|---------|
| `.claude/settings.json` | Enforces deny/ask/allow per category above |
| `CLAUDE.md` | Working rules, reading protocol, fix procedure, log SOP, unblock guide |

---

## Settings Summary (.claude/settings.json)

**Deny — secrets:** `.env`, `*.pem`, `*.key`, `**/secrets/**`

**Deny — huge/generated:**
- `node_modules/**`
- `dist/**`
- `.git/objects/**`
- `public/swagger/*.js`, `public/swagger/*.map`, `public/swagger/*.css*`
- `logs/**`
- `public/img/**`

**Ask — Category C:**
- `package-lock.json`
- `readme.md`
- `server/migrations/**`
- `.babelrc`, `.eslintrc`, `.eslintignore`, `.prettierrc`, `.prettierignore`
- `public/index.html`, `public/swagger/index.html`, `public/swagger/oauth2-redirect.html`

**Allow — source + safe ops:**
- `client/**`, `server/**`, `webpack/**`
- `package.json`, `knexfile.js`, `.env.example`, `CLAUDE.md`
- `npm run lint`, `npm run build`, `npm run migrate`, `npm run webpack:dev`
- `git log*`, `git diff*`, `git status*`
