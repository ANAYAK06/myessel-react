import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Users, RefreshCw, Clock, UserCheck } from 'lucide-react';
import InboxHeader from '../../components/Inbox/InboxHeader';
import InboxSplitLayout from '../../components/Inbox/InboxSplitLayout';
import ActionButtons from '../../components/Inbox/ActionButtons';
import VerificationInput from '../../components/Inbox/VerificationInput';
import {
    fetchVerifyBulkWorkerList,
    fetchBulkWorkerDataById,
    approveBulkWorkerRegistration,
    setSelectedBatch,
    resetAll,
    selectVerificationListArray,
    selectSelectedBatch,
    selectBatchDetailArray,
    selectListLoading,
    selectDetailLoading,
    selectApproveLoading,
    selectListError,
    selectDetailError,
} from '../../slices/HRSlice/bulkWorkerVerificationSlice';
import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    setShowReturnButton,
    resetApprovalData,
} from '../../slices/CommonSlice/getStatusSlice';

const DETAIL_COLUMNS = [
    { key: 'SerialNo',      label: 'S.No' },
    { key: 'FirstName',     label: 'First Name' },
    { key: 'LastName',      label: 'Last Name' },
    { key: 'CostCenter',    label: 'Cost Center' },
    { key: 'LabourType',    label: 'Labour Type' },
    { key: 'ContractorCode',label: 'Contractor' },
    { key: 'Group',         label: 'Group' },
    { key: 'DOB',           label: 'DOB' },
    { key: 'JoiningDate',   label: 'Joining Date' },
    { key: 'Gender',        label: 'Gender' },
    { key: 'MobileNo',      label: 'Mobile' },
    { key: 'JobType',       label: 'Job Type' },
    { key: 'Department',    label: 'Dept' },
    { key: 'AadharNo',      label: 'Aadhar' },
    { key: 'BankName',      label: 'Bank' },
    { key: 'IFSCCode',      label: 'IFSC' },
    { key: 'BankAccountNo', label: 'Acc No' },
    { key: 'IsPFExist',     label: 'PF' },
    { key: 'IsESIExist',    label: 'ESI' },
    { key: 'UANNumber',     label: 'UAN' },
    { key: 'Designation',   label: 'Designation' },
];

