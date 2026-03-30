# Test Results — REPAIRREQUESTS

> Author: Phase 6 | Date: 2026-03-29 | Build: npm test | Branch: master
> Spec: spec-pack.md v1.6

---

## Summary

| Category | Total | Pass | Fail | Skip |
|----------|-------|------|------|------|
| Unit Tests | 26 | **26** | 0 | 0 |
| Integration Tests | 1 | 0 | 0 | 1 (deferred) |
| Manual Steps | 42 | — | — | — |
| Edge Cases | 10 | — | — | — |

Overall: **UNIT PASS / INTEGRATION DEFERRED / MANUAL PENDING**

---

## Unit Test Results

Command run:
```
npx jest --no-coverage
```

Output:
```
PASS server/routes/__tests__/repairRequest.status.transaction.test.js
PASS client/reducers/__tests__/repairRequestReducer.test.js
PASS client/components/repairRequests/__tests__/UpdateStatusModal.validate.test.js
PASS client/components/repairRequests/__tests__/RepairRequestEditModal.validate.test.js
PASS client/components/repairRequests/__tests__/RepairRequestAddModal.validate.test.js

Test Suites: 5 passed, 5 total
Tests:       26 passed, 26 total
Time:        ~17 s
```

| Test file | Cases | Result | Notes |
|-----------|-------|--------|-------|
| `client/reducers/__tests__/repairRequestReducer.test.js` | 7 | **PASS** | SEARCH_SUCCESS (items/total/page/pageSize, error cleared, selectedIds intersection); SET_SELECTED_IDS (set-all, clear-all, no side-effects); FAILURE (error set, items unchanged) |
| `client/reducers/__tests__/repairRequestReducer.test.js` (legacy) | (included above) | **PASS** | Original selectedIds intersection test preserved and extended |
| `client/components/repairRequests/__tests__/RepairRequestAddModal.validate.test.js` | 6 | **PASS** | assetId required; requestedBy required; requestDate required; future date rejected; today accepted; all valid |
| `client/components/repairRequests/__tests__/RepairRequestEditModal.validate.test.js` | 1 | **PASS** | Error keys map to `assetDisplay`/`requestedByDisplay` (not `assetId`/`requestedBy`) |
| `client/components/repairRequests/__tests__/UpdateStatusModal.validate.test.js` | 11 | **PASS** | repairDate required/before/equal/after; cost negative/-0/empty/null; performedBy optional; status required; full valid |
| `server/routes/__tests__/repairRequest.status.transaction.test.js` | 1 (empty) | **PASS (vacuous)** | Placeholder only — no assertions, passes vacuously |

### Infrastructure fixes required before tests ran

| Issue | Root Cause | Fix Applied |
|-------|-----------|-------------|
| `Requires Babel "^7.22.0"` on all suites | `babel-preset-current-node-syntax@1.2.0` (transitive via `babel-jest@27`) requires `@babel/core >= 7.22`, repo has `7.13.14` | Downgraded to `jest@26.6.3` + `babel-jest@26.6.3`; pinned `babel-preset-current-node-syntax` to `1.0.1` via `package.json overrides` |

---

## Integration Test Results

| Route | Case | Result | Notes |
|-------|------|--------|-------|
| `server/routes/__tests__/repairRequest.status.transaction.test.js` | rollback on `PATCH /status -> done` insert failure | **SKIP** | Deferred — no test DB harness. Placeholder file kept; implement when `NODE_ENV=test` DB is available |
| POST /search | 200 with items | SKIP | |
| POST /search | 200 empty list | SKIP | |
| POST /search | 401 no token | SKIP | |
| POST /search | default sort DESC | SKIP | |
| GET /:id | 200 full record | SKIP | |
| GET /:id | 404 not found | SKIP | |
| POST / | 201 status=open | SKIP | |
| POST / | 400 future date | SKIP | |
| PUT /:id | 200 success | SKIP | |
| PUT /:id | 400 validation fail | SKIP | |
| PATCH /:id/status → done | 200 + asset_maintenances created | SKIP | |
| PATCH /:id/status → in_progress | 200 + assets.status=IN_REPAIR | SKIP | |
| PATCH /:id/status | 400 invalid transition | SKIP | |
| PATCH /:id/status | rollback on INSERT fail | SKIP | |
| DELETE / | 200 deleted | SKIP | |
| DELETE / | 400 empty ids | SKIP | |

