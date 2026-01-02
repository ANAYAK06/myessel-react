import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2,
    AlertCircle, Hash, Calendar,
    User, Building2, Package, TrendingUp,
    Layers
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import AttachmentModal from '../../components/Inbox/AttachmentModal';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyDailyIssueGrid,
    fetchDailyIssueDetails,
    fetchDailyIssueRemarks,
    approveDailyIssue,
    setSelectedTranNo,
    setSelectedCCCode,
    setSelectedRefNo,
    resetDailyIssueDetails,
    clearApprovalResult,
    selectDailyIssueGridArray,
    selectDailyIssueDetails,
    selectDailyIssueRemarks,
    selectDailyIssueGridLoading,
    selectDailyIssueDetailsLoading,
    selectDailyIssueRemarksLoading,
    selectApproveDailyIssueLoading,
    selectDailyIssueGridError,
    selectDailyIssueDetailsError,
    selectSelectedTranNo,
    selectSelectedCCCode,
    selectApprovalResult,
    setSelectedRoleId,
    setSelectedCreated,
    setSelectedUserId
} from '../../slices/stockSlice/dailyIssueSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton
} from '../../slices/CommonSlice/getStatusSlice';

const VerifyDailyIssue = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const dailyIssueGrid = useSelector(selectDailyIssueGridArray);
    const gridLoading = useSelector(selectDailyIssueGridLoading);
    const gridError = useSelector(selectDailyIssueGridError);

    const dailyIssueDetails = useSelector(selectDailyIssueDetails);
    const detailsLoading = useSelector(selectDailyIssueDetailsLoading);
    const detailsError = useSelector(selectDailyIssueDetailsError);

    const dailyIssueRemarks = useSelector(selectDailyIssueRemarks);
    const remarksLoading = useSelector(selectDailyIssueRemarksLoading);

    const approvalLoading = useSelector(selectApproveDailyIssueLoading);
    const selectedTranNo = useSelector(selectSelectedTranNo);
    const selectedCCCode = useSelector(selectSelectedCCCode);

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
    const [filterFromCC, setFilterFromCC] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const fromCCs = [...new Set(dailyIssueGrid.map(item => item.FromCC))].filter(Boolean);
    const statuses = [...new Set(dailyIssueGrid.map(item => item.Status))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Daily Issue Verifier';
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

    const handleViewAttachment = (filePath) => {
        if (!filePath) {
            toast.error('No attachment available');
            return;
        }
        
        const fullUrl = filePath;
        
        if (!fullUrl) {
            toast.error('Invalid file path');
            return;
        }
        
        console.log('Viewing attachment:', fullUrl);
        setAttachmentUrl(fullUrl);
        setShowAttachmentModal(true);
    };

    // Initialize - Fetch grid data
    useEffect(() => {
        if (roleId && uid) {
            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));
            const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            dispatch(setSelectedCreated(today));
            dispatch(fetchVerifyDailyIssueGrid({ roleId, created: today, userId: uid }));
        }
    }, [roleId, uid, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetDailyIssueDetails());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // When item is selected, fetch details and remarks
    useEffect(() => {
        if (selectedItem?.Tranno && selectedItem?.FromCC) {
            dispatch(setSelectedTranNo(selectedItem.Tranno));
            dispatch(setSelectedCCCode(selectedItem.FromCC));
            dispatch(fetchDailyIssueDetails({ 
                tranNo: selectedItem.Tranno, 
                ccCode: selectedItem.FromCC 
            }));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when item is selected - MOID comes from grid data
    useEffect(() => {
        if (selectedItem && roleId) {
            const moid = selectedItem?.MOID; // MOID is in the grid data
            console.group('🎯 Status List Fetch Debug');
            console.log('Selected Item:', selectedItem);
            console.log('MOID from selectedItem:', moid);
            console.log('Role ID:', roleId);
            console.log('Will fetch status:', !!moid);
            console.groupEnd();
            
            if (moid) {
                dispatch(fetchStatusList({
                    MOID: moid,
                    ROID: roleId,
                    ChkAmt: 0
                }));
            } else {
                console.warn('⚠️ No MOID found in selectedItem. Check grid API response structure.');
                console.log('Available fields in selectedItem:', Object.keys(selectedItem));
            }
        }
    }, [selectedItem, roleId, dispatch]);

    // Fetch remarks when details are loaded
    useEffect(() => {
        if (selectedItem && dailyIssueDetails) {
            const refNo = dailyIssueDetails?.Tranno || selectedItem.Tranno;
            if (refNo) {
                dispatch(setSelectedRefNo(refNo));
                dispatch(fetchDailyIssueRemarks({ refNo }));
            }
        }
    }, [selectedItem, dailyIssueDetails, dispatch]);

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
        if (roleId && uid) {
            const today = new Date().toISOString().split('T')[0];
            dispatch(fetchVerifyDailyIssueGrid({ roleId, created: today, userId: uid }));
            if (selectedItem) {
                dispatch(fetchDailyIssueDetails({ 
                    tranNo: selectedItem.Tranno, 
                    ccCode: selectedItem.FromCC 
                }));
            }
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item);
    };

    const buildDailyIssueApprovalPayload = (actionValue) => {
    const currentUser = getCurrentUser();
    const currentRoleName = getCurrentRoleName();

    const updatedRemarks = updateRemarksHistory(
        dailyIssueDetails?.Remarks || '',
        currentRoleName,
        currentUser,
        verificationComment.trim()
    );

    
    const payload = {
        Tranno: selectedItem?.Tranno || dailyIssueDetails?.Tranno || '',
        Status: actionValue,        
        Remarks: updatedRemarks,
        Createdby: currentUser,
        RoleID: roleId
    };

    console.log('📦 Daily Issue Approval Payload (matching MVC):', payload);
    return payload;
};

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No Daily Issue selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the Daily Issue details by checking the verification checkbox.');
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
            const payload = buildDailyIssueApprovalPayload(actionValue);
            
            console.log('📤 Daily Issue Approval Payload:', payload);

            const result = await dispatch(approveDailyIssue(payload)).unwrap();

            console.log('📥 API Response:', result);

            // Old app returns: { saveStatus: "message" } or just "message"
            let successMessage = '';
            
            if (typeof result === 'string') {
                successMessage = result;
            } else if (result?.saveStatus) {
                successMessage = result.saveStatus;
            } else {
                successMessage = `${action.text || actionValue} completed successfully!`;
            }

            // Check for $ delimiter in message
            if (successMessage.includes('$')) {
                const [status, additionalInfo] = successMessage.split('$');
                toast.success(status);
                if (additionalInfo) {
                    setTimeout(() => {
                        toast.info(additionalInfo, { autoClose: 6000 });
                    }, 500);
                }
            } else {
                toast.success(successMessage);
            }

            setTimeout(() => {
                const today = new Date().toISOString().split('T')[0];
                dispatch(fetchVerifyDailyIssueGrid({ roleId, created: today, userId: uid }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetDailyIssueDetails());
                dispatch(resetApprovalData());
                dispatch(clearApprovalResult());
            }, 1000);

        } catch (error) {
            console.error('❌ Approval Error:', error);
            
            let errorMessage = `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;

            if (error && typeof error === 'string') {
                errorMessage = error;
            } else if (error?.saveStatus) {
                errorMessage = error.saveStatus;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    const filteredItems = dailyIssueGrid.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.Tranno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.FromCC?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Date?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFromCC = filterFromCC === 'All' || item.FromCC === filterFromCC;
        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;

        return matchesSearch && matchesFromCC && matchesStatus;
    });

    // Calculate totals
    const calculateTotalAmount = () => {
        if (!dailyIssueDetails?.ItemList) return 0;
        
        return dailyIssueDetails.ItemList.reduce((sum, item) => {
            const amount = parseFloat(item.Amount) || 0;
            return sum + amount;
        }, 0);
    };

    const totalAmount = calculateTotalAmount();
    const totalItems = dailyIssueDetails?.ItemList?.length || 0;

    const statsCards = [
        {
            icon: FileText,
            value: dailyIssueGrid.length,
            label: 'Total Issues',
            color: 'purple'
        },
        {
            icon: Package,
            value: totalItems,
            label: 'Total Items',
            color: 'blue'
        },
        {
            icon: Building2,
            value: dailyIssueDetails?.FromCC || selectedItem?.FromCC || '-',
            label: 'From Cost Center',
            color: 'indigo'
        },
        {
            icon: TrendingUp,
            value: `₹${totalAmount.toFixed(2)}`,
            label: 'Total Amount',
            color: 'green'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-purple-200 dark:border-purple-600 bg-gradient-to-br from-purple-100 to-purple-100 dark:from-purple-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.Tranno}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            From: {item.FromCC}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.Date}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-purple-200 dark:border-purple-600 bg-gradient-to-br from-purple-100 to-purple-100 dark:from-purple-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const hasDetailedData = !!dailyIssueDetails;

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading detailed information...
                            </span>
                        </div>
                    </div>
                )}

                {/* CUSTOM HEADER - Fixed to show selectedItem data immediately */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Layers className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    Daily Issue Report
                                </h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                    Transaction: {selectedItem.Tranno || 'N/A'}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        Daily Issue
                                    </span>
                                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                                        {selectedItem.Status || 'Pending Verification'}
                                    </span>
                                    {selectedItem.FromCC && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            From: {selectedItem.FromCC}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && totalAmount > 0 && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    ₹{totalAmount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {totalItems} Items
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        {hasDetailedData && dailyIssueDetails.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {dailyIssueDetails.MOID}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction No</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {selectedItem.Tranno || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From Cost Center</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {selectedItem.FromCC || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {selectedItem.Date?.split(' ')[0] || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                {hasDetailedData && dailyIssueDetails.ItemList && dailyIssueDetails.ItemList.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Item Details
                                </h3>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Item Code
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Item Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Specification
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Units
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Basic Rate
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {dailyIssueDetails.ItemList.map((item, index) => (
                                        <tr key={item.Rid || index} className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                {item.ItemCode}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {item.ItemName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {item.Specification}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                                                    {item.Qty || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {item.Units}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-700 dark:text-gray-400">
                                                ₹{parseFloat(item.Basic || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-purple-700 dark:text-purple-400">
                                                ₹{parseFloat(item.Amount || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={dailyIssueRemarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have verified all Daily Issue details',
                        checkboxDescription: 'Including item details, quantities, cost center information, and supporting documentation',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify item details, quantities, amounts, and reason for daily issue...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-purple-200 dark:border-purple-700'
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
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
                            ℹ️ No actions available for this Daily Issue
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
                title={`${InboxTitle || 'Daily Issue'} (${dailyIssueGrid.length})`}
                subtitle={ModuleDisplayName}
                itemCount={dailyIssueGrid.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Layers}
                badgeText="Daily Issue Verification"
                badgeCount={dailyIssueGrid.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by tran no, from CC, date...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterFromCC,
                        onChange: (e) => setFilterFromCC(e.target.value),
                        defaultLabel: 'All Cost Centers',
                        options: fromCCs
                    },
                    {
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        defaultLabel: 'All Status',
                        options: statuses
                    }
                ]}
                className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600"
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
                            loading={gridLoading}
                            error={gridError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending',
                                icon: Clock,
                                emptyMessage: 'No Daily Issues found!',
                                itemKey: 'Tranno',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20'
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
                            <div className="bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-500 rounded-lg">
                                        <Layers className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'Daily Issue Verification' : 'Issue Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh-200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Issue Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a Daily Issue from the list to view details and take action.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AttachmentModal
                isOpen={showAttachmentModal}
                onClose={() => setShowAttachmentModal(false)}
                fileUrl={attachmentUrl}
                title="Daily Issue Document"
            />
        </div>
    );
};

export default VerifyDailyIssue;