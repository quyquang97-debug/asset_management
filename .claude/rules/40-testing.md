# 40-testing — Testing Rules

> Evidence: `.eslintrc` (`jasmine` env declared), no test files exist (2026-03-28)
> Status: Aspirational — apply when test suite is introduced

---

## Test File Location

- `__tests__/` subdirectory next to the module being tested
- Named `<module>.test.js`

## Test Naming

- `describe(<unit>)` → `describe(<method>)` → `it(<expected behavior>)`
- `it()` descriptions read as complete sentences

## Mocking Policy

- UT: mock external services, DB, jwt — ok
- IT: **no DB mocking** — use a real test DB (`NODE_ENV=test`)
- IT: mock external HTTP (3rd-party APIs) — ok
- E2E: no mocking

## Priority (first tests to write)

1. `client/reducers/crudReducer.js` — pure function, highest ROI
2. `client/utils/commonUtil.js` — pure utility functions
3. `server/controllers/user.controller.js` — mock Bookshelf model
4. `server/middlewares/authenticate.js` — mock jwt + User

## Coverage Targets (when suite exists)

- Utilities: 80% | Reducers: 80% | Controllers: 70% | Components: 50%

> Detail: `docs/standards/testing.md`
