import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    CreditCard, Clock, User, Building2, Calendar,
    IndianRupee, Hash, Landmark, Wallet, ChevronRight,
    BadgePercent, Repeat2, CalendarClock,
} from 'lucide-react';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchHRAdvancePayInbox,
    fetchHRAdvancePayDetail,
    approveHRAdvancePay,
    clearDetail,
    clearApproveResult,
    resetAll,
    selectHRAdvancePayInbox,
    selectHRAdvancePayDetail,
    selectHRAdvancePayLoading,
    selectHRAdvancePayErrors,
} from '../../slices/HRSlice/hrAdvancePayVerifySlice';

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

// MOID for HR Advance Payment module (from API detail response)
const ADV_MOID = 364;

const cn = (...c) => c.filter(Boolean).join(' ');

const fmt = (n) =>
    n != null && n !== '' ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

// ── Sub-components ────────────────────────────────────────────────────────────

const AdvanceTypeBadge = ({ type }) => {
    const isLTA = type === 'LTA';
    return (
        <span className={cn(
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold',
            isLTA
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
        )}>
            <Wallet className="h-3 w-3" />
            {type || 'Advance'}
        </span>
    );
};

const InfoRow = ({ icon: Icon, label, value, valueClass }) => (
    <div className="flex items-start gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
        <Icon className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
        <span className="text-xs text-gray-500 dark:text-gray-400 w-32 shrink-0">{label}</span>
        <span className={cn('text-xs font-semibold text-gray-800 dark:text-gray-100 flex-1', valueClass)}>
            {value || '—'}
        </span>
    </div>
);

