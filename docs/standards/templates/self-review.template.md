# Self-Review — {{TICKET_ID}}: {{TITLE}}

> Author: {{AUTHOR}} | Date: {{DATE}}

---

## Did I stay in scope?

- [ ] Only changed files listed in the impl-plan
- [ ] No unrequested refactors or "improvements"
- [ ] No new files created without a reason in the plan

## Security

- [ ] New routes: Joi validation added?
- [ ] New protected routes: `isAuthenticated` added?
- [ ] No secrets in code, logs, or docs
- [ ] Error responses: structured `{ error: { code, message } }` shape used?

## Architecture

- [ ] Route file has no business logic
- [ ] Controller does not query DB directly
- [ ] Model has no business rules
- [ ] No layer boundary violations

## Code Quality

- [ ] `npm run lint` passes with 0 errors
- [ ] No `console.log` in committed code
- [ ] JSDoc on all new exported functions
- [ ] camelCase, single quotes, semicolons, curly braces

## Tests

- [ ] New utility functions tested
- [ ] New reducer cases tested
- [ ] OR: documented why tests are deferred

## Readability

- [ ] Would a new developer understand this without asking me?
- [ ] Are edge cases handled or documented?

## Summary (3 lines)

- What changed:
- Why:
- What to watch out for:
