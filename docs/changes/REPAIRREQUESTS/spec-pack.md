# Spec Pack — REPAIRREQUESTS Module

> Version: 1.2 | Date: 2026-03-28 | Status: Ready for Implementation
> Sources: `sources.md` (S-1, S-2, S-3, S-4, S-5, S-6, S-7)

---

## 1. Background / Purpose

Hệ thống Quản Lý Tài Sản (QLTS) cần module **Repair Requests** để nhân viên có thể:
- Tạo yêu cầu sửa chữa tài sản bị hỏng hóc
- Theo dõi trạng thái xử lý (open → in_progress → done / cancelled)
- Khi hoàn thành sửa chữa (status=done), tự động ghi nhận chi tiết vào bảng `asset_maintenances`

---

## 2. Scope

### In Scope
- Trang danh sách Repair Requests với search/filter, pagination, bulk select
- CRUD: Add, View (read-only popup), Edit, Bulk Delete
- Update Status popup với conditional fields khi status=done
- Auto-create `asset_maintenances` record khi status chuyển sang `done`
- Auto-update `assets.status = 'IN_REPAIR'` khi status chuyển sang `in_progress` (BE side-effect, same transaction)
- Autocomplete cho Asset Code, Employee (Requested by), và Employee (Performed by)
- Server-side column sorting (default: `request_date DESC`)

### Out of Scope
- Module Maintenance Requests (bảng riêng)
- Push notification / email khi trạng thái thay đổi
- Export danh sách ra Excel/PDF
- Lịch sử thay đổi trạng thái (audit log)

---

## 3. Terminology

| Term | Definition |
|------|-----------|
| Repair Request | Yêu cầu sửa chữa tài sản, lưu trong bảng `repair_requests` |
| Asset | Tài sản, lưu trong bảng `assets`, tham chiếu qua `asset_id` |
| Requested by | Nhân viên tạo yêu cầu, FK tới `employees.id` |
| Performed by | Người thực hiện sửa chữa — **Employee autocomplete** (displays `[employee_code] - [name]`; stores employee identifier in `performed_by VARCHAR(100)`) |
| Status | ENUM: `open` / `in_progress` / `done` / `cancelled` |
| Update Status | Hành động thay đổi trạng thái của một repair request qua popup riêng |
| Asset Maintenance | Bản ghi chi tiết sửa chữa/bảo trì trong bảng `asset_maintenances` |
| Autocomplete | Input field có gợi ý dropdown; chỉ chấp nhận giá trị có ID từ server |
| Bulk Delete | Xóa nhiều items cùng lúc qua danh sách IDs |

---

## 4. As-Is / To-Be

### As-Is
- Module REPAIRREQUESTS chưa tồn tại trong codebase
- Bảng `repair_requests` và `asset_maintenances` đã có trong DB schema

### To-Be

```
[Trang REPAIR REQUESTS]
  ├── Search bar (Asset Code autocomplete, Employee autocomplete, Status dropdown)
  ├── [Search] [Clear] buttons
  ├── [Add] [Delete] buttons
  ├── Data table (sortable server-side, paginated, bulk select)
  │     └── Per-row actions: [Edit] [View] [Update Status]
  │           ├── Status = done     → Edit DISABLED, View ENABLED, Update Status DISABLED
  │           └── Status = cancelled → Edit ENABLED,  View ENABLED, Update Status DISABLED
  └── Pagination (records per page: 10/20/50/100)

[Add Popup]
  └── Fields (display order): Asset Code*, Requested by*, Description (optional), Request date*

[Edit Popup]
  └── Fields (display order): Asset Code*, Requested by*, Description (optional), Request date* (id = read-only)

[View Popup]
  └── All fields read-only

[Update Status Popup]
  └── ID (read-only)
  └── Status dropdown (options depend on current status)
        ├── If done → Enable: Repair date*, Cost*, Performed by* (autocomplete), Description
        └── If not done → Disable + clear above fields
```

