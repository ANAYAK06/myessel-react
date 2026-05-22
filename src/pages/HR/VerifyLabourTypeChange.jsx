import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeftRight, Clock, User, Building2, Calendar,
    CheckCircle2, AlertCircle, History, ChevronRight,
    Hash,
} from 'lucide-react';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchLTCInbox,
    fetchLTCById,
    fetchLTCWorkHistory,
    verifyLTCRequest,
    clearVerifyResult,
    clearRequestDetail,
    resetAll,
    selectLTCInbox,
    selectLTCRequestDetail,
    selectLTCWorkHistory,
    selectLTCLoading,
    selectLTCErrors,
} from '../../slices/HRSlice/labourTypeChangeSlice';

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

const LTC_MOID = 696;

const cn = (...c) => c.filter(Boolean).join(' ');

// ── Sub-components ────────────────────────────────────────────────────────────

const TypeBadge = ({ type }) => {
    const isOwn = type === 'Own Labour';
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
            isOwn
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
        )}>
            {isOwn ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
            {type}
        </span>
    );
};

const TypeCard = ({ title, data, highlight }) => (
    <div className={cn(
        'rounded-xl border-2 p-4',
        highlight
            ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40'
    )}>
        <p className={cn(
            'text-xs font-bold uppercase tracking-wide mb-3',
            highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
        )}>
            {title}
        </p>
        <div className="space-y-2">
            {data?.type && <TypeBadge type={data.type} />}
            {data?.contractorName && (
                <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    <span className="text-gray-800 dark:text-white font-medium">{data.contractorName}</span>
                </div>
            )}
            {data?.withEffect && (
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                        With effect from <strong className="text-gray-800 dark:text-white">{data.withEffect}</strong>
                    </span>
                </div>
            )}
            {data?.noContractor && (
                <p className="text-xs text-gray-400 italic">— No contractor —</p>
            )}
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const VerifyLabourTypeChange = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const inbox        = useSelector(selectLTCInbox);
    const detail       = useSelector(selectLTCRequestDetail);
    const workHistory  = useSelector(selectLTCWorkHistory);
    const loading      = useSelector(selectLTCLoading);
    const errors       = useSelector(selectLTCErrors);

    const remarks        = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);
    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId || userData?.RID;
    const userName = userData?.userName || userDetails?.userName || 'system';

    const [selectedItem,          setSelectedItem]          = useState(null);
    const [isVerified,            setIsVerified]            = useState(false);
    const [verificationComment,   setVerificationComment]   = useState('');
    const [showRemarksHistory,    setShowRemarksHistory]    = useState(false);
    const [showWorkHistory,       setShowWorkHistory]       = useState(false);
    const [searchQuery,           setSearchQuery]           = useState('');
    const [isLeftPanelCollapsed,  setIsLeftPanelCollapsed]  = useState(false);
    const [isLeftPanelHovered,    setIsLeftPanelHovered]    = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId) dispatch(fetchLTCInbox(roleId));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchLTCById(selectedItem.RequestId));
        dispatch(fetchLTCWorkHistory(selectedItem.LabourId));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
        setShowWorkHistory(false);
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (!selectedItem || !roleId) return;
        dispatch(fetchStatusList({ MOID: LTC_MOID, ROID: roleId, ChkAmt: 0 }));
        dispatch(setSelectedMOID(LTC_MOID));
    }, [selectedItem, roleId, dispatch]);

    useEffect(() => {
        if (!selectedItem || !roleId) return;
        const trno = detail?.NotifRefNo
            || selectedItem?.NotifRefNo
            || selectedItem?.TransactionRefNo
            || String(selectedItem?.RequestId || '');
        dispatch(fetchRemarks({ trno, moid: LTC_MOID }));
    }, [selectedItem, roleId, detail, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleRefresh = () => {
        if (roleId) dispatch(fetchLTCInbox(roleId));
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No request selected.'); return; }
        if (!verificationComment.trim()) { toast.error('Verification comment is mandatory.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox before proceeding.'); return; }

        const actionValue = action.value || action.text || action.type || 'Approve';
        const mappedAction = actionValue.toLowerCase().includes('reject') ? 'Reject' : 'Approve';

        try {
            const result = await dispatch(verifyLTCRequest({
                RequestId:  selectedItem.RequestId,
                Action:     mappedAction,
                Note:       verificationComment.trim(),
                RoleId:     roleId,
                ReviewedBy: userName,
            })).unwrap();

            const verb = mappedAction === 'Reject' ? 'Rejected' : 'Approved';
            toast.success(`Request ${verb} successfully!`);

            setTimeout(() => {
                dispatch(fetchLTCInbox(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setShowWorkHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearRequestDetail());
                dispatch(clearVerifyResult());
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
            item.LabourName?.toLowerCase().includes(q) ||
            item.LabourId?.toLowerCase().includes(q) ||
            item.RequestedBy?.toLowerCase().includes(q) ||
            item.CurrentType?.toLowerCase().includes(q) ||
            item.NewType?.toLowerCase().includes(q)
        );
    });

    // ── Left panel render ─────────────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
                        <ArrowLeftRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.LabourName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.LabourId}</p>
                </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-400">From</span>
                    <TypeBadge type={item.CurrentType} />
                    <ArrowLeftRight className="w-3 h-3 text-gray-400" />
                    <TypeBadge type={item.NewType} />
                </div>
                {item.WithEffectFrom && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>w.e.f. {item.WithEffectFrom}</span>
                    </div>
                )}
                {item.RequestedOn && (
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.RequestedOn}</span>
                    </div>
                )}
                {item.NewContractorName && (
                    <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{item.NewContractorName}</span>
                    </div>
                )}
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Work history timeline ─────────────────────────────────────────────────

    const renderWorkHistorySection = () => (
        <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
            <button
                onClick={() => setShowWorkHistory(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <History className="h-4 w-4 text-indigo-500" />
                    Work History
                    {workHistory.length > 0 && (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">
                            {workHistory.length}
                        </span>
                    )}
                </span>
                <ChevronRight className={cn('h-4 w-4 transition-transform', showWorkHistory && 'rotate-90')} />
            </button>

            {showWorkHistory && (
                <div className="px-4 py-3">
                    {loading.workHistory ? (
                        <p className="text-sm text-gray-500 py-2">Loading work history...</p>
                    ) : workHistory.length === 0 ? (
                        <p className="text-sm text-gray-400 italic py-2">No work history found.</p>
                    ) : (
                        <div className="relative pl-5 space-y-3">
                            {workHistory.map((h, i) => (
                                <div key={h.HistoryId} className="relative">
                                    <div className={cn(
                                        'absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800',
                                        h.ToDate === 'Present' ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-500'
                                    )} />
                                    {i < workHistory.length - 1 && (
                                        <div className="absolute -left-[17px] top-4 w-0.5 h-full bg-gray-200 dark:bg-gray-600" />
                                    )}
                                    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 text-xs space-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <TypeBadge type={h.LabourType} />
                                            {h.ToDate === 'Present' && (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                                            )}
                                        </div>
                                        {h.ContractorName && (
                                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Building2 className="h-3 w-3" /> {h.ContractorName}
                                            </p>
                                        )}
                                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {h.WithEffectFrom} → {h.ToDate}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // ── Right panel detail ────────────────────────────────────────────────────

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        return (
            <div className="space-y-6">
                {loading.detail && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading request details...</span>
                    </div>
                )}

                {/* Labour header card */}
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                            <ArrowLeftRight className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {detail?.LabourName || selectedItem?.LabourName}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">
                                {detail?.LabourId || selectedItem?.LabourId}
                                {(detail?.NotifRefNo || selectedItem?.NotifRefNo) &&
                                    ` · Ref: ${detail?.NotifRefNo || selectedItem?.NotifRefNo}`}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                                    {detail?.Status || selectedItem?.Status || 'Pending'}
                                </span>
                                {(detail?.RequestedBy || selectedItem?.RequestedBy) && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {detail?.RequestedBy || selectedItem?.RequestedBy}
                                    </span>
                                )}
                                {(detail?.RequestedOn || selectedItem?.RequestedOn) && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {detail?.RequestedOn || selectedItem?.RequestedOn}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current → New type comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Current Type</span>
                        </div>
                        <TypeCard
                            title="Before Change"
                            data={{
                                type: detail?.CurrentType || selectedItem?.CurrentType,
                                contractorName: detail?.CurrentContractorName || selectedItem?.CurrentContractorName || null,
                                noContractor: (detail?.CurrentType || selectedItem?.CurrentType) === 'Own Labour',
                            }}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Requested Change</span>
                        </div>
                        <TypeCard
                            title="After Change"
                            highlight
                            data={{
                                type: detail?.NewType || selectedItem?.NewType,
                                contractorName: detail?.NewContractorName || selectedItem?.NewContractorName || null,
                                withEffect: detail?.WithEffectFrom || selectedItem?.WithEffectFrom,
                                noContractor: (detail?.NewType || selectedItem?.NewType) === 'Own Labour',
                            }}
                        />
                    </div>
                </div>

                {/* Ref no row */}
                {(detail?.NotifRefNo || selectedItem?.NotifRefNo) && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 rounded-xl px-4 py-2.5 border border-gray-200 dark:border-gray-600">
                        <Hash className="h-4 w-4 shrink-0" />
                        <span>Transaction Reference: <strong className="text-gray-800 dark:text-white font-mono">{detail?.NotifRefNo || selectedItem?.NotifRefNo}</strong></span>
                    </div>
                )}

                {/* Work history */}
                {renderWorkHistorySection()}

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
                        checkboxLabel: '✓ I have reviewed this labour type change request',
                        checkboxDescription: 'Confirm that the type change is valid and the effective date is acceptable',
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

                {/* Action buttons */}
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
                        loading={loading.verify}
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

    const statsCards = [
        { icon: ArrowLeftRight, value: inbox.length,  label: 'Total Pending',   color: 'indigo' },
        { icon: Clock,           value: inbox.length,  label: 'Awaiting Action', color: 'purple' },
        { icon: User,            value: detail?.LabourId ? 1 : '—', label: 'Selected', color: 'blue' },
        {
            icon: ArrowLeftRight,
            value: detail ? `${detail.CurrentType?.split(' ')[0]} → ${detail.NewType?.split(' ')[0]}` : '—',
            label: 'Change Type', color: 'violet',
        },
    ];

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <InboxHeader
                title={`${InboxTitle || 'Labour Type Change Verification'} (${inbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={inbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={ArrowLeftRight}
                badgeText="Type Change"
                badgeCount={inbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, labour ID, type...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600"
            />

            <div className="px-6 -mt-auto mb-6">
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
                                emptyMessage: 'No type change requests pending.',
                                itemKey: 'RequestId',
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
                                    <ArrowLeftRight className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {selectedItem ? 'Type Change Verification' : 'Select a Request'}
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? renderDetailContent() : (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ArrowLeftRight className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Request Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Select a labour type change request from the list to review and verify.
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

export default VerifyLabourTypeChange;
