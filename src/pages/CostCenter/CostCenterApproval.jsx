// CostCenterApproval.jsx - Cost Center Approval with Enhanced Features
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeft, Building, Calendar, FileText,
    CheckCircle, XCircle, Clock, AlertCircle, Search, RefreshCw,
    User, MapPin, Hash, Target, TrendingUp,
    Package, BadgeCheck, X, Eye, FileCheck,
    Timer, UserCheck, CircleIndianRupee, FileBarChart,
    FileX, ArrowUpCircle, Percent, Calculator,
    CreditCard, FileSpreadsheet, Clipboard,
    Landmark, CheckSquare, ArrowRightLeft, Layers, ExternalLink,
    AlertTriangle, Download, ClipboardList, Receipt, Edit3,
    BarChart3, History, MousePointer, Info, ChevronDown, ChevronUp,
    ChevronRight, ChevronLeft, Maximize2, Minimize2, Square, CheckBox,
    DollarSign, TrendingDown, RefreshCcw, AlertOctagon, Briefcase,
    Users, Settings, Award, Star, Phone, Mail, Home, UserCircle,
    FileBarChart2, Shield, Globe, Activity
} from 'lucide-react';

// COST CENTER SLICE IMPORTS
import {
    fetchApprovalCostCenterDetails,
    fetchApprovalCCbyCC,
    approveCostCenter,
    selectApprovalCostCenterDetails,
    selectApprovalCostCenterDetailsArray,
    selectCCData,
    selectSelectedRoleId,
    selectApprovalCostCenterDetailsLoading,
    selectCCDataLoading,
    selectApproveCostCenterLoading,
    selectApprovalCostCenterDetailsError,
    setSelectedRoleId,
    setSelectedUID,
    setSelectedCCCode,
    setSelectedUserId,
    resetCCData
} from '../../slices/costCenterSlice/costCenterAppprovalSlice';

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

