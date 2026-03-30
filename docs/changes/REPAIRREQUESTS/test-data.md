# Test Data — REPAIRREQUESTS

> Version: 2.0 | Date: 2026-03-29 | For use with test-plan.md and blackbox-testcases.md v2.0
> Prior version: 1.0 (basic seeds + 7 API payloads)

---

## 1. DB Seed Data (Prerequisite Records)

Run these INSERTs against the test database before executing tests.
All timestamps use `NOW()` or fixed dates for reproducibility.

### 1.1 Assets (for autocomplete + FK)

```sql
INSERT INTO assets (id, asset_code, name, asset_type_id, status, location_id, purchase_date, created_at, updated_at)
VALUES
  (1, 'LAP2024BC10050', 'Laptop Dell XPS 13',    1, 'IN_USE',   1, '2024-01-15', NOW(), NOW()),
  (2, 'AIR2023BC20010', 'Điều hòa Daikin 2HP',   2, 'IN_USE',   1, '2023-06-01', NOW(), NOW()),
  (3, 'TAB2025BC30001', 'iPad Pro 12.9',          3, 'NEW',      1, '2025-03-01', NOW(), NOW()),
  (4, 'LAP2022BC10020', 'Laptop Lenovo ThinkPad', 1, 'IN_REPAIR',1, '2022-08-10', NOW(), NOW());
```

### 1.2 Employees (for autocomplete + FK)

```sql
INSERT INTO employees (id, employee_code, full_name, email, gender, date_of_birth, department, position, job_title, probation_date, created_at, updated_at)
VALUES
  (1, 'EMP001', 'Bui Minh Tien',  'tien.bm@example.com', 'male',   '1990-05-15', 'IT',  'Developer', 'Senior Dev', '2020-01-01', NOW(), NOW()),
  (2, 'EMP002', 'Nguyen Thi Lan', 'lan.nt@example.com',  'female', '1993-08-20', 'HR',  'Recruiter', 'HR Specialist', '2021-03-01', NOW(), NOW()),
  (3, 'EMP003', 'Tran Van Hung',  'hung.tv@example.com', 'male',   '1988-12-01', 'GA',  'GA Lead',   'GA Manager', '2019-06-01', NOW(), NOW());
```

### 1.3 Repair Requests (various statuses)

> IDs are stable reference values used throughout blackbox-testcases.md.
> request_date values chosen to support boundary tests (B-1, B-3, B-4).

```sql
INSERT INTO repair_requests (id, asset_id, requested_by, description, request_date, status, created_at, created_by, updated_at, updated_by)
VALUES
  (1, 1, 1, 'Màn hình bị nứt',         '2026-03-20', 'open',        NOW(), 1, NOW(), 1),
  -- ^ BB-073/074: request_date = 2026-03-20 used for repairDate boundary tests
  (2, 2, 2, 'Điều hòa không làm lạnh', '2026-03-15', 'in_progress', NOW(), 1, NOW(), 1),
  -- ^ BB-063: only "done" transition allowed; BB-086: in_progress → cancelled rejected
  (3, 3, 1, 'Pin hỏng',                '2026-03-10', 'done',        NOW(), 1, NOW(), 1),
  -- ^ BB-085: done → any transition rejected; BB-020: Edit+UpdateStatus disabled
  (4, 1, 3, 'Bàn phím liệt phím',      '2026-03-01', 'cancelled',   NOW(), 1, NOW(), 1),
  -- ^ BB-021: cancelled UpdateStatus disabled; BB-060: selectable for delete
  (5, 2, 2, NULL,                       '2026-03-28', 'open',        NOW(), 2, NOW(), 2),
  -- ^ has description=NULL (tests that null description renders cleanly)
  (6, 3, 2, 'Boundary: today',          '2026-03-29', 'open',        NOW(), 1, NOW(), 1),
  -- ^ BB-034/BB-040: request_date = today (2026-03-29); repairDate boundary B-1
  (7, 4, 3, 'Boundary: yesterday',      '2026-03-28', 'open',        NOW(), 1, NOW(), 1);
  -- ^ BB-035: request_date = yesterday; also needed for repairDate ≥ requestDate tests
```

### 1.4 Asset Maintenances (for record ID-3 which is done)

