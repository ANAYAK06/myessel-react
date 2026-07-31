import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Landmark, Clock, Calendar, Users, Building2, Loader2 } from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchMPVList,
    fetchMPVDetail,
    approveMPV,
    clearMPVDetail,
    clearMPVApproveResult,
    resetMPVVerification,
    selectMPVList,
    selectMPVDetail,
    selectMPVListLoading,
    selectMPVDetailLoading,
    selectMPVApproveLoading,
    selectMPVListError,
} from '../../slices/accountsSlice/miscPaymentVerificationSlice';

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

// spGetAllMiscPaymentDetailsGrid (backing VerifyMiscPayment) filters BankTransactions by
// `bt.WorkFlowLevelID = CASE WHEN @Type='CL' THEN 654 ELSE 656 END` — i.e. it only recognizes
// two buckets: 'CL' (Interest From Clients) and anything else (Interest From Others). The menu
// can point here with either PType (e.g. /AccountsApproval/VerifyMiscPayment?PType=CL or
// ?PType=OT), so the value must come from the actual navigation path, not be hardcoded.
const getPTypeFromPath = (notificationData) => {
    const path = notificationData?.NavigationPath || '';
    const match = path.match(/[?&]ptype=([^&]+)/i);
    return match ? decodeURIComponent(match[1]) : 'CL';
};

