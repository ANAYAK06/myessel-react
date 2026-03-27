import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowRight, IndianRupee, Building2, Calendar,
    Hash, FileText, Clock,
} from 'lucide-react';

// ─── Shared Inbox Components ──────────────────────────────────────────────────
import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

// ─── CC Cash Transfer slice ───────────────────────────────────────────────────
import {
    fetchCCCashTransferList,
    fetchCCCashTransferById,
    verifyCCCashTransfer,
    clearVerifyResult,
    clearDetail,
    resetCCCashTransfer,
    selectCCCashTransferList,
    selectCCCashTransferDetail,
    selectCCListLoading,
    selectCCDetailLoading,
    selectCCVerifyLoading,
    selectCCListError,
    selectCCVerifyStatus,
    selectCCVerifyError,
} from '../../slices/accountsSlice/ccCashTransferSlice';

// ─── Shared: remarks history ──────────────────────────────────────────────────
import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID,
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

// ─── Shared: status / action buttons ─────────────────────────────────────────
import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton,
} from '../../slices/CommonSlice/getStatusSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseCCName = (raw) => {
    if (!raw) return { code: '—', name: '' };
    const idx = raw.indexOf(' , ');
    if (idx === -1) return { code: raw.trim(), name: '' };
    return { code: raw.slice(0, idx).trim(), name: raw.slice(idx + 3).trim() };
};

// ─── Component ────────────────────────────────────────────────────────────────

