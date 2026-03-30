# Black-Box Review Checklist — REPAIRREQUESTS

> Version: 1.0 | Date: 2026-03-29
> Purpose: Catch perspective gaps that are easy to miss when writing test cases feature-by-feature.
> Source: blackbox-testcases.md v2.0, spec-pack.md v1.6

Instructions: Run through this checklist after drafting or updating test cases.
Mark each item: ✅ covered | ❌ missing | N/A not applicable to this module

---

## 1. Boundary Values

*Have all ≤ / ≥ / = boundaries from §6 Validation Rules been tested?*

- [ ] **V-4 Request date = today** — accepted (BB-034)
- [ ] **V-4 Request date = today + 1 day** — rejected (BB-033)
- [ ] **V-4 Request date = today − 1 day** — accepted (BB-035)
- [ ] **V-6 Repair date = Request date** — accepted (BB-074, B-3: equal is valid ≥)
- [ ] **V-6 Repair date = Request date − 1 day** — rejected (BB-073)
- [ ] **V-6 Repair date = Request date + 1 day** — accepted (implicit in §9 N-3)
- [ ] **V-7/V-8 Cost = 0** — accepted (BB-077, free repair)
- [ ] **V-7/V-8 Cost = -0.01** — rejected (BB-076)
- [ ] **V-7/V-8 Cost = 0.01** — accepted (BB-078)
- [ ] **V-7/V-8 Cost = null / omitted** — accepted, stored as NULL (BB-068, BB-069)
- [ ] **V-9 Performed by = 100 chars** — accepted (BB-071)
- [ ] **V-9 Performed by = 101 chars** — rejected at BE (BB-072)
- [ ] **V-9 Performed by = empty / null** — accepted, stored as NULL (BB-070)
- [ ] **Pagination: total = pageSize** — Next/Last disabled; no page 2 (BB-026)
- [ ] **Pagination: total = pageSize + 1** — page 2 exists with 1 row (BB-027)
- [ ] **Pagination: total = 0** — empty-state message shown (BB-012)

---

## 2. Auth / Security

*Every state-mutating and data-reading endpoint has an unauthenticated test?*

| Endpoint | 401 no-token case | BB |
|----------|------------------|----|
| POST /repairRequests/search | [ ] | BB-015 |
| POST /repairRequests (Add) | [ ] | BB-043 |
| GET /repairRequests/:id (Edit fetch) | [ ] | BB-052 (implied) |
| PUT /repairRequests/:id (Edit save) | [ ] | BB-052 |
| DELETE /repairRequests (Bulk delete) | [ ] | BB-061 |
| PATCH /repairRequests/:id/status | [ ] | BB-084 |
| GET /assets/searchbyCodeOrName/:q | [ ] | N/A if public; confirm |
| GET /employees/searchbyCodeOrName/:q | [ ] | N/A if public; confirm |

Additional auth checks:
- [ ] Malformed JWT (invalid signature) → 401 (§7.3 test-data.md)
- [ ] Expired JWT → 401 (§7.4 test-data.md)
- [ ] JWT with valid format but unknown user id → 401 or 403

---

## 3. Status Transition FSM

*Every arc of the status finite state machine has at least one test?*

```
open ──→ in_progress   ✅ BB-080
open ──→ cancelled     [ ] not explicitly tested (open-row dropdown shows cancelled option — BB-062 covers options visible)
in_progress ──→ done   ✅ BB-079, BB-083
in_progress ──→ cancelled  ❌ NOT ALLOWED — tested via BB-086 (BE rejects)
done ──→ anything      ❌ NOT ALLOWED — tested via BB-085 (BE rejects)
cancelled ──→ anything ❌ NOT ALLOWED — UpdateStatus icon disabled (BB-021), no popup opened
```

