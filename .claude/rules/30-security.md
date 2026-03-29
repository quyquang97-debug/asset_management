# 30-security — Security Rules

> Evidence: `server/routes/user.route.js`, `server/middlewares/authenticate.js`, `server/controllers/auth.controller.js`, `server/config/winston.js`

---

## Input Validation

- Every mutating route (POST/PUT/PATCH) must have `validate(schema.X)` before the controller
- Schemas defined in `server/utils/validator.js` using `@hapi/joi`
- Use `{ abortEarly: false }` — collect all errors

## Authentication

- All state-mutating routes must use `isAuthenticated` middleware (except login/signup)
- Never trust user-supplied IDs for ownership — use `req.currentUser` set by `isAuthenticated`
- JWT payload: `{id, email}` only — no sensitive fields

## Password Handling

- Hash with `bcrypt` (saltRounds=10) on create/update
- Compare with `bcrypt.compareSync` — never compare plaintext
- Never return `password` field in API response
- Never log passwords

## Logging

- Log error messages only — never log request bodies, passwords, or tokens
- Use `logger.log('error', 'message string')` — not `logger.error(req.body)`
- Winston logger is the only logging mechanism (`server/config/winston.js`)

## Secrets

- All secrets via environment variables — never hardcoded
- Check `.env.example` for required keys: `TOKEN_SECRET_KEY`, `DB_PASSWORD`, `DB_USER`
- Never write secret values into `docs/` or `.claude/`

## Error Responses

- Use structured shape: `{ error: { code: number, message: string } }`
- Do not expose raw error objects or stack traces in responses

> Detail: `docs/standards/security.md`
