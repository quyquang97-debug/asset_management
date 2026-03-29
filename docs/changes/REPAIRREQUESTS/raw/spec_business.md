# Technical Specification: REPAIR REQUESTS Module

## A. Action & Interaction (Events)

### 1. Search & Filter Group
* **Autocomplete Search Asset:** - Khi người dùng nhập ký tự vào ô `Asset Code` .
    - Hệ thống gọi API gợi ý danh sách tài sản cho Autocomplete: GET /api/v1/assets/searchbyCodeOrName/{query}
    - Kết quả hiển thị trong dropdown theo format: `[Asset code] - [Name]`, khi item được chọn thì asset_id được chọn.
* **Autocomplete Search Employee:** - Khi người dùng nhập ký tự vào ô `Requested by`.
    - Hệ thống gọi API gợi ý danh sách nhân viên cho Autocomplete: GET /api/v1/employees/searchbyCodeOrName/{query}
    - Kết quả hiển thị trong dropdown theo format: `[Employee code] - [Name]`, khi item được chọn thì employee_id được chọn..    
* **Search Execution:** - Kích hoạt khi nhấn nút "Search" hoặc thay đổi trang (Pagination).
    - Thu thập dữ liệu từ 3 fields: `assetId`, `requestedBy`, `status`.
    - Thực hiện gọi API `POST /api/v1/repairRequests/search`.
    - Nếu kết quả trả về là 0 items thì hiển thị thông báo [Repair request does not exist.]
* **Clear Form:** - Khi nhấn nút "Clear", reset tất cả các ô nhập liệu về giá trị mặc định và reload lại lưới như mặc định.
    - Tự động thực hiện lại lệnh Search để cập nhật Grid về trạng thái ban đầu.

### 2. Grid Interactions
* **Bulk Selection:** - Checkbox tại header cho phép chọn/bỏ chọn tất cả các dòng trên trang hiện tại.
* **View/Edit/Delete Actions:**
    - **View:** Mở Popup ở chế độ Read-only.
    - **Edit:** Mở Popup và fill dữ liệu của item được chọn vào các input để chỉnh sửa, trường id chỉ đọc.
    - **Delete:** : 
        - Trường hợp có chọn items:
            Hiển thị Confirm Modal [Delete ({n} items). Are you sure?]trước khi xóa. Trong đó n là số items được chọn. Modal bao gồm 2 nút OK, Cancel:
            - Nếu nhấn OK để xác nhận đồng ý thì gọi API để xóa các items được chọn. 
            - Nếu nhấn Cancel thì tắt Confirm Modal và không thực hiện gì

        - Trường hợp không chọn item:
            Thì hiển thị thông báo [Please select the items to delete.], Thông báo chỉ có 1 nút OK, kích nút OK thì tắt thông báo.
            
### 3. Update Status Logic (Critical Event)
* **Status Switching:** - Trong Popup Update Status, khi thay đổi dropdown `Status`.
    - Nếu giá trị là `done`: Mở khóa (Enable) các trường: `Repair date`, `Description`, `Cost`, `Performed by`.
    - Nếu giá trị khác `done`: Khóa (Disable) và xóa trắng dữ liệu các trường trên.
* **Submit Update:**
    - Thực hiện lưu trạng thái. Nếu là `done`, hệ thống đồng thời phải tạo bản ghi mới vào bảng `ASSET_MAINTENANCES`.

---

## B. Validation Rules

### 1. General Validation
* **Autocomplete fields:** Bắt buộc chọn từ danh sách gợi ý, không chấp nhận giá trị text tự do không có ID.
* **Required fields (Add/Edit):** `Asset Code`, `Requested by`, `Request date` không được để trống.

### 2. Specific Logic Validation
* **Date Constraints:** - `Request date` ≤ Ngày hiện tại.
    - `Repair date` (khi status = done) ≥ `Request date`.
* **Financial Data:** - `Cost` (khi status = done) phải là số dương (Positive Number).
* **Conditional Required:** - Khi Status là `done`, các trường `Repair date`, `Cost`, `Performed by` bắt buộc phải nhập.

---

## C. Business Logic & Data Model

### 1. Involved Tables
* **REPAIR_REQUESTS:** ID, asset_id (FK), requested_by (FK), request_date, status (ENUM: pending, fixing, done, cancel), description.
* **EMPLOYEES:** ID, employee_code, name.

---

## D. API Structure

### 1. Search & Autocomplete
* `POST /api/v1/repairRequests/search`
    - Body: `{ assetId, requestedBy, status, page, pageSize }`
* `GET /api/v1/assets/searchbyCodeOrName/{query}`
* `GET /api/v1/employees/searchbyCodeOrName/{query}`

### 2. CRUD & Maintenance
* `GET /api/v1/repairRequests/{id}` (View detail)
* `POST /api/v1/repairRequests` (Add new)
* `PUT /api/v1/repairRequests/{id}` (Edit)
* `DELETE /api/v1/repairRequests` (Bulk delete, Body: `{ ids: [] }`)
* `PATCH /api/v1/repairRequests/{id}/status` 
    - Body: `{ status, repairDate, cost, performedBy, description }`