```sql
INSERT INTO asset_maintenances (asset_id, repair_request_id, type, maintenance_date, description, cost, performed_by, created_at, updated_at)
VALUES
  (3, 3, 'repair', '2026-03-18', 'Thay pin mới', 350000.00, 'Công ty TNHH Kỹ Thuật ABC', NOW(), NOW());
```

---

## 2. API Payloads

### 2.1 POST /api/v1/repairRequests/search

**Request — search all (default):**
```json
{
  "page": 1,
  "pageSize": 10,
  "sortField": "request_date",
  "sortDir": "desc"
}
```

**Request — filter by status:**
```json
{
  "status": "in_progress",
  "page": 1,
  "pageSize": 10,
  "sortField": "request_date",
  "sortDir": "desc"
}
```

**Expected response (200):**
```json
{
  "error": false,
  "data": {
    "items": [
      {
        "id": 5,
        "asset_id": 2,
        "asset_code": "AIR2023BC20010",
        "asset_name": "Điều hòa Daikin 2HP",
        "requested_by": 2,
        "requested_by_name": "Nguyen Thi Lan",
        "description": null,
        "request_date": "2026-03-28",
        "status": "open"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  }
}
```

**Expected response — empty (200):**
```json
{
  "error": false,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2.2 POST /api/v1/repairRequests (Add)

**Request — valid:**
```json
{
  "asset_id": 1,
  "requested_by": 1,
  "description": "Bàn phím bị liệt phím 'A'",
  "request_date": "2026-03-29"
}
```

**Expected response (201):**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "asset_id": 1,
    "requested_by": 1,
    "description": "Bàn phím bị liệt phím 'A'",
    "request_date": "2026-03-29",
    "status": "open"
  }
}
```

**Request — future date (invalid):**
```json
{
  "asset_id": 1,
  "requested_by": 1,
  "request_date": "2026-03-30"
}
```

**Expected response (400):**
```json
{
  "error": {
    "code": 400,
    "message": "request_date must be less than or equal to today"
  }
}
```

---

### 2.3 PATCH /api/v1/repairRequests/2/status (→ done)

**Request:**
```json
{
  "status": "done",
  "repairDate": "2026-03-29",
  "cost": 500000,
  "performedBy": "Công ty TNHH Kỹ Thuật ABC",
  "description": "Sửa xong, bổ sung gas"
}
```

**Expected response (200):**
```json
{
  "error": false,
  "data": {
    "id": 2,
    "status": "done"
  }
}
```

**Verify in DB after success:**
```sql
SELECT * FROM repair_requests WHERE id = 2;
-- Expected: status = 'done'

SELECT * FROM asset_maintenances WHERE repair_request_id = 2;
-- Expected: 1 row, type='repair', asset_id=2, maintenance_date='2026-03-29',
--           cost=500000.00, performed_by='Công ty TNHH Kỹ Thuật ABC'
```

---

### 2.4 PATCH /api/v1/repairRequests/1/status (→ in_progress)

**Request:**
```json
{
  "status": "in_progress"
}
```

**Verify in DB:**
```sql
SELECT status FROM repair_requests WHERE id = 1;
-- Expected: 'in_progress'

SELECT status FROM assets WHERE id = 1;
-- Expected: 'IN_REPAIR'
```

---

### 2.5 PATCH — Invalid transition (400)

**Request: try in_progress → cancelled (NOT allowed):**
```json
{
  "status": "cancelled"
}
```
Against: `PATCH /api/v1/repairRequests/2/status` (where id=2 is in_progress)

**Expected (400):**
```json
{
  "error": {
    "code": 400,
    "message": "Invalid status transition: in_progress → cancelled"
  }
}
```

---

### 2.6 DELETE /api/v1/repairRequests (Bulk Delete)

**Request:**
```json
{
  "ids": [4, 5]
}
```

**Expected response (200):**
```json
{
  "error": false,
  "data": { "deleted": 2 }
}
```

---

### 2.7 GET /api/v1/assets/searchbyCodeOrName/LAP

**Expected response (200):**
```json
{
  "error": false,
  "data": [
    { "id": 1, "asset_code": "LAP2024BC10050", "name": "Laptop Dell XPS 13" },
    { "id": 4, "asset_code": "LAP2022BC10020", "name": "Laptop Lenovo ThinkPad" }
  ]
}
```

---

## 3. Boundary / Edge Case Payloads

### Cost = 0 (valid free repair)
```json
{ "status": "done", "repairDate": "2026-03-29", "cost": 0, "performedBy": "Bảo hành NSX" }
```

