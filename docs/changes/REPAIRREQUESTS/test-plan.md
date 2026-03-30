# Test Plan — REPAIRREQUESTS

> Version: 2.0 | Date: 2026-03-29 | Spec: spec-pack.md **v1.6**
> Prior version: 1.4 (spec v1.4, no runner)

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 2.0 | 2026-03-29 | Aligned to spec v1.6; added Jest runner; implemented FE UT; revised AC-34/35/40/24 per amendments |
| 1.4 | — | Initial template (spec v1.4, runner not configured) |

---

## Scope

**What is being tested:**
- All 44 ACs from spec-pack.md v1.6 (Search, Grid, Add, Edit, Delete, Update Status, Pagination, i18n, default date)
- BE: 6 API endpoints + 2 autocomplete deps (`/assets/searchbyCodeOrName`, `/employees/searchbyCodeOrName`)
- FE: List page, Add/Edit/View/UpdateStatus modals, pagination, bulk select, bulk delete

**What is NOT being tested:**
- Email / push notification (out of scope per §2)
- Export to Excel/PDF (out of scope per §2)
- Role-based permissions (auth-only per OI-7)
- E2E (Playwright): documented in §E2E below — deferred, Playwright not installed

---

## Test Runner

```bash
npm test          # runs all __tests__/**/*.test.js via Jest 26
```

**Infrastructure:**
- `jest@26.6.3` + `babel-jest@26.6.3` (devDependencies)
- `.babelrc` `env.test` override: no `react-hot-loader/babel`, `targets.node = current`
- `__mocks__/i18nMock.js`: returns translation key as-is
- `package.json` `overrides.babel-preset-current-node-syntax: 1.0.1` (pins transitive dep for @babel/core 7.13 compat)

---

## Unit Tests (FE)

> Runner: Jest 26 + babel-jest. All 26 tests PASS as of 2026-03-29.

### Reducer — `client/reducers/__tests__/repairRequestReducer.test.js`

| Case | Covers |
|------|--------|
| SEARCH_SUCCESS: items/total/page/pageSize updated from payload | AC-4 |
| SEARCH_SUCCESS: error + successMessage cleared | AC-40 |
| SEARCH_SUCCESS: selectedIds intersected — done IDs dropped, off-page IDs dropped | AC-7 |
| SET_SELECTED_IDS: payload replaces selectedIds (set-all) | AC-7 |
| SET_SELECTED_IDS: empty payload clears selectedIds (clear-all) | AC-7 |
| SET_SELECTED_IDS: other state fields unchanged | — |
| FAILURE: error set to payload; items NOT wiped | AC-40 |

### Add Modal — `client/components/repairRequests/__tests__/RepairRequestAddModal.validate.test.js`

| Case | Covers |
|------|--------|
| assetId null → error on `assetId` | AC-12 |
| requestedBy null → error on `requestedBy` | AC-13 |
| requestDate empty → error on `requestDate` | AC-14 |
| requestDate = tomorrow → error (future date) | AC-15 |
| requestDate = today → no error (boundary: not future) | AC-15 |
| All valid → no errors | — |

> Note: `validate` in AddModal uses `i18n.t()` (module-level i18n, mocked via `moduleNameMapper`).
> Error keys map to `values.assetId`, `values.requestedBy`, `values.requestDate` (not display fields).
> Edit modal maps to `assetDisplay`/`requestedByDisplay` — different intentional pattern — covered by `RepairRequestEditModal.validate.test.js`.

### Edit Modal — `client/components/repairRequests/__tests__/RepairRequestEditModal.validate.test.js`

| Case | Covers |
|------|--------|
| assetId null + requestedBy null → errors on `assetDisplay` + `requestedByDisplay` (not on `assetId`/`requestedBy`) | AC-22 |

### Update Status Modal — `client/components/repairRequests/__tests__/UpdateStatusModal.validate.test.js`

| Case | Covers |
|------|--------|
| isDone + repairDate empty → error | AC-33 |
| isDone + repairDate < requestDate → error | AC-36 |
| isDone + repairDate = requestDate → no error (boundary B-3: equal is valid) | AC-36, B-3 |
| isDone + repairDate > requestDate → no error | AC-36 |
| isDone + cost = -0.01 → error | AC-37 |
| isDone + cost = 0 → no error (free repair, B-2) | AC-37, B-2 |
| isDone + cost = '' → no error (cost optional, amended AC-34) | AC-34 |
| isDone + cost = null → no error (cost optional, amended AC-34) | AC-34 |
| isDone + no performedBy → no error (performedBy optional, amended AC-35) | AC-35 |
| status empty → error on `status` | — |
| All valid (done, full payload) → no errors | — |

