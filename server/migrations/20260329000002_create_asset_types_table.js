/**
 * Create asset_types table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('asset_types', table => {
        table.increments('id').primary().unsigned();
        table.string('code', 20).unique();
        table.string('name', 100);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
    });
};

/**
 * Drop asset_types table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('asset_types');
};