---

## Manual Test Results

| # | Step (short) | Result | Notes |
|---|-------------|--------|-------|
| 1 | Page loads sorted DESC | | |
| 2 | Asset Code autocomplete | | |
| 3 | Requested by autocomplete | | |
| 4 | Free-text autocomplete in Search | | |
| 5 | Search with filters | | |
| 6 | Empty search result message | | |
| 7 | Clear resets + reloads | | |
| 8 | Header checkbox select/deselect all | | |
| 9 | done row: Edit+UpdateStatus disabled | | |
| 10 | cancelled row: UpdateStatus disabled only | | |
| 11 | PageSize change triggers search | | |
| 12 | Next page + X–Y of Z display | | |
| 13 | Add popup: no ID, field order correct | | |
| 13a | Add popup: Request date pre-filled today (AC-44) | | |
| 14 | Add: Asset Code required | | |
| 15 | Add: Requested by required | | |
| 16 | Add: Request date required | | |
| 17 | Add: future date rejected | | |
| 18 | Add: valid submit | | |
| 19 | Add: API error → modal stays + inline error | | |
| 20 | Add: Close/X discards | | |
| 21 | Edit: loads data pre-filled | | |
| 22 | Edit: id as label not input | | |
| 22a | Edit: new autocomplete selection doesn't revert on re-render | | |
| 23 | Edit: valid submit | | |
| 24 | Edit: API error → modal stays + **toast** (amended AC-24) | | |
| 25 | Delete: no selection message | | |
| 26 | Delete: confirm with n items | | |
| 27 | Delete: Cancel closes | | |
| 28 | Delete: OK calls API | | |
| 29 | UpdateStatus popup opens (open row) | | |
| 30 | Status→done enables+clears fields | | |
| 31 | Status→other disables+clears fields | | |
| 32 | done: Repair date required | | |
| 33 | done: Cost=-1 rejected | | |
| 34 | done: Cost=0 valid (free repair) | | |
| 35 | done: Cost blank → valid (AC-34 amended) | | |
| 36 | done: Performed by blank → valid (AC-35 amended) | | |
| 37 | done: Repair date < request_date → error | | |
| 38 | done: asset_maintenances created | | |
| 39 | in_progress: assets.status=IN_REPAIR | | |
| 40 | Network error → toast; grid intact | | |
| 41 | Language → EN: all text in module updates | | |
| 42 | Language → JP: all text in module updates | | |

---

## Edge Case Results

| Edge Case | Result | Notes |
|-----------|--------|-------|
| Autocomplete free-text rejected in Add | | |
| Repair date = Request date (equal, valid) — **UT covered** | UT PASS | `UpdateStatusModal.validate.test.js` B-3 case |
| Cost = 0 valid — **UT covered** | UT PASS | `UpdateStatusModal.validate.test.js` B-2 case |
| Cost = -0.01 rejected — **UT covered** | UT PASS | `UpdateStatusModal.validate.test.js` |
| performed_by 101 chars rejected (BE Joi) | | |
| Total=10 pageSize=10 → Next disabled | | |
| Total=11 page 2 shows 1 record | | |
| Select all + bulk delete incl. done/cancelled | | |
| API 5xx on Search → grid intact | | |
| cost='' → valid (AC-34 amended) — **UT covered** | UT PASS | `UpdateStatusModal.validate.test.js` |

---

## Failures / Bugs Found

| # | AC | Description | Severity | Status |
|---|-----|------------|---------|--------|
| | | _None found during unit test phase_ | | |

---

## Sign-off

- [ ] All failures resolved or deferred with ticket
- [ ] `npm run lint` — 0 errors (run date: ___)
- [ ] `npm run build` — no errors (run date: ___)
- [ ] Ready for PR review
