import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2, Users,
    Calendar, Building2, Hash, User,
    TrendingUp, AlertCircle, CalendarDays,
    Plane, UserCheck, UserX, CheckSquare, MapPin, Phone
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyLeaveRequests,
    fetchSingleEmpForLeaveRequest,
    approveHRLeaveRequest,
    setSelectedEmpRefno,
    setSelectedRoleId,
    resetLeaveRequestDetails,
    resetEmployeeLeaveData,
    clearApprovalResult,
    selectVerifyLeaveRequestsInboxArray,
    selectLeaveRequestDetails,
    selectVerifyLeaveRequestsLoading,
    selectLeaveRequestDetailsLoading,
    selectApproveLeaveRequestLoading,
    selectVerifyLeaveRequestsError,
    selectLeaveRequestDetailsError,
    selectApprovalResult
} from '../../slices/HRSlice/employeeLeaveSlice';

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

const VerifyEmployeeLeaveRequest = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const leaveRequestsInbox = useSelector(selectVerifyLeaveRequestsInboxArray);
    const inboxLoading = useSelector(selectVerifyLeaveRequestsLoading);
    const inboxError = useSelector(selectVerifyLeaveRequestsError);

    const leaveRequestDetails = useSelector(selectLeaveRequestDetails);
    const detailsLoading = useSelector(selectLeaveRequestDetailsLoading);
    const detailsError = useSelector(selectLeaveRequestDetailsError);

    const approvalLoading = useSelector(selectApproveLeaveRequestLoading);
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
    const [filterCostCenter, setFilterCostCenter] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Extract unique values for filters
    const costCenters = [...new Set(leaveRequestsInbox.map(item => item.JoiningCostCenter))].filter(Boolean);
    const statuses = [...new Set(leaveRequestsInbox.map(item => item.CCName))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Leave Verifier';
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

    // Initialize - Fetch leave requests inbox
    useEffect(() => {
        if (roleId) {
            console.log('🎯 Initializing Employee Leave Request Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerifyLeaveRequests(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetEmployeeLeaveData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch leave request details when item is selected
    useEffect(() => {
        if (selectedItem?.EmpRefNo) {
            console.log('🔍 Fetching Employee Leave Request Details for EmpRefNo:', selectedItem.EmpRefNo);

            dispatch(setSelectedEmpRefno(selectedItem.EmpRefNo));
            dispatch(fetchSingleEmpForLeaveRequest(selectedItem.EmpRefNo));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when leave request details are loaded
    useEffect(() => {
        if (selectedItem && roleId && leaveRequestDetails) {
            const moid = leaveRequestDetails?.MOID || 363;

            console.log('📊 Fetching Status List for MOID:', moid);
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: 0
            }));
        }
    }, [selectedItem, roleId, leaveRequestDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && leaveRequestDetails) {
            const moid = leaveRequestDetails?.MOID || 363;

            console.log('💬 Fetching Remarks for MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: leaveRequestDetails.TransactionRefNo || selectedItem.TransactionRefNo || '',
                moid: moid
            }));
        }
    }, [selectedItem, leaveRequestDetails, dispatch]);

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
            console.log('🔄 Refreshing Employee Leave Requests list');
            dispatch(fetchVerifyLeaveRequests(roleId));

            if (selectedItem) {
                dispatch(fetchSingleEmpForLeaveRequest(selectedItem.EmpRefNo));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected Leave Request Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            leaveRequestDetails?.Note || selectedItem?.Note || '',
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        const payload = {
            EmpRefNo: selectedItem?.EmpRefNo || '',
            TransactionRefNo: leaveRequestDetails?.TransactionRefNo || selectedItem?.TransactionRefNo || '',
            Roleid: roleId,
            Action: actionValue,
            Note: updatedRemarks,
            CreatedBy: currentUser,
            UserName: leaveRequestDetails?.UserName || selectedItem?.UserName || currentUser,
            Noofleaves: parseInt(leaveRequestDetails?.Noofleaves || selectedItem?.Noofleaves || 0),
            LeaveTypeId: parseInt(leaveRequestDetails?.LeaveTypeId || selectedItem?.LeaveTypeId || 0),
            JoiningCostCenter: leaveRequestDetails?.JoiningCostCenter || selectedItem?.JoiningCostCenter || '',
            FromDate: leaveRequestDetails?.FromDate || selectedItem?.FromDate || '',
            ToDate: leaveRequestDetails?.ToDate || selectedItem?.ToDate || '',
            Remarks: verificationComment.trim(),
            SubmitAction: 'CheckLeaves'
        };

        console.log('📤 Leave Request Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No leave request selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the leave request details by checking the verification checkbox.');
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

            const result = await dispatch(approveHRLeaveRequest(payload)).unwrap();

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
                dispatch(fetchVerifyLeaveRequests(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetLeaveRequestDetails());
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

    const filteredItems = leaveRequestsInbox.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.TransactionRefNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.EmployeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.EmpRefNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.CCName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCostCenter = filterCostCenter === 'All' || item.JoiningCostCenter === filterCostCenter;
        const matchesStatus = filterStatus === 'All' || item.CCName === filterStatus;

        return matchesSearch && matchesCostCenter && matchesStatus;
    });

    const statsCards = [
        {
            icon: FileText,
            value: leaveRequestsInbox.length,
            label: 'Total Requests',
            color: 'blue'
        },
        {
            icon: Clock,
            value: leaveRequestsInbox.length,
            label: 'Pending Verification',
            color: 'purple'
        },
        {
            icon: CalendarDays,
            value: leaveRequestDetails?.Noofleaves || selectedItem?.Noofleaves || 0,
            label: 'Days Requested',
            color: 'indigo'
        },
        {
            icon: Building2,
            value: leaveRequestDetails?.JoiningCostCenter || selectedItem?.JoiningCostCenter || '-',
            label: 'Cost Center',
            color: 'violet'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.EmployeeName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.EmpRefNo}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{item.CCName}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>From: {item.FromDate}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <CalendarDays className="w-3 h-3" />
                            <span>{item.Noofleaves} days</span>
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            {item.JoiningCostCenter}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.TransactionRefNo}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = leaveRequestDetails || {};
        const hasDetailedData = !!leaveRequestDetails;

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading leave request details...
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
                                    <Plane className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.EmployeeName || selectedItem.EmployeeName}
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                                    {displayData.EmpRefNo || selectedItem.EmpRefNo} • {displayData.Category || 'Employee'}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                        Leave Request
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                        {displayData.JoiningCostCenter || selectedItem.JoiningCostCenter}
                                    </span>
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {displayData.Noofleaves || selectedItem.Noofleaves} Days
                                    </span>
                                    {displayData.LeaveAssignStatus && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                            {displayData.LeaveAssignStatus}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Leave Days</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {displayData.Noofleaves || selectedItem.Noofleaves}
                            </p>
                            {displayData.Balanceleaves && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    Balance: {displayData.Balanceleaves}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From Date</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.FromDate || selectedItem.FromDate}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">To Date</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.ToDate || selectedItem.ToDate || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cost Center</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.JoiningCostCenter || selectedItem.JoiningCostCenter}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction No</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.TransactionRefNo || selectedItem.TransactionRefNo}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Leave Request Details */}
                {hasDetailedData && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <CalendarDays className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Leave Request Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Number of Leaves</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {leaveRequestDetails.Noofleaves} Days
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance Leaves</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {leaveRequestDetails.Balanceleaves || '0'} Days
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Leave Type ID</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {leaveRequestDetails.LeaveTypeId}
                                </p>
                            </div>
                        </div>

                        {leaveRequestDetails.Remarks && (
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Leave Reason / Remarks</p>
                                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    {leaveRequestDetails.Remarks}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Employee Details */}
                {hasDetailedData && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Employee Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employee Name</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.EmployeeName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employee ID</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.EmpRefNo}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.Category || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">State</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.State || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center space-x-1">
                                        <Phone className="w-3 h-3" />
                                        <span>Mobile Number</span>
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.MobileNo || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cost Center Name</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.CCName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Joining Date</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.JoiningDate || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Previous Leave Date</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.PreviousLRDate || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Year End Date</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.YearEndDate || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User Name</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {leaveRequestDetails.UserName || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {leaveRequestDetails.PermanentAddress && (
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>Permanent Address</span>
                                </p>
                                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    {leaveRequestDetails.PermanentAddress}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Leave Period Information */}
                {hasDetailedData && (leaveRequestDetails.Mindate || leaveRequestDetails.MaxDate) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Leave Eligibility Period
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {leaveRequestDetails.Mindate && (
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Eligible From</p>
                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {leaveRequestDetails.Mindate}
                                    </p>
                                </div>
                            )}
                            {leaveRequestDetails.MaxDate && (
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Eligible Until</p>
                                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        {leaveRequestDetails.MaxDate}
                                    </p>
                                </div>
                            )}
                        </div>
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
                        checkboxLabel: '✓ I have verified all leave request details',
                        checkboxDescription: 'Including employee information, leave balance, dates, eligibility period, and supporting documents',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify employee eligibility, leave balance, dates, and any special considerations...',
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
                            ℹ️ No actions available for this leave request
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
                title={`${InboxTitle || 'Employee Leave Request Verification'} (${leaveRequestsInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={leaveRequestsInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Plane}
                badgeText="Leave Requests"
                badgeCount={leaveRequestsInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by employee name, ID, transaction no...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterCostCenter,
                        onChange: (e) => setFilterCostCenter(e.target.value),
                        defaultLabel: 'All Cost Centers',
                        options: costCenters
                    },
                    {
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        defaultLabel: 'All Locations',
                        options: statuses
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
                                emptyMessage: 'No leave requests found!',
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
                                        <Plane className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'Leave Request Verification' : 'Leave Request Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Plane className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Leave Request Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a leave request from the list to view details and verify.
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

export default VerifyEmployeeLeaveRequest;