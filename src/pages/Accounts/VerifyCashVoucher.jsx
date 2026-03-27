import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Banknote, Calendar, FileText, Tag, Clock, RefreshCw,
    IndianRupee, Building2, User, Receipt,
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchPendingCashVouchers,
    fetchCashVoucherById,
    submitCashVoucherVerification,
    clearVoucherDetail,
    clearVerifyResult,
    selectPendingVouchers,
    selectSelectedVoucherDetail,
    selectVerifyStatus,
    selectPendingVouchersLoading,
    selectVoucherDetailLoading,
    selectVerifyLoading,
    selectPendingVouchersError,
} from '../../slices/accountsSlice/cashVoucherSlice';

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

const VerifyCashVoucher = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const pendingVouchers = useSelector(selectPendingVouchers);
    const voucherDetail   = useSelector(selectSelectedVoucherDetail);
    const listLoading     = useSelector(selectPendingVouchersLoading);
    const detailLoading   = useSelector(selectVoucherDetailLoading);
    const verifyLoading   = useSelector(selectVerifyLoading);
    const listError       = useSelector(selectPendingVouchersError);

    const remarks         = useSelector(selectRemarks);
    const remarksLoading  = useSelector(selectRemarksLoading);

    const statusLoading   = useSelector(selectStatusListLoading);
    const statusError     = useSelector(selectStatusListError);
    const enabledActions  = useSelector(selectEnabledActions);
    const hasActions      = useSelector(selectHasActions);

    const { userData } = useSelector((s) => s.auth);
    const roleId = userData?.roleId || userData?.RID || 0;

    const [selectedItem, setSelectedItem]               = useState(null);
    const [isVerified, setIsVerified]                   = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showRemarksHistory, setShowRemarksHistory]   = useState(false);
    const [searchQuery, setSearchQuery]                 = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered]   = useState(false);

    const { InboxTitle, ModuleDisplayName, RoleId } = notificationData || {};

    const currentUser = userData?.userName || 'system';

    const formatAmount = (val) => {
        const n = parseFloat(val);
        if (isNaN(n)) return '0.00';
        return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // ── Init ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (RoleId) dispatch(fetchPendingCashVouchers(RoleId));
    }, [RoleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(clearVoucherDetail());
            dispatch(resetApprovalData());
            dispatch(clearVerifyResult());
        };
    }, [dispatch]);

    // ── On item select → fetch detail ────────────────────────────────────────
    useEffect(() => {
        if (selectedItem) {
            dispatch(clearVoucherDetail());
            dispatch(resetApprovalData());
            dispatch(fetchCashVoucherById(selectedItem.Voucherno));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // ── On detail load → fetch status list + remarks ─────────────────────────
    useEffect(() => {
        if (voucherDetail?.MOID && RoleId) {
            dispatch(fetchStatusList({
                MOID: voucherDetail.MOID,
                ROID: RoleId,
                ChkAmt: parseFloat(voucherDetail.Amount) || 0,
            }));
            dispatch(setSelectedMOID(voucherDetail.MOID));
            dispatch(fetchRemarks({
                trno: voucherDetail.Voucherno || selectedItem?.Voucherno || '',
                moid: voucherDetail.MOID,
            }));
        }
    }, [voucherDetail?.MOID, RoleId, dispatch]);

    // ── Collapse left panel when item selected ───────────────────────────────
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleItemSelect = (item) => {
        setSelectedItem(item);
    };

    const handleRefresh = () => {
        if (RoleId) dispatch(fetchPendingCashVouchers(RoleId));
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No voucher selected'); return; }
        if (!verificationComment.trim()) {
            toast.error('Verification comment is mandatory before proceeding.');
            return;
        }
        if (!isVerified) {
            toast.error('Please verify the voucher details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value || action.type || '';
        if (!actionValue.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        const payload = {
            Voucherno:       voucherDetail?.Voucherno || selectedItem.Voucherno,
            ApprovalRemarks: verificationComment.trim(),
            Approvalstatus:  actionValue,
            RoleID:          RoleId || 0,
            Createdby:       currentUser,
            UID:             voucherDetail?.UID || 0,
            CID:             voucherDetail?.CID || selectedItem.CID || 0,
        };

        try {
            await dispatch(submitCashVoucherVerification(payload)).unwrap();
            toast.success(`${action.text || actionValue} completed successfully!`);
            setTimeout(() => {
                dispatch(fetchPendingCashVouchers(RoleId));
                dispatch(clearVoucherDetail());
                dispatch(clearVerifyResult());
                dispatch(resetApprovalData());
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
            }, 800);
        } catch (err) {
            toast.error(typeof err === 'string' ? err : (err?.message || 'Action failed'), { autoClose: 10000 });
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredItems = pendingVouchers.filter(v =>
        !searchQuery ||
        v.Voucherno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.DCACode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.SelfCCCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isGST = voucherDetail?.PaymentType === 'GST';

    // ── Stats cards ───────────────────────────────────────────────────────────
    const statsCards = [
        {
            icon: Receipt,
            value: pendingVouchers.length,
            label: 'Total Pending',
            color: 'indigo',
        },
        {
            icon: IndianRupee,
            value: `₹${formatAmount(pendingVouchers.reduce((s, v) => s + parseFloat(v.Amount || 0), 0))}`,
            label: 'Total Amount',
            color: 'purple',
        },
        {
            icon: Building2,
            value: [...new Set(pendingVouchers.map(v => v.SelfCCCode).filter(Boolean))].length,
            label: 'Cost Centers',
            color: 'blue',
        },
        {
            icon: User,
            value: [...new Set(pendingVouchers.map(v => v.Name).filter(Boolean))].length,
            label: 'Payees',
            color: 'violet',
        },
    ];

    // ── Left panel item renderers ─────────────────────────────────────────────
    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 border-2 border-indigo-200 flex items-center justify-center flex-shrink-0">
                    <Banknote className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.Name || '—'}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.SelfCCCode}</p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded truncate">{item.Voucherno}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">₹{formatAmount(item.Amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" /><span>{item.PaymentDate}</span>
                    </span>
                    <span className="truncate max-w-[100px] text-gray-500">{item.DCACode}</span>
                </div>
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-800/50 dark:to-blue-800/50 flex items-center justify-center">
            <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail content ────────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;

        return (
            <div className="space-y-6">
                {detailLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">Loading voucher details...</span>
                        </div>
                    </div>
                )}

                {voucherDetail && (
                    <>
                        {/* ── Voucher Receipt Card ────────────────────────────── */}
                        <div className="border-2 border-indigo-300 dark:border-indigo-600 rounded-xl overflow-hidden shadow-md">
                            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-5 py-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-white">
                                    <Banknote className="w-5 h-5" />
                                    <span className="font-bold text-sm tracking-wide">CASH PAYMENT VOUCHER</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded font-mono">
                                        {voucherDetail.Voucherno}
                                    </span>
                                    {voucherDetail.PaymentType && (
                                        <span className={`px-2 py-1 text-xs rounded font-medium ${isGST ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-900'}`}>
                                            {voucherDetail.PaymentType}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-indigo-50/30 dark:bg-gray-900/40 p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold uppercase tracking-wide mb-1">Payee</p>
                                        <p className="text-gray-900 dark:text-white font-semibold">{voucherDetail.Name || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold uppercase tracking-wide mb-1">Amount</p>
                                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                                            ₹{formatAmount(voucherDetail.Amount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />Invoice Date
                                        </p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.InvoiceDate || '—'}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />Payment Date
                                        </p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.PaymentDate || '—'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Self Cost Center</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.SelfCCCode || '—'}</p>
                                        {voucherDetail.SelfCCName && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{voucherDetail.SelfCCName}</p>
                                        )}
                                    </div>
                                    {voucherDetail.PaidAgainstCCCode && (
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Paid Against CC</p>
                                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.PaidAgainstCCCode}</p>
                                            {voucherDetail.PaidAgainstCCName && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{voucherDetail.PaidAgainstCCName}</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">DCA (Account Head)</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.DCACode || '—'}</p>
                                        {voucherDetail.DCAName && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{voucherDetail.DCAName}</p>
                                        )}
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Sub DCA</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.SubDCACode || '—'}</p>
                                        {voucherDetail.SubDCAName && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{voucherDetail.SubDCAName}</p>
                                        )}
                                    </div>
                                </div>

                                {voucherDetail.Remarks && (
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1 flex items-center">
                                            <FileText className="w-3 h-3 mr-1" />Remarks
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">{voucherDetail.Remarks}</p>
                                    </div>
                                )}

                                {/* GST breakdown */}
                                {isGST && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                                            <Tag className="w-4 h-4 mr-2" />GST Breakdown
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">GST No.</p>
                                                <p className="text-gray-800 dark:text-gray-200 font-mono text-xs">{voucherDetail.GSTNo || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Invoice Amount</p>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">₹{formatAmount(voucherDetail.InvoiceAmount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">IGST</p>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">₹{formatAmount(voucherDetail.IGSTAmount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">CGST / SGST</p>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                    ₹{formatAmount(voucherDetail.CGSTAmount)} / ₹{formatAmount(voucherDetail.SGSTAmount)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 flex justify-between">
                                            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Total (incl. GST)</span>
                                            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                                ₹{formatAmount(voucherDetail.Amount)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                checkboxLabel: '✓ I have verified all cash voucher details',
                                checkboxDescription: 'Including payee, amount, cost center, DCA, and payment dates',
                                commentLabel: 'Verification Comments',
                                commentPlaceholder: 'Please verify the payee, cost center allocation, amount, and any discrepancies...',
                                commentRequired: true,
                                commentRows: 4,
                                commentMaxLength: 1000,
                                showCharCount: true,
                                validationStyle: 'dynamic',
                                checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                                commentGradient: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
                                commentBorder: 'border-indigo-200 dark:border-indigo-700',
                            }}
                        />

                        {statusLoading ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                                </div>
                            </div>
                        ) : statusError ? (
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                                <p className="text-red-600 dark:text-red-400 text-center">⚠️ Error loading actions: {statusError}</p>
                            </div>
                        ) : !hasActions || !enabledActions || enabledActions.length === 0 ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                                <p className="text-yellow-700 dark:text-yellow-400 text-center">ℹ️ No actions available for this voucher</p>
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
                    </>
                )}
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <InboxHeader
                title={`${InboxTitle || 'Cash Voucher Verification'} (${pendingVouchers.length})`}
                subtitle={ModuleDisplayName}
                itemCount={pendingVouchers.length}
                onBackClick={() => onNavigate?.('dashboard', { name: 'Dashboard', type: 'dashboard' })}
                HeaderIcon={Banknote}
                badgeText="Cash Voucher"
                badgeCount={pendingVouchers.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by voucher no, payee, DCA, CC...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700"
            />

            <div className="px-6 mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-2 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

            <div className="container mx-auto px-6">
                <div
                    className={`grid transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                        ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                        : 'grid-cols-1 lg:grid-cols-3 gap-6'
                    }`}
                    onMouseLeave={() => {
                        if (selectedItem && isLeftPanelCollapsed) setIsLeftPanelHovered(false);
                    }}
                >
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
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No cash vouchers pending',
                                itemKey: 'CID',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
                            }}
                        />
                    </div>

                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                                        <Banknote className="w-4 h-4 text-white" />
                                    </div>
                                    <span>{selectedItem ? 'Voucher Verification' : 'Voucher Details'}</span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Banknote className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Voucher Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a cash voucher from the list to view details and verify.
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

export default VerifyCashVoucher;
