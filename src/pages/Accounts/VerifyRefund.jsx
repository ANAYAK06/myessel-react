import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RefreshCcw, Clock, Calendar, TrendingUp, Loader2 } from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchRefundList,
    fetchRefundDetail,
    approveRefund,
    clearRefundDetail,
    clearRefundApproveResult,
    resetRefundVerification,
    selectRefundList,
    selectRefundDetailData,
    selectRefundListLoading,
    selectRefundDetailLoading,
    selectRefundApproveLoading,
    selectRefundListError,
} from '../../slices/accountsSlice/refundVerificationSlice';

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

const fmt = (v) => {
    const n = parseFloat(v);
    if ((!v && v !== 0) || isNaN(n)) return '₹ 0.00';
    return `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// e.g. "CC-12 , Raipur Office" -> { code: "CC-12", name: "Raipur Office" }
const splitCoded = (val) => {
    if (!val) return { code: '', name: '' };
    const [code, ...rest] = String(val).split(',');
    return { code: code.trim(), name: rest.join(',').trim() };
};

const CATEGORY_LABEL = {
    Refund:      'Refund (SD)',
    OtherRefund: 'Other Refund',
};

// ── Component ─────────────────────────────────────────────────────────────────

const VerifyRefund = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const list          = useSelector(selectRefundList);
    const detail        = useSelector(selectRefundDetailData);
    const listLoading    = useSelector(selectRefundListLoading);
    const detailLoading  = useSelector(selectRefundDetailLoading);
    const approveLoading = useSelector(selectRefundApproveLoading);
    const listError       = useSelector(selectRefundListError);

    const remarks        = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'system';

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
        if (roleId) dispatch(fetchRefundList(roleId));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetRefundVerification());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchRefundDetail(selectedItem.Refno));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (!selectedItem || !roleId || !detail) return;
        const moid = detail?.MOID || 0;
        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: parseFloat(detail?.Amount || 0) }));
        dispatch(setSelectedMOID(moid));
        if (detail.Refno) dispatch(fetchRemarks({ trno: detail.Refno, moid }));
    }, [selectedItem, roleId, detail, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleRefresh = () => { if (roleId) dispatch(fetchRefundList(roleId)); };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleActionClick = async (action) => {
        if (!selectedItem || !detail) { toast.error('No refund selected.'); return; }
        if (!verificationComment.trim()) { toast.error('Verification comment is mandatory.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox before proceeding.'); return; }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const result = await dispatch(approveRefund({
                Refno:          selectedItem.Refno,
                ApprovalRemarks: verificationComment.trim(),
                Approvalstatus: actionValue,
                RoleID:         parseInt(roleId, 10),
                Createdby:      userName,
            })).unwrap();

            const msg = typeof result === 'string' ? result : (result?.Message || '');
            if (!msg || !/submit/i.test(msg)) {
                toast.error(msg || `Failed to ${actionValue.toLowerCase()}`, { autoClose: 10000 });
                return;
            }

            toast.success(`${action.text || actionValue} completed successfully!`);
            setTimeout(() => {
                dispatch(fetchRefundList(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearRefundDetail());
                dispatch(resetApprovalData());
                dispatch(clearRefundApproveResult());
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
            item.Refno?.toString().toLowerCase().includes(q)
        );
    });

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center shrink-0">
                    <RefreshCcw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.Name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Refno: {item.Refno}</p>
                </div>
                {item.paymentcategory && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full border font-medium bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-600 shrink-0">
                        {CATEGORY_LABEL[item.paymentcategory] || item.paymentcategory}
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" /> {item.Date}
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{fmt(item.Amount)}</span>
            </div>
        </div>
    );

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[160px]">{item.Name}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[130px]">Refno: {item.Refno}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[110px]">{CATEGORY_LABEL[item.paymentcategory] || item.paymentcategory}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">{item.Date}</span>
            <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{fmt(item.Amount)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <RefreshCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail panel ──────────────────────────────────────────────────────────

    const DetailField = ({ label, value }) => value || value === 0 ? (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
    ) : null;

    const renderDetailContent = () => {
        if (!selectedItem) return null;
        const d = detail;
        const cc     = splitCoded(d?.Refund_CC_Code);
        const dca    = splitCoded(d?.Refund_DCA_Code);
        const sdca   = splitCoded(d?.Refund_Sub_DCA_Code);
        const intCC  = splitCoded(d?.RefIntCC);
        const intDCA = splitCoded(d?.RefIntDCA);
        const intSDCA = splitCoded(d?.RefIntSDCA);
        const hasInterest = parseFloat(d?.RefIntAmount || 0) > 0;

        return (
            <div className="space-y-6">
                {detailLoading && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading refund details...</span>
                    </div>
                )}

                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                            <RefreshCcw className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{d?.Name || selectedItem?.Name}</h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">
                                {CATEGORY_LABEL[d?.paymentcategory] || d?.paymentcategory || 'Refund'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                    Refno: {d?.Refno || selectedItem?.Refno}
                                </span>
                                {d?.Date && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {d.Date}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{fmt(d?.Amount)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Final Amount</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Cost Centre & Account Head</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailField label="Cost Centre" value={cc.name ? `${cc.code} — ${cc.name}` : cc.code} />
                        <DetailField label="Account Head" value={dca.name ? `${dca.code} — ${dca.name}` : dca.code} />
                        <DetailField label="Sub Account Head" value={sdca.name ? `${sdca.code} — ${sdca.name}` : sdca.code} />
                        <DetailField label="Amount" value={fmt(d?.RefAmount)} />
                    </div>
                </div>

                {hasInterest && (
                    <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" /> Interest Breakup
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailField label="Interest CC" value={intCC.name ? `${intCC.code} — ${intCC.name}` : intCC.code} />
                            <DetailField label="Interest Account Head" value={intDCA.name ? `${intDCA.code} — ${intDCA.name}` : intDCA.code} />
                            <DetailField label="Interest Sub Account Head" value={intSDCA.name ? `${intSDCA.code} — ${intSDCA.name}` : intSDCA.code} />
                            <DetailField label="Interest Amount" value={fmt(d?.RefIntAmount)} />
                        </div>
                    </div>
                )}

                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Payment Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailField label="Bank" value={d?.Bank} />
                        <DetailField label="Mode of Pay" value={d?.ModeofPay} />
                        <DetailField label="Reference No" value={d?.No} />
                        <DetailField label="Payment Date" value={d?.PaymentDate} />
                        <DetailField label="Final Amount" value={fmt(d?.Amount)} />
                    </div>
                    {d?.Remarks && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{d.Remarks}</p>}
                </div>

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
                        checkboxLabel: '✓ I have verified this refund',
                        checkboxDescription: 'Confirm that the CC/DCA allocation, amounts and bank details are correct',
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
                title={`${InboxTitle || 'Refund Verification'} (${list.length})`}
                subtitle={ModuleDisplayName}
                itemCount={list.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={RefreshCcw}
                badgeText="Refund"
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
                        emptyMessage: 'No refunds pending.',
                        itemKey: 'Refno',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Refund Verification',
                        icon: RefreshCcw,
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: detailLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Refund Details',
                        icon: RefreshCcw,
                        selectedTitle: 'Refund Verification',
                        emptyTitle: 'No Refund Selected',
                        emptyMessage: 'Select a refund from the list to review and verify.',
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

export default VerifyRefund;
