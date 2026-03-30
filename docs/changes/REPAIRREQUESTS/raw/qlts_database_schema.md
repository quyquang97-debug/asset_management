# Database Schema - Quản Lý Tài Sản (QLTS)

> **Database:** `asset_management`
> **Ngày tạo:** 07/03/2026

---

## Tổng quan cấu trúc

### Master Data
- `asset_types` — Phân loại tài sản
- `departments` — Phòng ban
- `locations` — Vị trí

### Core Data
- `assets` — Tài sản
- `employees` — Nhân viên

### Transaction
- `asset_assignments` — Cấp phát tài sản
- `maintenance_plans` — Kế hoạch bảo trì
- `repair_requests` — Yêu cầu sửa chữa
- `maintenance_requests` — Yêu cầu bảo trì
- `asset_maintenances` — Chi tiết bảo trì & sửa chữa
- `asset_disposals` — Thanh lý tài sản

### Audit
- `asset_audits` — Kỳ kiểm kê
- `audits_items` — Chi tiết kiểm kê

---

## Quan hệ giữa các bảng

```
departments
    | 1 --- n
employees
    | 1 --- n
asset_assignments
    | n --- 1
assets
    | n --- 1
asset_types
```

---

## Chi tiết các bảng

### 1. `LOCATIONS`
> Thông tin vị trí

| Column | Type | PK | Not Null | Unique | Description |
|--------|------|----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | ✓ | | | Khóa chính |
| name | VARCHAR | | ✓ | | Tên vị trí |
| building | VARCHAR | | | | Tòa nhà |
| floor | INT | | | | Tầng |
| room | VARCHAR | | | | Phòng |
| status | ENUM | | | | `USE`, `NOT_USE` |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

### 2. `ASSET_TYPES`
> Phân loại các loại tài sản theo nhóm

| Column | Type | PK | Not Null | Unique | Description |
|--------|------|----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | ✓ | | | Khóa chính |
| code | VARCHAR(50) | | ✓ | ✓ | VD: LAP, AIR, TAB… |
| name | VARCHAR(200) | | ✓ | | Tên loại tài sản |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

### 3. `DEPARTMENTS`
> Thông tin phòng ban, bộ phận

| Column | Type | PK | Not Null | Unique | Description |
|--------|------|----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | ✓ | | | Khóa chính |
| name | VARCHAR(100) | | ✓ | | Tên phòng ban |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

### 4. `ASSETS`
> Chứa thông tin mô tả tài sản

| Column | Type | Key | Not Null | Unique | Description |
|--------|------|-----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | PK | | | Khóa chính |
| asset_code | VARCHAR(50) | | ✓ | ✓ | VD: LAP-2026-08-1 |
| name | VARCHAR(255) | | ✓ | | Tên tài sản |
| asset_type_id | INT | FK | ✓ | | 01: Laptop / 02: Điều hòa / 03:… |
| serial_number | VARCHAR(100) | | | | Số serial |
| description | TEXT | | | | Mô tả |
| purchase_date | DATE | | ✓ | | Ngày mua |
| start_use_date | DATE | | | | Ngày bắt đầu sử dụng |
| status | ENUM | | ✓ | | Xem bên dưới |
| location_id | INT | FK | ✓ | | Tầng 1, 2, 3 |
| warranty_expiry | DATE | | | | Hạn bảo hành |
| supplier | VARCHAR(255) | | | | Nhà cung cấp |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

**Giá trị ENUM `status`:**

| Giá trị | Mô tả |
|---------|-------|
| `NEW` | Mới |
| `IN_USE` | Đang sử dụng |
| `IN_REPAIR` | Đang sửa chữa |
| `MAINTENANCE` | Bảo dưỡng định kỳ |
| `LOST` | Mất |
| `DAMAGED` | Hỏng nhưng chưa sửa |
| `RETIRED` | Ngừng sử dụng |
| `DISPOSED` | Đã thanh lý |

---

### 5. `EMPLOYEES`
> Chứa thông tin nhân viên

