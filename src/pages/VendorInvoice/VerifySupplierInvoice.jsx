// VerifySupplierInvoice.jsx - Main component for supplier invoice verification (Purple/Indigo Theme)
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeft, FileText,
    CheckCircle, XCircle, Clock,
    ReceiptIndianRupee, User, Hash,
    Package, Eye, FileCheck,
    UserCheck,
    Percent, Calculator,
    FileSpreadsheet,
    ExternalLink, AlertTriangle, Download, X
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import InboxSplitLayout from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

// ✅ SUPPLIER INVOICE SLICE IMPORTS
import {
    // Async Thunks
    fetchVerificationSupplierInvoices,
    fetchSupplierInvoiceByNo,
    approveSupplierInvoice,

    // Data Selectors
    selectVerificationSupplierInvoices,
    selectVerificationSupplierInvoicesArray,
    selectSupplierInvoiceData,
    selectSelectedRoleId,

    // Loading Selectors
    selectVerificationSupplierInvoicesLoading,
    selectSupplierInvoiceDataLoading,
    selectApproveSupplierInvoiceLoading,

    // Error Selectors
    selectVerificationSupplierInvoicesError,

    // Actions
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedInvoiceNo,
    setSelectedSupplierCode,
    resetSupplierInvoiceData
} from '../../slices/vendorInvoiceSlice/supplierInvoiceSlice';

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

