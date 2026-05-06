import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Users, RefreshCw } from 'lucide-react';
import LeftPanel from '../../components/Inbox/LeftPanel';
import InboxHeader from '../../components/Inbox/InboxHeader';
import ActionButtons from '../../components/Inbox/ActionButtons';
import VerificationInput from '../../components/Inbox/VerificationInput';
import StatsCards from '../../components/Inbox/StatsCards';
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
    const [verificationComment,  setVerificationComment]  = useState('');
    const [isVerified,           setIsVerified]           = useState(false);

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

    const getBatchName     = (batch) => batch?.TransactionRefNo || 'Unknown Batch';
    const getBatchPriority = (batch) => {
        const count = batch?.WorkerCount || 0;
        if (count >= 50) return 'High';
        if (count >= 20) return 'Medium';
        return 'Low';
    };

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
        if (onNavigate) onNavigate('inbox');
    };

    return (
        <div className="flex h-screen bg-slate-900">

            {/* ── Left Panel ───────────────────────────────────────── */}
            {!isLeftPanelCollapsed && (
                <LeftPanel
                    items={verificationList}
                    selectedItem={selectedBatch}
                    onItemSelect={handleBatchSelect}
                    loading={listLoading}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    getItemName={getBatchName}
                    getPriority={getBatchPriority}
                />
            )}

            {/* ── Right Panel ──────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <InboxHeader
                    title={notificationData?.InboxTitle || 'Bulk Worker Registration Verification'}
                    onBackClick={handleBackToInbox}
                    onRefreshClick={handleRefresh}
                    isCollapsed={isLeftPanelCollapsed}
                    onToggleCollapse={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                />

                {selectedBatch ? (
                    <>
                        {/* Stats */}
                        <StatsCards
                            items={[
                                { label: 'Transaction Ref',  value: selectedBatch.TransactionRefNo || '—' },
                                { label: 'Worker Count',     value: selectedBatch.WorkerCount || batchDetail.length || '—' },
                                { label: 'Created By',       value: selectedBatch.Createdby || selectedBatch.CreatedBy || '—' },
                                { label: 'Status',           value: selectedBatch.Status || 'Pending' },
                            ]}
                        />

                        {/* Batch worker table */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {detailLoading ? (
                                <div className="flex items-center justify-center h-40 gap-2 text-gray-400">
                                    <RefreshCw size={22} className="animate-spin text-blue-400" />
                                    <span>Loading worker data...</span>
                                </div>
                            ) : detailError ? (
                                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                                    <p className="text-red-400 text-sm">{detailError}</p>
                                </div>
                            ) : batchDetail.length > 0 ? (
                                <div className="bg-slate-800 rounded-xl border border-slate-700">
                                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
                                        <Users size={17} className="text-blue-400" />
                                        <h3 className="text-white font-semibold text-sm">Worker Details</h3>
                                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                            {batchDetail.length} workers
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-slate-700 sticky top-0 z-10">
                                                <tr>
                                                    {DETAIL_COLUMNS.map(col => (
                                                        <th
                                                            key={col.key}
                                                            className="px-3 py-2 text-left text-gray-300 font-medium whitespace-nowrap"
                                                        >
                                                            {col.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {batchDetail.map((w, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className={`border-b border-slate-700 hover:bg-slate-700/50 ${idx % 2 !== 0 ? 'bg-slate-800/40' : ''}`}
                                                    >
                                                        {DETAIL_COLUMNS.map(col => (
                                                            <td
                                                                key={col.key}
                                                                className={`px-3 py-2 whitespace-nowrap ${col.key === 'FirstName' ? 'text-white' : 'text-gray-300'}`}
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
                                <div className="flex items-center justify-center h-40 text-gray-500">
                                    <span>No worker data available for this batch</span>
                                </div>
                            )}
                        </div>

                        {/* Verification comment */}
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

                        {/* Action buttons */}
                        <ActionButtons
                            actions={enabledActions}
                            onActionClick={handleActionClick}
                            loading={approveLoading}
                            isVerified={isVerified}
                            comment={verificationComment}
                            showValidation={true}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <Users size={52} className="mb-4 text-gray-700" />
                        <p className="text-lg">Select a batch from the left panel to review</p>
                        {listError && (
                            <p className="text-red-400 text-sm mt-2">{listError}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyBulkWorker;
