/**
 * Seed departments table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('departments').del().then(function () {
        return knex('departments').insert([
            { id: 1, name: 'Ban Giám đốc' },
            { id: 2, name: 'Phòng Công nghệ thông tin' },
            { id: 3, name: 'Phòng Kế toán - Tài chính' },
            { id: 4, name: 'Phòng Hành chính - Nhân sự' },
            { id: 5, name: 'Phòng Kinh doanh' },
            { id: 6, name: 'Phòng Kỹ thuật' },
        ]);
    });
};
