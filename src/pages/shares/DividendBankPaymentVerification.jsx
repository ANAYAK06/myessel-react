import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    CreditCard, Clock, CheckCircle2, DollarSign,
    Calendar, TrendingUp, Hash, User,
    Building2, CalendarDays, Wallet, Receipt,
    Banknote, Activity, Layers, AlertTriangle
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyDividendBankPayment,
    fetchDividendBankPaymentByRefno,
    approveDividendBankPayment,
    setSelectedTransactionRefno,
    setSelectedRoleId,
    resetDividendBankPaymentDetails,
    clearApprovalResult,
    selectVerifyDividendBankPaymentInboxArray,
    selectDividendBankPaymentDetails,
    selectVerifyDividendBankPaymentLoading,
    selectDividendBankPaymentDetailsLoading,
    selectApproveDividendBankPaymentLoading,
    selectVerifyDividendBankPaymentError,
    selectDividendBankPaymentDetailsError,
    selectApprovalOperationStatus
} from '../../slices/capitalSlice/dividendBankPaymentSlice';

import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton
} from '../../slices/CommonSlice/getStatusSlice';

import {
    convertAmountToWords,
    formatIndianCurrency,
} from '../../utilities/amountToTextHelper';

const DividendBankPaymentVerification = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const paymentInbox = useSelector(selectVerifyDividendBankPaymentInboxArray);
    const inboxLoading = useSelector(selectVerifyDividendBankPaymentLoading);
    const inboxError = useSelector(selectVerifyDividendBankPaymentError);

    const paymentDetails = useSelector(selectDividendBankPaymentDetails);
    const detailsLoading = useSelector(selectDividendBankPaymentDetailsLoading);
    const detailsError = useSelector(selectDividendBankPaymentDetailsError);

    const { isLoading: approvalLoading, result: approvalResult } = useSelector(selectApprovalOperationStatus);

    const remarks = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local State
    const [selectedItem, setSelectedItem] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPaymentMode, setFilterPaymentMode] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Extract unique values for filters
    const statuses = [...new Set(paymentInbox.map(item => item.Status))].filter(Boolean);
    const paymentModes = [...new Set(paymentInbox.map(item => item.PaymentMode))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Dividend Bank Payment Verifier';
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Format number
    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    // Initialize - Fetch payment inbox
    useEffect(() => {
        if (roleId) {
            console.log('💰 Initializing Dividend Bank Payment Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerifyDividendBankPayment(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetDividendBankPaymentDetails());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch payment details when item is selected
    useEffect(() => {
        if (selectedItem?.TransactionRefNo) {
            console.log('🔍 Fetching Payment Details for RefNo:', selectedItem.TransactionRefNo);

            dispatch(setSelectedTransactionRefno(selectedItem.TransactionRefNo));
            dispatch(fetchDividendBankPaymentByRefno(selectedItem.TransactionRefNo)); 

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when payment details are loaded
    useEffect(() => {
        if (selectedItem && roleId && paymentDetails?.paymentMaster) {
            const moid = paymentDetails.paymentMaster?.MOID;

            console.log('📊 Fetching Status List for MOID:', moid);
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: 0
            }));
        }
    }, [selectedItem, roleId, paymentDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && paymentDetails?.paymentMaster) {
            const moid = paymentDetails.paymentMaster?.MOID;

            console.log('💬 Fetching Remarks for MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: paymentDetails.paymentMaster.TransactionRefNo?.toString() || selectedItem.TransactionRefNo?.toString() || '',
                moid: moid
            }));
        }
    }, [selectedItem, paymentDetails, dispatch]);

    useEffect(() => {
        if (selectedItem) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedItem]);

    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleRefresh = () => {
        if (roleId) {
            console.log('🔄 Refreshing Dividend Bank Payment list');
            dispatch(fetchVerifyDividendBankPayment(roleId));

            if (selectedItem?.TransactionRefNo) {
                dispatch(fetchDividendBankPaymentByRefno(selectedItem.TransactionRefNo));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected Payment Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();

        const payload = {
            transactionRefno: selectedItem?.TransactionRefNo || paymentDetails?.paymentMaster?.TransactionRefNo,
            roleid: roleId,
            action: actionValue,
            note: verificationComment.trim(),
            createdby: currentUser
        };

        console.log('📤 Dividend Bank Payment Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No dividend bank payment selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the payment details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value || action.text || action.type;

        if (!actionValue || actionValue.trim() === '') {
            const typeToValueMap = {
                'approve': 'Approve',
                'verify': 'Verify',
                'reject': 'Reject',
                'return': 'Return'
            };
            actionValue = typeToValueMap[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const payload = buildApprovalPayload(actionValue);

            const result = await dispatch(approveDividendBankPayment(payload)).unwrap();

            if (result && typeof result === 'string') {
                if (result.includes('$')) {
                    const [status, additionalInfo] = result.split('$');
                    toast.success(`${action.text || actionValue} completed successfully!`);
                    if (additionalInfo) {
                        setTimeout(() => {
                            toast.info(additionalInfo, { autoClose: 6000 });
                        }, 500);
                    }
                } else {
                    toast.success(result || `${action.text || actionValue} completed successfully!`);
                }
            } else {
                toast.success(`${action.text || actionValue} completed successfully!`);
            }

            setTimeout(() => {
                dispatch(fetchVerifyDividendBankPayment({ roleId }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetDividendBankPaymentDetails());
                dispatch(resetApprovalData());
                dispatch(clearApprovalResult());
            }, 1000);

        } catch (error) {
            console.error('❌ Approval Error:', error);

            let errorMessage = `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;

            if (error && typeof error === 'string') {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    const filteredItems = paymentInbox.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.TransactionRefNo?.toString().includes(searchQuery) ||
            item.LotName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.BankName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Status?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;
        const matchesPaymentMode = filterPaymentMode === 'All' || item.PaymentMode === filterPaymentMode;

        return matchesSearch && matchesStatus && matchesPaymentMode;
    });

    const statsCards = [
        {
            icon: CreditCard,
            value: paymentInbox.length,
            label: 'Total Payments',
            color: 'blue'
        },
        {
            icon: Clock,
            value: paymentInbox.length,
            label: 'Pending Verification',
            color: 'orange'
        },
        {
            icon: DollarSign,
            value: paymentDetails?.paymentMaster?.TotalAmount ? `₹${formatCurrency(paymentDetails.paymentMaster.TotalAmount)}` : '-',
            label: 'Payment Amount',
            color: 'green'
        },
        {
            icon: Banknote,
            value: paymentDetails?.paymentMaster?.PaymentMode || '-',
            label: 'Payment Mode',
            color: 'purple'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.LotName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Ref: {item.TransactionRefNo}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>₹{formatCurrency(item.TotalAmount || 0)}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            {item.PaymentMode}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{item.BankName}</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span className="truncate">{item.PaymentDate}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    const renderPaymentMasterGrid = () => {
        if (!paymentDetails?.paymentMaster) return null;

        const master = paymentDetails.paymentMaster;

        const masterItems = [
            { label: 'Transaction Reference', value: master.TransactionRefNo || '-', icon: Hash },
            { label: 'Financial Year', value: master.FinancialYear || '-', icon: Calendar },
            { label: 'Lot Name', value: master.LotName || '-', icon: Layers },
            { label: 'Distribution ID', value: master.DistributionId || '-', icon: Hash },
            { label: 'Bank Name', value: master.BankName || '-', icon: Building2 },
            { label: 'Account Number', value: master.AccountNo || '-', icon: Hash },
            { label: 'Account Holder', value: master.AccountHolderName || '-', icon: User },
            { label: 'Current Bank Balance', value: `₹${formatCurrency(master.CurrentBankBalance || 0)}`, icon: Wallet },
            { label: 'Bank Location', value: master.BankLocation || '-', icon: Building2 },
            { label: 'Payment Mode', value: master.PaymentMode || '-', icon: Banknote },
            { label: 'Cheque Number', value: master.ChequeNo || 'N/A', icon: Receipt },
            { label: 'Cheque Date', value: master.ChequeDate || 'N/A', icon: Calendar },
            { label: 'Total Payment Amount', value: `₹${formatCurrency(master.TotalAmount || 0)}`, icon: DollarSign },
            { label: 'Payment Date', value: master.PaymentDate || '-', icon: CalendarDays },
            { label: 'Status', value: master.Status || '-', icon: CheckCircle2 },
            { label: 'Created By', value: master.CreatedBy || '-', icon: User },
            { label: 'Created Date', value: master.CreatedDate || '-', icon: CalendarDays }
        ];

        if (master.LotDescription && master.LotDescription.trim() !== '') {
            masterItems.splice(3, 0, {
                label: 'Lot Description',
                value: master.LotDescription,
                icon: Receipt
            });
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Payment Master Details
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {masterItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center space-x-2 mb-2">
                                    <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {item.label}
                                    </p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                                    {item.value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderAmountInWords = () => {
        if (!paymentDetails?.paymentMaster?.TotalAmount) return null;

        const amount = paymentDetails.paymentMaster.TotalAmount;

        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Payment Amount
                    </h3>
                </div>

                {/* Amount in Numbers */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Payable Amount</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        ₹{formatIndianCurrency(amount)}
                    </p>
                </div>

                {/* Amount in Words */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount in Words</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white italic">
                        {convertAmountToWords(amount)}
                    </p>
                </div>
            </div>
        );
    };

    const renderBankTransactionInfo = () => {
        if (!paymentDetails?.bankTransactionInfo) return null;

        const bankTxn = paymentDetails.bankTransactionInfo;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Bank Transaction Details
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Transaction ID
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {bankTxn.BankTransactionId || '-'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Remarks
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {bankTxn.Remarks || '-'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <Banknote className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Mode of Payment
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {bankTxn.ModeOfPay || '-'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Reference Number
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {bankTxn.Number || '-'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Debit Amount
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {bankTxn.Debit ? `₹${formatCurrency(bankTxn.Debit)}` : '-'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Transaction Date
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {bankTxn.TransactionDate || '-'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Transaction Status
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {bankTxn.TransactionStatus || '-'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Created By
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {bankTxn.CreatedBy || '-'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center space-x-2 mb-2">
                            <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Created Date
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {bankTxn.CreatedDate || '-'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = paymentDetails?.paymentMaster || selectedItem;
        const hasDetailedData = !!paymentDetails?.paymentMaster;

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading payment details...
                            </span>
                        </div>
                    </div>
                )}

                {/* CUSTOM HEADER */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <CreditCard className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <Banknote className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.LotName || 'Payment Processing'}
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                                    Ref: {displayData.TransactionRefNo} • {displayData.BankName}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                        {displayData.PaymentMode}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                        ₹{formatCurrency(displayData.TotalAmount || 0)}
                                    </span>
                                    {displayData.ChequeNo && (
                                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                            Cheque: {displayData.ChequeNo}
                                        </span>
                                    )}
                                    {hasDetailedData && displayData.Status && (
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                                            Status: {displayData.Status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && displayData.PaymentDate && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment Date</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {displayData.PaymentDate}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
                        {hasDetailedData && displayData.AccountNo && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                                    {displayData.AccountNo}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && displayData.AccountHolderName && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Holder</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {displayData.AccountHolderName}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && displayData.CurrentBankBalance !== undefined && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bank Balance</p>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                    ₹{formatCurrency(displayData.CurrentBankBalance)}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && displayData.ChequeDate && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cheque Date</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {displayData.ChequeDate}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Master Details Grid */}
                {hasDetailedData && renderPaymentMasterGrid()}

                {/* Amount in Words */}
                {hasDetailedData && renderAmountInWords()}

                {/* Bank Transaction Info */}
                {hasDetailedData && renderBankTransactionInfo()}

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
                        checkboxLabel: '✓ I have verified all bank payment details',
                        checkboxDescription: 'Including distribution details, bank account information, payment mode, cheque details, and transaction accuracy',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify payment details, bank account, payment mode, cheque information, and any discrepancies...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        commentGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-blue-200 dark:border-blue-700'
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                        </div>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                        <p className="text-red-600 dark:text-red-400 text-center">
                            ⚠️ Error loading actions: {statusError}
                        </p>
                    </div>
                ) : !hasActions || !enabledActions || enabledActions.length === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                        <p className="text-yellow-700 dark:text-yellow-400 text-center">
                            ℹ️ No actions available for this payment
                        </p>
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
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <InboxHeader
                title={`${InboxTitle || 'Dividend Bank Payment Verification'} (${paymentInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={paymentInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={CreditCard}
                badgeText="Payment Verification"
                badgeCount={paymentInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by ref no, lot name, bank name...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterPaymentMode,
                        onChange: (e) => setFilterPaymentMode(e.target.value),
                        defaultLabel: 'All Payment Modes',
                        options: paymentModes
                    },
                    {
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        defaultLabel: 'All Status',
                        options: statuses
                    }
                ]}
                className="bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600"
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
                    className={`grid transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                        ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                        : 'grid-cols-1 lg:grid-cols-3 gap-6'
                        }`}
                    onMouseLeave={() => {
                        if (selectedItem && isLeftPanelCollapsed) {
                            setIsLeftPanelHovered(false);
                        }
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
                            loading={inboxLoading}
                            error={inboxError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No bank payments found!',
                                itemKey: 'TransactionRefNo',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
                            }}
                        />
                    </div>

                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                            onMouseEnter={() => {
                                if (selectedItem && !isLeftPanelHovered) {
                                    setIsLeftPanelHovered(false);
                                }
                            }}
                        >
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                        <CreditCard className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'Payment Verification' : 'Payment Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Payment Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a bank payment from the list to view details and verify.
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

export default DividendBankPaymentVerification;