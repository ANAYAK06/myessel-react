import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Building, Clock, FileCheck,
    TrendingUp, TrendingDown, Hash, CheckCircle2, AlertCircle,
    IndianRupee
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import AttachmentModal from '../../components/Inbox/AttachmentModal';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerificationDCAAmends,
    selectVerificationDCAAmendsArray,
    selectVerificationDCAAmendsLoading,
    selectVerificationDCAAmendsError,

    fetchVerifyDCABudgetAmendById,
    selectVerifyDCABudgetAmendById,
    selectVerifyDCABudgetAmendByIdLoading,
    selectVerifyDCABudgetAmendByIdError,
    resetVerifyDCABudgetAmendById,
    fetchDCABudgetAmendGrid,

    approveDCABudgetAmendment,

    selectDCABudgetAmendGrid,

    selectDCABudgetAmendGridLoading,
    selectApproveDCAAmendLoading,


    setSelectedRoleId,
    setSelectedUserId,
    resetDCABudgetData,
    selectDCABudgetAmendGridArray,
} from '../../slices/budgetSlice/dcaBudgetAmendmentSlice';

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
import { buildCCBudgetAmendmentUrl,  isImageFile, isPdfFile } from '../../config/s3Config';

import { formatIndianCurrency } from '../../utilities/amountToTextHelper';

