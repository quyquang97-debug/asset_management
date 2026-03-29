# TECHNICAL SPECIFICATION: REPAIR REQUESTS - ACTION & EVENTS

Tài liệu này mô tả chi tiết các sự kiện tương tác (Events) và luồng xử lý (Logic) cho màn hình modal Update Repair Request Status nhằm phục vụ việc sinh code tự động.

## A. ACTION DESCRIPTION (EVENT LOG)

### 1. Nhóm Hành động & Popup (Modal Interaction)
* **OnStatusChange (Logic đặc biệt):**
    * **Trigger:** Thay đổi giá trị trong Dropdown "Status" bên trong Modal Update Status.
    * **Logic nghiệp vụ:**
        * **Nếu Status = "done":** Kích hoạt (Enable) và đánh dấu bắt buộc (`*`) các trường: `Repair date`, `Description`, `Cost`, `Performed by`.
        * **Nếu Status != "done":** Vô hiệu hóa (Disable) và xóa giá trị các trường trên.
* **OnSaveButtonClick (Modal Submit):**
    * **Trigger:** Nhấn nút "Save" trong Modal.
    * **Action:** Gọi API `PATCH /api/v1/repairRequests/{id}/status`.
    * **Backend Logic:** Nếu `status` chuyển thành "done", thực hiện đồng thời việc cập nhật yêu cầu và tạo một bản ghi mới trong bảng `ASSET_MAINTENANCES`.
    * **Feedback:** Hiển thị thông báo thành công (đa ngữ VN/EN/JP), đóng Modal và làm mới (Refresh) Grid dữ liệu.