---

## 5. Detailed Specification

### 5.1 Screen Layout

**Header:** Dark green `#0B5C4A`, BRYCEN logo (left), navigation tabs center (ASSET MANAGEMENT | REPAIR REQUESTS), user avatar right.

**Search Section (3-column grid):**
| Column | Field | Type | Default |
|--------|-------|------|---------|
| 1 | Asset Code | Autocomplete text input | empty |
| 2 | Requested by | Autocomplete text input | empty |
| 3 | Status | Dropdown | "all" |

Status dropdown options: `all` / `open` / `in progress` / `cancelled` / `done`
(display labels; DB values: `open`, `in_progress`, `cancelled`, `done`)

**Table Columns:**

| # | Column | Width | Source |
|---|--------|-------|--------|
| 1 | Checkbox | 20px | UI select |
| 2 | ID | 40px | `repair_requests.id` |
| 3 | Asset Code | 120px | `assets.asset_code` |
| 4 | Asset Name | 120px | `assets.name` |
| 5 | Requested by | 120px | `employees.full_name` |
| 6 | Request date | 120px | `repair_requests.request_date` (DD/MM/YYYY) |
| 7 | Status | 100px | `repair_requests.status` (display label) |
| 8 | Action | 120px | Edit / View / Update Status icons |

**Row Colors:**
- Selected (checkbox checked): `#E8F5E9`
- Cancelled: `#F5F5F5`
- Done: `#F1F8F4`
- Default: white

**Action Icons (per row) — disabled rules:**

| Status | Edit (Pencil) | View (Eye) | Update Status (RotateCw) |
|--------|--------------|-----------|--------------------------|
| `open` | Enabled | Enabled | Enabled |
| `in_progress` | Enabled | Enabled | Enabled |
| `done` | **Disabled** | Enabled | **Disabled** |
| `cancelled` | Enabled | Enabled | **Disabled** |

---

### 5.2 Autocomplete Behavior

- Triggers on each keystroke (minimum 1 character)
- **Asset Code:** calls `GET /api/v1/assets/searchbyCodeOrName/{query}`, displays `[asset_code] - [name]`
- **Requested by:** calls `GET /api/v1/employees/searchbyCodeOrName/{query}`, displays `[employee_code] - [name]`
- **Performed by** (Update Status popup): calls `GET /api/v1/employees/searchbyCodeOrName/{query}`, displays `[employee_code] - [name]`; stores identifier string in `performed_by VARCHAR(100)` on save
- **Only values selected from dropdown are accepted** — free-text without a backing ID is rejected
- On selection: field displays the label; internally stores the `id` (or identifier string for Performed by) for API calls

---

### 5.3 Search Execution

- Triggered by: clicking "Search" button OR changing pagination page/page-size OR changing sort column/direction
- Sends: `POST /api/v1/repairRequests/search`

```json
{
  "assetId": "<integer|null>",
  "requestedBy": "<integer|null>",
  "status": "<open|in_progress|done|cancelled|null>",
  "page": "<integer, 1-based>",
  "pageSize": "<integer: 10|20|50|100>",
  "sortField": "<string, default: 'request_date'>",
  "sortDir": "<'asc'|'desc', default: 'desc'>"
}
```

- `status = null` (or omitted) means "all"
- Default sort: `sortField = 'request_date'`, `sortDir = 'desc'`
- If response returns 0 items: display message **"Repair request does not exist."**

---

### 5.4 Clear

- Resets all filter fields to default (empty / "all")
- Resets sort to default (`request_date DESC`)
- Auto-triggers Search to reload grid to initial state

---

### 5.5 Add

**Popup initialization:** ID field is **NOT displayed** in Add modal.

**Popup fields (display order per S-4):**