const VerifySupplierInvoice = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ✅ SUPPLIER INVOICE STATE
    const verificationInvoices = useSelector(selectVerificationSupplierInvoicesArray);
    const selectedInvoiceData = useSelector(selectSupplierInvoiceData);
    const invoicesLoading = useSelector(selectVerificationSupplierInvoicesLoading);
    const invoiceDataLoading = useSelector(selectSupplierInvoiceDataLoading);
    const approvalLoading = useSelector(selectApproveSupplierInvoiceLoading);
    const invoicesError = useSelector(selectVerificationSupplierInvoicesError);
    const selectedRoleId = useSelector(selectSelectedRoleId);

    // ✅ APPROVAL STATE (Generic/Reusable)
    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const statusList = useSelector(selectStatusList);
    const availableActions = useSelector(selectAvailableActions);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);


    const [pdfModal, setPdfModal] = useState({
        isOpen: false,
        title: '',
        url: '',
        type: ''
    });


    const buildPdfUrl = (fileName, type) => {
        if (!fileName) return null;

        const baseUrls = {
            invoice: 'https://sltouch-rdsbackup-bucket.s3.us-east-2.amazonaws.com/Upload+docs/VendorPROD',
            mrr: 'https://sltouch-rdsbackup-bucket.s3.us-east-2.amazonaws.com/Upload+docs/MRRPROD'
        };

        return `${baseUrls[type]}/${fileName}`;
    };

    const openPdfViewer = (fileName, title, type) => {
        const url = buildPdfUrl(fileName, type);
        if (url) {
            setPdfModal({
                isOpen: true,
                title,
                url,
                type
            });
        } else {
            toast.error('PDF file not available');
        }
    };


    // ✅ GET USER ID AND ROLE ID FROM AUTH STATE
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // 🔍 COMPREHENSIVE DEBUG LOGGING
    console.log('🔍 Auth State Debug:', {
        userData,
        roleId,
        uid,
        'userData.roleId': userData?.roleId,
        'userData.RID': userData?.RID,
        'userData.UID': userData?.UID,
        'userData.uid': userData?.uid,
        'notificationData': notificationData
    });

    console.log('🔍 Current Values Being Used:', {
        'Final roleId': roleId,
        'Final uid': uid,
        'selectedRoleId': selectedRoleId,
        'verificationInvoices length': verificationInvoices.length
    });

    // ✅ LOCAL STATE
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVendor, setFilterVendor] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    // ✅ EXTRACT NOTIFICATION DATA (FOR UI DISPLAY ONLY)
    const {
        InboxTitle,
        ModuleDisplayName
    } = notificationData || {};

    // ✅ INITIALIZE WITH ROLE ID AND USER ID FROM AUTH STATE
    useEffect(() => {
        console.log('🚀 useEffect Trigger - Auth Values Check:', {
            roleId,
            uid,
            selectedRoleId,
            'roleId !== selectedRoleId': roleId !== selectedRoleId,
            'Both roleId and uid exist': !!(roleId && uid)
        });

        if (roleId && uid && roleId !== selectedRoleId) {
            console.log('📡 Dispatching API Calls with:', { roleId, uid });

            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));

            console.log('📋 Fetching Verification Supplier Invoices...');
            dispatch(fetchVerificationSupplierInvoices({ roleId: roleId, userId: uid }));
        } else {
            console.log('❌ Skipping API call. Missing values:', {
                'roleId missing': !roleId,
                'uid missing': !uid,
                'roleId same as selectedRoleId': roleId === selectedRoleId
            });
        }
    }, [roleId, uid, selectedRoleId, dispatch, userData]);

    // ✅ ADD CONSOLE LOGGING FOR DATA STATE CHANGES
    useEffect(() => {
        console.log('📊 Data State Update:', {
            'Invoices Loading': invoicesLoading,
            'Invoices Error': invoicesError,
            'Invoices Count': verificationInvoices.length,
            'Invoice Data Loading': invoiceDataLoading,
            'Selected Invoice Data': selectedInvoiceData ? 'Loaded' : 'Not Loaded',
            'Selected Invoice': selectedInvoice?.InvoiceNo || 'None'
        });
    }, [invoicesLoading, invoicesError, verificationInvoices.length, invoiceDataLoading, selectedInvoiceData, selectedInvoice]);
    useEffect(() => {
        if (selectedInvoiceData?.MOID && roleId) {
            const statusParams = {
                MOID: selectedInvoiceData.MOID,
                ROID: roleId,
                ChkAmt: selectedInvoiceData.NetAmount || selectedInvoiceData.InvoiceValue || 0
            };
            console.log('📊 Fetching Status List with params:', statusParams);
            dispatch(fetchStatusList(statusParams));
        } else {
            console.log('❌ Skipping Status List fetch:', {
                'MOID missing': !selectedInvoiceData?.MOID,
                'roleId missing': !roleId,
                'selectedInvoiceData': selectedInvoiceData
            });
        }
    }, [selectedInvoiceData?.MOID, roleId, dispatch]);

    // ✅ HELPER FUNCTIONS
    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Invoice Verifier';
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

    const getPriority = (invoice) => {
        if (!invoice) return 'Low';
        const amount = parseFloat(invoice.NetAmount || invoice.InvoiceValue || 0);
        const invoiceDate = invoice.InvoiceDate ? new Date(invoice.InvoiceDate) : new Date();
        const today = new Date();
        const daysOld = Math.ceil((today - invoiceDate) / (1000 * 60 * 60 * 24));

        if (amount > 100000 || daysOld > 30) return 'High';
        if (amount > 50000 || daysOld > 15) return 'Medium';
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

    const getGSTTypeColor = (gstType) => {
        switch (gstType?.toLowerCase()) {
            case 'creditable': return 'bg-green-100 text-green-800 border-green-200';
            case 'non-creditable': return 'bg-red-100 text-red-800 border-red-200';
            case 'exempt': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        const statusNum = parseInt(status);
        switch (statusNum) {
            case 1: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 3: return 'bg-orange-100 text-orange-800 border-orange-200';
            case 4: return 'bg-purple-100 text-purple-800 border-purple-200';
            case 5: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 6: return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

    const handleInvoiceSelect = async (invoice) => {
        console.log('📄 Invoice Selected:', {
            'Invoice No': invoice.InvoiceNo,
            'Vendor ID': invoice.VendorId,
            'Invoice': invoice
        });

        setSelectedInvoice(invoice);
        setIsVerified(false);
        setVerificationComment('');
        setIsLeftPanelCollapsed(true);
        dispatch(setSelectedInvoiceNo(invoice.InvoiceNo));
        dispatch(setSelectedSupplierCode(invoice.VendorId));

        console.log('📡 Fetching Invoice Details for:', invoice.InvoiceNo);
        dispatch(fetchSupplierInvoiceByNo(invoice.InvoiceNo));
    };

    const buildInvoiceApprovalPayload = (actionValue, selectedInvoice, selectedInvoiceData, verificationComment) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            selectedInvoiceData?.ApprovedUser,
            currentRoleName,
            currentUser,
            verificationComment
        );

        const payload = {
            InvoiceNo: selectedInvoice.InvoiceNo,
            ApprovalNote: verificationComment,
            Remarks: updatedRemarks,
            Action: actionValue,
            Roleid: roleId || selectedRoleId,
            Userid: uid,
            SupplierCode: selectedInvoice.VendorId,
            Createdby: getCurrentUser(),
            Amount: selectedInvoiceData?.NetAmount || selectedInvoice.NetAmount,
            InvoiceDate: selectedInvoiceData?.InvoiceDate || selectedInvoice.InvoiceDate,
            ApprovalStatus: actionValue,

            // Additional invoice-specific fields
            ...(selectedInvoiceData?.MOID && { MOID: selectedInvoiceData.MOID }),
            ...(selectedInvoiceData?.PONo && { PONo: selectedInvoiceData.PONo }),
            ...(selectedInvoiceData?.MRR && { MRR: selectedInvoiceData.MRR }),
            ...(selectedInvoiceData?.InvoiceValue && { InvoiceValue: selectedInvoiceData.InvoiceValue })
        };

        console.log('🎯 Built Approval Payload:', {
            'Action': actionValue,
            'Invoice No': selectedInvoice.InvoiceNo,
            'RoleId Used': roleId || selectedRoleId,
            'UserId Used': uid,
            'Full Payload': payload
        });

        return payload;
    };

    const onActionClick = async (action) => {
        console.log('🎬 Action Click Started:', {
            'Action': action,
            'Selected Invoice': selectedInvoice?.InvoiceNo,
            'Comment Length': verificationComment.trim().length
        });

        if (!selectedInvoice) {
            console.log('❌ No invoice selected');
            toast.error('No invoice selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            console.log('❌ No verification comment provided');
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the invoice details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value;
        if (!actionValue || actionValue.trim() === '') {
            const typeToValueMap = {
                'approve': 'Approve',
                'verify': 'Verify',
                'reject': 'Reject'
            };
            actionValue = typeToValueMap[action.type.toLowerCase()] || action.type;
        }

        console.log('🎯 Final Action Value:', actionValue);

        try {
            const payload = buildInvoiceApprovalPayload(
                actionValue,
                selectedInvoice,
                selectedInvoiceData,
                verificationComment
            );

            console.log(`🚀 Dispatching Approval for Invoice ${actionValue}:`, selectedInvoice.InvoiceNo);

            const result = await dispatch(approveSupplierInvoice(payload)).unwrap();

            console.log('✅ Approval Result:', result);

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

            console.log('🔄 Refreshing data after successful approval...');
            setTimeout(() => {
                dispatch(fetchVerificationSupplierInvoices({ roleId: roleId || selectedRoleId, userId: uid }));
                setSelectedInvoice(null);
                setVerificationComment('');
                setIsVerified(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetSupplierInvoiceData());
                dispatch(resetApprovalData());
            }, 1000);

        } catch (error) {
            console.error(`❌ Invoice ${action.type} Error:`, error);
            let errorMessage = `Failed to ${action.text.toLowerCase()}`;

            if (error && typeof error === 'string') {
                errorMessage = `❌ ${error}`;
            } else if (error?.message) {
                errorMessage = `❌ ${error.message}`;
            }

            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    // ✅ FILTER INVOICES BASED ON SEARCH AND FILTERS
    const filteredInvoices = verificationInvoices.filter(invoice => {
        const vendorDisplayName = invoice.VendorName?.split(',')[1]?.trim() || invoice.VendorName;
        const matchesSearch = vendorDisplayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.InvoiceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.VendorId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.PONo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.MRR?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesVendor = filterVendor === 'All' || vendorDisplayName === filterVendor;
        const matchesStatus = filterStatus === 'All' || invoice.Status === filterStatus;

        return matchesSearch && matchesVendor && matchesStatus;
    });

    const vendors = [...new Set(verificationInvoices.map(i => i.VendorName?.split(',')[1]?.trim()).filter(Boolean))];
    const statuses = [...new Set(verificationInvoices.map(i => i.Status).filter(Boolean))];

    const renderItemCard = (invoice) => {
        const priority = getPriority(invoice);
        const amountDisplay = getAmountDisplay(invoice.NetAmount || invoice.InvoiceValue);
        const vendorDisplayName = invoice.VendorName?.split(',')[1]?.trim() || invoice.VendorName;

        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <ReceiptIndianRupee className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {vendorDisplayName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{invoice.VendorId}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(priority)}`}>
                        {priority}
                    </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span className="truncate">{invoice.InvoiceNo}</span>
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(invoice.Status)}`}>
                            Status {invoice.Status}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">₹{amountDisplay.formatted}</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{invoice.CCCode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">
                            <Package className="w-3 h-3 inline mr-1" />
                            PO: {invoice.PONo?.slice(-6) || 'N/A'}
                        </span>
                        <span className="text-gray-500 text-xs">
                            MRR: {invoice.MRR?.slice(-6) || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderListItem = (invoice) => {
        const priority = getPriority(invoice);
        const amountDisplay = getAmountDisplay(invoice.NetAmount || invoice.InvoiceValue);
        const vendorDisplayName = invoice.VendorName?.split(',')[1]?.trim() || invoice.VendorName;

        return (
            <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
                <span className="font-semibold text-gray-900 dark:text-white min-w-[140px]">{vendorDisplayName}</span>
                <span className="font-mono text-gray-500 dark:text-gray-400 min-w-[110px]">{invoice.InvoiceNo}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(priority)}`}>{priority}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(invoice.Status)}`}>
                    Status {invoice.Status}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">PO: {invoice.PONo?.slice(-6) || 'N/A'}</span>
                <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">₹{amountDisplay.formatted}</span>
            </div>
        );
    };

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <ReceiptIndianRupee className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );


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
                            console.log('🔄 Status List Retry with values:', {
                                MOID: selectedInvoiceData?.MOID,
                                roleId,
                                ChkAmt: selectedInvoiceData.NetAmount || 0
                            });
                            if (selectedInvoiceData?.MOID && roleId) {
                                dispatch(fetchStatusList({
                                    MOID: selectedInvoiceData.MOID,
                                    ROID: roleId,
                                    ChkAmt: selectedInvoiceData.NetAmount || 0
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
                    <div className="text-gray-500 mb-2">No actions available for this invoice</div>
                </div>
            );
        }

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
                                disabled={approvalLoading || verificationComment.trim() === '' || !isVerified}
                                className={`
                                flex items-center justify-center space-x-2 px-6 py-4
                                ${action.className}
                                text-white rounded-lg transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed
                                font-medium shadow-lg hover:shadow-xl
                                min-h-[60px]
                            `}
                                title={verificationComment.trim() === '' ? 'Please add verification comments first' : !isVerified ? 'Please check the verification checkbox first' : `${action.text} (${action.type}: ${action.value})`}
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

    const PdfModal = () => {
        if (!pdfModal.isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-hidden">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={() => setPdfModal({ isOpen: false, title: '', url: '', type: '' })}
                ></div>

                {/* Modal Container */}
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 max-w-6xl w-full h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-2xl">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {pdfModal.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {pdfModal.type === 'invoice' ? 'Vendor Invoice Document' : 'MRR/QMQC Document'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Download Button */}
                                <a
                                    href={pdfModal.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                    title="Download PDF"
                                >
                                    <Download className="w-5 h-5" />
                                </a>

                                {/* Open in New Tab */}
                                <a
                                    href={pdfModal.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                    title="Open in New Tab"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>

                                {/* Close Button */}
                                <button
                                    onClick={() => setPdfModal({ isOpen: false, title: '', url: '', type: '' })}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* PDF Viewer Content */}
                        <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
                            <iframe
                                src={pdfModal.url}
                                className="w-full h-full border-0 rounded-lg shadow-inner"
                                title={pdfModal.title}
                                onError={() => {
                                    toast.error('Failed to load PDF. Please try downloading instead.');
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    const renderDetailContent = () => {
        if (!selectedInvoice) return null;

        return (
            <div className="space-y-4">
                {invoiceDataLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading detailed information...</p>
                    </div>
                ) : selectedInvoiceData ? (
                    <>
                                            {/* Invoice Header */}
                                            <div className="p-6 rounded-xl border-2 bg-gradient-to-r from-indigo-50 via-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center shadow-lg">
                                                                <ReceiptIndianRupee className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                                <CheckCircle className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                                                {selectedInvoiceData.VendorName?.split(',')[1]?.trim() || selectedInvoiceData.VendorName}
                                                            </h3>
                                                            <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                                                                #{selectedInvoiceData.InvoiceNo}
                                                            </p>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="px-3 py-1 text-sm rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-opacity-20 dark:border-opacity-50">
                                                                    {selectedInvoiceData.VendorType || 'Supplier'}
                                                                </span>
                                                                {selectedInvoiceData.GSTType && (
                                                                    <span className={`px-3 py-1 text-sm rounded-full border ${getGSTTypeColor(selectedInvoiceData.GSTType)}`}>
                                                                        {selectedInvoiceData.GSTType}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                                                            ₹{formatIndianCurrency(selectedInvoiceData.NetAmount)}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Net Amount</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Invoice: ₹{formatIndianCurrency(selectedInvoiceData.InvoiceValue)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Document Viewer Section */}
                                                {(selectedInvoiceData.FileName || selectedInvoiceData.MrrPath) && (
                                                    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            Document Attachments
                                                        </h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Invoice PDF */}
                                                            {selectedInvoiceData.FileName && (
                                                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-3">
                                                                            <div className="p-2 bg-indigo-500 rounded-lg">
                                                                                <ReceiptIndianRupee className="w-4 h-4 text-white" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold text-indigo-800 dark:text-indigo-200">Invoice Document</p>
                                                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">{selectedInvoiceData.FileName}</p>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => openPdfViewer(
                                                                                selectedInvoiceData.FileName,
                                                                                `Invoice: ${selectedInvoiceData.InvoiceNo}`,
                                                                                'invoice'
                                                                            )}
                                                                            className="flex items-center space-x-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors shadow-md hover:shadow-lg"
                                                                            title="View Invoice PDF"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                            <span>View</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* MRR/QMQC PDF */}
                                                            {selectedInvoiceData.MrrPath && (
                                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-600">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-3">
                                                                            <div className="p-2 bg-green-500 rounded-lg">
                                                                                <FileCheck className="w-4 h-4 text-white" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold text-green-800 dark:text-green-200">MRR/QMQC Document</p>
                                                                                <p className="text-xs text-green-600 dark:text-green-400 font-mono">{selectedInvoiceData.MrrPath}</p>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => openPdfViewer(
                                                                                selectedInvoiceData.MrrPath,
                                                                                `MRR: ${selectedInvoiceData.MRR}`,
                                                                                'mrr'
                                                                            )}
                                                                            className="flex items-center space-x-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors shadow-md hover:shadow-lg"
                                                                            title="View MRR/QMQC PDF"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                            <span>View</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* If no documents available */}
                                                        {!selectedInvoiceData.FileName && !selectedInvoiceData.MrrPath && (
                                                            <div className="text-center py-4">
                                                                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">No document attachments available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">PO Number</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedInvoiceData.PONo}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">MRR</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedInvoiceData.MRR}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Invoice Date</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedInvoiceData.InvoiceDate || 'N/A'}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Cost Center</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedInvoiceData.CCCode}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* GST Information */}
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border border-green-200 dark:border-green-700">
                                                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                                                    <Percent className="w-5 h-5 mr-2" />
                                                    GST Details
                                                </h4>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <span className="text-xs text-green-600 dark:text-green-400 block">CGST</span>
                                                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">₹{formatIndianCurrency(selectedInvoiceData.CGSTTotal || selectedInvoiceData.InvTotalCGSTAmt)}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <span className="text-xs text-green-600 dark:text-green-400 block">SGST</span>
                                                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">₹{formatIndianCurrency(selectedInvoiceData.SGSTTotal || selectedInvoiceData.InvTotalSGSTAmt)}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <span className="text-xs text-green-600 dark:text-green-400 block">IGST</span>
                                                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">₹{formatIndianCurrency(selectedInvoiceData.IGSTTotal || selectedInvoiceData.InvTotalIGSTAmt)}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <span className="text-xs text-green-600 dark:text-green-400 block">Total GST</span>
                                                        <span className="font-bold text-lg text-green-700 dark:text-green-300">₹{formatIndianCurrency(selectedInvoiceData.InvGSTTotal)}</span>
                                                    </div>
                                                </div>

                                                {selectedInvoiceData.VendorGST && (
                                                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <span className="text-xs text-green-600 dark:text-green-400 block">Vendor GST</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedInvoiceData.VendorGST}</span>
                                                        </div>
                                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <span className="text-xs text-green-600 dark:text-green-400 block">Company GST</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedInvoiceData.CompanyGST}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item Breakdown */}
                                            {/* Item Breakdown - Updated Layout */}
                                            {selectedInvoiceData.MRRItemData && selectedInvoiceData.MRRItemData.length > 0 && (
                                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                                                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center">
                                                        <FileSpreadsheet className="w-5 h-5 mr-2" />
                                                        Item Details ({selectedInvoiceData.MRRItemData.length} Items)
                                                    </h4>

                                                    {/* Items Table/List - Updated Compact Format */}
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                                        {/* Table Header - Updated Grid */}
                                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 border-b border-gray-200 dark:border-gray-600">
                                                            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-purple-800 dark:text-purple-200">
                                                                <div className="col-span-4">Item Details</div>
                                                                <div className="col-span-2">Specifications</div>
                                                                <div className="col-span-1 text-center">Qty</div>
                                                                <div className="col-span-2 text-right">Rate</div>
                                                                <div className="col-span-3 text-right">Amount & GST</div>
                                                            </div>
                                                        </div>

                                                        {/* Items List - Updated Layout */}
                                                        <div className="max-h-80 overflow-y-auto">
                                                            {selectedInvoiceData.MRRItemData.map((item, index) => (
                                                                <div key={index} className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                                    <div className="grid grid-cols-12 gap-2 text-sm">
                                                                        {/* Item Details - Expanded */}
                                                                        <div className="col-span-4">
                                                                            <div className="flex items-center space-x-2">
                                                                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                                    <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                                                </div>
                                                                                <div className="min-w-0 flex-1">
                                                                                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.itemname}</p>
                                                                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">{item.itemcode}</p>
                                                                                    {/* DCA codes moved here */}
                                                                                    <div className="flex items-center space-x-2 mt-1">
                                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                            DCA: <span className="font-mono text-gray-700 dark:text-gray-300">{item.dcacode}</span>
                                                                                        </span>
                                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                            Sub: <span className="font-mono text-gray-700 dark:text-gray-300">{item.subdcacode}</span>
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Specifications */}
                                                                        <div className="col-span-2">
                                                                            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{item.specification}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">HSN: {item.HSNCode}</p>
                                                                        </div>

                                                                        {/* Quantity */}
                                                                        <div className="col-span-1 text-center">
                                                                            <p className="font-bold text-purple-700 dark:text-purple-300">{item.Requestedqty}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.units}</p>
                                                                        </div>

                                                                        {/* Rate - Expanded */}
                                                                        <div className="col-span-2 text-right">
                                                                            <p className="font-medium text-gray-900 dark:text-gray-100">₹{formatIndianCurrency(item.NewBasicprice)}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">per {item.units}</p>
                                                                        </div>

                                                                        {/* Amount & GST - Expanded */}
                                                                        <div className="col-span-3">
                                                                            {/* Amount */}
                                                                            <div className="text-right mb-2">
                                                                                <p className="font-bold text-lg text-green-700 dark:text-green-300">₹{formatIndianCurrency(item.Amount)}</p>
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Basic Amount</p>
                                                                            </div>

                                                                            {/* GST Breakdown - Horizontal Layout */}
                                                                            <div className="grid grid-cols-3 gap-1 text-xs">
                                                                                <div className="text-center bg-green-50 dark:bg-green-900/20 rounded p-1">
                                                                                    <p className="text-gray-500 dark:text-gray-400">CGST</p>
                                                                                    <p className="font-medium text-gray-800 dark:text-gray-200">{item.CGSTpercent}%</p>
                                                                                    <p className="text-xs text-green-600 dark:text-green-400">₹{formatIndianCurrency(item.CGSTAmt)}</p>
                                                                                </div>
                                                                                <div className="text-center bg-green-50 dark:bg-green-900/20 rounded p-1">
                                                                                    <p className="text-gray-500 dark:text-gray-400">SGST</p>
                                                                                    <p className="font-medium text-gray-800 dark:text-gray-200">{item.SGSTpercent}%</p>
                                                                                    <p className="text-xs text-green-600 dark:text-green-400">₹{formatIndianCurrency(item.SGSTAmt)}</p>
                                                                                </div>
                                                                                <div className="text-center bg-green-50 dark:bg-green-900/20 rounded p-1">
                                                                                    <p className="text-gray-500 dark:text-gray-400">IGST</p>
                                                                                    <p className="font-medium text-gray-800 dark:text-gray-200">{item.IGSTpercent}%</p>
                                                                                    <p className="text-xs text-green-600 dark:text-green-400">₹{formatIndianCurrency(item.IGSTAmt)}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Items Summary Footer */}
                                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-4 border-t border-gray-200 dark:border-gray-600">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-semibold text-purple-800 dark:text-purple-200">
                                                                    Total Items Amount ({selectedInvoiceData.MRRItemData.length} items):
                                                                </span>
                                                                <span className="font-bold text-lg text-purple-900 dark:text-purple-100">
                                                                    ₹{formatIndianCurrency(selectedInvoiceData.ItemTotal)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Other Charges & Deductions */}
                                            {(selectedInvoiceData.OtherChargeList?.length > 0 || selectedInvoiceData.DeductionList?.length > 0) && (
                                                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
                                                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center">
                                                        <Calculator className="w-5 h-5 mr-2" />
                                                        Additional Charges & Deductions
                                                    </h4>

                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        {selectedInvoiceData.OtherChargeList?.length > 0 && (
                                                            <div>
                                                                <h5 className="font-medium text-orange-700 dark:text-orange-300 mb-3">Other Charges</h5>
                                                                <div className="space-y-2">
                                                                    {selectedInvoiceData.OtherChargeList.map((charge, index) => (
                                                                        <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-700 dark:text-gray-300">{charge.TaxType}</span>
                                                                                <span className="font-medium text-gray-900 dark:text-gray-100">₹{formatIndianCurrency(charge.Amount)}</span>
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                CC: {charge.CCCode} | DCA: {charge.DCACode}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectedInvoiceData.DeductionList?.length > 0 && (
                                                            <div>
                                                                <h5 className="font-medium text-red-700 dark:text-red-300 mb-3">Deductions</h5>
                                                                <div className="space-y-2">
                                                                    {selectedInvoiceData.DeductionList.map((deduction, index) => (
                                                                        <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-sm text-gray-700 dark:text-gray-300">{deduction.Type}</span>
                                                                                <span className="font-medium text-red-600 dark:text-red-400">-₹{formatIndianCurrency(deduction.Amount)}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Approval History */}
                                            {selectedInvoiceData.ApprovedUser && (() => {
                                                const approvalComments = parseApprovalComments(selectedInvoiceData.ApprovedUser);
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
                                            {/* Verification Input */}
                                            <VerificationInput
                                                isVerified={isVerified}
                                                onVerifiedChange={setIsVerified}
                                                comment={verificationComment}
                                                onCommentChange={(e) => setVerificationComment(e.target.value)}
                                                config={{
                                                    checkboxLabel: '✓ I have verified all supplier invoice details',
                                                    checkboxDescription: 'Including GST calculations, item quantities, amounts, and PO compliance',
                                                    commentLabel: 'Verification Comments',
                                                    commentPlaceholder: 'Please verify invoice amount, GST calculations, item details, PO compliance, and all related documents...',
                                                    commentRequired: true,
                                                    commentMaxLength: 1000,
                                                    showCharCount: true,
                                                    validationStyle: 'dynamic',
                                                    checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                                                    commentGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                                                    commentBorder: 'border-indigo-200 dark:border-indigo-700',
                                                }}
                                            />

                                            {/* Action Buttons */}
                                            <div className="space-y-4">
                                                {renderActionButtons()}
                                            </div>
                                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading invoice details...</p>
                    </div>
                )}
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'Supplier Invoice Verification'} (${verificationInvoices.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verificationInvoices.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={ReceiptIndianRupee}
                badgeText="Invoice Verification"
                badgeCount={verificationInvoices.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by vendor, invoice, PO, MRR...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                filters={[
                    {
                        value: filterVendor,
                        onChange: (e) => setFilterVendor(e.target.value),
                        defaultLabel: 'All Vendors',
                        options: vendors,
                    },
                    {
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        defaultLabel: 'All Status',
                        options: statuses,
                    },
                ]}
                enableViewToggle
            />

            <InboxSplitLayout
                isLeftPanelCollapsed={isLeftPanelCollapsed}
                onLeftPanelCollapseToggle={setIsLeftPanelCollapsed}
                isLeftPanelHovered={isLeftPanelHovered}
                onLeftPanelHoverChange={setIsLeftPanelHovered}
                left={{
                    items: filteredInvoices,
                    selectedItem: selectedInvoice,
                    onItemSelect: handleInvoiceSelect,
                    renderItem: renderItemCard,
                    renderListItem: renderListItem,
                    renderCollapsedItem: renderCollapsedItem,
                    loading: invoicesLoading,
                    error: invoicesError,
                    onRefresh: () => dispatch(fetchVerificationSupplierInvoices({ roleId: roleId || selectedRoleId, userId: uid })),
                    config: {
                        title: 'Pending Verification',
                        icon: Clock,
                        emptyMessage: 'No supplier invoices pending',
                        itemKey: 'InvoiceNo',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Supplier Invoice Verification',
                        icon: ReceiptIndianRupee,
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedInvoice,
                    loading: invoiceDataLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Select an Invoice',
                        icon: ReceiptIndianRupee,
                        selectedTitle: 'Invoice Verification',
                        emptyTitle: 'No Invoice Selected',
                        emptyMessage: 'Select a supplier invoice from the list to view details and take action.',
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        maxHeight: 'calc(100vh - 200px)',
                        sticky: true,
                        stickyTop: '1.5rem',
                    },
                }}
            />

            <PdfModal />
        </div>
    );
};

export default VerifySupplierInvoice;