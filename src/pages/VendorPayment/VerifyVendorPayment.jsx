// VerifyVendorPayment.jsx - Fixed version with proper null checking
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeft, IndianRupee, Building, Calendar, FileText,
    CheckCircle, XCircle, Clock, AlertCircle, Search, RefreshCw,
    CreditCard, User, MapPin, Hash, Target, TrendingUp,
    Truck, Package, Receipt, BadgeCheck, X, Eye, Banknote,
    Shield, ArrowRightLeft, Landmark, CheckSquare, FileCheck,
    Timer, UserCheck, CircleIndianRupee, FileBarChart, Gift,
    FileX, ArrowUpCircle,
    ReceiptIndianRupee,
} from 'lucide-react';

// ✅ VENDOR PAYMENT SLICE IMPORTS
import {
    // Async Thunks
    fetchVerificationVendorPayments,
    fetchVerificationVendorPayByRefno,
    approveVendorPayment,

    // Data Selectors
    selectVerificationVendorPayments,
    selectVerificationVendorPaymentsArray,
    selectVerificationVendorPaymentData,
    selectSelectedRoleId,

    // Loading Selectors
    selectVerificationVendorPaymentsLoading,
    selectVerificationVendorPaymentDataLoading,
    selectApproveVendorPaymentLoading,

    // Error Selectors
    selectVerificationVendorPaymentsError,

    // Actions
    setSelectedRoleId,
    setSelectedRefNo,
    setSelectedTransType,
    setSelectedVendorCode,
    resetVerificationVendorPaymentData
} from '../../slices/VendorPaymentSlice/vendorPaymentSlice';

// ✅ APPROVAL SLICE IMPORTS (Generic/Reusable)
import {
    // Async Thunks
    fetchStatusList,

    // Data Selectors
    selectStatusList,
    selectAvailableActions,
    selectEnabledActions,
    selectHasActions,

    // Loading Selectors  
    selectStatusListLoading,

    // Error Selectors
    selectStatusListError,

    // Actions
    resetApprovalData,
    clearError as clearApprovalError
} from '../../slices/CommonSlice/getStatusSlice';

// ✅ IMPORT AMOUNT HELPER
import {
    convertAmountToWords,
    formatIndianCurrency,
    getAmountDisplay,
    isValidAmount
} from '../../utilities/amountToTextHelper';