| Order | Field | Type | Required | Constraint |
|-------|-------|------|---------|-----------|
| 1 | Asset Code | Autocomplete → `asset_id` | Yes | Must be selected from dropdown |
| 2 | Requested by | Autocomplete → `requested_by` | Yes | Must be selected from dropdown |
| 3 | Description | Textarea | No | Free text |
| 4 | Request date | Date picker | Yes | ≤ today |

- Initial status set by system: `open`
- API: `POST /api/v1/repairRequests`

**Save feedback:**
- Success: show success message, close modal, refresh grid
- Error: keep modal open, display server error detail inline

**Close / X button:** Discard all entered values and close modal immediately.

---

### 5.6 Edit

**Popup initialization:** System calls `GET /api/v1/repairRequests/{id}` to load data.

- `id` displayed as read-only **text label** (not inside an input element) at the top of the form
- All other fields pre-filled: Asset Code, Requested by, Description, Request date
- Same field order and constraints as Add
- API: `PUT /api/v1/repairRequests/{id}`

**Save feedback:**
- Success: show success message ("Cập nhật thành công"), close modal, refresh grid
- Error: keep modal open, display server error detail inline

**Close / X button:** Discard all changes and close modal immediately.

---

### 5.7 View

- All fields read-only, no submit button
- API: `GET /api/v1/repairRequests/{id}`

---

### 5.8 Delete (Bulk)

**Case A — items selected (n ≥ 1):**
- Show confirm modal: **"Delete ({n} items). Are you sure?"** — OK / Cancel buttons
- OK → `DELETE /api/v1/repairRequests` with body `{ "ids": [id1, id2, ...] }`
- Cancel → close modal, no action

**Case B — no items selected:**
- Show message: **"Please select the items to delete."** — OK button only
- OK → close message, no action

---

### 5.9 Update Status

**Popup:** Triggered by RotateCw icon on a row.

**Fields (per S-5):**

| Field | Type | Enabled when | Required when |
|-------|------|-------------|--------------|
| ID | Text (read-only) | Always | — |
| Status | Dropdown | Always | Always |
| Repair date | Date picker | status = `done` | status = `done` |
| Description | Textarea | status = `done` | No |
| Cost | Text (number) | status = `done` | status = `done` |
| Performed by | Employee autocomplete | status = `done` | status = `done` |

**Status dropdown options (dynamic per current status):**

| Current Status | Available transitions in dropdown |
|---------------|----------------------------------|
| `open` | `in_progress`, `cancelled` |
| `in_progress` | `done` |
| `done` | — (Update Status icon disabled; popup never opens) |
| `cancelled` | — (Update Status icon disabled; popup never opens) |

**Status switching behavior:**
- On dropdown change → `done`: Enable and **clear** all 4 conditional fields
- On dropdown change → any other value: Disable and **clear** all 4 conditional fields

**Submit logic:**
- Calls `PATCH /api/v1/repairRequests/{id}/status`
- Body: `{ status, repairDate, cost, performedBy, description }`
- If status = `done`: server must **also** create a record in `asset_maintenances` in the **same DB transaction**:
- **Save feedback:** Show multilingual success message (VN/EN/JP), close modal, refresh grid

```
asset_maintenances INSERT:
  asset_id            = repair_requests.asset_id
  repair_request_id   = repair_requests.id
  type                = 'repair'
  maintenance_date    = repairDate (from request body)
  description         = description (from request body)
  cost                = cost (from request body)
  performed_by        = performedBy (from request body)
```

- If status = `in_progress`: server must **also** update `assets.status = 'IN_REPAIR'` in the **same DB transaction**

---

### 5.10 Pagination

- Records per page options: 10 / 20 / 50 / 100 (default: 10)
- Navigation: First `|<` / Prev `<` / Next `>` / Last `>|`
- Display: **"X–Y of Z"** (current range and total count)
- Changing page or page-size triggers Search

---

## 6. Validation Rules

