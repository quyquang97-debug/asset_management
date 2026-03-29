# Architecture Overview

> Evidence-based: rút ra từ code đọc 2026-03-28

---

## Layer Structure

```
┌─────────────────────────────────────────┐
│              Browser (React SPA)         │
│  components → containers → actions      │
│  reducers ← store ← redux-thunk         │
│  services (httpService / authService)    │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON  (axios → /api/*)
┌──────────────▼──────────────────────────┐
│           Express Server                 │
│  middlewares (cors, bodyParser, morgan)  │
│  routes → Joi validate → controllers    │
│  models (Bookshelf/Knex) → MySQL        │
│  middlewares (auth, errorHandler)        │
└─────────────────────────────────────────┘
```

**Evidence:** `server/app.js`, `server/config/express.js`, `server/routes/index.route.js`, `client/main.js`

---

## Responsibilities Per Layer

| Layer | Responsibility | Must NOT |
|-------|---------------|---------|
| `client/components/` | Render UI, local form state | Call API directly, hold business logic |
| `client/containers/` | Connect Redux state to components | Contain JSX rendering logic |
| `client/actions/` | Dispatch API calls, dispatch reducers | Handle UI state |
| `client/services/` | Wrap axios calls, path construction | Know about Redux |
| `client/reducers/` | Derive new state from actions | Have side effects |
| `server/routes/` | URL mapping + Joi validation + Swagger JSDoc | Business logic |
| `server/controllers/` | Orchestrate model calls, format response | Direct DB queries (use Model) |
| `server/models/` | Bookshelf Model definition, table mapping | Business rules |
| `server/middlewares/` | Cross-cutting: auth, logging, errors | Route-specific logic |

**Evidence:** `server/routes/user.route.js` (Joi + Swagger in route), `server/controllers/user.controller.js` (model calls only), `server/models/user.model.js` (table mapping only)

---

## Dependency Direction

```
components → containers → actions → services → httpUtil (axios)
                ↓
            reducers ← store

routes → middlewares → controllers → models → DB (MySQL via Knex)
```

Rule: **dependencies flow downward only**. No circular imports. Models do not import controllers. Reducers do not import actions.

---

## Key Components

### Backend

| File | Role |
|------|------|
| `server/config/express.js` | App instance, middleware registration |
| `server/app.js` | Entry: webpack HMR + swagger + routes + error handlers |
| `server/routes/index.route.js` | Mount `/auth` and `/users` sub-routers |
| `server/middlewares/authenticate.js` | JWT verify → `req.currentUser` |
| `server/middlewares/errorHandler.js` | Generic 500, 404, 405 JSON responses |
| `server/middlewares/joiErrorHandler.js` | Joi validation error → 400 response |
| `server/config/joi.validate.js` | Joi middleware factory |
| `server/utils/validator.js` | Joi schema definitions |
| `server/config/winston.js` | Logger: console + daily-rotate-file |

### Frontend

| File | Role |
|------|------|
| `client/main.js` | Entry: Provider + ConnectedRouter + MuiThemeProvider |
| `client/store/configureStore.js` | Redux store + history |
| `client/actions/crudAction.js` | Generic CRUD thunks (entity-based) |
| `client/actions/commonAction.js` | Action creators for all entity action types |
| `client/services/httpService.js` | Entity-name-based API path construction |
| `client/utils/httpUtil.js` | Axios instance wrapper (fetch/store/update/destroy) |
| `client/reducers/crudReducer.js` | Generic entity state reducer |
| `client/reducers/authReducer.js` | Auth state (token, user) |

---

## Tech Stack Summary

| Concern | Technology | Version |
|---------|-----------|---------|
| Backend runtime | Node.js + Babel (ESM) | ≥6.9 |
| HTTP framework | Express | 5.0.0-alpha.7 |
| ORM | Bookshelf + Knex | 1.2.0 / 0.95.4 |
| Database | MySQL | via `mysql` pkg |
| Auth | JWT (jsonwebtoken) + bcrypt | — |
| Input validation | @hapi/joi | 17.1.1 |
| Logging | Winston + daily-rotate-file | 3.3.3 |
| API docs | swagger-jsdoc (inline JSDoc) | 4.3.2 |
| Frontend framework | React | 17.0.2 |
| State management | Redux + redux-thunk | 4.0.4 |
| Form management | redux-form | 8.3.7 |
| UI library | Material-UI | v4.11.3 |
| HTTP client | axios (via httpUtil) | 0.21.1 |
| Build | Webpack 4 + Babel | — |
| CI | **None configured** | — |
| Test suite | **None configured** | — |

---

## Notable Constraints / Gaps

| Item | Detail |
|------|--------|
| Express 5 alpha | Pre-release; async error handling differs from Express 4 |
| No CI pipeline | `.github/` does not exist; no Jenkinsfile |
| No test suite | No test files found; `.eslintrc` references `jasmine` env but no specs exist |
| CORS open | `app.use(cors())` — no origin whitelist in `server/config/express.js` |
| JWT no expiry | `jwt.sign()` in `auth.controller.js` has no `expiresIn` option |
| Token in localStorage | Implied by `jwtUtil` — XSS risk; acceptable trade-off for SPA |
