import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { updateRepairRequestStatus, setModalMode } from '../../actions/repairRequestAction';

const useStyles = makeStyles(() => ({
    fieldRow: { marginBottom: 16 },
    idLabel: { marginBottom: 12, color: '#555' },
}));

const TRANSITION_OPTIONS = {
    open: ['in_progress', 'cancelled'],
    in_progress: ['done'],
};

const today = new Date().toISOString().split('T')[0];

/**
 * Pure validation function for the Update Status form.
 * Extracted at module level so it can be unit-tested independently of component state.
 *
 * @param {object} params
 * @param {string}  params.status         - selected status value
 * @param {boolean} params.isDone         - whether selected status is 'done'
 * @param {string}  params.repairDate     - YYYY-MM-DD repair date string
 * @param {string|null} params.requestDateStr - original request_date as YYYY-MM-DD (null if unknown)
 * @param {string|number|''|null|undefined} params.cost - cost value (optional per AC-34)
 * @param {function} params.t             - i18n translate function
 * @returns {object} error map
 */
export const validateUpdateStatus = ({ status, isDone, repairDate, requestDateStr, cost, t }) => {
    const errs = {};
    if (!status) {
        errs.status = t('repairRequests.validation.statusRequired');
    }
    if (isDone) {
        if (!repairDate) {
            errs.repairDate = t('repairRequests.validation.repairDateRequired');
        } else if (requestDateStr && repairDate < requestDateStr) {
            errs.repairDate = t('repairRequests.validation.repairDateBeforeRequest');
        }
        if (cost !== '' && cost !== null && cost !== undefined && parseFloat(cost) < 0) {
            errs.cost = t('repairRequests.validation.costNegative');
        }
    }
    return errs;
};

/**
 * Update Status modal for repair requests.
 *
 * @param {object} props
 * @returns {React.ReactElement}
 */
const UpdateStatusModal = ({ dispatch, selectedItem, searchParams }) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const [status, setStatus] = useState('');
    const [repairDate, setRepairDate] = useState('');
    const [cost, setCost] = useState('');
    const [performedBy, setPerformedBy] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});

    const isDone = status === 'done';
    const options = TRANSITION_OPTIONS[selectedItem ? selectedItem.status : 'open'] || [];

    const handleStatusChange = (e) => {
        const val = e.target.value;
        setStatus(val);
        setRepairDate('');
        setCost('');
        setPerformedBy('');
        setDescription('');
        setErrors({});
    };

    const validate = () => {
        const requestDateStr =
            selectedItem && selectedItem.request_date
                ? selectedItem.request_date.split('T')[0]
                : null;
        return validateUpdateStatus({ status, isDone, repairDate, requestDateStr, cost, t });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        const payload = { status };
        if (isDone) {
            payload.repairDate = repairDate;
            payload.cost = cost !== '' ? parseFloat(cost) : null;
            payload.performedBy = performedBy || null;
            payload.description = description;
        }
        dispatch(updateRepairRequestStatus(selectedItem.id, payload, searchParams));
    };

    const handleClose = () => {
        dispatch(setModalMode(null));
    };

    if (!selectedItem) {
        return null;
    }

    return (
        <Dialog open maxWidth="sm" fullWidth onClose={handleClose}>
            <DialogTitle>{t('repairRequests.modal.updateStatusTitle')}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Typography variant="body2" className={classes.idLabel}>
                        {t('repairRequests.common.id')}: {selectedItem.id}
                    </Typography>
                    <div className={classes.fieldRow}>
                        <FormControl fullWidth error={Boolean(errors.status)}>
                            <InputLabel>{t('repairRequests.modal.statusLabel')}</InputLabel>
                            <Select value={status} onChange={handleStatusChange}>
                                {options.map((val) => (
                                    <MenuItem key={val} value={val}>
                                        {t('repairRequests.status.' + val)}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                        </FormControl>
                    </div>
                    <div className={classes.fieldRow}>
                        <TextField
                            label={t('repairRequests.modal.repairDateLabel')}
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ max: today }}
                            fullWidth
                            disabled={!isDone}
                            value={repairDate}
                            onChange={(e) => setRepairDate(e.target.value)}
                            error={Boolean(errors.repairDate)}
                            helperText={errors.repairDate || ''}
                        />
                    </div>
                    <div className={classes.fieldRow}>
                        <TextField
                            label={t('repairRequests.modal.costLabel')}
                            type="number"
                            inputProps={{ min: 0, step: 'any' }}
                            fullWidth
                            disabled={!isDone}
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            error={Boolean(errors.cost)}
                            helperText={errors.cost || ''}
                        />
                    </div>
                    <div className={classes.fieldRow}>
                        <TextField
                            label={t('repairRequests.modal.performedByLabel')}
                            fullWidth
                            disabled={!isDone}
                            value={performedBy}
                            onChange={(e) => setPerformedBy(e.target.value)}
                            inputProps={{ maxLength: 100 }}
                            error={Boolean(errors.performedBy)}
                            helperText={errors.performedBy || ''}
                        />
                    </div>
                    <div className={classes.fieldRow}>
                        <TextField
                            label={t('repairRequests.modal.descriptionLabel')}
                            multiline
                            rows={3}
                            fullWidth
                            disabled={!isDone}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('repairRequests.common.cancel')}</Button>
                    <Button type="submit" variant="contained" color="primary">{t('repairRequests.common.update')}</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

UpdateStatusModal.propTypes = {
    dispatch: PropTypes.func.isRequired,
    selectedItem: PropTypes.object,
    searchParams: PropTypes.object,
};

UpdateStatusModal.defaultProps = {
    selectedItem: null,
    searchParams: {},
};

const mapStateToProps = (state) => ({
    selectedItem: state.repairRequest.selectedItem,
    searchParams: {
        page: state.repairRequest.page,
        pageSize: state.repairRequest.pageSize,
        sortField: state.repairRequest.sortField,
        sortDir: state.repairRequest.sortDir,
    },
});

export default connect(mapStateToProps)(UpdateStatusModal);