| Rule ID | Field | Condition | Constraint | Error |
|---------|-------|-----------|-----------|-------|
| V-1 | Asset Code | Add/Edit | Required, must have backing ID | "Asset Code is required" |
| V-2 | Requested by | Add/Edit | Required, must have backing ID | "Requested by is required" |
| V-3 | Request date | Add/Edit | Required | "Request date is required" |
| V-4 | Request date | Add/Edit | ≤ today | "Cannot be a future date" |
| V-5 | Repair date | Update Status, done | Required | "Repair date is required" |
| V-6 | Repair date | Update Status, done | ≥ Request date | "Repair date must be after Request date" |
| V-7 | Cost | Update Status, done | Required | "Cost is required" |
| V-8 | Cost | Update Status, done | Positive number (> 0) | "Cost must be a positive number" |
| V-9 | Performed by | Update Status, done | Required; must be selected from autocomplete dropdown | "Performed by is required" |
| V-10 | Status | Update Status | Transition must follow allowed rules (see §5.9 table) | Invalid transition (prevented by dropdown options) |
| V-11 | Any autocomplete | Add/Edit/Search | Value must be selected from list; free-text without ID is rejected | Invalid selection |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| Responsiveness | Desktop (1200px+): full table; Tablet (768–1199px): scrollable table; Mobile (<768px): card layout |
| UI colors | Primary green: `#016242`; Header bg: `#0B5C4A`; Selected rows: `#E8F5E9`; Cancelled: `#F5F5F5`; Done: `#F1F8F4`; Light green rows: `#EBFFEE` |
| Font | Inter (Regular, Semi-Bold, Bold) — sizes: Page title 24–28px, Form label 14px, Form input 16px, Table cell 12px |
| Date format | Display: DD/MM/YYYY; API: ISO 8601 (YYYY-MM-DD) |
| Decimal format | Cost: DECIMAL(12,2) stored; display with comma separator |
| Icons | lucide-react: Pencil (Edit), Eye (View), RotateCw (Update Status) |
| Column sorting | Server-side sort; `sortField` and `sortDir` sent in Search API body; default: `request_date DESC` |
| Error handling | API failure (network error, 5xx): show error feedback. Add/Edit modal: keep modal open + show server error detail. Other actions: toast notification |
| Success feedback | Add/Edit save success: show success message + close modal + refresh grid. Update Status save: multilingual message (VN/EN/JP) + close modal + refresh grid |
| Auth | All API calls require authentication (Bearer JWT header via `isAuthenticated` middleware) |
| Stack | React 17, Redux, Redux-Form, Material-UI v4, JavaScript (no TypeScript) |
| DB transactions | `PATCH /status` transitions that write to multiple tables must use a single DB transaction |

---

## 8. Acceptance Criteria

### Search & Autocomplete

**AC-1:** When user types ≥1 character in the Asset Code input, system calls `GET /api/v1/assets/searchbyCodeOrName/{query}` and shows a dropdown with results in format `[asset_code] - [name]`.

**AC-2:** When user types ≥1 character in the Requested by input, system calls `GET /api/v1/employees/searchbyCodeOrName/{query}` and shows a dropdown with results in format `[employee_code] - [name]`.

**AC-3:** If a user types text in an autocomplete field and does not select from the dropdown, the value is rejected (field treated as empty / invalid) on form submit.

**AC-4:** Clicking Search sends `POST /api/v1/repairRequests/search` with `{ assetId, requestedBy, status, page, pageSize, sortField, sortDir }`.

**AC-5:** When the search API returns 0 items, the grid displays the message "Repair request does not exist."

**AC-6:** Clicking Clear resets all filter fields (Asset Code → empty, Requested by → empty, Status → "all") and immediately triggers a Search to reload the grid.

### Grid & Pagination

**AC-7:** The header checkbox selects all rows on the current page; clicking again deselects all.

**AC-8:** For rows with status `done`: Edit and Update Status icons are visually grayed out and non-clickable; View icon remains enabled. For rows with status `cancelled`: Update Status icon is grayed out and non-clickable; Edit and View icons remain enabled.