| Column | Type | PK | Not Null | Unique | Description |
|--------|------|----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | ✓ | | | Khóa chính |
| employee_code | VARCHAR(20) | | ✓ | | Mã nhân viên |
| full_name | VARCHAR(100) | | ✓ | | Họ tên |
| email | VARCHAR(100) | | ✓ | | Email |
| phone | VARCHAR(20) | | | | Số điện thoại |
| gender | ENUM | | ✓ | | `male`, `female`, `other` |
| date_of_birth | DATE | | ✓ | | Ngày sinh |
| department | VARCHAR(100) | | ✓ | | Phòng ban |
| position | VARCHAR(100) | | ✓ | | Vị trí |
| job_title | VARCHAR(100) | | ✓ | | Chức danh |
| manager_id | INT | FK | | | Quản lý trực tiếp |
| employment_status | ENUM | | | | `probation`, `official`, `resigned` |
| probation_date | DATE | | ✓ | | Ngày thử việc |
| official_date | DATE | | | | Ngày chính thức |
| address | VARCHAR(255) | | | | Địa chỉ |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

### 6. `ASSET_ASSIGNMENTS`
> Cấp phát tài sản cho nhân viên

| Column | Type | Key | Not Null | Unique | Description |
|--------|------|-----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | PK | | | Khóa chính |
| asset_id | INT | FK | ✓ | | Khóa ngoại tới bảng assets |
| assignment_by | INT | FK | ✓ | | Nhân viên cấp phát tài sản |
| employee_id | INT | FK | | | Nhân viên đang sử dụng tài sản |
| department_id | INT | FK | | | Phòng ban đang sử dụng tài sản |
| assigned_date | DATE | | ✓ | | Ngày bàn giao |
| returned_date | DATE | | | | Ngày trả tài sản (`NULL` = đang sử dụng, `!= NULL` = thu hồi) |
| note | TEXT | | | | Ghi chú |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

### 7. `REPAIR_REQUESTS`
> Tạo yêu cầu sửa thiết bị bị hỏng hóc

| Column | Type | Key | Not Null | Unique | Description |
|--------|------|-----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | PK | | | Khóa chính |
| asset_id | INT | FK | ✓ | | Tài sản cần sửa |
| requested_by | INT | FK | ✓ | | Nhân viên tạo yêu cầu |
| description | TEXT | | | | Mô tả lỗi |
| request_date | DATE | | ✓ | | Ngày tạo yêu cầu |
| status | ENUM | | ✓ | | `open`, `in_progress`, `done`, `cancelled` |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

**Luồng trạng thái:**

```
open → in_progress → done
              ↓
          cancelled
```

| Trạng thái | Mô tả | Ghi chú |
|------------|-------|---------|
| `open` | Yêu cầu vừa được tạo | Nhân viên báo hỏng |
| `in_progress` | Đang sửa | GA giao kỹ thuật sửa → cập nhật `ASSETS.status = IN_REPAIR` |
| `done` | Sửa xong | |
| `cancelled` | Đã hủy | Chỉ cập nhật trạng thái bảng `REPAIR_REQUESTS` |

---

### 8. `MAINTENANCE_PLANS`
> Tạo kế hoạch bảo trì tự động, tự tính lần bảo trì tiếp theo, tự generate `maintenance_requests`

> **Note:** Trường hợp không cần tạo lịch bảo trì tự động có thể bỏ qua bảng này, chỉ quan tâm `MAINTENANCE_REQUESTS`.

| Column | Type | Key | Not Null | Unique | Description |
|--------|------|-----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | PK | | | Khóa chính |
| asset_type_id | INT | FK | ✓ | | Loại tài sản (Laptop, Điều hòa…) |
| name | VARCHAR(100) | | ✓ | | Tên kế hoạch |
| frequency_days | INT | | ✓ | | Chu kỳ bảo trì (30 ngày…) |
| description | TEXT | | | | Mô tả |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

### 9. `MAINTENANCE_REQUESTS`
> Tạo yêu cầu bảo trì