const VerifyDCABudgetAmendment = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const STATIC_MOID = 142;

    const amendmentsList = useSelector(selectVerificationDCAAmendsArray);
    const amendmentsLoading = useSelector(selectVerificationDCAAmendsLoading);
    const amendmentsError = useSelector(selectVerificationDCAAmendsError);

    const detailedAmendmentData = useSelector(selectVerifyDCABudgetAmendById);
    const detailedAmendmentLoading = useSelector(selectVerifyDCABudgetAmendByIdLoading);
    const detailedAmendmentError = useSelector(selectVerifyDCABudgetAmendByIdError);

    const dcaBudgetDetails = useSelector(selectDCABudgetAmendGridArray);
    const detailsLoading = useSelector(selectDCABudgetAmendGridLoading);
    const approvalLoading = useSelector(selectApproveDCAAmendLoading);

    const remarks = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    const [selectedAmendment, setSelectedAmendment] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCCCode, setFilterCCCode] = useState('All');
    const [filterState, setFilterState] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');



    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const ccCodes = [...new Set(amendmentsList.map(a => a.CCCode))].filter(Boolean);
    const states = [...new Set(amendmentsList.map(a => a.State))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Budget Verifier';
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
            const fullUrl = buildCCBudgetAmendmentUrl(filePath);
    
            if(!fullUrl){
                toast.error('Invalid file path')
                return
            }
            console.log('Viewing attachment:', fullUrl);
            setAttachmentUrl(fullUrl);
            setShowAttachmentModal(true);
        };

    useEffect(() => {
        if (roleId && uid) {
            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));
            dispatch(fetchVerificationDCAAmends({ roleId, userId: uid }));
        }
    }, [roleId, uid, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetDCABudgetData());
            dispatch(resetApprovalData());
            dispatch(resetVerifyDCABudgetAmendById());
        };
    }, [dispatch]);

    useEffect(() => {
        if (selectedAmendment?.CCCode) {

            dispatch(fetchVerifyDCABudgetAmendById({
                ccCode: selectedAmendment.CCCode,
                 fyear: selectedAmendment.FYYear || 'N/A',
                ctype: selectedAmendment.cc_Type || 'Performing',
                status: selectedAmendment.Status || '1'
            }));

            const ccCode = selectedAmendment.CCCode;
            const fyear = selectedAmendment.FYYear
            const ccTypeId = selectedAmendment.cc_Type === 'Performing' ? 1 : 2;


            const requestParams = {
                ccCode,
                fyear: fyear,
                status: selectedAmendment.Status
            };

            

            dispatch(fetchDCABudgetAmendGrid({
                ccCode,
                fyear: fyear,
                status: selectedAmendment.Status
            }));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedAmendment, dispatch]);

    useEffect(() => {
        if (selectedAmendment && roleId && detailedAmendmentData) {
            const moid = detailedAmendmentData?.MOID || STATIC_MOID;
            dispatch(fetchStatusList({
                MOID: moid,
                ROID: roleId,
                ChkAmt: detailedAmendmentData.AmendedValue || 0
            }));
        }
    }, [selectedAmendment, roleId, detailedAmendmentData, dispatch]);

    useEffect(() => {
        if (selectedAmendment && detailedAmendmentData) {
            const moid = detailedAmendmentData?.MOID || STATIC_MOID;
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: detailedAmendmentData.RefNo || selectedAmendment.RefNo || '',
                moid: moid
            }));
        }
    }, [selectedAmendment, detailedAmendmentData, dispatch]);

    useEffect(() => {
        if (selectedAmendment) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedAmendment]);


    // 🔧 FIXED: Using BudgetItems key (confirmed from console logs)
    const getDCADetailsArray = () => {

        // Check if dcaBudgetDetails is null/undefined
        if (!dcaBudgetDetails) {
            return [];
        }

        // Log what we have

        // ✅ PRIMARY: Check BudgetItems key (confirmed from your console)
        if (dcaBudgetDetails.BudgetItems && Array.isArray(dcaBudgetDetails.BudgetItems)) {
            return dcaBudgetDetails.BudgetItems;
        }

        // Fallback: It's already an array
        if (Array.isArray(dcaBudgetDetails)) {
            return dcaBudgetDetails;
        }

        // Fallback: Old Data property (for backward compatibility)
        if (dcaBudgetDetails.Data && Array.isArray(dcaBudgetDetails.Data)) {
            return dcaBudgetDetails.Data;
        }

        // Last resort: Try to find any array property
        for (const key in dcaBudgetDetails) {
            if (Array.isArray(dcaBudgetDetails[key])) {
                return dcaBudgetDetails[key];
            }
        }

        // No array found
        return [];
    };

    const calculateTotals = () => {
        const detailsArray = getDCADetailsArray();

        if (detailsArray.length === 0) {
            return { totalAddition: 0, totalSubtraction: 0, netChange: 0 };
        }


        const totalAddition = detailsArray.reduce((sum, item) => {
            const addition = parseFloat(item.AAddition || 0);
            return sum + addition;
        }, 0);

        const totalSubtraction = detailsArray.reduce((sum, item) => {
            const subtraction = parseFloat(item.ASubstraction || 0);
            return sum + subtraction;
        }, 0);

        const netChange = totalAddition - totalSubtraction;

        return { totalAddition, totalSubtraction, netChange };
    };

    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleRefresh = () => {
        if (roleId && uid) {
            dispatch(fetchVerificationDCAAmends({ roleId, userId: uid }));
            if (selectedAmendment) {
                dispatch(fetchVerifyDCABudgetAmendById({
                    ccCode: selectedAmendment.CCCode,
                    fyear: selectedAmendment.FYYear || 'N/A',
                    ctype: selectedAmendment.cc_Type || 'Performing',
                    status: selectedAmendment.Status || '1'
                }));
            }
        }
    };

    const handleAmendmentSelect = (amendment) => {
        setSelectedAmendment(amendment);
    };

    const buildDCAAmendmentApprovalPayload = (actionValue) => {
    const currentUser = getCurrentUser();
    const currentRoleName = getCurrentRoleName();

    return {
        Action: actionValue ,
        AmendedValue: detailedAmendmentData?.AmendedValue?.toString() || "",
        ApprovalNote: verificationComment.trim(),
        CCCode: selectedAmendment?.CCCode || "",
        CreatedBy: currentUser,
        FYYear: selectedAmendment?.FYYear || "NA",
        RoleId: (roleId).toString(),
        Status: selectedAmendment?.Status || "1"
    };
};

    const handleActionClick = async (action) => {
    if (!selectedAmendment) {
        toast.error('No Amendment selected');
        return;
    }

    if (!verificationComment || verificationComment.trim() === '') {
        toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
        return;
    }

    if (!isVerified) {
        toast.error('Please verify the amendment details by checking the verification checkbox.');
        return;
    }

    // ✅ Extract action value properly
    let actionValue = action.value || action.text || action.type;
    
    // ✅ Map action types to proper values if needed
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
        const payload = buildDCAAmendmentApprovalPayload(actionValue);
        
        console.log('📤 Approval Payload:', payload);

        const result = await dispatch(approveDCABudgetAmendment(payload)).unwrap();

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

        // ✅ Refresh and reset
        setTimeout(() => {
            dispatch(fetchVerificationDCAAmends({ roleId, userId: uid }));
            setSelectedAmendment(null);
            setVerificationComment('');
            setIsVerified(false);
            setShowRemarksHistory(false);
            setIsLeftPanelCollapsed(false);
            dispatch(resetDCABudgetData());
            dispatch(resetApprovalData());
            dispatch(resetVerifyDCABudgetAmendById());
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
    const filteredAmendments = amendmentsList.filter(amendment => {
        const matchesSearch = searchQuery === '' ||
            amendment.CCName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            amendment.CCCode?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCCCode = filterCCCode === 'All' || amendment.CCCode === filterCCCode;
        const matchesState = filterState === 'All' || amendment.State === filterState;

        return matchesSearch && matchesCCCode && matchesState;
    });

    const statsCards = [
        {
            icon: Building,
            value: amendmentsList.length,
            label: 'Total Amendments',
            color: 'purple'
        },
        {
            icon: TrendingUp,
            value: detailedAmendmentData?.DcaAddition
                ? `₹${formatIndianCurrency(detailedAmendmentData.DcaAddition)}`
                : '₹0',
            label: 'Budget Addition',
            color: 'green'
        },
        {
            icon: TrendingDown,
            value: detailedAmendmentData?.DcaSubstraction
                ? `₹${formatIndianCurrency(parseFloat(detailedAmendmentData.DcaSubstraction))}`
                : '₹0',
            label: 'BudgetSubtraction',
            color: 'red'
        },
        {
            icon: Hash,
            value: detailedAmendmentData?.DCABudgetBalance
                ? `₹${formatIndianCurrency(detailedAmendmentData.DCABudgetBalance)}`
                : '₹0',
            label: 'Budget Balance',
            color: 'indigo'
        }
    ];

    const renderAmendmentItem = (amendment, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-purple-200 dark:border-purple-600 bg-gradient-to-br from-purple-100 to-purple-100 dark:from-purple-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {amendment.CCName || amendment.CCCode}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {amendment.CCCode}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span>{amendment.cc_Type || 'N/A'}</span>
                        </span>
                        <span className="text-gray-500 text-xs">
                            {amendment.AmdDate || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (amendment, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-purple-200 dark:border-purple-600 bg-gradient-to-br from-purple-100 to-purple-100 dark:from-purple-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedAmendment) return null;

        const { totalAddition, totalSubtraction, netChange } = calculateTotals();

        // 🔧 USE NEW FUNCTION TO GET ARRAY
        const detailsArray = getDCADetailsArray();

        const displayData = detailedAmendmentData || selectedAmendment;
        const hasDetailedData = !!detailedAmendmentData;

        return (
            <div className="space-y-6">
                {detailedAmendmentLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading detailed information...
                            </span>
                        </div>
                    </div>
                )}

                {/* CUSTOM HEADER */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Building className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.CCName || displayData.CCCode}
                                </h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                    CC: {displayData.CCCode}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {displayData.cc_Type || 'Performing'} Cost Center
                                    </span>
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                        Status: Open
                                    </span>
                                </div>
                            </div>
                        </div>

                        {hasDetailedData  && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amendment Amount</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    ₹{formatIndianCurrency(parseFloat(netChange))}
                                </p>
                                <p className="text-xs text-indigo-500 dark:text-gray-600 mt-1 bg-indigo-200 p-2 rounded-full inline-block">
                                    {netChange >= 0 ? 'Addition to Budget' : 'Deduction from Budget'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        {hasDetailedData && detailedAmendmentData.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amendment ID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {detailedAmendmentData.MOID}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CC Type</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.cc_Type || 'Performing'}
                            </p>
                        </div>
                        {hasDetailedData && detailedAmendmentData.RefNo && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ref No</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {detailedAmendmentData.RefNo}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                Low
                            </p>
                        </div>
                    </div>


                </div>

                {/* DCA BUDGET DETAILS TABLE */}


                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                <FileCheck className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                DCA Budget Amendment Details
                            </h3>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            {detailsArray.length} {detailsArray.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>

                    {detailsLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-500 dark:text-gray-400">Loading DCA details...</p>
                        </div>
                    ) : detailsArray.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            DCA Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            DCA Name
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Addition
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Subtraction
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {detailsArray.map((dca, index) => {
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {dca.ADCA || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {dca.ADCAName || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                        {parseFloat(dca.AAddition || 0) > 0
                                                            ? `+₹${formatIndianCurrency(parseFloat(dca.AAddition))}`
                                                            : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                        {parseFloat(dca.ASubstraction || 0) > 0
                                                            ? `-₹${formatIndianCurrency(parseFloat(dca.ASubstraction))}`
                                                            : '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    <tr className="bg-gray-100 dark:bg-gray-900 font-bold">
                                        <td colSpan="2" className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                            Total
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400">
                                            +₹{formatIndianCurrency(totalAddition)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 dark:text-red-400">
                                            -₹{formatIndianCurrency(totalSubtraction)}
                                        </td>
                                    </tr>

                                    <tr className="bg-purple-100 dark:bg-purple-900/30 font-bold">
                                        <td colSpan="3" className="px-6 py-4 text-sm text-purple-900 dark:text-purple-100">
                                            Net Change
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${netChange >= 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {netChange >= 0 ? '+' : ''}₹{formatIndianCurrency(Math.abs(netChange))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-8 text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
                            <p className="text-yellow-700 dark:text-yellow-400 font-medium mb-2">
                                No DCA budget details available
                            </p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-500">
                                Check console for data structure debugging
                            </p>
                        </div>
                    )}
                </div>

                {/* AMENDMENT SUMMARY */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                            <IndianRupee className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Amendment Summary
                        </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-600" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Addition</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                ₹{formatIndianCurrency(totalAddition)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                            <TrendingDown className="w-8 h-8 mx-auto mb-3 text-red-600" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subtraction</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                ₹{formatIndianCurrency(totalSubtraction)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                            <IndianRupee className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Change</p>
                            <p className={`text-xl font-bold ${netChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                {netChange >= 0 ? '+' : ''}₹{formatIndianCurrency(Math.abs(netChange))}
                            </p>
                        </div>
                    </div>
                </div>

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
                        checkboxLabel: '✓ I have verified all DCA amendment details',
                        checkboxDescription: 'Including all additions, subtractions, net changes, and supporting documentation',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify DCA additions, subtractions, net change calculations, and approval requirements...',
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
                            ℹ️ No actions available for this amendment
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
                title={`${InboxTitle || 'Cost Center(PCC)'} (${amendmentsList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={amendmentsList.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Building}
                badgeText="Cost Center Management"
                badgeCount={amendmentsList.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, code...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterCCCode,
                        onChange: (e) => setFilterCCCode(e.target.value),
                        defaultLabel: 'All Types',
                        options: ccCodes
                    },
                    {
                        value: filterState,
                        onChange: (e) => setFilterState(e.target.value),
                        defaultLabel: 'All States',
                        options: states
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
                <div className={`grid transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                        ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                        : 'grid-cols-1 lg:grid-cols-3 gap-6'
                    }`}>
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <div
                            onMouseEnter={() => setIsLeftPanelHovered(true)}
                            onMouseLeave={() => setIsLeftPanelHovered(false)}
                            style={{ height: 'calc(100vh - 300px)' }}
                            
                        >
                            <LeftPanel
                                items={filteredAmendments}
                                selectedItem={selectedAmendment}
                                onItemSelect={handleAmendmentSelect}
                                renderItem={renderAmendmentItem}
                                renderCollapsedItem={renderCollapsedItem}
                                isCollapsed={isLeftPanelCollapsed}
                                onCollapseToggle={setIsLeftPanelCollapsed}
                                loading={amendmentsLoading}
                                error={amendmentsError}
                                onRefresh={handleRefresh}
                                config={{
                                    title: 'Pending',
                                    icon: Clock,
                                    emptyMessage: 'No amendments found!',
                                    itemKey: 'CCCode',
                                    enableCollapse: true,
                                    enableRefresh: true,
                                    enableHover: true,
                                    maxHeight: '100%',
                                    headerGradient: 'from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20'
                                }}
                            />
                        </div>
                    </div>

                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-500 rounded-lg">
                                        <FileCheck className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedAmendment ? 'Amendment Verification' : 'Amendment Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh-200px)' }}>
                                {selectedAmendment ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Amendment Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a cost center amendment from the list to view details and take action.
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
                title="Supporting Document"
            />
        </div>
    );
};

export default VerifyDCABudgetAmendment;