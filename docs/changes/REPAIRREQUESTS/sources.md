# Source of Truth — REPAIRREQUESTS

> Created: 2026-03-28 | Updated: 2026-03-29 (v4 — S-1, S-3 updated; PATCH body updated_by added)

---

## Specification Sources

| ID | File | Type | Authority Level |
|----|------|------|----------------|
| S-1 | `raw/spec_business.md` | Business + API specification | **Primary** — event/interaction/validation/API logic _(updated 2026-03-29: PATCH body now includes `updated_by`)_ |
| S-2 | `raw/spec_ui.md` | UI wireframe + layout (list screen) | **Primary** — screen layout, columns, colors, UX behavior |
| S-3 | `raw/qlts_database_schema.md` | DB schema + SQL DDL | **Authoritative** — column names, types, ENUM values, FK constraints _(updated 2026-03-29: no spec-impacting changes for REPAIRREQUESTS)_ |
| S-4 | `raw/spec_ui_modal_add_request.md` | UI wireframe — Add Repair Request modal | **Primary** — Add form fields, order, validation messages |
| S-5 | `raw/spec_ui_modal_UpdateStatus.md` | UI wireframe — Update Status modal | **Primary** — Update Status form fields, layout |
| S-6 | `raw/addrequest_business.md` | Business events — Add/Edit modal | **Primary** — Add/Edit modal initialization, save/error feedback, close behavior |
| S-7 | `raw/updateStatus_business.md` | Business events — Update Status modal | **Primary** — Update Status modal events, save feedback |

---

## Conflicts & Resolutions

### C-001: Status ENUM values — 3-way conflict ✅ RESOLVED

| Source | Values |
|--------|--------|
| `spec_business.md` §C.1 "Involved Tables" | `pending, fixing, done, cancel` |
| `spec_ui.md` (dropdown options) | `all, open, in progress, cancelled, done` |
| `qlts_database_schema.md` (SQL DDL) | `'open', 'in_progress', 'done', 'cancelled'` |

**Resolution:** DB schema (S-3) is authoritative for backend ENUM values: `open`, `in_progress`, `done`, `cancelled`.
Display labels in UI: "open" / "in progress" / "cancelled" / "done".
`spec_business.md` §C.1 values (`pending`, `fixing`, `cancel`) are outdated — **ignore**.

---

### C-002: "Refresh/Sync" icon vs "Update Status" action ✅ RESOLVED

| Source | Description |
|--------|-------------|
| `spec_ui.md` §4 Action column | Third icon = RotateCw (circular arrows), labeled "Refresh/Sync" |
| `spec_business.md` §A.3 | "Popup Update Status" — changes status + conditionally enables fields |

**Resolution:** The RotateCw icon IS the "Update Status" action. "Refresh/Sync" label in spec_ui.md is a naming error. S-1 is authoritative for behavior.

---

### C-003: "Performed by" field — free-text vs autocomplete ✅ RESOLVED

| Source | Description |
|--------|-------------|
| `qlts_database_schema.md` `asset_maintenances` | `performed_by VARCHAR(100)` — free text, no FK |
| Stakeholder decision (2026-03-28) | "Performed by" is autocomplete from employees |

**Resolution:** "Performed by" is an **Employee autocomplete** (same behavior as "Requested by": displays `[employee_code] - [name]`, stores employee ID internally). DB column `performed_by VARCHAR(100)` stores the employee's `full_name` or identifier string on save — not the FK.

---

### C-004: Actions disabled for "done" and "cancelled" rows ✅ RESOLVED

| Source | Description |
|--------|-------------|
| `spec_ui.md` §4 | "Disabled state for cancelled/done rows: Grayed out icons" |
| Stakeholder decision (2026-03-28) | Granular disable rules per status |

**Resolution:**
- Status = `done`: **Edit** and **Update Status** icons disabled; **View** remains enabled
- Status = `cancelled`: **Update Status** icon disabled; **Edit** and **View** remain enabled

---

### C-005: TypeScript vs JavaScript ✅ RESOLVED

| Source | Description |
|--------|-------------|
| `spec_ui.md` Technical Notes | "Implement proper TypeScript types for all data structures" |
| Stakeholder decision (2026-03-28) | Use React 17, Redux, Redux-Form, Material-UI v4 |

**Resolution:** Use **JavaScript** (same stack as existing codebase). TypeScript note in spec_ui.md is ignored. No toolchain change required.

---

### C-006: `ASSETS.status` side-effect when status=`in_progress` ✅ RESOLVED

| Source | Description |
|--------|-------------|
| `qlts_database_schema.md` §7 | `in_progress: cập nhật ASSETS.status = IN_REPAIR` |
| Stakeholder decision (2026-03-28) | Confirmed: yes, auto-update |

**Resolution:** When a repair request transitions to `in_progress`, BE must also update `assets.status = 'IN_REPAIR'` in the same transaction.

---

### C-007: Add popup — full field list ✅ RESOLVED

| Source | Description |
|--------|-------------|
| `spec_business.md` §B | Required fields: Asset Code, Requested by, Request date |
| `spec_ui_modal_add_request.md` (S-4) | Full field list confirmed with Description as optional |

**Resolution:** Add form fields (in display order): Asset Code\*, Requested by\*, Description (optional), Request date\*. Description IS shown in Add form. Initial status = `open` (system-set).

---

## Status Transition Rules (resolved from OI-1)

Allowed transitions in Update Status popup:

| Current Status | Allowed transitions |
|---------------|-------------------|
| `open` | → `in_progress`, → `cancelled` |
| `in_progress` | → `done` only |
| `done` | — (Update Status icon disabled) |
| `cancelled` | — (Update Status icon disabled) |

**`in_progress → cancelled` is NOT allowed.**

---

### C-008: Description required vs optional when status=done ✅ RESOLVED (2026-03-29)

| Source | Description |
|--------|-------------|
| `spec_business.md` §B.2 (S-1) | Required when done: `Repair date` only — Description NOT listed _(updated 2026-03-29)_ |
| `spec_ui_modal_UpdateStatus.md` (S-5) | Description field shown without `(*)` asterisk |
| `updateStatus_business.md` (S-7) | Required `(*)`: `Repair date` only — Description NOT listed _(updated 2026-03-29)_ |

**Resolution:** All three sources now agree — Description is **optional** when status=done. S-7 was corrected by the author to remove Description from the required list.

---

## All Open Issues — RESOLVED

| OI | Resolution |
|----|-----------|
| OI-1 | Status transitions defined above |
| OI-2 | done: Edit+UpdateStatus disabled; cancelled: UpdateStatus disabled only |
| OI-3 | Performed by = autocomplete from employees |
| OI-4 | status→in_progress triggers ASSETS.status = IN_REPAIR in same transaction |
| OI-5 | Description shown in Add form (optional) |
| OI-6 | React 17 / Redux / Redux-Form / MUI v4 (existing stack) |
| OI-7 | Authentication only — no role-based permission |
| OI-8 | Show error UI on API failure (toast or inline) |
| OI-9 | Server-side sort; default: `request_date DESC`; sortField/sortDir in Search API body |
