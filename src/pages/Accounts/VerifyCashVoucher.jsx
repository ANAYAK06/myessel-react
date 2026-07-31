import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Banknote, Calendar, FileText, Tag, Clock,
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchPendingCashVouchers,
    fetchCashVoucherById,
    submitCashVoucherVerification,
    clearVoucherDetail,
    clearVerifyResult,
    selectPendingVouchers,
    selectSelectedVoucherDetail,
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

    // ── Left panel item renderers ─────────────────────────────────────────────
    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border-2 border-indigo-200 dark:border-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[160px]">{item.Name || '—'}</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 min-w-[110px]">{item.Voucherno}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">{item.SelfCCCode}</span>
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-[100px]">
                <Calendar className="w-3 h-3" /> {item.PaymentDate}
            </span>
            <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">₹{formatAmount(item.Amount)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail content ────────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;

        return (
            <div className="space-y-4">
                {detailLoading && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700 flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                        <span className="text-indigo-700 dark:text-indigo-400 text-sm">Loading voucher details...</span>
                    </div>
                )}

                {voucherDetail && (
                    <>
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <Banknote className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            {voucherDetail.Name || '—'}
                                        </h2>
                                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                            Voucher: {voucherDetail.Voucherno}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {voucherDetail.PaymentType && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isGST ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'}`}>
                                                    {voucherDetail.PaymentType}
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {voucherDetail.PaymentDate || '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        ₹{formatAmount(voucherDetail.Amount)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-5">
                            <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400">Payment Details</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Invoice Date</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.InvoiceDate || '—'}</p>
                                </div>
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Payment Date</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.PaymentDate || '—'}</p>
                                </div>
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Self Cost Center</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.SelfCCCode || '—'}</p>
                                    {voucherDetail.SelfCCName && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{voucherDetail.SelfCCName}</p>
                                    )}
                                </div>
                                {voucherDetail.PaidAgainstCCCode && (
                                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Paid Against CC</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.PaidAgainstCCCode}</p>
                                        {voucherDetail.PaidAgainstCCName && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{voucherDetail.PaidAgainstCCName}</p>
                                        )}
                                    </div>
                                )}
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">DCA (Account Head)</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.DCACode || '—'}</p>
                                    {voucherDetail.DCAName && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{voucherDetail.DCAName}</p>
                                    )}
                                </div>
                                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Sub DCA</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{voucherDetail.SubDCACode || '—'}</p>
                                    {voucherDetail.SubDCAName && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{voucherDetail.SubDCAName}</p>
                                    )}
                                </div>
                            </div>

                            {voucherDetail.Remarks && (
                                <div className="mt-3 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1 flex items-center">
                                        <FileText className="w-3 h-3 mr-1" />Remarks
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">{voucherDetail.Remarks}</p>
                                </div>
                            )}

                            {isGST && (
                                <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                                    <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center">
                                        <Tag className="w-4 h-4 mr-2" />GST Breakdown
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">GST No.</p>
                                            <p className="text-gray-800 dark:text-gray-200 font-mono text-xs">{voucherDetail.GSTNo || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Invoice Amount</p>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">₹{formatAmount(voucherDetail.InvoiceAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">IGST</p>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">₹{formatAmount(voucherDetail.IGSTAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">CGST / SGST</p>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                ₹{formatAmount(voucherDetail.CGSTAmount)} / ₹{formatAmount(voucherDetail.SGSTAmount)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700 flex justify-between">
                                        <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">Total (incl. GST)</span>
                                        <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                            ₹{formatAmount(voucherDetail.Amount)}
                                        </span>
                                    </div>
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
                                checkboxLabel: '✓ I have verified all cash voucher details',
                                checkboxDescription: 'Including payee, amount, cost center, DCA, and payment dates',
                                commentLabel: 'Verification Comments',
                                commentPlaceholder: 'Please verify the payee, cost center allocation, amount, and any discrepancies...',
                                commentRequired: true,
                                commentMaxLength: 1000,
                                showCharCount: true,
                                validationStyle: 'dynamic',
                                checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                                commentGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                                commentBorder: 'border-indigo-200 dark:border-indigo-700',
                            }}
                        />

                        {statusLoading ? (
                            <div className="flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                                <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                            </div>
                        ) : statusError ? (
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700 text-center">
                                <p className="text-red-600 dark:text-red-400">⚠️ Error loading actions: {statusError}</p>
                            </div>
                        ) : !hasActions || !enabledActions?.length ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700 text-center">
                                <p className="text-yellow-700 dark:text-yellow-400 text-sm">ℹ️ No actions available for this voucher</p>
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
        <div className="space-y-6">
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
                    onItemSelect: handleItemSelect,
                    renderItem: renderItemCard,
                    renderListItem: renderListItem,
                    renderCollapsedItem: renderCollapsedItem,
                    loading: listLoading,
                    error: listError,
                    onRefresh: handleRefresh,
                    config: {
                        title: 'Pending Verification',
                        icon: Clock,
                        emptyMessage: 'No cash vouchers pending',
                        itemKey: 'CID',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Cash Voucher Verification',
                        icon: Banknote,
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: detailLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Voucher Details',
                        icon: Banknote,
                        selectedTitle: 'Voucher Verification',
                        emptyTitle: 'No Voucher Selected',
                        emptyMessage: 'Select a cash voucher from the list to view details and verify.',
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        maxHeight: 'calc(100vh - 200px)',
                        sticky: true,
                        stickyTop: '1.5rem',
                    },
                }}
            />
        </div>
    );
};

export default VerifyCashVoucher;
