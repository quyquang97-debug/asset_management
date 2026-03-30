/**
 * Create asset_assignments table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('asset_assignments', table => {
        table.increments('id').primary().unsigned();
        table.integer('asset_id').unsigned();
        table.integer('employee_id').unsigned();
        table.date('assigned_date');
        table.date('returned_date');
        table.text('note');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
        table.foreign('asset_id').references('assets.id');
        table.foreign('employee_id').references('employees.id');
    });
};

/**
 * Drop asset_assignments table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('asset_assignments');
};
