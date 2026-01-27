import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2, DollarSign,
    Calendar, TrendingUp, Hash, User,
    Percent, AlertCircle, PieChart,
    CalendarDays, Users, Coins, Calculator
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyDividendDeclaration,
    fetchDividendDeclarationByRefno,
    approveDividendDeclaration,
    setSelectedTransactionRefno,
    setSelectedRoleId,
    resetDividendDeclarationDetails,
    clearApprovalResult,
    selectVerifyDividendDeclarationInboxArray,
    selectDividendDeclarationDetails,
    selectVerifyDividendDeclarationLoading,
    selectDividendDeclarationDetailsLoading,
    selectApproveDividendDeclarationLoading,
    selectVerifyDividendDeclarationError,
    selectDividendDeclarationDetailsError,
    selectApprovalOperationStatus
} from '../../slices/capitalSlice/dividendDeclarationSlice';

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

const DividendDeclarationVerification = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const declarationInbox = useSelector(selectVerifyDividendDeclarationInboxArray);
    const inboxLoading = useSelector(selectVerifyDividendDeclarationLoading);
    const inboxError = useSelector(selectVerifyDividendDeclarationError);

    const declarationDetails = useSelector(selectDividendDeclarationDetails);
    const detailsLoading = useSelector(selectDividendDeclarationDetailsLoading);
    const detailsError = useSelector(selectDividendDeclarationDetailsError);

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
    const [filterYear, setFilterYear] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Extract unique values for filters
    const statuses = [...new Set(declarationInbox.map(item => item.Status))].filter(Boolean);
    const years = [...new Set(declarationInbox.map(item => item.FinancialYear))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Dividend Verifier';
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

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Format number (for shares)
    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    // Initialize - Fetch declaration inbox
    useEffect(() => {
        if (roleId) {
            console.log('💰 Initializing Dividend Declaration Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerifyDividendDeclaration(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetDividendDeclarationDetails());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch declaration details when item is selected
    useEffect(() => {
        if (selectedItem?.TransactionRefNo) {
            console.log('🔍 Fetching Declaration Details for RefNo:', selectedItem.TransactionRefNo);

            dispatch(setSelectedTransactionRefno(selectedItem.TransactionRefNo));
            dispatch(fetchDividendDeclarationByRefno(selectedItem.TransactionRefNo));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when declaration details are loaded
    useEffect(() => {
        if (selectedItem && roleId && declarationDetails) {
            const moid = declarationDetails?.MOID || 680;

            console.log('📊 Fetching Status List for MOID:', moid);
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: 0
            }));
        }
    }, [selectedItem, roleId, declarationDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && declarationDetails) {
            const moid = declarationDetails?.MOID || 680;

            console.log('💬 Fetching Remarks for MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: declarationDetails.TransactionRefNo?.toString() || selectedItem.TransactionRefNo?.toString() || '',
                moid: moid
            }));
        }
    }, [selectedItem, declarationDetails, dispatch]);

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
            console.log('🔄 Refreshing Dividend Declaration list');
            dispatch(fetchVerifyDividendDeclaration(roleId));

            if (selectedItem?.TransactionRefNo) {
                dispatch(fetchDividendDeclarationByRefno(selectedItem.TransactionRefNo));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected Declaration Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();

        const payload = {
            transactionRefno: selectedItem?.TransactionRefNo || declarationDetails?.TransactionRefNo,
            roleid: roleId,
            action: actionValue,
            note: verificationComment.trim(),
            createdby: currentUser
        };

        console.log('📤 Dividend Declaration Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No dividend declaration selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the declaration details by checking the verification checkbox.');
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

            const result = await dispatch(approveDividendDeclaration(payload)).unwrap();

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
                dispatch(fetchVerifyDividendDeclaration(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetDividendDeclarationDetails());
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

    const filteredItems = declarationInbox.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.TransactionRefNo?.toString().includes(searchQuery) ||
            item.FinancialYear?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Status?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;
        const matchesYear = filterYear === 'All' || item.FinancialYear === filterYear;

        return matchesSearch && matchesStatus && matchesYear;
    });

    const statsCards = [
        {
            icon: DollarSign,
            value: declarationInbox.length,
            label: 'Total Declarations',
            color: 'green'
        },
        {
            icon: Clock,
            value: declarationInbox.length,
            label: 'Pending Verification',
            color: 'orange'
        },
        {
            icon: Calendar,
            value: declarationDetails?.FinancialYear || '-',
            label: 'Financial Year',
            color: 'blue'
        },
        {
            icon: Percent,
            value: declarationDetails?.DividendPercentage ? `${declarationDetails.DividendPercentage}%` : '-',
            label: 'Dividend Rate',
            color: 'purple'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-green-200 dark:border-green-600 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.FinancialYear}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Ref: {item.TransactionRefNo}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>₹{formatCurrency(item.TotalDividendAmount || 0)}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.DeclarationDate}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                            {item.DividendPercentage}%
                        </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                        <Users className="w-3 h-3" />
                        <span className="truncate">{formatNumber(item.TotalShares || 0)} shares</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-green-200 dark:border-green-600 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
    );

    const renderDeclarationDetailsGrid = () => {
        if (!declarationDetails) return null;

        const detailItems = [
            { label: 'Transaction Reference', value: declarationDetails.TransactionRefNo || '-', icon: Hash },
            { label: 'Financial Year', value: declarationDetails.FinancialYear || '-', icon: Calendar },
            { label: 'Declaration Date', value: declarationDetails.DeclarationDate || '-', icon: CalendarDays },
            { label: 'Net Profit After Tax', value: `₹${formatCurrency(declarationDetails.NetProfitAfterTax || 0)}`, icon: TrendingUp },
            { label: 'Dividend Percentage', value: `${declarationDetails.DividendPercentage || 0}%`, icon: Percent },
            { label: 'Total Dividend Amount', value: `₹${formatCurrency(declarationDetails.TotalDividendAmount || 0)}`, icon: DollarSign },
            { label: 'Total Shares', value: formatNumber(declarationDetails.TotalShares || 0), icon: Users },
            { label: 'Per Share Value', value: `₹${formatCurrency(declarationDetails.PerShareValue || 0)}`, icon: Coins },
            { label: 'Dividend Balance', value: `₹${formatCurrency(declarationDetails.DividendBalance || 0)}`, icon: PieChart },
            { label: 'Status', value: declarationDetails.Status || '-', icon: CheckCircle2 },
            { label: 'Created By', value: declarationDetails.CreatedBy || '-', icon: User },
            { label: 'Created Date', value: declarationDetails.CreatedDate || '-', icon: Calendar }
        ];

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Declaration Details
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {detailItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                <div className="flex items-center space-x-2 mb-2">
                                    <IconComponent className="w-4 h-4 text-green-600 dark:text-green-400" />
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

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = declarationDetails || selectedItem;
        const hasDetailedData = !!declarationDetails;

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                            <span className="text-green-700 dark:text-green-400 text-sm">
                                Loading declaration details...
                            </span>
                        </div>
                    </div>
                )}

                {/* CUSTOM HEADER */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                    <DollarSign className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <Percent className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.FinancialYear} Dividend Declaration
                                </h2>
                                <p className="text-green-600 dark:text-green-400 font-semibold mb-3">
                                    Ref: {displayData.TransactionRefNo}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                        {displayData.DividendPercentage}% Dividend
                                    </span>
                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                                        ₹{formatCurrency(displayData.TotalDividendAmount || 0)}
                                    </span>
                                    {hasDetailedData && displayData.Status && (
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                            {displayData.Status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && displayData.DeclarationDate && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Declaration Date</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {displayData.DeclarationDate}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-green-200 dark:border-green-700">
                        {hasDetailedData && displayData.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {displayData.MOID}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Shares</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatNumber(displayData.TotalShares || 0)}
                            </p>
                        </div>
                        {hasDetailedData && displayData.PerShareValue && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Per Share Value</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    ₹{formatCurrency(displayData.PerShareValue)}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && displayData.DividendBalance && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Balance</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    ₹{formatCurrency(displayData.DividendBalance)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Declaration Details Grid */}
                {hasDetailedData && renderDeclarationDetailsGrid()}

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
                        checkboxLabel: '✓ I have verified all dividend declaration details',
                        checkboxDescription: 'Including financial year, profit figures, dividend percentage, and calculated values accuracy',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify dividend declaration details, calculations, and any discrepancies...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentBorder: 'border-green-200 dark:border-green-700'
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
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
                            ℹ️ No actions available for this declaration
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
                title={`${InboxTitle || 'Dividend Declaration Verification'} (${declarationInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={declarationInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={DollarSign}
                badgeText="Dividend Verification"
                badgeCount={declarationInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by ref no, financial year, status...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterYear,
                        onChange: (e) => setFilterYear(e.target.value),
                        defaultLabel: 'All Years',
                        options: years
                    },
                    {
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        defaultLabel: 'All Status',
                        options: statuses
                    }
                ]}
                className="bg-gradient-to-r from-green-600 via-emerald-500 to-emerald-600"
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
                                emptyMessage: 'No dividend declarations found!',
                                itemKey: 'TransactionRefNo',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
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
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                        <DollarSign className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'Declaration Verification' : 'Declaration Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <DollarSign className="w-12 h-12 text-green-500 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Declaration Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a dividend declaration from the list to view details and verify.
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

export default DividendDeclarationVerification;