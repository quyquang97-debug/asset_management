import bookshelf from '../config/bookshelf';

const TABLE_NAME = 'asset_maintenances';

/**
 * AssetMaintenance model.
 */
class AssetMaintenance extends bookshelf.Model {

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

export default AssetMaintenance;
