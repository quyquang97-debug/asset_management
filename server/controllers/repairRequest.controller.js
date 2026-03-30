import HttpStatus from 'http-status-codes';
import knex from '../config/knex';
import logger from '../config/winston';

const ALLOWED_SORT_FIELDS = ['request_date', 'id', 'status'];

/**
 * Find a repair request by id (with joins).
 *
 * @param   {number} id
 * @param   {object} [trx]
 * @returns {Promise<object|null>}
 */
async function findRecordById(id, trx) {
    const query = (trx || knex)('repair_requests as rr')
        .join('assets as a', 'rr.asset_id', 'a.id')
        .join('employees as e', 'rr.requested_by', 'e.id')
        .select(
            'rr.id',
            'rr.asset_id',
            'a.asset_code',
            'a.name as asset_name',
            'rr.requested_by',
            'e.full_name as requested_by_name',
            'rr.description',
            'rr.request_date',
            'rr.status',
            'rr.created_at',
            'rr.updated_at'
        )
        .where('rr.id', id)
        .first();
    return query;
}

/**
 * Search repair requests with filters, sorting and pagination.
 *
 * @param   {object} req
 * @param   {object} res
 * @returns {Promise<void>}
 */
export async function search(req, res) {
    try {
        const { assetId, requestedBy, status, page = 1, pageSize = 10, sortField = 'request_date', sortDir = 'desc' } = req.body;

        const safeSort = ALLOWED_SORT_FIELDS.includes(sortField) ? sortField : 'request_date';
        const safeSortDir = sortDir === 'asc' ? 'asc' : 'desc';

        const baseQuery = knex('repair_requests as rr')
            .join('assets as a', 'rr.asset_id', 'a.id')
            .join('employees as e', 'rr.requested_by', 'e.id');

        if (assetId) {
            baseQuery.where('rr.asset_id', assetId);
        }
        if (requestedBy) {
            baseQuery.where('rr.requested_by', requestedBy);
        }
        if (status) {
            baseQuery.where('rr.status', status);
        }

        const countQuery = baseQuery.clone().count('rr.id as total').first();
        const dataQuery = baseQuery.clone()
            .select(
                'rr.id',
                'rr.asset_id',
                'a.asset_code',
                'a.name as asset_name',
                'rr.requested_by',
                'e.full_name as requested_by_name',
                'rr.description',
                'rr.request_date',
                'rr.status',
                'rr.created_at',
                'rr.updated_at'
            )
            .orderBy(`rr.${safeSort}`, safeSortDir)
            .limit(pageSize)
            .offset((page - 1) * pageSize);

        const [countResult, items] = await Promise.all([countQuery, dataQuery]);
        const total = parseInt(countResult.total, 10);

        return res.json({ error: false, data: { items, total, page, pageSize } });
    } catch (err) {
        logger.log('error', 'repairRequest.search: ' + err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: true, data: { message: 'Internal server error' } });
    }
}

/**
 * Find repair request by id.
 *
 * @param   {object} req
 * @param   {object} res
 * @returns {Promise<void>}
 */
export async function findById(req, res) {
    try {
        const record = await findRecordById(req.params.id);
        if (!record) {
            return res.status(HttpStatus.NOT_FOUND).json({ error: true, data: { message: 'Repair request not found.' } });
        }
        return res.json({ error: false, data: record });
    } catch (err) {
        logger.log('error', 'repairRequest.findById: ' + err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: true, data: { message: 'Internal server error' } });
    }
}

/**
 * Create a new repair request.
 *
 * @param   {object} req
 * @param   {object} res
 * @returns {Promise<void>}
 */
export async function store(req, res) {
    try {
        const { assetId, requestedBy, description, requestDate } = req.body;

        const asset = await knex('assets').where('id', assetId).first();
        if (!asset) {
            return res.status(HttpStatus.BAD_REQUEST).json({ error: true, data: { message: 'Asset not found.' } });
        }

        const employee = await knex('employees').where('id', requestedBy).first();
        if (!employee) {
            return res.status(HttpStatus.BAD_REQUEST).json({ error: true, data: { message: 'Employee not found.' } });
        }

        const [id] = await knex('repair_requests').insert({
            asset_id: assetId,
            requested_by: requestedBy,
            description: description || null,
            request_date: requestDate,
            status: 'open',
            created_by: req.currentUser.id,
            updated_by: req.currentUser.id,
        });

        const record = await findRecordById(id);
        return res.json({ error: false, data: record });
    } catch (err) {
        logger.log('error', 'repairRequest.store: ' + err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: true, data: { message: 'Internal server error' } });
    }
}

