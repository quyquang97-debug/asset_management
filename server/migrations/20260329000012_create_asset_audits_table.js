/**
 * Create asset_audits table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('asset_audits', table => {
        table.increments('id').primary().unsigned();
        table.date('audit_date');
        table.string('status', 50);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
    });
};

/**
 * Drop asset_audits table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('asset_audits');
};
