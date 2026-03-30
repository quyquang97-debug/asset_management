/**
 * Create maintenance_plans table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('maintenance_plans', table => {
        table.increments('id').primary().unsigned();
        table.integer('asset_type_id').unsigned();
        table.string('name', 255);
        table.integer('frequency_days');
        table.text('description');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
        table.foreign('asset_type_id').references('asset_types.id');
    });
};

/**
 * Drop maintenance_plans table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('maintenance_plans');
};
