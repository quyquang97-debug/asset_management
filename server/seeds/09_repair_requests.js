/**
 * Seed repair_requests table.
 * Covers all status values: open, in_progress, done, cancelled.
 * Provides enough data to test autocomplete (search by asset/employee),
 * pagination (10+ records), and status transitions.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('repair_requests').del().then(function () {
        return knex('repair_requests').insert([
            // open — available for edit + updateStatus
            {
                id: 1,
                asset_id: 4,
                requested_by: 5,
                description: 'Máy in Canon LBP 2900 bị kẹt giấy liên tục, không in được',
                request_date: '2026-03-01',
                status: 'open',
            },
            {
                id: 2,
                asset_id: 2,
                requested_by: 4,
                description: 'Máy tính HP ProDesk 400 khởi động chậm, quạt kêu to',
                request_date: '2026-03-10',
                status: 'open',
            },
            {
                id: 3,
                asset_id: 10,
                requested_by: 3,
                description: 'Switch Cisco tầng 1 mất 2 port, mạng không ổn định',
                request_date: '2026-03-15',
                status: 'open',
            },
            {
                id: 4,
                asset_id: 6,
                requested_by: 7,
                description: 'Điều hòa phòng máy chủ không lạnh, cần kiểm tra gas',
                request_date: '2026-03-20',
                status: 'open',
            },
            // in_progress — edit disabled, updateStatus available (→ done only)
            {
                id: 5,
                asset_id: 1,
                requested_by: 3,
                description: 'Laptop Dell Latitude 5420 màn hình bị sọc ngang, cần thay',
                request_date: '2026-02-15',
                status: 'in_progress',
            },
            {
                id: 6,
                asset_id: 3,
                requested_by: 6,
                description: 'Màn hình Samsung có điểm chết, hình ảnh không đều',
                request_date: '2026-02-20',
                status: 'in_progress',
            },
            // done — edit disabled, updateStatus disabled
            {
                id: 7,
                asset_id: 9,
                requested_by: 5,
                description: 'Bàn họp bị gãy chân, cần gia cố hoặc thay mới',
                request_date: '2026-01-10',
                status: 'done',
            },
            {
                id: 8,
                asset_id: 5,
                requested_by: 4,
                description: 'Máy photo Toshiba lỗi E001, không photo được',
                request_date: '2026-01-20',
                status: 'done',
            },
            // cancelled — both disabled
            {
                id: 9,
                asset_id: 7,
                requested_by: 2,
                description: 'Server PowerEdge T340 cần nâng RAM, yêu cầu đã hủy do ngân sách',
                request_date: '2026-01-05',
                status: 'cancelled',
            },
            {
                id: 10,
                asset_id: 8,
                requested_by: 7,
                description: 'Laptop Lenovo ThinkPad E14 bàn phím bị liệt vài phím',
                request_date: '2026-02-01',
                status: 'cancelled',
            },
            // Extra records to test pagination (pageSize defaults to 10)
            {
                id: 11,
                asset_id: 2,
                requested_by: 3,
                description: 'Máy tính HP bị nhiễm virus, cần cài lại hệ điều hành',
                request_date: '2026-03-25',
                status: 'open',
            },
            {
                id: 12,
                asset_id: 1,
                requested_by: 8,
                description: 'Laptop Dell pin chai, chỉ dùng được 30 phút',
                request_date: '2026-03-26',
                status: 'open',
            },
        ]);
    });
};
