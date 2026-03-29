# Context Optimization Report
> Generated: 2026-03-28 | Repo: `express-react-boilerplate`

---

## Repository Overview

| Item | Value |
|------|-------|
| Type | Single-package Node.js (not a true monorepo) |
| Stack | Express (backend) + React/Redux (frontend) |
| Build | Webpack |
| ORM | Knex + Bookshelf |
| DB | MySQL |
| Logging | Winston |
| API Docs | Swagger UI |

**Key directories:** `client/` (React source), `server/` (Express source), `dist/` (Webpack output), `public/` (static assets + vendored Swagger), `logs/` (Winston runtime logs), `webpack/` (2 config files), `node_modules/`

---

## Top 30 Largest Files (outside node_modules)

| # | Path | Size | Type |
|---|------|------|------|
| 1 | `.git/objects/pack/*.pack` | 18.4 MB | Git pack |
| 2 | `dist/0.client.bundle.js` | 16.0 MB | Webpack bundle |
| 3 | `dist/client.bundle.js` | 9.9 MB | Webpack bundle |
| 4 | `public/swagger/swagger-ui-bundle.js.map` | 4.2 MB | Source map |
| 5 | `public/swagger/swagger-ui-standalone-preset.js.map` | 1.4 MB | Source map |
| 6 | `public/swagger/swagger-ui.js.map` | 1.3 MB | Source map |
| 7 | `public/swagger/swagger-ui-bundle.js` | 974 KB | Vendored JS |
| 8 | `package-lock.json` | 666 KB | Lockfile |
| 9 | `public/swagger/swagger-ui.css.map` | 483 KB | Source map |
| 10 | `public/swagger/swagger-ui.js` | 361 KB | Vendored JS |
| 11 | `public/swagger/swagger-ui-standalone-preset.js` | 307 KB | Vendored JS |
| 12 | `public/swagger/swagger-ui.css` | 142 KB | Vendored CSS |
| 13 | `dist/2.client.bundle.js` | 75 KB | Webpack chunk |
| 14 | `dist/1.client.bundle.js` | 60 KB | Webpack chunk |
| 15 | `dist/3.client.bundle.js` | 40 KB | Webpack chunk |
| 16 | `.git/objects/pack/*.idx` | 36 KB | Git index |
| 17 | `logs/2026-03-24-log.log` | 7 KB | Log file |
| 18 | `public/img/avatar5.png` | 8 KB | Binary image |
| 19 | `server/routes/user.route.js` | 6 KB | Source |
| 20 | `package.json` | 3.6 KB | Manifest |

---

## Top 30 Files by Line Count (outside node_modules)

| # | Path | Lines | Type |
|---|------|-------|------|
| 1 | `dist/0.client.bundle.js` | 138,367 | Generated |
| 2 | `dist/client.bundle.js` | 114,938 | Generated |
| 3 | `package-lock.json` | 16,726 | Lockfile |
| 4 | `dist/2.client.bundle.js` | 930 | Generated |
| 5 | `dist/1.client.bundle.js` | 720 | Generated |
| 6 | `dist/3.client.bundle.js` | 477 | Generated |
| 7 | `server/routes/user.route.js` | 254 | Source |
| 8 | `client/components/common/drawer/MiniDrawer.js` | 138 | Source |
| 9 | `server/controllers/user.controller.js` | 137 | Source |
| 10 | `public/swagger/swagger-ui-bundle.js` | 133 (minified) | Vendored |
| 11 | `client/utils/commonUtil.js` | 119 | Source |
| 12 | `package.json` | 114 | Manifest |
| 13 | `client/components/auth/SignUpForm.js` | 94 | Source |
| 14 | `client/components/auth/LoginForm.js` | 94 | Source |
| 15 | `client/actions/crudAction.js` | 84 | Source |

---

## Top 15 Largest Directories

| # | Path | Approx Size | Purpose |
|---|------|-------------|---------|
| 1 | `node_modules/` | hundreds of MB (est.) | npm dependencies |
| 2 | `.git/` | ~19 MB | Git internals |
| 3 | `dist/` | ~26 MB | Webpack build output |
| 4 | `public/swagger/` | 8.8 MB | Vendored Swagger UI |
| 5 | `public/img/` | 8 KB | Static images |
| 6 | `public/css/` | ~1 KB | Static CSS |
| 7 | `client/` | ~100 KB | React source |
| 8 | `server/` | ~50 KB | Express source |
| 9 | `webpack/` | ~5 KB | Build config |
| 10 | `logs/` | ~15 KB | Runtime logs |