/**
 * Update a repair request.
 *
 * @param   {object} req
 * @param   {object} res
 * @returns {Promise<void>}
 */
export async function update(req, res) {
    try {
        const { id } = req.params;
        const { assetId, requestedBy, description, requestDate } = req.body;

        const existing = await knex('repair_requests').where('id', id).first();
        if (!existing) {
            return res.status(HttpStatus.NOT_FOUND).json({ error: true, data: { message: 'Repair request not found.' } });
        }

        if (existing.status === 'done') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                error: true,
                data: { message: 'Cannot edit a record with status "done".' }
            });
        }

        const asset = await knex('assets').where('id', assetId).first();
        if (!asset) {
            return res.status(HttpStatus.BAD_REQUEST).json({ error: true, data: { message: 'Asset not found.' } });
        }

        const employee = await knex('employees').where('id', requestedBy).first();
        if (!employee) {
            return res.status(HttpStatus.BAD_REQUEST).json({ error: true, data: { message: 'Employee not found.' } });
        }

        await knex('repair_requests').where('id', id).update({
            asset_id: assetId,
            requested_by: requestedBy,
            description: description || null,
            request_date: requestDate,
            updated_by: req.currentUser.id,
            updated_at: knex.fn.now(),
        });

        const record = await findRecordById(id);
        return res.json({ error: false, data: record });
    } catch (err) {
        logger.log('error', 'repairRequest.update: ' + err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: true, data: { message: 'Internal server error' } });
    }
}

/**
 * Update repair request status with transaction.
 *
 * @param   {object} req
 * @param   {object} res
 * @returns {Promise<void>}
 */
export async function updateStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, repairDate, cost, performedBy, description } = req.body;

        const existing = await knex('repair_requests').where('id', id).first();
        if (!existing) {
            return res.status(HttpStatus.NOT_FOUND).json({ error: true, data: { message: 'Repair request not found.' } });
        }

        const allowedTransitions = {
            open: ['in_progress', 'cancelled'],
            in_progress: ['done'],
            done: [],
            cancelled: [],
        };

        const allowed = allowedTransitions[existing.status] || [];
        if (!allowed.includes(status)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                error: true,
                data: { message: `Transition from '${existing.status}' to '${status}' is not allowed.` }
            });
        }

        if (status === 'done') {
            const requestDateStr = (existing.request_date instanceof Date
                ? existing.request_date.toISOString()
                : String(existing.request_date)).split('T')[0];
            if (repairDate < requestDateStr) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    error: true,
                    data: { message: 'Repair date must be after Request date.' }
                });
            }
        }

        await knex.transaction(async (trx) => {
            await trx('repair_requests').where('id', id).update({
                status,
                updated_by: req.currentUser.id,
                updated_at: knex.fn.now(),
            });

            if (status === 'done') {
                await trx('asset_maintenances').insert({
                    asset_id: existing.asset_id,
                    repair_request_id: existing.id,
                    type: 'repair',
                    maintenance_date: repairDate,
                    description: description || null,
                    cost,
                    performed_by: performedBy,
                    created_by: req.currentUser.id,
                    updated_by: req.currentUser.id,
                });
            }

            if (status === 'in_progress') {
                await trx('assets').where('id', existing.asset_id).update({
                    status: 'IN_REPAIR',
                    updated_by: req.currentUser.id,
                    updated_at: knex.fn.now(),
                });
            }
        });

        const record = await findRecordById(id);
        return res.json({ error: false, data: record });
    } catch (err) {
        logger.log('error', 'repairRequest.updateStatus: ' + err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: true, data: { message: 'Internal server error' } });
    }
}

/**
 * Bulk delete repair requests.
 *
 * @param   {object} req
 * @param   {object} res
 * @returns {Promise<void>}
 */
export async function destroy(req, res) {
    try {
        const { ids } = req.body;
        const doneCount = await knex('repair_requests')
            .whereIn('id', ids)
            .where('status', 'done')
            .count('id as cnt')
            .first();
        if (parseInt(doneCount.cnt, 10) > 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                error: true,
                data: { message: 'Cannot delete records with status "done".' }
            });
        }
        const count = await knex('repair_requests').whereIn('id', ids).delete();
        return res.json({ error: false, data: { message: 'Deleted successfully.', count } });
    } catch (err) {
        logger.log('error', 'repairRequest.destroy: ' + err.message);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: true, data: { message: 'Internal server error' } });
    }
}
