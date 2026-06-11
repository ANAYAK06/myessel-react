import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Users, FileText, CheckCircle, Clock, AlertCircle,
    Building2, IdCard, CreditCard, Briefcase,
} from 'lucide-react';

import InboxHeader        from '../../components/Inbox/InboxHeader';
import StatsCards         from '../../components/Inbox/StatsCards';
import ActionButtons      from '../../components/Inbox/ActionButtons';
import LeftPanel          from '../../components/Inbox/LeftPanel';
import VerificationInput  from '../../components/Inbox/VerificationInput';
import RemarksHistory     from '../../components/Inbox/RemarksHistory';

import {
    fetchVerifyBulkWorkerList,
    fetchBulkWorkerDataById,
    approveBulkWorkerRegistration,
    setSelectedBatch,
    resetAll,
    selectVerificationListArray,
    selectSelectedBatch,
    selectBatchDetail,
    selectListLoading,
    selectDetailLoading,
    selectApproveLoading,
    selectListError,
    selectDetailError,
} from '../../slices/HRSlice/bulkWorkerVerificationSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    setShowReturnButton,
    resetApprovalData,
} from '../../slices/CommonSlice/getStatusSlice';

import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID,
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

// ── Column definitions — keys match the actual API lstWorker field names ───
const WORKER_COLUMNS = [
    { key: 'SerialNo',       label: 'S.No' },
    { key: 'FirstName',      label: 'First Name' },
    { key: 'LastName',       label: 'Last Name' },
    { key: 'FatherName',     label: 'Father Name' },
    { key: 'Gender',         label: 'Gender' },
    { key: 'DOB',            label: 'DOB' },
    { key: 'MobileNo',       label: 'Mobile' },
    { key: 'Designation',    label: 'Designation' },
    { key: 'Department',     label: 'Department' },
    { key: 'CostCenter',     label: 'Cost Center' },
    { key: 'Group',          label: 'Group' },
    { key: 'ContractorCode', label: 'Contractor' },
    { key: 'LabourType',     label: 'Labour Type' },
    { key: 'JobType',        label: 'Job Type' },
    { key: 'JoiningDate',    label: 'Joining Date' },
    { key: 'AadharNo',       label: 'Aadhar' },
    { key: 'BankName',       label: 'Bank' },
    { key: 'IFSCCode',       label: 'IFSC' },
    { key: 'BankAccountNo',  label: 'Account No' },
    { key: 'BankAddress',    label: 'Bank Branch' },
    { key: 'ESINumber',      label: 'ESI No' },
    { key: 'UANNumber',      label: 'UAN' },
];

