# TECHNICAL SPECIFICATION: MODAL EDIT REPAIR REQUEST - ACTION & EVENTS

Tài liệu này mô tả chi tiết các sự kiện tương tác và quy tắc nghiệp vụ dành riêng cho giao diện Thêm mới và chỉnh sửa yêu cầu sửa chữa (Add Repair Request/Edit Repair Request).

## A. ACTION DESCRIPTION (MODAL EDIT EVENTS)

### 1. Sự kiện Khởi tạo (Initialization)
* **OnOpenAddModal:**
    * **Trigger:** Người dùng nhấn vào nút Add.
    * **Init màn hình:** * Không hiển thị trường **ID** trên form.

* **OnOpenEditModal:**
    * **Trigger:** Người dùng nhấn vào biểu tượng 📝 (Edit) tại cột Action của một dòng trong bảng dữ liệu.
    * **Action:** Hệ thống gọi API `GET /api/v1/repairRequests/{id}` để lấy thông tin chi tiết.
    * **Logic đổ dữ liệu:** * Hiển thị giá trị **ID** của bản ghi dưới dạng nhãn văn bản (Read-only).
        * Điền dữ liệu hiện có vào các trường: **Asset Code**, **Requested by**, **Description**, và **Request date**.

### 2. Sự kiện Nhập liệu & Kiểm tra (Input & Validation)
* **OnFieldChange:**
    * **Trigger:** Người dùng thay đổi nội dung trong các ô nhập liệu.
    * **Validation:** * Các trường bắt buộc phải có dấu `(*)` bao gồm: Asset Code, Requested by, và Request date.
        * Nếu người dùng xóa hết nội dung trong các trường này, hệ thống phải hiển thị thông báo lỗi màu đỏ ngay bên dưới (ví dụ: "Asset Code is required").
* **OnAutocompleteSearch:**
    * **Logic:** Hỗ trợ tìm kiếm và chọn lại mã tài sản hoặc nhân viên tương tự như chức năng tại Modal Add.

### 3. Sự kiện Kết thúc & Cập nhật (Footer Actions)
* **OnSaveButtonClick:**
    * **Trigger:** Người dùng nhấn nút "Save" (Màu xanh `#016242`).
    * **Action:** Trường hợp thêm mới thì gọi API `POST /api/v1/repairRequests` 
    * **Action:** Trường hợp chỉnh sửa thì gọi API `PUT /api/v1/repairRequests/{id}` 
    * **Feedback:** * Nếu thành công: Hiển thị thông báo [Cập nhật thành công], đóng Modal và làm mới (Refresh) dữ liệu tại bảng chính.
        * Nếu lỗi: Giữ nguyên Modal và hiển thị thông báo lỗi chi tiết từ Server.
* **OnCloseButtonClick / OnXClick:**
    * **Trigger:** Người dùng nhấn nút "Close" (Màu xám) hoặc biểu tượng (X) ở góc phải phía trên.
    * **Action:** Đóng Modal ngay lập tức và hủy bỏ mọi thay đổi vừa nhập.

## B. UI/UX CONSTRAINTS FOR CLAUDE CODE
* **Trường ID:** Phải hiển thị ở dạng text, không nằm trong ô input để người dùng không thể chỉnh sửa.
* **Định dạng hiển thị:** Các trường Autocomplete (Asset Code, Requested by) nên hiển thị theo format `[Mã] - [Tên]` để tăng tính nhận diện.
* **Date Picker:** Trường Request date phải sử dụng component chọn ngày kèm biểu tượng lịch.