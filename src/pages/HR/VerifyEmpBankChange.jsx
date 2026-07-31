import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    CreditCard, Clock,
    Calendar, Briefcase,
    CheckCircle2, AlertCircle
} from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyEmpBankChange,
    fetchEmpBankChangeById,
    approveEmpBankChange,
    clearApprovalResult,
    resetChangeDetail,
    resetAll,
    selectInbox,
    selectChangeDetail,
    selectApprovalResult,
    selectLoading,
    selectErrors,
} from '../../slices/HRSlice/empBankChangeSlice';

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

// Employee Bank Change MOID — the detail API (GetEmpBankChangebyId) returns the
// real MOID (WorkFlowLevelId) for each record, so this is only a fallback.
const BANK_CHANGE_MOID = 0;

// ── Component ─────────────────────────────────────────────────────────────────

const VerifyEmpBankChange = ({ notificationData, onNavigate }) => {
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

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId) dispatch(fetchVerifyEmpBankChange(roleId));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    // Fetch detail when item selected
    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchEmpBankChangeById({
            empRefNo: selectedItem.EmpRefNo,
            id:       selectedItem.Id,
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
            trno: changeDetail.Id || selectedItem.Id || '',
            moid,
        }));
    }, [selectedItem, roleId, changeDetail, dispatch]);

    // Collapse left panel when item selected
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Action handlers ───────────────────────────────────────────────────────

    const handleRefresh = () => {
        if (roleId) dispatch(fetchVerifyEmpBankChange(roleId));
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const buildPayload = (actionValue) => ({
        Id:                 changeDetail?.Id || selectedItem?.Id || 0,
        EmpRefNo:           changeDetail?.EmpRefNo || selectedItem?.EmpRefNo || '',
        NewBankId:          changeDetail?.NewBankId || 0,
        NewBank:            changeDetail?.NewBank || '',
        NewAccountNo:       changeDetail?.NewAccountNo || '',
        NewIFSC:            changeDetail?.NewIFSC || '',
        NewAddress:         changeDetail?.NewAddress || '',
        OldBankid:          changeDetail?.BankId || 0,
        BankApplicableFrom: changeDetail?.BankApplicableFrom || '',
        RoleId:             roleId,
        Createdby:          userName,
        Action:             actionValue,
        ApprovalNote:       verificationComment.trim(),
    });

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
            const result = await dispatch(approveEmpBankChange(payload)).unwrap();
            const msg = typeof result === 'string' ? result : JSON.stringify(result);
            toast.success(`${action.text || actionValue} completed successfully!`);
            if (msg.includes('$')) {
                const info = msg.split('$')[1];
                if (info) setTimeout(() => toast.info(info, { autoClose: 6000 }), 500);
            }

            setTimeout(() => {
                dispatch(fetchVerifyEmpBankChange(roleId));
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
            item.Name?.toLowerCase().includes(q) ||
            item.EmpRefNo?.toLowerCase().includes(q) ||
            item.CCName?.toLowerCase().includes(q)
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
                        {item.Name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.EmpRefNo}</p>
                </div>
            </div>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {item.DesignationName && (
                    <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        <span className="truncate">{item.DesignationName}</span>
                    </div>
                )}
                {item.CCName && (
                    <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                        {item.CCName}
                    </span>
                )}
            </div>
        </div>
    );

    // Compact single-line row for the "classic" list view — same fields as
    // renderItemCard, laid out horizontally instead of stacked.
    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[160px]">
                {item.Name}
            </span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[90px]">
                {item.EmpRefNo}
            </span>
            {item.DesignationName && (
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-[140px]">
                    <Briefcase className="w-3 h-3" />
                    {item.DesignationName}
                </span>
            )}
            {item.CCName && (
                <span className="ml-auto px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium whitespace-nowrap">
                    {item.CCName}
                </span>
            )}
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
                    { label: 'Bank Name',   value: data?.BankName },
                    { label: 'Account No.', value: data?.AccountNo, mono: true },
                    { label: 'IFSC',        value: data?.IFSC, mono: true },
                    { label: 'Address',     value: data?.Address },
                    { label: 'Applicable From', value: data?.ApplicableFrom },
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

    const renderDetailContent = (isPopup = false) => {
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
                                {detail?.Name || selectedItem?.Name}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">
                                {detail?.EmpRefNo || selectedItem?.EmpRefNo}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {(detail?.DesignationName || selectedItem?.DesignationName) && (
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {detail?.DesignationName || selectedItem?.DesignationName}
                                    </span>
                                )}
                                {(detail?.CCName || selectedItem?.CCName) && (
                                    <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium">
                                        {detail?.CCName || selectedItem?.CCName}
                                    </span>
                                )}
                                {detail?.BankApplicableFrom && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {detail.BankApplicableFrom}
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
                                BankName:       detail.Bank,
                                AccountNo:      detail.AccountNo,
                                IFSC:           detail.IFSC,
                                Address:        detail.Address,
                            }} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Requested Change</span>
                            </div>
                            <BankCard title="New Details" highlight data={{
                                BankName:       detail.NewBank,
                                AccountNo:      detail.NewAccountNo,
                                IFSC:           detail.NewIFSC,
                                Address:        detail.NewAddress,
                                ApplicableFrom: detail.BankApplicableFrom,
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

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'Employee Bank Change Verification'} (${inbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={inbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={CreditCard}
                badgeText="Bank Change"
                badgeCount={inbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, employee code, cost center...',
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
                    selectedItem: selectedItem,
                    onItemSelect: setSelectedItem,
                    renderItem: renderItemCard,
                    renderListItem: renderListItem,
                    renderCollapsedItem: renderCollapsedItem,
                    loading: loading.inbox,
                    error: errors.inbox,
                    onRefresh: handleRefresh,
                    config: {
                        title: 'Pending Verification',
                        icon: Clock,
                        emptyMessage: 'No bank change requests pending.',
                        itemKey: 'Id',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(true),
                    popupConfig: {
                        title: 'Bank Change Verification',
                        icon: CreditCard,
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: loading.detail,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Bank Change Details',
                        icon: CreditCard,
                        selectedTitle: 'Bank Change Verification',
                        emptyTitle: 'No Record Selected',
                        emptyMessage: 'Select a bank change request from the list to review and verify.',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        maxHeight: 'calc(100vh - 200px)',
                        sticky: true,
                        stickyTop: '1.5rem',
                    },
                }}
            />
        </div>
    );
};

export default VerifyEmpBankChange;