const CostCenterApproval = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // COST CENTER STATE
    const approvalCostCenterDetails = useSelector(selectApprovalCostCenterDetailsArray);
    const selectedCCData = useSelector(selectCCData);
    const ccDetailsLoading = useSelector(selectApprovalCostCenterDetailsLoading);
    const ccDataLoading = useSelector(selectCCDataLoading);
    const approvalLoading = useSelector(selectApproveCostCenterLoading);
    const ccDetailsError = useSelector(selectApprovalCostCenterDetailsError);
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
    const [selectedCC, setSelectedCC] = useState(null);
    const [approvalComment, setApprovalComment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCCType, setFilterCCType] = useState('All');
    const [filterState, setFilterState] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);

    const [pdfModal, setPdfModal] = useState({
            isOpen: false,
            title: '',
            url: '',
            type: ''
        });
    

    // EXTRACT NOTIFICATION DATA
    const {
        InboxTitle,
        ModuleDisplayName
    } = notificationData || {};

    // INITIALIZE WITH ROLE ID AND USER ID FROM AUTH STATE
    useEffect(() => {
        if (roleId && uid && roleId !== selectedRoleId) {
            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUID(uid));
            dispatch(fetchApprovalCostCenterDetails({ roleId: roleId, uid: uid }));
        }
    }, [roleId, uid, selectedRoleId, dispatch, userData]);

    useEffect(() => {
        if (selectedCCData?.MOID && roleId) {
            const statusParams = {
                MOID: selectedCCData.MOID,
                ROID: roleId,
                ChkAmt: selectedCCData.DayLimit || 0
            };
            dispatch(fetchStatusList(statusParams));
        }
    }, [selectedCCData?.MOID, roleId, dispatch]);

    // FETCH REMARKS WHEN CC IS SELECTED
    useEffect(() => {
        if (selectedCC?.CCCode && selectedCCData?.MOID) {
            dispatch(setSelectedTrno(selectedCC.CCCode));
            dispatch(setSelectedMOID(selectedCCData.MOID));
            dispatch(fetchRemarks({ trno: selectedCC.CCCode, moid: selectedCCData.MOID }));
        }
    }, [selectedCC?.CCCode, selectedCCData?.MOID, dispatch]);

    // Auto-collapse left panel when CC is selected
    useEffect(() => {
        if (selectedCC) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedCC]);

    // HELPER FUNCTIONS
    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'CC Approver';
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

    const getPriority = (cc) => {
        if (!cc) return 'Low';
        const dayLimit = cc.DayLimit || 0;
        const status = parseInt(cc.status || 0);

        if (dayLimit > 50000 || status === 1) return 'High';
        if (dayLimit > 25000 || status === 2) return 'Medium';
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

    const buildPdfUrl = (fileName, type) => {
        if (!fileName) return null;

        const baseUrls = {
            scope: 'https://sltouch-rdsbackup-bucket.s3.us-east-2.amazonaws.com/Upload+docs/CostCenterPROD',
            workorder: 'https://sltouch-rdsbackup-bucket.s3.us-east-2.amazonaws.com/Upload+docs/CostCenterPROD'
        };

        return `${baseUrls[type]}/${fileName}`;
    };

     const openPdfViewer = (fileName, title, type) => {
            const url = buildPdfUrl(fileName, type);
            if (url) {
                setPdfModal({
                    isOpen: true,
                    title,
                    url,
                    type
                });
            } else {
                toast.error('PDF file not available');
            }
        };
    

    // EVENT HANDLERS
    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleCCSelect = async (cc) => {
        setSelectedCC(cc);
        dispatch(setSelectedCCCode(cc.CCCode));
        dispatch(setSelectedUserId(uid));

        try {
            await dispatch(fetchApprovalCCbyCC({ 
                ccCode: cc.CCCode, 
                userId: uid
            })).unwrap();
        } catch (error) {
            console.error('CC Details API Error:', error);
        }

        // Reset states when new CC is selected
        setShowRemarksHistory(false);
    };

    const buildCCApprovalPayload = (actionValue, selectedCC, selectedCCData, approvalComment) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            selectedCCData?.RemarksNote,
            currentRoleName,
            currentUser,
            approvalComment
        );

        const payload = {
            CCCode: selectedCC.CCCode,
            ApprovalNote: approvalComment,
            Remarks: updatedRemarks,
            Action: actionValue,
            RoleId: roleId || selectedRoleId,
            Userid: uid,
            Createdby: getCurrentUser(),
            ApprovalStatus: actionValue,
            ...(selectedCCData?.MOID && { MOID: selectedCCData.MOID }),
            ...(selectedCCData?.CC_Id && { CC_Id: selectedCCData.CC_Id }),
        };

        return payload;
    };

    const onActionClick = async (action) => {
        if (!selectedCC) {
            toast.error('No Cost Center selected');
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
            const payload = buildCCApprovalPayload(
                actionValue,
                selectedCC,
                selectedCCData,
                approvalComment
            );

            const result = await dispatch(approveCostCenter(payload)).unwrap();

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
                dispatch(fetchApprovalCostCenterDetails({ roleId: roleId || selectedRoleId, uid: uid }));
                setSelectedCC(null);
                setApprovalComment('');
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetCCData());
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

    const PdfModal = () => {
        if (!pdfModal.isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-hidden">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={() => setPdfModal({ isOpen: false, title: '', url: '', type: '' })}
                ></div>

                {/* Modal Container */}
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 max-w-6xl w-full h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-2xl">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {pdfModal.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {pdfModal.type === 'scope' ? 'Contract Scope Document' : 'Client Work Order Document'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Download Button */}
                                <a
                                    href={pdfModal.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                    title="Download PDF"
                                >
                                    <Download className="w-5 h-5" />
                                </a>

                                {/* Open in New Tab */}
                                <a
                                    href={pdfModal.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                    title="Open in New Tab"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>

                                {/* Close Button */}
                                <button
                                    onClick={() => setPdfModal({ isOpen: false, title: '', url: '', type: '' })}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* PDF Viewer Content */}
                        <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
                            <iframe
                                src={pdfModal.url}
                                className="w-full h-full border-0 rounded-lg shadow-inner"
                                title={pdfModal.title}
                                onError={() => {
                                    toast.error('Failed to load PDF. Please try downloading instead.');
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // FILTER COST CENTERS BASED ON SEARCH AND FILTERS
    const filteredCostCenters = approvalCostCenterDetails.filter(cc => {
        const matchesSearch = cc.CCName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cc.CCCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cc.CCInchargeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cc.State?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCCType = filterCCType === 'All' || cc.CCType === filterCCType;
        const matchesState = filterState === 'All' || cc.State === filterState;

        return matchesSearch && matchesCCType && matchesState;
    });

    const ccTypes = [...new Set(approvalCostCenterDetails.map(cc => cc.CCType).filter(Boolean))];
    const states = [...new Set(approvalCostCenterDetails.map(cc => cc.State).filter(Boolean))];

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
                            if (selectedCCData?.MOID && roleId) {
                                dispatch(fetchStatusList({
                                    MOID: selectedCCData.MOID,
                                    ROID: roleId,
                                    ChkAmt: selectedCCData.DayLimit || 0
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
                    <div className="text-gray-500 mb-2">No actions available for this Cost Center</div>
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
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackToInbox}
                            className="p-2 text-purple-100 hover:text-white hover:bg-purple-500 rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-500 rounded-xl shadow-inner">
                                <Building className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {InboxTitle || 'Cost Center Approval'}
                                </h1>
                                <p className="text-purple-100 mt-1">
                                    {ModuleDisplayName} • {approvalCostCenterDetails.length} Cost Centers pending
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-4 py-2 bg-purple-500 text-purple-100 text-sm rounded-full border border-purple-400">
                            Cost Center Management
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full shadow-md">
                            {approvalCostCenterDetails.length} Pending
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-purple-200" />
                            <input
                                type="text"
                                placeholder="Search by name, code, incharge, state..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-purple-500/50 text-white placeholder-purple-200 border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterCCType}
                            onChange={(e) => setFilterCCType(e.target.value)}
                            className="w-full px-3 py-2.5 bg-purple-500/50 text-white border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
                        >
                            <option value="All">All Types</option>
                            {ccTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterState}
                            onChange={(e) => setFilterState(e.target.value)}
                            className="w-full px-3 py-2.5 bg-purple-500/50 text-white border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
                        >
                            <option value="All">All States</option>
                            {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{approvalCostCenterDetails.length}</p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">Total Cost Centers</p>
                            </div>
                        </div>
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-3">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
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
                                    {approvalCostCenterDetails.filter(cc => getPriority(cc) === 'High').length}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">High Priority</p>
                            </div>
                        </div>
                        <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2 mt-3">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${approvalCostCenterDetails.length > 0 ? (approvalCostCenterDetails.filter(cc => getPriority(cc) === 'High').length / approvalCostCenterDetails.length) * 100 : 0}%` }}></div>
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
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{states.length}</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">States</p>
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
                                    ₹{formatIndianCurrency(approvalCostCenterDetails.reduce((sum, cc) => sum + (cc.DayLimit || 0), 0))}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">Total Day Limit</p>
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
                {/* Collapsible Cost Centers List */}
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
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                {(isLeftPanelCollapsed && !isLeftPanelHovered) ? (
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                                            <Clock className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-xs text-purple-600 dark:text-purple-400 font-bold transform -rotate-90 whitespace-nowrap">
                                            {filteredCostCenters.length}
                                        </span>
                                        <button
                                            onClick={() => setIsLeftPanelCollapsed(false)}
                                            className="p-1 text-purple-600 hover:text-purple-800 rounded hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                                            title="Expand Panel"
                                        >
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                                                <Clock className="w-4 h-4 text-white" />
                                            </div>
                                            <span>Pending ({filteredCostCenters.length})</span>
                                        </h2>
                                        <div className="flex items-center space-x-2">
                                            {selectedCC && (
                                                <button
                                                    onClick={() => setIsLeftPanelCollapsed(true)}
                                                    className="p-2 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                                                    title="Collapse Panel"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    dispatch(fetchApprovalCostCenterDetails({ roleId: roleId || selectedRoleId, uid: uid }));
                                                }}
                                                className="p-2 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                                                title="Refresh"
                                                disabled={ccDetailsLoading}
                                            >
                                                <RefreshCw className={`w-4 h-4 ${ccDetailsLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Cost Center List Content */}
                        <div className={`p-4 max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'w-16' : 'w-full'
                            }`}>
                            {ccDetailsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && <p className="text-gray-500">Loading...</p>}
                                </div>
                            ) : ccDetailsError ? (
                                <div className="text-center py-8">
                                    <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && (
                                        <>
                                            <p className="text-red-500 mb-2">Error loading data</p>
                                            <button
                                                onClick={() => {
                                                    dispatch(fetchApprovalCostCenterDetails({ roleId: roleId || selectedRoleId, uid: uid }));
                                                }}
                                                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                Retry
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : filteredCostCenters.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && <p className="text-gray-500">No Cost Centers found!</p>}
                                </div>
                            ) : (
                                <div className={`space-y-3 ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'flex flex-col items-center' : ''}`}>
                                    {filteredCostCenters.map((cc) => {
                                        const priority = getPriority(cc);
                                        const dayLimit = cc.DayLimit || 0;
                                        const amountDisplay = getAmountDisplay(dayLimit);

                                        return (
                                            <div
                                                key={cc.CCCode}
                                                className={`rounded-xl cursor-pointer transition-all hover:shadow-md border-2 ${selectedCC?.CCCode === cc.CCCode
                                                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-lg'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 bg-white dark:bg-gray-800'
                                                    } ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'w-12 h-12 p-1' : ''}`}
                                                onClick={() => handleCCSelect(cc)}
                                                title={isLeftPanelCollapsed && !isLeftPanelHovered ? `${cc.CCName} - ${cc.CCCode}` : ''}
                                            >
                                                {(isLeftPanelCollapsed && !isLeftPanelHovered) ? (
                                                    <div className="w-full h-full rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                                        <Building className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-4">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className="relative">
                                                                <div className="w-12 h-12 rounded-full border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                                                    <Building className="w-5 h-5 text-purple-600" />
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                                    {cc.CCName}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 truncate">{cc.CCInchargeName}</p>
                                                            </div>
                                                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(priority)}`}>
                                                                {priority}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center space-x-1">
                                                                    <Hash className="w-3 h-3" />
                                                                    <span className="truncate">{cc.CCCode}</span>
                                                                </span>
                                                                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(cc.status)}`}>
                                                                    Status: {cc.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-purple-600 dark:text-purple-400 font-medium">₹{amountDisplay.formatted}</span>
                                                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{cc.CCType}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-500 text-xs">
                                                                    <MapPin className="w-3 h-3 inline mr-1" />
                                                                    {cc.State}
                                                                </span>
                                                                <span className="text-gray-500 text-xs">
                                                                    Day Limit: ₹{formatIndianCurrency(cc.DayLimit)}
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

                {/* Cost Center Details Panel with Dynamic Width */}
                <div className={`transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                    ? 'lg:col-span-11'
                    : 'lg:col-span-2'
                    }`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors sticky top-6">
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                                    <FileCheck className="w-4 h-4 text-white" />
                                </div>
                                <span>{selectedCC ? 'Cost Center Approval' : 'Select a Cost Center'}</span>
                            </h2>
                        </div>

                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {selectedCC ? (
                                <div className="space-y-6">
                                    {ccDataLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading detailed information...</p>
                                        </div>
                                    ) : selectedCCData ? (
                                        <>
                                            {/* Enhanced Cost Center Header */}
                                            <div className="p-6 rounded-xl border-2 bg-gradient-to-r from-indigo-50 via-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center shadow-lg">
                                                                <Building className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                                <CheckCircle className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                                                {selectedCCData.CCName}
                                                            </h3>
                                                            <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                                                                CC: {selectedCCData.CCCode}
                                                            </p>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="px-3 py-1 text-sm rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-opacity-20 dark:border-opacity-50">
                                                                    {selectedCCData.CCType} Cost Center
                                                                </span>
                                                                <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(selectedCCData.status)}`}>
                                                                    Status: {selectedCCData.CC_Status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                                                            ₹{formatIndianCurrency(selectedCCData.DayLimit)}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Day Limit</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Voucher: ₹{formatIndianCurrency(selectedCCData.VoucherLimit)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">CC ID</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.CC_Id}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Sub Type</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.SubType}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">State</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.State}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Store Type</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.StoreType}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Document Viewer Section - NEW ADDITION */}
                                            {(selectedCCData.contractscope || selectedCCData.contractpretenderBudget) && (
                                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                                                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                                                        <FileText className="w-5 h-5 mr-2" />
                                                        Contract Documents
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Contract Scope Document */}
                                                        {selectedCCData.contractscope && (
                                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-600">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="p-2 bg-green-500 rounded-lg">
                                                                            <CheckSquare className="w-4 h-4 text-white" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-green-800 dark:text-green-200">Scope Check List</p>
                                                                            <p className="text-xs text-green-600 dark:text-green-400">Approved by Contracts</p>
                                                                            <p className="text-xs text-green-600 dark:text-green-400 font-mono">{selectedCCData.contractscope}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => openPdfViewer(
                                                                            selectedCCData.contractscope,
                                                                            `Contract Scope: ${selectedCCData.CCCode}`,
                                                                            'scope'
                                                                        )}
                                                                        className="flex items-center space-x-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors shadow-md hover:shadow-lg"
                                                                        title="View Contract Scope PDF"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        <span>View</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Client Work Order Document */}
                                                        {selectedCCData.contractpretenderBudget && (
                                                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="p-2 bg-indigo-500 rounded-lg">
                                                                            <FileBarChart className="w-4 h-4 text-white" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-indigo-800 dark:text-indigo-200">Client Work Order</p>
                                                                            <p className="text-xs text-indigo-600 dark:text-indigo-400">T&C Approved by Contracts</p>
                                                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">{selectedCCData.contractpretenderBudget}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => openPdfViewer(
                                                                            selectedCCData.contractpretenderBudget,
                                                                            `Client Work Order: ${selectedCCData.CCCode}`,
                                                                            'workorder'
                                                                        )}
                                                                        className="flex items-center space-x-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors shadow-md hover:shadow-lg"
                                                                        title="View Client Work Order PDF"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        <span>View</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* If no documents available */}
                                                    {!selectedCCData.contractscope && !selectedCCData.contractpretenderBudget && (
                                                        <div className="text-center py-4">
                                                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">No contract documents available</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Cost Center Details */}
                                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                                                <h4 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center mb-4">
                                                    <Settings className="w-5 h-5 mr-2" />
                                                    Cost Center Information
                                                </h4>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                                <UserCircle className="w-4 h-4 mr-2" />
                                                                Incharge Details
                                                            </h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-500">Name:</span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.CCInchargeName}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-500">Phone:</span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.InchargePhNo}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-500">CC Phone:</span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.PhoneNo}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                                <Home className="w-4 h-4 mr-2" />
                                                                Location Details
                                                            </h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Address:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedCCData.SiteAddress}</p>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-500">State:</span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.State}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                                <FileBarChart2 className="w-4 h-4 mr-2" />
                                                                Financial Limits
                                                            </h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-500">Day Limit:</span>
                                                                    <span className="font-medium text-green-600 dark:text-green-400">₹{formatIndianCurrency(selectedCCData.DayLimit)}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-500">Voucher Limit:</span>
                                                                    <span className="font-medium text-orange-600 dark:text-orange-400">₹{formatIndianCurrency(selectedCCData.VoucherLimit)}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                                <Activity className="w-4 h-4 mr-2" />
                                                                Project Details
                                                            </h5>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Group:</span>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedCCData.Group || 'Not Assigned'}</p>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-500">Store Applicable:</span>
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.IsStoreApplicable}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contract & Offer Details */}
                                            {(selectedCCData.EPPLFinalOfferNo || selectedCCData.ClientAcceptanceReferenceNo) && (
                                                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
                                                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center">
                                                        <Clipboard className="w-5 h-5 mr-2" />
                                                        Contract & Offer Details
                                                    </h4>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        {selectedCCData.EPPLFinalOfferNo && (
                                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-gray-500">Final Offer No:</span>
                                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.EPPLFinalOfferNo}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-gray-500">Offer Date:</span>
                                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.UpFinalOfferDate}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {selectedCCData.ClientAcceptanceReferenceNo && (
                                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-gray-500">Client Ref No:</span>
                                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.ClientAcceptanceReferenceNo}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-gray-500">Acceptance Date:</span>
                                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.UpClientAcceptanceDate}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Client Details */}
                                            {(selectedCCData.ClientInchargeName || selectedCCData.ClientInchargePhNo || selectedCCData.ClientInchargemailid) && (
                                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                                                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                                                        <Users className="w-5 h-5 mr-2" />
                                                        Client Information
                                                    </h4>
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-500">Name:</span>
                                                                <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.ClientInchargeName}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-500">Phone:</span>
                                                                <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.ClientInchargePhNo}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-500">Email:</span>
                                                                <span className="font-medium text-gray-800 dark:text-gray-200">{selectedCCData.ClientInchargemailid}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

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
                                                    Please review all cost center details, financial limits, incharge information, and provide your approval decision.
                                                </p>
                                                <textarea
                                                    value={approvalComment}
                                                    onChange={(e) => setApprovalComment(e.target.value)}
                                                    className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 transition-all ${approvalComment.trim() === ''
                                                        ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                                        : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                                                        }`}
                                                    rows="4"
                                                    placeholder="Please review cost center setup, financial limits, incharge details, location information..."
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
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading cost center details...</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cost Center Selected</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Select a Cost Center from the list to view details and take action.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <PdfModal />
        </div>
    );
};

export default CostCenterApproval;