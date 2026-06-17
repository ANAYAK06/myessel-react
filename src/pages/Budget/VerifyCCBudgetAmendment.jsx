// VerifyCCBudgetAmendment.jsx - Complete with Remarks History & Attachment Modal
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeft, Building, FileText,
    CheckCircle, XCircle, Clock, AlertCircle, Search, RefreshCw,
    TrendingUp, User, Hash,
    FileCheck, UserCheck,
    FileX, Calculator,
    Clipboard, ChevronDown, ChevronUp,
    ChevronRight, ChevronLeft, TrendingDown,
    Briefcase, FileDown, Eye, X
} from 'lucide-react';

import LeftPanel from '../../components/Inbox/LeftPanel';
import RightDetailPanel from '../../components/Inbox/RightDetailPanel';

// ✅ CC BUDGET AMENDMENT SLICE
import {
    fetchApprovalCCAmendBudgetDetails,
    fetchApprovalCCAmendBudgetById,
    fetchCCUploadDocsExists,
    approveCCBudgetAmend,
    selectApprovalCCAmendBudgetDetailsArray,
    selectCCAmendBudgetData,
    selectDocsExistData,
    selectApprovalCCAmendBudgetDetailsLoading,
    selectCCAmendBudgetDataLoading,

    selectApproveCCBudgetAmendLoading,
    selectApprovalCCAmendBudgetDetailsError,

    selectSelectedRoleId,
    setSelectedRoleId,
    setSelectedUID,
    setSelectedAmendId,
    setSelectedAmendType,
    setSelectedCCCode,
    resetCCAmendBudgetData,
} from '../../slices/budgetSlice/ccBudgetAmendmentSlice';

// ✅ PURCHASE HELPER SLICE (for approval history)
import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedTrno,
    setSelectedMOID
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

// ✅ APPROVAL SLICE
import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    clearError,
    setShowReturnButton
} from '../../slices/CommonSlice/getStatusSlice';

// ✅ AMOUNT HELPER
import {
    formatIndianCurrency,
    getAmountDisplay,
} from '../../utilities/amountToTextHelper';

import { buildCCBudgetAmendmentUrl, isImageFile, isPdfFile } from '../../config/s3Config';

