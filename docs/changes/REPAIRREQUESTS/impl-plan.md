# Implementation Plan — REPAIRREQUESTS

> Version: 3.0 | Date: 2026-03-29 | Spec: spec-pack.md v1.4 | Status: Ready for Implementation

---

## Table of Contents

1. [Decision Log (Pre-implementation)](#1-decision-log-pre-implementation)
2. [Implementation Policy](#2-implementation-policy)
3. [Impact Analysis](#3-impact-analysis)
4. [Files to Create / Modify](#4-files-to-create--modify)
5. [Implementation Steps](#5-implementation-steps)
6. [Risks](#6-risks)
7. [Rollback Procedure](#7-rollback-procedure)
8. [Verification Procedure](#8-verification-procedure)
9. [AC Mapping Table](#9-ac-mapping-table)

---

## 1. Decision Log (Pre-implementation)

All blocking questions resolved before writing any code.

| ID | Question | Decision |
|----|----------|----------|
| CP-0A | API prefix: `/api` or `/api/v1`? | **`/api`** — consistent with `server/app.js` (`app.use('/api', routes)`). Spec's `/api/v1/` references adjusted accordingly. |
| CP-0B | Auth header mismatch: `httpBaseUtil.js` sends `X-XSRF-TOKEN`; `authenticate.js` reads `Authorization: Bearer`. Fix? | **Yes — fix `httpBaseUtil.js`** to send `Authorization: Bearer <token>`. This is a pre-existing bug; REPAIRREQUESTS is the first module to use `isAuthenticated` end-to-end in this repo. |
| CP-0C | Assets/employees DB schema unknown? | **Resolved** — full schema in `docs/changes/REPAIRREQUESTS/raw/qlts_database_schema.md`. All tables confirmed. |
| CP-0D | `searchbyCodeOrName` endpoints exist? | **No** — must be created in this ticket (asset.route.js, employee.route.js). |
| CP-0E | Icons: `lucide-react` or MUI? | **`@material-ui/icons`** — no new package install. Map: Pencil→`EditIcon`, Eye→`VisibilityIcon`, RotateCw→`AutorenewIcon`. |
| CP-0F | DatePicker library? | **`<input type="date">`** wrapped in redux-form `Field` adapter — no new package. |
| CP-0G | i18n library? | **Install `i18next` + `react-i18next`**. Create locale files for VN/EN/JP. |
| CP-0H | `crudAction.js` / `crudReducer.js` reuse? | **Dedicated files for repairRequests** — generic crud* uses `history.goBack()` on success (page-nav pattern) and doesn't support POST search, PATCH status, or DELETE-with-body; incompatible with modal UX. |
| CP-0I | Migrations scope? | **All 13 tables** from `qlts_database_schema.md` (user-requested). Ordered by FK dependency. |
| CP-0J | `httpUtil.patch()` missing? | **Add `patch()`** to `client/utils/httpUtil.js`. Also add `destroyWithBody()` for bulk DELETE with body. |

---

## 2. Implementation Policy

### 2.1 General Rules

- **Spec-only** — Implement exactly what `spec-pack.md` specifies. Any behaviour not described in spec → Open Issue, not implemented.
- **No speculative abstractions** — Three similar lines > premature shared component. Exception: `AutocompleteField` is explicitly shared between Asset Code and Requested By fields (same spec, same behaviour).
- **1 step = 1 reviewable unit** — Each step produces one file or one method; no batch writes.
- **Validate transitions server-side** — FE dropdown restriction alone is insufficient (API-bypass risk). Controller must re-validate allowed transitions.
- **DB transactions are mandatory** for `PATCH /:id/status` (spec §5.9, AC-38, AC-42). Any write failure rolls back all writes.
- **`updated_by`** for status changes comes from `req.currentUser.id` (set by `isAuthenticated`), not from `req.body`.

### 2.2 AC-Derived Policy Decisions

| Policy | Derived from AC |
|--------|----------------|
| AutocompleteField rejects free-text on form submit (not on blur) | AC-3, V-11 |
| In Search bar, free-text without selection → `assetId/requestedBy = null` (search runs, no error) | A-3 (spec §9 Abnormal) |
| Edit popup shows `id` as `<Typography>` label, not `<input>` | AC-21 |
| Add popup does NOT render ID field at all | AC-16 |
| Status dropdown in UpdateStatus shows only allowed transitions per current status | AC-31, §5.9 table |
| On status change in UpdateStatus popup: done → enable+clear 4 fields; else → disable+clear | AC-31, AC-32 |
| Description is OPTIONAL in UpdateStatus when status=done | C-008 resolution, spec §10 |
| Cost=0 is valid (free repair) | V-8, N-4 |
| Repair date ≥ Request date (not strictly after) | V-6, B-3 |
| `performed_by` is free-text input, NOT autocomplete | OI-3, spec §3 |
| Delete with 0 selected → info message (not error), single OK button | AC-26 |
| Add/Edit modal errors: keep modal open + show inline | AC-18, AC-24, AC-40 |
| Other action errors: toast notification | AC-40 |
| Default sort: `request_date DESC` on load and after Clear | AC-41 |
| Row colors: selected=#E8F5E9, cancelled=#F5F5F5, done=#F1F8F4, default=white | spec §5.1 |

---

## 3. Impact Analysis

### 3.1 Existing Code Read (Evidence)

| File Read | Finding | Impact |
|-----------|---------|--------|
| `server/app.js` | Routes mounted at `/api` (no `/v1` prefix) | All 7 BE endpoints use `/api/repairRequests/...` |
| `server/routes/index.route.js` | `router.use('/auth', ...)` + `router.use('/users', ...)` pattern | Add 3 new `router.use()` lines |
| `server/routes/user.route.js` | `router.route('/').method(isAuthenticated, validate(schema.X), handler)` pattern; Swagger JSDoc inline | Confirmed pattern for new routes |
| `server/controllers/user.controller.js` | Bookshelf ORM (forge/fetch/save/destroy), Promise chains; error shape: `{ error: err }` | Search controller + updateStatus must use raw Knex (Bookshelf can't JOIN or transaction cleanly) |
| `server/models/user.model.js` | `class X extends bookshelf.Model { tableName, hasTimestamps }` | Confirmed model pattern |
| `server/config/knex.js` | `export default knex(database)` — raw knex instance | Import this in repairRequest.controller.js for JOIN queries and `knex.transaction()` |
| `server/config/bookshelf.js` | `export default bookshelf(knex)` | Import in models only |
| `server/utils/validator.js` | `export default { storeUser: Joi.object({...}), ... }` — single default export | Append new schemas to the same exported object |
| `server/middlewares/authenticate.js` | Reads `req.headers['authorization'].split(' ')[1]` | Client must send `Authorization: Bearer <token>` header |
| `client/utils/httpBaseUtil.js` | **BUG**: sends `X-XSRF-TOKEN` header (not `Authorization: Bearer`) | **Must fix** before any authenticated API calls work |
| `client/utils/httpUtil.js` | Has `fetch`, `store`, `update`, `destroy` — no `patch` or `destroyWithBody` | **Add `patch()` and `destroyWithBody()`** |
| `client/constants/actionType.js` | Named exports (not default); `ENTITY_*` generic constants | Append `REPAIR_REQUEST_*` named exports |
| `client/constants/entity.js` | `USERS`, `PRODUCTS` | Not used for repairRequests (custom service, no generic entity path) |
| `client/actions/crudAction.js` | `history.goBack()` on success; only GET-based fetchAll; no POST search, PATCH, DELETE-with-body | **Cannot reuse** — dedicated `repairRequestAction.js` required |
| `client/reducers/crudReducer.js` | Hardcoded `products`, `selectedItem.product`; wrong state shape | **Cannot reuse** — dedicated `repairRequestReducer.js` required |
| `client/reducers/index.js` | `combineReducers({ router, form, auth })` | Add `repairRequest: repairRequestReducer` |
| `client/store/configureStore.js` | Uses `createRootReducer(history)` from `reducers/index.js` | No change needed — only `reducers/index.js` changes |
| `client/services/httpService.js` | Generic entity-path builder; no POST-search or PATCH support | Create dedicated `repairRequestService.js` |
| `client/routers/routes.js` | `<PrivateRoute exact path="/dashboard" layout={MainLayout} ...>` pattern | Add one `<PrivateRoute>` for `/repair-requests` |
| `client/components/common/drawer/MiniDrawer.js` | `@material-ui/icons` in use; `<ListItem button>` pattern | Add `<ListItem>` for Repair Requests; `BuildIcon` from MUI |
| `server/migrations/20170715222060_create_users_table.js` | CommonJS `exports.up/down`; Knex schema builder (`table.increments`, `table.string`, `table.timestamp`) | Confirmed migration pattern |
| `docs/changes/REPAIRREQUESTS/raw/qlts_database_schema.md` | Full SQL for all 13 tables with exact column types, ENUMs, FKs | All migration column definitions authoritative from this file |

### 3.2 Infrastructure Gaps Identified

| Gap | Severity | Resolution |
|-----|----------|-----------|
| `httpBaseUtil.js` sends wrong auth header | **Critical** — all `isAuthenticated` routes would return 403 | Fix in Phase B |
| `httpUtil.js` missing `patch()` | High — PATCH /status impossible | Add in Phase B |
| `httpUtil.js` missing `destroyWithBody()` | High — bulk DELETE impossible | Add in Phase B |
| No `asset.route.js` / `employee.route.js` | High — autocomplete endpoints missing | Create in Phase G |
| No migrations for 13 tables | High — DB has no schema | Create in Phase C (all 13) |
| No i18n setup | Medium — multilingual messages required by spec | Install + configure in Phase A |

---

## 4. Files to Create / Modify

### 4.1 Backend — New Files

| File | Action |
|------|--------|
| `server/migrations/YYYYMMDD_001_create_locations_table.js` | Create |
| `server/migrations/YYYYMMDD_002_create_asset_types_table.js` | Create |
| `server/migrations/YYYYMMDD_003_create_departments_table.js` | Create |
| `server/migrations/YYYYMMDD_004_create_assets_table.js` | Create |
| `server/migrations/YYYYMMDD_005_create_employees_table.js` | Create |
| `server/migrations/YYYYMMDD_006_create_asset_assignments_table.js` | Create |
| `server/migrations/YYYYMMDD_007_create_maintenance_plans_table.js` | Create |
| `server/migrations/YYYYMMDD_008_create_maintenance_requests_table.js` | Create |
| `server/migrations/YYYYMMDD_009_create_repair_requests_table.js` | Create |
| `server/migrations/YYYYMMDD_010_create_asset_maintenances_table.js` | Create |
| `server/migrations/YYYYMMDD_011_create_asset_disposals_table.js` | Create |
| `server/migrations/YYYYMMDD_012_create_asset_audits_table.js` | Create |
| `server/migrations/YYYYMMDD_013_create_audits_items_table.js` | Create |
| `server/models/repairRequest.model.js` | Create |
| `server/models/assetMaintenance.model.js` | Create |
| `server/models/asset.model.js` | Create |
| `server/models/employee.model.js` | Create |
| `server/controllers/repairRequest.controller.js` | Create |
| `server/controllers/asset.controller.js` | Create |
| `server/controllers/employee.controller.js` | Create |
| `server/routes/repairRequest.route.js` | Create |
| `server/routes/asset.route.js` | Create |
| `server/routes/employee.route.js` | Create |

### 4.2 Backend — Modified Files

| File | Change |
|------|--------|
| `server/routes/index.route.js` | Mount 3 new sub-routers |
| `server/utils/validator.js` | Append 6 new Joi schemas |

### 4.3 Frontend — New Files

| File | Action |
|------|--------|
| `client/i18n/index.js` | Create — i18next config |
| `client/i18n/locales/vi.json` | Create — Vietnamese strings |
| `client/i18n/locales/en.json` | Create — English strings |
| `client/i18n/locales/ja.json` | Create — Japanese strings |
| `client/services/repairRequestService.js` | Create |
| `client/actions/repairRequestAction.js` | Create |
| `client/reducers/repairRequestReducer.js` | Create |
| `client/components/repairRequests/AutocompleteField.js` | Create |
| `client/components/repairRequests/RepairRequestAddModal.js` | Create |
| `client/components/repairRequests/RepairRequestEditModal.js` | Create |
| `client/components/repairRequests/RepairRequestViewModal.js` | Create |
| `client/components/repairRequests/UpdateStatusModal.js` | Create |
| `client/components/repairRequests/RepairRequestList.js` | Create |
| `client/containers/repairRequests/RepairRequestContainer.js` | Create |

### 4.4 Frontend — Modified Files

| File | Change |
|------|--------|
| `client/utils/httpBaseUtil.js` | Fix auth header: `X-XSRF-TOKEN` → `Authorization: Bearer <token>` |
| `client/utils/httpUtil.js` | Add `patch()` and `destroyWithBody()` methods |
| `client/constants/actionType.js` | Append `REPAIR_REQUEST_*` constants |
| `client/reducers/index.js` | Register `repairRequestReducer` |
| `client/routers/routes.js` | Add `/repair-requests` PrivateRoute |
| `client/components/common/drawer/MiniDrawer.js` | Add Repair Requests nav entry |
| `package.json` + `package-lock.json` | Add `i18next`, `react-i18next` |

---

## 5. Implementation Steps

> **Rule:** Each checkbox = one commit-ready unit. Do not proceed to next step if current step has failing lint or build.

---

### Phase A — i18n Setup

- [ ] **A-1.** `npm install i18next react-i18next` — verify versions added to `package.json`

- [ ] **A-2.** Create `client/i18n/locales/vi.json`:
  ```json
  {
    "repairRequests": {
      "title": "Yêu cầu sửa chữa",
      "addSuccess": "Thêm mới thành công.",
      "updateSuccess": "Cập nhật thành công.",
      "updateStatusSuccess": "Cập nhật trạng thái thành công.",
      "deleteConfirm": "Xóa ({{count}} mục). Bạn có chắc không?",
      "deleteNoSelection": "Vui lòng chọn mục cần xóa.",
      "notFound": "Yêu cầu sửa chữa không tồn tại.",
      "errorGeneral": "Đã xảy ra lỗi. Vui lòng thử lại.",
      "validation": {
        "assetCodeRequired": "Mã tài sản là bắt buộc",
        "requestedByRequired": "Người yêu cầu là bắt buộc",
        "requestDateRequired": "Ngày yêu cầu là bắt buộc",
        "requestDateFuture": "Không thể là ngày trong tương lai",
        "repairDateRequired": "Ngày sửa chữa là bắt buộc",
        "repairDateBeforeRequest": "Ngày sửa chữa phải sau ngày yêu cầu",
        "costRequired": "Chi phí là bắt buộc",
        "costNegative": "Chi phí không được âm",
        "performedByRequired": "Đơn vị thực hiện là bắt buộc",
        "invalidSelection": "Giá trị không hợp lệ"
      },
      "status": {
        "open": "Mở",
        "in_progress": "Đang xử lý",
        "done": "Hoàn thành",
        "cancelled": "Đã hủy",
        "all": "Tất cả"
      }
    }
  }
  ```

- [ ] **A-3.** Create `client/i18n/locales/en.json`:
  ```json
  {
    "repairRequests": {
      "title": "Repair Requests",
      "addSuccess": "Created successfully.",
      "updateSuccess": "Updated successfully.",
      "updateStatusSuccess": "Status updated successfully.",
      "deleteConfirm": "Delete ({{count}} items). Are you sure?",
      "deleteNoSelection": "Please select the items to delete.",
      "notFound": "Repair request does not exist.",
      "errorGeneral": "An error occurred. Please try again.",
      "validation": {
        "assetCodeRequired": "Asset Code is required",
        "requestedByRequired": "Requested by is required",
        "requestDateRequired": "Request date is required",
        "requestDateFuture": "Cannot be a future date",
        "repairDateRequired": "Repair date is required",
        "repairDateBeforeRequest": "Repair date must be after Request date",
        "costRequired": "Cost is required",
        "costNegative": "Cost cannot be negative",
        "performedByRequired": "Performed by is required",
        "invalidSelection": "Invalid selection"
      },
      "status": {
        "open": "Open",
        "in_progress": "In Progress",
        "done": "Done",
        "cancelled": "Cancelled",
        "all": "All"
      }
    }
  }
  ```

- [ ] **A-4.** Create `client/i18n/locales/ja.json`:
  ```json
  {
    "repairRequests": {
      "title": "修理依頼",
      "addSuccess": "正常に作成されました。",
      "updateSuccess": "正常に更新されました。",
      "updateStatusSuccess": "ステータスが正常に更新されました。",
      "deleteConfirm": "削除 ({{count}} 件)。よろしいですか？",
      "deleteNoSelection": "削除する項目を選択してください。",
      "notFound": "修理依頼が存在しません。",
      "errorGeneral": "エラーが発生しました。もう一度お試しください。",
      "validation": {
        "assetCodeRequired": "資産コードは必須です",
        "requestedByRequired": "依頼者は必須です",
        "requestDateRequired": "依頼日は必須です",
        "requestDateFuture": "未来の日付は指定できません",
        "repairDateRequired": "修理日は必須です",
        "repairDateBeforeRequest": "修理日は依頼日以降でなければなりません",
        "costRequired": "費用は必須です",
        "costNegative": "費用はマイナスにできません",
        "performedByRequired": "実施者は必須です",
        "invalidSelection": "無効な選択です"
      },
      "status": {
        "open": "オープン",
        "in_progress": "処理中",
        "done": "完了",
        "cancelled": "キャンセル",
        "all": "すべて"
      }
    }
  }
  ```

- [ ] **A-5.** Create `client/i18n/index.js`:
  ```js
  import i18n from 'i18next';
  import { initReactI18next } from 'react-i18next';
  import vi from './locales/vi.json';
  import en from './locales/en.json';
  import ja from './locales/ja.json';

  i18n
    .use(initReactI18next)
    .init({
      resources: { vi: { translation: vi }, en: { translation: en }, ja: { translation: ja } },
      lng: 'vi',
      fallbackLng: 'en',
      interpolation: { escapeValue: false }
    });

  export default i18n;
  ```

- [ ] **A-6.** Import `'../i18n'` in `client/main.js` (side-effect import, before Provider render)

- [ ] **A-7.** `npm run lint` — 0 errors before continuing

---

### Phase B — Infrastructure Fixes

- [ ] **B-1.** Read `client/utils/httpBaseUtil.js` → confirm current header field name

- [ ] **B-2.** Edit `client/utils/httpBaseUtil.js`:
  - Remove: `'X-XSRF-TOKEN': getLocalStorage(JWT_TOKEN)`
  - Add: `'Authorization': 'Bearer ' + getLocalStorage(JWT_TOKEN)`

- [ ] **B-3.** Read `client/utils/httpUtil.js` → confirm existing exports

- [ ] **B-4.** Add to `client/utils/httpUtil.js`:
  ```js
  export const patch = (endpoint, data) => {
      return httpBase().patch(endpoint, data);
  };

  export const destroyWithBody = (endpoint, data) => {
      return httpBase().delete(endpoint, { data });
  };
  ```

- [ ] **B-5.** `npm run lint` — 0 errors

---

### Phase C — Database Migrations (FK-ordered)

> Pattern from `20170715222060_create_users_table.js`: CommonJS `exports.up/down`, Knex schema builder.
> Run `npm run migrate:make -- <name>` to generate timestamp; then fill in `exports.up`.
> YYYYMMDD prefix below = actual run date. All migrations in one `npm run migrate` at end of this phase.

- [ ] **C-1.** `npm run migrate:make -- create_locations_table`
  Fill `exports.up`: `id` (increments PK), `name VARCHAR(255) NOT NULL`, `building VARCHAR(255)`, `floor INT`, `room VARCHAR(100)`, `status ENUM('USE','NOT_USE') DEFAULT 'USE'`, `created_at DATETIME DEFAULT knex.fn.now()`, `created_by INT`, `updated_at DATETIME DEFAULT knex.fn.now()`, `updated_by INT`
  Fill `exports.down`: `dropTable('locations')`

- [ ] **C-2.** `npm run migrate:make -- create_asset_types_table`
  Columns: `id` (PK), `code VARCHAR(20) UNIQUE`, `name VARCHAR(100)`, timestamps + created_by/updated_by

- [ ] **C-3.** `npm run migrate:make -- create_departments_table`
  Columns: `id` (PK), `name VARCHAR(100)`, timestamps + created_by/updated_by

- [ ] **C-4.** `npm run migrate:make -- create_assets_table`
  Columns: `id` (PK), `asset_code VARCHAR(50) NOT NULL UNIQUE`, `name VARCHAR(255) NOT NULL`, `asset_type_id INT NOT NULL` (FK → asset_types.id), `serial_number VARCHAR(100)`, `description TEXT`, `purchase_date DATE NOT NULL`, `start_use_date DATE`, `status ENUM('NEW','IN_USE','IN_REPAIR','MAINTENANCE','LOST','DAMAGED','RETIRED','DISPOSED') NOT NULL`, `location_id INT NOT NULL` (FK → locations.id), `warranty_expiry DATE`, `supplier VARCHAR(255)`, timestamps + created_by/updated_by
  FK constraint: `table.foreign('asset_type_id').references('asset_types.id')`, `table.foreign('location_id').references('locations.id')`

- [ ] **C-5.** `npm run migrate:make -- create_employees_table`
  Columns: `id` (PK), `employee_code VARCHAR(20)`, `full_name VARCHAR(100)`, `email VARCHAR(100)`, `phone VARCHAR(20)`, `gender ENUM('male','female','other')`, `date_of_birth DATE`, `department_id INT` (FK → departments.id), `position VARCHAR(100)`, `job_title VARCHAR(100)`, `manager_id INT` (FK → employees.id, self-ref), `employment_status ENUM('probation','official','resigned')`, `probation_date DATE`, `official_date DATE`, `address VARCHAR(255)`, timestamps + created_by/updated_by

- [ ] **C-6.** `npm run migrate:make -- create_asset_assignments_table`
  Columns: `id` (PK), `asset_id INT` (FK → assets.id), `employee_id INT` (FK → employees.id), `assigned_date DATE`, `returned_date DATE`, `note TEXT`, timestamps + created_by/updated_by

- [ ] **C-7.** `npm run migrate:make -- create_maintenance_plans_table`
  Columns: `id` (PK), `asset_type_id INT` (FK → asset_types.id), `name VARCHAR(255)`, `frequency_days INT`, `description TEXT`, timestamps + created_by/updated_by

- [ ] **C-8.** `npm run migrate:make -- create_maintenance_requests_table`
  Columns: `id` (PK), `asset_id INT` (FK → assets.id), `plan_id INT NULLABLE` (FK → maintenance_plans.id), `scheduled_date DATE`, `status ENUM('open','in_progress','done','cancelled')`, timestamps + created_by/updated_by

- [ ] **C-9.** `npm run migrate:make -- create_repair_requests_table`
  Columns: `id` (PK), `asset_id INT` (FK → assets.id), `requested_by INT` (FK → employees.id), `description TEXT`, `request_date DATE NOT NULL`, `status ENUM('open','in_progress','done','cancelled') DEFAULT 'open'`, timestamps + created_by/updated_by

- [ ] **C-10.** `npm run migrate:make -- create_asset_maintenances_table`
  Columns: `id` (PK), `asset_id INT` (FK → assets.id), `repair_request_id INT NULLABLE` (FK → repair_requests.id), `maintenance_request_id INT NULLABLE` (FK → maintenance_requests.id), `type ENUM('repair','maintenance')`, `maintenance_date DATE NOT NULL`, `description TEXT`, `cost DECIMAL(12,2)`, `performed_by VARCHAR(100)`, timestamps + created_by/updated_by

- [ ] **C-11.** `npm run migrate:make -- create_asset_disposals_table`
  Columns: `id` (PK), `asset_id INT` (FK → assets.id), `disposal_date DATE`, `disposal_price DECIMAL(12,2)`, `received_by VARCHAR(100)`, `note TEXT`, timestamps + created_by/updated_by

- [ ] **C-12.** `npm run migrate:make -- create_asset_audits_table`
  Columns: `id` (PK), `audit_date DATE`, `status VARCHAR(50)`, timestamps + created_by/updated_by

- [ ] **C-13.** `npm run migrate:make -- create_audits_items_table`
  Columns: `id` (PK), `audit_id INT` (FK → asset_audits.id), `asset_id INT` (FK → assets.id), `scanned_at DATETIME`, `result VARCHAR(100)`, timestamps + created_by/updated_by

- [ ] **C-14.** `npm run migrate` — verify all 13 tables created in DB (check via MySQL client or `SHOW TABLES`)

- [ ] **C-15.** `npm run lint` — migration files are CommonJS (`exports.up`), no ESLint issues expected; confirm

---

### Phase D — Backend Models

> Pattern from `user.model.js`: `class X extends bookshelf.Model { get tableName(); get hasTimestamps() }`

- [ ] **D-1.** Create `server/models/repairRequest.model.js`:
  `tableName = 'repair_requests'`, `hasTimestamps = true`

- [ ] **D-2.** Create `server/models/assetMaintenance.model.js`:
  `tableName = 'asset_maintenances'`, `hasTimestamps = true`

- [ ] **D-3.** Create `server/models/asset.model.js`:
  `tableName = 'assets'`, `hasTimestamps = true`

- [ ] **D-4.** Create `server/models/employee.model.js`:
  `tableName = 'employees'`, `hasTimestamps = true`

- [ ] **D-5.** `npm run lint` — 0 errors

---

### Phase E — Joi Schemas (append to `server/utils/validator.js`)

> Read `server/utils/validator.js` before editing. Append to the exported default object.

- [ ] **E-1.** Add `searchRepairRequests`:
  ```js
  Joi.object({
    assetId: Joi.number().integer().optional().allow(null),
    requestedBy: Joi.number().integer().optional().allow(null),
    status: Joi.string().valid('open','in_progress','done','cancelled').optional().allow(null),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().valid(10,20,50,100).default(10),
    sortField: Joi.string().optional().default('request_date'),
    sortDir: Joi.string().valid('asc','desc').optional().default('desc')
  })
  ```

- [ ] **E-2.** Add `storeRepairRequest`:
  ```js
  Joi.object({
    assetId: Joi.number().integer().required(),
    requestedBy: Joi.number().integer().required(),
    description: Joi.string().optional().allow('', null),
    requestDate: Joi.date().iso().max('now').required()
  })
  ```

- [ ] **E-3.** Add `updateRepairRequest` — same shape as `storeRepairRequest`

- [ ] **E-4.** Add `updateRepairRequestStatus`:
  ```js
  Joi.object({
    status: Joi.string().valid('open','in_progress','done','cancelled').required(),
    repairDate: Joi.when('status', {
      is: 'done',
      then: Joi.date().iso().required(),
      otherwise: Joi.date().iso().optional().allow(null)
    }),
    cost: Joi.when('status', {
      is: 'done',
      then: Joi.number().min(0).required(),
      otherwise: Joi.number().min(0).optional().allow(null)
    }),
    performedBy: Joi.when('status', {
      is: 'done',
      then: Joi.string().max(100).required(),
      otherwise: Joi.string().max(100).optional().allow('', null)
    }),
    description: Joi.string().optional().allow('', null)
  })
  ```

- [ ] **E-5.** Add `bulkDeleteRepairRequests`:
  ```js
  Joi.object({
    ids: Joi.array().items(Joi.number().integer()).min(1).required()
  })
  ```

- [ ] **E-6.** Add `searchByCodeOrName`:
  ```js
  // Used for asset and employee autocomplete (path param, not body)
  // Validation done in route via express param or inline — no body schema needed.
  // Document here as note only.
  ```
  > Note: `GET /searchbyCodeOrName/:query` uses path param; no Joi body schema needed. Controller validates query length ≥ 1 char.

- [ ] **E-7.** `npm run lint` — 0 errors

---

### Phase F — Backend Controller: `repairRequest.controller.js`

> Import `knex` from `'../config/knex'` (for JOIN queries and transactions).
> Import `HttpStatus` from `'http-status-codes'`.
> All error responses: `res.status(code).json({ error: true, data: { message } })`.
> All success responses: `res.json({ error: false, data: ... })`.

- [ ] **F-1.** Write `search(req, res)`:
  - Knex query: `SELECT rr.*, a.asset_code, a.name AS asset_name, e.full_name AS requested_by_name`
  - `FROM repair_requests rr JOIN assets a ON rr.asset_id = a.id JOIN employees e ON rr.requested_by = e.id`
  - WHERE: `if (assetId) .where('rr.asset_id', assetId)`, `if (requestedBy) .where('rr.requested_by', requestedBy)`, `if (status) .where('rr.status', status)`
  - `ORDER BY rr.${sortField} ${sortDir}` — whitelist sortField to: `['request_date','id','status']` to prevent SQL injection
  - `LIMIT pageSize OFFSET (page-1)*pageSize`
  - Count query: same WHERE, `COUNT(*) as total`
  - Returns: `{ error: false, data: { items, total, page, pageSize } }`

- [ ] **F-2.** Write `findById(req, res)`:
  - Knex JOIN query: same joins as search; `WHERE rr.id = req.params.id`
  - 404 if not found
  - Returns full record including `asset_code`, `asset_name`, `requested_by_name`

- [ ] **F-3.** Write `store(req, res)`:
  - Destructure `{ assetId, requestedBy, description, requestDate }` from `req.body`
  - Verify `assetId` exists in `assets` table (knex check) → 400 if not found
  - Verify `requestedBy` exists in `employees` table → 400 if not found
  - INSERT `repair_requests`: `{ asset_id: assetId, requested_by: requestedBy, description, request_date: requestDate, status: 'open', created_by: req.currentUser.id }`
  - Returns: inserted record via `findById` helper

- [ ] **F-4.** Write `update(req, res)`:
  - Fetch existing record; 404 if not found
  - Verify `assetId` and `requestedBy` FK validity (same as store)
  - UPDATE `repair_requests` SET `asset_id`, `requested_by`, `description`, `request_date`, `updated_by = req.currentUser.id`, `updated_at = now()`
  - Returns: updated record via `findById` helper

- [ ] **F-5.** Write `updateStatus(req, res)` — **transaction required**:

  ```
  1. Fetch current repair_request (get current status + asset_id + request_date)
  2. Validate transition server-side:
     - open → in_progress ✓   open → cancelled ✓
     - in_progress → done ✓   in_progress → cancelled ✗ (400)
     - done → anything ✗ (400)
     - cancelled → anything ✗ (400)
  3. If status='done': validate repairDate >= request_date (400 if not)
  4. knex.transaction(trx => {
       UPDATE repair_requests SET status, updated_by, updated_at WHERE id   [trx]
       IF status='done':
         INSERT asset_maintenances {
           asset_id, repair_request_id: id, type: 'repair',
           maintenance_date: repairDate, description, cost, performed_by,
           created_by: req.currentUser.id
         }                                                                   [trx]
       IF status='in_progress':
         UPDATE assets SET status='IN_REPAIR', updated_by, updated_at
         WHERE id = asset_id                                                  [trx]
     })
  5. Returns updated repair_request via findById helper
  ```

- [ ] **F-6.** Write `destroy(req, res)`:
  - `ids` from `req.body.ids`
  - `DELETE FROM repair_requests WHERE id IN (ids)`
  - Returns: `{ error: false, data: { message: 'Deleted successfully.', count: ids.length } }`

- [ ] **F-7.** `npm run lint` — 0 errors on `repairRequest.controller.js`

---

### Phase G — Backend Controller: asset + employee searchbyCodeOrName

- [ ] **G-1.** Create `server/controllers/asset.controller.js`:
  ```js
  export function searchByCodeOrName(req, res) {
    // Knex query: SELECT id, asset_code, name FROM assets
    // WHERE asset_code LIKE '%query%' OR name LIKE '%query%'
    // LIMIT 20
    // Returns: [{ id, asset_code, name }]
  }
  ```

- [ ] **G-2.** Create `server/controllers/employee.controller.js`:
  ```js
  export function searchByCodeOrName(req, res) {
    // Knex query: SELECT id, employee_code, full_name FROM employees
    // WHERE employee_code LIKE '%query%' OR full_name LIKE '%query%'
    // LIMIT 20
    // Returns: [{ id, employee_code, full_name }]
  }
  ```

- [ ] **G-3.** `npm run lint` — 0 errors

---

### Phase H — Backend Routes

> Route file pattern from `user.route.js`: `router.route('/path').method(middleware, handler)` with inline Swagger JSDoc.

- [ ] **H-1.** Create `server/routes/repairRequest.route.js` — route for `POST /search`:
  `router.route('/search').post(isAuthenticated, validate(schema.searchRepairRequests), (req, res) => repairRequestCtrl.search(req, res))`

- [ ] **H-2.** Add route for `GET /:id`:
  `router.route('/:id').get(isAuthenticated, (req, res) => repairRequestCtrl.findById(req, res))`

- [ ] **H-3.** Add route for `POST /` (create):
  `router.route('/').post(isAuthenticated, validate(schema.storeRepairRequest), (req, res) => repairRequestCtrl.store(req, res))`

- [ ] **H-4.** Add route for `PUT /:id` (update):
  `router.route('/:id').put(isAuthenticated, validate(schema.updateRepairRequest), (req, res) => repairRequestCtrl.update(req, res))`

- [ ] **H-5.** Add route for `PATCH /:id/status`:
  `router.route('/:id/status').patch(isAuthenticated, validate(schema.updateRepairRequestStatus), (req, res) => repairRequestCtrl.updateStatus(req, res))`

- [ ] **H-6.** Add route for `DELETE /` (bulk):
  `router.route('/').delete(isAuthenticated, validate(schema.bulkDeleteRepairRequests), (req, res) => repairRequestCtrl.destroy(req, res))`
  > Note: `POST /search` and `POST /` both use `router.route('/')` — ensure `POST /search` is declared on `/search` path, not `/`.

- [ ] **H-7.** Create `server/routes/asset.route.js`:
  `router.route('/searchbyCodeOrName/:query').get(isAuthenticated, (req, res) => assetCtrl.searchByCodeOrName(req, res))`
  Include Swagger JSDoc.

- [ ] **H-8.** Create `server/routes/employee.route.js`:
  `router.route('/searchbyCodeOrName/:query').get(isAuthenticated, (req, res) => employeeCtrl.searchByCodeOrName(req, res))`
  Include Swagger JSDoc.

- [ ] **H-9.** Edit `server/routes/index.route.js` — add 3 mounts:
  ```js
  import repairRequestRoutes from './repairRequest.route';
  import assetRoutes from './asset.route';
  import employeeRoutes from './employee.route';
  // ...
  router.use('/repairRequests', repairRequestRoutes);
  router.use('/assets', assetRoutes);
  router.use('/employees', employeeRoutes);
  ```

- [ ] **H-10.** `npm run lint` — 0 errors

- [ ] **H-11.** Smoke test with Postman or curl:
  - `POST /api/auth/login` → get token
  - `GET /api/assets/searchbyCodeOrName/test` (Authorization: Bearer ...) → 200 array
  - `GET /api/employees/searchbyCodeOrName/test` → 200 array
  - `POST /api/repairRequests/search` with `{ page:1, pageSize:10 }` → 200 `{ data: { items, total } }`
  - `POST /api/repairRequests` → 200 or validation 400
  - All other routes → expected HTTP codes

---

### Phase I — Frontend Constants & Service

- [ ] **I-1.** Read `client/constants/actionType.js` → confirm current exports

- [ ] **I-2.** Append to `client/constants/actionType.js`:
  ```js
  export const REPAIR_REQUEST_SEARCH_SUCCESS = 'REPAIR_REQUEST_SEARCH_SUCCESS';
  export const REPAIR_REQUEST_FETCH_BY_ID_SUCCESS = 'REPAIR_REQUEST_FETCH_BY_ID_SUCCESS';
  export const REPAIR_REQUEST_SET_SELECTED_IDS = 'REPAIR_REQUEST_SET_SELECTED_IDS';
  export const REPAIR_REQUEST_SET_MODAL_MODE = 'REPAIR_REQUEST_SET_MODAL_MODE';
  export const REPAIR_REQUEST_UPDATE_STATUS_SUCCESS = 'REPAIR_REQUEST_UPDATE_STATUS_SUCCESS';
  export const REPAIR_REQUEST_FAILURE = 'REPAIR_REQUEST_FAILURE';
  export const REPAIR_REQUEST_CLEAR_ERROR = 'REPAIR_REQUEST_CLEAR_ERROR';
  export const REPAIR_REQUEST_SET_LOADING = 'REPAIR_REQUEST_SET_LOADING';
  ```

- [ ] **I-3.** Create `client/services/repairRequestService.js`:
  ```js
  import { fetch, store, update, patch, destroyWithBody } from '../utils/httpUtil';

  const BASE = 'repairRequests';
  const ASSETS_BASE = 'assets';
  const EMPLOYEES_BASE = 'employees';

  export const search = (payload) => store(`${BASE}/search`, payload);
  export const fetchById = (id) => fetch(`${BASE}/${id}`);
  export const create = (data) => store(BASE, data);
  export const updateById = (id, data) => update(`${BASE}/${id}`, data);
  export const updateStatus = (id, data) => patch(`${BASE}/${id}/status`, data);
  export const bulkDestroy = (ids) => destroyWithBody(BASE, { ids });
  export const searchAssets = (query) => fetch(`${ASSETS_BASE}/searchbyCodeOrName/${encodeURIComponent(query)}`);
  export const searchEmployees = (query) => fetch(`${EMPLOYEES_BASE}/searchbyCodeOrName/${encodeURIComponent(query)}`);
  ```

- [ ] **I-4.** `npm run lint` — 0 errors

---

### Phase J — Frontend Actions

- [ ] **J-1.** Create `client/actions/repairRequestAction.js` — write these thunks:

  ```
  searchRepairRequests(payload)  → calls service.search → dispatch REPAIR_REQUEST_SEARCH_SUCCESS
  fetchRepairRequestById(id)     → calls service.fetchById → dispatch REPAIR_REQUEST_FETCH_BY_ID_SUCCESS
  createRepairRequest(data)      → calls service.create → on success: dispatch SET_MODAL_MODE(null) + SEARCH_SUCCESS refresh
  updateRepairRequest(id, data)  → calls service.updateById → on success: dispatch SET_MODAL_MODE(null) + refresh
  updateRepairRequestStatus(id, data) → calls service.updateStatus → on success: dispatch UPDATE_STATUS_SUCCESS + refresh
  deleteRepairRequests(ids)      → calls service.bulkDestroy → on success: refresh
  setSelectedIds(ids)            → dispatch REPAIR_REQUEST_SET_SELECTED_IDS
  setModalMode(mode)             → dispatch REPAIR_REQUEST_SET_MODAL_MODE  (mode: 'add'|'edit'|'view'|'updateStatus'|null)
  ```

  Error handling: dispatch `REPAIR_REQUEST_FAILURE` with `{ message, source }` where `source` indicates which action failed (for inline vs toast routing in reducer).

- [ ] **J-2.** `npm run lint` — 0 errors on `repairRequestAction.js`

---

### Phase K — Frontend Reducer

- [ ] **K-1.** Create `client/reducers/repairRequestReducer.js`:
  ```js
  const initialState = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    sortField: 'request_date',
    sortDir: 'desc',
    selectedIds: [],
    selectedItem: null,
    modalMode: null,     // 'add' | 'edit' | 'view' | 'updateStatus' | null
    loading: false,
    error: null,         // { message, source } — source used to route inline vs toast
  };
  ```
  Handle all `REPAIR_REQUEST_*` action types.

- [ ] **K-2.** Read `client/reducers/index.js` → confirm current `combineReducers` call

- [ ] **K-3.** Edit `client/reducers/index.js`:
  ```js
  import repairRequestReducer from './repairRequestReducer';
  // in combineReducers:
  repairRequest: repairRequestReducer,
  ```

- [ ] **K-4.** `npm run lint` — 0 errors

---

### Phase L — Frontend Components

> All components use `withStyles` from `@material-ui/core/styles`. Colors from spec §7:
> Primary green: `#016242` | Header bg: `#0B5C4A` | Selected: `#E8F5E9` | Cancelled: `#F5F5F5` | Done: `#F1F8F4`

- [ ] **L-1.** Create `client/components/repairRequests/AutocompleteField.js`:
  - Props: `{ label, fetchSuggestions, displayFormat, onSelect, value, error }`
  - Internal state: `{ inputText, suggestions, open, selectedId }`
  - `fetchSuggestions(inputText)` called on each keystroke if `inputText.length >= 1`
  - Dropdown: MUI `Paper` + `List`; each item shows `displayFormat(item)` (e.g. `[asset_code] - [name]`)
  - On item click: `selectedId = item.id`, `inputText = displayFormat(item)`, close dropdown, call `onSelect(item.id)`
  - On blur: if `selectedId === null`, clear input and call `onSelect(null)` (reject free-text)
  - `error` prop: show red helper text

- [ ] **L-2.** Create `client/components/repairRequests/RepairRequestAddModal.js`:
  - `reduxForm({ form: 'RepairRequestAdd', validate })`
  - Fields in order: `assetId` (AutocompleteField → assets), `requestedBy` (AutocompleteField → employees), `description` (TextField multiline, optional), `requestDate` (`<input type="date">` max=today)
  - NO id field rendered
  - `validate(values)`: assetId required (V-1), requestedBy required (V-2), requestDate required (V-3), requestDate ≤ today (V-4)
  - On submit: dispatch `createRepairRequest(data)`; on error from reducer: show inline below form; on success: modal closes automatically (reducer sets `modalMode: null`)
  - Close/X: dispatch `setModalMode(null)`, `reset()` form

- [ ] **L-3.** Create `client/components/repairRequests/RepairRequestEditModal.js`:
  - Same form as Add; `initialValues` from `repairRequest.selectedItem`
  - `id` shown as `<Typography variant="body1">ID: {selectedItem.id}</Typography>` — NOT an input
  - `reduxForm({ form: 'RepairRequestEdit', validate })`
  - On submit: dispatch `updateRepairRequest(id, data)`

- [ ] **L-4.** Create `client/components/repairRequests/RepairRequestViewModal.js`:
  - Read-only display of: ID, Asset Code, Asset Name, Requested by, Description, Request date, Status
  - No submit button; only Close button
  - Data from `repairRequest.selectedItem`

- [ ] **L-5.** Create `client/components/repairRequests/UpdateStatusModal.js`:
  - `reduxForm({ form: 'UpdateStatus', validate: validateStatus })`
  - `id` as read-only `<Typography>` label
  - Status `<Select>`: options depend on `selectedItem.status`:
    - `open` → options: `in_progress`, `cancelled`
    - `in_progress` → options: `done`
  - On status dropdown change:
    - If `done`: enable + clear repairDate, description, cost, performedBy fields
    - Else: disable + clear those fields
  - `validateStatus(values)`: when `status='done'`: repairDate required (V-5), repairDate ≥ request_date from selectedItem (V-6), cost required (V-7), cost ≥ 0 (V-8), performedBy required (V-9)
  - On submit: dispatch `updateRepairRequestStatus(id, data)`

- [ ] **L-6.** Create `client/components/repairRequests/RepairRequestList.js` — the main page:

  **Search section (3-column grid):**
  - Column 1: AutocompleteField for Asset Code (calls `searchAssets`)
  - Column 2: AutocompleteField for Requested By (calls `searchEmployees`)
  - Column 3: Status `<Select>` (options: all/open/in_progress/done/cancelled)
  - [Search] button → dispatch `searchRepairRequests({ assetId, requestedBy, status, page:1, pageSize, sortField, sortDir })`
  - [Clear] button → reset all fields + reset sort to defaults + dispatch search with defaults

  **Action buttons:**
  - [Add] button → dispatch `setModalMode('add')`
  - [Delete] button: if `selectedIds.length === 0` → show "Please select..." dialog; else → show confirm dialog "Delete (n items). Are you sure?" → OK → dispatch `deleteRepairRequests(selectedIds)`

  **Data table:**
  - Columns: ☐, ID, Asset Code, Asset Name, Requested by, Request date (DD/MM/YYYY), Status (display label), Action
  - Row background: if selectedIds includes row.id → `#E8F5E9`; else if status=cancelled → `#F5F5F5`; else if status=done → `#F1F8F4`; else white
  - Header checkbox: checks/unchecks all current-page rows
  - Sort: column header click toggles `sortField`/`sortDir`; triggers search; default `request_date DESC`
  - Per-row action icons:
    - EditIcon: disabled (grayed, pointer-events:none) if status=`done`; else → dispatch `fetchRepairRequestById(id)` + `setModalMode('edit')`
    - VisibilityIcon: always enabled → dispatch `fetchRepairRequestById(id)` + `setModalMode('view')`
    - AutorenewIcon: disabled if status=`done` or status=`cancelled`; else → dispatch `fetchRepairRequestById(id)` + `setModalMode('updateStatus')`
  - Empty state: if `total === 0` and search was executed → show `t('repairRequests.notFound')`

  **Modals** (conditionally rendered based on `modalMode`):
  - `modalMode==='add'` → `<RepairRequestAddModal>`
  - `modalMode==='edit'` → `<RepairRequestEditModal>`
  - `modalMode==='view'` → `<RepairRequestViewModal>`
  - `modalMode==='updateStatus'` → `<UpdateStatusModal>`

  **Pagination:**
  - Records per page `<Select>`: 10/20/50/100
  - Navigation: First `|<` / Prev `<` / Next `>` / Last `>|`
  - Display: `X–Y of Z`
  - Each change triggers search with updated `page`/`pageSize`

  **Error display:**
  - `repairRequest.error.source === 'create' || 'update'` → inline in modal (modal stays open)
  - All other errors → MUI `Snackbar` toast

- [ ] **L-7.** `npm run lint` — 0 errors on all component files

---

### Phase M — Container & Routing

- [ ] **M-1.** Create `client/containers/repairRequests/RepairRequestContainer.js`:
  - `connect(mapStateToProps, mapDispatchToProps)(RepairRequestList)`
  - `mapStateToProps`: `state.repairRequest`
  - `mapDispatchToProps`: all action creators from `repairRequestAction.js`

- [ ] **M-2.** Read `client/routers/routes.js` → confirm PrivateRoute pattern

- [ ] **M-3.** Edit `client/routers/routes.js`:
  ```js
  const AsyncRepairRequests = loadable(() => import('../containers/repairRequests/RepairRequestContainer'));
  // ...
  <PrivateRoute exact path="/repair-requests" layout={MainLayout} component={AsyncRepairRequests} />
  ```

- [ ] **M-4.** Read `client/components/common/drawer/MiniDrawer.js` → confirm ListItem pattern

- [ ] **M-5.** Edit `client/components/common/drawer/MiniDrawer.js`:
  - Import `BuildIcon from '@material-ui/icons/Build'`
  - Import `{ Link }` from `react-router-dom`
  - Add `<ListItem button component={Link} to="/repair-requests">` with `<BuildIcon>` and text "Repair Requests"

- [ ] **M-6.** `npm run lint` — 0 errors

---

### Phase N — QA Gate

- [ ] **N-1.** `npm run lint` — full project; 0 errors, 0 warnings promoted to error

- [ ] **N-2.** `npm run build` — clean build; 0 Webpack errors; check bundle size is reasonable

- [ ] **N-3.** Manual smoke test (browser):
  - Login → navigate to `/repair-requests`
  - Asset Code autocomplete → type 1 char → dropdown appears
  - Employee autocomplete → type 1 char → dropdown appears
  - Add → fill form → submit → new row appears in grid
  - Edit → pre-fills → update → row refreshes
  - View → read-only → no submit button
  - Update Status open→in_progress → success message
  - Update Status in_progress→done → fill repair fields → success; check `asset_maintenances` in DB
  - Bulk delete 2 rows → confirm → rows removed
  - Clear → grid reloads to default sort

- [ ] **N-4.** Complete `docs/changes/REPAIRREQUESTS/test-results.md` per `test-plan.md`

- [ ] **N-5.** Complete `docs/changes/REPAIRREQUESTS/self-review.md`

---

## 6. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `httpBaseUtil.js` change breaks existing `/users` and `/auth` flows | High | High | Test login + user routes in Postman immediately after Phase B. Rollback B-2 if broken. |
| Migration FK order fails if another migration runs out of order | Medium | High | Knex runs migrations in filename timestamp order; prefix 001-013 in names enforces order |
| `knex.transaction()` partial write: status updated but `asset_maintenances` INSERT fails | Medium | High | Wrapped in single `knex.transaction` — any failure rolls back all writes. Test explicitly. |
| `assets.status` ENUM doesn't include `'IN_REPAIR'` in existing DB | Low | High | Schema confirms ENUM includes `'IN_REPAIR'`. Migration C-4 creates it correctly. |
| Status transition bypass via direct API call | Medium | Medium | Controller F-5 re-validates transitions server-side (not just FE dropdown) |
| `sortField` injection in search query | Medium | High | Whitelist `sortField` to `['request_date','id','status']` in F-1 |
| `LIKE '%query%'` autocomplete is slow on large tables | Low | Low | Add LIMIT 20 in G-1/G-2; existing DB indexes on `asset_code` and `employee_code` help |
| `@material-ui/icons` version mismatch with MUI v4 | Low | Medium | Already installed in project (confirmed from MiniDrawer.js imports) |
| `react-i18next` peer dep conflict with React 17 | Low | Medium | `react-i18next` v11.x supports React 17; check during A-1 |
| `repairRequestService` exports shadow existing httpUtil function names | Low | Low | Service uses different names (`create`, `updateById`) — no shadowing |

---

## 7. Rollback Procedure

### If Phase A (i18n) breaks build:
```bash
npm uninstall i18next react-i18next
# Remove client/i18n/ folder
# Remove import from client/main.js
npm run build
```

### If Phase B (httpBaseUtil fix) breaks auth:
```bash
# Revert client/utils/httpBaseUtil.js to X-XSRF-TOKEN header
git checkout client/utils/httpBaseUtil.js
# Investigate authenticate.js header reading
```

### If Phase C (migrations) fail:
```bash
npm run migrate:rollback  # rolls back last batch (one step per run)
# Fix migration file
npm run migrate           # re-apply
```
> Knex rolls back in reverse order within a batch. If only some of 13 succeed, `rollback` undoes the batch.

### If Phase H (routes) cause 500s:
- Comment out new `router.use()` lines in `index.route.js`
- Restart server — existing routes unaffected
- Fix controller/route, re-mount

### If FE build breaks after Phase M:
```bash
# Check Webpack error — usually an import path issue
# Common: wrong relative path, missing export
# git diff to identify the offending change
npm run lint  # catches obvious issues
```

---

## 8. Verification Procedure

### 8.1 Per-Checkpoint

| Checkpoint | Condition | Command |
|-----------|-----------|---------|
| After Phase A | i18n loads without error | `npm run build` + check browser console |
| After Phase B | Auth works end-to-end | `POST /api/auth/login` → token; `GET /api/users` with token → 200 |
| After Phase C | All 13 tables exist | `SHOW TABLES` in MySQL; count = 13 + `users` + `knex_migrations` |
| After Phase H | All 7 new endpoints respond | Postman collection per Phase H-11 smoke test |
| After Phase N | Full spec coverage | All AC items in §9 checked |

### 8.2 Acceptance Criteria Verification

Each AC in [§9 AC Mapping Table](#9-ac-mapping-table) is verified by:
1. Tracing to the implementing step
2. Running the step
3. Manually executing the AC scenario from `spec-pack.md §9` (Examples + Abnormal Cases + Boundary Values)

---

## 9. AC Mapping Table

| AC | Description | Implementing Steps | Files |
|----|-------------|-------------------|-------|
| AC-1 | Asset autocomplete triggers on ≥1 char | L-1, L-6, G-7, G-1 | `AutocompleteField.js`, `asset.route.js`, `asset.controller.js` |
| AC-2 | Employee autocomplete triggers on ≥1 char | L-1, L-6, G-8, G-2 | `AutocompleteField.js`, `employee.route.js`, `employee.controller.js` |
| AC-3 | Free-text without ID rejected on submit | L-1, L-2, L-3 | `AutocompleteField.js` (onBlur reset), form `validate()` |
| AC-4 | Search sends correct payload | I-3, J-1, L-6 | `repairRequestService.js`, `repairRequestAction.js`, `RepairRequestList.js` |
| AC-5 | Empty result shows "Repair request does not exist." | L-6, A-2/A-3/A-4 | `RepairRequestList.js` empty state, locale files |
| AC-6 | Clear resets fields + triggers search | L-6 | `RepairRequestList.js` clear handler |
| AC-7 | Header checkbox selects/deselects all on page | L-6 | `RepairRequestList.js` header checkbox logic |
| AC-8 | done: Edit+UpdateStatus disabled; cancelled: UpdateStatus disabled | L-6 | `RepairRequestList.js` per-row icon disabled rules |
| AC-9 | Page-size change triggers search with page=1 | L-6 | `RepairRequestList.js` pagination handler |
| AC-10 | Page nav buttons trigger search | L-6 | `RepairRequestList.js` pagination nav handler |
| AC-11 | Pagination shows X–Y of Z | L-6, K-1 | `RepairRequestList.js`, `repairRequestReducer.js` (total) |
| AC-12 | Add: Asset Code required | L-2 | `RepairRequestAddModal.js` validate() |
| AC-13 | Add: Requested by required | L-2 | `RepairRequestAddModal.js` validate() |
| AC-14 | Add: Request date required | L-2 | `RepairRequestAddModal.js` validate() |
| AC-15 | Add: Request date ≤ today (FE + BE) | L-2, E-2 | `RepairRequestAddModal.js` validate(), `validator.js` storeRepairRequest |
| AC-16 | Add: no ID field; correct field order | L-2 | `RepairRequestAddModal.js` (no id field rendered) |
| AC-17 | Add success: message + close + refresh | J-1, L-2, A-2/A-3/A-4 | `repairRequestAction.js`, locale files |
| AC-18 | Add error: modal stays + inline server error | J-1, K-1, L-2 | Action dispatches FAILURE with source='create'; modal checks error |
| AC-19 | Add Close/X discards immediately | L-2 | `RepairRequestAddModal.js` onClose handler |
| AC-20 | Edit loads data via GET, pre-fills | J-1, L-3 | `fetchRepairRequestById` thunk, `RepairRequestEditModal.js` initialValues |
| AC-21 | Edit id shown as read-only text label | L-3 | `RepairRequestEditModal.js` (`<Typography>` not `<input>`) |
| AC-22 | Edit applies same validation as Add | L-3 | Same `validate()` function reused |
| AC-23 | Edit success: message + close + refresh | J-1, L-3, A-2/A-3/A-4 | `repairRequestAction.js` updateRepairRequest thunk |
| AC-24 | Edit error: modal stays + inline | J-1, K-1, L-3 | Action dispatches FAILURE with source='update' |
| AC-25 | Edit Close/X discards immediately | L-3 | `RepairRequestEditModal.js` onClose handler |
| AC-26 | Delete: no selection → info message | L-6 | `RepairRequestList.js` delete handler |
| AC-27 | Delete: confirm modal shows n | L-6 | `RepairRequestList.js` confirm dialog |
| AC-28 | Delete Cancel closes modal | L-6 | `RepairRequestList.js` cancel handler |
| AC-29 | Delete OK calls API + refresh | J-1, F-6, H-6, L-6 | `repairRequestAction.js`, `repairRequest.controller.js`, `repairRequest.route.js` |
| AC-30 | UpdateStatus popup opens with ID pre-filled | J-1, L-5 | `fetchRepairRequestById` thunk, `UpdateStatusModal.js` |
| AC-31 | Status=done enables + clears conditional fields | L-5 | `UpdateStatusModal.js` onStatusChange handler |
| AC-32 | Status≠done disables + clears conditional fields | L-5 | `UpdateStatusModal.js` onStatusChange handler |
| AC-33 | done: Repair date required | L-5, E-4 | `UpdateStatusModal.js` validateStatus(), `validator.js` updateRepairRequestStatus |
| AC-34 | done: Cost required | L-5, E-4 | `UpdateStatusModal.js` validateStatus(), `validator.js` |
| AC-35 | done: Performed by required (free-text, max 100) | L-5, E-4 | `UpdateStatusModal.js` validateStatus(), `validator.js` |
| AC-36 | done: Repair date ≥ Request date | L-5, F-5 | `UpdateStatusModal.js` validateStatus(), controller F-5 server-side check |
| AC-37 | done: Cost ≥ 0 | L-5, E-4 | `UpdateStatusModal.js` validateStatus(), `validator.js` `Joi.number().min(0)` |
| AC-38 | done: creates asset_maintenances in transaction | F-5, H-5 | `repairRequest.controller.js` updateStatus (knex.transaction) |
| AC-39 | Any status success: multilingual message + close + refresh | J-1, A-2/A-3/A-4 | `repairRequestAction.js`, locale files |
| AC-40 | Error routing: Add/Edit inline; others toast | J-1, K-1, L-6 | `repairRequestAction.js` error source, `RepairRequestList.js` Snackbar |
| AC-41 | Default sort: request_date DESC | I-3, K-1, J-1 | `repairRequestService.js` default payload, `repairRequestReducer.js` initialState |
| AC-42 | in_progress: assets.status=IN_REPAIR in transaction | F-5, H-5 | `repairRequest.controller.js` updateStatus (knex.transaction branch) |

---

*End of Implementation Plan — REPAIRREQUESTS v3.0*