| Column | Type | Key | Not Null | Unique | Description |
|--------|------|-----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | PK | | | Khóa chính |
| asset_id | INT | FK | ✓ | | Tài sản |
| plan_id | INT | FK | | | Kế hoạch bảo trì (`NULL` = bất thường, `<> NULL` = tự động từ plan) |
| scheduled_date | DATE | | ✓ | | Ngày dự kiến |
| status | ENUM | | | | `open`, `in_progress`, `done`, `cancelled` |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

**Luồng trạng thái:**

```
open → in_progress → done
              ↓
          cancelled
```

| Trạng thái | Mô tả | Ghi chú |
|------------|-------|---------|
| `open` | Yêu cầu vừa được tạo | Khi phát sinh nhu cầu bảo trì |
| `in_progress` | Đang bảo trì | GA giao kỹ thuật → cập nhật `ASSETS.status = MAINTENANCE` |
| `done` | Hoàn thành | |
| `cancelled` | Đã hủy | |

**Cách tạo yêu cầu bảo trì:**
- Tạo 1 lần cho nhiều tài sản: chọn `Asset type` (VD: PC) + `Asset: --tất cả--`
- Tạo 1 lần cho 1 tài sản: chọn `Asset type` (VD: PC) + `Asset: PC202603001`

---

### 10. `ASSET_MAINTENANCES`
> Chi tiết sửa chữa và bảo trì theo tài sản

| Column | Type | Key | Not Null | Unique | Description |
|--------|------|-----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | PK | | | Khóa chính |
| asset_id | INT | FK | ✓ | | Tài sản |
| repair_request_id | INT | FK | | | Liên kết yêu cầu sửa |
| maintenance_request_id | INT | FK | | | Liên kết yêu cầu bảo trì |
| type | ENUM | | | | `repair`, `maintenance` |
| maintenance_date | DATE | | ✓ | | Ngày thực hiện |
| description | TEXT | | | | Chi tiết công việc |
| cost | DECIMAL(12,2) | | | | Chi phí |
| performed_by | VARCHAR(100) | | | | Người thực hiện |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

### 11. `ASSET_DISPOSALS`
> Tài sản thanh lý

| Column | Type | Key | Not Null | Unique | Description |
|--------|------|-----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | PK | | | Khóa chính |
| asset_id | INT | FK | ✓ | | Tài sản |
| disposal_date | DATE | | ✓ | | Ngày thanh lý |
| disposal_price | DECIMAL(12,2) | | ✓ | | Giá thanh lý |
| received_by | VARCHAR(100) | | | | Người nhận tiền |
| note | TEXT | | | | Ghi chú |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

### 12. `ASSET_AUDITS`
> Tạo kỳ kiểm kê

| Column | Type | Key | Not Null | Unique | Description |
|--------|------|-----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | PK | | | Khóa chính |
| audit_date | DATE | | ✓ | | Ngày kiểm kê |
| created_by | INT | FK | ✓ | | User tạo |
| status | ENUM | | ✓ | | Trạng thái kiểm kê |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

### 13. `AUDITS_ITEMS`
> Chi tiết kiểm kê từng tài sản

| Column | Type | Key | Not Null | Unique | Description |
|--------|------|-----|----------|--------|-------------|
| id | INT AUTO_INCREMENT | PK | | | Khóa chính |
| audit_id | CHAR(36) | FK | ✓ | | Liên kết bảng `asset_audits` |
| asset_id | INT | FK | ✓ | | Tài sản |
| scanned_at | TIMESTAMP | | | | Thời gian quét |
| result | ENUM | | ✓ | | Kết quả kiểm kê |
| created_at | DATETIME | | ✓ | | Thời gian tạo |
| created_by | INT | |  | | Tạo bởi user |
| updated_at | DATETIME | | ✓ | | Thời gian cập nhật |
| updated_by | INT | |  | | Cập nhật bởi user|

---