const VerifyCCBudgetAmendment = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ✅ STATE SELECTORS
    const amendmentsList = useSelector(selectApprovalCCAmendBudgetDetailsArray);
    const selectedAmendmentData = useSelector(selectCCAmendBudgetData);
    const docsExistData = useSelector(selectDocsExistData);
    const amendmentsLoading = useSelector(selectApprovalCCAmendBudgetDetailsLoading);
    const amendmentDataLoading = useSelector(selectCCAmendBudgetDataLoading);
    const approvalLoading = useSelector(selectApproveCCBudgetAmendLoading);
    const amendmentsError = useSelector(selectApprovalCCAmendBudgetDetailsError);
    const selectedRoleId = useSelector(selectSelectedRoleId);

    // ✅ REMARKS HISTORY STATE
    const remarks = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    // ✅ STATUS SLICE STATE
    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);

    // ✅ GET USER ID AND ROLE ID
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // ✅ LOCAL STATE
    const [selectedAmendment, setSelectedAmendment] = useState(null);
    const [verificationComment, setVerificationComment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCCCode, setFilterCCCode] = useState('All');
    const [filterAmendType, setFilterAmendType] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState(null);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ✅ INITIALIZE
    useEffect(() => {
        if (roleId && uid && roleId !== selectedRoleId) {
            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUID(uid));
            dispatch(fetchApprovalCCAmendBudgetDetails({ roleId: roleId, uid: uid }));
        }
    }, [roleId, uid, selectedRoleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
    }, [dispatch]);

    // ✅ FETCH STATUS LIST
    useEffect(() => {
        if (selectedAmendmentData?.MOID && roleId) {
            const statusParams = {
                MOID: selectedAmendmentData.MOID,
                ROID: roleId,
                ChkAmt: parseFloat(selectedAmendmentData.AmendedValue || 0)
            };
            dispatch(fetchStatusList(statusParams));
        }
    }, [selectedAmendmentData?.MOID, roleId, dispatch]);

    // ✅ FETCH REMARKS WHEN AMENDMENT IS SELECTED
    useEffect(() => {
        if (selectedAmendment?.CCBudgetAmendmentid && selectedAmendmentData?.MOID) {
            dispatch(setSelectedTrno(selectedAmendment.CCBudgetAmendmentid.toString()));
            dispatch(setSelectedMOID(selectedAmendmentData.MOID));
            dispatch(fetchRemarks({
                trno: selectedAmendmentData.Refno,
                moid: selectedAmendmentData.MOID
            }));
        }
    }, [selectedAmendment?.CCBudgetAmendmentid, selectedAmendmentData?.MOID, dispatch]);

    // ✅ AUTO-COLLAPSE
    useEffect(() => {
        if (selectedAmendment) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedAmendment]);

    // ✅ HELPER FUNCTIONS
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

    const getPriority = (amendment) => {
        if (!amendment) return 'Low';
        const totalAmount = parseFloat(amendment.AmendedValue || 0);
        const amendDate = amendment.AmendmentDate ? new Date(amendment.AmendmentDate) : new Date();
        const today = new Date();
        const daysOld = Math.ceil((today - amendDate) / (1000 * 60 * 60 * 24));

        if (totalAmount > 500000 || daysOld > 30) return 'High';
        if (totalAmount > 200000 || daysOld > 15) return 'Medium';
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

    const getAmendTypeColor = (amendType) => {
        switch (amendType?.toLowerCase()) {
            case 'add': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300';
            case 'deduct': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300';
            case 'transfer': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200';
        }
    };


    const handleViewAttachment = (filePath) => {
        if (!filePath) {
            toast.error('No attachment available');
            return;
        }
        const fullUrl = buildCCBudgetAmendmentUrl(filePath);

        if (!fullUrl) {
            toast.error('Invalid file path')
            return
        }
        console.log('Viewing attachment:', fullUrl);
        setAttachmentUrl(fullUrl);
        setShowAttachmentModal(true);
    };

    const handleCloseAttachmentModal = () => {
        setShowAttachmentModal(false);
        setAttachmentUrl(null);
    };

    // ✅ EVENT HANDLERS
    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleAmendmentSelect = async (amendment) => {
        setSelectedAmendment(amendment);
        dispatch(setSelectedAmendId(amendment.CCBudgetAmendmentid));
        dispatch(setSelectedAmendType(amendment.AmendmentType));
        dispatch(setSelectedCCCode(amendment.CCCode));

        dispatch(fetchApprovalCCAmendBudgetById({
            amendId: amendment.CCBudgetAmendmentid,
            amendType: amendment.AmendmentType
        }));

        if (amendment.CCCode && uid) {
            dispatch(fetchCCUploadDocsExists({
                ccCode: amendment.CCCode,
                uid: uid
            }));
        }


        setIsVerified(false);
        setShowRemarksHistory(false);
    };

    const buildAmendmentApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            selectedAmendmentData?.Remarks,
            currentRoleName,
            currentUser,
            verificationComment
        );

        return {
            AmendedValue: selectedAmendmentData?.AmendedValue || "0",
            AmendmentType: selectedAmendment.AmendmentType,
            ApprovalNote: verificationComment,
            BudgetId: selectedAmendmentData?.BudgetId?.toString() || "",
            CCBudgetAmendmentid: selectedAmendment.CCBudgetAmendmentid.toString(),
            CCCode: selectedAmendmentData?.CCCode || selectedAmendment.CCCode,
            CreatedBy: currentUser,
            Roleid: (roleId || selectedRoleId).toString(),
            VerificationType: actionValue
        };
    };

    const onActionClick = async (action) => {
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
            const payload = buildAmendmentApprovalPayload(actionValue);
            const result = await dispatch(approveCCBudgetAmend(payload)).unwrap();

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
                dispatch(fetchApprovalCCAmendBudgetDetails({ roleId: roleId || selectedRoleId, uid: uid }));
                setSelectedAmendment(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetCCAmendBudgetData());
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

    // ✅ RENDER REMARKS HISTORY (exactly like SPPO page)
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
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"></div>
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
                                        {remark.ActionDate && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(remark.ActionDate).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ✅ RENDER ATTACHMENT MODAL
    const renderAttachmentModal = () => {
        if (!showAttachmentModal) return null;

        const isImage = isImageFile(attachmentUrl);
        const isPdf = isPdfFile(attachmentUrl);

        return (
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black bg-opacity-75 p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <FileDown className="w-5 h-5 mr-2 text-indigo-600" />
                            Supporting Document
                        </h3>
                        <div className="flex items-center space-x-2">
                            <a
                                href={attachmentUrl}
                                download
                                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1"
                            >
                                <FileDown className="w-4 h-4" />
                                <span>Download</span>
                            </a>
                            <button
                                onClick={handleCloseAttachmentModal}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                        {isImage ? (
                            <div className="flex items-center justify-center">
                                <img
                                    src={attachmentUrl}
                                    alt="Attachment"
                                    className="max-w-full h-auto rounded-lg shadow-lg"
                                />
                            </div>
                        ) : isPdf ? (
                            <iframe
                                src={attachmentUrl}
                                className="w-full h-[calc(90vh-120px)] rounded-lg border border-gray-300 dark:border-gray-600"
                                title="PDF Viewer"
                            />
                        ) : (
                            <div className="text-center py-12">
                                <FileDown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Preview not available for this file type
                                </p>
                                <a
                                    href={attachmentUrl}
                                    download
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <FileDown className="w-4 h-4" />
                                    <span>Download File</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ✅ FILTER AMENDMENTS
    const filteredAmendments = amendmentsList.filter(amendment => {
        const matchesSearch = amendment.CCCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            amendment.CCBudgetAmendmentid?.toString().includes(searchQuery) ||
            amendment.CCName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            amendment.OtherCCCode?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCCCode = filterCCCode === 'All' || amendment.CCCode === filterCCCode;
        const matchesAmendType = filterAmendType === 'All' || amendment.AmendmentType === filterAmendType;

        return matchesSearch && matchesCCCode && matchesAmendType;
    });

    const ccCodes = [...new Set(amendmentsList.map(a => a.CCCode).filter(Boolean))];
    const amendTypes = [...new Set(amendmentsList.map(a => a.AmendmentType).filter(Boolean))];

    // ✅ RENDER ACTION BUTTONS (exactly like SPPO page)
    const renderActionButtons = () => {
        if (statusLoading) {
            return (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"></div>
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
                            if (selectedAmendmentData?.MOID && roleId) {
                                dispatch(fetchStatusList({
                                    MOID: selectedAmendmentData.MOID,
                                    ROID: roleId,
                                    ChkAmt: parseFloat(selectedAmendmentData.AmendedValue || 0)
                                }));
                            }
                        }}
                        className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        if (!hasActions) {
            return (
                <div className="text-center py-6">
                    <div className="text-gray-500 mb-2">No actions available for this amendment</div>
                </div>
            );
        }

        const filteredActions = enabledActions.filter(action => action.type.toLowerCase() !== 'send back');
        console.log('ðŸ” Actions Debug:', {
            originalCount: enabledActions.length,
            original: enabledActions,
            filteredCount: filteredActions.length,
            filtered: filteredActions
        });

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

        const isDisabled = approvalLoading || verificationComment.trim() === '' || !isVerified;

        return (
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Available Actions ({filteredActions.length})
                    </p>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className={`flex items-center space-x-1 text-sm ${isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                            <CheckCircle className={`w-4 h-4 ${isVerified ? 'text-green-600' : 'text-orange-600'}`} />
                            <span>Verification: {isVerified ? 'Completed' : 'Required'}</span>
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${verificationComment.trim() ? 'text-green-600' : 'text-orange-600'}`}>
                            <FileText className={`w-4 h-4 ${verificationComment.trim() ? 'text-green-600' : 'text-orange-600'}`} />
                            <span>Comments: {verificationComment.trim() ? 'Added' : 'Required'}</span>
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
                                    verificationComment.trim() === '' ? 'Please add verification comments first' :
                                        !isVerified ? 'Please check the verification checkbox' :
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

    // ✅ RENDER LEFT PANEL ITEM
    const renderItemCard = (amendment, isSelected) => {
        const priority = getPriority(amendment);
        const totalAmount = parseFloat(amendment.AmendedValue || 0);
        const amountDisplay = getAmountDisplay(totalAmount);

        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-200 bg-gradient-to-br from-indigo-100 to-indigo-100 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {amendment.CCName || amendment.CCCode}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{amendment.CCCode}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(priority)}`}>
                        {priority}
                    </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span className="truncate">{amendment.CCBudgetAmendmentid}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getAmendTypeColor(amendment.AmendmentType)}`}>
                            {amendment.AmendmentType}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">₹{amountDisplay.formatted}</span>
                        <span className="text-gray-500 text-xs">
                            {amendment.AmendmentDate ? new Date(amendment.AmendmentDate).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    {amendment.OtherCCCode && (
                        <div className="flex items-center space-x-1 mt-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-700">
                            <ChevronLeft className="w-3 h-3 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium truncate">
                                From: {amendment.OtherCCCode}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (amendment) => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-100 to-indigo-100 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-indigo-600" />
        </div>
    );

    // ✅ RENDER DETAIL CONTENT
    const renderDetailContent = (isPopup = false) => {
        if (amendmentDataLoading) {
            return (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading detailed information...</p>
                </div>
            );
        }

        if (!selectedAmendmentData) {
            return (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading amendment details...</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Amendment Header */}
                <div className="p-6 rounded-xl border-2 bg-gradient-to-r from-indigo-50 via-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:via-indigo-900/20 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center shadow-lg">
                                    <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                    {selectedAmendmentData.CCName || selectedAmendmentData.CCCode}
                                </h3>
                                <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                                    Amendment ID: {selectedAmendmentData.CCBudgetAmendmentid}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`px-3 py-1 text-sm rounded-full border ${getAmendTypeColor(selectedAmendmentData.AmendmentType)}`}>
                                        {selectedAmendmentData.AmendmentType}
                                    </span>
                                    <span className="px-3 py-1 text-sm rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-opacity-20 dark:border-opacity-50">
                                        {selectedAmendmentData.CCCode}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                                ₹{formatIndianCurrency(selectedAmendmentData.AmendedValue)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Amendment Amount</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Amendment Date</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {selectedAmendmentData.AmendmentDate ? new Date(selectedAmendmentData.AmendmentDate).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 block">CC Type</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedAmendmentData.CCType || 'N/A'}</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Ref No</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{selectedAmendmentData.Refno || 'N/A'}</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Priority</span>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getPriorityColor(getPriority(selectedAmendment))}`}>
                                {getPriority(selectedAmendment)}
                            </span>
                        </div>
                    </div>

                    {selectedAmendment?.OtherCCCode && (
                        <div className="mt-4 bg-indigo-600/10 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-600 rounded-lg px-4 py-3 flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center flex-shrink-0">
                                <ChevronLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">
                                    Budget Transfer Source
                                </span>
                                <span className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
                                    Transferred from Cost Center: {selectedAmendment.OtherCCCode}
                                </span>
                            </div>
                        </div>
                    )}

                    {selectedAmendmentData.FilePath && (
                        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <FileDown className="w-5 h-5 text-green-600" />
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                                            Supporting Document Available
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {selectedAmendmentData.FilePath.split('/').pop()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleViewAttachment(selectedAmendmentData.FilePath)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>View</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Budget Comparison Table */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-4 flex items-center">
                        <Calculator className="w-5 h-5 mr-2" />
                        Budget Comparison
                    </h4>
                    <div className="overflow-hidden rounded-xl border border-indigo-200 dark:border-indigo-700">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-indigo-600 text-white">
                                    <th className="px-4 py-3 text-left font-semibold w-8">#</th>
                                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                                    <th className="px-4 py-3 text-right font-semibold">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-100 dark:divide-indigo-800">
                                <tr className="bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-medium text-gray-800 dark:text-gray-200">Existing Total Basic Budget</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="font-bold text-gray-900 dark:text-white text-base">
                                            ₹{formatIndianCurrency(
                                                selectedAmendmentData.AmendmentType === 'Add'
                                                    ? parseFloat(selectedAmendmentData.OldBudget || 0) - parseFloat(selectedAmendmentData.AmendedValue || 0)
                                                    : parseFloat(selectedAmendmentData.OldBudget || 0) + parseFloat(selectedAmendmentData.AmendedValue || 0)
                                            )}
                                        </span>
                                    </td>
                                </tr>
                                <tr className={`hover:bg-opacity-80 transition-colors ${selectedAmendmentData.AmendmentType === 'Add' ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                                    <td className="px-4 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedAmendmentData.AmendmentType === 'Add' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                            {selectedAmendmentData.AmendmentType === 'Add'
                                                ? <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                : <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            }
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {selectedAmendment?.OtherCCCode
                                                    ? `Amount Transferred from ${selectedAmendment.OtherCCCode}`
                                                    : 'Amendment Requested Value'
                                                }
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${getAmendTypeColor(selectedAmendmentData.AmendmentType)}`}>
                                                {selectedAmendmentData.AmendmentType}
                                            </span>
                                        </div>
                                        {selectedAmendment?.OtherCCCode && (
                                            <div className="flex items-center space-x-1 mt-1">
                                                <ChevronLeft className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                    Source CC: {selectedAmendment.OtherCCCode}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className={`font-bold text-base ${selectedAmendmentData.AmendmentType === 'Add' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                            {selectedAmendmentData.AmendmentType === 'Add' ? '+' : '-'}₹{formatIndianCurrency(selectedAmendmentData.AmendedValue)}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center">
                                            <Calculator className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-semibold text-indigo-800 dark:text-indigo-200">Revised Total Basic Budget</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="font-bold text-indigo-700 dark:text-indigo-300 text-base">
                                            ₹{formatIndianCurrency(selectedAmendmentData.OldBudget)}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-medium text-gray-800 dark:text-gray-200">Balance Budget before Amendment</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="font-bold text-amber-700 dark:text-amber-400 text-base">
                                            ₹{formatIndianCurrency(selectedAmendmentData.OldBudgetBalance)}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-semibold text-emerald-800 dark:text-emerald-200">Balance Budget After Amendment</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-base">
                                            ₹{formatIndianCurrency(selectedAmendmentData.NewBudgetBalance)}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedAmendmentData.Remarks && (
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center">
                            <Clipboard className="w-5 h-5 mr-2" />
                            Amendment Justification
                        </h4>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {selectedAmendmentData.Remarks}
                            </p>
                        </div>
                    </div>
                )}

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

                {renderRemarksHistory()}

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border-2 border-green-200 dark:border-green-700">
                    <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isVerified}
                            onChange={(e) => setIsVerified(e.target.checked)}
                            className="w-5 h-5 mt-1 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div>
                            <span className="font-semibold text-green-800 dark:text-green-200 block">
                                ✓ I have verified all amendment details
                            </span>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                Including budget amounts, CC code, amendment type, justification, and supporting documents
                            </p>
                        </div>
                    </label>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 rounded-xl border-2 border-red-200 dark:border-red-700">
                    <label className="text-sm font-bold text-red-800 dark:text-red-200 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="text-red-600 dark:text-red-400">*</span> Verification Comments (Mandatory)
                    </label>
                    <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                        Please verify budget amendment amounts, justification, supporting documents, and ensure proper authorization.
                    </p>
                    <textarea
                        value={verificationComment}
                        onChange={(e) => setVerificationComment(e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 transition-all ${verificationComment.trim() === ''
                            ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                            }`}
                        rows="4"
                        placeholder="Please verify budget amendment amounts, justification, supporting documents, and approval requirements..."
                        required
                    />
                    {verificationComment.trim() === '' && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                            Verification comment is required before proceeding
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    {renderActionButtons()}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Attachment Modal */}
            {renderAttachmentModal()}

            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 shadow-xl shadow-blue-900/20 p-7 text-white">
                {/* Dot pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                {/* Orange glow blob */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackToInbox}
                            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                            <Briefcase className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-orange-200 uppercase tracking-wider bg-orange-500/25 px-2 py-0.5 rounded-full border border-orange-400/30">
                                    Budget Module
                                </span>
                                <span className="px-2 py-0.5 text-xs bg-red-500/80 text-white rounded-full font-semibold">
                                    {amendmentsList.length} Pending
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                {InboxTitle || 'CC Budget Amendment Verification'}
                            </h1>
                            <p className="text-blue-200 text-sm mt-0.5">
                                {ModuleDisplayName} &bull; {amendmentsList.length} amendments pending verification
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="relative mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-blue-300" />
                            <input
                                type="text"
                                placeholder="Search by CC code, amendment ID, CC name, source CC..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/10 text-white placeholder-blue-300 border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterCCCode}
                            onChange={(e) => setFilterCCCode(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400 backdrop-blur-sm"
                        >
                            <option value="All" className="text-gray-900">All Cost Centers</option>
                            {ccCodes.map(ccCode => (
                                <option key={ccCode} value={ccCode} className="text-gray-900">{ccCode}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterAmendType}
                            onChange={(e) => setFilterAmendType(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400 backdrop-blur-sm"
                        >
                            <option value="All" className="text-gray-900">All Types</option>
                            {amendTypes.map(amendType => (
                                <option key={amendType} value={amendType} className="text-gray-900">{amendType}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div
                className={`grid transition-all duration-300 ${
                    isLeftPanelCollapsed && !isLeftPanelHovered
                        ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                        : 'grid-cols-1 lg:grid-cols-3 gap-6'
                }`}
                onMouseLeave={() => {
                    if (selectedAmendment && isLeftPanelCollapsed) setIsLeftPanelHovered(false);
                }}
            >
                <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                    <LeftPanel
                        items={filteredAmendments}
                        selectedItem={selectedAmendment}
                        onItemSelect={handleAmendmentSelect}
                        renderItem={renderItemCard}
                        renderCollapsedItem={renderCollapsedItem}
                        isCollapsed={isLeftPanelCollapsed}
                        onCollapseToggle={setIsLeftPanelCollapsed}
                        isHovered={isLeftPanelHovered}
                        onHoverChange={setIsLeftPanelHovered}
                        loading={amendmentsLoading}
                        error={amendmentsError}
                        onRefresh={() => dispatch(fetchApprovalCCAmendBudgetDetails({ roleId, uid }))}
                        config={{
                            title: 'Pending Verification',
                            icon: Clock,
                            emptyMessage: 'No amendments found!',
                            itemKey: 'CCBudgetAmendmentid',
                            enableCollapse: true,
                            enableRefresh: true,
                            enableHover: true,
                            maxHeight: '100%',
                            headerGradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/20'
                        }}
                        renderPopupContent={(_item) => renderDetailContent(true)}
                        popupConfig={{
                            title: 'CC Budget Amendment',
                            icon: Briefcase,
                            headerGradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/20',
                        }}
                    />
                </div>

                <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                    <RightDetailPanel
                        selectedItem={selectedAmendment}
                        loading={amendmentDataLoading}
                        renderContent={renderDetailContent}
                        config={{
                            title: 'CC Budget Amendment',
                            icon: Briefcase,
                            selectedTitle: 'Amendment Verification',
                            emptyTitle: 'No Amendment Selected',
                            emptyMessage: 'Select a CC budget amendment from the list to view details and take action.',
                            headerGradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/20',
                            maxHeight: 'calc(100vh - 200px)',
                            sticky: true,
                            stickyTop: '1.5rem',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VerifyCCBudgetAmendment;
