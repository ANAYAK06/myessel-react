import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Banknote, Calendar, Hash, User, Clock, RefreshCw,
    IndianRupee, Building, AlertCircle, FileBarChart,
    ArrowUpCircle, Layers, MapPin, Receipt,
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerificationVendorPayments,
    fetchVerificationVendorPayByRefno,
    approveVendorPayment,
    selectVerificationVendorPaymentsArray,
    selectVerificationVendorPaymentData,
    selectSelectedRoleId,
    selectVerificationVendorPaymentsLoading,
    selectVerificationVendorPaymentDataLoading,
    selectApproveVendorPaymentLoading,
    selectVerificationVendorPaymentsError,
    setSelectedRoleId,
    setSelectedRefNo,
    setSelectedTransType,
    setSelectedVendorCode,
    resetVerificationVendorPaymentData,
} from '../../slices/VendorPaymentSlice/vendorPaymentSlice';

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

import {
    formatIndianCurrency,
    getAmountDisplay,
} from '../../utilities/amountToTextHelper';

// ── helpers ──────────────────────────────────────────────────────────────────

const getPriority = (payment) => {
    if (!payment) return 'Low';
    const amount = parseFloat(payment.TransactionAmount || 0);
    const daysUntilDue = Math.ceil(
        (new Date(payment.TransactionDate) - new Date()) / 86400000
    );
    if (amount > 100000 || daysUntilDue <= 1) return 'High';
    if (amount > 50000  || daysUntilDue <= 3) return 'Medium';
    return 'Low';
};

