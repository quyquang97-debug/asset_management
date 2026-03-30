/**
 * Create asset_disposals table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('asset_disposals', table => {
        table.increments('id').primary().unsigned();
        table.integer('asset_id').unsigned();
        table.date('disposal_date');
        table.decimal('disposal_price', 12, 2);
        table.string('received_by', 100);
        table.text('note');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
        table.foreign('asset_id').references('assets.id');
    });
};

/**
 * Drop asset_disposals table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('asset_disposals');
};
