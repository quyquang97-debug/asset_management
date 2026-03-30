/**
 * Create assets table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('assets', table => {
        table.increments('id').primary().unsigned();
        table.string('asset_code', 50).notNullable().unique();
        table.string('name', 255).notNullable();
        table.integer('asset_type_id').unsigned().notNullable();
        table.string('serial_number', 100);
        table.text('description');
        table.date('purchase_date').notNullable();
        table.date('start_use_date');
        table.enu('status', ['NEW', 'IN_USE', 'IN_REPAIR', 'MAINTENANCE', 'LOST', 'DAMAGED', 'RETIRED', 'DISPOSED']).notNullable();
        table.integer('location_id').unsigned().notNullable();
        table.date('warranty_expiry');
        table.string('supplier', 255);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
        table.foreign('asset_type_id').references('asset_types.id');
        table.foreign('location_id').references('locations.id');
    });
};

/**
 * Drop assets table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('assets');
};
