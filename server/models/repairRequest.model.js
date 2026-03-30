import bookshelf from '../config/bookshelf';

const TABLE_NAME = 'repair_requests';

/**
 * RepairRequest model.
 */
class RepairRequest extends bookshelf.Model {

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

export default RepairRequest;
