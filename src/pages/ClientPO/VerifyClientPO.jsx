import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2,
    AlertCircle, Hash, IndianRupee, Calendar,
    User, Building2
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import AttachmentModal from '../../components/Inbox/AttachmentModal';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerificationClientPOs,
    selectVerificationClientPOsArray,
    selectVerificationClientPOsLoading,
    selectVerificationClientPOsError,

    fetchClientPOByNoForVerify,
    selectClientPOData,
    selectClientPODataLoading,
    selectClientPODataError,

    approveClientPO,
    selectApproveClientPOLoading,

    setSelectedRoleId,
    setSelectedUserId,
    setSelectedPoNumber,
    resetClientPOData,
    clearApprovalResult
} from '../../slices/clientPOSlice/clientPOVerificationSlice';

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

import { formatIndianCurrency } from '../../utilities/amountToTextHelper';

const VerifyClientPO = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const clientPOsList = useSelector(selectVerificationClientPOsArray);
    const clientPOsLoading = useSelector(selectVerificationClientPOsLoading);
    const clientPOsError = useSelector(selectVerificationClientPOsError);

    const clientPOData = useSelector(selectClientPOData);
    const clientPODataLoading = useSelector(selectClientPODataLoading);
    const clientPODataError = useSelector(selectClientPODataError);

    const approvalLoading = useSelector(selectApproveClientPOLoading);

    const remarks = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    const [selectedPO, setSelectedPO] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterClient, setFilterClient] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const clients = [...new Set(clientPOsList.map(po => po.clientid))].filter(Boolean);
    const statuses = [...new Set(clientPOsList.map(po => po.Status))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'PO Verifier';
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
        // Adjust based on your S3 config
        const fullUrl = filePath; // buildClientPOUrl(filePath) if you have S3 config
        
        if (!fullUrl) {
            toast.error('Invalid file path');
            return;
        }
        console.log('Viewing attachment:', fullUrl);
        setAttachmentUrl(fullUrl);
        setShowAttachmentModal(true);
    };

    useEffect(() => {
        if (roleId && uid) {
            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));
            dispatch(fetchVerificationClientPOs({ roleId, userId: uid }));
        }
    }, [roleId, uid, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetClientPOData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    useEffect(() => {
        if (selectedPO?.pono) {
            dispatch(setSelectedPoNumber(selectedPO.pono));
            dispatch(fetchClientPOByNoForVerify({ poNumber: selectedPO.pono }));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedPO, dispatch]);

    useEffect(() => {
        if (selectedPO && roleId && clientPOData) {
            const moid = clientPOData?.MOID;
            if (moid) {
                dispatch(fetchStatusList({
                    MOID: moid,
                    ROID: roleId,
                    ChkAmt: clientPOData.povalue || clientPOData.total || 0
                }));
            }
        }
    }, [selectedPO, roleId, clientPOData, dispatch]);

    useEffect(() => {
        if (selectedPO && clientPOData) {
            const moid = clientPOData?.MOID;
            if (moid) {
                dispatch(setSelectedMOID(moid));
                dispatch(fetchRemarks({
                    trno: clientPOData.pono || selectedPO.pono || '',
                    moid: moid
                }));
            }
        }
    }, [selectedPO, clientPOData, dispatch]);

    useEffect(() => {
        if (selectedPO) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedPO]);

    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleRefresh = () => {
        if (roleId && uid) {
            dispatch(fetchVerificationClientPOs({ roleId, userId: uid }));
            if (selectedPO) {
                dispatch(fetchClientPOByNoForVerify({ poNumber: selectedPO.pono }));
            }
        }
    };

    const handlePOSelect = (po) => {
        setSelectedPO(po);
    };

    const buildClientPOApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        // Build formatted remarks history (same pattern as Cost Center approval)
        const updatedRemarks = updateRemarksHistory(
            clientPOData?.Remarks || '',
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        return {
            Action: actionValue,
            total: clientPOData?.total?.toString() || "",
            povalue: clientPOData?.povalue?.toString() || "",
            gst: clientPOData?.gst?.toString() || "",
            ApprovalNote: verificationComment.trim(),
            Remarks: updatedRemarks,  // ← ADDED: Formatted remarks history
            pono: selectedPO?.pono || "",
            CreatedBy: currentUser,
            RoleId: (roleId).toString(),
            clientid: clientPOData?.clientid || selectedPO?.clientid || "",
            subclientid: clientPOData?.subclientid || selectedPO?.subclientid || "",
            postartdate: clientPOData?.postartdate || selectedPO?.postartdate || "",
            pocompletiondate: clientPOData?.pocompletiondate || selectedPO?.pocompletiondate || "",
            CostCenter: clientPOData?.CostCenter || selectedPO?.CostCenter || "",
            Status: selectedPO?.Status || "1"
        };
    };

    const handleActionClick = async (action) => {
        if (!selectedPO) {
            toast.error('No Client PO selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the Client PO details by checking the verification checkbox.');
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
            const payload = buildClientPOApprovalPayload(actionValue);
            
            console.log('📤 Client PO Approval Payload:', payload);

            const result = await dispatch(approveClientPO(payload)).unwrap();

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
                dispatch(fetchVerificationClientPOs({ roleId, userId: uid }));
                setSelectedPO(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetClientPOData());
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

    const filteredPOs = clientPOsList.filter(po => {
        const matchesSearch = searchQuery === '' ||
            po.clientid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.pono?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.CostCenter?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesClient = filterClient === 'All' || po.clientid === filterClient;
        const matchesStatus = filterStatus === 'All' || po.Status === filterStatus;

        return matchesSearch && matchesClient && matchesStatus;
    });

    const statsCards = [
        {
            icon: FileText,
            value: clientPOsList.length,
            label: 'Total Client POs',
            color: 'purple'
        },
        {
            icon: IndianRupee,
            value: clientPOData?.povalue
                ? `₹${formatIndianCurrency(clientPOData.povalue)}`
                : '₹0',
            label: 'PO Value',
            color: 'green'
        },
        {
            icon: Building2,
            value: clientPOData?.clientid || 'N/A',
            label: 'Client ID',
            color: 'indigo'
        },
        {
            icon: Calendar,
            value: clientPOData?.postartdate || 'N/A',
            label: 'PO Start Date',
            color: 'blue'
        }
    ];

    const renderPOItem = (po, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-purple-200 dark:border-purple-600 bg-gradient-to-br from-purple-100 to-purple-100 dark:from-purple-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {po.clientid || po.pono}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            PO: {po.pono}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <IndianRupee className="w-3 h-3" />
                            <span>₹{formatIndianCurrency(po.povalue || 0)}</span>
                        </span>
                        <span className="text-gray-500 text-xs">
                            {po.postartdate || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (po, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-purple-200 dark:border-purple-600 bg-gradient-to-br from-purple-100 to-purple-100 dark:from-purple-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedPO) return null;

        const displayData = clientPOData || selectedPO;
        const hasDetailedData = !!clientPOData;

        return (
            <div className="space-y-6">
                {clientPODataLoading && (
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
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.clientid || displayData.pono}
                                </h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                    PO Number: {displayData.pono}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        Client Purchase Order
                                    </span>
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                        Status: Pending Verification
                                    </span>
                                    {displayData.CostCenter && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            CC: {displayData.CostCenter}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total PO Value</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    ₹{formatIndianCurrency(parseFloat(displayData.total || 0))}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    PO Value: ₹{formatIndianCurrency(parseFloat(displayData.povalue || 0))}
                                </p>
                                <p className="text-xs text-indigo-500 dark:text-gray-600 mt-1 bg-indigo-200 p-2 rounded-full inline-block">
                                    GST: ₹{formatIndianCurrency(parseFloat(displayData.gst || 0))}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        {hasDetailedData && clientPOData.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {clientPOData.MOID}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Client ID</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.clientid || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sub Client ID</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.subclientid || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">PO Start Date</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.postartdate || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CLIENT PO DETAILS */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Client PO Information
                            </h3>
                        </div>
                    </div>

                    {/* Main PO Details Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Left Column - Identifiers */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                    PO Number
                                </label>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                    {displayData.pono || 'N/A'}
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                    Client ID
                                </label>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                    {displayData.clientid || 'N/A'}
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                    Sub Client ID
                                </label>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                    {displayData.subclientid || 'N/A'}
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                    Cost Center
                                </label>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                    {displayData.CostCenter || 'N/A'}
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                    RA Bill
                                </label>
                                <p className="text-base font-bold text-gray-900 dark:text-white capitalize">
                                    {displayData.rabill || 'N/A'}
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                    RA Bill Dues
                                </label>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                    {displayData.rabilldues || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Right Column - Financial & Dates */}
                        <div className="space-y-4">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                <label className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-2 block">
                                    PO Value (Excl. GST)
                                </label>
                                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                                    ₹{formatIndianCurrency(parseFloat(displayData.povalue || 0))}
                                </p>
                            </div>
                            
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                <label className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2 block">
                                    GST Amount
                                </label>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                    ₹{formatIndianCurrency(parseFloat(displayData.gst || 0))}
                                </p>
                            </div>
                            
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                                <label className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2 block">
                                    Total PO Value (Incl. GST)
                                </label>
                                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                                    ₹{formatIndianCurrency(parseFloat(displayData.total || 0))}
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                    PO Start Date
                                </label>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                    {displayData.postartdate || 'N/A'}
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                    PO Completion Date
                                </label>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                    {displayData.pocompletiondate || 'N/A'}
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                    Mobilize Advance
                                </label>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                    {displayData.Mobilizeadvance || (displayData.Madvance ? 'Yes' : 'No')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information Section */}
                    {hasDetailedData && (displayData.BGApplicable || (displayData.CreatedDate && displayData.CreatedDate !== "0001-01-01T00:00:00")) && (
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                {displayData.BGApplicable && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                            BG Applicable
                                        </label>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">
                                            {displayData.BGApplicable}
                                        </p>
                                    </div>
                                )}
                                {displayData.CreatedDate && displayData.CreatedDate !== "0001-01-01T00:00:00" && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                            Created Date
                                        </label>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">
                                            {new Date(displayData.CreatedDate).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
                        checkboxLabel: '✓ I have verified all Client PO details',
                        checkboxDescription: 'Including PO amount, client information, project details, and supporting documentation',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify client details, PO amount, project information, and approval requirements...',
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
                            ℹ️ No actions available for this Client PO
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
                title={`${InboxTitle || 'Client Purchase Orders'} (${clientPOsList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={clientPOsList.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={FileText}
                badgeText="Client PO Verification"
                badgeCount={clientPOsList.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by client, PO number, project...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterClient,
                        onChange: (e) => setFilterClient(e.target.value),
                        defaultLabel: 'All Clients',
                        options: clients
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
                        // When mouse leaves the entire grid area, ensure side panel can expand
                        if (selectedPO && isLeftPanelCollapsed) {
                            setIsLeftPanelHovered(false);
                        }
                    }}
                >
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <LeftPanel
                            items={filteredPOs}
                            selectedItem={selectedPO}
                            onItemSelect={handlePOSelect}
                            renderItem={renderPOItem}
                            renderCollapsedItem={renderCollapsedItem}
                            isCollapsed={isLeftPanelCollapsed}
                            onCollapseToggle={setIsLeftPanelCollapsed}
                            isHovered={isLeftPanelHovered}
                            onHoverChange={setIsLeftPanelHovered}
                            loading={clientPOsLoading}
                            error={clientPOsError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending',
                                icon: Clock,
                                emptyMessage: 'No Client POs found!',
                                itemKey: 'pono',
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
                                if (selectedPO && !isLeftPanelHovered) {
                                    setIsLeftPanelHovered(false);
                                }
                            }}
                        >
                            <div className="bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-500 rounded-lg">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedPO ? 'Client PO Verification' : 'Client PO Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh-200px)' }}>
                                {selectedPO ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Client PO Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a Client Purchase Order from the list to view details and take action.
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
                title="Client PO Document"
            />
        </div>
    );
};

export default VerifyClientPO;