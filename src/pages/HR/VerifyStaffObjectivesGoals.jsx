import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2, Users,
    Calendar, Building2, Hash, User,
    TrendingUp, AlertCircle, Award,
    CalendarDays, UserCheck, Briefcase, Target
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyObjectsAndGoals,
    fetchAppraisalById,
    approveEmpObjects,
    setSelectedId,
    setSelectedEmpRefNo,
    setSelectedRoleId,
    resetAppraisalDetails,
    resetStaffObjectivesGoalsData,
    clearApprovalResult,
    selectVerifyObjectsAndGoalsInboxArray,
    selectAppraisalDetails,
    selectVerifyObjectsAndGoalsLoading,
    selectAppraisalDetailsLoading,
    selectApproveEmpObjectsLoading,
    selectVerifyObjectsAndGoalsError,
    selectAppraisalDetailsError,
    selectApprovalResult
} from '../../slices/HRSlice/staffObjectivesandGoalsSlice';

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

const VerifyStaffObjectivesGoals = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const appraisalInbox = useSelector(selectVerifyObjectsAndGoalsInboxArray);
    const inboxLoading = useSelector(selectVerifyObjectsAndGoalsLoading);
    const inboxError = useSelector(selectVerifyObjectsAndGoalsError);

    const appraisalDetails = useSelector(selectAppraisalDetails);
    const detailsLoading = useSelector(selectAppraisalDetailsLoading);
    const detailsError = useSelector(selectAppraisalDetailsError);

    const approvalLoading = useSelector(selectApproveEmpObjectsLoading);
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
    const [filterGroup, setFilterGroup] = useState('All');
    const [filterDepartment, setFilterDepartment] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Extract unique values for filters
    const groups = [...new Set(appraisalInbox.map(item => item.GroupName))].filter(Boolean);
    const departments = [...new Set(appraisalInbox.map(item => item.Department))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Appraisal Verifier';
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

    // Initialize - Fetch appraisal inbox
    useEffect(() => {
        if (roleId) {
            console.log('🎯 Initializing Staff Objectives & Goals Verification with RoleID:', roleId);
            dispatch(setSelectedRoleId(roleId));
            dispatch(fetchVerifyObjectsAndGoals(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetStaffObjectivesGoalsData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch appraisal details when item is selected
    useEffect(() => {
        if (selectedItem?.Id && selectedItem?.EmpRefNo) {
            console.log('🔍 Fetching Appraisal Details for ID:', selectedItem.Id, 'EmpRefNo:', selectedItem.EmpRefNo);

            dispatch(setSelectedId(selectedItem.Id));
            dispatch(setSelectedEmpRefNo(selectedItem.EmpRefNo));
            dispatch(fetchAppraisalById({ 
                id: selectedItem.Id, 
                empRefNo: selectedItem.EmpRefNo 
            }));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when appraisal details are loaded
    useEffect(() => {
        if (selectedItem && roleId && appraisalDetails) {
            const moid = appraisalDetails?.MOID || 571;

            console.log('📊 Fetching Status List for MOID:', moid);
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: 0
            }));
        }
    }, [selectedItem, roleId, appraisalDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && appraisalDetails) {
            const moid = appraisalDetails?.MOID || 571;

            console.log('💬 Fetching Remarks for MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: appraisalDetails.Id?.toString() || selectedItem.Id?.toString() || '',
                moid: moid
            }));
        }
    }, [selectedItem, appraisalDetails, dispatch]);

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
            console.log('🔄 Refreshing Staff Objectives & Goals list');
            dispatch(fetchVerifyObjectsAndGoals(roleId));

            if (selectedItem?.Id && selectedItem?.EmpRefNo) {
                dispatch(fetchAppraisalById({ 
                    id: selectedItem.Id, 
                    empRefNo: selectedItem.EmpRefNo 
                }));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected Appraisal Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            appraisalDetails?.Remarks || '',
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        // Extract data from appraisalDetails
        const empRefNo = appraisalDetails?.EmpRefNo || selectedItem?.EmpRefNo || '';
        const id = appraisalDetails?.Id || selectedItem?.Id || '';
        const year = appraisalDetails?.Year || 0;
        const month = appraisalDetails?.Month || 0;
        const ccCode = appraisalDetails?.JoiningCostCenter || 
                       appraisalDetails?.CostCenter || 
                       selectedItem?.JoiningCostCenter || '';

        const payload = {
            EmpRefNo: empRefNo,
            Id: id,
            Remarks: updatedRemarks,
            Year: year,
            Month: month,
            CCCode: ccCode,
            RoleId: roleId,
            Createdby: currentUser,
            Action: actionValue,
            Note: verificationComment.trim() // Current comment without history
        };

        console.log('📤 Emp Objects Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No appraisal record selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the appraisal details by checking the verification checkbox.');
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

            const result = await dispatch(approveEmpObjects(payload)).unwrap();

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
                dispatch(fetchVerifyObjectsAndGoals(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetAppraisalDetails());
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

    const filteredItems = appraisalInbox.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.Id?.toString().includes(searchQuery) ||
            item.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.EmpRefNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.JoiningCCName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Department?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGroup = filterGroup === 'All' || item.GroupName === filterGroup;
        const matchesDepartment = filterDepartment === 'All' || item.Department === filterDepartment;

        return matchesSearch && matchesGroup && matchesDepartment;
    });

    const statsCards = [
        {
            icon: Target,
            value: appraisalInbox.length,
            label: 'Total Records',
            color: 'blue'
        },
        {
            icon: Clock,
            value: appraisalInbox.length,
            label: 'Pending Verification',
            color: 'purple'
        },
        {
            icon: Award,
            value: appraisalDetails?.GroupName || '-',
            label: 'Group',
            color: 'indigo'
        },
        {
            icon: Building2,
            value: appraisalDetails?.Department || '-',
            label: 'Department',
            color: 'violet'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.Name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            ID: {item.Id} • {item.EmpRefNo}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{item.JoiningCCName}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.EffectiveDate}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            {item.GroupName}
                        </span>
                    </div>
                    {item.Department && (
                        <div className="flex items-center space-x-1 mt-1">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate">{item.Department}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    const renderAppraisalDetailsGrid = () => {
        if (!appraisalDetails) return null;

        const detailItems = [
            { label: 'Employee Reference', value: appraisalDetails.EmpRefNo || '-', icon: Hash },
            { label: 'Designated As', value: appraisalDetails.DesignatedAs || '-', icon: Briefcase },
            { label: 'Department', value: appraisalDetails.Department || '-', icon: Building2 },
            { label: 'Joining Type', value: appraisalDetails.JoiningType || '-', icon: UserCheck },
            { label: 'Joining Date', value: appraisalDetails.JoiningDate || '-', icon: Calendar },
            { label: 'Group', value: appraisalDetails.GroupName || '-', icon: Users },
            { label: 'Cost Center', value: appraisalDetails.JoiningCostCenter || '-', icon: Building2 },
            { label: 'Last Appraisal Date', value: appraisalDetails.LastAppraisalDate || '-', icon: CalendarDays },
            { label: 'Effective Date', value: appraisalDetails.EffectiveDate || '-', icon: Calendar },
            { label: 'New Designation', value: appraisalDetails.NewDesignation || '-', icon: Award },
            { label: 'Year', value: appraisalDetails.Year || '-', icon: Calendar },
            { label: 'Month', value: appraisalDetails.Month || '-', icon: Calendar }
        ];

        if (appraisalDetails.Category) {
            detailItems.push(
                { label: 'Category', value: appraisalDetails.Category || '-', icon: User }
            );
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Appraisal Details
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

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = appraisalDetails || selectedItem;
        const hasDetailedData = !!appraisalDetails;

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading appraisal details...
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
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <Award className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.Name}
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                                    {displayData.EmpRefNo} • ID: {displayData.Id}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                        Staff Appraisal
                                    </span>
                                    {displayData.GroupName && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            Group {displayData.GroupName}
                                        </span>
                                    )}
                                    {hasDetailedData && displayData.JoiningType && (
                                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                            {displayData.JoiningType}
                                        </span>
                                    )}
                                    {hasDetailedData && displayData.NewDesignation && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                            New: {displayData.NewDesignation}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && displayData.EffectiveDate && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Effective Date</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {displayData.EffectiveDate}
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cost Center</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {displayData.JoiningCostCenter || displayData.JoiningCCName}
                            </p>
                        </div>
                        {hasDetailedData && displayData.Department && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Department</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {displayData.Department}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && displayData.LastAppraisalDate && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Appraisal</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {displayData.LastAppraisalDate}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Appraisal Details Grid */}
                {hasDetailedData && renderAppraisalDetailsGrid()}

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
                        checkboxLabel: '✓ I have verified all appraisal and objectives details',
                        checkboxDescription: 'Including employee information, designation changes, effective dates, and all relevant data accuracy',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify appraisal details, objectives, designation changes, and any discrepancies...',
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
                            ℹ️ No actions available for this appraisal record
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
                title={`${InboxTitle || 'Staff Objectives & Goals Verification'} (${appraisalInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={appraisalInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Target}
                badgeText="Appraisal Verification"
                badgeCount={appraisalInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, ID, emp ref no, department...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterGroup,
                        onChange: (e) => setFilterGroup(e.target.value),
                        defaultLabel: 'All Groups',
                        options: groups
                    },
                    {
                        value: filterDepartment,
                        onChange: (e) => setFilterDepartment(e.target.value),
                        defaultLabel: 'All Departments',
                        options: departments
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
                                emptyMessage: 'No appraisal records found!',
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
                                        <Target className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'Appraisal Verification' : 'Appraisal Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Target className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Appraisal Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select an appraisal record from the list to view details and verify objectives.
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

export default VerifyStaffObjectivesGoals;