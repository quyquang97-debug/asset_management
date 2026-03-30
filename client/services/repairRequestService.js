import { fetch, store, update, patch, destroyWithBody } from '../utils/httpUtil';

const BASE = 'repairRequests';
const ASSETS_BASE = 'assets';
const EMPLOYEES_BASE = 'employees';

/**
 * Search repair requests.
 *
 * @param   {object} payload
 * @returns {Promise}
 */
export const search = (payload) => store(`${BASE}/search`, payload);

/**
 * Fetch repair request by id.
 *
 * @param   {number} id
 * @returns {Promise}
 */
export const fetchById = (id) => fetch(`${BASE}/${id}`);

/**
 * Create a new repair request.
 *
 * @param   {object} data
 * @returns {Promise}
 */
export const create = (data) => store(BASE, data);

/**
 * Update a repair request by id.
 *
 * @param   {number} id
 * @param   {object} data
 * @returns {Promise}
 */
export const updateById = (id, data) => update(`${BASE}/${id}`, data);

/**
 * Update repair request status.
 *
 * @param   {number} id
 * @param   {object} data
 * @returns {Promise}
 */
export const updateStatus = (id, data) => patch(`${BASE}/${id}/status`, data);

/**
 * Bulk delete repair requests.
 *
 * @param   {number[]} ids
 * @returns {Promise}
 */
export const bulkDestroy = (ids) => destroyWithBody(BASE, { ids });

/**
 * Search assets by code or name.
 *
 * @param   {string} query
 * @returns {Promise}
 */
export const searchAssets = (query) => fetch(`${ASSETS_BASE}/searchbyCodeOrName/${encodeURIComponent(query)}`);

/**
 * Search employees by code or name.
 *
 * @param   {string} query
 * @returns {Promise}
 */
export const searchEmployees = (query) => fetch(`${EMPLOYEES_BASE}/searchbyCodeOrName/${encodeURIComponent(query)}`);
