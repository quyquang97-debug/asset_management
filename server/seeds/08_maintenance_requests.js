/**
 * Seed maintenance_requests table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.seed = function (knex) {
    return knex('maintenance_requests').del().then(function () {
        return knex('maintenance_requests').insert([
            { id: 1, asset_id: 6, plan_id: 3, scheduled_date: '2026-02-15', status: 'done' },
            { id: 2, asset_id: 5, plan_id: 2, scheduled_date: '2026-03-01', status: 'in_progress' },
            { id: 3, asset_id: 1, plan_id: 1, scheduled_date: '2026-04-01', status: 'open' },
        ]);
    });
};
