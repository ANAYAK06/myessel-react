import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Receipt, Clock, Calendar, ShieldCheck, Percent, Loader2 } from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchSSRVList,
    fetchSSRVDetail,
    approveSSRV,
    clearSSRVDetail,
    clearSSRVApproveResult,
    resetSSRVVerification,
    selectSSRVList,
    selectSSRVDetail,
    selectSSRVListLoading,
    selectSSRVDetailLoading,
    selectSSRVApproveLoading,
    selectSSRVListError,
} from '../../slices/accountsSlice/scrapSaleReceiptVerificationSlice';

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

// e.g. "SC091 , MEDHAWANI STEEL CORPORATION" -> { code: "SC091", name: "MEDHAWANI STEEL CORPORATION" }
const splitCoded = (val) => {
    if (!val) return { code: '', name: '' };
    const [code, ...rest] = String(val).split(',');
    return { code: code.trim(), name: rest.join(',').trim() };
};

// ── Component ─────────────────────────────────────────────────────────────────

const VerifyReceiptAgainstScrapSale = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const list          = useSelector(selectSSRVList);
    const detail        = useSelector(selectSSRVDetail);
    const listLoading    = useSelector(selectSSRVListLoading);
    const detailLoading  = useSelector(selectSSRVDetailLoading);
    const approveLoading = useSelector(selectSSRVApproveLoading);
    const listError       = useSelector(selectSSRVListError);

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
        if (roleId) dispatch(fetchSSRVList(roleId));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetSSRVVerification());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchSSRVDetail(selectedItem.BankTranNo));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (!selectedItem || !roleId || !detail) return;
        const moid = detail?.MOID || 0;
        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        dispatch(setSelectedMOID(moid));
        if (detail.BankTranNo) dispatch(fetchRemarks({ trno: detail.BankTranNo, moid }));
    }, [selectedItem, roleId, detail, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleRefresh = () => { if (roleId) dispatch(fetchSSRVList(roleId)); };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

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
            const result = await dispatch(approveSSRV({
                BankTranNo:     selectedItem.BankTranNo,
                AprovalRemarks: verificationComment.trim(),
                Status:         actionValue,
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
                dispatch(fetchSSRVList(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearSSRVDetail());
                dispatch(resetApprovalData());
                dispatch(clearSSRVApproveResult());
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
            item.ClientCode?.toLowerCase().includes(q) ||
            item.BankTranNo?.toLowerCase().includes(q)
        );
    });

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderItemCard = (item) => {
        const client = splitCoded(item.ClientCode);
        return (
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{client.name || client.code}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Ref: {item.BankTranNo}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" /> {item.Date}
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{fmt(item.BalanceAmount)}</span>
                </div>
            </div>
        );
    };

    const renderListItem = (item) => {
        const client = splitCoded(item.ClientCode);
        return (
            <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
                <span className="font-semibold text-gray-900 dark:text-white min-w-[180px]">{client.name || client.code}</span>
                <span className="text-gray-500 dark:text-gray-400 min-w-[130px]">Ref: {item.BankTranNo}</span>
                <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">{item.Date}</span>
                <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{fmt(item.BalanceAmount)}</span>
            </div>
        );
    };

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
        const client = splitCoded(d?.ClientCode);
        const sub    = splitCoded(d?.SubClientCode);

        const gstRows = [];
        if (d?.GstApplicable === 'Yes') {
            if (d?.DCA1) gstRows.push({ cc: d.CCCode1, dca: d.DCA1, sdca: d.SDCA1, amt: d.Taxvalue1 });
            if (d?.DCA2) gstRows.push({ cc: d.CCCode2, dca: d.DCA2, sdca: d.SDCA2, amt: d.Taxvalue2 });
        }

        return (
            <div className="space-y-6">
                {detailLoading && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading transaction details...</span>
                    </div>
                )}

                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                            <Receipt className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{client.name || client.code || selectedItem?.ClientCode}</h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">{d?.ScrapSaleClientInvoiceno || 'Scrap Sale Receipt'}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                    Ref: {d?.BankTranNo || selectedItem?.BankTranNo}
                                </span>
                                {(d?.InvoiceDate) && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {d.InvoiceDate}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Client Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailField label="Client" value={client.name || client.code} />
                        <DetailField label="Sub-Client" value={sub.name || sub.code} />
                        <DetailField label="Cost Center" value={d?.CostCenterName ? `${d.CostCenter} — ${d.CostCenterName}` : d?.CostCenter} />
                        <DetailField label="Request No" value={d?.ScrapSaleRequestno} />
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Payment Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailField label="Bank" value={d?.Bank} />
                        <DetailField label="Mode of Pay" value={d?.ModeofPay} />
                        <DetailField label="Reference No" value={d?.No} />
                        <DetailField label="Payment Date" value={d?.Date} />
                        <DetailField label="Basic Amount" value={fmt(d?.BasicAmount)} />
                        <DetailField label="Paid Amount" value={fmt(d?.PaidAmount)} />
                        <DetailField label="Total Amount" value={fmt(d?.TotalAmount)} />
                        <DetailField label="Balance Amount" value={fmt(d?.BalanceAmount)} />
                    </div>
                    {d?.Remarks && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{d.Remarks}</p>}
                </div>

                {gstRows.length > 0 && (
                    <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> GST Breakup
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-indigo-200 dark:border-indigo-800">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-indigo-100/60 dark:bg-indigo-900/20">
                                        <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">CC</th>
                                        <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">Account Head</th>
                                        <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">Sub Account Head</th>
                                        <th className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gstRows.map((row, i) => (
                                        <tr key={i} className="border-t border-indigo-100 dark:border-indigo-900/30">
                                            <td className="px-3 py-2">{row.cc}</td>
                                            <td className="px-3 py-2">{row.dca}</td>
                                            <td className="px-3 py-2">{row.sdca}</td>
                                            <td className="px-3 py-2 text-right font-semibold">{fmt(row.amt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {d?.TCSApplicable === 'Yes' && d?.TcsDCA && (
                    <div className="rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5" /> TCS Breakup
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-rose-200 dark:border-rose-800">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-rose-100/60 dark:bg-rose-900/20">
                                        <th className="px-3 py-2 text-left font-bold text-rose-700 dark:text-rose-300 uppercase">CC</th>
                                        <th className="px-3 py-2 text-left font-bold text-rose-700 dark:text-rose-300 uppercase">Account Head</th>
                                        <th className="px-3 py-2 text-left font-bold text-rose-700 dark:text-rose-300 uppercase">Sub Account Head</th>
                                        <th className="px-3 py-2 text-right font-bold text-rose-700 dark:text-rose-300 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-rose-100 dark:border-rose-900/30">
                                        <td className="px-3 py-2">{d.TcsCCCode}</td>
                                        <td className="px-3 py-2">{d.TcsDCA}</td>
                                        <td className="px-3 py-2">{d.TcsSDCA}</td>
                                        <td className="px-3 py-2 text-right font-semibold">{fmt(d.TcsValue)}</td>
                                    </tr>
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
                        checkboxLabel: '✓ I have verified this receipt',
                        checkboxDescription: 'Confirm that the amounts, bank details and tax breakup are correct',
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
                title={`${InboxTitle || 'Receipt Against Scrap Sale Verification'} (${list.length})`}
                subtitle={ModuleDisplayName}
                itemCount={list.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Receipt}
                badgeText="Scrap Sale Receipt"
                badgeCount={list.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by client or reference number...',
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
                        emptyMessage: 'No scrap sale receipts pending.',
                        itemKey: 'BankTranNo',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Receipt Against Scrap Sale Verification',
                        icon: Receipt,
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: detailLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Receipt Details',
                        icon: Receipt,
                        selectedTitle: 'Receipt Against Scrap Sale Verification',
                        emptyTitle: 'No Receipt Selected',
                        emptyMessage: 'Select a receipt from the list to review and verify.',
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

export default VerifyReceiptAgainstScrapSale;
