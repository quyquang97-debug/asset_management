/**
 * Create asset_maintenances table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('asset_maintenances', table => {
        table.increments('id').primary().unsigned();
        table.integer('asset_id').unsigned();
        table.integer('repair_request_id').unsigned().nullable();
        table.integer('maintenance_request_id').unsigned().nullable();
        table.enu('type', ['repair', 'maintenance']);
        table.date('maintenance_date').notNullable();
        table.text('description');
        table.decimal('cost', 12, 2);
        table.string('performed_by', 100);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
        table.foreign('asset_id').references('assets.id');
        table.foreign('repair_request_id').references('repair_requests.id');
        table.foreign('maintenance_request_id').references('maintenance_requests.id');
    });
};

/**
 * Drop asset_maintenances table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('asset_maintenances');
};
