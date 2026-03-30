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

const initialState = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    sortField: 'request_date',
    sortDir: 'desc',
    selectedIds: [],
    selectedItem: null,
    modalMode: null,
    loading: false,
    error: null,
    successMessage: null,
};

/**
 * Repair request reducer.
 *
 * @param   {object} state
 * @param   {object} action
 * @returns {object}
 */
const repairRequestReducer = (state = initialState, action) => {
    switch (action.type) {
        case REPAIR_REQUEST_SET_LOADING:
            return { ...state, loading: action.payload };

        case REPAIR_REQUEST_SEARCH_SUCCESS: {
            const doneIds = new Set(
                action.payload.items
                    .filter((item) => item.status === 'done')
                    .map((item) => item.id)
            );
            const visibleIds = new Set(action.payload.items.map((item) => item.id));
            return {
                ...state,
                items: action.payload.items,
                total: action.payload.total,
                page: action.payload.page,
                pageSize: action.payload.pageSize,
                // Keep only selected ids that are still visible in the current dataset and not done.
                selectedIds: state.selectedIds.filter((id) => visibleIds.has(id) && !doneIds.has(id)),
                error: null,
                successMessage: null,
            };
        }

        case REPAIR_REQUEST_FETCH_BY_ID_SUCCESS:
            return { ...state, selectedItem: action.payload, error: null };

        case REPAIR_REQUEST_SET_SELECTED_IDS:
            return { ...state, selectedIds: action.payload };

        case REPAIR_REQUEST_SET_MODAL_MODE:
            return { ...state, modalMode: action.payload, error: null };

        case REPAIR_REQUEST_UPDATE_STATUS_SUCCESS:
            return { ...state, error: null };

        case REPAIR_REQUEST_SET_SUCCESS:
            return { ...state, successMessage: action.payload };

        case REPAIR_REQUEST_FAILURE:
            return { ...state, error: action.payload };

        case REPAIR_REQUEST_CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};

export default repairRequestReducer;
