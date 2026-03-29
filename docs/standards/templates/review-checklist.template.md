# Code Review Checklist — {{TICKET_ID}}: {{TITLE}}

> Reviewer: {{REVIEWER}} | Date: {{DATE}} | PR: #{{PR_NUMBER}}

---

## Security

- [ ] All mutating routes have `validate(schema.X)` Joi middleware
- [ ] All protected routes have `isAuthenticated` middleware
- [ ] No plaintext passwords in logs or responses
- [ ] No secrets / tokens in code or docs
- [ ] JWT payload contains only `{id, email}` — no sensitive fields
- [ ] Error responses use structured `{ error: { code, message } }` shape

## Architecture

- [ ] Route file: URL mapping + validation only (no business logic)
- [ ] Controller: model calls + response formatting only (no direct DB queries)
- [ ] Model: table mapping only (no business rules)
- [ ] FE action: API call + dispatch only (no UI logic)
- [ ] FE reducer: pure state derivation (no side effects)
- [ ] No circular imports

## Coding Standards

- [ ] camelCase variables/functions, PascalCase components
- [ ] Single quotes, semicolons, curly braces (ESLint enforced)
- [ ] `===` not `==`
- [ ] JSDoc on all exported functions
- [ ] No `var`

## Testing

- [ ] New logic has corresponding test (or: explain why not)
- [ ] No mocking of DB in integration tests

## General

- [ ] `npm run lint` passes with 0 errors
- [ ] No console.log left in code
- [ ] PR description explains what and why (not just what)

## Findings

| Severity | Line | Comment |
|----------|------|---------|
| | | |

## Judgment

- [ ] Approve
- [ ] Request changes
- [ ] Comment only

Reason:
