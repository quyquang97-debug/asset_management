/**
 * Seed asset_maintenances table.
 * Records linked to done repair_requests and done maintenance_requests.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('asset_maintenances').del().then(function () {
        return knex('asset_maintenances').insert([
            // Repair-type: linked to repair_request id=7 (done)
            {
                id: 1,
                asset_id: 9,
                repair_request_id: 7,
                maintenance_request_id: null,
                type: 'repair',
                maintenance_date: '2026-01-18',
                description: 'Gia cố chân bàn họp, thay bu-lông mới',
                cost: 500000.00,
                performed_by: 'Nguyễn Văn Thợ',
            },
            // Repair-type: linked to repair_request id=8 (done)
            {
                id: 2,
                asset_id: 5,
                repair_request_id: 8,
                maintenance_request_id: null,
                type: 'repair',
                maintenance_date: '2026-01-28',
                description: 'Reset máy photo, cập nhật firmware sửa lỗi E001',
                cost: 1200000.00,
                performed_by: 'Trần Kỹ Thuật',
            },
            // Maintenance-type: linked to maintenance_request id=1 (done)
            {
                id: 3,
                asset_id: 6,
                repair_request_id: null,
                maintenance_request_id: 1,
                type: 'maintenance',
                maintenance_date: '2026-02-15',
                description: 'Vệ sinh lọc gió, bổ sung gas R32, kiểm tra mạch điều khiển',
                cost: 800000.00,
                performed_by: 'Điện Lạnh Minh Tuấn',
            },
        ]);
    });
};
