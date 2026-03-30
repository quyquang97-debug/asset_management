import repairRequestReducer from '../repairRequestReducer';
import {
    REPAIR_REQUEST_SEARCH_SUCCESS,
    REPAIR_REQUEST_SET_SELECTED_IDS,
    REPAIR_REQUEST_FAILURE,
} from '../../constants/actionType';

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

// ─── REPAIR_REQUEST_SEARCH_SUCCESS ────────────────────────────────────────────

describe('repairRequestReducer — REPAIR_REQUEST_SEARCH_SUCCESS', () => {
    it('updates items, total, page and pageSize from payload', () => {
        const action = {
            type: REPAIR_REQUEST_SEARCH_SUCCESS,
            payload: {
                items: [{ id: 10, status: 'open' }],
                total: 42,
                page: 3,
                pageSize: 20,
            },
        };

        const nextState = repairRequestReducer(initialState, action);

        expect(nextState.items).toEqual([{ id: 10, status: 'open' }]);
        expect(nextState.total).toBe(42);
        expect(nextState.page).toBe(3);
        expect(nextState.pageSize).toBe(20);
    });

    it('clears error and successMessage after a successful search', () => {
        const prevState = {
            ...initialState,
            error: { message: 'stale error' },
            successMessage: 'stale.key',
        };
        const action = {
            type: REPAIR_REQUEST_SEARCH_SUCCESS,
            payload: { items: [], total: 0, page: 1, pageSize: 10 },
        };

        const nextState = repairRequestReducer(prevState, action);

        expect(nextState.error).toBeNull();
        expect(nextState.successMessage).toBeNull();
    });

    it('keeps selectedIds only for visible, non-done records after search (AC-7)', () => {
        // Pre-selected: ids 1, 2, 99 — 2 is done, 99 is not in the new page
        const prevState = {
            ...initialState,
            selectedIds: [1, 2, 99],
        };
        const action = {
            type: REPAIR_REQUEST_SEARCH_SUCCESS,
            payload: {
                items: [
                    { id: 1, status: 'open' },
                    { id: 2, status: 'done' },
                    { id: 3, status: 'cancelled' },
                ],
                total: 3,
                page: 1,
                pageSize: 10,
            },
        };

        const nextState = repairRequestReducer(prevState, action);

        // id=1: visible + not done → keep
        // id=2: visible but done → drop
        // id=99: not visible → drop
        expect(nextState.selectedIds).toEqual([1]);
    });
});

// ─── REPAIR_REQUEST_SET_SELECTED_IDS ─────────────────────────────────────────

describe('repairRequestReducer — REPAIR_REQUEST_SET_SELECTED_IDS', () => {
    it('replaces selectedIds with the payload array (set-all case)', () => {
        const action = {
            type: REPAIR_REQUEST_SET_SELECTED_IDS,
            payload: [1, 2, 3],
        };

        const nextState = repairRequestReducer(initialState, action);

        expect(nextState.selectedIds).toEqual([1, 2, 3]);
    });

    it('clears selectedIds when payload is an empty array (clear-all case)', () => {
        const prevState = { ...initialState, selectedIds: [5, 6] };
        const action = {
            type: REPAIR_REQUEST_SET_SELECTED_IDS,
            payload: [],
        };

        const nextState = repairRequestReducer(prevState, action);

        expect(nextState.selectedIds).toEqual([]);
    });

    it('does not mutate other state fields when updating selectedIds', () => {
        const prevState = { ...initialState, total: 99, page: 2 };
        const action = { type: REPAIR_REQUEST_SET_SELECTED_IDS, payload: [7] };

        const nextState = repairRequestReducer(prevState, action);

        expect(nextState.total).toBe(99);
        expect(nextState.page).toBe(2);
    });
});

// ─── REPAIR_REQUEST_FAILURE ───────────────────────────────────────────────────

describe('repairRequestReducer — REPAIR_REQUEST_FAILURE', () => {
    it('sets error from payload without changing items (AC-40)', () => {
        const prevState = {
            ...initialState,
            items: [{ id: 1, status: 'open' }],
            total: 1,
        };
        const action = {
            type: REPAIR_REQUEST_FAILURE,
            payload: { message: 'Network error' },
        };

        const nextState = repairRequestReducer(prevState, action);

        expect(nextState.error).toEqual({ message: 'Network error' });
        // Grid data must NOT be wiped on error
        expect(nextState.items).toEqual([{ id: 1, status: 'open' }]);
        expect(nextState.total).toBe(1);
    });
});
