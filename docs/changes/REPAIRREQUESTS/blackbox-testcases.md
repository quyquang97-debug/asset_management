# Black-Box Test Cases — REPAIRREQUESTS

> Version: 2.0 | Date: 2026-03-29 | Spec: spec-pack.md **v1.6**
> Prior version: 1.0 (spec v1.4; thin coverage; pre-amendment BB-034/035)

**Priority legend:**
- **P0** — Must pass before any release. Core happy paths + critical validation gates.
- **P1** — Should pass. Boundary values, error flows, secondary scenarios.
- **P2** — Nice to have. Auth edge cases, operational/concurrent, compatibility.

**Format per case:**
`ID | Priority | Precondition | Steps | Expected Result | AC`

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 2.0 | 2026-03-29 | Full expansion to ~90 cases; P0/P1/P2 tiers; fixed BB-034/035 (AC-34/35 amended optional); fixed BB-025 (AC-24 amended → toast); added AC-42/43/44 coverage; added auth cases; added traceability table |
| 1.0 | 2026-03-29 | Initial template (~45 cases, spec v1.4, no priority tiers) |

---

## Chapter 1 — Autocomplete (AC-1, AC-2, AC-3)

**BB-001** | P0 — Asset Code autocomplete triggers on keystroke
- Pre: REPAIR REQUESTS page open; ≥1 asset exists in DB
- Steps: Type "LAP" in Asset Code search field
- Expected: `GET /api/assets/searchbyCodeOrName/LAP` called; dropdown appears with results in `[asset_code] - [name]` format (e.g. "LAP2024BC10050 - Laptop Dell XPS 13")
- AC: AC-1

**BB-002** | P0 — Requested by autocomplete triggers on keystroke
- Pre: REPAIR REQUESTS page open; ≥1 employee exists in DB
- Steps: Type "Bui" in Requested by search field
- Expected: `GET /api/employees/searchbyCodeOrName/Bui` called; dropdown appears with results in `[employee_code] - [name]` format (e.g. "EMP001 - Bui Minh Tien")
- AC: AC-2

**BB-003** | P0 — Add: autocomplete free-text rejected on submit (no selection made)
- Pre: Add popup open
- Steps: (1) Type "Laptop" in Asset Code field; (2) Do NOT select any dropdown item; (3) Fill all other required fields validly; (4) Click Submit
- Expected: "Asset Code is required" validation error; modal stays open; `POST /repairRequests` NOT called
- AC: AC-3

**BB-004** | P1 — Edit: autocomplete free-text rejected on submit (no selection made)
- Pre: Edit popup open with a valid record
- Steps: (1) Clear the Asset Code field; (2) Type "Laptop" but do not click any dropdown item; (3) Click Submit
- Expected: "Asset Code is required" validation error; modal stays open; API NOT called
- AC: AC-3

**BB-005** | P1 — Autocomplete no-match: empty dropdown or no dropdown shown
- Pre: REPAIR REQUESTS page open
- Steps: Type "ZZZZZ" in Asset Code field (no matching assets)
- Expected: No dropdown shown, or dropdown shown with empty/no-results state; no JS error
- AC: AC-1

**BB-006** | P1 — Search: free-text autocomplete without selection treated as null (not rejected)
- Pre: REPAIR REQUESTS page, Asset Code field
- Steps: (1) Type "Laptop" in Asset Code search field; (2) Do NOT select from dropdown; (3) Click Search
- Expected: Search runs; `assetId` = null in payload (no asset filter applied); grid shows all-status results
- AC: AC-3 (Search context: treated as empty, not rejected)

**BB-007** | P2 — Autocomplete: Unicode / diacritics query
- Pre: Assets in DB with Vietnamese names (e.g. "Điều hòa")
- Steps: Type "Điề" in Asset Code field
- Expected: Dropdown shows matching assets; no encoding error; display format correct
- AC: AC-1

---

## Chapter 2 — Search & Clear (AC-4, AC-5, AC-6)

**BB-008** | P0 — Search sends correct payload with asset + status filter
- Pre: REPAIR REQUESTS page open; asset "LAP2024BC10050 - Laptop" and status "in progress" available
- Steps: (1) Select Asset Code = "LAP2024BC10050 - Laptop" from autocomplete; (2) Select Status = "in progress"; (3) Click Search
- Expected: `POST /api/repairRequests/search` called with body:
  ```json
  { "assetId": 1, "status": "in_progress", "page": 1, "pageSize": 10, "sortField": "request_date", "sortDir": "desc" }
  ```
- AC: AC-4

