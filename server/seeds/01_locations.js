/**
 * Seed locations table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('locations').del().then(function () {
        return knex('locations').insert([
            { id: 1, name: 'Tòa nhà A - Tầng 1', building: 'A', floor: 1, room: 'A101', status: 'USE' },
            { id: 2, name: 'Tòa nhà A - Tầng 2', building: 'A', floor: 2, room: 'A201', status: 'USE' },
            { id: 3, name: 'Tòa nhà B - Tầng 1', building: 'B', floor: 1, room: 'B101', status: 'USE' },
            { id: 4, name: 'Tòa nhà B - Tầng 3', building: 'B', floor: 3, room: 'B305', status: 'USE' },
            { id: 5, name: 'Kho vật tư', building: 'C', floor: 1, room: 'C001', status: 'USE' },
            { id: 6, name: 'Phòng máy chủ', building: 'A', floor: 3, room: 'A301', status: 'USE' },
            { id: 7, name: 'Khu vực ngoài trời', building: null, floor: null, room: null, status: 'NOT_USE' },
        ]);
    });
};