### Cost = -0.01 (invalid)
```json
{ "status": "done", "repairDate": "2026-03-29", "cost": -0.01, "performedBy": "ABC" }
```
Expected: 400 "Cost cannot be negative"

### performed_by = 101 chars (invalid — max 100)
```json
{
  "status": "done",
  "repairDate": "2026-03-29",
  "cost": 100,
  "performedBy": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
}
```
Expected: 400 validation error

### Repair date = Request date (valid — equal is OK)
```sql
-- repair_request id=1 has request_date = '2026-03-20'
```
```json
{ "status": "done", "repairDate": "2026-03-20", "cost": 200000, "performedBy": "Test Co" }
```
Expected: 200 success

### Repair date < Request date (invalid)
```json
{ "status": "done", "repairDate": "2026-03-19", "cost": 200000, "performedBy": "Test Co" }
```
Against id=1 (request_date=2026-03-20). Expected: 400 "Repair date must be after Request date"

### Bulk delete empty ids (invalid)
```json
{ "ids": [] }
```
Expected: 400 validation error

---

## 4. Auth Header (all protected routes)

```
Authorization: Bearer <JWT token from POST /api/auth/login>
```

Login to get token:
```json
POST /api/auth/login
{ "email": "admin@example.com", "password": "<admin password>" }
```

---

## 5. Boundary Input Data (Supplement for blackbox-testcases.md)

### 5.1 performed_by strings

| Label | Value | Length | Expected |
|-------|-------|--------|---------|
| Max valid | `"AAAA...A"` (100 × 'A') | 100 | 200 OK (BB-071) |
| Over limit | `"AAAA...A"` (101 × 'A') | 101 | 400 validation error (BB-072) |
| Empty string | `""` | 0 | Treated as null — accepted (BB-070) |
| Null (omitted) | _(field absent)_ | — | Accepted; `performed_by = NULL` (BB-070) |

```
# 100-char string for copy-paste:
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
# (count: 100)

# 101-char string for copy-paste:
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
# (count: 101)
```

### 5.2 Cost boundary values

| Value | Type | Expected |
|-------|------|---------|
| `500000` | Normal positive | 200 OK |
| `0.01` | Smallest positive | 200 OK |
| `0` | Free repair | 200 OK (BB-077) |
| `-0.01` | Just below zero | 400 "Cost cannot be negative" (BB-076) |
| `-1` | Negative integer | 400 "Cost cannot be negative" (BB-075) |
| `null` / omitted | Optional not provided | 200 OK; `cost = NULL` in DB (BB-068) |

### 5.3 Request date / Repair date pairs (for BB-073, BB-074)

| Record id | request_date | Test repairDate | Expected |
|-----------|-------------|-----------------|---------|
| 1 | 2026-03-20 | 2026-03-19 | 400 — before (BB-073) |
| 1 | 2026-03-20 | 2026-03-20 | 200 — equal, valid (BB-074) |
| 1 | 2026-03-20 | 2026-03-21 | 200 — after, valid |
| 6 | 2026-03-29 | 2026-03-29 | 200 — today=today, valid |

### 5.4 Pagination boundary data

To test BB-026 (total = pageSize → Next disabled) and BB-027 (total = pageSize + 1):

```sql
-- Scenario A: exactly 10 records (pageSize=10 → 1 page only)
-- Ensure seed has exactly 10 repair requests in DB before this test.
-- With seed §1.3 we have 7; insert 3 more:
INSERT INTO repair_requests (asset_id, requested_by, request_date, status, created_at, created_by, updated_at, updated_by)
VALUES
  (1, 1, '2026-03-05', 'open',   NOW(), 1, NOW(), 1),
  (1, 2, '2026-03-04', 'open',   NOW(), 1, NOW(), 1),
  (2, 3, '2026-03-03', 'cancelled', NOW(), 1, NOW(), 1);
-- After: total = 10. Search pageSize=10 → 1 page; Next button disabled.

-- Scenario B: 11 records (pageSize=10 → 2 pages; page 2 has 1 row)
INSERT INTO repair_requests (asset_id, requested_by, request_date, status, created_at, created_by, updated_at, updated_by)
VALUES (3, 1, '2026-03-02', 'open', NOW(), 1, NOW(), 1);
-- After: total = 11. Search pageSize=10 → page 2 shows 1 row.
```

---

## 6. Expected DB State Tables

### 6.1 After PATCH /repairRequests/1/status → done

