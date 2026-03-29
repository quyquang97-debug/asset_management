# Security Standards

> Evidence-based: rút ra từ code đọc 2026-03-28

---

## 1. Input Validation

**Rule:** All body inputs on mutating routes (POST/PUT/PATCH) must pass through a Joi schema before reaching the controller.

```js
// ✅ Correct — route-level Joi validation
router.route('/').post(validate(schema.storeUser), (req, res) => {
    userCtrl.store(req, res);
});

// ❌ Wrong — no validation before controller
router.route('/').post((req, res) => {
    userCtrl.store(req, res);
});
```

**Evidence:** `server/routes/user.route.js:122`, `server/config/joi.validate.js`, `server/utils/validator.js`

Schema definitions go in `server/utils/validator.js`. Middleware factory is `server/config/joi.validate.js`.

Validation options: `{ abortEarly: false }` — collect all errors, not just the first.

---

## 2. Authentication

**Rule:** All state-mutating routes (POST/PUT/DELETE) must use `isAuthenticated` middleware unless the endpoint is explicitly public (e.g., login, signup).

```js
// ✅ Protected
router.route('/:id').put(isAuthenticated, (req, res) => { ... });

// ⚠️ Known gap — POST /users has no isAuthenticated
router.route('/').post(validate(schema.storeUser), (req, res) => { ... });
```

**Evidence:** `server/middlewares/authenticate.js`, `server/routes/user.route.js:122,221,250`

JWT is extracted from `Authorization: Bearer <token>` header.
`req.currentUser` is set to the authenticated user object — use this, never trust user-supplied IDs for ownership checks.

---

## 3. Password Handling

- Passwords hashed with `bcrypt` (saltRounds=10) on create: `bcrypt.hashSync(req.body.password, 10)`
- Compared with `bcrypt.compareSync(plaintext, hash)` on login
- **Never** store or log plaintext passwords
- **Never** return the `password` field in API responses

**Evidence:** `server/controllers/user.controller.js:64`, `server/controllers/auth.controller.js:20`

---

## 4. JWT

- Secret read from `process.env.TOKEN_SECRET_KEY` — never hardcoded
- **Known gap:** No `expiresIn` on `jwt.sign()` → tokens never expire
- When adding expiry: use `expiresIn: '1h'` or `'24h'` depending on use case
- Do not put sensitive data in JWT payload — only `{id, email}` is current practice

**Evidence:** `server/controllers/auth.controller.js:22-25`

---

## 5. Logging & PII

- Logger: Winston (`server/config/winston.js`) — console + daily-rotate-file (14d retention)
- Log **error messages and stack traces**, not request bodies
- **Never** log passwords, tokens, or full user objects
- Current practice in `auth.controller.js`: logs error string only (`logger.log('error', 'Authentication failed. Invalid password.')`) — correct pattern

```js
// ✅ Safe — log message only
logger.log('error', 'Authentication failed. Invalid password.');

// ❌ Unsafe — logs sensitive data
logger.log('error', JSON.stringify(req.body));
logger.log('info', `token=${token}`);
```

**Evidence:** `server/controllers/auth.controller.js:33,41`, `server/config/winston.js`

---

## 6. CORS

Current: `app.use(cors())` — open to all origins.

For production: restrict to known origins:
```js
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
```

**Evidence:** `server/config/express.js:19`

---

## 7. Secrets Management

- All secrets via environment variables (`.env` file, never committed)
- `.env` is in `.gitignore` and in `.claude/settings.json` deny list
- Document env var shape in `.env.example` only — no real values
- Keys in use: `TOKEN_SECRET_KEY`, `DB_PASSWORD`, `DB_USER`, `DB_NAME`

**Evidence:** `.env.example`, `server/config/database.js`

---

## 8. Known Security Gaps (document, fix in tickets)

| Gap | Location | Risk | Priority |
|-----|---------|------|---------|
| JWT no expiry | `auth.controller.js:22` | Stolen tokens valid forever | High |
| CORS open | `express.js:19` | Cross-origin abuse in prod | Medium |
| POST /users unauthenticated | `user.route.js:122` | Anyone can create users | High |
| Raw `err` in catch | `user.controller.js:21,49,74` | Leaks internal error details | Medium |
| `verifyPassword` uses `===` | `user.model.js:24` | Compares plaintext, not bcrypt | High (unused but dangerous) |