const fmt = (v) => {
    const n = parseFloat(v);
    if ((!v && v !== 0) || isNaN(n)) return '₹ 0.00';
    return `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

const VerifyMiscPayment = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const list           = useSelector(selectMPVList);
    const detail         = useSelector(selectMPVDetail);
    const listLoading    = useSelector(selectMPVListLoading);
    const detailLoading  = useSelector(selectMPVDetailLoading);
    const approveLoading = useSelector(selectMPVApproveLoading);
    const listError      = useSelector(selectMPVListError);

    const remarks        = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    const [selectedItem,         setSelectedItem]         = useState(null);
    const [isVerified,           setIsVerified]           = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};
    const pType = getPTypeFromPath(notificationData);

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId) dispatch(fetchMPVList({ roleId, uid: userId, pType }));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetMPVVerification());
            dispatch(resetApprovalData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleId, userId, pType, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchMPVDetail(selectedItem.Refno));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (!selectedItem || !roleId || !detail) return;
        const moid = detail?.MOID || selectedItem?.MOID || 0;
        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        dispatch(setSelectedMOID(moid));
        dispatch(fetchRemarks({ trno: detail.Refno || selectedItem.Refno || '', moid }));
    }, [selectedItem, roleId, detail, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleRefresh = () => {
        if (roleId) dispatch(fetchMPVList({ roleId, uid: userId, pType }));
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No payment selected.'); return; }
        if (!verificationComment.trim()) { toast.error('Verification comment is mandatory.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox before proceeding.'); return; }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const result = await dispatch(approveMPV({
                Refno:           detail?.Refno || selectedItem.Refno,
                ApprovalRemarks: verificationComment.trim(),
                Approvalstatus:  actionValue,
                RoleID:          roleId,
                Createdby:       userName,
            })).unwrap();

            const raw = typeof result === 'string' ? result : (result?.Message || JSON.stringify(result));
            const msg = raw.split('$')[0];

            if (!msg || !msg.toLowerCase().includes('submit')) {
                toast.error(msg || `Failed to ${actionValue.toLowerCase()}`, { autoClose: 10000 });
                return;
            }

            toast.success(`${action.text || actionValue} completed successfully!`);
            setTimeout(() => {
                dispatch(fetchMPVList({ roleId, uid: userId, pType }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearMPVDetail());
                dispatch(resetApprovalData());
                dispatch(clearMPVApproveResult());
            }, 800);
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || `Failed to ${actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────

    const filteredItems = list.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.Name?.toLowerCase().includes(q) ||
            String(item.Refno || '').toLowerCase().includes(q)
        );
    });

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.Name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.Refno}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" /> {item.InvoiceDate}
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{fmt(item.Amount)}</span>
            </div>
        </div>
    );

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">{item.Name}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[110px]">{item.Refno}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">{item.InvoiceDate}</span>
            <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{fmt(item.Amount)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail panel ──────────────────────────────────────────────────────────

    const DetailField = ({ label, value }) => value ? (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
    ) : null;

    const renderDetailContent = () => {
        if (!selectedItem) return null;
        const d = detail;
        const isClientFlow = !!d?.clientid;

        return (
            <div className="space-y-6">
                {detailLoading && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading payment details...</span>
                    </div>
                )}

                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                            <Landmark className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{d?.Name || selectedItem?.Name}</h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">{d?.Refno || selectedItem?.Refno}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {(d?.InvoiceDate || selectedItem?.InvoiceDate) && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {d?.InvoiceDate || selectedItem?.InvoiceDate}
                                    </span>
                                )}
                                {d?.Status && (
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {d.Status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isClientFlow && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> Client Details
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailField label="Client" value={d?.clientid} />
                            <DetailField label="Sub Client" value={d?.Subclient} />
                        </div>
                    </div>
                )}

                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Interest Account Head
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailField label="Cost Center" value={d?.MiscIntCCCode} />
                        <DetailField label="DCA" value={d?.MiscIntDCACode} />
                        <DetailField label="Amount" value={fmt(d?.MiscIntAmount)} />
                    </div>
                </div>

                {(d?.MiscDedCCCode || d?.MiscDedAmount > 0) && (
                    <div className="rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-rose-600 dark:text-rose-400">Deduction Account Head</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailField label="Cost Center" value={d?.MiscDedCCCode} />
                            <DetailField label="DCA" value={d?.MiscDedDCACode} />
                            <DetailField label="Amount" value={fmt(d?.MiscDedAmount)} />
                        </div>
                    </div>
                )}

                <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-indigo-600 dark:text-indigo-400">Bank Payment</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailField label="Bank" value={d?.Bank} />
                        <DetailField label="Mode of Pay" value={d?.ModeofPay} />
                        <DetailField label="Reference / Cheque No" value={d?.No} />
                        <DetailField label="Payment Date" value={d?.PaymentDate} />
                        <DetailField label="Final Amount" value={fmt(d?.Amount)} />
                    </div>
                    {d?.BankPaymentRemarks && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{d.BankPaymentRemarks}</p>
                    )}
                </div>

                {d?.Remarks && (
                    <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice Remarks</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{d.Remarks}</p>
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
                        checkboxLabel: '✓ I have verified this payment',
                        checkboxDescription: 'Confirm that the bank, amount and reference details are correct',
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
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-700 text-center text-sm text-red-600 dark:text-red-400">
                        Error loading actions: {statusError}
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700 text-center text-sm text-yellow-700 dark:text-yellow-400">
                        No actions available for this record
                    </div>
                ) : (
                    <ActionButtons
                        actions={enabledActions}
                        onActionClick={handleActionClick}
                        loading={approveLoading}
                        isVerified={isVerified}
                        comment={verificationComment}
                        showValidation={true}
                    />
                )}
            </div>
        );
    };

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'Miscellaneous Payment Verification'} (${list.length})`}
                subtitle={ModuleDisplayName}
                itemCount={list.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Landmark}
                badgeText="Misc Payment"
                badgeCount={list.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name or reference number...',
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
                    loading: listLoading,
                    error: listError,
                    onRefresh: handleRefresh,
                    config: {
                        title: 'Pending Verification',
                        icon: Clock,
                        emptyMessage: 'No miscellaneous payments pending.',
                        itemKey: 'Refno',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Miscellaneous Payment Verification',
                        icon: Landmark,
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: detailLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Payment Details',
                        icon: Landmark,
                        selectedTitle: 'Miscellaneous Payment Verification',
                        emptyTitle: 'No Payment Selected',
                        emptyMessage: 'Select a payment from the list to review and verify.',
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

export default VerifyMiscPayment;
