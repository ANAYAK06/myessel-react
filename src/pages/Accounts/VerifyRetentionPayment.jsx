import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Landmark, Clock, Calendar, FileText, Loader2 } from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchRPVList,
    fetchRPVDetail,
    approveRPV,
    clearRPVDetail,
    clearRPVApproveResult,
    resetRPVVerification,
    selectRPVList,
    selectRPVDetail,
    selectRPVListLoading,
    selectRPVDetailLoading,
    selectRPVApproveLoading,
    selectRPVListError,
} from '../../slices/accountsSlice/retentionPaymentVerificationSlice';

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

// ── Component ─────────────────────────────────────────────────────────────────

const VerifyRetentionPayment = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const list           = useSelector(selectRPVList);
    const detail         = useSelector(selectRPVDetail);
    const listLoading    = useSelector(selectRPVListLoading);
    const detailLoading  = useSelector(selectRPVDetailLoading);
    const approveLoading = useSelector(selectRPVApproveLoading);
    const listError      = useSelector(selectRPVListError);

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
        if (roleId) dispatch(fetchRPVList(roleId));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetRPVVerification());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchRPVDetail(selectedItem.BankTransactionRefNo));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (!selectedItem || !roleId || !detail) return;
        const moid = detail?.MOID || 0;
        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        dispatch(setSelectedMOID(moid));
        dispatch(fetchRemarks({ trno: detail.BankTransactionRefNo || selectedItem.BankTransactionRefNo || '', moid }));
    }, [selectedItem, roleId, detail, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleRefresh = () => { if (roleId) dispatch(fetchRPVList(roleId)); };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const invoiceRows = detail?.RetInvDetailsList || [];

    // spApproveRetentionPayment parses these with `WHILE (charindex(',',@Invoicenos) <> 0)`,
    // which drops the last entry unless a trailing comma is appended.
    const joinWithTrailingComma = (arr) => (arr.length ? `${arr.join(',')},` : '');

    const handleActionClick = async (action) => {
        if (!selectedItem || !detail) { toast.error('No transaction selected.'); return; }
        if (!verificationComment.trim()) { toast.error('Verification comment is mandatory.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox before proceeding.'); return; }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const result = await dispatch(approveRPV({
                BankTransactionRefNo: detail.BankTransactionRefNo || selectedItem.BankTransactionRefNo,
                InvoiceNos:     joinWithTrailingComma(invoiceRows.map((r) => r.ClientInvoiceNo)),
                PaidRetAmounts: joinWithTrailingComma(invoiceRows.map((r) => r.RetBalance)),
                Action:         actionValue,
                ApprovalNote:   verificationComment.trim(),
                Bank:           detail.Bank,
                PaymentAmount:  parseFloat(detail.PaymentAmount) || 0,
                Createdby:      userName,
                Roleid:         parseInt(roleId, 10),
            })).unwrap();

            const msg = typeof result === 'string' ? result : (result?.Message || '');
            if (!msg || !/submit/i.test(msg)) {
                toast.error(msg || `Failed to ${actionValue.toLowerCase()}`, { autoClose: 10000 });
                return;
            }

            toast.success(`${action.text || actionValue} completed successfully!`);
            setTimeout(() => {
                dispatch(fetchRPVList(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearRPVDetail());
                dispatch(resetApprovalData());
                dispatch(clearRPVApproveResult());
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
            item.ClientName?.toLowerCase().includes(q) ||
            item.ClientCode?.toLowerCase().includes(q) ||
            String(item.BankTransactionRefNo || '').toLowerCase().includes(q)
        );
    });

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full border-2 border-teal-200 dark:border-teal-600 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-800/40 dark:to-cyan-800/40 flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.ClientName || item.ClientCode}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Txn: {item.BankTransactionRefNo}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" /> {item.ReturnPayDate}
                </span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{fmt(item.PaymentAmount)}</span>
            </div>
        </div>
    );

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[160px]">{item.ClientName || item.ClientCode}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[110px]">Txn: {item.BankTransactionRefNo}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">{item.ReturnPayDate}</span>
            <span className="ml-auto font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">{fmt(item.PaymentAmount)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-teal-200 dark:border-teal-600 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-800/40 dark:to-cyan-800/40 flex items-center justify-center">
            <Landmark className="w-4 h-4 text-teal-600 dark:text-teal-400" />
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

        return (
            <div className="space-y-6">
                {detailLoading && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading transaction details...</span>
                    </div>
                )}

                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border-2 border-teal-200 dark:border-teal-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shrink-0">
                            <Landmark className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{d?.ClientName || d?.ClientCode || selectedItem?.ClientName}</h2>
                            <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm mt-0.5">Retention Payment</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
                                    Txn: {d?.BankTransactionRefNo || selectedItem?.BankTransactionRefNo}
                                </span>
                                {(d?.ReturnPayDate) && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {d.ReturnPayDate}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Payment Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailField label="Bank" value={d?.Bank} />
                        <DetailField label="Mode of Pay" value={d?.ModeOfPay} />
                        <DetailField label="Reference No" value={d?.No} />
                        <DetailField label="Client" value={d?.ClientName || d?.ClientCode} />
                        <DetailField label="Sub-Client" value={d?.SubClientName || d?.SubClientCode} />
                        <DetailField label="Total Amount" value={fmt(d?.PaymentAmount)} />
                    </div>
                    {d?.Remarks && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{d.Remarks}</p>}
                </div>

                {invoiceRows.length > 0 && (
                    <div className="rounded-xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Invoices Paid ({invoiceRows.length})
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-teal-200 dark:border-teal-800">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-teal-100/60 dark:bg-teal-900/20">
                                        <th className="px-3 py-2 text-left font-bold text-teal-700 dark:text-teal-300 uppercase">Invoice No</th>
                                        <th className="px-3 py-2 text-left font-bold text-teal-700 dark:text-teal-300 uppercase">PO Number</th>
                                        <th className="px-3 py-2 text-left font-bold text-teal-700 dark:text-teal-300 uppercase">Date</th>
                                        <th className="px-3 py-2 text-right font-bold text-teal-700 dark:text-teal-300 uppercase">Retention</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceRows.map((row, i) => (
                                        <tr key={row.ClientInvoiceNo || i} className="border-t border-teal-100 dark:border-teal-900/30">
                                            <td className="px-3 py-2 font-semibold">{row.ClientInvoiceNo}</td>
                                            <td className="px-3 py-2">{row.PONumber}</td>
                                            <td className="px-3 py-2">{row.InvoiceDate}</td>
                                            <td className="px-3 py-2 text-right font-semibold">{fmt(row.RetBalance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                        checkboxLabel: '✓ I have verified this retention payment',
                        checkboxDescription: 'Confirm that the invoices and amounts are correct',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Enter your verification remarks...',
                        commentRequired: true,
                        commentRows: 3,
                        commentMaxLength: 500,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
                        commentBorder: 'border-teal-200 dark:border-teal-700',
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
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
                title={`${InboxTitle || 'Retention Payment Verification'} (${list.length})`}
                subtitle={ModuleDisplayName}
                itemCount={list.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Landmark}
                badgeText="Retention Payment"
                badgeCount={list.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by client or transaction number...',
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
                        emptyMessage: 'No retention payments pending.',
                        itemKey: 'BankTransactionRefNo',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Retention Payment Verification',
                        icon: Landmark,
                        headerGradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: detailLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Retention Payment Details',
                        icon: Landmark,
                        selectedTitle: 'Retention Payment Verification',
                        emptyTitle: 'No Payment Selected',
                        emptyMessage: 'Select a retention payment from the list to review and verify.',
                        headerGradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
                        maxHeight: 'calc(100vh - 200px)',
                        sticky: true,
                        stickyTop: '1.5rem',
                    },
                }}
            />
        </div>
    );
};

export default VerifyRetentionPayment;
