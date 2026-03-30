import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import AutocompleteField from './AutocompleteField';
import { createRepairRequest, setModalMode } from '../../actions/repairRequestAction';
import { searchAssets, searchEmployees } from '../../services/repairRequestService';
import i18n from '../../i18n';

const useStyles = makeStyles(() => ({
    fieldRow: { marginBottom: 16 },
    errorText: { color: '#f44336', fontSize: 12, marginTop: 4 },
}));

/**
 * Stable Field component for asset autocomplete.
 * Defined outside the modal to keep a stable reference across re-renders,
 * preventing Redux-Form from unmounting/remounting the Field on each render.
 */
const AssetFieldComponent = ({ meta: { touched, error }, label, onSelectChange }) => (
    <AutocompleteField
        label={label}
        fetchSuggestions={searchAssets}
        displayFormat={(item) => `${item.asset_code} - ${item.name}`}
        onSelect={onSelectChange}
        error={touched && error ? error : ''}
    />
);

/**
 * Stable Field component for employee autocomplete.
 */
const EmployeeFieldComponent = ({ meta: { touched, error }, label, onSelectChange }) => (
    <AutocompleteField
        label={label}
        fetchSuggestions={searchEmployees}
        displayFormat={(item) => `${item.employee_code} - ${item.full_name}`}
        onSelect={onSelectChange}
        error={touched && error ? error : ''}
    />
);

const today = new Date().toISOString().split('T')[0];

/**
 * Validate Add form values.
 *
 * @param   {object} values
 * @returns {object} errors
 */
export const validate = (values) => {
    const errors = {};
    if (!values.assetId) {
        errors.assetId = i18n.t('repairRequests.validation.assetCodeRequired');
    }
    if (!values.requestedBy) {
        errors.requestedBy = i18n.t('repairRequests.validation.requestedByRequired');
    }
    if (!values.requestDate) {
        errors.requestDate = i18n.t('repairRequests.validation.requestDateRequired');
    } else if (values.requestDate > today) {
        errors.requestDate = i18n.t('repairRequests.validation.requestDateFuture');
    }
    return errors;
};

const renderDateField = ({ input, label, meta: { touched, error }, maxDate }) => (
    <div>
        <TextField
            label={label}
            type="date"
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: maxDate }}
            fullWidth
            error={touched && Boolean(error)}
            helperText={touched && error}
            {...input}
        />
    </div>
);

const renderTextareaField = ({ input, label, meta: { touched, error } }) => (
    <TextField
        label={label}
        multiline
        rows={3}
        fullWidth
        error={touched && Boolean(error)}
        helperText={touched && error}
        {...input}
    />
);

/**
 * Add Repair Request modal.
 *
 * @param {object} props
 * @returns {React.ReactElement}
 */
const RepairRequestAddModal = ({
    handleSubmit,
    change,
    dispatch,
    searchParams,
    error: serverError,
    reset,
}) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const handleClose = () => {
        reset();
        dispatch(setModalMode(null));
    };

    const onSubmit = (values) => {
        dispatch(createRepairRequest({
            assetId: values.assetId,
            requestedBy: values.requestedBy,
            description: values.description || '',
            requestDate: values.requestDate,
        }, searchParams));
    };

    return (
        <Dialog open maxWidth="sm" fullWidth onClose={handleClose}>
            <DialogTitle>{t('repairRequests.modal.addTitle')}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {serverError && serverError.source === 'create' && (
                        <Typography className={classes.errorText}>{serverError.message}</Typography>
                    )}
                    <div className={classes.fieldRow}>
                        <Field
                            name="assetId"
                            component={AssetFieldComponent}
                            label={t('repairRequests.modal.assetCodeLabel')}
                            onSelectChange={(id) => { change('assetId', id); }}
                        />
                    </div>
                    <div className={classes.fieldRow}>
                        <Field
                            name="requestedBy"
                            component={EmployeeFieldComponent}
                            label={t('repairRequests.modal.requestedByLabel')}
                            onSelectChange={(id) => { change('requestedBy', id); }}
                        />
                    </div>
                    <div className={classes.fieldRow}>
                        <Field
                            name="description"
                            component={renderTextareaField}
                            label={t('repairRequests.modal.descriptionLabel')}
                        />
                    </div>
                    <div className={classes.fieldRow}>
                        <Field
                            name="requestDate"
                            component={renderDateField}
                            label={t('repairRequests.modal.requestDateLabel')}
                            maxDate={today}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('repairRequests.common.cancel')}</Button>
                    <Button type="submit" variant="contained" color="primary">{t('repairRequests.common.save')}</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

RepairRequestAddModal.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    searchParams: PropTypes.object,
    error: PropTypes.object,
    reset: PropTypes.func.isRequired,
};

RepairRequestAddModal.defaultProps = {
    searchParams: {},
    error: null,
};

const mapStateToProps = (state) => ({
    searchParams: {
        page: state.repairRequest.page,
        pageSize: state.repairRequest.pageSize,
        sortField: state.repairRequest.sortField,
        sortDir: state.repairRequest.sortDir,
    },
    error: state.repairRequest.error,
});

export default connect(mapStateToProps)(
    reduxForm({ form: 'RepairRequestAdd', validate, initialValues: { requestDate: today } })(RepairRequestAddModal)
);