**AC-9:** Changing the records-per-page dropdown value triggers a new Search with `page=1` and updated `pageSize`.

**AC-10:** Pagination navigation buttons (First, Prev, Next, Last) trigger Search with the corresponding page number.

**AC-11:** The pagination display shows "X–Y of Z" where Z is the total count returned by the Search API.

### Add

**AC-12:** Submitting the Add form without Asset Code shows "Asset Code is required" and does not call the API.

**AC-13:** Submitting the Add form without Requested by shows "Requested by is required" and does not call the API.

**AC-14:** Submitting the Add form without Request date shows "Request date is required" and does not call the API.

**AC-15:** Submitting the Add form with Request date > today shows "Cannot be a future date" and does not call the API.

**AC-16:** The Add popup does NOT display an ID field. Add form field display order is: Asset Code, Requested by, Description, Request date.

**AC-17:** A valid Add submission calls `POST /api/v1/repairRequests`; on success the modal closes, a success message is shown, and the grid refreshes with the new record at status `open`.

**AC-18:** If the Add API call returns an error, the modal stays open and displays the server error message inline.

**AC-19:** Clicking Close or X on the Add popup discards all entered values and closes the modal immediately.

### Edit

**AC-20:** Clicking Edit calls `GET /api/v1/repairRequests/{id}` and opens the Edit popup with all fields pre-filled.

**AC-21:** The id value in the Edit popup is displayed as a read-only text label (not inside an input element).

**AC-22:** Edit form applies the same validation rules as Add (AC-12 to AC-15).

**AC-23:** A valid Edit submission calls `PUT /api/v1/repairRequests/{id}`; on success the modal closes, shows "Cập nhật thành công", and the grid refreshes.

**AC-24:** If the Edit API call returns an error, the modal stays open and displays the server error message inline.

**AC-25:** Clicking Close or X on the Edit popup discards all changes and closes the modal immediately.

### Delete

**AC-26:** Clicking Delete with no rows selected shows the message "Please select the items to delete." with a single OK button; clicking OK closes the message.

**AC-27:** Clicking Delete with n rows selected shows "Delete (n items). Are you sure?" with OK and Cancel buttons.

**AC-28:** Clicking Cancel on the delete confirm modal closes it without calling any API.

**AC-29:** Clicking OK on the delete confirm modal calls `DELETE /api/v1/repairRequests` with `{ "ids": [...] }` and refreshes the grid.

### Update Status

**AC-30:** Clicking the Update Status (RotateCw) icon opens the Update Status popup with the ID field (read-only) pre-filled.

**AC-31:** When the Status dropdown in the popup changes to `done`, the fields Repair date, Description, Cost, and Performed by become enabled and are cleared.

**AC-32:** When the Status dropdown changes from `done` to any other value, the fields Repair date, Description, Cost, and Performed by are disabled and their values are cleared.

**AC-33:** Submitting Update Status as `done` without Repair date shows "Repair date is required".

**AC-34:** Submitting Update Status as `done` without Cost shows "Cost is required".

**AC-35:** Submitting Update Status as `done` without Performed by shows "Performed by is required". Performed by must be selected from the employee autocomplete dropdown (`GET /api/v1/employees/searchbyCodeOrName/{query}`); free-text entry is not accepted.

**AC-36:** Submitting Update Status as `done` with Repair date < Request date of the record shows "Repair date must be after Request date".

**AC-37:** Submitting Update Status as `done` with Cost ≤ 0 shows "Cost must be a positive number."

**AC-38:** A successful Update Status `done` submission calls `PATCH /api/v1/repairRequests/{id}/status` AND the server creates a new record in `asset_maintenances` (type='repair') in the same DB transaction.

**AC-39:** A successful Update Status submission (any status) shows a multilingual success message (VN/EN/JP), closes the modal, and refreshes the grid row to reflect the new status and row color.

