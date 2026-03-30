/**
 * Seed asset_audits table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('asset_audits').del().then(function () {
        return knex('asset_audits').insert([
            { id: 1, audit_date: '2026-01-15', status: 'completed' },
            { id: 2, audit_date: '2026-03-01', status: 'in_progress' },
        ]);
    });
};