const VerifyVendorPayment = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ✅ VENDOR PAYMENT STATE
    const verificationPayments = useSelector(selectVerificationVendorPaymentsArray);
    const selectedPaymentData = useSelector(selectVerificationVendorPaymentData);
    const paymentsLoading = useSelector(selectVerificationVendorPaymentsLoading);
    const paymentDataLoading = useSelector(selectVerificationVendorPaymentDataLoading);
    const approvalLoading = useSelector(selectApproveVendorPaymentLoading);
    const paymentsError = useSelector(selectVerificationVendorPaymentsError);
    const selectedRoleId = useSelector(selectSelectedRoleId);

    // ✅ APPROVAL STATE (Generic/Reusable)
    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const statusList = useSelector(selectStatusList);
    const availableActions = useSelector(selectAvailableActions);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);

    // ✅ LOCAL STATE
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [verificationComment, setVerificationComment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVendor, setFilterVendor] = useState('All');
    const [filterTransType, setFilterTransType] = useState('All');

    const [invoiceExpanded, setInvoiceExpanded] = useState(false);
    
    // ✅ FIX: Add null check for selectedPaymentData
    const isAdvancePayment = selectedPaymentData?.PaymentTypeName === 'Vendor Advance';

    // ✅ EXTRACT NOTIFICATION DATA
    const {
        InboxTitle,
        ModuleDisplayName,
        RoleId
    } = notificationData || {};

    // ✅ INITIALIZE WITH ROLE ID FROM NOTIFICATION
    useEffect(() => {
        if (RoleId && RoleId !== selectedRoleId) {
            dispatch(setSelectedRoleId(RoleId));
            dispatch(fetchVerificationVendorPayments(RoleId));
        }
    }, [RoleId, selectedRoleId, dispatch]);

    // ✅ FETCH STATUS LIST WHEN PAYMENT IS SELECTED
    useEffect(() => {
        if (selectedPaymentData?.MOID && RoleId) {
            const statusParams = {
                MOID: selectedPaymentData.MOID,
                ROID: RoleId,
                ChkAmt: selectedPaymentData.TransactionAmount || 0
            };
            dispatch(fetchStatusList(statusParams));
        }
    }, [selectedPaymentData?.MOID, RoleId, dispatch]);

    // ✅ HELPER FUNCTIONS
    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Payment Verifier';
    };

    const formatApprovalComment = (roleName, userName, comment) => {
        return `${roleName} : ${userName} : ${comment}`;
    };

    const updateRemarksHistory = (existingRemarks, newRoleName, newUserName, newComment) => {
        const formattedNewComment = formatApprovalComment(newRoleName, newUserName, newComment);

        if (!existingRemarks || existingRemarks.trim() === '') {
            return formattedNewComment;
        }

        return `${existingRemarks.trim()}||${formattedNewComment}`;
    };

    const getPriority = (payment) => {
        if (!payment) return 'Low';
        const amount = parseFloat(payment.TransactionAmount || 0);
        const dueDate = payment.TransactionDate ? new Date(payment.TransactionDate) : new Date();
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (amount > 100000 || daysUntilDue <= 1) return 'High';
        if (amount > 50000 || daysUntilDue <= 3) return 'Medium';
        return 'Low';
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getActionIcon = (actionType) => {
        const type = actionType.toLowerCase();
        const iconMap = {
            'approve': CheckCircle,
            'verify': CheckCircle,
            'accept': CheckCircle,
            'return': ArrowLeft,
            'send back': ArrowLeft,
            'reject': XCircle,
            'decline': XCircle,
            'forward': ArrowLeft,
            'escalate': ArrowLeft,
            'hold': Clock,
            'pending': Clock
        };
        return iconMap[type] || CheckCircle;
    };

    const getTransactionTypeColor = (transType) => {
        switch (transType?.toLowerCase()) {
            case 'advance': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'payment': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'bank': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'invoice': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // ✅ FIX: Add null checks for payment type functions
    const getPaymentTypeColor = (paymentType) => {
        if (!paymentType) return 'bg-gray-100 text-gray-800 border-gray-200';
        
        switch (paymentType) {
            case 'Vendor Invoice':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'Vendor Advance':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentTypeIcon = (paymentType) => {
        if (!paymentType) return FileText;
        
        switch (paymentType) {
            case 'Vendor Invoice':
                return ReceiptIndianRupee;
            case 'Vendor Advance':
                return ArrowUpCircle;
            default:
                return FileText;
        }
    };

    const parseApprovalComments = (remarks) => {
        if (!remarks) return [];

        return remarks.split('||').map(comment => {
            const parts = comment.trim().split(' : ');
            if (parts.length >= 3) {
                return {
                    role: parts[0].trim(),
                    name: parts[1].trim(),
                    comment: parts.slice(2).join(' : ').trim()
                };
            }
            return { role: '', name: '', comment: comment.trim() };
        }).filter(item => item.comment);
    };

    // ✅ EVENT HANDLERS
    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handlePaymentSelect = async (payment) => {
        setSelectedPayment(payment);
        dispatch(setSelectedRefNo(payment.TransactionRefNo));
        dispatch(setSelectedTransType(payment.TransactionType));
        dispatch(setSelectedVendorCode(payment.VendorCode));

        const params = {
            refno: payment.TransactionRefNo,
            transtype: payment.TransactionType,
            vendorcode: payment.VendorCode
        };
        dispatch(fetchVerificationVendorPayByRefno(params));
    };

    const buildPaymentApprovalPayload = (actionValue, selectedPayment, selectedPaymentData, verificationComment) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        // ✅ INSIDE: Create updatedRemarks
        const updatedRemarks = updateRemarksHistory(
            selectedPaymentData?.Remarks,
            currentRoleName,
            currentUser,
            verificationComment
        );
        return {
            TransactionRefNo: selectedPayment.TransactionRefNo,
            ApprovalNote: verificationComment,
            Remarks: updatedRemarks,
            Action: actionValue,
            PaymentType: selectedPaymentData?.PaymentTypeName || selectedPayment?.PaymentTypeName || "Vendor Invoice",
            Roleid: RoleId || selectedRoleId,
            VendorCode: selectedPayment.VendorCode,
            TransactionType: selectedPayment.TransactionType,
            Amount: selectedPaymentData?.TransactionAmount || selectedPayment?.TransactionAmount,
            Createdby: getCurrentUser(),
            PaymentDate: selectedPaymentData?.TransactionDate || selectedPayment?.TransactionDate,
            DueDate: selectedPaymentData?.TransactionDate || selectedPayment?.TransactionDate,
            ApprovalStatus: actionValue,

            // Additional fields
            ...(selectedPaymentData?.MOID && { MOID: selectedPaymentData.MOID }),
            ...(selectedPaymentData?.BankName && { BankName: selectedPaymentData.BankName }),
            ...(selectedPaymentData?.ModeofPay && { ModeofPay: selectedPaymentData.ModeofPay })
        };
    };
    
    const onActionClick = async (action) => {
        // Basic validations
        if (!selectedPayment) {
            toast.error('No payment selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        // Map action value
        let actionValue = action.value;
        if (!actionValue || actionValue.trim() === '') {
            const typeToValueMap = {
                'approve': 'Approve',
                'verify': 'Verify',
                'reject': 'Reject'
            };
            actionValue = typeToValueMap[action.type.toLowerCase()] || action.type;
        }

        try {
            const payload = buildPaymentApprovalPayload(
                actionValue,
                selectedPayment,
                selectedPaymentData,
                verificationComment
            );

            console.log(`🎯 Payment ${actionValue}:`, selectedPayment.TransactionRefNo);

            const result = await dispatch(approveVendorPayment(payload)).unwrap();

            // Handle success
            if (result && typeof result === 'string') {
                if (result.includes('$')) {
                    const [status, additionalInfo] = result.split('$');
                    toast.success(`✅ ${action.text} completed successfully!`);
                    if (additionalInfo) {
                        setTimeout(() => {
                            toast.info(additionalInfo, { autoClose: 6000 });
                        }, 500);
                    }
                } else {
                    toast.success(`✅ ${action.text} completed successfully!`);
                }
            } else {
                toast.success(`✅ ${action.text} completed successfully!`);
            }

            // Refresh after success
            setTimeout(() => {
                dispatch(fetchVerificationVendorPayments(RoleId || selectedRoleId));
                setSelectedPayment(null);
                setVerificationComment('');
                dispatch(resetVerificationVendorPaymentData());
                dispatch(resetApprovalData());
            }, 1000);

        } catch (error) {
            console.error(`❌ Payment ${action.type} Error:`, error);
            let errorMessage = `Failed to ${action.text.toLowerCase()}`;

            if (error && typeof error === 'string') {
                errorMessage = `❌ ${error}`;
            } else if (error?.message) {
                errorMessage = `❌ ${error.message}`;
            }

            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    // ✅ FILTER PAYMENTS BASED ON SEARCH AND FILTERS
    const filteredPayments = verificationPayments.filter(payment => {
        const matchesSearch = payment.VendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.TransactionRefNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.VendorCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.PaymentTypeName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesVendor = filterVendor === 'All' || payment.VendorName === filterVendor;
        const matchesTransType = filterTransType === 'All' || payment.TransactionType === filterTransType;

        return matchesSearch && matchesVendor && matchesTransType;
    });

    const vendors = [...new Set(verificationPayments.map(p => p.VendorName).filter(Boolean))];
    const transTypes = [...new Set(verificationPayments.map(p => p.TransactionType).filter(Boolean))];

    // ✅ ACTION BUTTONS RENDER FUNCTION
    const renderActionButtons = () => {
        if (statusLoading) {
            return (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading available actions...</p>
                </div>
            );
        }

        if (statusError) {
            return (
                <div className="text-center py-4">
                    <p className="text-red-500 text-sm">Error loading actions: {statusError}</p>
                    <button
                        onClick={() => {
                            if (selectedPaymentData?.MOID && RoleId) {
                                dispatch(fetchStatusList({
                                    MOID: selectedPaymentData.MOID,
                                    ROID: RoleId,
                                    ChkAmt: selectedPaymentData.TransactionAmount || 0
                                }));
                            }
                        }}
                        className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        if (!hasActions) {
            return (
                <div className="text-center py-6">
                    <div className="text-gray-500 mb-2">No actions available for this payment</div>
                </div>
            );
        }

        // Filter out return actions
        const filteredActions = enabledActions.filter(action =>
            !['return', 'send back'].includes(action.type.toLowerCase())
        );

        if (filteredActions.length === 0) {
            return (
                <div className="text-center py-6">
                    <div className="text-gray-500 mb-2">No applicable actions available</div>
                    <div className="text-xs text-gray-400">Return actions are hidden for this module</div>
                </div>
            );
        }

        const actionCount = filteredActions.length;
        const gridCols = actionCount === 1 ? 'grid-cols-1' :
            actionCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
                actionCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

        return (
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Available Actions ({filteredActions.length})
                    </p>
                </div>

                <div className={`grid ${gridCols} gap-4`}>
                    {filteredActions.map((action, index) => {
                        const IconComponent = getActionIcon(action.type);

                        return (
                            <button
                                key={`${action.type}-${index}`}
                                onClick={() => onActionClick(action)}
                                disabled={approvalLoading || verificationComment.trim() === ''}
                                className={`
                                flex items-center justify-center space-x-2 px-6 py-4 
                                ${action.className} 
                                text-white rounded-lg transition-all 
                                disabled:opacity-50 disabled:cursor-not-allowed 
                                font-medium shadow-lg hover:shadow-xl
                                min-h-[60px]
                            `}
                                title={verificationComment.trim() === '' ? 'Please add verification comments first' : `${action.text} (${action.type}: ${action.value})`}
                            >
                                <IconComponent className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">
                                    {approvalLoading ? 'Processing...' : action.text}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackToInbox}
                            className="p-2 text-purple-100 hover:text-white hover:bg-purple-500 rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-500 rounded-xl shadow-inner">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {InboxTitle || 'Vendor Payment Verification'}
                                </h1>
                                <p className="text-purple-100 mt-1">
                                    {ModuleDisplayName} • {verificationPayments.length} payments pending
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-4 py-2 bg-purple-500 text-purple-100 text-sm rounded-full border border-purple-400">
                            Payment Verification
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full shadow-md">
                            {verificationPayments.length} Pending
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-purple-200" />
                            <input
                                type="text"
                                placeholder="Search by vendor, reference, code, or payment type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-purple-500/50 text-white placeholder-purple-200 border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterVendor}
                            onChange={(e) => setFilterVendor(e.target.value)}
                            className="w-full px-3 py-2.5 bg-purple-500/50 text-white border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
                        >
                            <option value="All">All Vendors</option>
                            {vendors.map(vendor => (
                                <option key={vendor} value={vendor}>{vendor}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterTransType}
                            onChange={(e) => setFilterTransType(e.target.value)}
                            className="w-full px-3 py-2.5 bg-purple-500/50 text-white border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
                        >
                            <option value="All">All Types</option>
                            {transTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                                <ReceiptIndianRupee className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{verificationPayments.length}</p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">Total Payments</p>
                            </div>
                        </div>
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-3">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 border border-red-200 dark:border-red-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                    {verificationPayments.filter(p => getPriority(p) === 'High').length}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">High Priority</p>
                            </div>
                        </div>
                        <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2 mt-3">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(verificationPayments.filter(p => getPriority(p) === 'High').length / verificationPayments.length) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 border border-indigo-200 dark:border-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{vendors.length}</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">Vendors</p>
                            </div>
                        </div>
                        <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2 mt-3">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                    ₹{formatIndianCurrency(verificationPayments.reduce((sum, p) => sum + (parseFloat(p.TransactionAmount) || 0), 0))}
                                </p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">Total Amount</p>
                            </div>
                        </div>
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-3">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vendor Payments List */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                                        <Clock className="w-4 h-4 text-white" />
                                    </div>
                                    <span>Pending ({filteredPayments.length})</span>
                                </h2>
                                <button
                                    onClick={() => dispatch(fetchVerificationVendorPayments(RoleId || selectedRoleId))}
                                    className="p-2 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                                    title="Refresh"
                                    disabled={paymentsLoading}
                                >
                                    <RefreshCw className={`w-4 h-4 ${paymentsLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {paymentsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading...</p>
                                </div>
                            ) : paymentsError ? (
                                <div className="text-center py-8">
                                    <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                    <p className="text-red-500 mb-2">Error loading data</p>
                                    <button
                                        onClick={() => dispatch(fetchVerificationVendorPayments(RoleId || selectedRoleId))}
                                        className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : filteredPayments.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                    <p className="text-gray-500">No payments found!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredPayments.map((payment) => {
                                        const priority = getPriority(payment);
                                        const amountDisplay = getAmountDisplay(payment.TransactionAmount);
                                        return (
                                            <div
                                                key={payment.TransactionRefNo}
                                                className={`rounded-xl cursor-pointer transition-all hover:shadow-md border-2 ${selectedPayment?.TransactionRefNo === payment.TransactionRefNo
                                                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-lg'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 bg-white dark:bg-gray-800'
                                                    }`}
                                                onClick={() => handlePaymentSelect(payment)}
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-full border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                                                <IndianRupee className="w-5 h-5 text-purple-600" />
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                                {payment.VendorName}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 truncate">{payment.PaymentTypeName}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(priority)}`}>
                                                            {priority}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="flex items-center space-x-1">
                                                                <Hash className="w-3 h-3" />
                                                                <span className="truncate">{payment.TransactionRefNo}</span>
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getTransactionTypeColor(payment.TransactionType)}`}>
                                                                {payment.TransactionType}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-purple-600 dark:text-purple-400 font-medium">₹{amountDisplay.formatted}</span>
                                                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{payment.VendorCode}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-500 text-xs">
                                                                <Calendar className="w-3 h-3 inline mr-1" />
                                                                {payment.TransactionDate}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getPaymentTypeColor(payment.PaymentTypeName)}`}>
                                                                {payment.PaymentTypeName?.replace('Vendor ', '')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Details Panel - COMPLETE UPDATED SECTION */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors sticky top-6">
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                                    {/* ✅ FIX: Add proper null checking for icon rendering */}
                                    {selectedPaymentData && selectedPaymentData.PaymentTypeName ? 
                                        React.createElement(getPaymentTypeIcon(selectedPaymentData.PaymentTypeName), { className: "w-4 h-4 text-white" }) : 
                                        <Receipt className="w-4 h-4 text-white" />
                                    }
                                </div>
                                <span>
                                    {selectedPayment ? 
                                        `${selectedPaymentData?.PaymentTypeName || 'Payment'} Verification` : 
                                        'Select a Payment'
                                    }
                                </span>
                            </h2>
                        </div>

                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {selectedPayment ? (
                                <div className="space-y-6">
                                    {paymentDataLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading detailed information...</p>
                                        </div>
                                    ) : selectedPaymentData ? (
                                        <>
                                            {(() => {
                                                return (
                                                    <div className="space-y-6">
                                                        {/* Realistic Cheque Design - Compact & Authentic */}
                                                        <div className="bg-yellow-100 dark:bg-gray-50 border-2 border-purple-400 dark:border-purple-500 rounded-lg shadow-lg overflow-hidden relative max-w-4xl">

                                                            {/* ✅ FIX: Add null check for PaymentTypeName */}
                                                            {selectedPaymentData?.PaymentTypeName === 'Vendor Advance' && (
                                                                <div className="absolute top-2 right-2 z-10">
                                                                    <div className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-semibold">
                                                                        ADVANCE
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Bank Header - Compact */}
                                                            <div className="relative bg-white dark:bg-gray-50 p-3 border-b border-purple-300 dark:border-purple-400">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-6 h-6 bg-purple-100 dark:bg-purple-200 rounded flex items-center justify-center">
                                                                            <Landmark className="w-4 h-4 text-purple-600" />
                                                                        </div>
                                                                        <div>
                                                                            <h2 className="text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-200 p-1 rounded">
                                                                                {selectedPaymentData?.BankName || 'Bank Name'}
                                                                            </h2>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right text-xs">
                                                                        <p className="text-gray-500 dark:text-gray-600">IFSC: BANK001234</p>
                                                                        <p className="text-gray-500 dark:text-gray-600">Branch Code: 001</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Cheque Body - Authentic Layout */}
                                                            <div className="relative p-4" style={{
                                                                backgroundColor: '#fefefe',
                                                                backgroundImage: `
                                                                      linear-gradient(45deg, transparent 25%, rgba(139, 92, 246, 0.1) 25%, rgba(139, 92, 246, 0.1) 75%, transparent 75%),
                                                                       linear-gradient(-45deg, transparent 25%, rgba(139, 92, 246, 0.1) 25%, rgba(139, 92, 246, 0.1) 75%, transparent 75%)
                                                                                                  `,
                                                                backgroundSize: '20px 20px'
                                                            }}>

                                                                {/* Top Row - Cheque Number and Date */}
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div className="text-xs">
                                                                        <p className="text-gray-600 dark:text-gray-700 mb-1">Cheque No.</p>
                                                                        <p className="text-gray-800 dark:text-gray-600 font-mono text-sm">
                                                                            {selectedPaymentData?.TransactionRefNo || 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right text-xs">
                                                                        <p className="text-gray-600 dark:text-gray-700 mb-1">Date</p>
                                                                        <div className="border border-gray-400 dark:border-gray-500 px-2 py-1 min-w-[100px]">
                                                                            <p className="text-gray-800 dark:text-gray-600 text-sm">
                                                                                {selectedPaymentData?.TransactionDate || 'N/A'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Pay To Line */}
                                                                <div className="mb-4">
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-600">Pay</span>
                                                                        <div className="flex-1 border-b border-gray-400 dark:border-gray-500 pb-1 flex items-center justify-between">
                                                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-800">
                                                                                {selectedPaymentData?.VendorName || 'Vendor Name'}
                                                                            </span>
                                                                            <span className="text-xs text-purple-600 dark:text-purple-700 bg-purple-50 dark:bg-purple-100 px-2 py-0.5 rounded">
                                                                                ID: {selectedPaymentData?.VendorCode || 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-sm text-gray-600 dark:text-gray-700">Or Bearer</span>
                                                                    </div>
                                                                </div>

                                                                {/* Amount Section - Traditional Layout */}
                                                                <div className="grid grid-cols-4 gap-4 mb-4">
                                                                    {/* Rupees in Words */}
                                                                    <div className="col-span-3">
                                                                        <div className="flex items-center space-x-2 mb-2">
                                                                            <span className="text-sm text-gray-700 dark:text-gray-600">Rupees</span>
                                                                            <div className="flex-1 border-b border-gray-400 dark:border-gray-500 pb-1 min-h-[2rem] flex items-center">
                                                                                <span className="text-sm text-gray-800 dark:text-gray-700 italic">
                                                                                    {selectedPaymentData?.AmountInWords || 'Amount in words'}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-sm text-gray-600 dark:text-gray-700">Only</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Amount Box */}
                                                                    <div className="text-right">
                                                                        <div className="border-2 border-gray-500 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-100 p-2 rounded">
                                                                            <div className="text-center">
                                                                                <span className="text-lg font-bold text-gray-900 dark:text-gray-800">₹</span>
                                                                                <span className="text-base font-semibold text-gray-900 dark:text-gray-800 font-mono">
                                                                                    {selectedPaymentData?.TransactionAmount ? 
                                                                                        formatIndianCurrency(selectedPaymentData.TransactionAmount) : 
                                                                                        '0.00'
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Account Number and Additional Details */}
                                                                <div className="grid grid-cols-2 gap-4 mb-2">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="text-xs text-gray-600 dark:text-gray-700">A/c No.</span>
                                                                        <div className="border-b border-gray-400 dark:border-gray-500 flex-1 pb-1">
                                                                            <span className="text-sm font-mono text-gray-800 dark:text-gray-700">
                                                                                {selectedPaymentData?.MOID || '1234567890123456'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="bg-green-50 dark:bg-green-100 px-2 py-1 rounded border border-green-200 dark:border-green-300 inline-block">
                                                                            <div className="flex items-center space-x-1">
                                                                                <CreditCard className="w-3 h-3 text-green-600 dark:text-green-700" />
                                                                                <span className="text-xs font-medium text-green-700 dark:text-green-800">
                                                                                    {selectedPaymentData?.ModeofPay || 'Online'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Payment Details Row */}
                                                                <div className="grid grid-cols-3 gap-3 mb-2 text-xs">
                                                                    {selectedPaymentData?.Number && selectedPaymentData.Number !== 'Online' && (
                                                                        <div className="bg-purple-50 dark:bg-purple-100 p-2 rounded border border-purple-200 dark:border-purple-300">
                                                                            <p className="text-purple-600 dark:text-purple-700 font-medium mb-1">Reference</p>
                                                                            <span className="text-purple-800 dark:text-purple-900 font-mono text-xs">
                                                                                {selectedPaymentData.Number}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {/* ✅ FIX: Add null check for PaymentTypeName */}
                                                                    {selectedPaymentData?.PaymentTypeName === 'Vendor Advance' && selectedPaymentData?.PoNo && (
                                                                        <div className="bg-orange-50 dark:bg-orange-100 p-2 rounded border border-orange-200 dark:border-orange-300">
                                                                            <p className="text-orange-600 dark:text-orange-700 font-medium mb-1">PO Reference</p>
                                                                            <span className="text-orange-800 dark:text-orange-900 font-mono text-xs">
                                                                                {selectedPaymentData.PoNo}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Signature Section - Based on Approval History */}
                                                                {(() => {
                                                                    const approvalComments = parseApprovalComments(selectedPaymentData?.Remarks);
                                                                    const currentUser = getCurrentUser();
                                                                    const currentRoleName = getCurrentRoleName();

                                                                    const signatureAreas = [
                                                                        ...approvalComments.map(approval => ({
                                                                            name: approval.name,
                                                                            role: approval.role,
                                                                            status: 'approved'
                                                                        })),
                                                                        {
                                                                            name: currentUser,
                                                                            role: currentRoleName,
                                                                            status: 'pending'
                                                                        }
                                                                    ];

                                                                    const gridCols = signatureAreas.length === 1 ? 'grid-cols-1' :
                                                                        signatureAreas.length === 2 ? 'grid-cols-2' :
                                                                            signatureAreas.length === 3 ? 'grid-cols-3' :
                                                                                'grid-cols-2 lg:grid-cols-4';

                                                                    return (
                                                                        <div className={`grid ${gridCols} gap-4 mt-6 pt-1 border-gray-300 dark:border-gray-400`}>
                                                                            {signatureAreas.map((signer, index) => (
                                                                                <div key={index} className="text-center">
                                                                                    <div className="h-8 border-b border-gray-400 dark:border-gray-500 mb-1 relative">
                                                                                        {signer.status === 'approved' && (
                                                                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-green-600 dark:text-green-700 text-xs">
                                                                                                ✓
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-600 dark:text-gray-700 font-medium">
                                                                                        {signer.name}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-600">
                                                                                        {signer.role}
                                                                                    </p>
                                                                                    {signer.status === 'approved' && (
                                                                                        <div className="mt-1">
                                                                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-200 text-green-700 dark:text-green-800 text-xs rounded border border-green-200 dark:border-green-300">
                                                                                                Approved
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    {signer.status === 'pending' && (
                                                                                        <div className="mt-1">
                                                                                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-200 text-orange-700 dark:text-orange-800 text-xs rounded border border-orange-200 dark:border-orange-300">
                                                                                                Pending
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>

                                                            {/* Bottom MICR Code Section */}
                                                            <div className="bg-gray-100 dark:bg-gray-200 p-3">
                                                                <div className="flex justify-between items-center text-purple-100 dark:text-purple-200 text-xs">
                                                                    <p className="text-gray-800 dark:text-gray-600 text-sm" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontWeight: 600, letterSpacing: '2px', fontVariantNumeric: 'tabular-nums' }}>
                                                                        {selectedPaymentData?.TransactionRefNo || 'N/A'}
                                                                    </p>
                                                                    <span>Generated: {new Date().toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Rest of invoice breakdown */}
                                                        {selectedPaymentData?.lstPayInvoiceData && selectedPaymentData.lstPayInvoiceData.length > 0 && (
                                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                                <button
                                                                    onClick={() => setInvoiceExpanded(!invoiceExpanded)}
                                                                    className="w-full p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-colors"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-3">
                                                                            <div className={`p-2 rounded-lg ${isAdvancePayment ? 'bg-orange-500' : 'bg-purple-500'}`}>
                                                                                <FileBarChart className="w-5 h-5 text-white" />
                                                                            </div>
                                                                            <div className="text-left">
                                                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                                    {isAdvancePayment ? 'Advance Payment Details' : 'Invoice Breakdown'}
                                                                                </h4>
                                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    {selectedPaymentData.lstPayInvoiceData.length} {isAdvancePayment ? 'Entry' : 'Items'} •
                                                                                    Total: ₹{formatIndianCurrency(selectedPaymentData.lstPayInvoiceData.reduce((sum, item) => sum + parseFloat(item.Amount || 0), 0))}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                                {invoiceExpanded ? 'Hide' : 'Show'} Details
                                                                            </span>
                                                                            <div className={`transform transition-transform ${invoiceExpanded ? 'rotate-180' : ''}`}>
                                                                                <ArrowUpCircle className="w-5 h-5 text-gray-500" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </button>

                                                                {invoiceExpanded && (
                                                                    <div className="p-6 space-y-4">
                                                                        {selectedPaymentData.lstPayInvoiceData.map((item, index) => (
                                                                            <div key={index} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                                                {isAdvancePayment ? (
                                                                                    // Advance Payment Layout
                                                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                                        <div>
                                                                                            <span className="text-xs text-orange-600 dark:text-orange-400 block font-semibold">Amount</span>
                                                                                            <span className="font-bold text-lg text-orange-700 dark:text-orange-300">
                                                                                                ₹{formatIndianCurrency(item.Amount || 0)}
                                                                                            </span>
                                                                                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Advance Payment</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-xs text-orange-600 dark:text-orange-400 block font-semibold">Cost Center</span>
                                                                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{item.CCCode || 'N/A'}</span>
                                                                                            <span className="text-xs text-gray-500 dark:text-gray-400 block">CC Code</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-xs text-orange-600 dark:text-orange-400 block font-semibold">DCA Code</span>
                                                                                            <span className="font-medium text-gray-900 dark:text-gray-100">{item.DCACode || 'N/A'}</span>
                                                                                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Account Head</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="text-xs text-orange-600 dark:text-orange-400 block font-semibold">Type</span>
                                                                                            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-600">
                                                                                                {item.Type || 'N/A'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    // Invoice Payment Layout
                                                                                    <div>
                                                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                                                                                            <div>
                                                                                                <span className="text-xs text-purple-600 dark:text-purple-400 block font-semibold">Invoice No.</span>
                                                                                                <span className="font-semibold text-gray-900 dark:text-gray-100">{item.InvoiceNo || 'N/A'}</span>
                                                                                                <span className="text-xs text-gray-500 dark:text-gray-400 block">Bill Reference</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-xs text-purple-600 dark:text-purple-400 block font-semibold">Amount</span>
                                                                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                                                                    ₹{formatIndianCurrency(item.Amount || 0)}
                                                                                                </span>
                                                                                                <span className="text-xs text-gray-500 dark:text-gray-400 block">{item.Type || 'N/A'} Component</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-xs text-purple-600 dark:text-purple-400 block font-semibold">Cost Center</span>
                                                                                                <span className="font-medium text-gray-900 dark:text-gray-100">{item.CCCode || 'N/A'}</span>
                                                                                                <span className="text-xs text-gray-500 dark:text-gray-400 block">Department</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-xs text-purple-600 dark:text-purple-400 block font-semibold">IT Code</span>
                                                                                                <span className="font-medium text-gray-900 dark:text-gray-100">{item.ITCode || 'N/A'}</span>
                                                                                                <span className="text-xs text-gray-500 dark:text-gray-400 block">Item Code</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                                                            <div>
                                                                                                <span className="text-xs text-purple-600 dark:text-purple-400 block font-semibold">DCA Code</span>
                                                                                                <span className="font-medium text-gray-900 dark:text-gray-100">{item.DCACode || 'N/A'}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-xs text-purple-600 dark:text-purple-400 block font-semibold">Sub DCA</span>
                                                                                                <span className="font-medium text-gray-900 dark:text-gray-100">{item.SubDcaCode || 'N/A'}</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-xs text-purple-600 dark:text-purple-400 block font-semibold">Type</span>
                                                                                                <span className={`px-2 py-1 text-xs rounded-full border ${(item.Type || '').toLowerCase() === 'gst'
                                                                                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600'
                                                                                                    : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-600'
                                                                                                    }`}>
                                                                                                    {item.Type || 'N/A'}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}

                                                                        {/* Summary */}
                                                                        <div className={`p-4 rounded-lg border-2 ${isAdvancePayment
                                                                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-600'
                                                                            : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-600'
                                                                            }`}>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className={`font-semibold ${isAdvancePayment ? 'text-orange-800 dark:text-orange-200' : 'text-purple-800 dark:text-purple-200'
                                                                                    }`}>
                                                                                    Total {isAdvancePayment ? 'Advance' : 'Invoice'} Amount:
                                                                                </span>
                                                                                <span className={`font-bold text-xl ${isAdvancePayment ? 'text-orange-900 dark:text-orange-100' : 'text-purple-900 dark:text-purple-100'
                                                                                    }`}>
                                                                                    ₹{formatIndianCurrency(selectedPaymentData.lstPayInvoiceData.reduce((sum, item) => sum + parseFloat(item.Amount || 0), 0))}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* Approval History */}
                                            {selectedPaymentData?.Remarks && (() => {
                                                const approvalComments = parseApprovalComments(selectedPaymentData.Remarks);
                                                return approvalComments.length > 0 && (
                                                    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                                            <UserCheck className="w-5 h-5 mr-2" />
                                                            Approval History ({approvalComments.length} Comments)
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {approvalComments.map((approval, index) => (
                                                                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                                    <div className="flex items-start space-x-3">
                                                                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                                                                            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center space-x-2 mb-1">
                                                                                <span className="font-semibold text-gray-900 dark:text-gray-100">{approval.name}</span>
                                                                                <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-600">
                                                                                    {approval.role}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300">{approval.comment}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Verification Comments */}
                                            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 rounded-xl border-2 border-red-200 dark:border-red-700">
                                                <label className="text-sm font-bold text-red-800 dark:text-red-200 mb-3 flex items-center">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    <span className="text-red-600 dark:text-red-400">*</span> Verification Comments (Mandatory)
                                                </label>
                                                <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                                                    Please provide your verification decision and comments for this {selectedPaymentData?.PaymentTypeName === 'Vendor Advance' ? 'advance' : 'invoice'} payment.
                                                </p>
                                                <textarea
                                                    value={verificationComment}
                                                    onChange={(e) => setVerificationComment(e.target.value)}
                                                    className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 transition-all ${verificationComment.trim() === ''
                                                        ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                                        : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                                                        }`}
                                                    rows="4"
                                                    placeholder={`Please verify ${selectedPaymentData?.PaymentTypeName === 'Vendor Advance'
                                                        ? 'the advance amount, cost center allocation, and PO reference...'
                                                        : 'all invoice details, amounts, GST calculations, and cost center allocations...'
                                                        }`}
                                                    required
                                                />
                                                {verificationComment.trim() === '' && (
                                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                                        Verification comment is required before proceeding
                                                    </p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="space-y-4">
                                                {renderActionButtons()}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading payment details...</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payment Selected</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Select a vendor payment from the list to view details and take action.
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

export default VerifyVendorPayment; 