const VerifyBulkWorker = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;

    const verificationList = useSelector(selectVerificationListArray);
    const selectedBatch    = useSelector(selectSelectedBatch);
    const batchDetail      = useSelector(selectBatchDetailArray);
    const listLoading      = useSelector(selectListLoading);
    const detailLoading    = useSelector(selectDetailLoading);
    const approveLoading   = useSelector(selectApproveLoading);
    const listError        = useSelector(selectListError);
    const detailError      = useSelector(selectDetailError);
    const enabledActions   = useSelector(selectEnabledActions);

    const [searchQuery,          setSearchQuery]          = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [isVerified,           setIsVerified]           = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Init
    useEffect(() => {
        console.log('🎯 VerifyBulkWorker mounted. RoleID:', roleId);
        if (roleId) dispatch(fetchVerifyBulkWorkerList(roleId));
        dispatch(setShowReturnButton('No'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
        };
    }, [dispatch, roleId]);

    // Auto-collapse left panel when a batch is selected
    useEffect(() => {
        if (selectedBatch) setIsLeftPanelCollapsed(true);
    }, [selectedBatch]);

    // Fetch action buttons when batch is selected
    useEffect(() => {
        if (selectedBatch?.MOID && roleId) {
            console.log('📊 Fetching Status List for MOID:', selectedBatch.MOID);
            dispatch(fetchStatusList({
                MOID: selectedBatch.MOID,
                ROID: roleId,
                ChkAmt: 0,
            }));
        }
    }, [selectedBatch?.MOID, roleId, dispatch]);

    const getCurrentUser = () => userData?.userName || userData?.UID || 'system';

    const handleBatchSelect = (batch) => {
        console.log('✅ Selected Batch:', batch);
        dispatch(setSelectedBatch(batch));
        dispatch(fetchBulkWorkerDataById({
            transRefno: batch.TransactionRefNo,
            id: batch.Id || 0,
        }));
        setVerificationComment('');
        setIsVerified(false);
    };

    const buildApprovalPayload = (actionValue) => ({
        lstWorker:        batchDetail,
        createdBy:        getCurrentUser(),
        roleId,
        moid:             selectedBatch?.MOID || 0,
        action:           actionValue,
        transactionRefNo: selectedBatch?.TransactionRefNo || '',
        id:               selectedBatch?.Id || 0,
        workerCount:      batchDetail.length,
        note:             verificationComment,
    });

    const handleActionClick = async (action) => {
        if (!selectedBatch) { toast.error('No batch selected'); return; }
        if (!verificationComment.trim()) {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }
        if (!isVerified) {
            toast.error('Please verify the worker details by checking the verification checkbox.');
            return;
        }

        const actionValue = action.value || action.text || action.type || 'Verify';
        try {
            await dispatch(approveBulkWorkerRegistration(buildApprovalPayload(actionValue))).unwrap();
            toast.success(`${action.text || actionValue} completed successfully!`);
            setTimeout(() => {
                handleRefresh();
                dispatch(resetApprovalData());
            }, 1000);
        } catch (error) {
            const msg = typeof error === 'string' ? error : error?.message || `Failed to ${actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    const handleRefresh = () => {
        if (roleId) dispatch(fetchVerifyBulkWorkerList(roleId));
        dispatch(setSelectedBatch(null));
        setIsLeftPanelCollapsed(false);
        setIsVerified(false);
        setVerificationComment('');
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const filteredItems = verificationList.filter(batch => {
        const q = searchQuery.toLowerCase();
        return q === '' ||
            batch.TransactionRefNo?.toString().toLowerCase().includes(q) ||
            (batch.Createdby || batch.CreatedBy)?.toString().toLowerCase().includes(q);
    });

    const renderItemCard = (item, isSelected) => (
        <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {item.TransactionRefNo || 'Unknown Batch'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        By: {item.Createdby || item.CreatedBy || '-'}
                    </p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                    <UserCheck className="w-3 h-3" />
                    <span>{item.WorkerCount || 0} workers</span>
                </span>
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    {item.Status || 'Pending'}
                </span>
            </div>
        </div>
    );

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[160px]">
                {item.TransactionRefNo || 'Unknown Batch'}
            </span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[130px]">
                By: {item.Createdby || item.CreatedBy || '-'}
            </span>
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-[100px]">
                <UserCheck className="w-3 h-3" />
                {item.WorkerCount || 0} workers
            </span>
            <span className="ml-auto px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium whitespace-nowrap">
                {item.Status || 'Pending'}
            </span>
        </div>
    );

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedBatch) return null;

        return (
            <div className="space-y-6">
                {/* CUSTOM HEADER */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    Bulk Worker Registration Verification
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                                    {selectedBatch.TransactionRefNo}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                        Created by: {selectedBatch.Createdby || selectedBatch.CreatedBy || '-'}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                        Status: {selectedBatch.Status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Worker Count</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {selectedBatch.WorkerCount || batchDetail.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Worker table */}
                {detailLoading ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                            <span className="text-blue-700 dark:text-blue-400 text-sm">Loading worker data...</span>
                        </div>
                    </div>
                ) : detailError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                        <p className="text-red-600 dark:text-red-400 text-center">{detailError}</p>
                    </div>
                ) : batchDetail.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Worker Details</h3>
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                                {batchDetail.length} workers
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                                <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                    <tr>
                                        {DETAIL_COLUMNS.map(col => (
                                            <th
                                                key={col.key}
                                                className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-semibold uppercase tracking-wider whitespace-nowrap"
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {batchDetail.map((w, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                            {DETAIL_COLUMNS.map(col => (
                                                <td
                                                    key={col.key}
                                                    className={`px-3 py-2 whitespace-nowrap ${col.key === 'FirstName' ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                                                >
                                                    {w[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                        <p className="text-yellow-700 dark:text-yellow-400 text-center">No worker data available for this batch</p>
                    </div>
                )}

                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have verified all worker registration details in this batch',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Enter approval note or return reason...',
                        commentRequired: true,
                        commentRows: 3,
                    }}
                />

                <ActionButtons
                    actions={enabledActions}
                    onActionClick={handleActionClick}
                    loading={approveLoading}
                    isVerified={isVerified}
                    comment={verificationComment}
                    showValidation={true}
                />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'Bulk Worker Registration Verification'} (${verificationList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verificationList.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Users}
                badgeText="Bulk Worker Registration"
                badgeCount={verificationList.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by transaction ref or creator...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                enableViewToggle
            />

            <InboxSplitLayout
                isLeftPanelCollapsed={isLeftPanelCollapsed}
                onLeftPanelCollapseToggle={setIsLeftPanelCollapsed}
                isLeftPanelHovered={isLeftPanelHovered}
                onLeftPanelHoverChange={setIsLeftPanelHovered}
                left={{
                    items: filteredItems,
                    selectedItem: selectedBatch,
                    onItemSelect: handleBatchSelect,
                    renderItem: renderItemCard,
                    renderListItem: renderListItem,
                    renderCollapsedItem: renderCollapsedItem,
                    loading: listLoading,
                    error: listError,
                    onRefresh: handleRefresh,
                    config: {
                        title: 'Pending Verification',
                        icon: Clock,
                        emptyMessage: 'No bulk worker batches pending.',
                        itemKey: 'TransactionRefNo',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Bulk Worker Registration Verification',
                        icon: Users,
                        headerGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedBatch,
                    loading: false,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Batch Details',
                        icon: Users,
                        selectedTitle: 'Bulk Worker Registration Verification',
                        emptyTitle: 'No Batch Selected',
                        emptyMessage: 'Select a batch from the list to review and verify worker registrations.',
                        headerGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        maxHeight: 'calc(100vh - 200px)',
                        sticky: true,
                        stickyTop: '1.5rem',
                    },
                }}
            />
        </div>
    );
};

export default VerifyBulkWorker;