Additional FSM checks:
- [ ] UI: done row UpdateStatus icon is grayed + non-clickable (BB-020)
- [ ] UI: cancelled row UpdateStatus icon is grayed + non-clickable (BB-021)
- [ ] BE: open → done (skip in_progress) — is this allowed or blocked? Confirm with spec §5.9 transition table (currently: open dropdown shows in_progress + cancelled only, done NOT shown → this path is prevented by UI; test BE independently)

---

## 4. DB Transaction Integrity

*Atomic operations that span multiple tables are tested for rollback correctness?*

- [ ] **PATCH → done** success: both `repair_requests.status = 'done'` AND `asset_maintenances` row created in same commit (BB-079)
- [ ] **PATCH → done** rollback: if `asset_maintenances` INSERT fails, `repair_requests.status` NOT updated (BB-082)
- [ ] **PATCH → in_progress** success: both `repair_requests.status = 'in_progress'` AND `assets.status = 'IN_REPAIR'` in same commit (BB-080)
- [ ] **PATCH → in_progress** rollback: if `assets` UPDATE fails, `repair_requests.status` NOT updated (BB-081)
- [ ] No orphan `asset_maintenances` rows if PATCH → done is later rolled back

---

## 5. Error Handling Completeness

*Every error feedback rule from AC-40 (v1.6) is covered?*

| Action | Expected error display | BB |
|--------|----------------------|----|
| Add API failure | Inline in Add modal (NOT toast) | BB-087 |
| Edit API failure | Toast (NOT inline) — amended AC-24 v1.6 | BB-050, BB-089 |
| UpdateStatus API failure | Toast | BB-088 |
| Delete API failure | Toast | BB-088 |
| Search API failure | Toast; grid data preserved | BB-090 |
| GET /:id fetch failure (Edit open) | Toast | (covered by BB-090 principle) |

- [ ] Network timeout (no response) → handled gracefully, no unhandled JS exception (BB-091)
- [ ] Server returns non-JSON body (HTML 502) → no white screen (BB-091)
- [ ] 503 Service Unavailable → toast shown (BB-091)

---

## 6. i18n / Localization Completeness

*All user-visible text in all three languages (VN/EN/JP)?*

- [ ] Page title and navigation tab label (BB-094, BB-095)
- [ ] Column headers in grid (BB-094)
- [ ] Button labels: Search, Clear, Add, Delete (BB-094)
- [ ] Status display labels in dropdown and grid: open, in progress, done, cancelled (BB-094)
- [ ] Validation errors — all messages from §6 Validation Rules (BB-096, BB-097)
- [ ] Confirmation dialog text: "Delete (n items). Are you sure?" (BB-094)
- [ ] Warning dialog: "Please select the items to delete." (BB-094)
- [ ] Success messages: Add/Edit "Thông báo", UpdateStatus "Cập nhật trạng thái thành công." (BB-094)
- [ ] Empty-state text: "Repair request does not exist." (BB-012, BB-094)
- [ ] Language switcher itself: flags + language names displayed correctly (BB-094)
- [ ] Language switch mid-session (while modal open) does not crash (BB-098)

---

## 7. Autocomplete Edge Cases

*Autocomplete behavior beyond the happy path?*

- [ ] Minimum 1 character triggers call (BB-001, BB-002)
- [ ] Zero characters typed → no call triggered
- [ ] Query returns no results → empty dropdown or "no results" indicator, no crash (BB-005)
- [ ] Query returns many results (50+) → dropdown renders without performance degradation
- [ ] Unicode / Vietnamese diacritics in query handled correctly (BB-007)
- [ ] Free-text without selection: Add/Edit → rejected on submit (BB-003, BB-004)
- [ ] Free-text without selection: Search → treated as null filter, NOT rejected (BB-006)
- [ ] Select value, then clear field, then type new value → submit uses new selection (BB-048)
- [ ] Select value, trigger re-render, submit → original selection not lost (BB-048)
- [ ] Asset Code and Requested by fields independently validated (BB-031)

---

## 8. Concurrent / Race Conditions

*Scenarios where two users or two actions interact?*

