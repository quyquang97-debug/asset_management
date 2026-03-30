import { validate } from '../RepairRequestEditModal';

describe('RepairRequestEditModal.validate', () => {
    it('maps missing autocomplete ids to visible display-field errors', () => {
        const errors = validate({
            assetId: null,
            requestedBy: null,
            requestDate: '2026-03-29',
        });

        expect(errors.assetDisplay).toBeDefined();
        expect(errors.requestedByDisplay).toBeDefined();
        expect(errors.assetId).toBeUndefined();
        expect(errors.requestedBy).toBeUndefined();
    });
});

