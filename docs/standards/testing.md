# Testing Standards

> Status: **Aspirational** — no test suite exists in this repo (2026-03-28).
> `.eslintrc` declares `"jasmine": true` env but no spec files found.
> These standards define the target state for when tests are introduced.

---

## Policy

| Level | Tool (target) | Scope |
|-------|-------------|-------|
| Unit (UT) | Jest | Pure functions, reducers, action creators, utility functions |
| Integration (IT) | Jest + Supertest | Express route → controller → model → DB (test DB) |
| E2E | Cypress (future) | Critical user flows: login, CRUD |

No mocking of the database in integration tests — use a dedicated test DB (`NODE_ENV=test`).

**Rationale:** Mocking DB in IT masks migration/schema divergence. Real DB catches production-equivalent failures.

---

## File Naming

```
server/controllers/__tests__/user.controller.test.js
server/middlewares/__tests__/authenticate.test.js
client/actions/__tests__/crudAction.test.js
client/reducers/__tests__/crudReducer.test.js
client/utils/__tests__/commonUtil.test.js
```

Rule: test file lives in `__tests__/` subdirectory of the module it tests, named `<module>.test.js`.

---

## Test Naming

```js
describe('userController', () => {
  describe('findAll', () => {
    it('returns all users as JSON', async () => { ... });
    it('returns 500 on DB error', async () => { ... });
  });
});
```

Pattern: `describe(<unit>)` → `describe(<method>)` → `it(<expected behavior>)`

---

## Unit Test Targets (Priority Order)

1. `client/reducers/crudReducer.js` — pure function, easy to test
2. `client/actions/commonAction.js` — pure action creators
3. `client/utils/commonUtil.js` — pure utility functions
4. `server/controllers/user.controller.js` — mock Bookshelf model
5. `server/middlewares/authenticate.js` — mock jwt.verify + User.query

---

## Mocking Policy

| Scenario | Allowed |
|----------|---------|
| UT: mock external services, DB, jwt | Yes |
| IT: mock DB | No — use real test DB |
| IT: mock external HTTP (3rd party APIs) | Yes |
| E2E: mock anything | No |

---

## Coverage Target (when suite exists)

| Layer | Target |
|-------|--------|
| Utilities (`client/utils/`, `server/utils/`) | 80% |
| Reducers | 80% |
| Controllers | 70% |
| Middlewares | 70% |
| Components | 50% (render + critical interactions) |

---

## Known Gaps to Address When Adding Tests

- `crudReducer.js`: `newState` used before assignment (`let newState; newState[x] = ...`) — this is a bug that tests would immediately catch
- `auth.controller.js`: no `.catch()` on `User.query().fetch()` — unhandled rejection
- `user.route.js`: `POST /users` missing `isAuthenticated` — currently unauthenticated create
