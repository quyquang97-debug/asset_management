/**
 * Seed audits_items table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('audits_items').del().then(function () {
        return knex('audits_items').insert([
            // Audit 1 (completed Jan-2026): scanned 5 assets
            { id: 1, audit_id: 1, asset_id: 1, scanned_at: '2026-01-15 09:00:00', result: 'Đủ - Đang sử dụng tốt' },
            { id: 2, audit_id: 1, asset_id: 2, scanned_at: '2026-01-15 09:15:00', result: 'Đủ - Đang sử dụng tốt' },
            { id: 3, audit_id: 1, asset_id: 3, scanned_at: '2026-01-15 09:30:00', result: 'Đủ - Đang sử dụng tốt' },
            { id: 4, audit_id: 1, asset_id: 4, scanned_at: '2026-01-15 09:45:00', result: 'Hỏng - Đang sửa chữa' },
            { id: 5, audit_id: 1, asset_id: 5, scanned_at: '2026-01-15 10:00:00', result: 'Đủ - Đang sử dụng tốt' },
            // Audit 2 (in_progress Mar-2026): partial scan
            { id: 6, audit_id: 2, asset_id: 6, scanned_at: '2026-03-01 14:00:00', result: 'Đủ - Đang sử dụng tốt' },
            { id: 7, audit_id: 2, asset_id: 7, scanned_at: '2026-03-01 14:20:00', result: 'Đủ - Đang sử dụng tốt' },
            { id: 8, audit_id: 2, asset_id: 8, scanned_at: '2026-03-01 14:40:00', result: 'Đủ - Mới nhập kho' },
        ]);
    });
};
