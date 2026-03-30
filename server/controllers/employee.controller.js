import HttpStatus from 'http-status-codes';
import knex from '../config/knex';
import logger from '../config/winston';

/**
 * Search employees by employee code or full name.
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
        const items = await knex('employees')
            .select('id', 'employee_code', 'full_name')
            .where('employee_code', 'like', pattern)
            .orWhere('full_name', 'like', pattern)
            .limit(20);
        return res.json({ error: false, data: items });
    } catch (err) {
        logger.log('error', 'employee.searchByCodeOrName: ' + err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: true, data: { message: 'Internal server error' } });
    }
}