Precondition: record id=1, asset_id=1, request_date=2026-03-20; status=open

Request body:
```json
{ "status": "done", "repairDate": "2026-03-29", "cost": 500000, "performedBy": "Công ty ABC", "description": "Sửa xong" }
```

Expected DB state:

| Table | Column | Expected value |
|-------|--------|---------------|
| repair_requests | id=1 status | `'done'` |
| repair_requests | id=1 updated_by | `<requesting user id>` |
| asset_maintenances | repair_request_id=1 type | `'repair'` |
| asset_maintenances | repair_request_id=1 asset_id | `1` |
| asset_maintenances | repair_request_id=1 maintenance_date | `'2026-03-29'` |
| asset_maintenances | repair_request_id=1 cost | `500000.00` |
| asset_maintenances | repair_request_id=1 performed_by | `'Công ty ABC'` |
| asset_maintenances | repair_request_id=1 description | `'Sửa xong'` |
| assets | id=1 status | unchanged from before (NOT set to IN_REPAIR; only in_progress does that) |

Verify SQL:
```sql
SELECT status FROM repair_requests WHERE id = 1;
SELECT type, asset_id, maintenance_date, cost, performed_by, description
  FROM asset_maintenances WHERE repair_request_id = 1;
```

### 6.2 After PATCH /repairRequests/1/status → done (Cost and Performed by omitted)

Request body:
```json
{ "status": "done", "repairDate": "2026-03-29" }
```

Expected DB state:

| Table | Column | Expected value |
|-------|--------|---------------|
| repair_requests | id=1 status | `'done'` |
| asset_maintenances | repair_request_id=1 cost | `NULL` |
| asset_maintenances | repair_request_id=1 performed_by | `NULL` |

### 6.3 After PATCH /repairRequests/1/status → in_progress

Precondition: record id=1 asset_id=1; asset 1 has status='IN_USE'

Request body:
```json
{ "status": "in_progress" }
```

Expected DB state:

| Table | Column | Expected value |
|-------|--------|---------------|
| repair_requests | id=1 status | `'in_progress'` |
| assets | id=1 status | `'IN_REPAIR'` |
| asset_maintenances | any row for repair_request_id=1 | none created (in_progress does not create maintenance row) |

Verify SQL:
```sql
SELECT status FROM repair_requests WHERE id = 1;
SELECT status FROM assets WHERE id = 1;
SELECT COUNT(*) FROM asset_maintenances WHERE repair_request_id = 1;
-- Expected: 0
```

### 6.4 After DELETE /repairRequests with ids=[4, 5]

Precondition: records id=4 (cancelled) and id=5 (open) exist

Expected DB state:

| Check | SQL | Expected |
|-------|-----|---------|
| Records removed | `SELECT id FROM repair_requests WHERE id IN (4, 5)` | 0 rows |
| Other records intact | `SELECT COUNT(*) FROM repair_requests WHERE id NOT IN (4, 5)` | same count as before |

### 6.5 Transaction rollback verification (BB-082)

To verify that a failed asset_maintenances INSERT does NOT leave repair_requests in a partial state:

```sql
-- Before test: record id=1 status='open'
-- Simulate DB error during asset_maintenances INSERT (e.g. FK violation, then rollback)
-- After failed PATCH → done attempt:
SELECT status FROM repair_requests WHERE id = 1;
-- Expected: still 'open' (not 'done')

SELECT COUNT(*) FROM asset_maintenances WHERE repair_request_id = 1;
-- Expected: 0 (no partial row)
```

---

## 7. Auth Test Tokens

> Never store real tokens in documentation. Use these patterns in test runs only.

### 7.1 Valid token (obtain at test runtime)
```bash
# Run once before test suite; capture token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "<ADMIN_PASSWORD>"}'
# Response contains token; use as: Authorization: Bearer <token>
```

### 7.2 No-token case (BB-015, BB-043, BB-052, BB-061, BB-084)
```
# Omit Authorization header entirely
# Expected: 401 Unauthorized for all protected endpoints
```

### 7.3 Invalid token (malformed)
```
Authorization: Bearer invalid.jwt.token
# Expected: 401 Unauthorized
```

### 7.4 Expired token
```
# Use a token generated > TOKEN_EXPIRY_HOURS hours ago (check .env.example for TOKEN_EXPIRY_HOURS)
# Expected: 401 Unauthorized
```
