# Code Review Checklist — REPAIRREQUESTS

> Version: 4.3 | Date: 2026-03-29 | Spec: spec-pack.md v1.6
> Reviewer: ___ | Review date: ___ | PR: #___

---

## How to Use

- **[BLOCKER]** — Must be fixed before merge. Correctness, security, or data integrity issue.
- **[MAJOR]** — Should be fixed before merge. Significant design, UX, or maintainability issue.
- **[MINOR]** — Nice to fix. Style, naming, or non-critical improvement.
- **AC-xx** — Which acceptance criterion this item verifies.
- Mark `[x]` when confirmed OK. Leave `[ ]` when failed — add finding to §17.

---

## 1. AC Coverage Matrix

Quick reference: which section covers which AC.

| AC Range | Topic | Checklist Section |
|----------|-------|------------------|
| AC-1, AC-2 | Autocomplete triggers | §3 Design, §9 FE Behavior |
| AC-3 | Free-text rejected | §7 BE Validation, §9 FE Behavior |
| AC-4 | Search payload shape | §9 FE Behavior |
| AC-5 | Empty state message | §9 FE Behavior, §10 i18n |
| AC-6 | Clear resets + triggers search | §9 FE Behavior |
| AC-7 | Header checkbox | §9 FE Behavior |
| AC-8 | Row icon disable rules | §9 FE Behavior |
| AC-9, AC-10, AC-11 | Pagination | §9 FE Behavior |
| AC-12 to AC-19 | Add modal | §7 BE Validation, §9 FE Behavior |
| AC-20 to AC-25 | Edit modal | §7 BE Validation, §9 FE Behavior |
| AC-26 to AC-29 | Bulk delete | §9 FE Behavior, §4 Security |
| AC-30 to AC-39 | Update Status | §6 Transactions, §7 BE Validation, §9 FE Behavior |
| AC-40 | Error handling routing | §13 Error Handling |
| AC-41 | Default sort | §9 FE Behavior |
| AC-42 | in_progress → IN_REPAIR transaction | §6 Transactions |

---

## 2. Specification & AC Coverage

> Goal: confirm every AC in spec-pack.md is implemented. One failing AC = BLOCKER.