const VerifyWorkerStaffReg = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ── Auth ────────────────────────────────────────────────────────────────
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;

    // ── Selectors ───────────────────────────────────────────────────────────
    const verificationList = useSelector(selectVerificationListArray);
    const selectedBatch    = useSelector(selectSelectedBatch);
    // API returns Data.lstWorker — selectBatchDetail gives us the whole Data object
    const batchDetailRaw   = useSelector(selectBatchDetail);
    const batchDetail      = Array.isArray(batchDetailRaw?.lstWorker) ? batchDetailRaw.lstWorker : [];
    const listLoading      = useSelector(selectListLoading);
    const detailLoading    = useSelector(selectDetailLoading);
    const approveLoading   = useSelector(selectApproveLoading);
    const listError        = useSelector(selectListError);
    const detailError      = useSelector(selectDetailError);
    const enabledActions   = useSelector(selectEnabledActions);
    const remarks          = useSelector(selectRemarks);
    const remarksLoading   = useSelector(selectRemarksLoading);

    // ── Local state ─────────────────────────────────────────────────────────
    const [searchQuery,          setSearchQuery]          = useState('');
    const [filterStatus,         setFilterStatus]         = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [isVerified,           setIsVerified]           = useState(false);
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ── Init ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (roleId) {
            console.log('🎯 VerifyWorkerStaffReg mounted. RoleID:', roleId);
            dispatch(fetchVerifyBulkWorkerList(roleId));
        }
        dispatch(setShowReturnButton('No'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
        };
    }, [dispatch, roleId]);

    // ── Auto-collapse left panel when batch selected ─────────────────────────
    useEffect(() => {
        if (selectedBatch) setIsLeftPanelCollapsed(true);
    }, [selectedBatch]);

    // ── Fetch status list + remarks once detail loads (MOID lives in batchDetailRaw) ──
    useEffect(() => {
        if (!selectedBatch || !batchDetailRaw?.MOID || !roleId) return;
        const moid = Number(batchDetailRaw.MOID);
        const trno = String(selectedBatch.TransactionRefNo || '');
        console.log('📊 Fetching Status List — MOID:', moid, 'ROID:', roleId);
        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        console.log('💬 Fetching Remarks — trno:', trno, 'MOID:', moid);
        dispatch(setSelectedMOID(moid));
        dispatch(fetchRemarks({ trno, moid }));
    }, [selectedBatch, batchDetailRaw?.MOID, roleId, dispatch]);

    // ── Helpers ─────────────────────────────────────────────────────────────
    const getBatchName = (batch) => batch?.TransactionRefNo || 'Unknown Batch';

    const getBatchPriority = (batch) => {
        const count = batch?.WorkerCount || 0;
        if (count >= 50) return 'High';
        if (count >= 20) return 'Medium';
        return 'Low';
    };

    const getCurrentUser = () => userData?.userName || userData?.UID || 'system';

    // ── Event handlers ───────────────────────────────────────────────────────
    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleRefresh = () => {
        if (roleId) dispatch(fetchVerifyBulkWorkerList(roleId));
        dispatch(setSelectedBatch(null));
        setIsLeftPanelCollapsed(false);
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
        dispatch(resetApprovalData());
    };

    const handleBatchSelect = (batch) => {
        console.log('✅ Selected Batch:', batch);
        dispatch(setSelectedBatch(batch));
        dispatch(fetchBulkWorkerDataById({
            transRefno: batch.TransactionRefNo,
            id:         batch.Id || 0,
        }));
        setVerificationComment('');
        setIsVerified(false);
        setShowRemarksHistory(false);
    };

    const buildApprovalPayload = (actionValue) => ({
        lstWorker:        batchDetail,           // already the array from lstWorker
        createdBy:        getCurrentUser(),
        roleId,
        moid:             selectedBatch?.MOID || batchDetailRaw?.MOID || 0,
        action:           actionValue,
        transactionRefNo: selectedBatch?.TransactionRefNo || batchDetailRaw?.TransactionRefNo || '',
        id:               selectedBatch?.Id || batchDetailRaw?.Id || 0,
        workerCount:      batchDetail.length,
        note:             verificationComment,
    });

    const handleActionClick = async (action) => {
        if (!selectedBatch) {
            toast.error('No batch selected');
            return;
        }
        if (!verificationComment.trim()) {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }
        if (!isVerified) {
            toast.error('Please verify the worker details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const result = await dispatch(approveBulkWorkerRegistration(buildApprovalPayload(actionValue))).unwrap();
            if (result && typeof result === 'string') {
                if (result.includes('$')) {
                    const [, info] = result.split('$');
                    toast.success(`${action.text || actionValue} completed successfully!`);
                    if (info) setTimeout(() => toast.info(info, { autoClose: 6000 }), 500);
                } else {
                    toast.success(result || `${action.text || actionValue} completed successfully!`);
                }
            } else {
                toast.success(`${action.text || actionValue} completed successfully!`);
            }
            setTimeout(() => {
                dispatch(fetchVerifyBulkWorkerList(roleId));
                dispatch(setSelectedBatch(null));
                setVerificationComment('');
                setIsVerified(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetApprovalData());
            }, 1000);
        } catch (error) {
            const msg = typeof error === 'string' ? error : error?.message || `Failed to ${actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filter ───────────────────────────────────────────────────────────────
    const filteredList = verificationList.filter(batch => {
        const ref = (batch.TransactionRefNo || '').toLowerCase();
        const by  = (batch.CreatedBy || batch.Createdby || '').toLowerCase();
        const q   = searchQuery.toLowerCase();
        const matchesSearch = ref.includes(q) || by.includes(q);
        const matchesStatus = filterStatus === 'All' || batch.Status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statuses = [...new Set(verificationList.map(b => b.Status).filter(Boolean))];

    // ── Stats cards ──────────────────────────────────────────────────────────
    const statsCards = [
        { icon: FileText,    value: verificationList.length,                                                  label: 'Total Batches',  color: 'blue'   },
        { icon: AlertCircle, value: verificationList.filter(b => getBatchPriority(b) === 'High').length,      label: 'High Priority',  color: 'red'    },
        { icon: Users,       value: verificationList.reduce((s, b) => s + (b.WorkerCount || 0), 0),           label: 'Total Workers',  color: 'green'  },
        { icon: Clock,       value: verificationList.filter(b => b.Status === 'Pending').length,              label: 'Pending',        color: 'purple' },
    ];

    // ── Left panel item renderer ─────────────────────────────────────────────
    const renderItemCard = (batch) => {
        const priority = getBatchPriority(batch);
        const priorityColors = {
            High:   'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
            Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
            Low:    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
        };
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {batch.TransactionRefNo || 'Unknown Batch'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {batch.WorkerCount || 0} Workers
                        </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${priorityColors[priority]}`}>
                        {priority}
                    </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{batch.CreatedBy || batch.Createdby || '—'}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            {batch.Status || 'Pending'}
                        </span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">
                            {batch.MOID}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail content ───────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedBatch) return null;

        return (
            <div className="space-y-6">
                {/* Batch summary header */}
                <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start space-x-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {selectedBatch.TransactionRefNo}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                Bulk Worker Registration Batch
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                    {selectedBatch.WorkerCount || batchDetail.length} Workers
                                </span>
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                    {selectedBatch.Status || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        {[
                            { label: 'MOID',        value: selectedBatch.MOID },
                            { label: 'Created By',  value: selectedBatch.CreatedBy || selectedBatch.Createdby },
                            { label: 'Status',      value: selectedBatch.Status || 'Pending' },
                            { label: 'Worker Count',value: selectedBatch.WorkerCount || batchDetail.length },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Worker table */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-700">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center justify-between">
                        <span className="flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Worker Details
                        </span>
                        {detailLoading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                        )}
                        {!detailLoading && batchDetail.length > 0 && (
                            <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                                {batchDetail.length} workers
                            </span>
                        )}
                    </h4>

                    {detailLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3" />
                            <span className="text-indigo-600 dark:text-indigo-400 text-sm">Loading worker data...</span>
                        </div>
                    ) : detailError ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                            <p className="text-red-600 dark:text-red-400 text-sm">{detailError}</p>
                        </div>
                    ) : batchDetail.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-indigo-200 dark:border-indigo-600">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-indigo-600 dark:bg-indigo-800">
                                        {WORKER_COLUMNS.map(col => (
                                            <th
                                                key={col.key}
                                                className="px-3 py-2.5 text-left text-white font-semibold whitespace-nowrap"
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {batchDetail.map((worker, idx) => (
                                        <tr
                                            key={idx}
                                            className={`border-b border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors ${
                                                idx % 2 === 0
                                                    ? 'bg-white dark:bg-gray-800'
                                                    : 'bg-indigo-50/40 dark:bg-indigo-900/10'
                                            }`}
                                        >
                                            {WORKER_COLUMNS.map(col => (
                                                <td
                                                    key={col.key}
                                                    className={`px-3 py-2 whitespace-nowrap ${
                                                        col.key === 'FirstName'
                                                            ? 'font-semibold text-gray-900 dark:text-white'
                                                            : 'text-gray-600 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {worker[col.key] ?? '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                            <FileText className="w-8 h-8 mr-2 opacity-40" />
                            <span>No worker data available for this batch</span>
                        </div>
                    )}
                </div>

                {/* Batch identity cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Batch Info */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-5 rounded-xl border border-green-200 dark:border-green-700">
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2" /> Batch Information
                        </h4>
                        <div className="space-y-3 text-sm">
                            {[
                                { label: 'Transaction Ref No', value: selectedBatch.TransactionRefNo },
                                { label: 'MOID',               value: selectedBatch.MOID },
                                { label: 'Batch ID',           value: selectedBatch.Id },
                                { label: 'Created By',         value: selectedBatch.CreatedBy || selectedBatch.Createdby },
                                { label: 'Status',             value: selectedBatch.Status },
                            ].filter(({ value }) => value != null).map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-green-600 dark:text-green-400">{label}</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Worker summary */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-700">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                            <IdCard className="w-5 h-5 mr-2" /> Worker Summary
                        </h4>
                        <div className="space-y-3 text-sm">
                            {[
                                { label: 'Total Workers', value: batchDetail.length },
                                { label: 'With ESI No',   value: batchDetail.filter(w => w.ESINumber).length },
                                { label: 'With UAN',      value: batchDetail.filter(w => w.UANNumber).length },
                                { label: 'With Bank A/C', value: batchDetail.filter(w => w.BankAccountNo).length },
                                { label: 'With Aadhar',   value: batchDetail.filter(w => w.AadharNo).length },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-purple-600 dark:text-purple-400">{label}</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Approval history */}
                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(prev => !prev)}
                    remarks={Array.isArray(remarks) ? remarks : []}
                    loading={remarksLoading}
                    title="Approval History"
                />

                {/* Verification input */}
                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have verified all worker registration details in this batch',
                        checkboxDescription: 'Including personal information, employment details, bank details, and statutory information',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please provide detailed comments about the bulk worker registration verification...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-indigo-200 dark:border-indigo-700',
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
                    excludeActions={['send back', 'return']}
                />
            </div>
        );
    };

    // ── Main render ──────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'Worker & Staff Registration Verification'} (${verificationList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verificationList.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Users}
                badgeText="HR Verification"
                badgeCount={verificationList.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by batch ref, created by...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                filters={[
                    {
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        defaultLabel: 'All Statuses',
                        options: statuses,
                    },
                ]}
            />

            <div className="px-6 -mt-auto mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

            <div
                    className={`grid transition-all duration-300 ${
                        isLeftPanelCollapsed && !isLeftPanelHovered
                            ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                            : 'grid-cols-1 lg:grid-cols-3 gap-6'
                    }`}
                    onMouseLeave={() => {
                        if (selectedBatch && isLeftPanelCollapsed) setIsLeftPanelHovered(false);
                    }}
                >
                    {/* Left panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <LeftPanel
                            items={filteredList}
                            selectedItem={selectedBatch}
                            onItemSelect={handleBatchSelect}
                            renderItem={renderItemCard}
                            renderCollapsedItem={renderCollapsedItem}
                            isCollapsed={isLeftPanelCollapsed}
                            onCollapseToggle={setIsLeftPanelCollapsed}
                            isHovered={isLeftPanelHovered}
                            onHoverChange={setIsLeftPanelHovered}
                            loading={listLoading}
                            error={listError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No worker registration batches found!',
                                itemKey: 'Id',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                            }}
                        />
                    </div>

                    {/* Right panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedBatch ? 'Batch Registration Details' : 'Select a Batch'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedBatch ? renderDetailContent() : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Batch Selected</h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a registration batch from the list to view details and verify.
                                        </p>
                                        {listError && (
                                            <p className="text-red-500 dark:text-red-400 text-sm mt-3">{listError}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default VerifyWorkerStaffReg;