---

## Existing Ignore Rules (.gitignore)

```
/.idea           → JetBrains IDE dir
/node_modules    → npm dependencies
.env             → secrets
/logs            → runtime logs
/dist            → build output
npm-debug.log    → npm debug log
```

> Note: `dist/` and `logs/` are gitignored but **physically present** in the working tree — they will be visible to file-scanning tools.

---

## Worth-Reading Assessment

| Item | Worth Reading? | Rationale |
|------|---------------|-----------|
| `client/**/*.js` | Yes | Primary React source |
| `server/**/*.js` | Yes | Primary Express source |
| `webpack/*.js` | Yes (small) | Build config |
| `package.json` | Yes | Scripts, deps |
| `knexfile.js` | Yes (small) | DB config shape |
| `.env.example` | Yes | Documents env vars safely |
| `package-lock.json` | No | 16k lines, too noisy; `package.json` suffices |
| `dist/**` | No | Generated, unreadable minified code |
| `node_modules/**` | No | Not project code |
| `public/swagger/**` | No | External vendor assets |
| `logs/**` | No | Runtime noise |
| `.env` | No | Secrets — never read |
| `public/img/**` | No | Binary assets |
| `.git/**` | No | Git internals |

---

## Exclusion Candidates

### A: Absolute Block (Secrets)

| Path | Evidence | False-Exclusion Risk | Alternative |
|------|----------|---------------------|-------------|
| `.env` | 24-line file in repo root; gitignored; contains DB host/user/pass, JWT secret (confirmed from `.env.example`) | None — reading secrets is always wrong | Read `.env.example` for config shape; ask user to paste specific non-secret values |

---

### B: Strongly Recommended (Huge Artifacts / Generated / Dependencies)

| Path | Evidence | False-Exclusion Risk | Alternative |
|------|----------|---------------------|-------------|
| `node_modules/` | Hundreds of MB; npm deps; already gitignored | Near zero — standard practice | Ask user for specific package name; read `package.json` for dep list |
| `dist/` | 26 MB total; `0.client.bundle.js` = 138k lines of minified code; Webpack output; gitignored | Low — source is in `client/` | Ask user to rebuild (`npm run build`) if bundle behavior needs checking |
| `public/swagger/` | 8.8 MB; entirely vendored Swagger UI static assets + `.map` files; no project code | Low — project API docs are in route annotations | Read `server/config/swagger.js` for Swagger configuration |
| `package-lock.json` | 666 KB / 16,726 lines; `package.json` (114 lines) has all actionable info | Low — version pins rarely matter for code tasks | Ask user for exact version if a specific package version is relevant |
| `logs/` | Runtime Winston logs; gitignored; content changes every run; zero source relevance | Low | Ask user to paste relevant log lines when debugging a runtime error |
| `.git/` | 19 MB pack file; git internals; never useful to read directly | None | Use `git log` / `git diff` via shell instead |
| `public/img/` | Binary PNG files; not code | None | Reference by filename only |

---

### C: Needs Confirmation (Project-Dependent / Risk of False Exclusion)

| Path | Evidence | False-Exclusion Risk | Alternative |
|------|----------|---------------------|-------------|
| `public/swagger/*.map` | Source maps for vendored Swagger UI (4.2 MB largest); not project source maps | Low — Swagger's own internal maps | Exclude unless debugging Swagger UI rendering itself |
| `readme.md` | 57 lines; documents project setup; contains setup steps, DB config docs, API overview | Medium — useful for onboarding or writing docs | Read on demand; exclude from auto-scan |
| `server/migrations/` | Single migration file; useful for DB schema understanding | Medium — authoritative schema source when doing DB/model work | Include when schema context is needed; exclude otherwise |
| `.babelrc` / `.eslintrc` / `.prettierrc` | Small config files (~10–25 lines each); useful only when changing transpile/lint/format config | Low — small enough that reading them wastes minimal tokens | Include on demand |
| `public/index.html` | The HTML shell for the SPA; rarely needs editing | Low | Include only when editing the HTML shell or CSP headers |

---

## Token-Saving Priority (high to low)

```
node_modules  >  dist/  >  public/swagger/  >  .git/  >  package-lock.json  >  logs/  >  public/img/
```