**AC-40:** If any API call fails (network error or 5xx response): for Add/Edit modals the modal stays open and displays the server error detail inline; for all other actions a toast error notification is shown.

**AC-41:** On initial page load and after Clear, the grid is sorted by `request_date DESC` (newest first).

**AC-42:** When Update Status changes status to `in_progress`, the BE updates `assets.status = 'IN_REPAIR'` in the same DB transaction as the `repair_requests.status` update.

---

## 9. Examples

### Normal Cases

**N-1: Search with status filter**
- User selects status = "in progress" and clicks Search
- System sends `POST /api/v1/repairRequests/search` with `{ status: "in_progress", page: 1, pageSize: 10, sortField: "request_date", sortDir: "desc" }`
- Grid shows rows where status = `in_progress`
- Pagination shows total count

**N-2: Create new repair request**
- User types "LAP" in Asset Code → selects "LAP2024BC10050 - Laptop" from dropdown
- User types "Bui" in Requested by → selects "EMP001 - Bui Minh Tien" from dropdown
- User sets Request date = 2026-03-28 (today)
- User clicks Submit → `POST /api/v1/repairRequests` called
- New row appears in grid with status "open"

**N-3: Complete a repair (status → done)**
- User clicks RotateCw on a row with status = `in_progress`
- Popup opens; ID field shows record ID (read-only); Status dropdown shows only "done" as option
- User changes Status to "done" → Repair date, Cost, Performed by, Description become enabled
- User fills: Repair date = 2026-03-28, Cost = 500000
- User types "Sang" in Performed by → selects "EMP005 - Sang Thanh Binh" from dropdown
- User submits → `PATCH .../status` called → status updated + `asset_maintenances` record created in same transaction

---

### Abnormal Cases

**A-1: Delete with no selection**
- User clicks Delete button without selecting any rows
- Modal shows: "Please select the items to delete." with OK only
- Grid unchanged

**A-2: Submit Update Status as done with Cost = 0**
- User sets status = "done", enters Cost = 0
- On submit: validation error "Cost must be a positive number."
- API is NOT called

**A-3: Free-text in autocomplete without selection**
- User types "Laptop" in Asset Code but does not select from dropdown
- If in Add/Edit: validation error on submit ("Asset Code is required")
- If in Search: `assetId` is treated as null; search runs without asset filter

**A-4: Bulk delete with confirm → Cancel**
- User selects 3 rows and clicks Delete
- Modal shows: "Delete (3 items). Are you sure?"
- User clicks Cancel → modal closes, 3 rows remain in grid, no API call

**A-5: API failure**
- Network error on Search request
- Grid shows error message / toast: "An error occurred. Please try again."
- Grid data is not cleared

---

### Boundary Values

**B-1: Request date = today (valid) vs tomorrow (invalid)**
- Request date = 2026-03-28 (today) → ✅ accepted
- Request date = 2026-03-29 (tomorrow) → ❌ "Cannot be a future date"

**B-2: Cost boundary**
- Cost = 0.01 → ✅ positive number, accepted
- Cost = 0 → ❌ "Cost must be a positive number"
- Cost = -1 → ❌ "Cost must be a positive number"

**B-3: Repair date vs Request date**
- Request date = 2026-03-20; Repair date = 2026-03-20 → ✅ equal is valid (≥)
- Request date = 2026-03-20; Repair date = 2026-03-19 → ❌ "Repair date must be after Request date"

**B-4: Pagination boundary**
- Total = 10, pageSize = 10 → page 1 only; Next/Last buttons disabled
- Total = 11, pageSize = 10 → page 2 exists; page 2 shows 1 record

**B-5: Select all on page with done/cancelled rows**
- Header checkbox selects ALL rows on page (including done/cancelled)
- Done/cancelled rows are selectable for bulk delete
- After delete: done/cancelled rows are removed from DB if included in selected IDs

---

