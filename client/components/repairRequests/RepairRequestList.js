import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import {
    searchRepairRequests,
    fetchRepairRequestById,
    deleteRepairRequests,
    setSelectedIds,
    setModalMode,
    clearError,
} from '../../actions/repairRequestAction';
import { searchAssets, searchEmployees } from '../../services/repairRequestService';
import AutocompleteField from './AutocompleteField';
import RepairRequestAddModal from './RepairRequestAddModal';
import RepairRequestEditModal from './RepairRequestEditModal';
import RepairRequestViewModal from './RepairRequestViewModal';
import UpdateStatusModal from './UpdateStatusModal';

const useStyles = makeStyles(() => ({
    root: { padding: 24 },
    searchRow: { display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-end', flexWrap: 'wrap' },
    searchCol: { flex: 1, minWidth: 200 },
    actionRow: { display: 'flex', gap: 8, marginBottom: 16 },
    tableWrapper: { overflowX: 'auto' },
    paginationRow: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 16, flexWrap: 'wrap' },
    iconDisabled: { opacity: 0.3, pointerEvents: 'none' },
    rowSelected: { backgroundColor: '#E8F5E9' },
    rowCancelled: { backgroundColor: '#F5F5F5' },
    rowDone: { backgroundColor: '#F1F8F4' },
    rowDefault: { backgroundColor: '#fff' },
    emptyState: { textAlign: 'center', padding: 32, color: '#888' },
}));

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * Repair Request list page component.
 *
 * @param {object} props
 * @returns {React.ReactElement}
 */