> `validateUpdateStatus` is extracted as a module-level exported pure function.
> Receives `t` as parameter — tested with `(key) => key` stub (no i18n mock needed).

---

## Integration Tests (BE)

> Status: **Deferred** — no test DB harness configured.
> Placeholder: `server/routes/__tests__/repairRequest.status.transaction.test.js` (empty body, PASS vacuously)

When a real test DB is available, implement the following with `NODE_ENV=test` against a dedicated test DB:

| Route | Cases | Covers |
|-------|-------|--------|
| `POST /search` | 200 with items; 200 empty list; 401 no token; 400 invalid body | AC-4, AC-5 |
| `POST /search` | response ordered by request_date DESC | AC-41 |
| `GET /:id` | 200 full record; 404 not found; 401 | AC-20 |
| `POST /` | 201 status=open; 400 missing asset_id; 400 future request_date; 401 | AC-15, AC-17 |
| `PUT /:id` | 200 success; 400 validation fail; 401 | AC-22, AC-23 |
| `PATCH /:id/status → done` | 200 + asset_maintenances row created + all columns correct | AC-38 |
| `PATCH /:id/status → in_progress` | 200 + assets.status = 'IN_REPAIR' | AC-42 |
| `PATCH /:id/status` invalid transition | 400 for done→anything; cancelled→anything | AC-10 |
| `DELETE /` | 200 rows deleted; 400 empty ids; 401 | AC-29 |
| Transaction rollback | Simulate asset_maintenances INSERT fail → repair_requests status NOT updated | AC-38 risk |

---

## E2E (Playwright) — Deferred

> Playwright not installed. Requires running app + populated test DB.
> Document minimum-value flows for when infrastructure is available:

**Normal flow (happy path):**
1. Open REPAIR REQUESTS page → grid loads sorted DESC
2. Search by asset code + status → filtered results
3. Add a repair request (valid payload) → new row appears, status=open
4. Edit the new request → changes saved
5. UpdateStatus → done (with repair date, cost=0) → row turns green, asset_maintenances record created
6. Bulk-delete two open requests → rows removed

**Abnormal cases:**
- Add with future request_date → inline error, no API call
- UpdateStatus done with cost=-1 → error shown, no submission
- Delete with no selection → "Please select..." warning dialog
- Network failure during Search → toast error; existing grid data preserved

---

## Manual Test Steps

Execute in order. Record pass/fail in `test-results.md`.

