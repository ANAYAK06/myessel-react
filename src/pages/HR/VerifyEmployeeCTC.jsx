import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2, Users,
    Calendar, Building2, Hash, User,
    TrendingUp, AlertCircle, Award,
    CalendarDays, UserCheck, Briefcase, DollarSign,
    TrendingDown, TrendingUp as TrendingUpIcon, Wallet
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyNewEmpCTC,
    fetchNewEmpCTCbyRefno,
    approveNewEmpCTC,
    setSelectedTransactionRefno,
    setSelectedRoleId,
    resetCTCDetails,
    resetEmployeeCTCData,
    clearApprovalResult,
    selectVerifyNewEmpCTCInboxArray,
    selectCTCDetails,
    selectVerifyNewEmpCTCLoading,
    selectCTCDetailsLoading,
    selectApproveNewEmpCTCLoading,
    selectVerifyNewEmpCTCError,
    selectCTCDetailsError,
    selectApprovalResult
} from '../../slices/HRSlice/employeeCTCSlice';

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

const VerifyEmployeeCTC = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const ctcInbox = useSelector(selectVerifyNewEmpCTCInboxArray);
    const inboxLoading = useSelector(selectVerifyNewEmpCTCLoading);
    const inboxError = useSelector(selectVerifyNewEmpCTCError);

    const ctcDetails = useSelector(selectCTCDetails);
    const detailsLoading = useSelector(selectCTCDetailsLoading);
    const detailsError = useSelector(selectCTCDetailsError);

    const approvalLoading = useSelector(selectApproveNewEmpCTCLoading);
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
    const [filterCategory, setFilterCategory] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Extract unique values for filters
    const months = [...new Set(ctcInbox.map(item => item.MonthName))].filter(Boolean);
    const categories = [...new Set(ctcInbox.map(item => item.Category))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'CTC Verifier';
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

    // Initialize - Fetch CTC inbox
    useEffect(() => {
        if (roleId) {
            console.log('🎯 Initializing Employee CTC Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerifyNewEmpCTC(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetEmployeeCTCData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch CTC details when item is selected
    useEffect(() => {
        if (selectedItem?.TransactionRefno) {
            console.log('🔍 Fetching CTC Details for TransactionRefno:', selectedItem.TransactionRefno);

            dispatch(setSelectedTransactionRefno(selectedItem.TransactionRefno));
            dispatch(fetchNewEmpCTCbyRefno(selectedItem.TransactionRefno));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when CTC details are loaded
    useEffect(() => {
        if (selectedItem && roleId && ctcDetails) {
            const moid = ctcDetails?.MOID || 510;

            console.log('📊 Fetching Status List for MOID:', moid);
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: 0
            }));
        }
    }, [selectedItem, roleId, ctcDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && ctcDetails) {
            const moid = ctcDetails?.MOID || 510;

            console.log('💬 Fetching Remarks for MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: ctcDetails.TransactionRefno || selectedItem.TransactionRefno || '',
                moid: moid
            }));
        }
    }, [selectedItem, ctcDetails, dispatch]);

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
            console.log('🔄 Refreshing Employee CTC list');
            dispatch(fetchVerifyNewEmpCTC(roleId));

            if (selectedItem?.TransactionRefno) {
                dispatch(fetchNewEmpCTCbyRefno(selectedItem.TransactionRefno));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected CTC Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            ctcDetails?.Remarks || '',
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        // Extract data from ctcDetails
        const emprefno = ctcDetails?.Emprefno || selectedItem?.Emprefno || '';
        const transactionRefno = ctcDetails?.TransactionRefno || selectedItem?.TransactionRefno || '';
        const month = ctcDetails?.Month || selectedItem?.Month || 0;
        const year = ctcDetails?.Year || selectedItem?.Year || 0;
        const headsJsonString = ctcDetails?.HeadsJsonString || '';

        const payload = {
            Emprefno: emprefno,
            Month: month,
            Year: year,
            TransactionRefno: transactionRefno,
            HeadsJsonString: headsJsonString,
            Roleid: roleId,
            CreatedBy: currentUser,
            Action: actionValue,
            Note: verificationComment.trim()
        };

        console.log('📤 Employee CTC Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No CTC record selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the CTC details by checking the verification checkbox.');
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

            const result = await dispatch(approveNewEmpCTC(payload)).unwrap();

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
                dispatch(fetchVerifyNewEmpCTC(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetCTCDetails());
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

    const filteredItems = ctcInbox.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.TransactionRefno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.EmpName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Emprefno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Category?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMonth = filterMonth === 'All' || item.MonthName === filterMonth;
        const matchesCategory = filterCategory === 'All' || item.Category === filterCategory;

        return matchesSearch && matchesMonth && matchesCategory;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const statsCards = [
        {
            icon: DollarSign,
            value: ctcInbox.length,
            label: 'Total Records',
            color: 'blue'
        },
        {
            icon: Clock,
            value: ctcInbox.length,
            label: 'Pending Verification',
            color: 'purple'
        },
        {
            icon: Wallet,
            value: ctcDetails ? formatCurrency(ctcDetails.CTCTotal || ctcDetails.HeadsList?.find(h => h.HeadType === 'CTCTOTAL')?.YearlyAmount || 0) : '-',
            label: 'Annual CTC',
            color: 'indigo'
        },
        {
            icon: Calendar,
            value: ctcDetails?.MonthName || '-',
            label: 'Month',
            color: 'violet'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.EmpName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.Emprefno}
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
                            <span>{item.MonthName} {item.Year}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            CTC
                        </span>
                    </div>
                    {item.Category && (
                        <div className="flex items-center space-x-1 mt-1">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate text-xs">{item.Category}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    const renderCTCBreakdown = () => {
        if (!ctcDetails?.HeadsList || ctcDetails.HeadsList.length === 0) return null;

        // Group items by MainHead sections
        const groupedHeads = [];
        let currentGroup = null;

        ctcDetails.HeadsList.forEach((head) => {
            if (head.MainHead && head.MainHead.trim() !== '') {
                // This is a section header with the first item
                currentGroup = {
                    mainHead: head.MainHead,
                    items: [head]
                };
                groupedHeads.push(currentGroup);
            } else if (currentGroup) {
                // Check if this is a total row (should close the current group)
                if (head.HeadType && (
                    head.HeadType === 'GROSSSALARY' ||
                    head.HeadType === 'DEDUCTIONTOTAL' ||
                    head.HeadType === 'NETSALARY' ||
                    head.HeadType === 'BENEFITTOTAL' ||
                    head.HeadType === 'OTHERBENEFITTOTAL' ||
                    head.HeadType === 'CTCTOTAL'
                )) {
                    // This is a total row, add as standalone
                    groupedHeads.push({
                        mainHead: null,
                        items: [head]
                    });
                    currentGroup = null; // Close current group
                } else {
                    // Add to current section
                    currentGroup.items.push(head);
                }
            } else {
                // Standalone item (like totals)
                groupedHeads.push({
                    mainHead: null,
                    items: [head]
                });
            }
        });

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                {/* Employee Info Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-700">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">NAME OF THE EMPLOYEE</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{ctcDetails.EmpName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">LOCATION</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{ctcDetails.State || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">EMPLOYEE CODE</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{ctcDetails.Emprefno}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">APPOINTMENT CATEGORY</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{ctcDetails.Category}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">JOINING ON</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{ctcDetails.MonthName}-{ctcDetails.Year}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">SALARY FORMAT</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400">
                                {ctcDetails.GroupName ? `Group ${ctcDetails.GroupName}` : 'Standard'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTC Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-32">
                                    Section
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Particulars
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                    Amount Type
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                                    CTC Amount
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                                    Monthly
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                                    Yearly
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {groupedHeads.map((group, groupIndex) => {
                                if (group.mainHead) {
                                    // Section with MainHead
                                    return (
                                        <React.Fragment key={groupIndex}>
                                            {group.items.map((head, itemIndex) => {
                                                const isFirstInGroup = itemIndex === 0;
                                                const rowSpan = group.items.length;

                                                return (
                                                    <tr key={`${groupIndex}-${itemIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                        {/* MainHead column with rowspan for first item only */}
                                                        {isFirstInGroup && (
                                                            <td
                                                                rowSpan={rowSpan}
                                                                className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border-r-2 border-gray-300 dark:border-gray-600 align-middle text-center"
                                                            >
                                                                <div className="flex items-center justify-center h-full">
                                                                    <span className="writing-mode-vertical transform rotate-180 text-xs tracking-wider uppercase whitespace-nowrap">
                                                                        {group.mainHead}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {/* Head Name */}
                                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                            {head.HeadName}
                                                        </td>

                                                        {/* Amount Type */}
                                                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                                                            {head.ApplicableType || head.CTCAmounttype || '-'}
                                                        </td>

                                                        {/* CTC Amount */}
                                                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                                                            {head.CTCAmount > 0 ? formatCurrency(head.CTCAmount) : '-'}
                                                            {head.ValidationMsg && head.ValidationMsg.trim() !== '' && (
                                                                <span className="block text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                                                    ({head.ValidationMsg})
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Monthly */}
                                                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                                            {head.MonthlyAmount > 0 ? formatCurrency(head.MonthlyAmount) : '-'}
                                                        </td>

                                                        {/* Yearly */}
                                                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                                            {head.YearlyAmount > 0 ? formatCurrency(head.YearlyAmount) : '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                } else {
                                    // Total rows without MainHead
                                    return group.items.map((head, itemIndex) => {
                                        // Determine styling based on HeadType
                                        let bgClass = '';
                                        let textClass = 'text-gray-900 dark:text-white';

                                        console.log('🎨 Rendering total row:', head.HeadName, 'Type:', head.HeadType); // DEBUG

                                        // Total rows styling
                                        if (head.HeadType === 'GROSSSALARY') {
                                            bgClass = 'bg-blue-600 dark:bg-blue-700';
                                            textClass = 'font-bold text-white';
                                            console.log('✅ Applied GROSSSALARY styling'); // DEBUG
                                        } else if (head.HeadType === 'DEDUCTIONTOTAL') {
                                            bgClass = 'bg-blue-600 dark:bg-blue-700';
                                            textClass = 'font-bold text-white';
                                            console.log('✅ Applied DEDUCTIONTOTAL styling'); // DEBUG
                                        } else if (head.HeadType === 'NETSALARY') {
                                            bgClass = 'bg-blue-700 dark:bg-blue-800';
                                            textClass = 'font-bold text-white';
                                            console.log('✅ Applied NETSALARY styling'); // DEBUG
                                        } else if (head.HeadType === 'BENEFITTOTAL') {
                                            bgClass = 'bg-blue-600 dark:bg-blue-700';
                                            textClass = 'font-bold text-white';
                                            console.log('✅ Applied BENEFITTOTAL styling'); // DEBUG
                                        } else if (head.HeadType === 'OTHERBENEFITTOTAL') {
                                            bgClass = 'bg-blue-600 dark:bg-blue-700';
                                            textClass = 'font-bold text-white';
                                            console.log('✅ Applied OTHERBENEFITTOTAL styling'); // DEBUG
                                        } else if (head.HeadType === 'CTCTOTAL') {
                                            bgClass = 'bg-blue-800 dark:bg-blue-900';
                                            textClass = 'font-bold text-white text-base';
                                            console.log('✅ Applied CTCTOTAL styling'); // DEBUG
                                        }

                                        return (
                                            <tr key={`${groupIndex}-${itemIndex}`} className={`${bgClass}`}>
                                                {/* Empty Section cell */}
                                                <td className={`px-4 py-3 text-sm ${textClass} ${bgClass}`}>
                                                    {/* Empty for total rows */}
                                                </td>
                                                {/* Head Name */}
                                                <td className={`px-4 py-3 text-sm ${textClass} ${bgClass}`}>
                                                    {head.HeadName}
                                                </td>
                                                {/* Amount Type */}
                                                <td className={`px-4 py-3 text-center text-sm ${textClass} ${bgClass}`}>
                                                    {head.ApplicableType || head.CTCAmounttype || '-'}
                                                </td>
                                                {/* CTC Amount */}
                                                <td className={`px-4 py-3 text-right text-sm ${textClass} ${bgClass}`}>
                                                    {head.CTCAmount > 0 ? formatCurrency(head.CTCAmount) : '-'}
                                                </td>
                                                {/* Monthly */}
                                                <td className={`px-4 py-3 text-right text-sm ${textClass} ${bgClass}`}>
                                                    {head.MonthlyAmount > 0 ? formatCurrency(head.MonthlyAmount) : '-'}
                                                </td>
                                                {/* Yearly */}
                                                <td className={`px-4 py-3 text-right text-sm ${textClass} ${bgClass}`}>
                                                    {head.YearlyAmount > 0 ? formatCurrency(head.YearlyAmount) : '-'}
                                                </td>
                                            </tr>
                                        );
                                    });
                                }
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Additional Info (if available) */}
                {ctcDetails.EmpRuleStatus && (
                    <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Additional Information</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            {ctcDetails.EmpRuleStatus.PFExist && (
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">PF Status</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {ctcDetails.EmpRuleStatus.PFExist} ({ctcDetails.EmpRuleStatus.PFPercent}%)
                                    </p>
                                </div>
                            )}
                            {ctcDetails.EmpRuleStatus.ESIExist && (
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">ESI Status</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {ctcDetails.EmpRuleStatus.ESIExist} ({ctcDetails.EmpRuleStatus.ESIPercent}%)
                                    </p>
                                </div>
                            )}
                            {ctcDetails.EmpRuleStatus.GratuityRuleExist && (
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Gratuity</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {ctcDetails.EmpRuleStatus.GratuityRuleExist}
                                    </p>
                                </div>
                            )}
                            {ctcDetails.EmpRuleStatus.PaidLeaveExist && (
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Paid Leave</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {ctcDetails.EmpRuleStatus.PaidLeaveExist}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };
    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = ctcDetails || selectedItem;
        const hasDetailedData = !!ctcDetails;

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading CTC details...
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
                                    <DollarSign className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <Wallet className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.EmpName}
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                                    {displayData.Emprefno} • {displayData.TransactionRefno}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                        {displayData.MonthName} {displayData.Year}
                                    </span>
                                    {displayData.Category && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            {displayData.Category}
                                        </span>
                                    )}
                                    {hasDetailedData && displayData.GroupName && (
                                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                            Group {displayData.GroupName}
                                        </span>
                                    )}
                                    {hasDetailedData && displayData.State && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                            {displayData.State}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && ctcDetails.HeadsList && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Annual CTC</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(ctcDetails.HeadsList?.find(h => h.HeadType === 'CTCTOTAL')?.YearlyAmount || 0)}
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction Ref</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {displayData.TransactionRefno}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Month/Year</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.MonthName} {displayData.Year}
                            </p>
                        </div>
                        {hasDetailedData && displayData.Earningcount > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Components</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {displayData.Earningcount} Earnings, {displayData.Deductioncount} Deductions
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CTC Breakdown */}
                {hasDetailedData && renderCTCBreakdown()}

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
                        checkboxLabel: '✓ I have verified all CTC components and calculations',
                        checkboxDescription: 'Including earnings, deductions, benefits, and total CTC accuracy',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify CTC breakup, salary components, calculations, and any discrepancies...',
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
                            ℹ️ No actions available for this CTC record
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
                title={`${InboxTitle || 'Employee CTC Verification'} (${ctcInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={ctcInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={DollarSign}
                badgeText="CTC Verification"
                badgeCount={ctcInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, emp ref, transaction ref...',
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
                        value: filterCategory,
                        onChange: (e) => setFilterCategory(e.target.value),
                        defaultLabel: 'All Categories',
                        options: categories
                    }
                ]}
                className="bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600"
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
                                emptyMessage: 'No CTC records found!',
                                itemKey: 'Id',
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
                                        <DollarSign className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'CTC Verification' : 'CTC Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <DollarSign className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No CTC Record Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a CTC record from the list to view details and verify salary components.
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

export default VerifyEmployeeCTC;