- [ ] **[BLOCKER]** AC-1: Asset Code autocomplete calls `GET /api/assets/searchbyCodeOrName/{q}` on ≥1 char keystroke; result format `[asset_code] - [name]`
- [ ] **[BLOCKER]** AC-2: Requested By autocomplete calls `GET /api/employees/searchbyCodeOrName/{q}` on ≥1 char; result format `[employee_code] - [name]`
- [ ] **[BLOCKER]** AC-3: Free-text without dropdown selection → rejected on Add/Edit submit; treated as null in Search (no error)
- [ ] **[BLOCKER]** AC-4: Search sends `POST /api/repairRequests/search` with `{ assetId, requestedBy, status, page, pageSize, sortField, sortDir }`
- [ ] **[MAJOR]** AC-5: Zero results → displays "Repair request does not exist." (in active locale)
- [ ] **[MAJOR]** AC-6: Clear resets all filter fields + sort to defaults + auto-triggers search
- [ ] **[MAJOR]** AC-7: Header checkbox selects all current-page rows; second click deselects all
- [ ] **[BLOCKER]** AC-8: `done` → Edit + UpdateStatus disabled, View enabled; `cancelled` → UpdateStatus disabled, Edit + View enabled
- [ ] **[MAJOR]** AC-9: Page-size change triggers search with `page=1`
- [ ] **[MAJOR]** AC-10: Pagination nav buttons trigger search with correct page number
- [ ] **[MAJOR]** AC-11: Pagination displays "X–Y of Z" using `total` from API response
- [ ] **[BLOCKER]** AC-12: Add without Asset Code → "Asset Code is required"; API NOT called
- [ ] **[BLOCKER]** AC-13: Add without Requested By → "Requested by is required"; API NOT called
- [ ] **[BLOCKER]** AC-14: Add without Request date → "Request date is required"; API NOT called
- [ ] **[BLOCKER]** AC-15: Add with Request date > today → "Cannot be a future date"; API NOT called; validated FE + BE
- [ ] **[BLOCKER]** AC-16: Add popup has NO ID field; field order: Asset Code → Requested By → Description → Request date
- [ ] **[MAJOR]** AC-17: Add success → multilingual message (VN/EN/JP) shown as "Thông báo" dialog + modal closes + grid refreshes; new row has `status=open`
- [ ] **[MAJOR]** AC-18: Add API error → modal stays open; server error shown inline (not toast)
- [ ] **[MINOR]** AC-19: Add Close/X → discards values immediately, modal closes
- [ ] **[BLOCKER]** AC-20: Edit calls `GET /api/repairRequests/{id}`; popup opens **only after** fetch resolves (race condition fixed — `.then()` chained); all fields pre-filled
- [ ] **[BLOCKER]** AC-21: Edit shows `id` as read-only text label (`<Typography>` or equivalent) — NOT inside `<input>` or `<TextField>`
- [ ] **[MAJOR]** AC-22: Edit applies same validation as Add (V-1 to V-4)
- [ ] **[MAJOR]** AC-23: Edit success → multilingual success message as "Thông báo" dialog + modal closes + grid refreshes
- [ ] **[MAJOR]** AC-24 *(amended v1.6)*: Edit API error → modal stays open; server error shown as **toast** (not inline)
- [ ] **[MINOR]** AC-25: Edit Close/X → discards changes immediately
- [ ] **[MAJOR]** AC-26: Delete with 0 selected → "Please select the items to delete." with single OK button
- [ ] **[MAJOR]** AC-27: Delete with n selected → "Delete (n items). Are you sure?" with OK + Cancel
- [ ] **[MINOR]** AC-28: Delete Cancel → closes modal, no API call
- [ ] **[BLOCKER]** AC-29: Delete OK → `DELETE /api/repairRequests` with `{ ids: [...] }`; grid refreshes
- [ ] **[MAJOR]** AC-30: UpdateStatus popup opens; ID field pre-filled (read-only)
- [ ] **[BLOCKER]** AC-31: Status→done: Repair date + Cost + Performed by + Description become **enabled AND cleared**
- [ ] **[BLOCKER]** AC-32: Status→non-done (including initial open): those 4 fields **disabled AND cleared**
- [ ] **[BLOCKER]** AC-33: done without Repair date → "Repair date is required"
- [ ] **[MAJOR]** AC-34 *(amended v1.5)*: Cost is **optional** when status=done; if provided, must be ≥ 0. Submitting without Cost must NOT produce a validation error. Submitting Cost < 0 must produce "Cost cannot be negative."
- [ ] **[MAJOR]** AC-35 *(amended v1.5)*: Performed by is **optional** when status=done (max 100 chars). Submitting without Performed by must NOT produce a validation error.
- [ ] **[BLOCKER]** AC-36: done with Repair date < Request date → "Repair date must be after Request date"
- [ ] **[BLOCKER]** AC-37: done with Cost < 0 → "Cost cannot be negative"; Cost=0 → valid
- [ ] **[BLOCKER]** AC-38: done submission → `PATCH` AND `asset_maintenances` INSERT in ONE DB transaction
- [ ] **[MAJOR]** AC-39: Any UpdateStatus success → multilingual message as "Thông báo" dialog + modal closes + grid row reflects new status + row color
- [ ] **[MAJOR]** AC-40 *(amended v1.6)*: Error routing — **Add only**: inline in modal; **all other actions** (Edit, UpdateStatus, Delete, Search, fetch): toast; network errors handled safely (no JS crash)
- [ ] **[MAJOR]** AC-41: Initial load + after Clear: grid sorted by `request_date DESC`
- [ ] **[BLOCKER]** AC-42: `in_progress` transition → `assets.status = 'IN_REPAIR'` in same DB transaction as `repair_requests` UPDATE
- [ ] **[MAJOR]** AC-43: Header has language dropdown (flag + label) with VI/EN/JP options; selecting a language updates all visible text in the RepairRequests module (labels, buttons, validation messages, status labels, dialogs) without page reload
- [ ] **[MINOR]** AC-44: Add popup opens with Request date pre-filled to today's date