const RepairRequestList = ({
    items,
    total,
    page,
    pageSize,
    selectedIds,
    modalMode,
    error,
    successMessage,
    dispatch,
}) => {
    const { t } = useTranslation();
    const classes = useStyles();

    const [filterAssetId, setFilterAssetId] = useState(null);
    const [filterRequestedBy, setFilterRequestedBy] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [currentSort, setCurrentSort] = useState({ field: 'request_date', dir: 'desc' });
    const [clearCount, setClearCount] = useState(0);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null });
    const [successDialog, setSuccessDialog] = useState(false);
    const [successMessageLocal, setSuccessMessageLocal] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const buildSearchParams = (overrides = {}) => ({
        assetId: filterAssetId || undefined,
        requestedBy: filterRequestedBy || undefined,
        status: filterStatus || undefined,
        page,
        pageSize,
        sortField: currentSort.field,
        sortDir: currentSort.dir,
        ...overrides,
    });

    useEffect(() => {
        dispatch(searchRepairRequests({ page: 1, pageSize: 10, sortField: 'request_date', sortDir: 'desc' }));
        setHasSearched(true);
    }, []);

    useEffect(() => {
        if (error && error.source !== 'create') {
            setToastMessage(error.message || t('repairRequests.errorGeneral'));
            setToastOpen(true);
        }
    }, [error]);

    useEffect(() => {
        if (successMessage) {
            setSuccessMessageLocal(successMessage);
            setSuccessDialog(true);
        }
    }, [successMessage]);

    const handleSearch = () => {
        setHasSearched(true);
        dispatch(searchRepairRequests(buildSearchParams({ page: 1 })));
    };

    const handleClear = () => {
        setFilterAssetId(null);
        setFilterRequestedBy(null);
        setFilterStatus('');
        setCurrentSort({ field: 'request_date', dir: 'desc' });
        setClearCount((c) => c + 1);
        setHasSearched(true);
        dispatch(searchRepairRequests({ page: 1, pageSize: 10, sortField: 'request_date', sortDir: 'desc' }));
    };

    const handleSort = (field) => {
        const newDir = currentSort.field === field && currentSort.dir === 'asc' ? 'desc' : 'asc';
        const newSort = { field, dir: newDir };
        setCurrentSort(newSort);
        dispatch(searchRepairRequests(buildSearchParams({ sortField: field, sortDir: newDir, page: 1 })));
    };

    const selectableItems = items.filter((r) => r.status !== 'done');

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            dispatch(setSelectedIds(selectableItems.map((r) => r.id)));
        } else {
            dispatch(setSelectedIds([]));
        }
    };

    const handleSelectRow = (id) => {
        const next = selectedIds.includes(id)
            ? selectedIds.filter((x) => x !== id)
            : [...selectedIds, id];
        dispatch(setSelectedIds(next));
    };

    const handleAdd = () => {
        dispatch(clearError());
        dispatch(setModalMode('add'));
    };

    const handleEdit = (row) => {
        dispatch(fetchRepairRequestById(row.id))
            .then(() => { dispatch(setModalMode('edit')); })
            .catch(() => {});
    };

    const handleView = (row) => {
        dispatch(fetchRepairRequestById(row.id))
            .then(() => { dispatch(setModalMode('view')); })
            .catch(() => {});
    };

    const handleUpdateStatus = (row) => {
        dispatch(fetchRepairRequestById(row.id))
            .then(() => { dispatch(setModalMode('updateStatus')); })
            .catch(() => {});
    };

    const handleDeleteClick = () => {
        if (selectedIds.length === 0) {
            setDeleteDialog({ open: true, type: 'noSelection' });
        } else {
            setDeleteDialog({ open: true, type: 'confirm' });
        }
    };

    const handleDeleteConfirm = () => {
        setDeleteDialog({ open: false, type: null });
        dispatch(deleteRepairRequests(selectedIds, buildSearchParams({ page: 1 })));
    };

    const handlePageChange = (newPage) => {
        dispatch(searchRepairRequests(buildSearchParams({ page: newPage })));
    };

    const handlePageSizeChange = (e) => {
        dispatch(searchRepairRequests(buildSearchParams({ page: 1, pageSize: e.target.value })));
    };

    const totalPages = Math.ceil(total / pageSize) || 1;

    const getRowClass = (row) => {
        if (selectedIds.includes(row.id)) return classes.rowSelected;
        if (row.status === 'cancelled') return classes.rowCancelled;
        if (row.status === 'done') return classes.rowDone;
        return classes.rowDefault;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN');
    };

    return (
        <div className={classes.root}>
            <Typography variant="h5" gutterBottom>{t('repairRequests.title')}</Typography>

            {/* Search section */}
            <div className={classes.searchRow}>
                <div className={classes.searchCol}>
                    <AutocompleteField
                        key={`asset-${clearCount}`}
                        label={t('repairRequests.table.assetCode')}
                        fetchSuggestions={searchAssets}
                        displayFormat={(item) => `${item.asset_code} - ${item.name}`}
                        onSelect={(id) => setFilterAssetId(id)}
                    />
                </div>
                <div className={classes.searchCol}>
                    <AutocompleteField
                        key={`emp-${clearCount}`}
                        label={t('repairRequests.table.requestedBy')}
                        fetchSuggestions={searchEmployees}
                        displayFormat={(item) => `${item.employee_code} - ${item.full_name}`}
                        onSelect={(id) => setFilterRequestedBy(id)}
                    />
                </div>
                <div className={classes.searchCol}>
                    <FormControl fullWidth>
                        <InputLabel>{t('repairRequests.table.status')}</InputLabel>
                        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <MenuItem value="">{t('repairRequests.status.all')}</MenuItem>
                            <MenuItem value="open">{t('repairRequests.status.open')}</MenuItem>
                            <MenuItem value="in_progress">{t('repairRequests.status.in_progress')}</MenuItem>
                            <MenuItem value="done">{t('repairRequests.status.done')}</MenuItem>
                            <MenuItem value="cancelled">{t('repairRequests.status.cancelled')}</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <Button variant="contained" color="primary" onClick={handleSearch}>{t('repairRequests.common.search')}</Button>
                <Button variant="outlined" onClick={handleClear}>{t('repairRequests.common.clear')}</Button>
            </div>

            {/* Action buttons */}
            <div className={classes.actionRow}>
                <Button variant="contained" color="primary" onClick={handleAdd}>{t('repairRequests.common.add')}</Button>
                <Button variant="outlined" color="secondary" onClick={handleDeleteClick}>{t('repairRequests.common.delete')}</Button>
            </div>

            {/* Table */}
            <div className={classes.tableWrapper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selectedIds.length > 0 && selectedIds.length < selectableItems.length}
                                    checked={selectableItems.length > 0 && selectedIds.length === selectableItems.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={currentSort.field === 'id'}
                                    direction={currentSort.field === 'id' ? currentSort.dir : 'asc'}
                                    onClick={() => handleSort('id')}
                                >
                                    {t('repairRequests.table.id')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>{t('repairRequests.table.assetCode')}</TableCell>
                            <TableCell>{t('repairRequests.table.assetName')}</TableCell>
                            <TableCell>{t('repairRequests.table.requestedBy')}</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={currentSort.field === 'request_date'}
                                    direction={currentSort.field === 'request_date' ? currentSort.dir : 'asc'}
                                    onClick={() => handleSort('request_date')}
                                >
                                    {t('repairRequests.table.requestDate')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={currentSort.field === 'status'}
                                    direction={currentSort.field === 'status' ? currentSort.dir : 'asc'}
                                    onClick={() => handleSort('status')}
                                >
                                    {t('repairRequests.table.status')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>{t('repairRequests.table.action')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.length === 0 && hasSearched && (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <Typography className={classes.emptyState}>
                                        {t('repairRequests.notFound')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {items.map((row) => {
                            const isDone = row.status === 'done';
                            const isCancelled = row.status === 'cancelled';
                            const editDisabled = isDone;
                            const updateStatusDisabled = isDone || isCancelled;

                            return (
                                <TableRow key={row.id} className={getRowClass(row)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedIds.includes(row.id)}
                                            onChange={() => handleSelectRow(row.id)}
                                            disabled={row.status === 'done'}
                                        />
                                    </TableCell>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.asset_code}</TableCell>
                                    <TableCell>{row.asset_name}</TableCell>
                                    <TableCell>{row.requested_by_name}</TableCell>
                                    <TableCell>{formatDate(row.request_date)}</TableCell>
                                    <TableCell>{t('repairRequests.status.' + row.status) || row.status}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            className={editDisabled ? classes.iconDisabled : ''}
                                            onClick={() => !editDisabled && handleEdit(row)}
                                            title={t('repairRequests.modal.editTitle')}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleView(row)}
                                            title={t('repairRequests.modal.viewTitle')}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            className={updateStatusDisabled ? classes.iconDisabled : ''}
                                            onClick={() => !updateStatusDisabled && handleUpdateStatus(row)}
                                            title={t('repairRequests.modal.updateStatusTitle')}
                                        >
                                            <AutorenewIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className={classes.paginationRow}>
                <FormControl>
                    <Select value={pageSize} onChange={handlePageSizeChange}>
                        {PAGE_SIZE_OPTIONS.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography variant="body2">
                    {total === 0 ? `0–0 ${t('repairRequests.common.of')} 0` : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} ${t('repairRequests.common.of')} ${total}`}
                </Typography>
                <Button size="small" disabled={page <= 1} onClick={() => handlePageChange(1)}>{'|<'}</Button>
                <Button size="small" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>{'<'}</Button>
                <Button size="small" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>{'>'}</Button>
                <Button size="small" disabled={page >= totalPages} onClick={() => handlePageChange(totalPages)}>{'>|'}</Button>
            </div>

            {/* Modals */}
            {modalMode === 'add' && <RepairRequestAddModal />}
            {modalMode === 'edit' && <RepairRequestEditModal />}
            {modalMode === 'view' && <RepairRequestViewModal />}
            {modalMode === 'updateStatus' && <UpdateStatusModal />}

            {/* Delete dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: null })}>
                <DialogTitle>
                    {deleteDialog.type === 'noSelection'
                        ? t('repairRequests.dialog.noticeTitle')
                        : t('repairRequests.dialog.confirmTitle')}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {deleteDialog.type === 'noSelection'
                            ? t('repairRequests.deleteNoSelection')
                            : t('repairRequests.deleteConfirm', { count: selectedIds.length })}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    {deleteDialog.type === 'confirm' && (
                        <Button onClick={() => setDeleteDialog({ open: false, type: null })}>
                            {t('repairRequests.common.cancel')}
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color={deleteDialog.type === 'confirm' ? 'secondary' : 'primary'}
                        onClick={deleteDialog.type === 'confirm'
                            ? handleDeleteConfirm
                            : () => setDeleteDialog({ open: false, type: null })}
                    >
                        {t('repairRequests.common.ok')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success dialog */}
            <Dialog open={successDialog} onClose={() => setSuccessDialog(false)}>
                <DialogTitle>{t('repairRequests.dialog.noticeTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>{t(successMessageLocal)}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={() => setSuccessDialog(false)}>
                        {t('repairRequests.common.ok')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toast error */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={4000}
                onClose={() => setToastOpen(false)}
                message={toastMessage}
            />
        </div>
    );
};

RepairRequestList.propTypes = {
    items: PropTypes.array.isRequired,
    total: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    sortField: PropTypes.string.isRequired,
    sortDir: PropTypes.string.isRequired,
    selectedIds: PropTypes.array.isRequired,
    modalMode: PropTypes.string,
    error: PropTypes.object,
    successMessage: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
};

RepairRequestList.defaultProps = {
    modalMode: null,
    error: null,
    successMessage: null,
};

export default RepairRequestList;
