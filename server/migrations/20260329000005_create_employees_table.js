/**
 * Create employees table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
    return knex.schema.createTable('employees', table => {
        table.increments('id').primary().unsigned();
        table.string('employee_code', 20);
        table.string('full_name', 100);
        table.string('email', 100);
        table.string('phone', 20);
        table.enu('gender', ['male', 'female', 'other']);
        table.date('date_of_birth');
        table.integer('department_id').unsigned();
        table.string('position', 100);
        table.string('job_title', 100);
        table.integer('manager_id').unsigned();
        table.enu('employment_status', ['probation', 'official', 'resigned']);
        table.date('probation_date');
        table.date('official_date');
        table.string('address', 255);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.integer('created_by');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by');
        table.foreign('department_id').references('departments.id');
        table.foreign('manager_id').references('employees.id');
    });
};

/**
 * Drop employees table.
 *
 * @param   {object} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
    return knex.schema.dropTable('employees');
};