---

## 3. Design & Dependencies

- [ ] **[BLOCKER]** `client/utils/httpBaseUtil.js` sends `Authorization: Bearer <token>` header (NOT `X-XSRF-TOKEN`) — required for `isAuthenticated` middleware to work
- [ ] **[BLOCKER]** `client/utils/httpUtil.js` exports `patch(endpoint, data)` — required for `PATCH /:id/status`
- [ ] **[BLOCKER]** `client/utils/httpUtil.js` exports `destroyWithBody(endpoint, data)` — required for bulk `DELETE` with body `{ ids: [...] }`
- [ ] **[BLOCKER]** `GET /api/assets/searchbyCodeOrName/:query` endpoint exists and returns `[{ id, asset_code, name }]` (AC-1)
- [ ] **[BLOCKER]** `GET /api/employees/searchbyCodeOrName/:query` endpoint exists and returns `[{ id, employee_code, full_name }]` (AC-2)
- [ ] **[MAJOR]** `i18next@23` + `react-i18next@11` installed (check `package.json`)
- [ ] **[MAJOR]** `client/i18n/index.js` initialises i18n with `vi` as default locale, `en` as fallback
- [ ] **[MAJOR]** Locale files exist: `client/i18n/locales/vi.json`, `en.json`, `ja.json`
- [ ] **[MAJOR]** `client/main.js` imports `client/i18n/index.js` (side-effect import) before rendering
- [ ] **[MINOR]** `server/routes/index.route.js` mounts `/repairRequests`, `/assets`, `/employees` sub-routers

---

## 4. Security

- [ ] **[BLOCKER]** All 7 new routes (`POST /search`, `GET /:id`, `POST /`, `PUT /:id`, `PATCH /:id/status`, `DELETE /`, `GET /searchbyCodeOrName/:q` ×2) have `isAuthenticated` middleware
- [ ] **[BLOCKER]** All mutating routes (POST, PUT, PATCH, DELETE) have `validate(schema.X)` Joi middleware before controller
- [ ] **[BLOCKER]** `updated_by` in controller = `req.currentUser.id` — NOT from `req.body` (AC-38, AC-42)
- [ ] **[BLOCKER]** `asset_id` used in `asset_maintenances` INSERT = fetched from DB record — NOT trusted from request body
- [ ] **[BLOCKER]** `type = 'repair'` in `asset_maintenances` INSERT is hardcoded — NOT from request body
- [ ] **[BLOCKER]** `sortField` in search controller is whitelisted (e.g. `['request_date', 'id', 'status']`) before use in `ORDER BY` — prevents SQL injection
- [ ] **[MAJOR]** Error responses use structured shape: `{ error: true, data: { message: string } }` — NOT raw `err` object; message is `'Internal server error'` for 500 responses (never raw `err.message`)
- [ ] **[MAJOR]** No `console.log` in committed code (use `logger` from Winston)
- [ ] **[MAJOR]** No secrets, tokens, or DB credentials in any committed file
- [ ] **[MINOR]** Swagger JSDoc on all new routes — operationId unique, security: Bearer declared

---

## 5. Architecture & Layer Boundaries