**BB-009** | P1 — Search with Requested by filter
- Pre: Select employee "EMP001 - Bui Minh Tien" from Requested by autocomplete
- Steps: Select Requested by only; click Search
- Expected: Payload contains `"requestedBy": <id>` with correct employee id; other filters null/omitted
- AC: AC-4

**BB-010** | P1 — Search with all three filters combined
- Pre: Select Asset Code, Requested by, and Status = "open"
- Steps: Click Search
- Expected: Payload contains assetId, requestedBy, and `"status": "open"` all non-null
- AC: AC-4

**BB-011** | P1 — Search with no filters (default state)
- Pre: Page just loaded; no filters selected
- Steps: Click Search
- Expected: Payload contains `{ "page": 1, "pageSize": 10, "sortField": "request_date", "sortDir": "desc" }` with assetId/requestedBy/status null or omitted
- AC: AC-4

**BB-012** | P0 — Empty search result shows correct message
- Pre: No repair requests match the filter (e.g. status = "done" but no done records)
- Steps: Select a status with no records; click Search
- Expected: Grid body shows "Repair request does not exist." (localized); no table rows rendered
- AC: AC-5

**BB-013** | P0 — Clear resets all filters and reloads grid
- Pre: Asset Code selected, Requested by selected, Status = "done"
- Steps: Click Clear
- Expected: Asset Code → empty (backing ID discarded); Requested by → empty; Status → "all"; `POST /search` fires immediately with default payload; grid reloads sorted request_date DESC
- AC: AC-6

**BB-014** | P1 — Clear after manual sort: sort resets to default
- Pre: User clicked a column header to sort by ID ASC; then clicks Clear
- Expected: Grid reloads with `sortField = 'request_date'`, `sortDir = 'desc'`; not the manually chosen sort
- AC: AC-6, AC-41

**BB-015** | P2 — Search: 401 when no auth token
- Pre: No Authorization header sent (simulate via API tool)
- Steps: `POST /api/repairRequests/search` without token
- Expected: 401 response; grid not updated
- AC: AC-4

---

## Chapter 3 — Grid & Pagination (AC-7, AC-8, AC-9, AC-10, AC-11)

**BB-016** | P0 — Header checkbox: select all on current page
- Pre: Grid has ≥2 rows; none selected
- Steps: Click header checkbox
- Expected: All rows on current page show checked checkbox; row background = `#E8F5E9`
- AC: AC-7

**BB-017** | P0 — Header checkbox: deselect all
- Pre: All rows selected (header checked)
- Steps: Click header checkbox again
- Expected: All rows unchecked; row background returns to normal
- AC: AC-7

**BB-018** | P1 — Partial row selection (individual checkboxes)
- Pre: Grid has 5 rows; none selected
- Steps: Click checkbox on row 2 and row 4 only
- Expected: Exactly rows 2 and 4 are selected (highlighted); rows 1, 3, 5 unselected; header checkbox in indeterminate state
- AC: AC-7

**BB-019** | P1 — done rows: checkbox disabled (cannot be selected)
- Pre: Grid has a row with status=done
- Steps: Attempt to click the checkbox on the done row
- Expected: Checkbox is disabled/not clickable; row is NOT added to selectedIds; header checkbox skips done rows
- AC: AC-7 (B-5)

**BB-020** | P0 — done row: Edit + UpdateStatus disabled; View enabled
- Pre: Grid contains a row with status=done
- Steps: Observe action icons on that row; attempt to click Edit and UpdateStatus
- Expected: Edit icon (Pencil) grayed out + clicking does nothing; UpdateStatus icon (RotateCw) grayed out + clicking does nothing; View icon (Eye) active and opens popup
- AC: AC-8

**BB-021** | P0 — cancelled row: UpdateStatus disabled; Edit + View enabled
- Pre: Grid contains a row with status=cancelled
- Steps: Observe action icons; click Edit, then View
- Expected: UpdateStatus grayed + non-clickable; Edit icon opens Edit popup; View icon opens View popup
- AC: AC-8

**BB-022** | P1 — open row: all 3 action icons enabled
- Pre: Grid contains a row with status=open
- Steps: Observe action icons
- Expected: Pencil, Eye, RotateCw all visually active and clickable
- AC: AC-8

**BB-023** | P1 — in_progress row: all 3 action icons enabled
- Pre: Grid contains a row with status=in_progress
- Steps: Observe action icons
- Expected: Pencil, Eye, RotateCw all visually active and clickable
- AC: AC-8

**BB-024** | P0 — Page-size change triggers search with page=1
- Pre: Grid showing page 2, pageSize=10 (via a previous pagination click)
- Steps: Change pageSize dropdown to 50
- Expected: `POST /search` fires with `{ "page": 1, "pageSize": 50 }`; grid reloads from first page
- AC: AC-9

