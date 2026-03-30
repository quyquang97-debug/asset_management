/**
 * Create audits_items table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('audits_items', table => {
        table.increments('id').primary().unsigned();
        table.integer('audit_id').unsigned();
        table.integer('asset_id').unsigned();
        table.datetime('scanned_at');
        table.string('result', 100);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
        table.foreign('audit_id').references('asset_audits.id');
        table.foreign('asset_id').references('assets.id');
    });
};

/**
 * Drop audits_items table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('audits_items');
};