- [ ] **[MAJOR]** `repairRequest.route.js`: contains URL mapping + Joi validation + Swagger JSDoc only — no business logic
- [ ] **[MAJOR]** `repairRequest.controller.js`: calls Knex/model methods only — no raw SQL strings constructed via string concatenation
- [ ] **[MAJOR]** `repairRequest.model.js`, `asset.model.js`, `employee.model.js`, `assetMaintenance.model.js`: table mapping only — no business rules
- [ ] **[MAJOR]** `repairRequestAction.js`: thunk dispatches only — no JSX, no direct DOM access
- [ ] **[MAJOR]** `repairRequestReducer.js`: pure function — no API calls, no side effects, no `Date.now()` calls
- [ ] **[MAJOR]** `repairRequestService.js`: path construction + httpUtil calls only — no Redux imports
- [ ] **[MAJOR]** No circular imports (e.g. action imports reducer, reducer imports action)
- [ ] **[MINOR]** `RepairRequestContainer.js` exists and connects Redux state to `RepairRequestList` — no JSX rendering logic in container beyond wiring

---

## 6. DB Transactions & Status Machine

> All items in this section are [BLOCKER] — data integrity depends on them.

- [ ] **[BLOCKER]** `PATCH /:id/status → done`: `repair_requests` UPDATE + `asset_maintenances` INSERT wrapped in a single `knex.transaction(trx => {...})` call
- [ ] **[BLOCKER]** `PATCH /:id/status → in_progress`: `repair_requests` UPDATE + `assets` UPDATE (`status='IN_REPAIR'`) in the same single transaction (AC-42)
- [ ] **[BLOCKER]** On any write failure inside the transaction: full ROLLBACK — no partial state (test by simulating INSERT failure)
- [ ] **[BLOCKER]** `asset_maintenances` INSERT column mapping:

  | Column | Source | Hardcoded? |
  |--------|--------|-----------|
  | `asset_id` | `repair_requests.asset_id` (fetched from DB) | No — from DB |
  | `repair_request_id` | `repair_requests.id` | No — from DB |
  | `type` | `'repair'` | **Yes — hardcoded** |
  | `maintenance_date` | `repairDate` from request body | No |
  | `description` | `description` from request body | No (optional) |
  | `cost` | `cost` from request body | No |
  | `performed_by` | `performedBy` from request body | No |
  | `created_by` | `req.currentUser.id` | **Yes — from JWT** |

- [ ] **[BLOCKER]** Status transitions validated server-side in controller (not only FE dropdown):

  | From | Allowed → | Rejected → |
  |------|-----------|-----------|
  | `open` | `in_progress`, `cancelled` | `done`, `open` |
  | `in_progress` | `done` | `cancelled`, `open`, `in_progress` |
  | `done` | _(none — controller returns 400)_ | all |
  | `cancelled` | _(none — controller returns 400)_ | all |

- [ ] **[BLOCKER]** Invalid transition returns HTTP 400 with descriptive message — not 500

---

## 7. BE Validation

- [ ] **[BLOCKER]** V-1/V-2: `asset_id` and `requested_by` FK verified to exist in DB in `store()` and `update()` controllers — Joi validates type but not FK existence
- [ ] **[BLOCKER]** V-4: `request_date ≤ today` — enforced in Joi schema (`Joi.date().max('now')`) AND/OR controller
- [ ] **[BLOCKER]** V-6: `repair_date ≥ request_date` — cross-field check in controller; comparison uses YYYY-MM-DD string (`repairDate < requestDateStr`) — timezone-safe; B-3 equal-date case must NOT reject
- [ ] **[BLOCKER]** V-8: `cost ≥ 0` — `cost = 0` is valid (free repair); `cost = -0.01` must fail
- [ ] **[BLOCKER]** V-9: `performed_by` required when `status=done`; max 100 chars enforced (matches `VARCHAR(100)` in DB)
- [ ] **[MAJOR]** Joi option `{ abortEarly: false }` — all validation errors collected, not just first (per security.md §1)
- [ ] **[MAJOR]** Search `sortField` value is safe to interpolate (whitelist validated in controller, not Joi)
- [ ] **[MAJOR]** `GET /searchbyCodeOrName/:query` — controller handles empty string / single space gracefully (returns empty array, not 500)

