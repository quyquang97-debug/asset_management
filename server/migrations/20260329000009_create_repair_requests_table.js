/**
 * Create repair_requests table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('repair_requests', table => {
        table.increments('id').primary().unsigned();
        table.integer('asset_id').unsigned();
        table.integer('requested_by').unsigned();
        table.text('description');
        table.date('request_date').notNullable();
        table.enu('status', ['open', 'in_progress', 'done', 'cancelled']).defaultTo('open');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
        table.foreign('asset_id').references('assets.id');
        table.foreign('requested_by').references('employees.id');
    });
};

/**
 * Drop repair_requests table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('repair_requests');
};
