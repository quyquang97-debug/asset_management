import bookshelf from '../config/bookshelf';

const TABLE_NAME = 'employees';

/**
 * Employee model.
 */
class Employee extends bookshelf.Model {

    /**
     * Get table name.
     */
    get tableName() {
        return TABLE_NAME;
    }

    /**
     * Table has timestamps.
     */
    get hasTimestamps() {
        return true;
    }
}

export default Employee;