---

## 8. Performance

- [ ] **[MAJOR]** `GET /assets/searchbyCodeOrName/:q` and `GET /employees/searchbyCodeOrName/:q` have `LIMIT 20` — autocomplete does not return entire table
- [ ] **[MAJOR]** Search controller executes COUNT query separately from data query (Knex) — not loading all rows to count
- [ ] **[MINOR]** `LIKE '%query%'` on `asset_code` / `full_name` — acceptable for current scale; existing DB indexes on `asset_code` and `employee_code` noted in schema
- [ ] **[MINOR]** `AutocompleteField` component does not fire API on every render — only on user keystroke that changes the value
- [ ] **[MINOR]** No N+1 query in search: single JOIN query returns all needed columns (asset_code, asset_name, requested_by_name); not separate queries per row

---

## 9. Frontend Behavior & UX

### Search & Autocomplete
- [ ] **[BLOCKER]** Asset Code autocomplete: calls `searchAssets` on each keystroke ≥1 char; displays `[asset_code] - [name]`; stores `asset_id` on selection (AC-1)
- [ ] **[BLOCKER]** Requested By autocomplete: calls `searchEmployees` on each keystroke ≥1 char; displays `[employee_code] - [full_name]`; stores `employee_id` on selection (AC-2)
- [ ] **[BLOCKER]** Free-text without selection in Add/Edit: rejected on submit with validation error (AC-3, V-11)
- [ ] **[MAJOR]** Free-text without selection in Search bar: `assetId/requestedBy = null`; search runs without that filter (AC-3, A-3 example)
- [ ] **[MAJOR]** Clear: resets Asset Code to empty, Requested By to empty, Status to "all", sort to `request_date DESC`; auto-triggers search (AC-6)

### Grid & Row Rules
- [ ] **[BLOCKER]** `status=done`: Edit icon grayed AND pointer-events blocked; UpdateStatus icon grayed AND pointer-events blocked; View enabled (AC-8)
- [ ] **[BLOCKER]** `status=cancelled`: UpdateStatus icon grayed AND pointer-events blocked; Edit + View enabled (AC-8)
- [ ] **[MAJOR]** Row background colors: selected=`#E8F5E9`, cancelled=`#F5F5F5`, done=`#F1F8F4`, default=white
- [ ] **[MAJOR]** Header checkbox: selects all **non-done** rows on current page (`selectableItems`); `done` row checkboxes are `disabled`; `cancelled` row checkboxes are enabled (spec B-5)
- [ ] **[MAJOR]** Default sort `request_date DESC` on initial page load (AC-41)

### Add / Edit Modals
- [ ] **[BLOCKER]** Add popup: NO id field rendered at all (AC-16)
- [ ] **[BLOCKER]** Add popup field order: Asset Code → Requested By → Description → Request date (AC-16)
- [ ] **[BLOCKER]** Edit popup: `id` displayed as `<Typography>` label — NOT inside `<input>` / `<TextField>` (AC-21)
- [ ] **[MAJOR]** Edit popup pre-fills all fields from `GET /api/repairRequests/{id}` response (AC-20)
- [ ] **[MAJOR]** Edit popup: selecting a new asset/employee via autocomplete shows new display text AND submits new ID — not stale `selectedItem` value (AC-22) — verify `EditAssetFieldComponent`/`EditEmployeeFieldComponent` are module-level (not inline), and `initialValues` includes `assetDisplay`/`requestedByDisplay` separate from `assetId`/`requestedBy`

### Update Status Popup
- [ ] **[BLOCKER]** Status dropdown options per current status (AC-31, §5.9 table):
  - `open` → shows only: `in_progress`, `cancelled`
  - `in_progress` → shows only: `done`
  - `done` / `cancelled` → UpdateStatus icon disabled; popup never opens
