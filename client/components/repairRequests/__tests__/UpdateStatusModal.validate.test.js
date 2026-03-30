// validateUpdateStatus is a module-level pure function extracted from UpdateStatusModal.
// Tests cover spec amendments: AC-34 (cost optional), AC-35 (performedBy optional),
// AC-36 (repairDate ≥ requestDate), AC-37 (cost ≥ 0), and boundary B-3 (equal dates valid).
import { validateUpdateStatus } from '../UpdateStatusModal';

// i18n is NOT imported here — validateUpdateStatus receives `t` as a parameter.
const t = (key) => key;

const BASE = {
    status: 'done',
    isDone: true,
    repairDate: '2026-03-20',
    requestDateStr: '2026-03-01',
    cost: 500,
    t,
};

describe('validateUpdateStatus — repairDate (AC-33, AC-36)', () => {
    it('AC-33: error when isDone and repairDate is empty', () => {
        const errs = validateUpdateStatus({ ...BASE, repairDate: '' });

        expect(errs.repairDate).toBeDefined();
    });

    it('AC-36: error when repairDate is before requestDate', () => {
        const errs = validateUpdateStatus({
            ...BASE,
            repairDate: '2026-02-28',
            requestDateStr: '2026-03-01',
        });

        expect(errs.repairDate).toBeDefined();
    });

    it('B-3: repairDate equal to requestDate is valid (≥ boundary)', () => {
        const errs = validateUpdateStatus({
            ...BASE,
            repairDate: '2026-03-01',
            requestDateStr: '2026-03-01',
        });

        expect(errs.repairDate).toBeUndefined();
    });

    it('repairDate after requestDate is valid', () => {
        const errs = validateUpdateStatus({
            ...BASE,
            repairDate: '2026-03-20',
            requestDateStr: '2026-03-01',
        });

        expect(errs.repairDate).toBeUndefined();
    });
});

describe('validateUpdateStatus — cost (AC-37, amended AC-34)', () => {
    it('AC-37: error when cost is negative (-0.01)', () => {
        const errs = validateUpdateStatus({ ...BASE, cost: '-0.01' });

        expect(errs.cost).toBeDefined();
    });

    it('AC-37: cost = 0 is valid (free repair, boundary B-2)', () => {
        const errs = validateUpdateStatus({ ...BASE, cost: 0 });

        expect(errs.cost).toBeUndefined();
    });

    it('amended AC-34: empty string cost is valid (cost is optional)', () => {
        const errs = validateUpdateStatus({ ...BASE, cost: '' });

        expect(errs.cost).toBeUndefined();
    });

    it('amended AC-34: null cost is valid (cost is optional)', () => {
        const errs = validateUpdateStatus({ ...BASE, cost: null });

        expect(errs.cost).toBeUndefined();
    });
});

describe('validateUpdateStatus — performedBy (amended AC-35)', () => {
    it('amended AC-35: missing performedBy produces no validation error', () => {
        // validateUpdateStatus does not validate performedBy — it is optional (AC-35 amendment).
        const errs = validateUpdateStatus({ ...BASE, performedBy: undefined });

        expect(errs.performedBy).toBeUndefined();
    });
});

describe('validateUpdateStatus — status required', () => {
    it('error when status is empty string', () => {
        const errs = validateUpdateStatus({ ...BASE, status: '', isDone: false });

        expect(errs.status).toBeDefined();
    });
});

describe('validateUpdateStatus — valid complete payload', () => {
    it('returns no errors for a fully valid done submission', () => {
        const errs = validateUpdateStatus(BASE);

        expect(Object.keys(errs)).toHaveLength(0);
    });
});
