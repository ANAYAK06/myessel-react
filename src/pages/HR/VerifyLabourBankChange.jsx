import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    CreditCard, Clock, User, Hash,
    Banknote, ArrowRight, Calendar, Building2,
    CheckCircle2, AlertCircle
} from 'lucide-react';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyLBBankChange,
    fetchLBBankChangeById,
    approveLBBankChange,
    clearApprovalResult,
    resetChangeDetail,
    resetAll,
    selectInbox,
    selectChangeDetail,
    selectApprovalResult,
    selectLoading,
    selectErrors,
} from '../../slices/HRSlice/labourBankChangeSlice';

import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID,
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton,
} from '../../slices/CommonSlice/getStatusSlice';

// Bank Change MOID — update if the backend uses a different value
const BANK_CHANGE_MOID = 680;

// ── Component ─────────────────────────────────────────────────────────────────

const VerifyLabourBankChange = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const inbox          = useSelector(selectInbox);
    const changeDetail   = useSelector(selectChangeDetail);
    const approvalResult = useSelector(selectApprovalResult);
    const loading        = useSelector(selectLoading);
    const errors         = useSelector(selectErrors);

    const remarks        = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId || userData?.RID;
    const userName = userData?.userName || userDetails?.userName || 'system';

    // Local UI state
    const [selectedItem,         setSelectedItem]         = useState(null);
    const [isVerified,           setIsVerified]           = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const getCurrentRoleName = () =>
        userDetails?.roleName || userData?.roleName ||
        notificationData?.InboxTitle || 'Bank Change Verifier';

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId) dispatch(fetchVerifyLBBankChange(roleId));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    // Fetch detail when item selected
    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchLBBankChangeById({
            labourId: selectedItem.LabourId,
            id:       selectedItem.Id || selectedItem.BankChangeId || selectedItem.RequestId,
        }));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
    }, [selectedItem, dispatch]);

    // Fetch workflow status & remarks when detail loads
    useEffect(() => {
        if (!selectedItem || !roleId || !changeDetail) return;
        const moid = changeDetail?.MOID || BANK_CHANGE_MOID;
        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        dispatch(setSelectedMOID(moid));
        dispatch(fetchRemarks({
            trno: changeDetail.Id || changeDetail.TransactionRefno || '',
            moid,
        }));
    }, [selectedItem, roleId, changeDetail, dispatch]);

    // Collapse left panel when item selected
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Action handlers ───────────────────────────────────────────────────────

    const handleRefresh = () => {
        if (roleId) dispatch(fetchVerifyLBBankChange(roleId));
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const buildPayload = (actionValue) => {
        console.log('changeDetail fields:', changeDetail ? Object.keys(changeDetail) : 'null');
        console.log('changeDetail values:', changeDetail);
        const roleName = getCurrentRoleName();
        const existingRemarks = changeDetail?.Remarks || '';
        const formatted = `${roleName} : ${userName} : ${verificationComment.trim()}`;
        const updatedRemarks = existingRemarks.trim()
            ? `${existingRemarks.trim()}||${formatted}`
            : formatted;

        return {
            Id:               changeDetail?.Id || selectedItem?.Id || selectedItem?.BankChangeId || 0,
            LabourId:         changeDetail?.LabourId || selectedItem?.LabourId || '',
            TransactionRefNo: changeDetail?.TransactionRefNo || changeDetail?.TransactionRefno ||
                              selectedItem?.TransactionRefNo || selectedItem?.TransactionRefno || '',
            NewBankId:        changeDetail?.NewBankId || changeDetail?.NewBankid || changeDetail?.Bankid || changeDetail?.BankId || 0,
            NewBank:          changeDetail?.NewBank || changeDetail?.NewBankName || changeDetail?.BankName || '',
            NewAccountNo:     changeDetail?.NewAccountNo || changeDetail?.NewBankAccountNo || changeDetail?.BankAccountNo || '',
            NewIFSC:          changeDetail?.NewIFSC || changeDetail?.NewIFSCcode || changeDetail?.IFSCcode || '',
            NewAddress:       changeDetail?.NewAddress || changeDetail?.NewBankAddress || changeDetail?.BankAddress || '',
            OldBankid:        changeDetail?.OldBankId || changeDetail?.OldBankid || 0,
            BankApplicableFrom: changeDetail?.BankApplicableFrom || changeDetail?.NewApplicableFrom || changeDetail?.ApplicableFrom || '',
            RoleId:           roleId,
            Createdby:        userName,
            Action:           actionValue,
            ApprovalNote:     verificationComment.trim(),
            Remarks:          updatedRemarks,
        };
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No bank change record selected.'); return; }
        if (!verificationComment.trim()) {
            toast.error('Verification comment is mandatory.');
            return;
        }
        if (!isVerified) {
            toast.error('Please check the verification checkbox before proceeding.');
            return;
        }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const payload = buildPayload(actionValue);
            console.log('Approval payload:', payload);
            const result = await dispatch(approveLBBankChange(payload)).unwrap();
            const msg = typeof result === 'string' ? result : JSON.stringify(result);
            toast.success(`${action.text || actionValue} completed successfully!`);
            if (msg.includes('$')) {
                const info = msg.split('$')[1];
                if (info) setTimeout(() => toast.info(info, { autoClose: 6000 }), 500);
            }

            setTimeout(() => {
                dispatch(fetchVerifyLBBankChange(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetChangeDetail());
                dispatch(resetApprovalData());
                dispatch(clearApprovalResult());
            }, 1000);
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || `Failed to ${actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered inbox ────────────────────────────────────────────────────────

    const filteredItems = inbox.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.LabourName?.toLowerCase().includes(q) ||
            item.LabourId?.toLowerCase().includes(q) ||
            item.TransactionRefNo?.toLowerCase().includes(q) ||
            item.TransactionRefno?.toLowerCase().includes(q)
        );
    });

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.LabourName || item.EmpName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.LabourId}</p>
                </div>
            </div>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {(item.TransactionRefNo || item.TransactionRefno) && (
                    <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span className="truncate">{item.TransactionRefNo || item.TransactionRefno}</span>
                    </div>
                )}
                {item.RequestDate && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.RequestDate}</span>
                    </div>
                )}
                {item.LabourType && (
                    <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                        {item.LabourType}
                    </span>
                )}
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail panel ──────────────────────────────────────────────────────────

    const BankCard = ({ title, data, highlight }) => (
        <div className={`rounded-xl border-2 p-4 ${highlight
            ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40'}`}>
            <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {title}
            </p>
            <div className="space-y-2 text-sm">
                {[
                    { label: 'Bank Name',   value: data?.BankName || data?.NewBankName || data?.OldBankName },
                    { label: 'Account No.', value: data?.BankAccountNo || data?.NewAccountNo || data?.OldAccountNo, mono: true },
                    { label: 'IFSC',        value: data?.IFSCcode || data?.NewIFSC || data?.OldIFSC || data?.IFSC, mono: true },
                    { label: 'Address',     value: data?.BankAddress || data?.NewAddress || data?.OldAddress },
                    { label: 'Applicable From', value: data?.BankApplicableFrom || data?.ApplicableFrom },
                ].map(({ label, value, mono }) => value ? (
                    <div key={label} className="flex items-start gap-2">
                        <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0 text-xs pt-0.5">{label}</span>
                        <span className={`font-medium text-gray-900 dark:text-white ${mono ? 'font-mono tracking-wide' : ''}`}>
                            {value}
                        </span>
                    </div>
                ) : null)}
            </div>
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedItem) return null;
        const detail = changeDetail;

        return (
            <div className="space-y-6">
                {loading.detail && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading bank change details...</span>
                    </div>
                )}

                {/* Header card */}
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                            <CreditCard className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {detail?.LabourName || selectedItem?.LabourName || selectedItem?.EmpName}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">
                                {detail?.LabourId || selectedItem?.LabourId}
                                {(detail?.TransactionRefNo || selectedItem?.TransactionRefNo || selectedItem?.TransactionRefno) &&
                                    ` · ${detail?.TransactionRefNo || selectedItem?.TransactionRefNo || selectedItem?.TransactionRefno}`}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {(detail?.LabourType || selectedItem?.LabourType) && (
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {detail?.LabourType || selectedItem?.LabourType}
                                    </span>
                                )}
                                {(detail?.ContractorName || selectedItem?.ContractorName) && (
                                    <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {detail?.ContractorName || selectedItem?.ContractorName}
                                    </span>
                                )}
                                {(detail?.RequestDate || selectedItem?.RequestDate) && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {detail?.RequestDate || selectedItem?.RequestDate}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Old vs New bank details */}
                {detail && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Existing Bank</span>
                            </div>
                            <BankCard title="Current / Old Details" data={{
                                BankName:       detail.OldBankName,
                                BankAccountNo:  detail.OldAccountNo || detail.OldBankAccountNo,
                                IFSCcode:       detail.OldIFSC || detail.OldIFSCcode,
                                BankAddress:    detail.OldBankAddress || detail.OldAddress,
                                ApplicableFrom: detail.OldApplicableFrom,
                            }} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Requested Change</span>
                            </div>
                            <BankCard title="New Details" highlight data={{
                                BankName:       detail.NewBankName || detail.BankName,
                                BankAccountNo:  detail.NewAccountNo || detail.NewBankAccountNo || detail.BankAccountNo,
                                IFSCcode:       detail.NewIFSC || detail.NewIFSCcode || detail.IFSCcode,
                                BankAddress:    detail.NewBankAddress || detail.NewAddress || detail.BankAddress,
                                ApplicableFrom: detail.NewApplicableFrom || detail.BankApplicableFrom,
                            }} />
                        </div>
                    </div>
                )}

                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={remarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have verified the bank change details',
                        checkboxDescription: 'Confirm that the new account number, IFSC and bank name are correct',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Enter your verification remarks...',
                        commentRequired: true,
                        commentRows: 3,
                        commentMaxLength: 500,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        commentBorder: 'border-indigo-200 dark:border-indigo-700',
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-700 text-center text-sm text-red-600 dark:text-red-400">
                        ⚠️ Error loading actions: {statusError}
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700 text-center text-sm text-yellow-700 dark:text-yellow-400">
                        ℹ️ No actions available for this record
                    </div>
                ) : (
                    <ActionButtons
                        actions={enabledActions}
                        onActionClick={handleActionClick}
                        loading={loading.approval}
                        isVerified={isVerified}
                        comment={verificationComment}
                        showValidation={true}
                        excludeActions={['send back']}
                    />
                )}
            </div>
        );
    };

    // ── Stats cards ───────────────────────────────────────────────────────────

    const statsCards = [
        { icon: CreditCard, value: inbox.length,    label: 'Total Records',        color: 'indigo' },
        { icon: Clock,       value: inbox.length,    label: 'Pending Verification', color: 'purple' },
        { icon: User,        value: changeDetail?.LabourType || '—', label: 'Labour Type', color: 'blue' },
        { icon: Banknote,    value: changeDetail ? '1' : '—', label: 'Selected',    color: 'violet' },
    ];

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'Labour Bank Change Verification'} (${inbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={inbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={CreditCard}
                badgeText="Bank Change"
                badgeCount={inbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, labour ID, ref no...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
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
                        if (selectedItem && isLeftPanelCollapsed) setIsLeftPanelHovered(false);
                    }}
                >
                    {/* Left panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <LeftPanel
                            items={filteredItems}
                            selectedItem={selectedItem}
                            onItemSelect={setSelectedItem}
                            renderItem={renderItemCard}
                            renderCollapsedItem={renderCollapsedItem}
                            isCollapsed={isLeftPanelCollapsed}
                            onCollapseToggle={setIsLeftPanelCollapsed}
                            isHovered={isLeftPanelHovered}
                            onHoverChange={setIsLeftPanelHovered}
                            loading={loading.inbox}
                            error={errors.inbox}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No bank change requests pending.',
                                itemKey: 'Id',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                            }}
                        />
                    </div>

                    {/* Right panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg">
                                    <CreditCard className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {selectedItem ? 'Bank Change Verification' : 'Bank Change Details'}
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? renderDetailContent() : (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Record Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Select a bank change request from the list to review and verify.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default VerifyLabourBankChange;