const DetailCard = ({ title, icon: Icon, children, accent = 'indigo' }) => {
    const accentMap = {
        indigo: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 bg-indigo-500',
        teal:   'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400 bg-teal-500',
        amber:  'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400 bg-amber-500',
    };
    const parts = accentMap[accent].split(' ');
    return (
        <div className={cn('rounded-xl border p-4 bg-gradient-to-r', parts[0], parts[1], parts[2], parts[3], parts[4], parts[5])}>
            <div className="flex items-center gap-2 mb-3">
                <div className={cn('p-1.5 rounded-lg', parts[12])}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <h4 className={cn('text-xs font-bold uppercase tracking-wide', parts[6], parts[7])}>{title}</h4>
            </div>
            {children}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

const VerifyHRAdvancePayment = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const inbox   = useSelector(selectHRAdvancePayInbox);
    const detail  = useSelector(selectHRAdvancePayDetail);
    const loading = useSelector(selectHRAdvancePayLoading);
    const errors  = useSelector(selectHRAdvancePayErrors);

    const remarks        = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);
    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId || userData?.RID;
    const userName = userData?.userName || userDetails?.userName || 'system';

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
        if (roleId) dispatch(fetchHRAdvancePayInbox(roleId));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchHRAdvancePayDetail({
            transNo:   selectedItem.TransactionRefNo,
            empRefNo:  selectedItem.EmployeeID,
        }));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (!selectedItem || !roleId) return;
        dispatch(fetchStatusList({ MOID: ADV_MOID, ROID: roleId, ChkAmt: 0 }));
        dispatch(setSelectedMOID(ADV_MOID));
    }, [selectedItem, roleId, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        const trno = selectedItem.TransactionRefNo || String(selectedItem.LTAId || '');
        dispatch(fetchRemarks({ trno, moid: ADV_MOID }));
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleRefresh = () => {
        if (roleId) dispatch(fetchHRAdvancePayInbox(roleId));
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No request selected.'); return; }
        if (!verificationComment.trim()) { toast.error('Verification comment is mandatory.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox before proceeding.'); return; }
        if (!detail) { toast.error('Advance details not loaded. Please wait.'); return; }

        const actionValue = action.value || action.text || action.type || 'Approve';
        const mappedAction = actionValue.toLowerCase().includes('reject') ? 'Reject' : 'Approve';

        try {
            const result = await dispatch(approveHRAdvancePay({
                EmpRefno:           detail.EmpRefno || selectedItem.EmployeeID,
                TransactionRefNo:   detail.TransactionRefNo,
                TransactionAmount:  detail.TransactionAmount,
                Action:             mappedAction,
                RoleID:             roleId,
                BankId:             detail.BankId || 0,
                Createdby:          userName,
                ApprovalNote:       verificationComment.trim(),
                AdvanceTransNo:     detail.AdvanceTransNo || selectedItem.TransactionRefNo,
            })).unwrap();

            const verb = actionValue.toLowerCase().includes('reject') ? 'Rejected'
                       : actionValue.toLowerCase().includes('verif')  ? 'Verified'
                       : 'Approved';
            toast.success(`Advance payment ${verb} successfully!`);

            setTimeout(() => {
                dispatch(fetchHRAdvancePayInbox(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearDetail());
                dispatch(clearApproveResult());
                dispatch(resetApprovalData());
            }, 800);
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || `Failed to ${mappedAction.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered inbox ────────────────────────────────────────────────────────

    const filteredItems = inbox.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.EmployeName?.toLowerCase().includes(q) ||
            item.EmployeeID?.toLowerCase().includes(q)  ||
            item.AdvanceType?.toLowerCase().includes(q) ||
            item.EmpRemarks?.toLowerCase().includes(q)  ||
            item.TransactionRefNo?.toLowerCase().includes(q)
        );
    });

    // ── Left panel item card ──────────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full border-2 border-teal-200 dark:border-teal-600 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-800/40 dark:to-cyan-800/40 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.EmployeName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.EmployeeID}</p>
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <AdvanceTypeBadge type={item.AdvanceType} />
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{fmt(item.LTAAmount)}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Repeat2 className="w-3 h-3 shrink-0" />
                    <span>{fmt(item.EMIAmount)} × {item.NoOfInstallments} installments</span>
                </div>
                {item.RequestedDate && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{item.RequestedDate}</span>
                    </div>
                )}
                {item.EmpRemarks && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic truncate">"{item.EmpRemarks}"</p>
                )}
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-teal-200 dark:border-teal-600 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-800/40 dark:to-cyan-800/40 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
    );

    // ── Right panel detail ────────────────────────────────────────────────────

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const src = detail || {};

        return (
            <div className="space-y-5">
                {loading.detail && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading advance details…</span>
                    </div>
                )}

                {/* Employee header */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border-2 border-teal-200 dark:border-teal-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shrink-0">
                            <CreditCard className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {src.EmployeName || selectedItem.EmployeName}
                            </h2>
                            <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm mt-0.5">
                                {src.EmpRefno || selectedItem.EmployeeID}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <AdvanceTypeBadge type={src.AdvanceType || selectedItem.AdvanceType} />
                                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                                    Pending Approval
                                </span>
                                {(src.CCName || selectedItem.CCCode) && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {src.CCName || selectedItem.CCCode}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Amount highlight */}
                        <div className="text-right shrink-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Amount</p>
                            <p className="text-2xl font-black text-teal-600 dark:text-teal-400">
                                {fmt(src.LTAAmount || selectedItem.LTAAmount)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Advance details */}
                    <DetailCard title="Advance Details" icon={Wallet} accent="indigo">
                        <InfoRow icon={BadgePercent} label="Advance Type"   value={src.AdvanceType || selectedItem.AdvanceType} />
                        <InfoRow icon={IndianRupee}  label="Advance Amount" value={fmt(src.LTAAmount || selectedItem.LTAAmount)} valueClass="text-indigo-700 dark:text-indigo-300 font-bold" />
                        <InfoRow icon={IndianRupee}  label="Balance"        value={fmt(src.LTABalance ?? selectedItem.LTABalance)} />
                        <InfoRow icon={Repeat2}      label="EMI Amount"     value={fmt(src.EMIAmount || selectedItem.EMIAmount)} />
                        <InfoRow icon={Hash}         label="Installments"   value={src.NoOfInstallments ?? selectedItem.NoOfInstallments} />
                        <InfoRow icon={Hash}         label="Balance EMIs"   value={src.NoOfBalanceInstallments ?? selectedItem.NoOfBalanceInstallments} />
                        <InfoRow icon={Calendar}     label="Requested Date" value={src.RequestedDate || selectedItem.RequestedDate} />
                        {src.EMIStartDate  && <InfoRow icon={CalendarClock} label="EMI Start"    value={src.EMIStartDate} />}
                        {src.SADeductMonth && <InfoRow icon={CalendarClock} label="Deduct Month" value={src.SADeductMonth} />}
                        {(src.Purpose || selectedItem.EmpRemarks) && (
                            <InfoRow icon={User} label="Purpose" value={src.Purpose || selectedItem.EmpRemarks} />
                        )}
                    </DetailCard>

                    {/* Payment details */}
                    <DetailCard title="Payment Details" icon={Landmark} accent="teal">
                        <InfoRow icon={IndianRupee} label="Trans Amount"   value={fmt(src.TransactionAmount)}       valueClass="text-teal-700 dark:text-teal-300 font-bold" />
                        <InfoRow icon={Calendar}    label="Trans Date"     value={src.TransactionDate} />
                        <InfoRow icon={Landmark}    label="Bank"           value={src.Bank} />
                        <InfoRow icon={CreditCard}  label="Mode of Pay"    value={src.Modeofpay} />
                        <InfoRow icon={Hash}        label="Pay Trans No"   value={src.PayTransNo} />
                        <InfoRow icon={Hash}        label="Adv Trans No"   value={src.AdvanceTransNo || selectedItem.TransactionRefNo} />
                        {src.CCCode && <InfoRow icon={Building2} label="Cost Centre" value={`${src.CCCode} · ${src.CCName || ''}`} />}
                    </DetailCard>
                </div>

                {/* Ref numbers strip */}
                <div className="flex flex-wrap gap-3">
                    {(src.AdvanceTransNo || selectedItem.TransactionRefNo) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
                            <Hash className="h-3.5 w-3.5 shrink-0" />
                            <span>Advance Ref: <strong className="text-gray-800 dark:text-white font-mono">{src.AdvanceTransNo || selectedItem.TransactionRefNo}</strong></span>
                        </div>
                    )}
                    {src.TransactionRefNo && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
                            <Hash className="h-3.5 w-3.5 shrink-0" />
                            <span>Payment Ref: <strong className="text-gray-800 dark:text-white font-mono">{src.TransactionRefNo}</strong></span>
                        </div>
                    )}
                </div>

                {/* Reporting manager remarks */}
                {selectedItem.ReportingMgrRemarks && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                            Reporting Manager Remarks
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{selectedItem.ReportingMgrRemarks}</p>
                    </div>
                )}

                {/* Remarks history */}
                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={remarks}
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
                        checkboxLabel:       '✓ I have reviewed this advance payment request',
                        checkboxDescription: 'Confirm the advance amount, EMI schedule, and bank details are correct',
                        commentLabel:        'Verification Comments',
                        commentPlaceholder:  'Enter your verification remarks…',
                        commentRequired:     true,
                        commentRows:         3,
                        commentMaxLength:    500,
                        showCharCount:       true,
                        validationStyle:     'dynamic',
                        checkboxGradient:    'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient:     'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
                        commentBorder:       'border-teal-200 dark:border-teal-700',
                    }}
                />

                {/* Action buttons */}
                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading actions…</span>
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
                        loading={loading.approve}
                        isVerified={isVerified}
                        comment={verificationComment}
                        showValidation={true}
                        excludeActions={['send back']}
                    />
                )}
            </div>
        );
    };

    // ── Stats ─────────────────────────────────────────────────────────────────

    const totalAmount = inbox.reduce((sum, i) => sum + (i.LTAAmount || 0), 0);

    const statsCards = [
        { icon: CreditCard,   value: inbox.length,       label: 'Total Pending',   color: 'teal'   },
        { icon: Clock,        value: inbox.length,        label: 'Awaiting Action', color: 'purple' },
        { icon: IndianRupee,  value: fmt(totalAmount),    label: 'Total Amount',    color: 'indigo' },
        { icon: User,         value: detail?.EmpRefno || selectedItem?.EmployeeID || '—', label: 'Selected', color: 'cyan' },
    ];

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'HR Advance Payment Verification'} (${inbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={inbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={CreditCard}
                badgeText="Advance Payment"
                badgeCount={inbox.length}
                searchConfig={{
                    enabled:     true,
                    placeholder: 'Search by name, ID, advance type…',
                    value:       searchQuery,
                    onChange:    (e) => setSearchQuery(e.target.value),
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
                            title:           'Pending Verification',
                            icon:            Clock,
                            emptyMessage:    'No advance payment requests pending.',
                            itemKey:         'LTAId',
                            enableCollapse:  true,
                            enableRefresh:   true,
                            enableHover:     true,
                            maxHeight:       '100%',
                            headerGradient:  'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
                        }}
                    />
                </div>

                {/* Right panel */}
                <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                                <CreditCard className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                {selectedItem ? 'Advance Payment Verification' : 'Select a Request'}
                            </h2>
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            {selectedItem ? renderDetailContent() : (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="w-12 h-12 text-teal-400 dark:text-teal-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Request Selected
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Select an advance payment request from the list to review and verify.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* END right panel */}

            </div>
            {/* END grid */}

        </div>
        // END outer space-y-6
    );
};

export default VerifyHRAdvancePayment;