/**
 * Seed asset_assignments table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('asset_assignments').del().then(function () {
        return knex('asset_assignments').insert([
            { id: 1, asset_id: 1, employee_id: 3, assigned_date: '2023-01-20', returned_date: null, note: 'Cấp phát cho kỹ sư hệ thống' },
            { id: 2, asset_id: 2, employee_id: 4, assigned_date: '2022-06-15', returned_date: null, note: 'Cấp cho trưởng phòng kế toán' },
            { id: 3, asset_id: 3, employee_id: 6, assigned_date: '2023-03-05', returned_date: null, note: 'Màn hình phụ cho nhân viên kinh doanh' },
            { id: 4, asset_id: 8, employee_id: 7, assigned_date: '2024-01-15', returned_date: null, note: 'Laptop cho trưởng phòng kỹ thuật' },
            { id: 5, asset_id: 5, employee_id: 5, assigned_date: '2022-11-10', returned_date: null, note: 'Máy photo hành chính' },
        ]);
    });
};