## 10. Resolved Issues

All open issues have been resolved prior to v1.1. No pending items.

> ⚠️ **C-008 open** — Description required vs optional when status=done. See `sources.md` §C-008. Interim: Description is optional.

| ID | Resolution Summary |
|----|--------------------|
| OI-1 | `open → in_progress` ✓; `open → cancelled` ✓; `in_progress → done` ✓; `in_progress → cancelled` ✗ NOT allowed |
| OI-2 | `done`: Edit + UpdateStatus disabled, View enabled. `cancelled`: UpdateStatus disabled only, Edit + View enabled |
| OI-3 | Performed by = Employee autocomplete (same API as Requested by); stores string in VARCHAR(100) |
| OI-4 | `in_progress` transition → BE updates `assets.status = 'IN_REPAIR'` in same transaction |
| OI-5 | Description IS shown in Add form (optional field, 3rd position) |
| OI-6 | JavaScript — existing stack (React 17, Redux, Redux-Form, MUI v4). TypeScript note in spec_ui.md ignored |
| OI-7 | Authentication only (isAuthenticated middleware). No role-based permissions |
| OI-8 | Show error UI (toast or inline) on API failure (network error, 5xx) |
| OI-9 | Server-side sort; `sortField` + `sortDir` in Search body; default `request_date DESC` |

---

## 11. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `asset_maintenances` insert fails but status already updated | Medium | High | BE must use DB transaction for PATCH status=done |
| `assets.status` update fails for in_progress transition | Medium | High | BE must use DB transaction for PATCH status=in_progress |
| Autocomplete free-text bypass at API level | Medium | High | BE must validate that asset_id and requested_by exist in DB |
| Status transition bypass via direct API call (skipping FE dropdown restriction) | Medium | Medium | BE must validate allowed transitions in PATCH /status handler |
| `performed_by` VARCHAR(100) truncation | Low | Low | FE must enforce max 100 char |

---

## 12. Traceability Table

