/**
 * Create maintenance_requests table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('maintenance_requests', table => {
        table.increments('id').primary().unsigned();
        table.integer('asset_id').unsigned();
        table.integer('plan_id').unsigned().nullable();
        table.date('scheduled_date');
        table.enu('status', ['open', 'in_progress', 'done', 'cancelled']);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
        table.foreign('asset_id').references('assets.id');
        table.foreign('plan_id').references('maintenance_plans.id');
    });
};

/**
 * Drop maintenance_requests table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('maintenance_requests');
};
