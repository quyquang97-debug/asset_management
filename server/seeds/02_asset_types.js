/**
 * Seed asset_types table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('asset_types').del().then(function () {
        return knex('asset_types').insert([
            { id: 1, code: 'CNTT', name: 'Thiết bị CNTT' },
            { id: 2, code: 'VP', name: 'Thiết bị văn phòng' },
            { id: 3, code: 'NN', name: 'Thiết bị ngoại vi' },
            { id: 4, code: 'ND', name: 'Nội thất' },
            { id: 5, code: 'XE', name: 'Phương tiện vận chuyển' },
            { id: 6, code: 'DL', name: 'Thiết bị điện lạnh' },
        ]);
    });
};
