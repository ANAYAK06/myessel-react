import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Receipt, Clock, Calendar, Layers, Loader2 } from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchCRVList,
    fetchCRVDetail,
    fetchCRVDeductions,
    approveCRV,
    clearCRVDetail,
    clearCRVDeductions,
    clearCRVApproveResult,
    resetCRVVerification,
    selectCRVList,
    selectCRVDetail,
    selectCRVDeductions,
    selectCRVListLoading,
    selectCRVDetailLoading,
    selectCRVApproveLoading,
    selectCRVListError,
} from '../../slices/accountsSlice/clientRecievableVerificationSlice';

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

// e.g. "CC-204,Site Name" -> "CC-204 - Site Name"; also tolerates a plain code with no comma
const splitCoded = (val) => {
    if (!val) return { code: '', name: '' };
    const [code, ...rest] = String(val).split(',');
    return { code: code.trim(), name: rest.join(',').trim() };
};

// ── Component ─────────────────────────────────────────────────────────────────

const VerifyClientRecievable = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const list          = useSelector(selectCRVList);
    const detail        = useSelector(selectCRVDetail);
    const deductions    = useSelector(selectCRVDeductions);
    const listLoading   = useSelector(selectCRVListLoading);
    const detailLoading = useSelector(selectCRVDetailLoading);
    const approveLoading= useSelector(selectCRVApproveLoading);
    const listError     = useSelector(selectCRVListError);

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
        if (roleId) dispatch(fetchCRVList(roleId));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetCRVVerification());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchCRVDetail(selectedItem.BankTransactionId));
        dispatch(fetchCRVDeductions(selectedItem.InvoiceNo));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (!selectedItem || !roleId || !detail) return;
        const moid = detail?.MOID || 0;
        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        dispatch(setSelectedMOID(moid));
        // Remarks history is keyed by BankTransactions.TransactionRefNo on the backend, but
        // GetVerificationClientRecievablebyTransId/GetClientRecievablebyId don't select it yet
        // (only BankTransactionId) — this will return empty until that column is added to those
        // two queries in AccountsDataLayer.cs. Once added, this already reads the right field.
        if (detail.BankTransactionRefNo) dispatch(fetchRemarks({ trno: detail.BankTransactionRefNo, moid }));
    }, [selectedItem, roleId, detail, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleRefresh = () => { if (roleId) dispatch(fetchCRVList(roleId)); };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    // spApproveClientRecievable parses these with `WHILE (charindex(',',@Str) <> 0)`,
    // which drops the last entry unless a trailing comma is appended.
    const joinWithTrailingComma = (arr) => (arr.length ? `${arr.join(',')},` : '');

    const buildDeductionArrays = () => ({
        DedCcs:     joinWithTrailingComma(deductions.map((d) => d.CCCode)),
        DedDcas:    joinWithTrailingComma(deductions.map((d) => d.DCACode)),
        DedSubdcas: joinWithTrailingComma(deductions.map((d) => d.SubDcaCode)),
        DedAmounts: joinWithTrailingComma(deductions.map((d) => d.DeducationValue)),
    });

    const handleActionClick = async (action) => {
        if (!selectedItem || !detail) { toast.error('No transaction selected.'); return; }
        if (!verificationComment.trim()) { toast.error('Verification comment is mandatory.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox before proceeding.'); return; }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        const ded = buildDeductionArrays();
        try {
            const result = await dispatch(approveCRV({
                BankTransactionId: selectedItem.BankTransactionId,
                InvoiceNo:         detail.InvoiceNo,
                ...ded,
                Action:          actionValue,
                ApprovalNote:    verificationComment.trim(),
                Createdby:       userName,
                InvoiceDate:     detail.InvoiceDate,
                Roleid:          parseInt(roleId, 10),
                Rentention:      parseFloat(detail.Rentention) || 0,
                Advance:         parseFloat(detail.Advance) || 0,
                Hold:            parseFloat(detail.Hold) || 0,
                Bank:            detail.Bank,
                Amount:          parseFloat(detail.Amount) || 0,
            })).unwrap();

            const msg = typeof result === 'string' ? result : (result?.Message || '');
            if (!msg || !/submit/i.test(msg)) {
                toast.error(msg || `Failed to ${actionValue.toLowerCase()}`, { autoClose: 10000 });
                return;
            }

            toast.success(`${action.text || actionValue} completed successfully!`);
            setTimeout(() => {
                dispatch(fetchCRVList(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearCRVDetail());
                dispatch(clearCRVDeductions());
                dispatch(resetApprovalData());
                dispatch(clearCRVApproveResult());
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
            item.InvoiceNo?.toLowerCase().includes(q) ||
            item.PONo?.toLowerCase().includes(q)
        );
    });

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.InvoiceNo}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">PO: {item.PONo}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" /> {item.TransactionDate}
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{fmt(item.Amount)}</span>
            </div>
        </div>
    );

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">{item.InvoiceNo}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[110px]">PO: {item.PONo}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">{item.TransactionDate}</span>
            <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{fmt(item.Amount)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
        const cc     = splitCoded(d?.CCCode);
        const client = d?.Client || '';
        const sub    = splitCoded(d?.SubClient);

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
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{d?.InvoiceNo || selectedItem?.InvoiceNo}</h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">{d?.InvoiceCategory || 'Invoice Service'}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                    PO: {d?.PONo || selectedItem?.PONo}
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
                        <DetailField label="Client" value={client} />
                        <DetailField label="Sub-Client" value={sub.code} />
                        <DetailField label="Cost Center" value={cc.code} />
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Payment Details</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailField label="Bank" value={d?.Bank} />
                        <DetailField label="Reference No" value={d?.Number} />
                        <DetailField label="Transaction Date" value={d?.TransactionDate} />
                        <DetailField label="Basic Value" value={fmt(d?.Basic_Value)} />
                        <DetailField label="Advance" value={fmt(d?.Advance)} />
                        <DetailField label="Retention" value={fmt(d?.Rentention)} />
                        <DetailField label="Hold" value={fmt(d?.Hold)} />
                        <DetailField label="Amount" value={fmt(d?.Amount)} />
                    </div>
                    {d?.Remarks && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{d.Remarks}</p>}
                </div>

                {deductions.length > 0 && (
                    <div className="rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" /> Deductions
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
                                    {deductions.map((row, i) => (
                                        <tr key={row.ClientDeducationsId || i} className="border-t border-rose-100 dark:border-rose-900/30">
                                            <td className="px-3 py-2">{row.CCCode}</td>
                                            <td className="px-3 py-2">{row.DCAName || row.DCACode}</td>
                                            <td className="px-3 py-2">{row.SubDcaName || row.SubDcaCode}</td>
                                            <td className="px-3 py-2 text-right font-semibold">{fmt(row.DeducationValue)}</td>
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
                        checkboxLabel: '✓ I have verified this receipt',
                        checkboxDescription: 'Confirm that the amounts, deductions and bank details are correct',
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
                title={`${InboxTitle || 'Client Receipt Verification'} (${list.length})`}
                subtitle={ModuleDisplayName}
                itemCount={list.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Receipt}
                badgeText="Client Receipt"
                badgeCount={list.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by invoice or PO number...',
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
                        emptyMessage: 'No client receipts pending.',
                        itemKey: 'BankTransactionId',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Client Receipt Verification',
                        icon: Receipt,
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: detailLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Receipt Details',
                        icon: Receipt,
                        selectedTitle: 'Client Receipt Verification',
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

export default VerifyClientRecievable;