**BB-025** | P0 — Pagination Next fires search with page+1
- Pre: Total > pageSize; on page 1
- Steps: Click Next `>` button
- Expected: `POST /search` fires with `{ "page": 2 }`; grid shows page 2 results
- AC: AC-10

**BB-026** | P1 — Pagination boundary: total = pageSize → Next/Last disabled
- Pre: total = 10, pageSize = 10 (exactly 1 page)
- Steps: Observe pagination controls
- Expected: Next `>` and Last `>|` buttons are disabled; Prev `<` and First `|<` also disabled (on page 1)
- AC: AC-10 (B-4)

**BB-027** | P1 — Pagination boundary: total = pageSize + 1 → page 2 has 1 record
- Pre: total = 11, pageSize = 10; on page 1
- Steps: Click Next `>`
- Expected: Page 2 loads showing 1 record; pagination shows "11–11 of 11"
- AC: AC-10, AC-11 (B-4)

**BB-028** | P0 — Pagination display X–Y of Z
- Pre: total = 25, pageSize = 10; navigate to page 2
- Expected: Pagination shows "11–20 of 25"
- AC: AC-11

---

## Chapter 4 — Add (AC-12 to AC-19, AC-44)

**BB-029** | P0 — Add: Asset Code required
- Pre: Add popup open
- Steps: Leave Asset Code empty; fill Requested by, Request date = today; click Submit
- Expected: "Asset Code is required" inline error; modal stays open; `POST /repairRequests` NOT called
- AC: AC-12

**BB-030** | P0 — Add: Requested by required
- Pre: Add popup open
- Steps: Leave Requested by empty; fill Asset Code (selected from dropdown), Request date = today; click Submit
- Expected: "Requested by is required" inline error; modal stays open; API NOT called
- AC: AC-13

**BB-031** | P1 — Add: both Asset Code and Requested by empty → both errors shown
- Pre: Add popup open
- Steps: Leave Asset Code and Requested by both empty; set Request date = today; click Submit
- Expected: Both "Asset Code is required" AND "Requested by is required" shown simultaneously; API NOT called
- AC: AC-12, AC-13

**BB-032** | P0 — Add: Request date required
- Pre: Add popup open
- Steps: Fill Asset Code and Requested by; leave Request date empty; click Submit
- Expected: "Request date is required" inline error; modal stays open; API NOT called
- AC: AC-14

**BB-033** | P0 — Add: Request date = tomorrow → rejected
- Pre: Add popup open; today = 2026-03-29
- Steps: Set Request date = 2026-03-30; fill all other required fields; click Submit
- Expected: "Cannot be a future date" inline error; modal stays open; API NOT called
- AC: AC-15

**BB-034** | P0 — Add: Request date = today → accepted (boundary)
- Pre: Add popup open; today = 2026-03-29
- Steps: Set Request date = 2026-03-29; fill Asset Code (selected), Requested by (selected); click Submit
- Expected: Validation passes; `POST /repairRequests` called; success; new row appears with status=open
- AC: AC-15 (B-1)

**BB-035** | P1 — Add: Request date = yesterday → accepted
- Pre: Add popup open; today = 2026-03-29
- Steps: Set Request date = 2026-03-28; fill all required fields; click Submit
- Expected: Validation passes; API called successfully
- AC: AC-15

**BB-036** | P1 — Add: no ID field visible; correct field order
- Pre: Click Add button
- Expected: (1) No ID field rendered in popup; (2) Field order top-to-bottom: Asset Code, Requested by, Description, Request date
- AC: AC-16

**BB-037** | P0 — Add: success flow
- Pre: Add popup open; valid data: Asset Code = selected, Requested by = selected, Request date = today
- Steps: Fill all required fields; click Submit
- Expected: `POST /repairRequests` called; multilingual "Thông báo" dialog with OK shown; clicking OK closes dialog; modal closes; grid refreshes; new row at top (status=open)
- AC: AC-17

**BB-038** | P1 — Add: API error → modal stays open, error shown inline
- Pre: Simulate server 500 or validation error from API (e.g. duplicate, DB error)
- Steps: Submit valid form; server returns error
- Expected: Modal stays open; server error message shown inline inside the popup (not as a toast); no unhandled JS exception
- AC: AC-18

**BB-039** | P1 — Add: Close / X button discards data
- Pre: Add popup open; user has partially filled Asset Code and Description
- Steps: Click X / Close button
- Expected: Modal closes immediately; no API call; entered data not retained; re-opening Add shows blank form
- AC: AC-19