| AC | Description (short) | Screen | API | DB table | Log? | Permission | Test type |
|----|---------------------|--------|-----|----------|------|------------|-----------|
| AC-1 | Asset autocomplete triggers | Search section | `GET /assets/searchbyCodeOrName/{q}` | `assets` | No | Auth | IT, BB |
| AC-2 | Employee autocomplete triggers | Search section | `GET /employees/searchbyCodeOrName/{q}` | `employees` | No | Auth | IT, BB |
| AC-3 | Autocomplete rejects free-text | Search/Add/Edit | — (FE validation) | — | No | — | UT, BB |
| AC-4 | Search sends correct payload | Search section | `POST /repairRequests/search` | `repair_requests` | No | Auth | IT |
| AC-5 | Empty result message | Grid | `POST /repairRequests/search` | `repair_requests` | No | Auth | IT, BB |
| AC-6 | Clear resets + triggers search | Search section | `POST /repairRequests/search` | — | No | Auth | IT, BB |
| AC-7 | Header checkbox bulk select | Grid header | — (FE state) | — | No | — | UT |
| AC-8 | done: Edit+UpdateStatus disabled, View on; cancelled: UpdateStatus disabled, Edit+View on | Grid rows | — (FE state) | `repair_requests.status` | No | — | UT, BB |
| AC-9 | Page-size change triggers search | Pagination | `POST /repairRequests/search` | — | No | Auth | IT |
| AC-10 | Page navigation triggers search | Pagination | `POST /repairRequests/search` | — | No | Auth | IT |
| AC-11 | Pagination X–Y of Z display | Pagination | `POST /repairRequests/search` | — | No | — | IT, BB |
| AC-12 | Add: Asset Code required | Add popup | — (FE validation) | — | No | — | UT, BB |
| AC-13 | Add: Requested by required | Add popup | — (FE validation) | — | No | — | UT, BB |
| AC-14 | Add: Request date required | Add popup | — (FE validation) | — | No | — | UT, BB |
| AC-15 | Add: Request date ≤ today | Add popup | — (FE+BE validation) | — | No | — | UT, IT, BB |
| AC-16 | Add: no ID field; field order correct | Add popup | — (FE) | — | No | — | UT, BB |
| AC-17 | Add: success → message + close + refresh | Add popup | `POST /repairRequests` | `repair_requests` | No | Auth | IT, BB |
| AC-18 | Add: error → modal stays + server detail shown | Add popup | `POST /repairRequests` | — | No | Auth | IT, BB |
| AC-19 | Add: Close/X discards values immediately | Add popup | — (FE) | — | No | — | UT |
| AC-20 | Edit: loads data via GET, pre-fills all fields | Edit popup | `GET /repairRequests/{id}` | `repair_requests` | No | Auth | IT, BB |
| AC-21 | Edit: id shown as read-only text label (not input) | Edit popup | — (FE) | — | No | — | UT, BB |
| AC-22 | Edit: validates same as Add | Edit popup | — (FE+BE validation) | — | No | — | UT, IT, BB |
| AC-23 | Edit: success → "Cập nhật thành công" + close + refresh | Edit popup | `PUT /repairRequests/{id}` | `repair_requests` | No | Auth | IT, BB |
| AC-24 | Edit: error → modal stays + server detail shown | Edit popup | `PUT /repairRequests/{id}` | — | No | Auth | IT, BB |
| AC-25 | Edit: Close/X discards changes immediately | Edit popup | — (FE) | — | No | — | UT |
| AC-26 | Delete: no selection message | Grid | — (FE state) | — | No | — | UT, BB |
| AC-27 | Delete: confirm modal shows n | Grid | — (FE state) | — | No | — | UT |
| AC-28 | Delete: Cancel closes modal | Grid | — (FE) | — | No | — | UT |
| AC-29 | Delete: OK calls API + refresh | Grid | `DELETE /repairRequests` | `repair_requests` | No | Auth | IT |
| AC-30 | Update Status popup opens with ID | Grid row | `GET /repairRequests/{id}` | `repair_requests` | No | Auth | IT, BB |
| AC-31 | Status=done enables + clears conditional fields | Update Status popup | — (FE state) | — | No | — | UT |
| AC-32 | Status≠done disables + clears conditional fields | Update Status popup | — (FE state) | — | No | — | UT |
| AC-33 | done: Repair date required | Update Status popup | — (FE+BE validation) | — | No | — | UT, IT, BB |
| AC-34 | done: Cost required | Update Status popup | — (FE+BE validation) | — | No | — | UT, IT, BB |
| AC-35 | done: Performed by required + autocomplete | Update Status popup | `GET /employees/searchbyCodeOrName/{q}` | `employees` | No | Auth | UT, IT, BB |
| AC-36 | done: Repair date ≥ Request date | Update Status popup | — (FE+BE validation) | — | No | — | UT, IT, BB |
| AC-37 | done: Cost > 0 | Update Status popup | — (FE+BE validation) | — | No | — | UT, IT, BB |
| AC-38 | done: creates asset_maintenances in transaction | Update Status popup | `PATCH /repairRequests/{id}/status` | `repair_requests`, `asset_maintenances` | No | Auth | IT |
| AC-39 | Update Status: success → multilingual message + close + refresh | Update Status popup | `PATCH /repairRequests/{id}/status` | `repair_requests` | No | Auth | IT, BB |
| AC-40 | Error feedback: Add/Edit modal stays + inline; others toast | Any | Any | — | No | — | UT, IT, BB |
| AC-41 | Default sort = request_date DESC | Grid | `POST /repairRequests/search` | `repair_requests` | No | Auth | IT, BB |
| AC-42 | in_progress transition updates assets.status=IN_REPAIR | Update Status popup | `PATCH /repairRequests/{id}/status` | `repair_requests`, `assets` | No | Auth | IT |
