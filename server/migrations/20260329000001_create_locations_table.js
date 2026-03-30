/**
 * Create locations table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('locations', table => {
        table.increments('id').primary().unsigned();
        table.string('name', 255).notNullable();
        table.string('building', 255);
        table.integer('floor');
        table.string('room', 100);
        table.enu('status', ['USE', 'NOT_USE']).defaultTo('USE');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
    });
};

/**
 * Drop locations table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('locations');
};