**BB-040** | P0 — Add: Request date defaults to today on popup open
- Pre: Today = 2026-03-29
- Steps: Click Add button; observe Request date field immediately
- Expected: Request date field pre-filled with 2026-03-29 (today's date) without user action
- AC: AC-44

**BB-041** | P1 — Add: default date can be changed to an earlier date
- Pre: Add popup just opened (Request date = today)
- Steps: Change Request date to 2026-03-20; fill other required fields; click Submit
- Expected: Validation passes; submitted `request_date = "2026-03-20"`
- AC: AC-44

**BB-042** | P2 — Add: open popup twice → default date both times
- Pre: Open Add popup; close without submitting; open Add popup again
- Steps: Observe Request date on second open
- Expected: Request date = today again (not a stale or empty value from prior session)
- AC: AC-44

**BB-043** | P2 — Add: 401 no token
- Pre: Submit a valid Add request with no Authorization header (via API tool)
- Expected: 401 response; new record NOT created in DB
- AC: AC-12..17 (auth layer)

---

## Chapter 5 — Edit (AC-20 to AC-25)

**BB-044** | P0 — Edit: popup opens with all fields pre-filled
- Pre: Grid has a row with status=open or in_progress
- Steps: Click Edit (Pencil) icon on that row
- Expected: `GET /api/repairRequests/{id}` called; Edit popup opens only after fetch resolves; Asset Code, Requested by, Description, Request date all pre-filled with correct values
- AC: AC-20

**BB-045** | P1 — Edit: id displayed as plain text label, not inside an input
- Pre: Edit popup open on any record
- Steps: Inspect the ID field in the popup
- Expected: ID value shown as read-only text label (not inside `<input>` or MUI `<TextField>`); cannot be edited by user
- AC: AC-21

**BB-046** | P1 — Edit: same validation rules as Add (future date)
- Pre: Edit popup open
- Steps: Change Request date to tomorrow (2026-03-30); click Submit
- Expected: "Cannot be a future date"; modal stays open; `PUT` NOT called
- AC: AC-22

**BB-047** | P1 — Edit: same validation rules as Add (empty Asset Code)
- Pre: Edit popup open
- Steps: Clear Asset Code field (no replacement selection); click Submit
- Expected: "Asset Code is required"; modal stays open; API NOT called
- AC: AC-22

**BB-048** | P1 — Edit: autocomplete binding stable after re-render
- Pre: Edit popup open with pre-filled Asset Code and Requested by
- Steps: (1) Select a different Asset Code from autocomplete; (2) Select a different Requested by; (3) Trigger re-render (open/close a dropdown, blur, switch language); (4) Submit
- Expected: UI keeps the newly selected values; payload `asset_id` and `requested_by` reflect the latest selection (no revert to original record values)
- AC: AC-22, AC-23

**BB-049** | P0 — Edit: success flow
- Pre: Edit popup open with valid pre-filled data
- Steps: Modify Description; click Submit
- Expected: `PUT /api/repairRequests/{id}` called; "Thông báo / Cập nhật thành công" dialog shown; clicking OK closes dialog; modal closes; grid row updates
- AC: AC-23

**BB-050** | P0 — Edit: API error → toast notification (amended AC-24 v1.6)
- Pre: Edit popup open; simulate server error on PUT
- Steps: Submit valid edit form; server returns 500
- Expected: Modal stays open; error shown as a **toast** notification (NOT inline in the form); grid unchanged
- AC: AC-24 (v1.6 amendment)

**BB-051** | P1 — Edit: Close / X button discards changes
- Pre: Edit popup open; user modified Description field
- Steps: Click X / Close button
- Expected: Modal closes; no API call; original grid data unchanged
- AC: AC-25

**BB-052** | P2 — Edit: 401 no token on PUT
- Pre: Submit a valid edit with no Authorization header (via API tool)
- Expected: 401 response; record NOT updated in DB
- AC: AC-23 (auth layer)

---

## Chapter 6 — Delete (AC-26 to AC-29)

**BB-053** | P0 — Delete with no rows selected: warning dialog
- Pre: No checkboxes checked in grid
- Steps: Click Delete button
- Expected: Modal shows "Please select the items to delete." with single OK button; no Cancel button
- AC: AC-26

**BB-054** | P1 — Delete no-selection: clicking OK closes dialog; grid unchanged
- Pre: Warning dialog open (from BB-053)
- Steps: Click OK
- Expected: Dialog closes; grid unchanged; no API call
- AC: AC-26

**BB-055** | P0 — Delete with n rows selected: confirm modal shows count
- Pre: 3 rows checked (any selectable status)
- Steps: Click Delete button
- Expected: Confirm modal shows "Delete (3 items). Are you sure?" with OK and Cancel buttons
- AC: AC-27

**BB-056** | P1 — Delete confirm: count = 1
- Pre: Exactly 1 row selected
- Steps: Click Delete
- Expected: Modal shows "Delete (1 items). Are you sure?" (or grammatically localized equivalent)
- AC: AC-27

**BB-057** | P0 — Delete: Cancel → no action
- Pre: Delete confirm modal open (3 rows selected)
- Steps: Click Cancel
- Expected: Modal closes; 3 rows remain in grid; `DELETE /repairRequests` NOT called
- AC: AC-28

**BB-058** | P0 — Delete: OK → API called, rows removed
- Pre: 2 rows selected (status=open and status=cancelled); confirm modal open
- Steps: Click OK
- Expected: `DELETE /api/repairRequests` called with `{ "ids": [id1, id2] }`; both rows removed from grid; grid total count decreases by 2
- AC: AC-29

**BB-059** | P1 — Delete: grid refreshes after successful delete
- Pre: Page 2 of 3 displayed; select 1 row on page 2; confirm OK
- Steps: Complete delete
- Expected: Grid refreshes; total count updated; pagination recalculates correctly
- AC: AC-29

**BB-060** | P1 — Delete: only open/cancelled rows selectable; done rows excluded
- Pre: Grid has done, open, cancelled rows all on same page; select all via header checkbox
- Steps: Click Delete confirm OK
- Expected: Only non-done rows' IDs sent to API; done rows remain in grid unchanged; `ids` array does not include done row IDs
- AC: AC-29 (B-5)

**BB-061** | P2 — Delete: 401 no token
- Pre: Send DELETE with no Authorization header (via API tool)
- Expected: 401 response; records NOT deleted
- AC: AC-29 (auth layer)

---

## Chapter 7 — Update Status (AC-30 to AC-39, AC-42)

**BB-062** | P0 — UpdateStatus: popup opens for open row; ID pre-filled; correct dropdown options
- Pre: Grid has row with status=open
- Steps: Click RotateCw icon
- Expected: Popup opens; ID field pre-filled as read-only; status dropdown shows exactly 2 options: "in_progress", "cancelled" (not "done", not "open")
- AC: AC-30

**BB-063** | P1 — UpdateStatus: in_progress row → dropdown shows only "done"
- Pre: Grid has row with status=in_progress
- Steps: Click RotateCw icon
- Expected: Popup opens; status dropdown shows only "done" as available option
- AC: AC-30

**BB-064** | P0 — UpdateStatus: select done → conditional fields enable and clear
- Pre: UpdateStatus popup open; status dropdown initially showing first option (in_progress or cancelled)
- Steps: Change status dropdown to "done"
- Expected: Repair date, Cost, Performed by, Description all become **enabled** AND their values are **cleared** (empty/blank)
- AC: AC-31

**BB-065** | P0 — UpdateStatus: change from done back to non-done → fields disable and clear
- Pre: UpdateStatus popup; status=done already selected; Repair date, Cost, Performed by filled
- Steps: Change status dropdown away from done (e.g. to in_progress, if available; or re-open popup on different record)
- Expected: All 4 conditional fields become **disabled** AND their values are **cleared**
- AC: AC-32

**BB-066** | P0 — UpdateStatus: conditional fields disabled on initial popup load (before selecting done)
- Pre: Open UpdateStatus popup on any open row (initial state = no status selected yet, or first option = in_progress)
- Steps: Observe Repair date, Cost, Performed by, Description immediately on popup open
- Expected: All 4 conditional fields are disabled; values empty
- AC: AC-32

**BB-067** | P0 — UpdateStatus done: Repair date required
- Pre: UpdateStatus popup; status=done selected
- Steps: Leave Repair date empty; fill Cost=50000 (optional); click Submit
- Expected: "Repair date is required"; modal stays open; `PATCH` NOT called
- AC: AC-33

**BB-068** | P0 — UpdateStatus done: Cost is optional — blank accepted
- Pre: UpdateStatus popup; status=done; Repair date = today; Cost = "" (blank); Performed by = blank
- Steps: Click Submit
- Expected: Validation passes; `PATCH /{id}/status` called; `asset_maintenances` record created with `cost = NULL`
- AC: AC-34 (v1.5 amendment — Cost optional)

**BB-069** | P1 — UpdateStatus done: Cost = null explicitly accepted
- Pre: API call with `{ "status": "done", "repairDate": "2026-03-29" }` (cost field absent)
- Steps: Submit via API tool
- Expected: 200 response; `asset_maintenances.cost` = NULL in DB
- AC: AC-34 (v1.5 amendment)

**BB-070** | P0 — UpdateStatus done: Performed by is optional — blank accepted
- Pre: UpdateStatus popup; status=done; Repair date filled; Performed by = "" (blank)
- Steps: Click Submit
- Expected: Validation passes; API called; `asset_maintenances.performed_by = NULL`
- AC: AC-35 (v1.5 amendment — Performed by optional)

**BB-071** | P1 — UpdateStatus done: Performed by = 100 chars → accepted (max valid)
- Pre: UpdateStatus popup; status=done; Repair date filled; Performed by = exactly 100 characters
- Steps: Click Submit
- Expected: Validation passes; API called successfully
- AC: AC-35, V-9

**BB-072** | P1 — UpdateStatus done: Performed by = 101 chars → rejected at BE
- Pre: API call with `performedBy` = 101 character string
- Steps: Send `PATCH /{id}/status` via API tool
- Expected: 400 validation error; repair_requests.status NOT updated; no asset_maintenances record created
- AC: AC-35, V-9

**BB-073** | P0 — UpdateStatus done: Repair date < Request date → rejected
- Pre: Record has request_date = 2026-03-20; UpdateStatus popup open; status=done
- Steps: Set Repair date = 2026-03-19; fill other optional fields; click Submit
- Expected: "Repair date must be after Request date"; modal stays open; API NOT called
- AC: AC-36

**BB-074** | P1 — UpdateStatus done: Repair date = Request date → accepted (boundary B-3)
- Pre: Record has request_date = 2026-03-20; UpdateStatus popup open; status=done
- Steps: Set Repair date = 2026-03-20; Cost = 0; click Submit
- Expected: Validation passes; `PATCH /{id}/status` called successfully; `asset_maintenances.maintenance_date = '2026-03-20'`
- AC: AC-36 (B-3: equal is valid, ≥)

**BB-075** | P0 — UpdateStatus done: Cost = -1 → rejected
- Pre: UpdateStatus popup; status=done; Repair date filled
- Steps: Set Cost = -1; click Submit
- Expected: "Cost cannot be negative"; modal stays open; API NOT called
- AC: AC-37

**BB-076** | P1 — UpdateStatus done: Cost = -0.01 → rejected (boundary)
- Pre: UpdateStatus popup; status=done; Repair date filled
- Steps: Set Cost = -0.01; click Submit
- Expected: "Cost cannot be negative"; API NOT called
- AC: AC-37 (B-2)

**BB-077** | P1 — UpdateStatus done: Cost = 0 → accepted (free repair boundary)
- Pre: UpdateStatus popup; status=done; Repair date filled
- Steps: Set Cost = 0; click Submit
- Expected: Validation passes; API called; `asset_maintenances.cost = 0`
- AC: AC-37 (B-2)

**BB-078** | P1 — UpdateStatus done: Cost = 0.01 → accepted
- Pre: UpdateStatus popup; status=done; Repair date filled
- Steps: Set Cost = 0.01; click Submit
- Expected: Validation passes; API called; `asset_maintenances.cost = 0.01`
- AC: AC-37 (B-2)

**BB-079** | P0 — UpdateStatus done: asset_maintenances created with correct data
- Pre: Record id=1 with asset_id=1, request_date=2026-03-20; submit done with Repair date=2026-03-29, Cost=500000, Performed by="Công ty ABC", Description="Sửa xong"
- Steps: Submit then query DB
- Expected: `SELECT * FROM asset_maintenances WHERE repair_request_id = 1` returns 1 row:
  `type='repair'`, `asset_id=1`, `maintenance_date='2026-03-29'`, `cost=500000.00`, `performed_by='Công ty ABC'`, `description='Sửa xong'`
- AC: AC-38

**BB-080** | P0 — UpdateStatus → in_progress: assets.status updated to IN_REPAIR
- Pre: Record id=1 with asset_id=1; asset 1 has `status='IN_USE'`; open UpdateStatus popup
- Steps: Select status = "in_progress"; click Submit
- Expected: `PATCH /{id}/status` called; `repair_requests.status = 'in_progress'`; `assets.status = 'IN_REPAIR'` in DB; both changes in same transaction
- AC: AC-42

**BB-081** | P1 — UpdateStatus → in_progress: DB transaction rollback on failure
- Pre: Simulate a DB error during `assets` UPDATE (e.g. DB constraint or network drop)
- Steps: Trigger PATCH in_progress; cause the assets.status UPDATE to fail mid-transaction
- Expected: `repair_requests.status` remains unchanged (NOT set to in_progress); `assets.status` remains unchanged; error returned to client
- AC: AC-42 (transaction integrity)

**BB-082** | P1 — UpdateStatus done: transaction rollback — if asset_maintenances INSERT fails, repair_requests NOT updated
- Pre: Simulate INSERT failure into asset_maintenances (DB error)
- Steps: Submit PATCH /status → done; asset_maintenances INSERT throws error
- Expected: `repair_requests.status` remains as before (NOT set to done); `asset_maintenances` row NOT created; 500/error returned; no partial state in DB
- AC: AC-38 (transaction rollback)

**BB-083** | P0 — UpdateStatus: success flow — dialog + grid update + row color
- Pre: UpdateStatus popup; submit any valid status change
- Steps: Click Submit; confirm success
- Expected: "Thông báo" dialog shows multilingual success message "Cập nhật trạng thái thành công."; clicking OK closes dialog; modal closes; grid row status column updates; row color updates (done → `#F1F8F4`; cancelled → `#F5F5F5`)
- AC: AC-39

**BB-084** | P2 — UpdateStatus: 401 no token on PATCH
- Pre: Send PATCH /{id}/status with no Authorization header
- Expected: 401 response; repair_requests NOT updated; asset_maintenances NOT created
- AC: AC-38 (auth layer)

**BB-085** | P2 — UpdateStatus: invalid transition (done → any) rejected at BE
- Pre: Record id=3 with status=done; send `PATCH /api/repairRequests/3/status` with `{ "status": "in_progress" }`
- Expected: 400 "Invalid status transition: done → in_progress"; DB unchanged
- AC: AC-30 (status FSM)

**BB-086** | P2 — UpdateStatus: invalid transition (in_progress → cancelled) rejected at BE
- Pre: Record id=2 with status=in_progress; send PATCH with `{ "status": "cancelled" }`
- Expected: 400 "Invalid status transition: in_progress → cancelled"; DB unchanged
- AC: AC-30 (OI-1: in_progress → cancelled NOT allowed)

---

## Chapter 8 — Error Handling (AC-40)

**BB-087** | P0 — Add API error: modal stays open; error shown inline (not toast)
- Pre: Add popup open with valid data; server will return 500
- Steps: Submit Add form; server returns error
- Expected: Modal stays open; error detail displayed inline inside the Add popup form; NO toast shown for this case
- AC: AC-40

**BB-088** | P0 — UpdateStatus/Delete error: toast shown; grid data intact
- Pre: Simulate network error or 500 during Delete confirm or UpdateStatus submit
- Steps: Confirm Delete or submit UpdateStatus; network/server fails
- Expected: Toast error notification shown; existing grid data NOT cleared or wiped; no unhandled JS exception
- AC: AC-40

**BB-089** | P1 — Edit API error: toast shown (amended AC-24 v1.6)
- Pre: Edit popup open with valid data; server returns 500 on PUT
- Steps: Submit Edit form; server returns error
- Expected: Modal stays open; error shown as **toast** notification (NOT inline in form); this is the v1.6 amendment for Edit
- AC: AC-40, AC-24

**BB-090** | P1 — Search error: toast shown; grid data preserved
- Pre: Network drops after Search is triggered
- Steps: Click Search; simulate network timeout or 503
- Expected: Toast error shown; previously loaded grid rows remain visible (not wiped); no unhandled exception
- AC: AC-40

**BB-091** | P2 — Malformed JSON response: no unhandled JS exception
- Pre: Server returns non-JSON body (e.g. HTML 502 gateway page) for any API call
- Steps: Trigger any action (Search, Add, etc.) when server returns HTML
- Expected: App catches the parse error; shows toast or inline error message; no white screen / unhandled exception
- AC: AC-40

---

## Chapter 9 — Default Sort (AC-41)

**BB-092** | P0 — Initial page load: grid sorted request_date DESC
- Pre: Multiple repair requests with different request_dates exist in DB (e.g. dates: 2026-03-28, 2026-03-20, 2026-03-10)
- Steps: Open REPAIR REQUESTS page with no pre-set filters
- Expected: Grid rows ordered newest request_date first; 2026-03-28 row at top
- AC: AC-41

**BB-093** | P1 — After Clear: sort resets to request_date DESC
- Pre: User clicked a column header to sort by ID ASC; data reordered
- Steps: Click Clear
- Expected: Grid reloads with request_date DESC order; manually chosen sort column/direction discarded
- AC: AC-41, AC-6

---

## Chapter 10 — i18n / Language Switcher (AC-43)

**BB-094** | P0 — Switch to English: all visible text updates without reload
- Pre: App displayed in Vietnamese (default); REPAIR REQUESTS page open
- Steps: Open language switcher in header; select "🇬🇧 English"
- Expected: All visible labels, column headers, button text (Search, Clear, Add, Delete), status labels, validation error messages, empty-state text, dialog titles update to English immediately; no page reload required
- AC: AC-43

**BB-095** | P0 — Switch to Japanese: all visible text updates
- Pre: App in any language; REPAIR REQUESTS page open
- Steps: Select "🇯🇵 日本語" from language switcher
- Expected: All visible text in REPAIR REQUESTS module renders in Japanese
- AC: AC-43

**BB-096** | P1 — Validation errors respect current language
- Pre: Language = English; Add popup open
- Steps: Submit empty Add form; observe validation error text
- Expected: Validation error text in English (e.g. "Asset Code is required" not "Mã tài sản là bắt buộc")
- AC: AC-43

**BB-097** | P1 — Validation errors in Japanese
- Pre: Language = Japanese; Add popup open
- Steps: Submit empty Add form
- Expected: Validation error text in Japanese
- AC: AC-43

**BB-098** | P2 — Language switch while modal open: labels update in real-time
- Pre: Add popup open; language = Vietnamese
- Steps: Without closing popup, switch language to English
- Expected: All field labels, button text, and placeholder text inside the Add popup update to English immediately
- AC: AC-43

---

## Traceability Table — AC ↔ Black-Box Cases

| AC | Description (brief) | BB Cases |
|----|---------------------|---------|
| AC-1 | Asset Code autocomplete triggers | BB-001, BB-005, BB-007 |
| AC-2 | Requested by autocomplete triggers | BB-002 |
| AC-3 | Free-text autocomplete rejected | BB-003, BB-004, BB-006 |
| AC-4 | Search sends correct payload | BB-008, BB-009, BB-010, BB-011, BB-015 |
| AC-5 | Empty result message | BB-012 |
| AC-6 | Clear resets + reloads | BB-013, BB-014, BB-093 |
| AC-7 | Header checkbox select/deselect all | BB-016, BB-017, BB-018, BB-019 |
| AC-8 | Action icon disabled rules by status | BB-020, BB-021, BB-022, BB-023 |
| AC-9 | Page-size change → page=1 | BB-024 |
| AC-10 | Pagination navigation | BB-025, BB-026, BB-027 |
| AC-11 | Pagination X–Y of Z display | BB-028, BB-027 |
| AC-12 | Add: Asset Code required | BB-029, BB-031 |
| AC-13 | Add: Requested by required | BB-030, BB-031 |
| AC-14 | Add: Request date required | BB-032 |
| AC-15 | Add: Request date ≤ today | BB-033, BB-034, BB-035 |
| AC-16 | Add: no ID field; field order | BB-036 |
| AC-17 | Add: success flow | BB-037, BB-043 |
| AC-18 | Add: API error → inline | BB-038, BB-087 |
| AC-19 | Add: Close discards data | BB-039 |
| AC-20 | Edit: fetch + pre-fill | BB-044 |
| AC-21 | Edit: id as label not input | BB-045 |
| AC-22 | Edit: same validation as Add | BB-046, BB-047, BB-048 |
| AC-23 | Edit: success flow | BB-049, BB-052 |
| AC-24 | Edit: error → toast (v1.6 amended) | BB-050, BB-089 |
| AC-25 | Edit: Close discards | BB-051 |
| AC-26 | Delete no selection: warning | BB-053, BB-054 |
| AC-27 | Delete confirm shows count | BB-055, BB-056 |
| AC-28 | Delete Cancel: no action | BB-057 |
| AC-29 | Delete OK: API called, rows removed | BB-058, BB-059, BB-060, BB-061 |
| AC-30 | UpdateStatus popup opens; correct options | BB-062, BB-063, BB-085, BB-086 |
| AC-31 | done → conditional fields enable+clear | BB-064 |
| AC-32 | non-done → conditional fields disable+clear | BB-065, BB-066 |
| AC-33 | done: Repair date required | BB-067 |
| AC-34 | done: Cost optional (v1.5 amended) | BB-068, BB-069 |
| AC-35 | done: Performed by optional (v1.5 amended) | BB-070, BB-071, BB-072 |
| AC-36 | done: Repair date ≥ Request date | BB-073, BB-074 |
| AC-37 | done: Cost ≥ 0 | BB-075, BB-076, BB-077, BB-078 |
| AC-38 | done: asset_maintenances created in transaction | BB-079, BB-082, BB-084 |
| AC-39 | UpdateStatus success: dialog + grid update | BB-083 |
| AC-40 | Error handling: inline vs toast rules | BB-087, BB-088, BB-089, BB-090, BB-091 |
| AC-41 | Default sort: request_date DESC | BB-092, BB-093 |
| AC-42 | in_progress: assets.status=IN_REPAIR | BB-080, BB-081 |
| AC-43 | i18n: language switcher | BB-094, BB-095, BB-096, BB-097, BB-098 |
| AC-44 | Add: Request date defaults to today | BB-040, BB-041, BB-042 |

**Total: 98 cases** (P0: 32 | P1: 43 | P2: 13 | Boundary B-values: covered inline)
