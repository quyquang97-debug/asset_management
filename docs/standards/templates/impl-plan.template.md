# Implementation Plan — {{TICKET_ID}}: {{TITLE}}

> Created: {{DATE}} | Author: {{AUTHOR}}

---

## Files to Read First

| File | Why |
|------|-----|
| | |

## Files to Create / Modify

| File | Action | Notes |
|------|--------|-------|
| `server/routes/{{entity}}.route.js` | Create/Modify | |
| `server/controllers/{{entity}}.controller.js` | Create/Modify | |
| `server/utils/validator.js` | Modify | Add Joi schema |
| `client/actions/{{entity}}Action.js` | Create/Modify | |
| `client/reducers/{{entity}}Reducer.js` | Create/Modify | |

## Steps (ordered)

- [ ] 1. Read relevant files (list above)
- [ ] 2. Create/update Joi schema in `server/utils/validator.js`
- [ ] 3. Implement controller method(s)
- [ ] 4. Add route(s) with `validate()` + `isAuthenticated` where required
- [ ] 5. Implement/update Redux action
- [ ] 6. Implement/update reducer
- [ ] 7. Implement/update component
- [ ] 8. Run `npm run lint` — fix all errors
- [ ] 9. Manual test: {{test steps}}
- [ ] 10. Self-review (see self-review.template.md)

## Checkpoints

| ID | Gate | Condition |
|----|------|----------|
| CP-1 | Files read | No code written before reading |
| CP-2 | BE complete | Lint passes; API tested manually |
| CP-3 | FE complete | UI flow works end-to-end |
| CP-4 | Review ready | Self-review checklist passed |

## Risks

| Risk | Mitigation |
|------|-----------|
| | |