- [ ] Two users open UpdateStatus on the same record simultaneously → second user sees stale/updated state?
- [ ] User A edits a record; User B deletes it in parallel → User A's PUT returns 404 or appropriate error
- [ ] User opens Edit popup (GET /:id fetches record); between fetch and submit, another user changes the record → PUT succeeds or conflicts?
- [ ] Rapid double-click on Submit (Add or Edit) → duplicate records created?

> These are P2 and require coordination or BE-level idempotency checks. Document results when tested.

---

## 9. UI / Responsive / Compatibility

*Non-functional requirements from spec §7?*

- [ ] Desktop (≥1200px): full table with all 8 columns visible; no horizontal scroll (spec §7)
- [ ] Tablet (768–1199px): table scrollable horizontally; no broken layout
- [ ] Mobile (<768px): card layout renders (if implemented); or graceful degradation
- [ ] Chrome (latest stable): all flows pass
- [ ] Firefox (latest stable): all flows pass
- [ ] Edge (latest stable): all flows pass
- [ ] Date picker input: DD/MM/YYYY display format matches spec §7
- [ ] Cost display: DECIMAL(12,2) with comma separator (e.g. 500,000.00) matches spec §7
- [ ] Row colors match spec exactly: selected=#E8F5E9, cancelled=#F5F5F5, done=#F1F8F4

---

## 10. Performance / Degradation

*System behavior under load or large data sets?*

- [ ] Search with pageSize=100 and 10,000+ records returns within acceptable time (no timeout)
- [ ] Autocomplete with 500+ matching results renders without UI freeze
- [ ] Bulk delete of 100 IDs completes successfully
- [ ] Grid with 100 rows (pageSize=100) renders without performance degradation
- [ ] No memory leak: open/close Add popup 20 times in session → no slowdown

> These require load data or performance tooling. Document thresholds when established.

---

## 11. Data Integrity / View Popup

*Read-only view correctness?*

- [ ] View popup opens via `GET /api/repairRequests/{id}` (same as Edit fetch) (spec §5.7)
- [ ] View popup: all fields rendered as read-only; no Submit button
- [ ] View popup: available for all statuses including done and cancelled
- [ ] View popup: date displayed in DD/MM/YYYY format matching spec §7
- [ ] View popup for record with `description = NULL` → field shows empty/blank, not "null"
- [ ] View popup for `cost = NULL` → field shows blank, not "0" or "null"

---

## 12. Amendment Coverage Check

*Spec amendments from v1.5 and v1.6 are fully tested?*

| Amendment | AC | Correct test case | BB |
|-----------|-----|------------------|----|
| Cost optional when done | AC-34 (v1.5) | BB-068, BB-069: blank/omitted Cost accepted | ✅ |
| Performed by optional when done | AC-35 (v1.5) | BB-070, BB-071, BB-072 | ✅ |
| Edit error → toast (not inline) | AC-24 / AC-40 (v1.6) | BB-050, BB-089 — verify toast, NOT inline | ✅ |
| Pre-v1.5 cases removed | BB-034(old)/BB-035(old) | Old "Cost required" / "Performed by required" cases deleted | ✅ |

- [ ] Confirm no test case still asserts "Cost is required" for UpdateStatus done
- [ ] Confirm no test case still asserts "Performed by is required" for UpdateStatus done
- [ ] Confirm Edit error test asserts **toast** (not inline)

---

## Summary Status

Fill after test execution:

| Section | Status | Notes |
|---------|--------|-------|
| 1. Boundary Values | — | |
| 2. Auth / Security | — | |
| 3. Status FSM | — | |
| 4. DB Transaction | — | |
| 5. Error Handling | — | |
| 6. i18n | — | |
| 7. Autocomplete | — | |
| 8. Concurrent | — | |
| 9. Compatibility | — | |
| 10. Performance | — | |
| 11. Data Integrity | — | |
| 12. Amendment Coverage | — | |