- [ ] **[BLOCKER]** On status → `done`: Repair date + Cost + Performed by + Description **enabled AND cleared** (AC-31)
- [ ] **[BLOCKER]** On status → non-done (including initial load): those 4 fields **disabled AND cleared** (AC-32)
- [ ] **[MAJOR]** `performed_by` is a plain `<TextField>` (free-text) — NOT an autocomplete (OI-3)
- [ ] **[MAJOR]** Description is optional when status=done — no validation error if absent (C-008 resolution)

### Delete
- [ ] **[MAJOR]** 0 selected → message "Please select the items to delete." with **single OK button** only (AC-26)
- [ ] **[MAJOR]** n selected → confirm "Delete (n items). Are you sure?" with OK + Cancel (AC-27)
- [ ] **[MAJOR]** Bulk delete sends array `{ ids: [...] }` — not individual DELETE calls (AC-29)
- [ ] **[BLOCKER]** BE `destroy()`: pre-checks for `status='done'` in requested IDs → 400 "Cannot delete records with status 'done'"; direct delete for remaining (spec B-5)
- [ ] **[BLOCKER]** BE `update()`: pre-checks existing record `status='done'` → 400 "Cannot edit a record with status 'done'"

### Pagination
- [ ] **[MAJOR]** Records-per-page options: 10 / 20 / 50 / 100 (AC-9)
- [ ] **[MAJOR]** Pagination display: "X–Y of Z" (AC-11)
- [ ] **[MINOR]** First / Prev / Next / Last navigation buttons present

---

## 10. i18n

- [ ] **[MAJOR]** All user-visible strings use `t('repairRequests.xxx')` — no hardcoded English/Vietnamese strings in JSX
- [ ] **[MAJOR]** `vi.json`, `en.json`, `ja.json` each contain the same set of keys (no missing key in any locale)
- [ ] **[MAJOR]** Interpolated strings use i18next syntax: `t('repairRequests.deleteConfirm', { count: n })` for "Delete (n items)..." (AC-27)
- [ ] **[MAJOR]** Success messages multilingual: Add success (AC-17), Update Status success (AC-39)
- [ ] **[MAJOR]** Empty state message multilingual: "Repair request does not exist." (AC-5)
- [ ] **[MAJOR]** All validation error messages (V-1 to V-11) have translations in all 3 locales
- [ ] **[MINOR]** Default locale is `vi` (Vietnamese); fallback is `en`
- [ ] **[MINOR]** Language switch mechanism is out of scope — not implemented, no partial implementation left in code

---

## 11. Compatibility

- [ ] **[MAJOR]** `react-i18next@11` + `i18next@23` work with React 17 — no peer dep warnings in `npm install` output
- [ ] **[MAJOR]** All new MUI components use `@material-ui/core v4` API (not MUI v5) — no `@mui/` imports
- [ ] **[MAJOR]** Icons from `@material-ui/icons` only — no `lucide-react` imports
- [ ] **[MAJOR]** All new components are functional (not class components) — consistent with codebase pattern
- [ ] **[MAJOR]** Redux-Form `reduxForm({ form: 'UniqueName', validate })` — form name is unique per modal (no two forms share the same name string)
- [ ] **[MAJOR]** Date input uses `<input type="date">` adapted for redux-form — no `@material-ui/pickers` import
- [ ] **[MINOR]** No TypeScript — all new files are `.js`, not `.ts` / `.tsx` (OI-6)
- [ ] **[MINOR]** Webpack 4 build (not Vite or Webpack 5) — no syntax that Webpack 4 cannot handle (e.g. optional chaining `?.` requires Babel plugin)

---

## 12. Logging & Audit

- [ ] **[MAJOR]** New controllers use `logger` from `server/config/winston.js` for errors — not `console.error`
- [ ] **[MAJOR]** No request body logged — especially no `cost`, `performedBy`, user IDs logged at INFO level
- [ ] **[MINOR]** Error log messages are descriptive strings — not raw `JSON.stringify(err)`
- [ ] **[MINOR]** No `console.log` / `console.error` / `console.warn` in any committed file (server or client)

