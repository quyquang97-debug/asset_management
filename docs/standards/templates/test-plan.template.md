# Test Plan — {{TICKET_ID}}: {{TITLE}}

> Author: {{AUTHOR}} | Date: {{DATE}}

---

## Scope

**What is being tested:**
-

**What is NOT being tested (and why):**
-

---

## Unit Tests

| Test file | Function/Unit | Cases |
|-----------|-------------|-------|
| `client/reducers/__tests__/{{reducer}}.test.js` | `{{case}}` | happy path, error state |
| `client/utils/__tests__/{{util}}.test.js` | `{{fn}}` | edge cases |

## Integration Tests

| Test file | Route | Cases |
|-----------|-------|-------|
| `server/routes/__tests__/{{entity}}.route.test.js` | `POST /api/{{entity}}` | 200, 400 (validation fail), 401 (no token) |

**DB:** Use test database (`NODE_ENV=test`). No mocking of DB.

## Manual Test Steps

- [ ] 1.
- [ ] 2.
- [ ] 3.

## Edge Cases

- [ ]
- [ ]

## Pass Criteria

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual steps complete without errors
- [ ] `npm run lint` passes