| # | Step | Expected | AC |
|---|------|---------|-----|
| 1 | Open REPAIR REQUESTS page | Grid loads sorted request_date DESC (newest first) | AC-41 |
| 2 | Type ≥1 char in Asset Code field | Dropdown appears with `[asset_code] - [name]` format | AC-1 |
| 3 | Type ≥1 char in Requested by field | Dropdown appears with `[employee_code] - [name]` format | AC-2 |
| 4 | Type text in Asset Code, do NOT select from dropdown, click Search | Search runs; assetId treated as null (no asset filter) | AC-3 |
| 5 | Select Asset Code + status "in progress", click Search | Grid shows only in_progress rows; payload: `{ assetId, status: "in_progress", page: 1, pageSize: 10, sortField: "request_date", sortDir: "desc" }` | AC-4 |
| 6 | Search returns 0 items | Grid shows "Repair request does not exist." | AC-5 |
| 7 | Click Clear | All filters reset; grid reloads default (request_date DESC) | AC-6 |
| 8 | Click header checkbox | All selectable rows on page selected; click again → deselect all | AC-7 |
| 9 | Find a row with status=done | Edit icon: grayed + non-clickable; View: enabled; UpdateStatus: grayed + non-clickable | AC-8 |
| 10 | Find a row with status=cancelled | UpdateStatus: grayed + non-clickable; Edit: enabled; View: enabled | AC-8 |
| 11 | Change pageSize to 20 | New search fires with pageSize=20, page=1 | AC-9 |
| 12 | Click Next page | New search fires with page=2; pagination shows correct X–Y of Z | AC-10, AC-11 |
| 13 | Click Add | Popup opens; NO id field visible; field order: Asset Code → Requested By → Description → Request date | AC-16 |
| 13a | Check Request date field in Add popup | Pre-filled to today's date | AC-44 |
| 14 | Submit Add with Asset Code empty | "Asset Code is required"; no API call | AC-12 |
| 15 | Submit Add with Requested by empty | "Requested by is required"; no API call | AC-13 |
| 16 | Submit Add with Request date empty | "Request date is required"; no API call | AC-14 |
| 17 | Submit Add with Request date = tomorrow | "Cannot be a future date"; no API call | AC-15 |
| 18 | Submit valid Add | Success message (multilingual); modal closes; grid refreshes; new row status=open | AC-17 |
| 19 | Simulate Add API error | Modal stays open; server error shown **inline** (not toast) | AC-18, AC-40 |
| 20 | Click X / Close on Add popup | Modal closes immediately; no data retained | AC-19 |
| 21 | Click Edit on a row | `GET /{id}` called; popup opens with all fields pre-filled | AC-20 |
| 22 | Check id in Edit popup | Shown as plain text label, NOT inside input/TextField | AC-21 |
| 22a | In Edit: select new Asset, blur, then re-open suggestions → submit | Submitted assetId = newly selected value (no stale revert) | AC-22 |
| 23 | Submit valid Edit | "Cập nhật thành công" as dialog; modal closes; grid refreshes | AC-23 |
| 24 | Simulate Edit API error | Modal stays open; error shown as **toast** (not inline) | AC-24 (amended v1.6) |
| 25 | Click Delete with no rows selected | "Please select the items to delete." + OK only | AC-26 |
| 26 | Select 3 rows, click Delete | "Delete (3 items). Are you sure?" + OK + Cancel | AC-27 |
| 27 | Click Cancel on delete confirm | Modal closes; 3 rows remain | AC-28 |
| 28 | Click OK on delete confirm | `DELETE /repairRequests` with ids body; rows removed from grid | AC-29 |
| 29 | Click UpdateStatus (RotateCw) on open row | Popup opens; id shown read-only; status options = in_progress, cancelled | AC-30 |
| 30 | Change status dropdown to done | Repair date, Cost, Performed by, Description: enabled AND cleared | AC-31 |
| 31 | Change status back to in_progress | All 4 fields: disabled AND cleared | AC-32 |
| 32 | Submit done without Repair date | "Repair date is required" | AC-33 |
| 33 | Submit done with Cost = -1 | "Cost cannot be negative" | AC-37 |
| 34 | Submit done with Cost = 0 | Success (free repair, Cost optional and 0 is valid) | N-4, AC-34 amended |
| 35 | Submit done without Cost (leave blank) | Success (Cost is optional per AC-34 amendment) | AC-34 amended |
| 36 | Submit done without Performed by | Success (Performed by is optional per AC-35 amendment) | AC-35 amended |
| 37 | Submit done with Repair date < request_date of record | "Repair date must be after Request date" | AC-36 |
| 38 | Submit done successfully | `PATCH /{id}/status` called; `asset_maintenances` record created in DB; success message (multilingual); modal closes; grid row status=done with green background | AC-38, AC-39 |
| 39 | Submit in_progress successfully | `assets.status = 'IN_REPAIR'` in DB for that asset | AC-42 |
| 40 | Simulate network error on any non-modal action (Delete, UpdateStatus) | Toast error shown; grid data NOT cleared | AC-40 |
| 41 | Language dropdown: switch to EN | All visible text in REPAIR REQUESTS module updates to English without reload | AC-43 |
| 42 | Language dropdown: switch to JP | All visible text updates to Japanese | AC-43 |

---

## Edge Cases

- [ ] Autocomplete free-text (no selection) in Add form → submit → rejected, error shown (AC-3)
- [ ] `Repair date = Request date` (same day) → valid (B-3: equal is allowed, ≥) — **covered by UT**
- [ ] `Cost = 0` → valid (B-2) — **covered by UT**
- [ ] `Cost = -0.01` → "Cost cannot be negative" (B-2) — **covered by UT**
- [ ] `performed_by` = 101 chars → rejected at BE (V-9, max 100 in Joi schema)
- [ ] Edit modal: re-select Asset/Requested by, trigger re-render, then submit → hidden ID and displayed text stay in sync with latest selection
- [ ] Total=10, pageSize=10 → Next/Last pagination buttons disabled (B-4)
- [ ] Total=11, pageSize=10 → page 2 shows 1 record (B-4)
- [ ] Select all on page including done/cancelled rows → bulk delete includes non-done rows (B-5)
- [ ] API 5xx on Search → toast error; existing grid data unchanged (A-5)

---

## Pass Criteria

- [x] All unit tests pass (`npm test` → 26/26)
- [ ] All integration tests pass (deferred — no test DB)
- [ ] All manual steps: PASS
- [ ] All edge cases: PASS
- [ ] `npm run lint` — 0 errors
- [ ] `npm run build` — no errors
