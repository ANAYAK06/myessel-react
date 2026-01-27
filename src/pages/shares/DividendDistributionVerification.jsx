import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2, DollarSign,
    Calendar, TrendingUp, Hash, User,
    Percent,
    CalendarDays, Users, Coins, Calculator,
    Layers, CreditCard, Mail,
    Phone, Landmark, Shield
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyDividendDistribution,
    fetchDividendDistributionByRefno,
    approveDividendDistribution,
    setSelectedTransactionRefno,
    setSelectedRoleId,
    resetDividendDistributionDetails,
    clearApprovalResult,
    selectVerifyDividendDistributionInboxArray,
    selectDividendDistributionDetails,
    selectVerifyDividendDistributionLoading,
    selectDividendDistributionDetailsLoading,
    selectApproveDividendDistributionLoading,
    selectVerifyDividendDistributionError,
    selectDividendDistributionDetailsError,
    selectApprovalOperationStatus
} from '../../slices/capitalSlice/dividendDistributionSlice';

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

const DividendDistributionVerification = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const distributionInbox = useSelector(selectVerifyDividendDistributionInboxArray);
    const inboxLoading = useSelector(selectVerifyDividendDistributionLoading);
    const inboxError = useSelector(selectVerifyDividendDistributionError);

    const distributionDetails = useSelector(selectDividendDistributionDetails);
    const detailsLoading = useSelector(selectDividendDistributionDetailsLoading);
    const detailsError = useSelector(selectDividendDistributionDetailsError);

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
    const statuses = [...new Set(distributionInbox.map(item => item.Status))].filter(Boolean);
    const years = [...new Set(distributionInbox.map(item => item.FinancialYear))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Dividend Distribution Verifier';
    };

    const formatApprovalComment = (roleName, userName, comment) => {
        return `${roleName} : ${userName} : ${comment}`;
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

    // Initialize - Fetch distribution inbox
    useEffect(() => {
        if (roleId) {
            console.log('💰 Initializing Dividend Distribution Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerifyDividendDistribution(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetDividendDistributionDetails());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch distribution details when item is selected
    useEffect(() => {
        if (selectedItem?.TransactionRefNo) {
            console.log('🔍 Fetching Distribution Details for RefNo:', selectedItem.TransactionRefNo);

            dispatch(setSelectedTransactionRefno(selectedItem.TransactionRefNo));
            dispatch(fetchDividendDistributionByRefno(selectedItem.TransactionRefNo));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when distribution details are loaded
    useEffect(() => {
        if (selectedItem && roleId && distributionDetails?.master) {
            const moid = distributionDetails.master?.MOID || 684;

            console.log('📊 Fetching Status List for MOID:', moid);
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: 0
            }));
        }
    }, [selectedItem, roleId, distributionDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && distributionDetails?.master) {
            const moid = distributionDetails.master?.MOID || 684;

            console.log('💬 Fetching Remarks for MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: distributionDetails.master.TransactionRefNo?.toString() || selectedItem.TransactionRefNo?.toString() || '',
                moid: moid
            }));
        }
    }, [selectedItem, distributionDetails, dispatch]);

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
            console.log('🔄 Refreshing Dividend Distribution list');
            dispatch(fetchVerifyDividendDistribution(roleId));

            if (selectedItem?.TransactionRefNo) {
                dispatch(fetchDividendDistributionByRefno(selectedItem.TransactionRefNo));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected Distribution Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();

        const payload = {
            transactionRefno: selectedItem?.TransactionRefNo || distributionDetails?.master?.TransactionRefNo,
            roleid: roleId,
            action: actionValue,
            note: verificationComment.trim(),
            createdby: currentUser
        };

        console.log('📤 Dividend Distribution Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No dividend distribution selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the distribution details by checking the verification checkbox.');
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

            const result = await dispatch(approveDividendDistribution(payload)).unwrap();

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
                dispatch(fetchVerifyDividendDistribution(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetDividendDistributionDetails());
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

    const filteredItems = distributionInbox.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.TransactionRefNo?.toString().includes(searchQuery) ||
            item.FinancialYear?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.LotName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Status?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;
        const matchesYear = filterYear === 'All' || item.FinancialYear === filterYear;

        return matchesSearch && matchesStatus && matchesYear;
    });

    const statsCards = [
        {
            icon: Layers,
            value: distributionInbox.length,
            label: 'Total Distributions',
            color: 'blue'
        },
        {
            icon: Clock,
            value: distributionInbox.length,
            label: 'Pending Verification',
            color: 'orange'
        },
        {
            icon: Users,
            value: distributionDetails?.master?.ShareholderCount || '-',
            label: 'Shareholders',
            color: 'purple'
        },
        {
            icon: Percent,
            value: distributionDetails?.master?.TDSPercentage ? `${distributionDetails.master.TDSPercentage}%` : '-',
            label: 'TDS Rate',
            color: 'indigo'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white dark:border-gray-800"></div>
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
                            <span>₹{formatCurrency(item.NetPayableAmount || 0)}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {item.TDSPercentage}% TDS
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.FinancialYear}</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                        <Users className="w-3 h-3" />
                        <span className="truncate">{item.ShareholderCount} shareholders</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50 flex items-center justify-center">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    const renderDistributionMasterGrid = () => {
        if (!distributionDetails?.master) return null;

        const master = distributionDetails.master;

        const masterItems = [
            { label: 'Transaction Reference', value: master.TransactionRefNo || '-', icon: Hash },
            { label: 'Financial Year', value: master.FinancialYear || '-', icon: Calendar },
            { label: 'Lot Name', value: master.LotName || '-', icon: Layers },
            { label: 'Total Shares in Lot', value: formatNumber(master.TotalSharesInLot || 0), icon: Users },
            { label: 'Per Share Value', value: `₹${formatCurrency(master.PerShareValue || 0)}`, icon: Coins },
            { label: 'Gross Dividend Amount', value: `₹${formatCurrency(master.GrossDividendAmount || 0)}`, icon: TrendingUp },
            { label: 'TDS Percentage', value: `${master.TDSPercentage || 0}%`, icon: Percent },
            { label: 'Total TDS Amount', value: `₹${formatCurrency(master.TotalTDSAmount || 0)}`, icon: Calculator },
            { label: 'Net Payable Amount', value: `₹${formatCurrency(master.NetPayableAmount || 0)}`, icon: DollarSign },
            { label: 'Shareholder Count', value: master.ShareholderCount || '0', icon: Users },
            { label: 'Status', value: master.Status || '-', icon: CheckCircle2 },
            { label: 'Created By', value: master.CreatedBy || '-', icon: User },
            { label: 'Created Date', value: master.CreatedDate || '-', icon: CalendarDays }
        ];

        if (master.LotDescription && master.LotDescription.trim() !== '') {
            masterItems.splice(3, 0, { 
                label: 'Lot Description', 
                value: master.LotDescription, 
                icon: FileText 
            });
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Distribution Master Details
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {masterItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
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

    const renderShareholderDetailsTable = () => {
        if (!distributionDetails?.details || distributionDetails.details.length === 0) {
            return null;
        }

        const details = distributionDetails.details;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Shareholder Distribution Details ({details.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b-2 border-blue-200 dark:border-blue-700">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Shareholder Name</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Shares</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Per Share</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Gross Amount</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">TDS</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">TDS Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Net Payable</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Bank Details</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.map((detail, index) => (
                                <tr 
                                    key={detail.DetailId || index} 
                                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            detail.ShareholderType === 'Promoter' 
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        }`}>
                                            {detail.ShareholderType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                        {detail.ShareholderName}
                                        {detail.PANNumber && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-1">
                                                <Shield className="w-3 h-3" />
                                                <span>PAN: {detail.PANNumber}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                                        {formatNumber(detail.NoOfShares)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                                        ₹{formatCurrency(detail.PerShareValue)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-semibold">
                                        ₹{formatCurrency(detail.GrossDividendAmount)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {detail.IsTDSApplicable ? (
                                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                                                {detail.TDSPercentage}%
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                                                N/A
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-400">
                                        ₹{formatCurrency(detail.TDSAmount)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-bold">
                                        ₹{formatCurrency(detail.NetPayableAmount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs space-y-1">
                                            <div className="flex items-center space-x-1 text-gray-700 dark:text-gray-300">
                                                <Landmark className="w-3 h-3" />
                                                <span className="font-medium">{detail.BankName}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                                                <CreditCard className="w-3 h-3" />
                                                <span>{detail.AccountNumber}</span>
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-500">
                                                IFSC: {detail.IFSCCode}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs space-y-1">
                                            {detail.EmailId && (
                                                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">{detail.EmailId}</span>
                                                </div>
                                            )}
                                            {detail.MobileNumber && (
                                                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{detail.MobileNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                            <tr className="border-t-2 border-blue-300 dark:border-blue-600">
                                <td colSpan="2" className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                                    TOTAL ({details.length} shareholders)
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                    {formatNumber(details.reduce((sum, d) => sum + (d.NoOfShares || 0), 0))}
                                </td>
                                <td className="px-4 py-3"></td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                    ₹{formatCurrency(details.reduce((sum, d) => sum + (d.GrossDividendAmount || 0), 0))}
                                </td>
                                <td className="px-4 py-3"></td>
                                <td className="px-4 py-3 text-right font-bold text-orange-600 dark:text-orange-400">
                                    ₹{formatCurrency(details.reduce((sum, d) => sum + (d.TDSAmount || 0), 0))}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                                    ₹{formatCurrency(details.reduce((sum, d) => sum + (d.NetPayableAmount || 0), 0))}
                                </td>
                                <td colSpan="2" className="px-4 py-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = distributionDetails?.master || selectedItem;
        const hasDetailedData = !!distributionDetails?.master;

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading distribution details...
                            </span>
                        </div>
                    </div>
                )}

                {/* CUSTOM HEADER */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <Layers className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <Percent className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.LotName || 'Distribution Lot'}
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                                    Ref: {displayData.TransactionRefNo} • FY {displayData.FinancialYear}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                        {displayData.TDSPercentage}% TDS
                                    </span>
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        ₹{formatCurrency(displayData.NetPayableAmount || 0)} Net
                                    </span>
                                    {hasDetailedData && displayData.ShareholderCount && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            {displayData.ShareholderCount} Shareholders
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

                        {hasDetailedData && displayData.CreatedDate && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created Date</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {displayData.CreatedDate}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
                        {hasDetailedData && displayData.TotalSharesInLot && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Shares</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {formatNumber(displayData.TotalSharesInLot)}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && displayData.GrossDividendAmount && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gross Amount</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    ₹{formatCurrency(displayData.GrossDividendAmount)}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && displayData.TotalTDSAmount && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TDS Amount</p>
                                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                    ₹{formatCurrency(displayData.TotalTDSAmount)}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && displayData.PerShareValue && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Per Share Value</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    ₹{formatCurrency(displayData.PerShareValue)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Distribution Master Details Grid */}
                {hasDetailedData && renderDistributionMasterGrid()}

                {/* Shareholder Details Table */}
                {hasDetailedData && renderShareholderDetailsTable()}

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
                        checkboxLabel: '✓ I have verified all dividend distribution details',
                        checkboxDescription: 'Including shareholder details, TDS calculations, bank account information, and payment accuracy',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify distribution details, shareholder data, TDS calculations, and any discrepancies...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
                        commentGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
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
                            ℹ️ No actions available for this distribution
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
                title={`${InboxTitle || 'Dividend Distribution Verification'} (${distributionInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={distributionInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Layers}
                badgeText="Distribution Verification"
                badgeCount={distributionInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by ref no, lot name, financial year...',
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
                className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"
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
                                emptyMessage: 'No dividend distributions found!',
                                itemKey: 'TransactionRefNo',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
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
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                        <Layers className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'Distribution Verification' : 'Distribution Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Layers className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Distribution Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a dividend distribution from the list to view details and verify.
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

export default DividendDistributionVerification;