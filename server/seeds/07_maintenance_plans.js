/**
 * Seed maintenance_plans table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('maintenance_plans').del().then(function () {
        return knex('maintenance_plans').insert([
            { id: 1, asset_type_id: 1, name: 'Bảo trì thiết bị CNTT định kỳ', frequency_days: 180, description: 'Vệ sinh, kiểm tra phần cứng thiết bị CNTT 6 tháng/lần' },
            { id: 2, asset_type_id: 2, name: 'Bảo dưỡng máy in, máy photo', frequency_days: 90, description: 'Vệ sinh đầu in, thay mực, kiểm tra trục quét 3 tháng/lần' },
            { id: 3, asset_type_id: 6, name: 'Bảo dưỡng điều hòa', frequency_days: 180, description: 'Vệ sinh lọc gió, kiểm tra gas, bảo dưỡng định kỳ' },
        ]);
    });
};
