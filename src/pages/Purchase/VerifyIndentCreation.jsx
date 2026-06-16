import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ShoppingCart, Clock, Hash, Calendar, Building2,
    User, Package, ChevronDown, ChevronUp, Tag,
    FileText, Layers,
} from 'lucide-react';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchIndentInbox,
    fetchIndentItems,
    fetchIndentRemarks,
    submitIndentVerification,
    clearDetail,
    clearApprovalResult,
    resetAll,
    selectIndentInbox,
    selectIndentItems,
    selectIndentRemarks,
    selectIndentLoading,
    selectIndentErrors,
} from '../../slices/purchaseSlice/indentVerificationSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton,
} from '../../slices/CommonSlice/getStatusSlice';

// MOID for Purchase Indent module — update if backend provides a different value
const INDENT_MOID = 171;

const cn = (...c) => c.filter(Boolean).join(' ');

// ── Sub-components ─────────────────────────────────────────────────────────────

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
    const styles = {
        indigo: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 bg-indigo-500',
        amber:  'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400 bg-amber-500',
        teal:   'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400 bg-teal-500',
    };
    const p = styles[accent].split(' ');
    return (
        <div className={cn('rounded-xl border p-4 bg-gradient-to-r', p[0], p[1], p[2], p[3], p[4], p[5])}>
            <div className="flex items-center gap-2 mb-3">
                <div className={cn('p-1.5 rounded-lg', p[12])}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <h4 className={cn('text-xs font-bold uppercase tracking-wide', p[6], p[7])}>{title}</h4>
            </div>
            {children}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();
    const cls = s.includes('approv') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : s.includes('reject') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              : s.includes('pend')   ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold', cls)}>
            {status || 'Pending'}
        </span>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const VerifyIndentCreation = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const inbox   = useSelector(selectIndentInbox);
    const items   = useSelector(selectIndentItems);
    const remarks = useSelector(selectIndentRemarks);
    const loading = useSelector(selectIndentLoading);
    const errors  = useSelector(selectIndentErrors);

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
    const [showItemsTable,       setShowItemsTable]       = useState(true);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId) dispatch(fetchIndentInbox({ roleId, created: userName, userId }));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
        };
    }, [roleId, userId, userName, dispatch]);

    useEffect(() => {
        if (!selectedItem) return;
        const indno = selectedItem.Indno;
        dispatch(fetchIndentItems(indno));
        dispatch(fetchIndentRemarks(indno));
        dispatch(fetchStatusList({ MOID: INDENT_MOID, ROID: roleId, ChkAmt: 0 }));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
        setShowItemsTable(true);
    }, [selectedItem, roleId, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleRefresh = () => {
        if (roleId) dispatch(fetchIndentInbox({ roleId, created: userName, userId }));
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No indent selected.'); return; }
        if (!verificationComment.trim()) { toast.error('Verification comment is mandatory.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox before proceeding.'); return; }

        const actionText = action.value || action.text || action.type || 'Approve';
        const appstatus  = actionText.toLowerCase().includes('reject') ? 'Reject'
                         : actionText.toLowerCase().includes('return') ? 'Return'
                         : 'Approve';

        const payload = {
            Rowid:          selectedItem.Rowid   || selectedItem.Indno || '',
            Appstatus:      appstatus,
            AprovalRemarks: verificationComment.trim(),
            Remarks:        verificationComment.trim(),
            Crtdby:         userName,
            Createdby:      userName,
            Indent:         selectedItem.Indno   || '',
            IndentNo:       selectedItem.Indno   || '',
            Roleid:         roleId,
            RoleId:         roleId,
        };

        try {
            await dispatch(submitIndentVerification(payload)).unwrap();

            const verb = appstatus === 'Reject' ? 'Rejected'
                       : appstatus === 'Return' ? 'Returned'
                       : 'Approved';
            toast.success(`Indent ${verb} successfully!`);

            setTimeout(() => {
                dispatch(fetchIndentInbox({ roleId, created: '', userId }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearDetail());
                dispatch(clearApprovalResult());
                dispatch(resetApprovalData());
            }, 800);
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || `Failed to ${appstatus.toLowerCase()} indent`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered inbox ─────────────────────────────────────────────────────────

    const filteredItems = inbox.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.Indno?.toLowerCase().includes(q)       ||
            item.CreatedBy?.toLowerCase().includes(q)   ||
            item.Department?.toLowerCase().includes(q)  ||
            item.Status?.toLowerCase().includes(q)      ||
            item.IndentDate?.toLowerCase().includes(q)
        );
    });

    // ── Left panel card ────────────────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono truncate">{item.Indno}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.CreatedBy}</p>
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <StatusBadge status={item.Status || item.ApprovalStatus} />
                    {item.TotalItems != null && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {item.TotalItems} items
                        </span>
                    )}
                </div>
                {item.IndentDate && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{item.IndentDate}</span>
                    </div>
                )}
                {item.Department && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.Department}</span>
                    </div>
                )}
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Right panel detail ─────────────────────────────────────────────────────

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        return (
            <div className="space-y-5">
                {loading.items && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading indent items…</span>
                    </div>
                )}

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-5 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                            <ShoppingCart className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                                {selectedItem.Indno}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">
                                {selectedItem.Department}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <StatusBadge status={selectedItem.Status || selectedItem.ApprovalStatus} />
                                {selectedItem.TotalItems != null && (
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        {selectedItem.TotalItems} items
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailCard title="Indent Info" icon={FileText} accent="indigo">
                        <InfoRow icon={Hash}       label="Indent No"    value={selectedItem.Indno} />
                        <InfoRow icon={Calendar}   label="Indent Date"  value={selectedItem.IndentDate} />
                        <InfoRow icon={Calendar}   label="Created Date" value={selectedItem.CreatedDate} />
                        <InfoRow icon={User}       label="Created By"   value={selectedItem.CreatedBy} />
                        <InfoRow icon={Tag}        label="Status"       value={selectedItem.Status} />
                    </DetailCard>

                    <DetailCard title="Department" icon={Building2} accent="teal">
                        <InfoRow icon={Building2}  label="Department"       value={selectedItem.Department} />
                        <InfoRow icon={Layers}     label="Approval Status"  value={selectedItem.ApprovalStatus} />
                        {selectedItem.TotalItems != null && (
                            <InfoRow icon={Package} label="Total Items" value={String(selectedItem.TotalItems)} />
                        )}
                    </DetailCard>
                </div>

                {/* Items table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                        onClick={() => setShowItemsTable(!showItemsTable)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b border-gray-200 dark:border-gray-700"
                    >
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Indent Items {items.length > 0 && `(${items.length})`}
                        </span>
                        {showItemsTable ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                    </button>

                    {showItemsTable && (
                        <div className="overflow-x-auto">
                            {items.length === 0 && !loading.items ? (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                                    No items found for this indent.
                                </p>
                            ) : (
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                                            <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">#</th>
                                            <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Item Code</th>
                                            <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Item Name</th>
                                            <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Qty</th>
                                            <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">UOM</th>
                                            <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Rate</th>
                                            <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                                            <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {items.map((item, idx) => (
                                            <tr key={item.ItemId || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                                                <td className="px-3 py-2 font-mono text-indigo-600 dark:text-indigo-400">{item.ItemCode}</td>
                                                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 max-w-[200px]">
                                                    <p className="truncate" title={item.ItemName}>{item.ItemName}</p>
                                                    {item.Description && (
                                                        <p className="text-gray-400 dark:text-gray-500 truncate text-[10px]">{item.Description}</p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-gray-200">{item.Quantity}</td>
                                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{item.UOM}</td>
                                                <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200">
                                                    {item.Rate != null ? Number(item.Rate).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-indigo-700 dark:text-indigo-300">
                                                    {item.Amount != null ? `₹${Number(item.Amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {item.Status ? <StatusBadge status={item.Status} /> : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>

                {/* Remarks history */}
                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={remarks}
                    loading={loading.remarks}
                    title="Approval History"
                />

                {/* Verification input */}
                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel:       '✓ I have reviewed this indent request',
                        checkboxDescription: 'Confirm all items, quantities, and department details are correct',
                        commentLabel:        'Verification Comments',
                        commentPlaceholder:  'Enter your verification remarks…',
                        commentRequired:     true,
                        commentRows:         3,
                        commentMaxLength:    500,
                        showCharCount:       true,
                        validationStyle:     'dynamic',
                        checkboxGradient:    'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient:     'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        commentBorder:       'border-indigo-200 dark:border-indigo-700',
                    }}
                />

                {/* Action buttons */}
                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
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
                        loading={loading.submit}
                        isVerified={isVerified}
                        comment={verificationComment}
                        showValidation={true}
                    />
                )}
            </div>
        );
    };

    // ── Stats ──────────────────────────────────────────────────────────────────

    const statsCards = [
        { icon: ShoppingCart, value: inbox.length,                                label: 'Total Pending',   color: 'indigo'  },
        { icon: Clock,        value: inbox.length,                                label: 'Awaiting Action', color: 'purple'  },
        { icon: Package,      value: selectedItem?.TotalItems ?? '—',             label: 'Items Selected',  color: 'teal'    },
        { icon: User,         value: selectedItem?.CreatedBy || '—',              label: 'Requested By',    color: 'cyan'    },
    ];

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'Indent Verification'} (${inbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={inbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={ShoppingCart}
                badgeText="Indent"
                badgeCount={inbox.length}
                searchConfig={{
                    enabled:     true,
                    placeholder: 'Search by indent no, department, created by…',
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
                            title:          'Pending Verification',
                            icon:           Clock,
                            emptyMessage:   'No indent requests pending verification.',
                            itemKey:        'Indno',
                            enableCollapse: true,
                            enableRefresh:  true,
                            enableHover:    true,
                            maxHeight:      '100%',
                            headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        }}
                    />
                </div>

                {/* Right panel */}
                <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg">
                                <ShoppingCart className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                {selectedItem ? `Indent: ${selectedItem.Indno}` : 'Select an Indent'}
                            </h2>
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            {selectedItem ? renderDetailContent() : (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingCart className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No Indent Selected
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Select an indent from the list to review items and verify.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyIndentCreation;