## SQL Tạo Bảng
```sql
CREATE DATABASE asset_management;
USE asset_management;

CREATE TABLE asset_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT   
);

CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'tên vị trí',
    building VARCHAR(255) COMMENT 'tòa nhà',
    floor INT COMMENT 'tầng',
    room VARCHAR(100) COMMENT 'phòng',
    status ENUM('USE', 'NOT_USE') DEFAULT 'USE' COMMENT 'USE, NOT USE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT   
);

CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'VD: LAP-2026-08-1',
    name VARCHAR(255) NOT NULL,
    asset_type_id INT NOT NULL COMMENT '01: Laptop / 02: Điều hòa / ...',
    serial_number VARCHAR(100),
    description TEXT,
    purchase_date DATE NOT NULL,
    start_use_date DATE,
    status ENUM(
        'NEW',
        'IN_USE',
        'IN_REPAIR',
        'MAINTENANCE',
        'LOST',
        'DAMAGED',
        'RETIRED',
        'DISPOSED'
    ) NOT NULL,
    location_id INT NOT NULL COMMENT 'FK tới bảng locations',
    warranty_expiry DATE,
    supplier VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT,   
    CONSTRAINT fk_asset_location
        FOREIGN KEY (location_id) REFERENCES locations(id),
    CONSTRAINT fk_asset_type
        FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
);

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT   
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20),
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    gender ENUM('male','female','other'),
    date_of_birth DATE,
    department_id INT,
    position VARCHAR(100),
    job_title VARCHAR(100),
    manager_id INT,
    employment_status ENUM('probation','official','resigned'),
    probation_date DATE,
    official_date DATE,
    address VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT,   
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);

CREATE TABLE asset_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    employee_id INT,
    assigned_date DATE,
    returned_date DATE,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT,   
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE repair_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    requested_by INT,
    description TEXT,
    request_date DATE,
    status ENUM('open','in_progress','done','cancelled'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT,  
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (requested_by) REFERENCES employees(id)
);

CREATE TABLE maintenance_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_type_id INT,
    name VARCHAR(255),
    frequency_days INT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT,   
    FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
);

CREATE TABLE maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    plan_id INT,
    scheduled_date DATE,
    status ENUM('open','in_progress','done','cancelled'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT,   
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (plan_id) REFERENCES maintenance_plans(id)
);

CREATE TABLE asset_maintenances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    repair_request_id INT,
    maintenance_request_id INT,
    type ENUM('repair','maintenance'),
    maintenance_date DATE,
    description TEXT,
    cost DECIMAL(12,2),
    performed_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT,   
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (repair_request_id) REFERENCES repair_requests(id),
    FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id)
);

CREATE TABLE asset_disposals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    disposal_date DATE,
    disposal_price DECIMAL(12,2),
    received_by VARCHAR(100),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE TABLE asset_audits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audit_date DATE,
    status VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT   
);

CREATE TABLE audits_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    audit_id INT,
    asset_id INT,
    scanned_at DATETIME,
    result VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'thời gian tạo',
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'thời gian cập nhật' ,
    updated_by INT,   
    FOREIGN KEY (audit_id) REFERENCES asset_audits(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);
```

---

## Index

```sql
-- assets
CREATE INDEX idx_asset_code ON assets(asset_code);
CREATE INDEX idx_asset_type ON assets(asset_type_id);
CREATE INDEX idx_asset_status ON assets(status);

-- employees
CREATE INDEX idx_employee_department ON employees(department_id);
CREATE INDEX idx_employee_manager ON employees(manager_id);

-- asset_assignments
CREATE INDEX idx_assignment_asset ON asset_assignments(asset_id);
CREATE INDEX idx_assignment_employee ON asset_assignments(employee_id);

-- repair_requests
CREATE INDEX idx_repair_asset ON repair_requests(asset_id);
CREATE INDEX idx_repair_status ON repair_requests(status);

-- maintenance_requests
CREATE INDEX idx_maintenance_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_plan ON maintenance_requests(plan_id);

-- audits_items
CREATE INDEX idx_audit_asset ON audit_items(asset_id);
CREATE INDEX idx_audit_id ON audit_items(audit_id);
```