const priorityColor = (p) => ({
    High:   'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
    Low:    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
}[p] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200');

const payTypeColor = (pt) => ({
    'Vendor Invoice':   'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Vendor Advance':   'bg-orange-100 text-orange-800 border-orange-200',
    'Vendor Retention': 'bg-teal-100 text-teal-800 border-teal-200',
    'Vendor Hold':      'bg-rose-100 text-rose-800 border-rose-200',
}[pt] || 'bg-gray-100 text-gray-800 border-gray-200');

// ── component ─────────────────────────────────────────────────────────────────

const VerifyVendorPaymentByCash = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const payments        = useSelector(selectVerificationVendorPaymentsArray);
    const detail          = useSelector(selectVerificationVendorPaymentData);
    const listLoading     = useSelector(selectVerificationVendorPaymentsLoading);
    const detailLoading   = useSelector(selectVerificationVendorPaymentDataLoading);
    const approvalLoading = useSelector(selectApproveVendorPaymentLoading);
    const listError       = useSelector(selectVerificationVendorPaymentsError);
    const selectedRoleId  = useSelector(selectSelectedRoleId);

    const remarks         = useSelector(selectRemarks);
    const remarksLoading  = useSelector(selectRemarksLoading);

    const statusLoading   = useSelector(selectStatusListLoading);
    const statusError     = useSelector(selectStatusListError);
    const enabledActions  = useSelector(selectEnabledActions);
    const hasActions      = useSelector(selectHasActions);

    const { userData } = useSelector(s => s.auth);
    const roleId = userData?.roleId || userData?.RID || 0;

    const [selectedItem, setSelectedItem]               = useState(null);
    const [isVerified, setIsVerified]                   = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showRemarksHistory, setShowRemarksHistory]   = useState(false);
    const [searchQuery, setSearchQuery]                 = useState('');
    const [filterVendor, setFilterVendor]               = useState('All');
    const [filterPayType, setFilterPayType]             = useState('All');
    const [invoiceOpen, setInvoiceOpen]                 = useState(false);
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered]   = useState(false);

    const { InboxTitle, ModuleDisplayName, RoleId } = notificationData || {};

    const currentUser    = userData?.userName || 'system';
    const currentRoleId  = RoleId || roleId || selectedRoleId;

    // ── Init ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (currentRoleId && currentRoleId !== selectedRoleId) {
            dispatch(setSelectedRoleId(currentRoleId));
            dispatch(fetchVerificationVendorPayments(currentRoleId));
        }
    }, [currentRoleId, selectedRoleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetVerificationVendorPaymentData());
            dispatch(resetApprovalData());
        };
    }, [dispatch]);

    // ── On item select → fetch detail ────────────────────────────────────────
    useEffect(() => {
        if (selectedItem) {
            dispatch(resetVerificationVendorPaymentData());
            dispatch(resetApprovalData());
            dispatch(setSelectedRefNo(selectedItem.TransactionRefNo));
            dispatch(setSelectedTransType(selectedItem.TransactionType));
            dispatch(setSelectedVendorCode(selectedItem.VendorCode));
            dispatch(fetchVerificationVendorPayByRefno({
                refno:      selectedItem.TransactionRefNo,
                transtype:  selectedItem.TransactionType,
                vendorcode: selectedItem.VendorCode,
            }));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
            setInvoiceOpen(false);
        }
    }, [selectedItem, dispatch]);

    // ── On detail load → fetch status list + remarks ─────────────────────────
    useEffect(() => {
        if (detail?.MOID && currentRoleId) {
            dispatch(fetchStatusList({
                MOID: detail.MOID,
                ROID: currentRoleId,
                ChkAmt: parseFloat(detail.TransactionAmount) || 0,
            }));
            dispatch(setSelectedMOID(detail.MOID));
            dispatch(fetchRemarks({
                trno: detail.TransactionRefNo || selectedItem?.TransactionRefNo || '',
                moid: detail.MOID,
            }));
        }
    }, [detail?.MOID, currentRoleId, dispatch]);

    // ── Collapse left panel when item selected ───────────────────────────────
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleItemSelect = (item) => setSelectedItem(item);

    const handleRefresh = () => {
        if (currentRoleId) dispatch(fetchVerificationVendorPayments(currentRoleId));
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No payment selected'); return; }
        if (!verificationComment.trim()) {
            toast.error('Verification comment is mandatory before proceeding.');
            return;
        }
        if (!isVerified) {
            toast.error('Please verify the payment details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value || '';
        if (!actionValue.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || action.type;
        }

        const existingRemarks = detail?.Remarks || '';
        const formatted = `${userData?.roleName || 'Verifier'} : ${currentUser} : ${verificationComment.trim()}`;
        const updatedRemarks = existingRemarks.trim()
            ? `${existingRemarks.trim()}||${formatted}`
            : formatted;

        const payload = {
            TransactionRefNo: selectedItem.TransactionRefNo,
            ApprovalNote:     verificationComment.trim(),
            Remarks:          updatedRemarks,
            Action:           actionValue,
            PaymentType:      detail?.PaymentTypeName || selectedItem?.PaymentTypeName || 'Vendor Invoice',
            Roleid:           currentRoleId,
            VendorCode:       selectedItem.VendorCode,
            TransactionType:  selectedItem.TransactionType,
            Amount:           detail?.TransactionAmount || selectedItem?.TransactionAmount,
            Createdby:        currentUser,
            PaymentDate:      detail?.TransactionDate || selectedItem?.TransactionDate,
            DueDate:          detail?.TransactionDate || selectedItem?.TransactionDate,
            ApprovalStatus:   actionValue,
            ...(detail?.MOID && { MOID: detail.MOID }),
        };

        try {
            const result = await dispatch(approveVendorPayment(payload)).unwrap();
            toast.success(`${action.text || actionValue} completed successfully!`);
            if (typeof result === 'string' && result.includes('$')) {
                setTimeout(() => toast.info(result.split('$')[1], { autoClose: 6000 }), 500);
            }
            setTimeout(() => {
                dispatch(fetchVerificationVendorPayments(currentRoleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetVerificationVendorPaymentData());
                dispatch(resetApprovalData());
            }, 1000);
        } catch (err) {
            toast.error(
                typeof err === 'string' ? err : (err?.message || `Failed to ${action.text?.toLowerCase() || actionValue}`),
                { autoClose: 10000 }
            );
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredItems = payments.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchQ = !q || [p.VendorName, p.TransactionRefNo, p.VendorCode, p.PaymentTypeName]
            .some(v => v?.toLowerCase().includes(q));
        const matchV  = filterVendor  === 'All' || p.VendorName     === filterVendor;
        const matchPT = filterPayType === 'All' || p.PaymentTypeName === filterPayType;
        return matchQ && matchV && matchPT;
    });

    const vendorOptions  = [...new Set(payments.map(p => p.VendorName).filter(Boolean))];
    const payTypeOptions = [...new Set(payments.map(p => p.PaymentTypeName).filter(Boolean))];
    const totalAmount    = payments.reduce((s, p) => s + (parseFloat(p.TransactionAmount) || 0), 0);

    // ── Stats cards ───────────────────────────────────────────────────────────
    const statsCards = [
        { icon: Receipt,      value: payments.length,   label: 'Total Payments', color: 'indigo' },
        { icon: AlertCircle,  value: payments.filter(p => getPriority(p) === 'High').length, label: 'High Priority', color: 'red' },
        { icon: Building,     value: vendorOptions.length, label: 'Vendors', color: 'purple' },
        { icon: IndianRupee,  value: `₹${formatIndianCurrency(totalAmount)}`, label: 'Total Amount', color: 'violet' },
    ];

    // ── Left panel item renderers ─────────────────────────────────────────────
    const renderItemCard = (item) => {
        const priority = getPriority(item);
        const amt = getAmountDisplay(item.TransactionAmount);
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-200 flex items-center justify-center flex-shrink-0">
                        <Banknote className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.VendorName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.PaymentTypeName}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full border flex-shrink-0 ${priorityColor(priority)}`}>{priority}</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" /><span className="truncate">{item.TransactionRefNo}</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs border ${payTypeColor(item.PaymentTypeName)}`}>
                            {item.PaymentTypeName?.replace('Vendor ', '')}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">₹{amt.formatted}</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{item.VendorCode}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                        <Calendar className="w-3 h-3" /><span>{item.TransactionDate}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail content ────────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;

        return (
            <div className="space-y-5">
                {(detailLoading || !detail) && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">Loading payment details...</span>
                        </div>
                    </div>
                )}

                {detail && (
                    <>
                        {/* ── Cash Payment Voucher ─────────────────────────── */}
                        <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-600 overflow-hidden shadow-md">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between text-white">
                                <div className="flex items-center space-x-2">
                                    <Banknote className="w-5 h-5" />
                                    <span className="font-bold text-sm tracking-wide uppercase">Cash Payment Voucher</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${payTypeColor(detail.PaymentTypeName)} border-white/30`}>
                                    {detail.PaymentTypeName?.replace('Vendor ', '') || 'Invoice'}
                                </span>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-gray-800 dark:to-gray-800 p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                                            <Hash className="w-3 h-3" /><span>Voucher / Ref No.</span>
                                        </p>
                                        <p className="font-mono font-semibold text-gray-800 dark:text-gray-200">{detail.TransactionRefNo || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center justify-end space-x-1">
                                            <Calendar className="w-3 h-3" /><span>Payment Date</span>
                                        </p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{detail.TransactionDate || '—'}</p>
                                    </div>
                                </div>

                                <div className="border-t border-indigo-200 dark:border-indigo-700" />

                                <div>
                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                                        <User className="w-3 h-3" /><span>Paid To</span>
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">{detail.VendorName || '—'}</p>
                                        <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-700">
                                            {detail.VendorCode || '—'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                                            <MapPin className="w-3 h-3" /><span>Cost Center (Self)</span>
                                        </p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{detail.CCCode || detail.PaidToCC || '—'}</p>
                                    </div>
                                    {(detail.OtherCCCode || detail.PaidAganstCC) && (
                                        <div>
                                            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                                                <Layers className="w-3 h-3" /><span>Other Cost Center</span>
                                            </p>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{detail.OtherCCCode || detail.PaidAganstCC}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-indigo-200 uppercase tracking-wider font-bold flex items-center space-x-1">
                                            <IndianRupee className="w-3 h-3" /><span>Amount</span>
                                        </p>
                                        <p className="text-2xl font-black mt-0.5">
                                            ₹{detail.TransactionAmount ? formatIndianCurrency(detail.TransactionAmount) : '0.00'}
                                        </p>
                                        {detail.AmountInWords && (
                                            <p className="text-xs text-indigo-200 italic mt-0.5">{detail.AmountInWords}</p>
                                        )}
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                                        <Banknote className="w-7 h-7 text-white/80" />
                                    </div>
                                </div>

                                {(detail.VendorType || detail.PoNo) && (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {detail.VendorType && (
                                            <div>
                                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Vendor Type</p>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{detail.VendorType}</p>
                                            </div>
                                        )}
                                        {detail.PoNo && (
                                            <div>
                                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">PO Reference</p>
                                                <p className="font-mono font-semibold text-gray-800 dark:text-gray-200">{detail.PoNo}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {detail.Remarks && (() => {
                                    const plain = detail.Remarks.split('||')[0];
                                    return (
                                        <div>
                                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Remarks</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/40 rounded-lg p-2.5 border border-indigo-100 dark:border-indigo-800">
                                                {plain}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="bg-indigo-100/60 dark:bg-indigo-900/20 px-5 py-2 flex justify-between text-xs text-indigo-600 dark:text-indigo-400 border-t border-indigo-200 dark:border-indigo-700 font-mono">
                                <span>{detail.TransactionRefNo || '—'}</span>
                                <span>Generated: {new Date().toLocaleDateString('en-IN')}</span>
                            </div>
                        </div>

                        {/* ── Invoice / Advance breakdown ─────────────────── */}
                        {detail.lstPayInvoiceData?.length > 0 && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <button
                                    onClick={() => setInvoiceOpen(o => !o)}
                                    className="w-full p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700 hover:from-indigo-100 hover:to-purple-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-indigo-500 rounded-lg">
                                                <FileBarChart className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {detail.PaymentTypeName === 'Vendor Advance' ? 'Advance Details' : 'Invoice Breakdown'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {detail.lstPayInvoiceData.length} item(s) •
                                                    ₹{formatIndianCurrency(detail.lstPayInvoiceData.reduce((s, i) => s + parseFloat(i.Amount || 0), 0))}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`transform transition-transform ${invoiceOpen ? 'rotate-180' : ''}`}>
                                            <ArrowUpCircle className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </button>

                                {invoiceOpen && (
                                    <div className="p-4 space-y-3">
                                        {detail.lstPayInvoiceData.map((item, idx) => (
                                            <div key={idx} className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-sm">
                                                {detail.PaymentTypeName === 'Vendor Advance' ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div><p className="text-xs text-indigo-500 font-bold mb-0.5">Amount</p><p className="font-bold text-indigo-700 dark:text-indigo-300">₹{formatIndianCurrency(item.Amount || 0)}</p></div>
                                                        <div><p className="text-xs text-indigo-500 font-bold mb-0.5">CC Code</p><p className="font-semibold text-gray-800 dark:text-gray-200">{item.CCCode || '—'}</p></div>
                                                        <div><p className="text-xs text-indigo-500 font-bold mb-0.5">DCA Code</p><p className="font-medium text-gray-800 dark:text-gray-200">{item.DCACode || '—'}</p></div>
                                                        <div><p className="text-xs text-indigo-500 font-bold mb-0.5">Type</p>
                                                            <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-600">
                                                                {item.Type || '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                                                            <div><p className="text-xs text-indigo-500 font-bold mb-0.5">Invoice No.</p><p className="font-semibold text-gray-800 dark:text-gray-200">{item.InvoiceNo || '—'}</p></div>
                                                            <div><p className="text-xs text-indigo-500 font-bold mb-0.5">Amount</p><p className="font-semibold text-gray-800 dark:text-gray-200">₹{formatIndianCurrency(item.Amount || 0)}</p></div>
                                                            <div><p className="text-xs text-indigo-500 font-bold mb-0.5">CC Code</p><p className="font-medium text-gray-800 dark:text-gray-200">{item.CCCode || '—'}</p></div>
                                                            <div><p className="text-xs text-indigo-500 font-bold mb-0.5">IT Code</p><p className="font-medium text-gray-800 dark:text-gray-200">{item.ITCode || '—'}</p></div>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-3 text-xs">
                                                            <div><p className="text-indigo-500 font-bold mb-0.5">DCA Code</p><p className="text-gray-700 dark:text-gray-300">{item.DCACode || '—'}</p></div>
                                                            <div><p className="text-indigo-500 font-bold mb-0.5">Sub DCA</p><p className="text-gray-700 dark:text-gray-300">{item.SubDcaCode || '—'}</p></div>
                                                            <div><p className="text-indigo-500 font-bold mb-0.5">Type</p>
                                                                <span className={`px-2 py-0.5 rounded-full border ${(item.Type || '').toLowerCase() === 'gst' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                                                                    {item.Type || '—'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-600 flex justify-between items-center">
                                            <span className="font-semibold text-indigo-800 dark:text-indigo-200">Total Amount</span>
                                            <span className="font-bold text-xl text-indigo-900 dark:text-indigo-100">
                                                ₹{formatIndianCurrency(detail.lstPayInvoiceData.reduce((s, i) => s + parseFloat(i.Amount || 0), 0))}
                                            </span>
                                        </div>
                                    </div>
                                )}
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
                                checkboxLabel: '✓ I have verified all cash payment details',
                                checkboxDescription: 'Including vendor, amount, cost center allocation, and invoice details',
                                commentLabel: 'Verification Comments',
                                commentPlaceholder: 'Please verify the vendor details, cost center allocation, invoice amounts, and any discrepancies...',
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
                                <p className="text-yellow-700 dark:text-yellow-400 text-center">ℹ️ No actions available for this payment</p>
                            </div>
                        ) : (
                            <ActionButtons
                                actions={enabledActions}
                                onActionClick={handleActionClick}
                                loading={approvalLoading}
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
                title={`${InboxTitle || 'Vendor Cash Payment Verification'} (${payments.length})`}
                subtitle={ModuleDisplayName}
                itemCount={payments.length}
                onBackClick={() => onNavigate?.('dashboard', { name: 'Dashboard', type: 'dashboard' })}
                HeaderIcon={Banknote}
                badgeText="Cash Verification"
                badgeCount={payments.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search vendor, ref no, code, type...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                filters={[
                    {
                        value: filterVendor,
                        onChange: (e) => setFilterVendor(e.target.value),
                        defaultLabel: 'All Vendors',
                        options: vendorOptions,
                    },
                    {
                        value: filterPayType,
                        onChange: (e) => setFilterPayType(e.target.value),
                        defaultLabel: 'All Pay Types',
                        options: payTypeOptions,
                    },
                ]}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600"
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
                                emptyMessage: 'No vendor payments pending',
                                itemKey: 'TransactionRefNo',
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
                                        <Banknote className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem
                                            ? `${detail?.PaymentTypeName || 'Payment'} — Cash Verification`
                                            : 'Payment Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Payment Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a vendor cash payment to review details and verify.
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

export default VerifyVendorPaymentByCash;
