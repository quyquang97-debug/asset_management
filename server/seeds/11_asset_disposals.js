/**
 * Seed asset_disposals table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('asset_disposals').del().then(function () {
        return knex('asset_disposals').insert([
            {
                id: 1,
                asset_id: 9,
                disposal_date: '2026-02-01',
                disposal_price: 0.00,
                received_by: 'Công ty Thu hồi Phế liệu ABC',
                note: 'Bàn họp hư hỏng nặng, thanh lý giá 0 đồng',
            },
        ]);
    });
};
