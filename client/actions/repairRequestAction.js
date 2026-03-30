import {
    REPAIR_REQUEST_SEARCH_SUCCESS,
    REPAIR_REQUEST_FETCH_BY_ID_SUCCESS,
    REPAIR_REQUEST_SET_SELECTED_IDS,
    REPAIR_REQUEST_SET_MODAL_MODE,
    REPAIR_REQUEST_UPDATE_STATUS_SUCCESS,
    REPAIR_REQUEST_FAILURE,
    REPAIR_REQUEST_CLEAR_ERROR,
    REPAIR_REQUEST_SET_LOADING,
    REPAIR_REQUEST_SET_SUCCESS,
} from '../constants/actionType';
import * as service from '../services/repairRequestService';

/**
 * Search repair requests.
 *
 * @param   {object} payload
 * @returns {Function}
 */
export const searchRepairRequests = (payload) => (dispatch) => {
    dispatch({ type: REPAIR_REQUEST_SET_LOADING, payload: true });
    return service.search({
        sortField: 'request_date',
        sortDir: 'desc',
        page: 1,
        pageSize: 10,
        ...payload,
    })
        .then((res) => {
            dispatch({ type: REPAIR_REQUEST_SEARCH_SUCCESS, payload: res.data.data });
        })
        .catch((err) => {
            const message = err?.response?.data?.data?.message || err?.message || 'Unknown error';
            dispatch({ type: REPAIR_REQUEST_FAILURE, payload: { message, source: 'search' } });
        })
        .then(() => {
            dispatch({ type: REPAIR_REQUEST_SET_LOADING, payload: false });
        });
};

/**
 * Fetch repair request by id.
 *
 * @param   {number} id
 * @returns {Function}
 */
export const fetchRepairRequestById = (id) => (dispatch) => {
    return service.fetchById(id)
        .then((res) => {
            dispatch({ type: REPAIR_REQUEST_FETCH_BY_ID_SUCCESS, payload: res.data.data });
        })
        .catch((err) => {
            const message = err?.response?.data?.data?.message || err?.message || 'Unknown error';
            dispatch({ type: REPAIR_REQUEST_FAILURE, payload: { message, source: 'fetch' } });
            throw err;
        });
};

/**
 * Create a repair request.
 *
 * @param   {object} data
 * @param   {object} searchParams - current search params to refresh grid
 * @returns {Function}
 */
export const createRepairRequest = (data, searchParams) => (dispatch) => {
    return service.create(data)
        .then(() => {
            dispatch({ type: REPAIR_REQUEST_SET_SUCCESS, payload: 'repairRequests.addSuccess' });
            dispatch({ type: REPAIR_REQUEST_SET_MODAL_MODE, payload: null });
            dispatch(searchRepairRequests(searchParams));
        })
        .catch((err) => {
            const message = err?.response?.data?.data?.message || err?.message || 'Unknown error';
            dispatch({ type: REPAIR_REQUEST_FAILURE, payload: { message, source: 'create' } });
        });
};

/**
 * Update a repair request.
 *
 * @param   {number} id
 * @param   {object} data
 * @param   {object} searchParams
 * @returns {Function}
 */
export const updateRepairRequest = (id, data, searchParams) => (dispatch) => {
    return service.updateById(id, data)
        .then(() => {
            dispatch({ type: REPAIR_REQUEST_SET_SUCCESS, payload: 'repairRequests.updateSuccess' });
            dispatch({ type: REPAIR_REQUEST_SET_MODAL_MODE, payload: null });
            dispatch(searchRepairRequests(searchParams));
        })
        .catch((err) => {
            const message = err?.response?.data?.data?.message || err?.message || 'Unknown error';
            dispatch({ type: REPAIR_REQUEST_FAILURE, payload: { message, source: 'update' } });
        });
};

/**
 * Update repair request status.
 *
 * @param   {number} id
 * @param   {object} data
 * @param   {object} searchParams
 * @returns {Function}
 */
export const updateRepairRequestStatus = (id, data, searchParams) => (dispatch) => {
    return service.updateStatus(id, data)
        .then((res) => {
            dispatch({ type: REPAIR_REQUEST_UPDATE_STATUS_SUCCESS, payload: res.data.data });
            dispatch({ type: REPAIR_REQUEST_SET_SUCCESS, payload: 'repairRequests.updateStatusSuccess' });
            dispatch({ type: REPAIR_REQUEST_SET_MODAL_MODE, payload: null });
            dispatch(searchRepairRequests(searchParams));
        })
        .catch((err) => {
            const message = err?.response?.data?.data?.message || err?.message || 'Unknown error';
            dispatch({ type: REPAIR_REQUEST_FAILURE, payload: { message, source: 'updateStatus' } });
        });
};

/**
 * Bulk delete repair requests.
 *
 * @param   {number[]} ids
 * @param   {object} searchParams
 * @returns {Function}
 */
export const deleteRepairRequests = (ids, searchParams) => (dispatch) => {
    return service.bulkDestroy(ids)
        .then(() => {
            dispatch({ type: REPAIR_REQUEST_SET_SELECTED_IDS, payload: [] });
            dispatch(searchRepairRequests(searchParams));
        })
        .catch((err) => {
            const message = err?.response?.data?.data?.message || err?.message || 'Unknown error';
            dispatch({ type: REPAIR_REQUEST_FAILURE, payload: { message, source: 'delete' } });
        });
};

/**
 * Set selected row IDs.
 *
 * @param   {number[]} ids
 * @returns {object}
 */
export const setSelectedIds = (ids) => ({ type: REPAIR_REQUEST_SET_SELECTED_IDS, payload: ids });

/**
 * Set modal mode.
 *
 * @param   {string|null} mode
 * @returns {object}
 */
export const setModalMode = (mode) => ({ type: REPAIR_REQUEST_SET_MODAL_MODE, payload: mode });

/**
 * Clear error state.
 *
 * @returns {object}
 */
export const clearError = () => ({ type: REPAIR_REQUEST_CLEAR_ERROR });
