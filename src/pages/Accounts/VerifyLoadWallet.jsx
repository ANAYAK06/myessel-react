import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Wallet, Calendar, ArrowRight, Clock,
} from 'lucide-react';

import InboxHeader     from '../../components/Inbox/InboxHeader';
import ActionButtons   from '../../components/Inbox/ActionButtons';
import RemarksHistory  from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyLoadWalletGrid,
    fetchVerifyLoadWalletDetail,
    submitApproveLoadWallet,
    clearVerifyDetail,
    clearApproveResult,
    selectVerifyGrid,
    selectVerifyDetail,
    selectVerifyGridLoading,
    selectVerifyDetailLoading,
    selectApproveLoading,
    selectVerifyGridError,
} from '../../slices/accountsSlice/loadWalletSlice';

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

const VerifyLoadWallet = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const verifyGrid        = useSelector(selectVerifyGrid);
    const verifyDetail      = useSelector(selectVerifyDetail);
    const listLoading       = useSelector(selectVerifyGridLoading);
    const detailLoading     = useSelector(selectVerifyDetailLoading);
    const approveLoading    = useSelector(selectApproveLoading);
    const listError         = useSelector(selectVerifyGridError);

    const remarks           = useSelector(selectRemarks);
    const remarksLoading    = useSelector(selectRemarksLoading);

    const statusLoading     = useSelector(selectStatusListLoading);
    const statusError       = useSelector(selectStatusListError);
    const enabledActions    = useSelector(selectEnabledActions);
    const hasActions        = useSelector(selectHasActions);

    const { userData } = useSelector((s) => s.auth);
    const roleId    = userData?.roleId    || userData?.RID  || 0;
    const currentUser = userData?.userName || 'system';

    const [selectedItem,           setSelectedItem]           = useState(null);
    const [isVerified,             setIsVerified]             = useState(false);
    const [verificationComment,    setVerificationComment]    = useState('');
    const [showRemarksHistory,     setShowRemarksHistory]     = useState(false);
    const [searchQuery,            setSearchQuery]            = useState('');
    const [isLeftPanelCollapsed,   setIsLeftPanelCollapsed]   = useState(false);
    const [isLeftPanelHovered,     setIsLeftPanelHovered]     = useState(false);

    const { InboxTitle, ModuleDisplayName, RoleId } = notificationData || {};

    const formatAmount = (val) => {
        const n = parseFloat(val);
        if (isNaN(n)) return '0.00';
        return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // ── Init ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (RoleId) dispatch(fetchVerifyLoadWalletGrid(RoleId));
    }, [RoleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(clearVerifyDetail());
            dispatch(resetApprovalData());
            dispatch(clearApproveResult());
        };
    }, [dispatch]);

    // ── On item select → fetch detail ─────────────────────────────────────────
    useEffect(() => {
        if (selectedItem) {
            dispatch(clearVerifyDetail());
            dispatch(resetApprovalData());
            dispatch(fetchVerifyLoadWalletDetail({
                Refno:        selectedItem.TransactionRefno,
                TransferType: selectedItem.Transferfrom,
            }));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // ── On detail load → fetch status list + remarks ──────────────────────────
    useEffect(() => {
        if (verifyDetail?.MOID && RoleId) {
            dispatch(fetchStatusList({
                MOID:   verifyDetail.MOID,
                ROID:   RoleId,
                ChkAmt: parseFloat(verifyDetail.TransferAmount) || 0,
            }));
            dispatch(setSelectedMOID(verifyDetail.MOID));
            dispatch(fetchRemarks({
                trno: selectedItem?.TransactionRefno || '',
                moid: verifyDetail.MOID,
            }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [verifyDetail?.MOID, RoleId, dispatch]);

    // ── Collapse left panel when item selected ────────────────────────────────
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleRefresh = () => {
        if (RoleId) dispatch(fetchVerifyLoadWalletGrid(RoleId));
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No wallet transfer selected'); return; }
        if (!verificationComment.trim()) {
            toast.error('Verification comment is mandatory before proceeding.');
            return;
        }
        if (!isVerified) {
            toast.error('Please verify the transfer details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value || action.type || '';
        if (!actionValue.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        const payload = {
            Transferfrom:   verifyDetail?.Transferfrom || selectedItem.Transferfrom,
            FormId:         verifyDetail?.FormId || 0,
            ToId:           verifyDetail?.ToId   || 0,
            TransactionRefno: selectedItem.TransactionRefno,
            TransferAmount: verifyDetail?.TransferAmount || '0',
            Action:         actionValue,
            Remarks:        verificationComment.trim(),
            RoleId:         RoleId || roleId || 0,
            Createdby:      currentUser,
        };

        try {
            await dispatch(submitApproveLoadWallet(payload)).unwrap();
            toast.success(`${action.text || actionValue} completed successfully!`);
            setTimeout(() => {
                dispatch(fetchVerifyLoadWalletGrid(RoleId));
                dispatch(clearVerifyDetail());
                dispatch(clearApproveResult());
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
    const filteredItems = verifyGrid.filter(item =>
        !searchQuery ||
        item.TransactionRefno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ToWalletName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Transferfrom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.FromBankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.FromWalletName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ── Left panel renderers ──────────────────────────────────────────────────
    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border-2 border-indigo-200 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {item.ToWalletName || '—'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.Transferfrom === 'Bank' ? item.FromBankName : item.FromWalletName} → {item.Transferfrom}
                    </p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded truncate">
                        {item.TransactionRefno}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">₹{formatAmount(item.TransferAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" /><span>{item.TransactionDate}</span>
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        item.Transferfrom === 'Bank'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}>
                        {item.Transferfrom}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">{item.ToWalletName || '—'}</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 min-w-[110px]">{item.TransactionRefno}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[120px]">
                {item.Transferfrom === 'Bank' ? item.FromBankName : item.FromWalletName}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                item.Transferfrom === 'Bank'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
            }`}>
                {item.Transferfrom}
            </span>
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-[100px]">
                <Calendar className="w-3 h-3" />{item.TransactionDate}
            </span>
            <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">₹{formatAmount(item.TransferAmount)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail content ────────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;

        return (
            <div className="space-y-4">
                {detailLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                            <span className="text-blue-700 dark:text-blue-400 text-sm">Loading transfer details...</span>
                        </div>
                    </div>
                )}

                {verifyDetail && (
                    <>
                        {/* ── Detail Card ─────────────────────────────────────── */}
                        <div className="border-2 border-indigo-300 dark:border-indigo-600 rounded-xl overflow-hidden shadow-md">
                            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 px-5 py-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-white">
                                    <Wallet className="w-5 h-5" />
                                    <span className="font-bold text-sm tracking-wide">WALLET LOAD TRANSFER</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded font-mono">
                                        {verifyDetail.TransactionRefno}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                                        verifyDetail.Transferfrom === 'Bank'
                                            ? 'bg-blue-200 text-blue-900'
                                            : 'bg-purple-200 text-purple-900'
                                    }`}>
                                        {verifyDetail.Transferfrom}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-indigo-50/30 dark:bg-gray-900/40 p-5 space-y-4">

                                {/* Amount row */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold uppercase tracking-wide mb-1">
                                            {verifyDetail.Transferfrom === 'Bank' ? 'Source Bank' : 'Source Wallet'}
                                        </p>
                                        <p className="text-gray-900 dark:text-white font-semibold">
                                            {verifyDetail.Transferfrom === 'Bank'
                                                ? (selectedItem?.FromBankName || '—')
                                                : (verifyDetail.FromWalletName || '—')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold uppercase tracking-wide mb-1">Amount</p>
                                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                                            ₹{formatAmount(verifyDetail.TransferAmount)}
                                        </p>
                                    </div>
                                </div>

                                {verifyDetail.AmountInWords && (
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 italic">{verifyDetail.AmountInWords}</p>
                                )}

                                {/* Transfer route */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700">
                                    <div className="flex-1 text-center">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">From ({verifyDetail.Transferfrom})</p>
                                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                            {verifyDetail.Transferfrom === 'Bank'
                                                ? (selectedItem?.FromBankName || '—')
                                                : (verifyDetail.FromWalletName || '—')}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                                    <div className="flex-1 text-center">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">To (Wallet)</p>
                                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">{verifyDetail.ToWalletName || '—'}</p>
                                    </div>
                                </div>

                                {/* Details grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />Transaction Date
                                        </p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{verifyDetail.TransactionDate || '—'}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mode of Payment</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{verifyDetail.Modeofpay || '—'}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction No.</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm font-mono">{verifyDetail.TransactionNo || '—'}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference No.</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm font-mono">{verifyDetail.TransactionRefno || '—'}</p>
                                    </div>
                                </div>

                                {verifyDetail.WalletRemarks && (
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Wallet Remarks</p>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">{verifyDetail.WalletRemarks}</p>
                                    </div>
                                )}

                                {verifyDetail.Remarks && (
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Remarks</p>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">{verifyDetail.Remarks}</p>
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
                                checkboxLabel: '✓ I have verified all wallet transfer details',
                                checkboxDescription: 'Including source, destination wallet, amount, and transaction reference',
                                commentLabel: 'Verification Comments',
                                commentPlaceholder: 'Please verify the transfer source, destination wallet, amount, and any discrepancies...',
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
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                                    <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                                </div>
                            </div>
                        ) : statusError ? (
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                                <p className="text-red-600 dark:text-red-400 text-center">⚠️ Error loading actions: {statusError}</p>
                            </div>
                        ) : !hasActions || !enabledActions || enabledActions.length === 0 ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                                <p className="text-yellow-700 dark:text-yellow-400 text-center">ℹ️ No actions available for this transfer</p>
                            </div>
                        ) : (
                            <ActionButtons
                                actions={enabledActions}
                                onActionClick={handleActionClick}
                                loading={approveLoading}
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
                title={`${InboxTitle || 'Load Wallet Verification'} (${verifyGrid.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verifyGrid.length}
                onBackClick={() => onNavigate?.('dashboard', { name: 'Dashboard', type: 'dashboard' })}
                HeaderIcon={Wallet}
                badgeText="Load Wallet"
                badgeCount={verifyGrid.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by ref no, wallet, bank...',
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
                        emptyMessage: 'No wallet transfers pending',
                        itemKey: 'ID',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Load Wallet Verification',
                        icon: Wallet,
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: detailLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Transfer Details',
                        icon: Wallet,
                        selectedTitle: 'Transfer Verification',
                        emptyTitle: 'No Transfer Selected',
                        emptyMessage: 'Select a wallet transfer from the list to view details and verify.',
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

export default VerifyLoadWallet;
