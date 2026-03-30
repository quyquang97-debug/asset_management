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
import { updateRepairRequest, setModalMode } from '../../actions/repairRequestAction';
import { searchAssets, searchEmployees } from '../../services/repairRequestService';
import i18n from '../../i18n';

const useStyles = makeStyles(() => ({
    fieldRow: { marginBottom: 16 },
    idLabel: { marginBottom: 8, color: '#555' },
}));

const EditAssetFieldComponent = ({ input, meta: { touched, error }, label, onSelectChange }) => (
    <AutocompleteField
        label={label}
        fetchSuggestions={searchAssets}
        displayFormat={(item) => `${item.asset_code} - ${item.name}`}
        onInputChange={input.onChange}
        onSelect={(id) => { onSelectChange(id); }}
        value={input.value || ''}
        error={touched && error ? error : ''}
    />
);

const EditEmployeeFieldComponent = ({ input, meta: { touched, error }, label, onSelectChange }) => (
    <AutocompleteField
        label={label}
        fetchSuggestions={searchEmployees}
        displayFormat={(item) => `${item.employee_code} - ${item.full_name}`}
        onInputChange={input.onChange}
        onSelect={(id) => { onSelectChange(id); }}
        value={input.value || ''}
        error={touched && error ? error : ''}
    />
);

EditAssetFieldComponent.propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    onSelectChange: PropTypes.func.isRequired,
};

EditEmployeeFieldComponent.propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    onSelectChange: PropTypes.func.isRequired,
};

const today = new Date().toISOString().split('T')[0];

/**
 * Validate Edit form values.
 *
 * @param   {object} values
 * @returns {object} errors
 */
export const validate = (values) => {
    const errors = {};
    if (!values.assetId) {
        errors.assetDisplay = i18n.t('repairRequests.validation.assetCodeRequired');
    }
    if (!values.requestedBy) {
        errors.requestedByDisplay = i18n.t('repairRequests.validation.requestedByRequired');
    }
    if (!values.requestDate) {
        errors.requestDate = i18n.t('repairRequests.validation.requestDateRequired');
    } else if (values.requestDate > today) {
        errors.requestDate = i18n.t('repairRequests.validation.requestDateFuture');
    }

    return errors;
};

const renderDateField = ({ input, label, meta: { touched, error }, maxDate }) => (
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
 * Edit Repair Request modal.
 *
 * @param {object} props
 * @returns {React.ReactElement}
 */
const RepairRequestEditModal = ({
    handleSubmit,
    change,
    dispatch,
    selectedItem,
    searchParams,
    reset,
}) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const handleClose = () => {
        reset();
        dispatch(setModalMode(null));
    };

    const onSubmit = (values) => {
        dispatch(updateRepairRequest(selectedItem.id, {
            assetId: values.assetId,
            requestedBy: values.requestedBy,
            description: values.description || '',
            requestDate: values.requestDate,
        }, searchParams));
    };

    return (
        <Dialog open maxWidth="sm" fullWidth onClose={handleClose}>
            <DialogTitle>{t('repairRequests.modal.editTitle')}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {selectedItem && (
                        <Typography variant="body2" className={classes.idLabel}>
                            {t('repairRequests.common.id')}: {selectedItem.id}
                        </Typography>
                    )}
                    <div className={classes.fieldRow}>
                        <Field
                            name="assetDisplay"
                            component={EditAssetFieldComponent}
                            label={t('repairRequests.modal.assetCodeLabel')}
                            onSelectChange={(id) => { change('assetId', id); }}
                        />
                        <Field name="assetId" component="input" type="hidden" />
                    </div>
                    <div className={classes.fieldRow}>
                        <Field
                            name="requestedByDisplay"
                            component={EditEmployeeFieldComponent}
                            label={t('repairRequests.modal.requestedByLabel')}
                            onSelectChange={(id) => { change('requestedBy', id); }}
                        />
                        <Field name="requestedBy" component="input" type="hidden" />
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

RepairRequestEditModal.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    selectedItem: PropTypes.object,
    searchParams: PropTypes.object,
    reset: PropTypes.func.isRequired,
};

RepairRequestEditModal.defaultProps = {
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
    initialValues: state.repairRequest.selectedItem ? {
        assetId: state.repairRequest.selectedItem.asset_id,
        assetDisplay: `${state.repairRequest.selectedItem.asset_code} - ${state.repairRequest.selectedItem.asset_name}`,
        requestedBy: state.repairRequest.selectedItem.requested_by,
        requestedByDisplay: state.repairRequest.selectedItem.requested_by_name || '',
        description: state.repairRequest.selectedItem.description || '',
        requestDate: state.repairRequest.selectedItem.request_date
            ? state.repairRequest.selectedItem.request_date.split('T')[0]
            : '',
    } : {},
});

export default connect(mapStateToProps)(
    reduxForm({ form: 'RepairRequestEdit', validate, enableReinitialize: true })(RepairRequestEditModal)
);
