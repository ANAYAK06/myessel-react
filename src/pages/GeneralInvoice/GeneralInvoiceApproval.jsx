// GeneralInvoiceApproval.jsx - General Invoice Approval with Enhanced Features
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeft, Receipt, Calendar, FileText,
    CheckCircle, XCircle, Clock, AlertCircle, Search, RefreshCw,
    User, MapPin, Hash, Target, TrendingUp,
    Package, BadgeCheck, X, Eye, FileCheck,
    Timer, UserCheck, CircleIndianRupee, FileBarChart,
    FileX, ArrowUpCircle, Percent, Calculator,
    CreditCard, FileSpreadsheet, Clipboard,
    Landmark, CheckSquare, ArrowRightLeft, Layers, ExternalLink,
    AlertTriangle, Download, ClipboardList, Edit3,
    BarChart3, History, MousePointer, Info, ChevronDown, ChevronUp,
    ChevronRight, ChevronLeft, Maximize2, Minimize2, Square, CheckBox,
    DollarSign, TrendingDown, RefreshCcw, AlertOctagon, Briefcase,
    Users, Settings, Award, Star, Phone, Mail, Home, UserCircle,
    FileBarChart2, Shield, Globe, Activity, Building2, CreditCard as CreditCardIcon
} from 'lucide-react';

// GENERAL INVOICE SLICE IMPORTS
import {
    fetchVerificationGeneralInvoice,
    fetchGeneralInvoiceByNo,
    approveGeneralInvoice,
    selectVerificationGeneralInvoices,
    selectVerificationGeneralInvoicesArray,
    selectInvoiceData,
    selectSelectedRoleId,
    selectVerificationGeneralInvoicesLoading,
    selectInvoiceDataLoading,
    selectApproveGeneralInvoiceLoading,
    selectVerificationGeneralInvoicesError,
    setSelectedRoleId,
    setSelectedInvNo,
    setSelectedUserId,
    resetInvoiceData
} from '../../slices/generalInvoiceSlice/genralInvoiceSlice';

// PURCHASE HELPER SLICE IMPORTS (for approval history)
import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedTrno,
    setSelectedMOID
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

// APPROVAL SLICE IMPORTS
import {
    fetchStatusList,
    selectStatusList,
    selectAvailableActions,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    clearError as clearApprovalError
} from '../../slices/CommonSlice/getStatusSlice';

// AMOUNT HELPER
import {
    convertAmountToWords,
    formatIndianCurrency,
    getAmountDisplay,
    isValidAmount
} from '../../utilities/amountToTextHelper';

