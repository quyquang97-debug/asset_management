import HttpStatus from 'http-status-codes';
import knex from '../config/knex';
import logger from '../config/winston';

/**
 * Search assets by asset code or name.
 *
 * @param   {object} req
 * @param   {object} res
 * @returns {Promise<void>}
 */
export async function searchByCodeOrName(req, res) {
    try {
        const { query } = req.params;
        if (!query || query.trim().length === 0) {
            return res.json({ error: false, data: [] });
        }
        const pattern = `%${query}%`;
        const items = await knex('assets')
            .select('id', 'asset_code', 'name')
            .where('asset_code', 'like', pattern)
            .orWhere('name', 'like', pattern)
            .limit(20);
        return res.json({ error: false, data: items });
    } catch (err) {
        logger.log('error', 'asset.searchByCodeOrName: ' + err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: true, data: { message: 'Internal server error' } });
    }
}
