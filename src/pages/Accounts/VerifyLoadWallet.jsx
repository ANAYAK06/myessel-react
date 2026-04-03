import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Wallet, Calendar, IndianRupee, ArrowRight, Clock,
    Building2, RefreshCw,
} from 'lucide-react';

import InboxHeader     from '../../components/Inbox/InboxHeader';
import StatsCards      from '../../components/Inbox/StatsCards';
import ActionButtons   from '../../components/Inbox/ActionButtons';
import RemarksHistory  from '../../components/Inbox/RemarksHistory';
import LeftPanel       from '../../components/Inbox/LeftPanel';
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

    // ── Stats ─────────────────────────────────────────────────────────────────
    const statsCards = [
        {
            icon: Wallet,
            value: verifyGrid.length,
            label: 'Total Pending',
            color: 'indigo',
        },
        {
            icon: IndianRupee,
            value: `₹${formatAmount(verifyGrid.reduce((s, v) => s + parseFloat(v.TransferAmount || 0), 0))}`,
            label: 'Total Amount',
            color: 'purple',
        },
        {
            icon: Building2,
            value: [...new Set(verifyGrid.map(v => v.Transferfrom).filter(Boolean))].length,
            label: 'Transfer Types',
            color: 'blue',
        },
        {
            icon: ArrowRight,
            value: [...new Set(verifyGrid.map(v => v.ToWalletName).filter(Boolean))].length,
            label: 'Destination Wallets',
            color: 'violet',
        },
    ];

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

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                                commentRows: 4,
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700"
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
                    className={`grid transition-all duration-300 ${
                        isLeftPanelCollapsed && !isLeftPanelHovered
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
                            onItemSelect={setSelectedItem}
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
                                emptyMessage: 'No wallet transfers pending',
                                itemKey: 'ID',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                            }}
                        />
                    </div>

                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                        <Wallet className="w-4 h-4 text-white" />
                                    </div>
                                    <span>{selectedItem ? 'Transfer Verification' : 'Transfer Details'}</span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Wallet className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Transfer Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a wallet transfer from the list to view details and verify.
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

export default VerifyLoadWallet;
