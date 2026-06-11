import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock,  Users,
    Calendar, Hash, DollarSign,
    CalendarDays,  Banknote,
    Receipt} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyCMSPay,
    fetchCMSDataByTransNo,
    approveCMSPay,
    setSelectedRoleId,
    setSelectedCMSTransactionNo,
    setSelectedConsolidateNo,
    setSelectedTransactionRefno,
    resetCMSPayDetails,
    resetCMSPayVerificationData,
    clearApprovalResult,
    selectVerifyCMSPayInboxArray,
    selectCMSPayDetails,
    selectCMSReportDataArray,
    selectVerifyCMSPayLoading,
    selectCMSPayDetailsLoading,
    selectApproveCMSPayLoading,
    selectVerifyCMSPayError,
    selectCMSPayDetailsError,
    selectApprovalResult
} from '../../slices/HRSlice/staffCMSPayVerificationSlice';

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

const VerifyStaffCMSPay = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const cmsPayInbox = useSelector(selectVerifyCMSPayInboxArray);
    const inboxLoading = useSelector(selectVerifyCMSPayLoading);
    const inboxError = useSelector(selectVerifyCMSPayError);

    const cmsPayDetails = useSelector(selectCMSPayDetails);
    const cmsReportData = useSelector(selectCMSReportDataArray);
    const detailsLoading = useSelector(selectCMSPayDetailsLoading);
    const detailsError = useSelector(selectCMSPayDetailsError);

    const approvalLoading = useSelector(selectApproveCMSPayLoading);
    const approvalResult = useSelector(selectApprovalResult);

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
    const [filterMonth, setFilterMonth] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Extract unique values for filters
    const months = [...new Set(cmsPayInbox.map(item => item.Month))].filter(Boolean);
    const years = [...new Set(cmsPayInbox.map(item => item.Year))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'CMS Pay Verifier';
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

    // Initialize - Fetch CMS pay inbox
    useEffect(() => {
        if (roleId) {
            console.log('💰 Initializing CMS Pay Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerifyCMSPay(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetCMSPayVerificationData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch CMS pay details when item is selected
    useEffect(() => {
        if (selectedItem) {
            console.log('🔍 Fetching CMS Pay Details for:', selectedItem);

            const params = {
                cmsTransactionNo: selectedItem.CMSTransactionNo,
                consolidateNo: selectedItem.ConsolidateNo,
                transactionRefno: selectedItem.TransactionRefno,
                month: selectedItem.EffectiveMonth,
                year: selectedItem.Year
            };

            dispatch(setSelectedCMSTransactionNo(selectedItem.CMSTransactionNo));
            dispatch(setSelectedConsolidateNo(selectedItem.ConsolidateNo));
            dispatch(setSelectedTransactionRefno(selectedItem.TransactionRefno));
            dispatch(fetchCMSDataByTransNo(params));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when CMS pay details are loaded
    useEffect(() => {
        if (selectedItem && roleId && cmsPayDetails) {
            const moid = cmsPayDetails?.MOID || 528;

            console.log('📊 Fetching Status List for MOID:', moid);
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: cmsPayDetails?.Total || 0
            }));
        }
    }, [selectedItem, roleId, cmsPayDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && cmsPayDetails) {
            const moid = cmsPayDetails?.MOID || 528;

            console.log('💬 Fetching Remarks for MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: cmsPayDetails.CMSTransactionNo?.toString() || selectedItem.CMSTransactionNo?.toString() || '',
                moid: moid
            }));
        }
    }, [selectedItem, cmsPayDetails, dispatch]);

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
            console.log('🔄 Refreshing CMS Pay list');
            dispatch(fetchVerifyCMSPay(roleId));

            if (selectedItem) {
                const params = {
                    cmsTransactionNo: selectedItem.CMSTransactionNo,
                    consolidateNo: selectedItem.ConsolidateNo,
                    transactionRefno: selectedItem.TransactionRefno,
                    month: selectedItem.EffectiveMonth,
                    year: selectedItem.Year
                };
                dispatch(fetchCMSDataByTransNo(params));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected CMS Pay Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();

        const payload = {
            cmsTransactionNo: cmsPayDetails?.CMSTransactionNo || selectedItem?.CMSTransactionNo || '',
            transactionRefno: cmsPayDetails?.TransactionRefno || selectedItem?.TransactionRefno || '',
            consolidateNo: cmsPayDetails?.ConsolidateNo || selectedItem?.ConsolidateNo || '',
            roleId: roleId,
            action: actionValue,
            note: verificationComment.trim(),
            createdBy: currentUser
        };

        console.log('📤 CMS Pay Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No CMS pay record selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the CMS payment details by checking the verification checkbox.');
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

            const result = await dispatch(approveCMSPay(payload)).unwrap();

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
                dispatch(fetchVerifyCMSPay(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetCMSPayDetails());
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

    const filteredItems = cmsPayInbox.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.CMSTransactionNo?.toString().includes(searchQuery) ||
            item.TransactionRefno?.toString().includes(searchQuery) ||
            item.ConsolidateNo?.toString().includes(searchQuery) ||
            item.Month?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMonth = filterMonth === 'All' || item.Month === filterMonth;
        const matchesYear = filterYear === 'All' || item.Year === filterYear;

        return matchesSearch && matchesMonth && matchesYear;
    });

    const statsCards = [
        {
            icon: Receipt,
            value: cmsPayInbox.length,
            label: 'Total Records',
            color: 'blue'
        },
        {
            icon: Clock,
            value: cmsPayInbox.length,
            label: 'Pending Verification',
            color: 'purple'
        },
        {
            icon: DollarSign,
            value: cmsPayDetails?.Total ? `₹${cmsPayDetails.Total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-',
            label: 'Total Amount',
            color: 'indigo'
        },
        {
            icon: Users,
            value: cmsReportData?.length || 0,
            label: 'Beneficiaries',
            color: 'violet'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            CMS: {item.CMSTransactionNo}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Consolidate: {item.ConsolidateNo}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span className="truncate">{item.TransactionRefno}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.Month} {item.Year}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            ₹{item.Total?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    const renderCMSDetailsGrid = () => {
        if (!cmsPayDetails) return null;

        const detailItems = [
            { label: 'CMS Transaction No', value: cmsPayDetails.CMSTransactionNo || '-', icon: Hash },
            { label: 'Consolidate No', value: cmsPayDetails.ConsolidateNo || '-', icon: Hash },
            { label: 'Transaction Ref No', value: cmsPayDetails.TransactionRefno || '-', icon: Hash },
            { label: 'Month', value: cmsPayDetails.Month || '-', icon: Calendar },
            { label: 'Year', value: cmsPayDetails.Year || '-', icon: Calendar },
            { label: 'Effective Month', value: cmsPayDetails.EffectiveMonth || '-', icon: CalendarDays },
            { label: 'Total Amount', value: cmsPayDetails.Total ? `₹${cmsPayDetails.Total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-', icon: DollarSign },
            { label: 'CMS ID', value: cmsPayDetails.CMSId || '-', icon: Hash },
            { label: 'MOID', value: cmsPayDetails.MOID || '-', icon: Hash }
        ];

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        CMS Payment Details
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {detailItems.map((item, index) => {
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

    const renderBeneficiariesTable = () => {
        if (!cmsReportData || cmsReportData.length === 0) return null;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Beneficiary Payment Details ({cmsReportData.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Emp Ref No
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Beneficiary Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Account No
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    IFSC
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {cmsReportData.map((beneficiary, index) => (
                                <tr key={index} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {beneficiary.Emprefno || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {beneficiary.BeneficiaryName || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                                        {beneficiary.BeneficiaryAcNo || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                                        {beneficiary.IFSC || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right text-green-600 dark:text-green-400">
                                        ₹{parseFloat(beneficiary.Amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {beneficiary.Date || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                            <tr>
                                <td colSpan="4" className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                                    Total:
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                                    ₹{cmsReportData.reduce((sum, b) => sum + parseFloat(b.Amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = cmsPayDetails || selectedItem;
        const hasDetailedData = !!cmsPayDetails;

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading CMS payment details...
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
                                    <Receipt className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <Banknote className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    CMS Payment Verification
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                                    CMS: {displayData.CMSTransactionNo} • Consolidate: {displayData.ConsolidateNo}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                        {displayData.Month} {displayData.Year}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                        Transaction: {displayData.TransactionRefno}
                                    </span>
                                    {hasDetailedData && cmsReportData.length > 0 && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                            {cmsReportData.length} Beneficiaries
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {displayData.Total > 0 && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    ₹{displayData.Total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
                        {hasDetailedData && displayData.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {displayData.MOID}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && displayData.CMSId && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CMS ID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {displayData.CMSId}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Effective Month</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.EffectiveMonth || '-'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Beneficiaries</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {cmsReportData.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CMS Details Grid */}
                {hasDetailedData && renderCMSDetailsGrid()}

                {/* Beneficiaries Table */}
                {hasDetailedData && renderBeneficiariesTable()}

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
                        checkboxLabel: '✓ I have verified all CMS payment details and beneficiary information',
                        checkboxDescription: 'Including transaction numbers, consolidation details, beneficiary accounts, IFSC codes, amounts, and payment dates accuracy',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify CMS payment details, beneficiary information, account numbers, amounts, and any discrepancies...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
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
                            ℹ️ No actions available for this CMS payment record
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
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'CMS Payment Verification'} (${cmsPayInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={cmsPayInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Receipt}
                badgeText="CMS Pay Verification"
                badgeCount={cmsPayInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by CMS transaction, consolidate no, payroll ref...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterMonth,
                        onChange: (e) => setFilterMonth(e.target.value),
                        defaultLabel: 'All Months',
                        options: months
                    },
                    {
                        value: filterYear,
                        onChange: (e) => setFilterYear(e.target.value),
                        defaultLabel: 'All Years',
                        options: years
                    }
                ]}
            />

            <div className="px-6 -mt-auto mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

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
                                emptyMessage: 'No CMS payment records found!',
                                itemKey: 'CMSTransactionNo',
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
                                        <Receipt className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'CMS Payment Verification' : 'CMS Payment Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No CMS Payment Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a CMS payment record from the list to view details and verify payment information.
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

export default VerifyStaffCMSPay;