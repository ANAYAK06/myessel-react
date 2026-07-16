import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Percent, Clock, Calendar, Users, Building2,
    Pencil, Save, X, Loader2,
} from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchMiscVerificationList,
    fetchMiscVerificationById,
    verifyMisc,
    updateMisc,
    clearMiscDetail,
    clearMiscVerifyResult,
    clearMiscUpdateResult,
    resetMiscVerification,
    selectMiscVerificationList,
    selectMiscDetail,
    selectMiscListLoading,
    selectMiscDetailLoading,
    selectMiscVerifyLoading,
    selectMiscUpdateLoading,
    selectMiscListError,
} from '../../slices/accountsSlice/miscInvoiceVerificationSlice';

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

// The route this page is reached from is /AccountsApproval/VerifyMisc?Type=CL —
// "CL" is the fixed workflow-category code GetMisc expects, not a client/others filter.
const MISC_LIST_TYPE = 'CL';

const fmt = (v) => {
    const n = parseFloat(v);
    if ((!v && v !== 0) || isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const inputCls =
    'w-full px-3 py-2 rounded-lg border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all disabled:opacity-60';

// ── Component ─────────────────────────────────────────────────────────────────

const VerifyMiscInvoice = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const list           = useSelector(selectMiscVerificationList);
    const detail         = useSelector(selectMiscDetail);
    const listLoading     = useSelector(selectMiscListLoading);
    const detailLoading  = useSelector(selectMiscDetailLoading);
    const verifyLoading   = useSelector(selectMiscVerifyLoading);
    const updateLoading  = useSelector(selectMiscUpdateLoading);
    const listError       = useSelector(selectMiscListError);

    const remarks         = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading   = useSelector(selectStatusListLoading);
    const statusError     = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions      = useSelector(selectHasActions);

    const { userData } = useSelector(s => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'system';

    const [selectedItem,         setSelectedItem]         = useState(null);
    const [isVerified,           setIsVerified]           = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);

    // Edit-at-verification-level state
    const [isEditing,  setIsEditing]  = useState(false);
    const [editForm,   setEditForm]   = useState(null);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId) dispatch(fetchMiscVerificationList({ roleId, type: MISC_LIST_TYPE }));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetMiscVerification());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchMiscVerificationById(selectedItem.Refno));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
        setIsEditing(false);
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (!selectedItem || !roleId || !detail) return;
        const moid = detail?.MOID || selectedItem?.MOID || 0;
        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        dispatch(setSelectedMOID(moid));
        dispatch(fetchRemarks({ trno: detail.Refno || selectedItem.Refno || '', moid }));
        setEditForm({
            Name:         detail.Name || '',
            MiscAmount:   detail.MiscIntAmount ?? 0,
            MiscDedAmount:detail.MiscDedAmount ?? 0,
            Remarks:      detail.Remarks || '',
        });
    }, [selectedItem, roleId, detail, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleRefresh = () => {
        if (roleId) dispatch(fetchMiscVerificationList({ roleId, type: MISC_LIST_TYPE }));
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleSaveEdit = async () => {
        if (!detail || !editForm) return;
        if (!editForm.Name.trim()) { toast.error('Name is required.'); return; }

        const finalAmt = Math.max(0, (parseFloat(editForm.MiscAmount) || 0) - (parseFloat(editForm.MiscDedAmount) || 0));
        try {
            await dispatch(updateMisc({
                Refno:              detail.Refno,
                Misc_Name:          editForm.Name.trim(),
                MiscAmount:         parseFloat(editForm.MiscAmount) || 0,
                MiscDedAmount:      parseFloat(editForm.MiscDedAmount) || 0,
                Misc_final_Amount:  finalAmt,
                Remarks:            editForm.Remarks || null,
                RoleID:             roleId,
                CreatedBy:          userName,
            })).unwrap();
            toast.success('Changes saved successfully!');
            setIsEditing(false);
            dispatch(fetchMiscVerificationById(detail.Refno));
            dispatch(clearMiscUpdateResult());
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || 'Failed to save changes';
            toast.error(msg, { autoClose: 8000 });
        }
    };

    const buildVerifyPayload = (actionValue) => ({
        Refno:           detail?.Refno || selectedItem?.Refno || '',
        RoleID:          roleId,
        Createdby:       userName,
        Approvalstatus:  actionValue,
        ApprovalRemarks: verificationComment.trim(),
    });

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No invoice selected.'); return; }
        if (!verificationComment.trim()) { toast.error('Verification comment is mandatory.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox before proceeding.'); return; }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const payload = buildVerifyPayload(actionValue);
            const result = await dispatch(verifyMisc(payload)).unwrap();
            const raw = typeof result === 'string' ? result : (result?.Message || JSON.stringify(result));
            const msg = raw.split('$')[0];

            if (!msg || !msg.toLowerCase().includes('submit')) {
                toast.error(msg || `Failed to ${actionValue.toLowerCase()}`, { autoClose: 10000 });
                return;
            }

            toast.success(`${action.text || actionValue} completed successfully!`);
            if (raw.includes('$')) {
                const info = raw.split('$')[1];
                if (info) setTimeout(() => toast.info(info, { autoClose: 6000 }), 500);
            }

            setTimeout(() => {
                dispatch(fetchMiscVerificationList({ roleId, type: MISC_LIST_TYPE }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearMiscDetail());
                dispatch(resetApprovalData());
                dispatch(clearMiscVerifyResult());
            }, 1000);
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
            item.Refno?.toLowerCase().includes(q)
        );
    });

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center shrink-0">
                    <Percent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
                <span className="font-bold text-indigo-600 dark:text-indigo-400">₹ {fmt(item.Amount)}</span>
            </div>
        </div>
    );

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">{item.Name}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[110px]">{item.Refno}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">{item.InvoiceDate}</span>
            <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">₹ {fmt(item.Amount)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <Percent className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading invoice details...</span>
                    </div>
                )}

                {/* Header card */}
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                            <Percent className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{d?.Name || selectedItem?.Name}</h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">{d?.Refno || selectedItem?.Refno}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                    {isClientFlow ? 'Interest from Client' : 'Interest from Others'}
                                </span>
                                {(d?.InvoiceDate || selectedItem?.InvoiceDate) && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {d?.InvoiceDate || selectedItem?.InvoiceDate}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client details */}
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

                {/* Account head */}
                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Interest Account Head
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailField label="Cost Center" value={d?.MiscIntCCCode} />
                        <DetailField label="DCA" value={d?.MiscIntDCACode} />
                        <DetailField label="Sub DCA" value={d?.MiscIntSubDCACode} />
                    </div>
                </div>

                {(d?.MiscDedCCCode || d?.MiscDedAmount > 0) && (
                    <div className="rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-rose-600 dark:text-rose-400">Deduction Account Head</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailField label="Cost Center" value={d?.MiscDedCCCode} />
                            <DetailField label="DCA" value={d?.MiscDedDCACode} />
                            <DetailField label="Sub DCA" value={d?.MiscDedSubDCACode} />
                        </div>
                    </div>
                )}

                {/* Editable summary */}
                <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Summary</p>
                        {!isEditing ? (
                            <button type="button" onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors">
                                <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => { setIsEditing(false); setEditForm({ Name: d?.Name || '', MiscAmount: d?.MiscIntAmount ?? 0, MiscDedAmount: d?.MiscDedAmount ?? 0, Remarks: d?.Remarks || '' }); }}
                                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700">
                                    <X className="w-3.5 h-3.5" /> Cancel
                                </button>
                                <button type="button" onClick={handleSaveEdit} disabled={updateLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                                    {updateLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing && editForm ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Name</label>
                                    <input type="text" className={inputCls} value={editForm.Name}
                                        onChange={e => setEditForm(p => ({ ...p, Name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Amount (₹)</label>
                                    <input type="number" min="0" step="0.01" className={inputCls} value={editForm.MiscAmount}
                                        onChange={e => setEditForm(p => ({ ...p, MiscAmount: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Deduction Amount (₹)</label>
                                    <input type="number" min="0" step="0.01" className={inputCls} value={editForm.MiscDedAmount}
                                        onChange={e => setEditForm(p => ({ ...p, MiscDedAmount: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Remarks</label>
                                <textarea rows={2} className={`${inputCls} resize-none`} value={editForm.Remarks}
                                    onChange={e => setEditForm(p => ({ ...p, Remarks: e.target.value }))} />
                            </div>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                Final Amount: ₹ {fmt(Math.max(0, (parseFloat(editForm.MiscAmount) || 0) - (parseFloat(editForm.MiscDedAmount) || 0)))}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailField label="Name" value={d?.Name} />
                            <DetailField label="Final Amount" value={`₹ ${fmt(d?.Amount)}`} />
                            <DetailField label="Remarks" value={d?.Remarks} />
                        </div>
                    )}
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
                        checkboxLabel: '✓ I have verified this invoice',
                        checkboxDescription: 'Confirm that the account heads and amounts are correct',
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
                        loading={verifyLoading}
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
                title={`${InboxTitle || 'Miscellaneous Invoice Verification'} (${list.length})`}
                subtitle={ModuleDisplayName}
                itemCount={list.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Percent}
                badgeText="Misc Invoice"
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
                        emptyMessage: 'No miscellaneous invoices pending.',
                        itemKey: 'Refno',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Miscellaneous Invoice Verification',
                        icon: Percent,
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: detailLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Invoice Details',
                        icon: Percent,
                        selectedTitle: 'Miscellaneous Invoice Verification',
                        emptyTitle: 'No Invoice Selected',
                        emptyMessage: 'Select an invoice from the list to review and verify.',
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

export default VerifyMiscInvoice;