const VerifyCCCashTransfer = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ── Selectors ───────────────────────────────────────────────────────────
    const transfers     = useSelector(selectCCCashTransferList);
    const detail        = useSelector(selectCCCashTransferDetail);
    const listLoading   = useSelector(selectCCListLoading);
    const detailLoading = useSelector(selectCCDetailLoading);
    const verifyLoading = useSelector(selectCCVerifyLoading);
    const listError     = useSelector(selectCCListError);
    const verifyStatus  = useSelector(selectCCVerifyStatus);
    const verifyError   = useSelector(selectCCVerifyError);

    const remarks        = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector(s => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    const { InboxTitle, ModuleDisplayName, RoleId } = notificationData || {};
    const effectiveRoleId = RoleId || roleId;

    // ── Local state ─────────────────────────────────────────────────────────
    const [selectedItem,         setSelectedItem]         = useState(null);
    const [isVerified,           setIsVerified]           = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);

    const getCurrentUser     = () => userData?.userName || userDetails?.userName || 'system';
    const getCurrentRoleName = () =>
        userDetails?.roleName || userData?.roleName ||
        notificationData?.InboxTitle || 'CC Cash Transfer Verifier';

    // ── Init ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (effectiveRoleId) {
            dispatch(fetchCCCashTransferList({ roleId: effectiveRoleId, uid: userId }));
        }
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetCCCashTransfer());
            dispatch(resetApprovalData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, effectiveRoleId]);

    // ── Fetch detail when item selected ─────────────────────────────────────
    useEffect(() => {
        if (selectedItem?.Refno) {
            dispatch(clearDetail());
            dispatch(fetchCCCashTransferById({
                voucherId: selectedItem.Voucherno,
                refno:     selectedItem.Refno,
            }));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // ── Fetch status list when detail loads ─────────────────────────────────
    useEffect(() => {
        if (selectedItem && detail?.MOID && effectiveRoleId) {
            dispatch(fetchStatusList({
                MOID:   detail.MOID,
                ROID:   effectiveRoleId,
                ChkAmt: detail.Amount || 0,
            }));
        }
    }, [selectedItem, detail?.MOID, effectiveRoleId, dispatch]);

    // ── Fetch remarks history ────────────────────────────────────────────────
    useEffect(() => {
        if (selectedItem && detail?.MOID) {
            dispatch(setSelectedMOID(detail.MOID));
            dispatch(fetchRemarks({
                trno: detail.Refno || selectedItem.Refno || '',
                moid: detail.MOID,
            }));
        }
    }, [selectedItem, detail?.MOID, dispatch]);

    // ── Auto-collapse left panel when item selected ──────────────────────────
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Verify result ────────────────────────────────────────────────────────
    useEffect(() => {
        if (verifyStatus === 'success') {
            toast.success('Action completed successfully!');
            dispatch(clearVerifyResult());
            setTimeout(() => {
                dispatch(fetchCCCashTransferList({ roleId: effectiveRoleId, uid: userId }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearDetail());
                dispatch(resetApprovalData());
            }, 1000);
        } else if (verifyStatus === 'failed' && verifyError) {
            toast.error(verifyError);
            dispatch(clearVerifyResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [verifyStatus, verifyError, dispatch]);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleRefresh = () => {
        dispatch(fetchCCCashTransferList({ roleId: effectiveRoleId, uid: userId }));
        if (selectedItem?.Refno) {
            dispatch(fetchCCCashTransferById({
                voucherId: selectedItem.Voucherno,
                refno:     selectedItem.Refno,
            }));
        }
    };

    const handleItemSelect = (item) => {
        dispatch(clearDetail());
        setSelectedItem(item);
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No transfer selected.'); return; }
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
            await dispatch(verifyCCCashTransfer({
                Refno:           selectedItem.Refno,
                ApprovalRemarks: verificationComment.trim(),
                Approvalstatus:  actionValue,
                RoleID:          effectiveRoleId,
                Createdby:       getCurrentUser(),
                UID:             userId,
            })).unwrap();

            const msg = actionValue.toLowerCase() === 'reject'
                ? 'CC Cash Transfer rejected successfully!'
                : 'CC Cash Transfer verified successfully!';
            toast.success(msg);

            setTimeout(() => {
                dispatch(fetchCCCashTransferList({ roleId: effectiveRoleId, uid: userId }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearDetail());
                dispatch(resetApprovalData());
            }, 1000);
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || `Failed to ${actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered list ────────────────────────────────────────────────────────
    const filteredItems = transfers.filter(t => {
        const q = searchQuery.toLowerCase();
        return !q ||
            t.Refno?.toLowerCase().includes(q) ||
            t.Voucherno?.toLowerCase().includes(q) ||
            t.PaidAgainstCCCode?.toLowerCase().includes(q) ||
            t.Amount?.toString().includes(q);
    });

    const totalAmount = transfers.reduce((s, t) => s + (parseFloat(t.Amount) || 0), 0);

    // ── Stats ────────────────────────────────────────────────────────────────
    const statsCards = [
        { icon: ArrowRight,   value: transfers.length,    label: 'Total Transfers',     color: 'blue' },
        { icon: Clock,        value: transfers.length,    label: 'Pending Verification', color: 'purple' },
        { icon: IndianRupee,  value: `₹${fmt(totalAmount)}`, label: 'Total Amount',     color: 'indigo' },
        { icon: Building2,    value: detail?.SelfCCCode || '—', label: 'Self CC',        color: 'violet' },
    ];

    // ── Left panel renderers ─────────────────────────────────────────────────
    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {item.Voucherno}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        To: {item.PaidAgainstCCCode || '—'}
                    </p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate font-mono">{item.Refno}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        ₹{fmt(item.Amount)}
                    </span>
                    {item.InvoiceDate && (
                        <span className="flex items-center gap-1 text-gray-400">
                            <Calendar className="w-3 h-3" />{item.InvoiceDate}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    const renderCollapsedItem = (item) => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail content ───────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const selfCC  = parseCCName(detail?.SelfCCCodename);
        const otherCC = parseCCName(detail?.OtherCCCodename);

        return (
            <div className="space-y-6">

                {/* Loading shimmer */}
                {detailLoading && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                        <span className="text-indigo-700 dark:text-indigo-400 text-sm">Loading transfer details…</span>
                    </div>
                )}

                {/* ── Voucher Card ──────────────────────────────────────── */}
                {detail && (
                    <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-700 overflow-hidden shadow-md">

                        {/* Voucher header */}
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 px-5 py-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <ArrowRight className="w-5 h-5" />
                                <span className="font-bold text-sm tracking-wide uppercase">
                                    CC Cash Transfer Voucher
                                </span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 border border-white/30 font-mono">
                                {detail.Voucherno}
                            </span>
                        </div>

                        {/* Voucher body */}
                        <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-gray-800 dark:to-gray-800 p-5 space-y-5">

                            {/* Ref + Date */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Hash className="w-3 h-3" /> Ref No.
                                    </p>
                                    <p className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                                        {detail.Refno}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Transfer Date
                                    </p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                        {detail.InvoiceDate || '—'}
                                    </p>
                                </div>
                            </div>

                            {/* From → To CC */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> From (Self CC)
                                    </p>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{selfCC.code}</p>
                                    {selfCC.name && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selfCC.name}</p>
                                    )}
                                </div>
                                <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> To (Transfer CC)
                                    </p>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{otherCC.code}</p>
                                    {otherCC.name && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{otherCC.name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Amount box */}
                            <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white text-center shadow-lg">
                                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-indigo-200">
                                    Transfer Amount
                                </p>
                                <p className="text-3xl font-black flex items-center justify-center gap-1">
                                    <IndianRupee className="w-7 h-7" />
                                    {fmt(detail.Amount)}
                                </p>
                                {detail.AmountInWords && (
                                    <p className="text-xs text-indigo-200 mt-2 italic">{detail.AmountInWords}</p>
                                )}
                            </div>

                            {/* Creation Remarks */}
                            {detail.Remarks && (
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Transfer Remarks
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800">
                                        {detail.Remarks}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Remarks History ───────────────────────────────────── */}
                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(v => !v)}
                    remarks={remarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                {/* ── Verification Input ────────────────────────────────── */}
                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have reviewed the CC cash transfer details',
                        checkboxDescription: 'Including From/To cost centers, amount, and transfer date',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please enter your verification remarks…',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 500,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-blue-200 dark:border-blue-700',
                    }}
                />

                {/* ── Action Buttons ────────────────────────────────────── */}
                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                        <span className="text-gray-500 text-sm">Loading actions…</span>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-700">
                        <p className="text-red-600 dark:text-red-400 text-center text-sm">⚠️ Error loading actions: {statusError}</p>
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700">
                        <p className="text-yellow-700 dark:text-yellow-400 text-center text-sm">ℹ️ No actions available for this transfer</p>
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

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

            <InboxHeader
                title={`${InboxTitle || 'CC Cash Transfer Verification'} (${transfers.length})`}
                subtitle={ModuleDisplayName}
                itemCount={transfers.length}
                onBackClick={() => onNavigate?.('dashboard', { name: 'Dashboard', type: 'dashboard' })}
                HeaderIcon={ArrowRight}
                badgeText="CC Transfer"
                badgeCount={transfers.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by voucher no, ref no, CC code…',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                filters={[]}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600"
            />

            <div className="px-6 mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

            <div className="container mx-auto px-6">
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
                            onItemSelect={handleItemSelect}
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
                                title: 'Pending Transfers',
                                icon: Clock,
                                emptyMessage: 'No pending CC cash transfers found!',
                                itemKey: 'Refno',
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
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'CC Cash Transfer Verification' : 'Transfer Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-14">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ArrowRight className="w-12 h-12 text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Transfer Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Select a CC cash transfer from the list to verify.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VerifyCCCashTransfer;
