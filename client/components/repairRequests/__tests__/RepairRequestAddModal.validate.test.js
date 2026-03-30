// validate() uses i18n.t() — mocked via jest moduleNameMapper → returns key as-is.
// validate() compares requestDate against a module-level `today` — we compute
// the same way in tests to stay timezone-safe.
import { validate } from '../RepairRequestAddModal';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

describe('RepairRequestAddModal — validate (AC-12, 13, 14, 15)', () => {
    it('AC-12: requires assetId — error set when assetId is null', () => {
        const errors = validate({ assetId: null, requestedBy: 1, requestDate: yesterday });

        expect(errors.assetId).toBeDefined();
    });

    it('AC-13: requires requestedBy — error set when requestedBy is null', () => {
        const errors = validate({ assetId: 1, requestedBy: null, requestDate: yesterday });

        expect(errors.requestedBy).toBeDefined();
    });

    it('AC-14: requires requestDate — error set when requestDate is empty', () => {
        const errors = validate({ assetId: 1, requestedBy: 1, requestDate: '' });

        expect(errors.requestDate).toBeDefined();
    });

    it('AC-15: rejects future requestDate (tomorrow)', () => {
        const errors = validate({ assetId: 1, requestedBy: 1, requestDate: tomorrow });

        expect(errors.requestDate).toBeDefined();
    });

    it('AC-15: accepts today as requestDate (boundary — not future)', () => {
        const errors = validate({ assetId: 1, requestedBy: 1, requestDate: today });

        expect(errors.requestDate).toBeUndefined();
    });

    it('returns no errors for a fully valid payload', () => {
        const errors = validate({ assetId: 5, requestedBy: 3, requestDate: yesterday });

        expect(Object.keys(errors)).toHaveLength(0);
    });
});
