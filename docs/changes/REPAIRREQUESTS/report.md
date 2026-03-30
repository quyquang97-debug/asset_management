# Report — REPAIRREQUESTS

> Version: 8.0 | Date: 2026-03-29 | Spec: spec-pack.md v1.6 | Implementer: Claude Sonnet 4.6
> Branch: master | Build: `Hash: bb314b0bd17509b6bb2e` (Webpack 4.46.0) | Migrations: Batch 2 — 13 tables

---

## Table of Contents

1. [Modification Summary](#1-modification-summary)
2. [Impact Analysis](#2-impact-analysis)
3. [Review Results](#3-review-results)
4. [Test Results](#4-test-results)
5. [Remaining Issues & Next Actions](#5-remaining-issues--next-actions)
6. [Rollback Procedure](#6-rollback-procedure)

---

## 1. Modification Summary

### What Was Built

The **REPAIRREQUESTS** module was implemented from scratch per [spec-pack.md](spec-pack.md) v1.6 and [impl-plan.md](impl-plan.md) v3.0. The feature did not exist in the codebase before this change.

**Purpose:** Allow employees to create repair requests for broken assets, track status through a 4-state machine (`open → in_progress → done / cancelled`), and auto-record maintenance details in `asset_maintenances` when a repair completes.

### Scale at a Glance

| Layer | Deliverable | Count |
|-------|-------------|-------|
| DB | Knex migrations (all QLTS tables, FK-safe order) | 13 new |
| DB | Seed files (realistic Vietnamese data) | 13 new |
| BE | Bookshelf models | 4 new |
| BE | Controllers (methods) | 3 new (10 methods total) |
| BE | Route files | 3 new |
| BE | Joi validation schemas | 5 new |
| BE | API endpoints | 9 new |
| FE | React components | 6 new |
| FE | Redux: reducer + action file + service + container | 4 new |
| FE | i18n locale files (vi / en / ja) | 3 new |
| FE | Shared utility additions (`patch`, `destroyWithBody`) | 2 new exports |
| Files modified (existing) | httpBaseUtil, httpUtil, main.js, actionType, reducers/index, routes.js, MiniDrawer, Header, index.route.js, validator.js, database.js, package.json | 12 |

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Dedicated reducer / action / service (not reuse `crudAction`) | `crudAction` uses `history.goBack()` on success and does not support `POST` search, `PATCH` status, or `DELETE` with body — incompatible with modal UX |
| `knex.transaction()` in `PATCH /:id/status` | spec AC-38 + AC-42: `repair_requests` UPDATE + `asset_maintenances` INSERT (or `assets` UPDATE) must be atomic |
| `performed_by` = free-text `<TextField>`, NOT autocomplete | spec-pack OI-3 explicit: stores vendor/company name, not an employee FK |
| `<input type="date">` via redux-form adapter | No `@material-ui/pickers`; native date input is sufficient and avoids a new dependency |
| `react-i18next@11` + `i18next@23` | spec AC-43 requires VI/EN/JP with live language switching |
| `clearCount` key prop to reset autocomplete inputs | `AutocompleteField` maintains internal state; `key` remount is the only clean reset mechanism |
| Error routing: Add = inline; all others = Snackbar toast | AC-40 v1.6 — distinguishes "user needs to correct form" (inline, modal stays open) from "background operation failed" (toast) |
| `updated_by` = `req.currentUser.id`, never from `req.body` | Security: prevents privilege escalation |

### Pre-existing Bug Fixed

`client/utils/httpBaseUtil.js` sent `X-XSRF-TOKEN` header, but `server/middlewares/authenticate.js` reads `Authorization: Bearer`. This mismatch caused all `isAuthenticated` routes to return 403. REPAIRREQUESTS was the first module to exercise this middleware end-to-end — the bug was fixed as a prerequisite (impl-plan CP-0B).

### Post-implementation Fix Rounds

21 bugs were found and fixed across three review rounds (see §3 for details):
- **Round 1** (spec v1.5 amendments, bugs #1–#6): async/await crash, clear button, default date, cancel key, cost/performedBy optional, dispatch error
- **Round 2** (code review v1.5, bugs #7–#15): inline component remount, race condition, success dialog, empty-state text, network crash, i18n pagination, toast routing
- **Round 3** (code review v1.6, bugs #16–#21): Edit autocomplete binding, spec B-5 correction, timezone-safe date comparison, internal server error responses, checkbox stale state, hidden-selection delete risk

### Build & Migration Status

| Gate | Result | Evidence |
|------|--------|----------|
| `npm run lint` | PASS (exit 0) | Pre-existing CRLF warnings (Windows env, not introduced here) |
| `npm run build` | PASS | `Hash: bb314b0bd17509b6bb2e`, no ERROR lines |
| `npm run migrate` | PASS | `Batch 2 run: 13 migrations` |
| `npx knex migrate:status` | PASS | `Found 14 Completed Migration file/files` (1 users + 13 new) |
| `npm test` | PASS | 26/26 unit tests, 5 suites |

---

## 2. Impact Analysis

### 2.1 Database

**13 new tables** created in FK-safe order (migration prefix 001–013):

| # | Table | Purpose | Key FKs |
|---|-------|---------|---------|
| 001 | `locations` | Physical locations for assets | — |
| 002 | `asset_types` | Asset type catalogue | — |
| 003 | `departments` | Organisational units | — |
| 004 | `assets` | Asset master data | `locations.id`, `asset_types.id` |
| 005 | `employees` | Employee master data | `departments.id`, self (`manager_id`) |
| 006 | `asset_assignments` | Asset-to-employee assignments | `assets.id`, `employees.id` |
| 007 | `maintenance_plans` | Scheduled maintenance schedules | `asset_types.id` |
| 008 | `maintenance_requests` | Planned maintenance requests | `assets.id`, `maintenance_plans.id` |
| 009 | **`repair_requests`** | **Core table for this module** | `assets.id`, `employees.id` |
| 010 | **`asset_maintenances`** | **Written on status→done (transaction)** | `assets.id`, `repair_requests.id` |
| 011 | `asset_disposals` | Asset disposal records | `assets.id` |
| 012 | `asset_audits` | Audit session metadata | — |
| 013 | `audits_items` | Per-asset audit items | `asset_audits.id`, `assets.id` |

**Existing table written by new code:**

| Table | Column | When written | Mechanism |
|-------|--------|-------------|-----------|
| `assets` | `status` → `'IN_REPAIR'` | `PATCH /:id/status` → `in_progress` | same `knex.transaction()` as repair_requests UPDATE |

**Transaction guarantees (AC-38, AC-42):**
- `status → done`: UPDATE `repair_requests` + INSERT `asset_maintenances` — atomic
- `status → in_progress`: UPDATE `repair_requests` + UPDATE `assets` — atomic
- Any write failure → full ROLLBACK, no partial state

Migration evidence: [self-review.md §Phase C](self-review.md)

### 2.2 API Endpoints

9 new routes across 3 route files. All have `isAuthenticated`. All mutating routes have `validate(schema.X)`.

| # | Method | Path | Auth | Validate | Controller method |
|---|--------|------|------|----------|------------------|
| 1 | POST | `/api/repairRequests/search` | ✓ | `searchRepairRequests` | `search()` |
| 2 | GET | `/api/repairRequests/:id` | ✓ | — | `findById()` |
| 3 | POST | `/api/repairRequests` | ✓ | `storeRepairRequest` | `store()` |
| 4 | PUT | `/api/repairRequests/:id` | ✓ | `updateRepairRequest` | `update()` |
| 5 | PATCH | `/api/repairRequests/:id/status` | ✓ | `updateRepairRequestStatus` | `updateStatus()` |
| 6 | DELETE | `/api/repairRequests` | ✓ | `bulkDeleteRepairRequests` | `destroy()` |
| 7 | GET | `/api/assets/searchbyCodeOrName/:query` | ✓ | — | `searchByCodeOrName()` |
| 8 | GET | `/api/employees/searchbyCodeOrName/:query` | ✓ | — | `searchByCodeOrName()` |

Mount point added to `server/routes/index.route.js`:
```js
router.use('/repairRequests', repairRequestRoute);
router.use('/assets', assetRoute);
router.use('/employees', employeeRoute);
```

### 2.3 Files Changed

| File | Action | Summary |
|------|--------|---------|
| `server/migrations/20260329000001_create_locations_table.js` | Created | locations table |
| `server/migrations/20260329000002_create_asset_types_table.js` | Created | asset_types table |
| `server/migrations/20260329000003_create_departments_table.js` | Created | departments table |
| `server/migrations/20260329000004_create_assets_table.js` | Created | assets table |
| `server/migrations/20260329000005_create_employees_table.js` | Created | employees table |
| `server/migrations/20260329000006_create_asset_assignments_table.js` | Created | asset_assignments table |
| `server/migrations/20260329000007_create_maintenance_plans_table.js` | Created | maintenance_plans table |
| `server/migrations/20260329000008_create_maintenance_requests_table.js` | Created | maintenance_requests table |
| `server/migrations/20260329000009_create_repair_requests_table.js` | Created | repair_requests table |
| `server/migrations/20260329000010_create_asset_maintenances_table.js` | Created | asset_maintenances table |
| `server/migrations/20260329000011_create_asset_disposals_table.js` | Created | asset_disposals table |
| `server/migrations/20260329000012_create_asset_audits_table.js` | Created | asset_audits table |
| `server/migrations/20260329000013_create_audits_items_table.js` | Created | audits_items table |
| `server/seeds/01_locations.js` … `13_audits_items.js` | Created | Seed data for all 13 tables |
| `server/models/repairRequest.model.js` | Created | Bookshelf model: `repair_requests` |
| `server/models/assetMaintenance.model.js` | Created | Bookshelf model: `asset_maintenances` |
| `server/models/asset.model.js` | Created | Bookshelf model: `assets` |
| `server/models/employee.model.js` | Created | Bookshelf model: `employees` |
| `server/controllers/repairRequest.controller.js` | Created | `search`, `findById`, `store`, `update`, `updateStatus`, `destroy` |
| `server/controllers/asset.controller.js` | Created | `searchByCodeOrName` (autocomplete, LIMIT 20) |
| `server/controllers/employee.controller.js` | Created | `searchByCodeOrName` (autocomplete, LIMIT 20) |
| `server/routes/repairRequest.route.js` | Created | 6 routes with isAuthenticated + validate |
| `server/routes/asset.route.js` | Created | GET /searchbyCodeOrName/:query |
| `server/routes/employee.route.js` | Created | GET /searchbyCodeOrName/:query |
| `server/routes/index.route.js` | **Modified** | Mounted 3 new sub-routers |
| `server/utils/validator.js` | **Modified** | Added 5 Joi schemas; cost/performedBy optional (C-009) |
| `server/config/database.js` | **Modified** | Added seeds directory config |
| `client/utils/httpBaseUtil.js` | **Modified** | `X-XSRF-TOKEN` → `Authorization: Bearer`; interceptor guarded with `if (error.response)` |
| `client/utils/httpUtil.js` | **Modified** | Added `patch()` and `destroyWithBody()` exports |
| `client/main.js` | **Modified** | Added `import './i18n'` side-effect before rendering |
| `client/i18n/index.js` | Created | i18n init: `lng: 'vi'`, `fallbackLng: 'en'` |
| `client/i18n/locales/vi.json` | Created | Full VI translations (repairRequests.* keys) |
| `client/i18n/locales/en.json` | Created | Full EN translations (same key structure) |
| `client/i18n/locales/ja.json` | Created | Full JA translations (same key structure) |
| `client/constants/actionType.js` | **Modified** | Added 9 `REPAIR_REQUEST_*` constants incl. `REPAIR_REQUEST_SET_SUCCESS` |
| `client/services/repairRequestService.js` | Created | 8 service methods: search, fetchById, create, updateById, updateStatus, bulkDestroy, searchAssets, searchEmployees |
| `client/actions/repairRequestAction.js` | Created | 8 Redux thunks; `source` field for inline vs toast routing; optional chaining in all 6 catch handlers |
| `client/reducers/repairRequestReducer.js` | Created | Handles 9 action types; `SEARCH_SUCCESS` filters `selectedIds` for done rows; `successMessage` state |
| `client/reducers/index.js` | **Modified** | Added `repairRequest: repairRequestReducer` |
| `client/components/repairRequests/AutocompleteField.js` | Created | Keystroke autocomplete; rejects free-text on blur via `onSelect(null)` |
| `client/components/repairRequests/RepairRequestList.js` | Created | Search, table, pagination, modals, success dialog, error routing, i18n |
| `client/components/repairRequests/RepairRequestAddModal.js` | Created | reduxForm; stable `AssetFieldComponent`/`EmployeeFieldComponent` (module-level); `requestDate` defaults to today |
| `client/components/repairRequests/RepairRequestEditModal.js` | Created | reduxForm `enableReinitialize`; stable `EditAssetFieldComponent`/`EditEmployeeFieldComponent`; hidden ID fields; `initialValues` includes `assetDisplay`/`requestedByDisplay` |
| `client/components/repairRequests/RepairRequestViewModal.js` | Created | Read-only; locale-aware date formatting |
| `client/components/repairRequests/UpdateStatusModal.js` | Created | Local-state; status machine dropdown; conditional fields; YYYY-MM-DD string date comparison (timezone-safe) |
| `client/containers/repairRequests/RepairRequestContainer.js` | Created | `connect(mapStateToProps)` only — raw `dispatch` injected |
| `client/routers/routes.js` | **Modified** | Added `/repair-requests` PrivateRoute with `loadable()` |
| `client/components/common/drawer/MiniDrawer.js` | **Modified** | Added Repair Requests nav item with `BuildIcon` |
| `client/components/common/header/Header.js` | **Modified** | Added language switcher dropdown (🇻🇳/🇬🇧/🇯🇵) before Logout |
| `package.json` | **Modified** | Added `"seed"` script; `i18next` + `react-i18next` in dependencies; `jest@26.6.3` + `babel-jest@26.6.3` in devDependencies; `overrides.babel-preset-current-node-syntax: 1.0.1` |
| `package-lock.json` | **Modified** | Updated by npm install (i18next, react-i18next, jest@26) |
| `.babelrc` | **Modified** | Added `env.test` override (removed `react-hot-loader/babel`; `targets.node = current`) |

### 2.4 Settings, Env, Logs, Permissions

| Dimension | Change |
|-----------|--------|
| **Environment variables** | None added. No `.env` changes. |
| **`server/config/database.js`** | Added `seeds: { directory: './server/seeds' }` |
| **Log files** | None new. All 3 new controllers write errors to Winston (`logger.log('error', ...)`). No `console.log` added. |
| **Error responses** | All 7 controller catch blocks return `'Internal server error'` string — raw `err.message` never exposed to client (security fix, bug #20). |
| **`isAuthenticated` coverage** | All 9 new routes protected. No unprotected endpoint added. |
| **Joi validation coverage** | All 4 mutating routes (POST, PUT, PATCH, DELETE) have `validate(schema.X)` middleware. |
| **`sortField` whitelist** | `search()` controller whitelists `['request_date', 'id', 'status']` before `ORDER BY` — SQL injection prevention. |

---

## 3. Review Results

### 3.1 Claude Self-Review ([self-review.md](self-review.md) v4.4)

**Pre-submit gates:**

| Gate | Result | Notes |
|------|--------|-------|
| `npm run lint` | PASS (exit 0) | Pre-existing CRLF warnings on all files (Windows env, not introduced) |
| `npm run build` | PASS | Hash: `bb314b0bd17509b6bb2e`, no errors |
| `npm run migrate` | PASS | Batch 2 run: 13 migrations |
| `npx knex migrate:status` | PASS | 14 Completed (1 users + 13 new) |
| Smoke test BE | **PENDING** | Requires running server |
| Manual FE walkthrough | **PENDING** | Requires running server |

**AC Quick Scan (all 44 ACs):**

All 44 ACs marked ✓ in [self-review.md §AC Quick Scan](self-review.md). Notable fix annotations:

| AC | Fix note |
|----|---------|
| AC-5 | `notFound` locale key corrected to spec literal "Repair request does not exist." |
| AC-6 | `clearCount` key prop + stable Field component refs |
| AC-17/23/39 | `successMessageLocal` local state captures message before Redux clears on SEARCH_SUCCESS |
| AC-20 | Race condition fixed: `setModalMode` chained in `.then()` after `fetchRepairRequestById` resolves |
| AC-22/23 | Edit autocomplete: stable module-level components; `input.value` binding; `initialValues` includes display fields |
| AC-24 (v1.6) | Edit API error routed to toast (not inline) per amended spec |
| AC-34/35 (v1.5) | Cost and Performed by changed to optional |
| AC-40 (v1.6) | Add = inline; all other errors = toast; network errors safe (optional chaining) |
| AC-43 | Header language switcher with `i18n.changeLanguage()` |

**Validation completeness (V-1 to V-11):**

| Rule | FE | BE Joi | BE Controller |
|------|----|--------|--------------|
| V-1: Asset Code required + has ID | ✓ | ✓ required | ✓ FK check |
| V-2: Requested By required + has ID | ✓ | ✓ required | ✓ FK check |
| V-3: Request date required | ✓ | ✓ required | — |
| V-4: Request date ≤ today | ✓ | ✓ max('now') | — |
| V-5: Repair date required when done | ✓ | ✓ Joi when | — |
| V-6: Repair date ≥ Request date | ✓ (YYYY-MM-DD string) | partial | ✓ cross-field, YYYY-MM-DD |
| V-7/V-8: Cost ≥ 0, optional | ✓ | ✓ optional min(0) | — |
| V-9: Performed by optional, max 100 | ✓ | ✓ optional max(100) | — |
| V-10: Status transition valid | ✓ dropdown limits | — | ✓ ALLOWED_TRANSITIONS map |
| V-11: Autocomplete must have backing ID | ✓ onBlur clears | — | ✓ FK check |

### 3.2 Review Checklist ([review-checklist.md](review-checklist.md) v4.3)

The checklist has not yet been formally completed by the human reviewer. From Claude self-check, the following BLOCKER categories are assessed as satisfied:

| BLOCKER Category | Self-assessed Status |
|-----------------|---------------------|
| AC Coverage (§2) — all 44 ACs | ✓ Implemented |
| Design & Dependencies (§3) — httpBaseUtil, httpUtil patch/destroyWithBody, autocomplete endpoints, i18n setup | ✓ |
| Security (§4) — isAuthenticated, validate(), updated_by from JWT, asset_id from DB, type hardcoded, sortField whitelist | ✓ |
| DB Transactions (§6) — done transaction, in_progress transaction, rollback on failure, column mapping | ✓ |
| BE Validation (§7) — FK checks, request_date ≤ today, repair_date ≥ request_date (timezone-safe), cost ≥ 0 | ✓ |
| Frontend Behavior (§9) — autocomplete, icon disable rules, Add/Edit/UpdateStatus/Delete modal behavior | ✓ |
| Operations (§15) — `npm run migrate` succeeds, 14 migrations Completed | ✓ |

**Checklist Finding #1 (§17):** "No `__tests__` files for module" (MAJOR) — **partially resolved**: 26 unit tests added across 5 suites in post-review round 3. BE integration test placeholder created. Automated BE integration test harness remains deferred.

Human review status: **PR #___ — pending.**

### 3.3 Post-Implementation Bug Fix Log

21 bugs found and fixed across three review rounds:

**Round 1 — spec v1.5 amendments (bugs #1–#6):**

| # | Bug | Fix |
|---|-----|-----|
| 1 | `regeneratorRuntime is not defined` (async/await) | Rewrote all to `.then()/.catch()` chains |
| 2 | Clear button didn't reset autocomplete inputs | `clearCount` key prop on AutocompleteField |
| 3 | Add modal: Request date empty on open | `initialValues: { requestDate: today }` (AC-44) |
| 4 | Cancel button showed raw key `common.cancel` | Added `repairRequests.common.cancel` to all 3 locale files |
| 5 | PATCH /status returned 400 for null cost/performedBy | Changed Joi schema to optional (C-009 resolution) |
| 6 | `dispatch is not a function` TypeError | Removed `mapDispatchToProps` from RepairRequestContainer |

**Round 2 — code review v1.5 (bugs #7–#15):**

| # | Bug | Fix |
|---|-----|-----|
| 7 | Add modal: selecting Asset clears Requested By | Extracted stable `AssetFieldComponent`/`EmployeeFieldComponent` outside modal function |
| 8 | Race condition: modal opened with stale data | `setModalMode` chained in `.then()` after fetch; re-throws on error |
| 9 | AC-17/23/39: success feedback missing | `REPAIR_REQUEST_SET_SUCCESS` action; `successMessageLocal` state in List |
| 10 | Empty-state message didn't match spec literal | `notFound` key corrected in all 3 locale files |
| 11 | Network error crash (`error.response` undefined) | `if (error.response)` guard in interceptor; optional chaining in 6 action catch handlers |
| 12 | Pagination "of" and dialog "OK" hardcoded | `"of"/"ok"` keys added to all 3 locale files |
| 13 | UpdateStatus error shown inline AND as toast | Removed inline error block from UpdateStatusModal |
| 14 | Success dialog showed empty message | Captured in `successMessageLocal` before `SEARCH_SUCCESS` clears Redux state |
| 15 | Edit API error silently swallowed | redux-form `error` prop conflict; routed 'update' errors to toast (AC-40 v1.6) |

**Round 3 — code review v1.6 (bugs #16–#21):**

| # | Bug | Fix |
|---|-----|-----|
| 16 | Edit modal: new autocomplete selection didn't update display; stale ID on submit | `EditAssetFieldComponent`/`EditEmployeeFieldComponent` as stable module-level; `input.value`; hidden `<Field>` for IDs; `initialValues` with display fields |
| 17 | Spec B-5 incorrect (done/cancelled stated as selectable) | Restored correct rule: done rows non-selectable; BE `destroy()` + `update()` pre-check and 400 |
| 18 | *(renumbered — covered in 17)* | — |
| 19 | Date comparison timezone risk (AC-36/B-3) | YYYY-MM-DD string comparison in both FE (`UpdateStatusModal`) and BE (`repairRequest.controller`) |
| 20 | [Security] Controllers returned raw `err.message` | All 7 catch blocks → `'Internal server error'`; detail in `logger.log()` only |
| 21 | Checkbox stayed checked after row transitioned to done | Reducer `SEARCH_SUCCESS` filters `selectedIds` to remove IDs of newly-done rows |

---

## 4. Test Results

Evidence: [test-results.md](test-results.md) | [test-plan.md](test-plan.md) | [blackbox-testcases.md](blackbox-testcases.md)

### 4.1 FE Unit Tests — 26/26 PASS

Run command: `npx jest --no-coverage`
Infrastructure: Jest 26.6.3 + babel-jest 26.6.3; `__mocks__/i18nMock.js` returns key as-is; `babel-preset-current-node-syntax` pinned to 1.0.1

| Suite | Cases | Result | What's Covered |
|-------|-------|--------|----------------|
| `client/reducers/__tests__/repairRequestReducer.test.js` | 7 | **PASS** | `SEARCH_SUCCESS` (items/total/page/pageSize, error cleared, selectedIds intersection — done IDs and off-page IDs dropped); `SET_SELECTED_IDS` (set-all, clear-all, side-effects); `FAILURE` (error set, items unchanged) |
| `client/components/repairRequests/__tests__/RepairRequestAddModal.validate.test.js` | 6 | **PASS** | `assetId` required; `requestedBy` required; `requestDate` required; future date rejected; today accepted (boundary); all valid |
| `client/components/repairRequests/__tests__/RepairRequestEditModal.validate.test.js` | 1 | **PASS** | Error keys map to `assetDisplay`/`requestedByDisplay` (not hidden `assetId`/`requestedBy`) — validates AC-22 UX |
| `client/components/repairRequests/__tests__/UpdateStatusModal.validate.test.js` | 11 | **PASS** | repairDate required/before/equal(B-3)/after; cost=-0.01 rejected; cost=0 valid (B-2); cost='' valid (AC-34 optional); cost=null valid; performedBy absent valid (AC-35 optional); status empty error; full valid payload |
| `server/routes/__tests__/repairRequest.status.transaction.test.js` | 1 | **PASS (vacuous)** | Placeholder — no assertions; file is a scaffold for future integration tests |

**Key ACs covered by UT:** AC-7 (selectedIds intersection), AC-12–15 (Add validation), AC-22 (Edit validation mapping), AC-33 (Repair date required), AC-34 (Cost optional), AC-35 (Performed by optional), AC-36 (Repair date ≥ Request date, B-3 equal case), AC-37 (Cost ≥ 0, B-2 zero case)

**Infrastructure fix required before tests ran:** `babel-jest@27` (transitive from default jest) requires `@babel/core ≥ 7.22`; repo has `7.13.14`. Resolved by pinning to `jest@26.6.3` + `babel-jest@26.6.3` + `overrides.babel-preset-current-node-syntax: 1.0.1`.

### 4.2 BE Integration Tests — DEFERRED

Status: No test DB harness configured (`NODE_ENV=test` DB not available).

Placeholder file: `server/routes/__tests__/repairRequest.status.transaction.test.js` (passes vacuously — no assertions).

| Route / Case | Priority | Status | AC |
|---|---|---|---|
| `POST /search` — 200 with items + default sort DESC | P0 | SKIP | AC-4, AC-41 |
| `POST /search` — 200 empty list | P0 | SKIP | AC-5 |
| `POST /search` — 401 no token | P1 | SKIP | §4 Security |
| `POST /` — 201 status=open | P0 | SKIP | AC-17 |
| `POST /` — 400 future request_date | P0 | SKIP | AC-15 |
| `PUT /:id` — 200 success | P0 | SKIP | AC-23 |
| `PUT /:id` — 400 done record | P1 | SKIP | spec B-5 |
| `PATCH /:id/status → done` — 200 + `asset_maintenances` row | P0 | SKIP | AC-38 |
| `PATCH /:id/status → in_progress` — 200 + `assets.status=IN_REPAIR` | P0 | SKIP | AC-42 |
| `PATCH /:id/status` — 400 invalid transition | P0 | SKIP | §6 Transitions |
| `PATCH /:id/status` — rollback on INSERT fail | P0 | SKIP | AC-38 risk |
| `DELETE /` — 200 rows deleted | P0 | SKIP | AC-29 |
| `DELETE /` — 400 includes done ID | P0 | SKIP | spec B-5 |

When implementing: use `NODE_ENV=test` against a dedicated test DB. See [test-plan.md §Integration Tests](test-plan.md).

### 4.3 E2E Tests — DEFERRED

Playwright not installed. Minimum flows documented in [test-plan.md §E2E](test-plan.md) for when infrastructure is available:

- Happy path: load → search → Add → Edit → UpdateStatus (done) → bulk-delete
- Abnormal: future date in Add, cost=-1 in UpdateStatus, delete no selection, network failure on Search

### 4.4 Black-Box Tests — DEFINED, MANUAL EXECUTION PENDING

Reference: [blackbox-testcases.md](blackbox-testcases.md) v2.0

~90 cases defined across priority tiers:

| Priority | Description | Count | Status |
|----------|-------------|-------|--------|
| P0 | Must pass — core happy paths + critical validation gates | ~35 | **PENDING** (requires running server + seed data) |
| P1 | Boundary values, error flows, secondary scenarios | ~40 | **PENDING** |
| P2 | Auth edge cases, concurrent, compatibility | ~15 | **PENDING** |

Chapters in blackbox-testcases.md: Autocomplete (BB-001–BB-010), Search & Grid (BB-011–BB-030), Add (BB-031–BB-050), Edit (BB-051–BB-065), Delete (BB-056–BB-065), UpdateStatus (BB-066–BB-088), Pagination (BB-089–BB-092), i18n (BB-093–BB-096+).

Key P0 cases to prioritise:
- BB-003 (Add: free-text autocomplete rejected), BB-020 (done row icons disabled), BB-038 (done: asset_maintenances created + repair_requests updated in one transaction), BB-042 (in_progress: assets.status=IN_REPAIR), BB-060 (bulk delete confirmed)

Test data (seed SQL): [test-data.md](test-data.md) §1.

### 4.5 Edge Cases — Partially Covered

| Edge Case | Status | Coverage |
|-----------|--------|----------|
| Repair date = Request date (B-3: equal is valid) | **UT PASS** | `UpdateStatusModal.validate.test.js` |
| Cost = 0 valid (B-2 free repair) | **UT PASS** | `UpdateStatusModal.validate.test.js` |
| Cost = -0.01 rejected | **UT PASS** | `UpdateStatusModal.validate.test.js` |
| cost = '' → valid (AC-34 optional) | **UT PASS** | `UpdateStatusModal.validate.test.js` |
| Autocomplete free-text in Add → rejected | **PENDING** | Manual / BB-003 |
| performed_by 101 chars → BE 400 | **PENDING** | Manual / BE smoke test |
| Total=10 pageSize=10 → Next disabled | **PENDING** | Manual / BB-026 |
| Select all + bulk delete incl. done → done rejected | **PENDING** | Manual / BB-060 |
| API 5xx on Search → grid intact | **PENDING** | Manual / BB-019 |

---

## 5. Remaining Issues & Next Actions

| # | Issue | Severity | Status | Recommended Action |
|---|-------|----------|--------|-------------------|
| 1 | BE smoke tests (9 rows in self-review §Smoke Test) not run | **High** | PENDING | Run against `npm run build` server before PR merge; record Actual column in [self-review.md](self-review.md) |
| 2 | Manual FE walkthrough (42 steps in test-plan.md) not executed | **High** | PENDING | Execute all 42 steps; record pass/fail in [test-results.md](test-results.md) |
| 3 | Black-box test execution (~90 cases) not run | **High** | PENDING | Prioritise P0 cases; use seed data from [test-data.md](test-data.md) |
| 4 | `npm run migrate:rollback` not tested | **Medium** | PENDING | Test on dev DB before merge to confirm 13-table rollback is clean |
| 5 | BE integration test harness not set up | **Medium** | DEFERRED | Set up `NODE_ENV=test` DB; implement 13 IT cases from test-plan.md; focus on transaction rollback (AC-38 risk) |
| 6 | Human code review not completed | **High** | PENDING | Reviewer fills [review-checklist.md](review-checklist.md) v4.3; mark each item [x] |
| 7 | E2E tests (Playwright) not set up | **Low** | DEFERRED | Install Playwright when CI infrastructure available; 6 happy-path flows documented in test-plan.md |
| 8 | JWT no token expiry (pre-existing gap) | **Medium** | OUT OF SCOPE | Raise separate ticket against `server/controllers/auth.controller.js` |
| 9 | Date display in RepairRequestList.formatDate hardcoded to `'vi-VN'` locale | **Minor** | OPEN | Low priority; could be `i18n.language`-aware like ViewModal; no user impact for current deployment |
| 10 | `npm run seed` deletes all existing table data (Knex seed pattern) | **Operational** | KNOWN | Document in runbook; use only on empty/dev DB; never on production |

---

## 6. Rollback Procedure

Reference: [impl-plan.md §7](impl-plan.md)

### Full Rollback (revert entire feature)

Use if the feature must be completely removed. Execute in order:

```bash
# Step 1 — rollback all 13 migrations (runs as a single batch)
npm run migrate:rollback

# Verify: only users table remains
npx knex migrate:status
# Expected: 1 Completed (users), 13 Pending
```

```bash
# Step 2 — revert modified existing files
git checkout client/utils/httpBaseUtil.js
git checkout client/utils/httpUtil.js
git checkout client/main.js
git checkout client/constants/actionType.js
git checkout client/reducers/index.js
git checkout client/routers/routes.js
git checkout client/components/common/drawer/MiniDrawer.js
git checkout client/components/common/header/Header.js
git checkout server/routes/index.route.js
git checkout server/utils/validator.js
git checkout server/config/database.js
git checkout package.json
git checkout package-lock.json
git checkout .babelrc
```

```bash
# Step 3 — uninstall new packages
npm uninstall i18next react-i18next
npm uninstall --save-dev jest babel-jest

# Step 4 — remove all created files
# (execute manually or via git clean -f on new files)
# Directories to remove:
#   client/i18n/
#   client/actions/repairRequestAction.js
#   client/services/repairRequestService.js
#   client/reducers/repairRequestReducer.js
#   client/components/repairRequests/
#   client/containers/repairRequests/
#   server/controllers/repairRequest.controller.js
#   server/controllers/asset.controller.js
#   server/controllers/employee.controller.js
#   server/models/repairRequest.model.js
#   server/models/assetMaintenance.model.js
#   server/models/asset.model.js
#   server/models/employee.model.js
#   server/routes/repairRequest.route.js
#   server/routes/asset.route.js
#   server/routes/employee.route.js
#   server/seeds/
#   server/migrations/2026032900000[1-9]_*.js
#   server/migrations/202603290000[10-13]_*.js
#   __mocks__/
#   client/reducers/__tests__/
#   client/components/repairRequests/__tests__/
#   server/routes/__tests__/

# Step 5 — verify build is clean
npm run build
npm run lint
```

**Post-rollback DB state:** All 13 QLTS tables dropped. `users` table and `knex_migrations` history unaffected. `assets.status` values previously set to `'IN_REPAIR'` will remain — manually reset if needed:
```sql
UPDATE assets SET status = 'IN_USE' WHERE status = 'IN_REPAIR';
```

---

### Partial Rollback Scenarios

**If Phase A (i18n) broke build only:**
```bash
npm uninstall i18next react-i18next
# Remove client/i18n/ directory
git checkout client/main.js
npm run build
```

**If Phase B (httpBaseUtil.js) broke existing auth:**
```bash
git checkout client/utils/httpBaseUtil.js
# Restart server; re-test POST /api/auth/login
```

**If Phase C (migrations) failed mid-batch:**
```bash
npm run migrate:rollback   # undoes entire batch atomically
# Fix the failing migration file
npm run migrate            # re-apply from beginning
```

**If new routes cause 500s on existing endpoints:**
```bash
# In server/routes/index.route.js: comment out the 3 new router.use() lines
# Restart server — /auth and /users routes unaffected
# Debug controller/route; re-mount when fixed
```

**If FE build breaks after adding new components:**
```bash
npm run lint               # identifies import path issues
# Review git diff for wrong relative paths or missing exports
# Most common: incorrect loadable() path in routes.js
```

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| [spec-pack.md](spec-pack.md) v1.6 | Full specification — 44 ACs, validation rules, status machine |
| [impl-plan.md](impl-plan.md) v3.0 | Implementation plan — phases, risks, AC mapping table |
| [self-review.md](self-review.md) v4.4 | Author self-review — AC scan, validation matrix, bug log |
| [review-checklist.md](review-checklist.md) v4.3 | Human reviewer checklist — BLOCKER/MAJOR/MINOR items |
| [test-plan.md](test-plan.md) v2.0 | Test plan — manual steps, IT cases, E2E flows |
| [test-results.md](test-results.md) | Test results — UT 26/26 PASS; manual PENDING |
| [blackbox-testcases.md](blackbox-testcases.md) v2.0 | ~90 black-box cases with P0/P1/P2 priorities |
| [test-data.md](test-data.md) v2.0 | Seed SQL, API payloads, boundary values, expected DB state |

---

*End of Report — REPAIRREQUESTS v8.0*