const GeneralInvoiceApproval = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // GENERAL INVOICE STATE
    const verificationGeneralInvoices = useSelector(selectVerificationGeneralInvoicesArray);
    const selectedInvoiceData = useSelector(selectInvoiceData);
    const invoicesLoading = useSelector(selectVerificationGeneralInvoicesLoading);
    const invoiceDataLoading = useSelector(selectInvoiceDataLoading);
    const approvalLoading = useSelector(selectApproveGeneralInvoiceLoading);
    const invoicesError = useSelector(selectVerificationGeneralInvoicesError);
    const selectedRoleId = useSelector(selectSelectedRoleId);

    // APPROVAL HISTORY STATE
    const remarks = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    // APPROVAL STATE
    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const statusList = useSelector(selectStatusList);
    const availableActions = useSelector(selectAvailableActions);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);

    // GET USER ID AND ROLE ID FROM AUTH STATE
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // LOCAL STATE
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [approvalComment, setApprovalComment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDateRange, setFilterDateRange] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);

    // EXTRACT NOTIFICATION DATA
    const {
        InboxTitle,
        ModuleDisplayName
    } = notificationData || {};

    // INITIALIZE WITH ROLE ID FROM AUTH STATE
    useEffect(() => {
        if (roleId && roleId !== selectedRoleId) {
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerificationGeneralInvoice(roleId));
        }
    }, [roleId, selectedRoleId, dispatch, userData]);

    useEffect(() => {
        if (selectedInvoiceData?.MOID && roleId) {
            const statusParams = {
                MOID: selectedInvoiceData.MOID,
                ROID: roleId,
                ChkAmt: selectedInvoiceData.InvoiceAmount || 0
            };
            dispatch(fetchStatusList(statusParams));
        }
    }, [selectedInvoiceData?.MOID, roleId, dispatch]);

    // FETCH REMARKS WHEN INVOICE IS SELECTED
    useEffect(() => {
        if (selectedInvoice?.InvoiceNo && selectedInvoiceData?.MOID) {
            dispatch(setSelectedTrno(selectedInvoice.InvoiceNo.toString()));
            dispatch(setSelectedMOID(selectedInvoiceData.MOID));
            dispatch(fetchRemarks({ trno: selectedInvoice.InvoiceNo.toString(), moid: selectedInvoiceData.MOID }));
        }
    }, [selectedInvoice?.InvoiceNo, selectedInvoiceData?.MOID, dispatch]);

    // Auto-collapse left panel when invoice is selected
    useEffect(() => {
        if (selectedInvoice) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedInvoice]);

    // HELPER FUNCTIONS
    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Invoice Approver';
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
        const amount = invoice.InvoiceAmount || 0;
        const status = parseInt(invoice.Status || 0);

        if (amount > 50000 || status === 1) return 'High';
        if (amount > 25000 || status === 2) return 'Medium';
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN');
        } catch {
            return dateString;
        }
    };

    // EVENT HANDLERS
    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleInvoiceSelect = async (invoice) => {
        setSelectedInvoice(invoice);
        dispatch(setSelectedInvNo(invoice.InvoiceNo.toString()));
        dispatch(setSelectedUserId(uid));

        try {
            await dispatch(fetchGeneralInvoiceByNo(invoice.InvoiceNo.toString())).unwrap();
        } catch (error) {
            console.error('Invoice Details API Error:', error);
        }

        // Reset states when new invoice is selected
        setShowRemarksHistory(false);
    };

    const buildInvoiceApprovalPayload = (actionValue, selectedInvoice, selectedInvoiceData, approvalComment) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            selectedInvoiceData?.ApprovalNote,
            currentRoleName,
            currentUser,
            approvalComment
        );

        // Build the InvData object (nested structure) - CRITICAL FIX
        const invData = {
            InvoiceNo: selectedInvoice.InvoiceNo,
            CostCenter: selectedInvoiceData?.CostCenter || '',
            DCACode: selectedInvoiceData?.DCACode || '',
            InvoiceAmount: selectedInvoiceData?.InvoiceAmount || 0,
            InvoiceDate: selectedInvoiceData?.InvoiceDate || '',
            Name: selectedInvoiceData?.Name || '',
            CreditSubDca: selectedInvoiceData?.CreditSubDca || '',
            DebitSubDca: selectedInvoiceData?.DebitSubDca || '',
            Balance: selectedInvoiceData?.Balance || 0,
            Id: selectedInvoiceData?.Id || 0,
            MOID: selectedInvoiceData?.MOID || 0,
        };

        // Build the main payload (matching working structure)
        const payload = {
            InvData: invData,  // ← CRITICAL: Nested structure required by backend
            
            // Approval fields
            Action: actionValue,
            ApprovalNote: approvalComment,
            
            // Flattened fields (duplicated from InvData for backend compatibility)
            CostCenter: selectedInvoiceData?.CostCenter || '',
            DCACode: selectedInvoiceData?.DCACode || '',
            InvoiceAmount: selectedInvoiceData?.InvoiceAmount || 0,
            InvoiceDate: selectedInvoiceData?.InvoiceDate || '',
            InvoiceNo: selectedInvoice.InvoiceNo,
            
            // User/Role metadata
            RoleId: roleId || selectedRoleId,
            Userid: uid,
            Createdby: getCurrentUser(),
            Remarks: updatedRemarks,
        };

        console.log('🔍 CORRECTED PAYLOAD STRUCTURE:', payload);
        console.log('📊 Payload matches working format:', {
            hasInvData: !!payload.InvData,
            invDataKeys: Object.keys(payload.InvData || {}),
            flattenedFields: ['Action', 'ApprovalNote', 'CostCenter', 'DCACode', 'InvoiceAmount'].filter(key => payload[key] !== undefined)
        });

        return payload;
    };

    const onActionClick = async (action) => {
        if (!selectedInvoice) {
            toast.error('No Invoice selected');
            return;
        }

        if (!approvalComment || approvalComment.trim() === '') {
            toast.error('Approval comment is mandatory. Please add your comments before proceeding.');
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

        try {
            const payload = buildInvoiceApprovalPayload(
                actionValue,
                selectedInvoice,
                selectedInvoiceData,
                approvalComment
            );

            const result = await dispatch(approveGeneralInvoice(payload)).unwrap();

            if (result && typeof result === 'string') {
                if (result.includes('$')) {
                    const [status, additionalInfo] = result.split('$');
                    toast.success(`${action.text} completed successfully!`);
                    if (additionalInfo) {
                        setTimeout(() => {
                            toast.info(additionalInfo, { autoClose: 6000 });
                        }, 500);
                    }
                } else {
                    toast.success(`${action.text} completed successfully!`);
                }
            } else {
                toast.success(`${action.text} completed successfully!`);
            }

            setTimeout(() => {
                dispatch(fetchVerificationGeneralInvoice(roleId || selectedRoleId));
                setSelectedInvoice(null);
                setApprovalComment('');
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetInvoiceData());
                dispatch(resetApprovalData());
            }, 1000);

        } catch (error) {
            let errorMessage = `Failed to ${action.text.toLowerCase()}`;

            if (error && typeof error === 'string') {
                errorMessage = `${error}`;
            } else if (error?.message) {
                errorMessage = `${error.message}`;
            }

            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    // RENDER REMARKS HISTORY
    const renderRemarksHistory = () => {
        if (!showRemarksHistory) return null;

        return (
            <div className="bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                        <UserCheck className="w-5 h-5 mr-2" />
                        Approval History ({remarks.length} Actions)
                    </h4>
                    <button
                        onClick={() => setShowRemarksHistory(false)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                </div>

                {remarksLoading ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                        <p className="text-gray-500">Loading remarks...</p>
                    </div>
                ) : remarks.length === 0 ? (
                    <div className="text-center py-4">
                        <FileX className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">No approval history found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {remarks.map((remark, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{remark.ActionBy}</span>
                                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-600">
                                                {remark.ActionRole}
                                            </span>
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-600">
                                                {remark.Action}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{remark.ActionRemarks}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // FILTER INVOICES BASED ON SEARCH AND FILTERS
    const filteredInvoices = verificationGeneralInvoices.filter(invoice => {
        const matchesSearch = invoice.InvoiceNo?.toString().includes(searchQuery) ||
            invoice.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.CostCenter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.InvoiceAmount?.toString().includes(searchQuery);

        const matchesStatus = filterStatus === 'All' || invoice.Status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const statuses = [...new Set(verificationGeneralInvoices.map(invoice => invoice.Status).filter(Boolean))];

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
                            if (selectedInvoiceData?.MOID && roleId) {
                                dispatch(fetchStatusList({
                                    MOID: selectedInvoiceData.MOID,
                                    ROID: roleId,
                                    ChkAmt: selectedInvoiceData.InvoiceAmount || 0
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
                    <div className="text-gray-500 mb-2">No actions available for this Invoice</div>
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

        const isDisabled = approvalLoading || approvalComment.trim() === '';

        return (
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Available Actions ({filteredActions.length})
                    </p>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className={`flex items-center space-x-1 text-sm ${approvalComment.trim() ? 'text-green-600' : 'text-orange-600'}`}>
                            <FileText className={`w-4 h-4 ${approvalComment.trim() ? 'text-green-600' : 'text-orange-600'}`} />
                            <span>Comments: {approvalComment.trim() ? 'Added' : 'Required'}</span>
                        </div>
                    </div>
                </div>

                <div className={`grid ${gridCols} gap-4`}>
                    {filteredActions.map((action, index) => {
                        const IconComponent = getActionIcon(action.type);

                        return (
                            <button
                                key={`${action.type}-${index}`}
                                onClick={() => onActionClick(action)}
                                disabled={isDisabled}
                                className={`
                                flex items-center justify-center space-x-2 px-6 py-4 
                                ${action.className} 
                                text-white rounded-lg transition-all 
                                disabled:opacity-50 disabled:cursor-not-allowed 
                                font-medium shadow-lg hover:shadow-xl
                                min-h-[60px]
                            `}
                                title={
                                    approvalComment.trim() === '' ? 'Please add approval comments first' :
                                        `${action.text} (${action.type}: ${action.value})`
                                }
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
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackToInbox}
                            className="p-2 text-blue-100 hover:text-white hover:bg-blue-500 rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-500 rounded-xl shadow-inner">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {InboxTitle || 'General Invoice Approval'}
                                </h1>
                                <p className="text-blue-100 mt-1">
                                    {ModuleDisplayName} • {verificationGeneralInvoices.length} Invoices pending
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-4 py-2 bg-blue-500 text-blue-100 text-sm rounded-full border border-blue-400">
                            Invoice Management
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full shadow-md">
                            {verificationGeneralInvoices.length} Pending
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-blue-200" />
                            <input
                                type="text"
                                placeholder="Search by invoice number, name, cost center, amount..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-blue-500/50 text-white placeholder-blue-200 border border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2.5 bg-blue-500/50 text-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
                        >
                            <option value="All">All Status</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>Status {status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{verificationGeneralInvoices.length}</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">Total Invoices</p>
                            </div>
                        </div>
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-3">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
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
                                    {verificationGeneralInvoices.filter(inv => getPriority(inv) === 'High').length}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">High Priority</p>
                            </div>
                        </div>
                        <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2 mt-3">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${verificationGeneralInvoices.length > 0 ? (verificationGeneralInvoices.filter(inv => getPriority(inv) === 'High').length / verificationGeneralInvoices.length) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 border border-indigo-200 dark:border-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{statuses.length}</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">Status Types</p>
                            </div>
                        </div>
                        <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2 mt-3">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 border border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                    ₹{formatIndianCurrency(verificationGeneralInvoices.reduce((sum, inv) => sum + (inv.InvoiceAmount || 0), 0))}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">Total Amount</p>
                            </div>
                        </div>
                        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mt-3">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Dynamic Grid Layout */}
            <div className={`grid gap-6 transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                ? 'grid-cols-1 lg:grid-cols-12'
                : 'grid-cols-1 lg:grid-cols-3'
                }`}>
                {/* Collapsible Invoices List */}
                <div className={`transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                    ? 'lg:col-span-1'
                    : 'lg:col-span-1'
                    }`}>
                    <div
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'w-16' : 'w-full'
                            }`}
                        onMouseEnter={() => setIsLeftPanelHovered(true)}
                        onMouseLeave={() => setIsLeftPanelHovered(false)}
                    >
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                {(isLeftPanelCollapsed && !isLeftPanelHovered) ? (
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                                            <Clock className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold transform -rotate-90 whitespace-nowrap">
                                            {filteredInvoices.length}
                                        </span>
                                        <button
                                            onClick={() => setIsLeftPanelCollapsed(false)}
                                            className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                                            title="Expand Panel"
                                        >
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                                                <Clock className="w-4 h-4 text-white" />
                                            </div>
                                            <span>Pending ({filteredInvoices.length})</span>
                                        </h2>
                                        <div className="flex items-center space-x-2">
                                            {selectedInvoice && (
                                                <button
                                                    onClick={() => setIsLeftPanelCollapsed(true)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="Collapse Panel"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    dispatch(fetchVerificationGeneralInvoice(roleId || selectedRoleId));
                                                }}
                                                className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                                                title="Refresh"
                                                disabled={invoicesLoading}
                                            >
                                                <RefreshCw className={`w-4 h-4 ${invoicesLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Invoice List Content */}
                        <div className={`p-4 max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'w-16' : 'w-full'
                            }`}>
                            {invoicesLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && <p className="text-gray-500">Loading...</p>}
                                </div>
                            ) : invoicesError ? (
                                <div className="text-center py-8">
                                    <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && (
                                        <>
                                            <p className="text-red-500 mb-2">Error loading data</p>
                                            <button
                                                onClick={() => {
                                                    dispatch(fetchVerificationGeneralInvoice(roleId || selectedRoleId));
                                                }}
                                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Retry
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : filteredInvoices.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && <p className="text-gray-500">No Invoices found!</p>}
                                </div>
                            ) : (
                                <div className={`space-y-3 ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'flex flex-col items-center' : ''}`}>
                                    {filteredInvoices.map((invoice) => {
                                        const priority = getPriority(invoice);
                                        const amountDisplay = getAmountDisplay(invoice.InvoiceAmount || 0);

                                        return (
                                            <div
                                                key={invoice.InvoiceNo}
                                                className={`rounded-xl cursor-pointer transition-all hover:shadow-md border-2 ${selectedInvoice?.InvoiceNo === invoice.InvoiceNo
                                                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 bg-white dark:bg-gray-800'
                                                    } ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'w-12 h-12 p-1' : ''}`}
                                                onClick={() => handleInvoiceSelect(invoice)}
                                                title={isLeftPanelCollapsed && !isLeftPanelHovered ? `Invoice: ${invoice.InvoiceNo}` : ''}
                                            >
                                                {(isLeftPanelCollapsed && !isLeftPanelHovered) ? (
                                                    <div className="w-full h-full rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                                        <Receipt className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-4">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className="relative">
                                                                <div className="w-12 h-12 rounded-full border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                                                    <Receipt className="w-5 h-5 text-blue-600" />
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                                    Invoice #{invoice.InvoiceNo}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 truncate">{invoice.Name || 'N/A'}</p>
                                                            </div>
                                                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(priority)}`}>
                                                                {priority}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center space-x-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span className="truncate">{formatDate(invoice.InvoiceDate)}</span>
                                                                </span>
                                                                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(invoice.Status)}`}>
                                                                    Status: {invoice.Status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-blue-600 dark:text-blue-400 font-medium">₹{amountDisplay.formatted}</span>
                                                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{invoice.CostCenter?.split(',')[0] || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-500 text-xs">
                                                                    <Hash className="w-3 h-3 inline mr-1" />
                                                                    {invoice.InvoiceNo}
                                                                </span>
                                                                <span className="text-gray-500 text-xs">
                                                                    Amount: ₹{formatIndianCurrency(invoice.InvoiceAmount)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Invoice Details Panel with Dynamic Width */}
                <div className={`transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                    ? 'lg:col-span-11'
                    : 'lg:col-span-2'
                    }`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors sticky top-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                                    <FileCheck className="w-4 h-4 text-white" />
                                </div>
                                <span>{selectedInvoice ? 'Invoice Approval' : 'Select an Invoice'}</span>
                            </h2>
                        </div>

                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {selectedInvoice ? (
                                <div className="space-y-6">
                                    {invoiceDataLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading detailed information...</p>
                                        </div>
                                    ) : selectedInvoiceData ? (
                                        <>
                                            {/* Enhanced Invoice Header */}
                                            <div className="p-6 rounded-xl border-2 bg-gradient-to-r from-indigo-50 via-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-700">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center shadow-lg">
                                                                <Receipt className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                                <CheckCircle className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                                                Invoice #{selectedInvoiceData.InvoiceNo}
                                                            </h3>
                                                            <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                                                                {selectedInvoiceData.Name || 'Invoice Approval'}
                                                            </p>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="px-3 py-1 text-sm rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-opacity-20 dark:border-opacity-50">
                                                                    General Invoice
                                                                </span>
                                                                <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(selectedInvoiceData.Status)}`}>
                                                                    Status: {selectedInvoiceData.Status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                                                            ₹{formatIndianCurrency(selectedInvoiceData.InvoiceAmount)}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Amount</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Date: {formatDate(selectedInvoiceData.InvoiceDate)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Invoice ID</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedInvoiceData.Id}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">MOID</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedInvoiceData.MOID}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Balance</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">₹{formatIndianCurrency(selectedInvoiceData.Balance || 0)}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Priority</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{getPriority(selectedInvoiceData)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cost Center & DCA Details */}
                                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                                                <h4 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center mb-4">
                                                    <CreditCardIcon className="w-5 h-5 mr-2" />
                                                    Cost Center & DCA Information
                                                </h4>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                                <Building2 className="w-4 h-4 mr-2" />
                                                                Cost Center Details
                                                            </h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Code:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceData.CostCenter?.split(',')[0] || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Name:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceData.CCName || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                                <CreditCard className="w-4 h-4 mr-2" />
                                                                DCA Information
                                                            </h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">DCA Code:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceData.DCACode || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">DCA Name:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceData.DCAName || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                                                Credit Sub DCA
                                                            </h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Code:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceData.CreditSubDca || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Name:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceData.CreditSubDCACodeName || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                                                Debit Sub DCA
                                                            </h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Code:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceData.DebitSubDca || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Name:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedInvoiceData.DebitSubDCACodeName || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Approval History Toggle */}
                                            <div className="bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => setShowRemarksHistory(!showRemarksHistory)}
                                                    className="flex items-center justify-between w-full text-left"
                                                >
                                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                                        <UserCheck className="w-5 h-5 mr-2" />
                                                        View Approval History ({remarks.length})
                                                    </h4>
                                                    {showRemarksHistory ? (
                                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Remarks History Section */}
                                            {renderRemarksHistory()}

                                            {/* Approval Comments */}
                                            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 rounded-xl border-2 border-red-200 dark:border-red-700">
                                                <label className="text-sm font-bold text-red-800 dark:text-red-200 mb-3 flex items-center">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    <span className="text-red-600 dark:text-red-400">*</span> Approval Comments (Mandatory)
                                                </label>
                                                <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                                                    Please review all invoice details, amounts, DCA information, and provide your approval decision.
                                                </p>
                                                <textarea
                                                    value={approvalComment}
                                                    onChange={(e) => setApprovalComment(e.target.value)}
                                                    className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 transition-all ${approvalComment.trim() === ''
                                                        ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                                        : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                                                        }`}
                                                    rows="4"
                                                    placeholder="Please review invoice amount, cost center allocation, DCA details, and accounting entries..."
                                                    required
                                                />
                                                {approvalComment.trim() === '' && (
                                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                                        Approval comment is required before proceeding
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
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading invoice details...</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Invoice Selected</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Select an Invoice from the list to view details and take action.
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

export default GeneralInvoiceApproval;