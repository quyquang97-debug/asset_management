import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { setModalMode } from '../../actions/repairRequestAction';

const useStyles = makeStyles(() => ({
    row: { marginBottom: 12 },
    label: { fontWeight: 600, fontSize: 13, color: '#555' },
    value: { fontSize: 14 },
}));

/**
 * View Repair Request modal (read-only).
 *
 * @param {object} props
 * @returns {React.ReactElement}
 */
const RepairRequestViewModal = ({ dispatch, selectedItem }) => {
    const { t, i18n } = useTranslation();
    const classes = useStyles();

    const handleClose = () => {
        dispatch(setModalMode(null));
    };

    if (!selectedItem) {
        return null;
    }

    const localeMap = { vi: 'vi-VN', en: 'en-US', ja: 'ja-JP' };
    const locale = localeMap[i18n.language] || 'vi-VN';
    const requestDate = selectedItem.request_date
        ? new Date(selectedItem.request_date).toLocaleDateString(locale)
        : '';

    return (
        <Dialog open maxWidth="sm" fullWidth onClose={handleClose}>
            <DialogTitle>{t('repairRequests.modal.viewTitle')}</DialogTitle>
            <DialogContent>
                <div className={classes.row}>
                    <Typography className={classes.label}>{t('repairRequests.common.id')}</Typography>
                    <Typography className={classes.value}>{selectedItem.id}</Typography>
                </div>
                <div className={classes.row}>
                    <Typography className={classes.label}>{t('repairRequests.table.assetCode')}</Typography>
                    <Typography className={classes.value}>{selectedItem.asset_code}</Typography>
                </div>
                <div className={classes.row}>
                    <Typography className={classes.label}>{t('repairRequests.table.assetName')}</Typography>
                    <Typography className={classes.value}>{selectedItem.asset_name}</Typography>
                </div>
                <div className={classes.row}>
                    <Typography className={classes.label}>{t('repairRequests.table.requestedBy')}</Typography>
                    <Typography className={classes.value}>{selectedItem.requested_by_name}</Typography>
                </div>
                <div className={classes.row}>
                    <Typography className={classes.label}>{t('repairRequests.modal.descriptionLabel')}</Typography>
                    <Typography className={classes.value}>{selectedItem.description || '—'}</Typography>
                </div>
                <div className={classes.row}>
                    <Typography className={classes.label}>{t('repairRequests.table.requestDate')}</Typography>
                    <Typography className={classes.value}>{requestDate}</Typography>
                </div>
                <div className={classes.row}>
                    <Typography className={classes.label}>{t('repairRequests.table.status')}</Typography>
                    <Typography className={classes.value}>
                        {t('repairRequests.status.' + selectedItem.status) || selectedItem.status}
                    </Typography>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="contained">{t('repairRequests.common.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

RepairRequestViewModal.propTypes = {
    dispatch: PropTypes.func.isRequired,
    selectedItem: PropTypes.object,
};

RepairRequestViewModal.defaultProps = {
    selectedItem: null,
};

const mapStateToProps = (state) => ({
    selectedItem: state.repairRequest.selectedItem,
});

export default connect(mapStateToProps)(RepairRequestViewModal);