---

## 13. Error Handling

- [ ] **[MAJOR]** Add API error (4xx/5xx) → modal stays open; `error.response.data.data.message` displayed inline below form (AC-18, AC-40)
- [ ] **[MAJOR]** Edit / UpdateStatus / Delete / Search API error → MUI Snackbar toast shown; modal stays open; grid data NOT cleared (AC-24 amended v1.6, AC-40)
- [ ] **[MAJOR]** Network error (no response) → `httpBaseUtil` interceptor guarded with `if (error.response)` — no unhandled JS crash; error message from `err.message` shown in toast
- [ ] **[MAJOR]** 401 response from API → user redirected to login (existing `httpBaseUtil` interceptor handles this)
- [ ] **[MAJOR]** Controller `.catch()` returns HTTP 500 with `'Internal server error'` — NOT raw `err.message`; full error detail in `logger.log()` only

---

## 14. Testing

- [ ] **[MAJOR]** Manual test steps in `docs/changes/REPAIRREQUESTS/test-plan.md` have been executed
- [ ] **[MAJOR]** Results recorded in `docs/changes/REPAIRREQUESTS/test-results.md` — no empty rows
- [ ] **[MAJOR]** Boundary values tested (B-1 to B-5 from spec-pack §9): future date, Cost=0, Cost=-0.01, Repair date = Request date
- [ ] **[MAJOR]** Abnormal cases tested (A-1 to A-5): delete no selection, negative cost, free-text autocomplete, cancel confirm, API failure
- [ ] **[MINOR]** `self-review.md` completed by author before sending PR for review
- [ ] **[MINOR]** No test files deleted or modified

---

## 15. Operations

- [ ] **[BLOCKER]** `npm run migrate` succeeds — all 13 tables created in correct FK order (locations → asset_types → departments → assets → employees → ... → audits_items)
- [ ] **[BLOCKER]** `knex migrate:status` shows all 13 new migrations as "Completed" alongside `20170715222060_create_users_table.js`
- [ ] **[MAJOR]** `exports.down` in each migration correctly drops the table — rollback does not leave orphaned FKs
- [ ] **[MAJOR]** Migration `exports.down` for FK tables drops the child table before parent (reverse of `up` order)
- [ ] **[MAJOR]** `npm run migrate:rollback` can be run without error (test in dev DB)
- [ ] **[MINOR]** Migration filenames use timestamp prefix that preserves FK order (e.g. suffix `_001_` through `_013_`)

---

## 16. Coding Standards

- [ ] **[MINOR]** Variables/functions: `camelCase`; components: `PascalCase`; action types: `UPPER_SNAKE_CASE`
- [ ] **[MINOR]** Single quotes `'`, semicolons `;`, curly braces always, `===` not `==`
- [ ] **[MINOR]** JSDoc `@param` + `@returns` on all exported functions (controllers, services, action creators)
- [ ] **[MINOR]** No `var` — use `const` or `let`
- [ ] **[MINOR]** `propTypes` defined for all new React components
- [ ] **[MINOR]** No commented-out code committed
- [ ] **[MINOR]** `npm run lint` passes 0 errors (ESLint on `client/` and `server/`)

---

## 17. Findings

| # | Severity | File / Location | Description | AC |
|---|----------|----------------|-------------|-----|
| 1 | [Major] | Test coverage | No `__tests__` files for module; `test-results.md` rows empty; critical flows (transaction rollback, Edit autocomplete submit, FK delete, date B-3 boundary) have no automated coverage | — |

---

## 18. Judgment

- [ ] **Approve** — all BLOCKERs and MAJORs confirmed OK
- [ ] **Request changes** — one or more BLOCKERs or MAJORs failed (see findings above)
- [ ] **Comment only** — no blockers; minor suggestions only

**Reason:**

---

*End of Review Checklist — REPAIRREQUESTS v4.0*
