import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2,
    AlertCircle, Hash, IndianRupee, Calendar,
    User, Building2, Package, Pencil,
    ShoppingCart, Truck, DollarSign, Plus,
    Minus, TrendingUp, TrendingDown
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import AttachmentModal from '../../components/Inbox/AttachmentModal';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

// S3 Configuration Import
import { buildS3Url, S3_FOLDERS, getFileName } from '../../config/s3Config';

import {
    fetchVerificationSPPOAmend,
    fetchSPPOAmendById,
    approveSPPOAmend,
    fetchPOUploadedDocs,
    setSelectedAmendId,
    setSelectedPONo,
    resetSPPOAmendData,
    clearApprovalResult,
    selectVerificationSPPOAmendArray,
    selectSPPOAmendData,
    selectPOUploadedDocs,
    selectVerificationSPPOAmendLoading,
    selectSPPOAmendDataLoading,
    selectApproveSPPOAmendLoading,
    selectPOUploadedDocsLoading,
    selectVerificationSPPOAmendError,
    selectSPPOAmendDataError,
    selectApprovalResult,
    setSelectedRoleId,
    setSelectedUserId
} from '../../slices/spPOSlice/sppoAmendSlice';

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

const VerifySPPOAmend = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const sppoAmendList = useSelector(selectVerificationSPPOAmendArray);
    const sppoAmendLoading = useSelector(selectVerificationSPPOAmendLoading);
    const sppoAmendError = useSelector(selectVerificationSPPOAmendError);

    const sppoAmendData = useSelector(selectSPPOAmendData);
    const sppoAmendDataLoading = useSelector(selectSPPOAmendDataLoading);
    const sppoAmendDataError = useSelector(selectSPPOAmendDataError);

    const poUploadedDocs = useSelector(selectPOUploadedDocs);
    const poDocsLoading = useSelector(selectPOUploadedDocsLoading);

    const approvalLoading = useSelector(selectApproveSPPOAmendLoading);
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
    const [filterCCCode, setFilterCCCode] = useState('All');
    const [filterVendor, setFilterVendor] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const ccCodes = [...new Set(sppoAmendList.map(item => item.CCCode))].filter(Boolean);
    const vendors = [...new Set(sppoAmendList.map(item => item.VendorName))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'SPPO Amendment Verifier';
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

    /**
     * Handle viewing attachment using S3 config
     * @param {string} filePath - File path from API
     */
    const handleViewAttachment = (filePath) => {
        if (!filePath) {
            toast.error('No attachment available');
            console.warn('⚠️ View Attachment attempted with no file path');
            return;
        }

        // Build S3 URL using config
        const fullUrl = buildS3Url(S3_FOLDERS.SPPO_AMENDMENTS, filePath);

        console.group('📄 SPPO Amendment Document View');
        console.log('Original File Path:', filePath);
        console.log('S3 Folder:', S3_FOLDERS.SPPO_AMENDMENTS);
        console.log('Generated S3 URL:', fullUrl);
        console.log('File Name:', getFileName(filePath));
        console.log('Timestamp:', new Date().toLocaleString());
        console.groupEnd();

        setAttachmentUrl(fullUrl);
        setShowAttachmentModal(true);
    };

    // Initialize - Fetch amendment list
    useEffect(() => {
        if (roleId && uid) {
            console.log('🎯 Initializing SPPO Amendment with:', { roleId, uid });

            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));
            dispatch(fetchVerificationSPPOAmend({ roleId, userId: uid }));
        }
    }, [roleId, uid, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetSPPOAmendData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // Fetch amendment details when item is selected
    useEffect(() => {
        if (selectedItem?.AmendId) {
            console.log('🔍 Fetching SPPO Amendment Details:', {
                amendId: selectedItem.AmendId,
                roleId,
                userId: uid
            });

            dispatch(setSelectedAmendId(selectedItem.AmendId));
            dispatch(setSelectedPONo(selectedItem.SPPONo));

            dispatch(fetchSPPOAmendById({
                roleId,
                amendId: selectedItem.AmendId,
                userId: uid
            }));

            // Fetch uploaded documents if PO number exists
            if (selectedItem.SPPONo) {
                dispatch(fetchPOUploadedDocs({
                    poNo: selectedItem.SPPONo,
                    forType: 'Amendment'
                }));
            }

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, roleId, uid, dispatch]);

    // Fetch status list when amendment data is loaded
    useEffect(() => {
        if (selectedItem && roleId && sppoAmendData) {
            const moid = sppoAmendData?.MOID;
            if (moid) {
                console.log('📊 Fetching Status List for MOID:', moid);
                dispatch(fetchStatusList({
                    MOID: moid,
                    ROID: roleId,
                    ChkAmt: sppoAmendData?.AmendAmount || 0
                }));
            }
        }
    }, [selectedItem, roleId, sppoAmendData, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && sppoAmendData) {
            const moid = sppoAmendData?.MOID;
            if (moid) {
                console.log('💬 Fetching Remarks for MOID:', moid);
                dispatch(setSelectedMOID(moid));
                dispatch(fetchRemarks({
                    trno: sppoAmendData.SPPONo || selectedItem.SPPONo || '',
                    moid: moid
                }));
            }
        }
    }, [selectedItem, sppoAmendData, dispatch]);

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
            console.log('🔄 Refreshing SPPO Amendment list');

            dispatch(fetchVerificationSPPOAmend({ roleId, userId: uid }));

            if (selectedItem) {
                dispatch(fetchSPPOAmendById({
                    roleId,
                    amendId: selectedItem.AmendId,
                    userId: uid
                }));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected SPPO Amendment Item:', item);
        setSelectedItem(item);
    };

    const buildSPPOAmendApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            sppoAmendData?.ApprovalNote || '',
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        // Payload structure matching backend requirements
        const payload = {
            AmendId: sppoAmendData?.AmendId || selectedItem?.AmendId || 0,
            SPPONo: sppoAmendData?.SPPONo || selectedItem?.SPPONo || '',
            VendorCode: sppoAmendData?.VendorCode || selectedItem?.VendorCode || '',
            CCCode: sppoAmendData?.CCCode || selectedItem?.CCCode || '',
            DCACode: sppoAmendData?.DCACode || selectedItem?.DCACode || '',
            AmendDate: sppoAmendData?.AmendDate || selectedItem?.AmendDate || '',
            RoleId: roleId,
            Action: actionValue,
            CreatedBy: currentUser,
            ApprovalNote: updatedRemarks,
            AmendAmount: sppoAmendData?.AmendAmount || selectedItem?.AmendAmount || 0,
            SubstractAmount: sppoAmendData?.SubstractAmount || selectedItem?.SubstractAmount || 0,
            Terms: sppoAmendData?.Terms || selectedItem?.Terms || ''
        };

        console.log('📤 SPPO Amendment Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No SPPO Amendment selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the SPPO amendment details by checking the verification checkbox.');
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
            const payload = buildSPPOAmendApprovalPayload(actionValue);

            const result = await dispatch(approveSPPOAmend(payload)).unwrap();

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
                dispatch(fetchVerificationSPPOAmend({ roleId, userId: uid }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetSPPOAmendData());
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

    const filteredItems = sppoAmendList.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.SPPONo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.VendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.CCCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.AmendId?.toString().includes(searchQuery);

        const matchesCCCode = filterCCCode === 'All' || item.CCCode === filterCCCode;
        const matchesVendor = filterVendor === 'All' || item.VendorName === filterVendor;

        return matchesSearch && matchesCCCode && matchesVendor;
    });

    const statsCards = [
        {
            icon: FileText,
            value: sppoAmendList.length,
            label: 'Total Amendments',
            color: 'indigo'
        },
        {
            icon: Clock,
            value: sppoAmendList.length,
            label: 'Pending Verification',
            color: 'orange'
        },
        {
            icon: IndianRupee,
            value: sppoAmendData ? `₹${formatIndianCurrency(sppoAmendData.AmendAmount || 0)}` : '₹0',
            label: 'Amendment Amount',
            color: 'green'
        },
        {
            icon: DollarSign,
            value: sppoAmendData ? `₹${formatIndianCurrency(sppoAmendData.POBalance || 0)}` : '₹0',
            label: 'PO Balance',
            color: 'purple'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        const hasPlus = (item.AmendPlusValue || 0) > 0;
        const hasMinus = (item.AmendMinusValue || 0) > 0;

        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <Pencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.VendorName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.SPPONo} • Amend #{item.AmendId}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span>{item.CCCode}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.AmendDate}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <IndianRupee className="w-3 h-3" />
                            <span>₹{formatIndianCurrency(item.AmendAmount || 0)}</span>
                        </span>
                        {(hasPlus || hasMinus) && (
                            <div className="flex items-center space-x-1">
                                {hasPlus && <Plus className="w-3 h-3 text-green-600" />}
                                {hasMinus && <Minus className="w-3 h-3 text-red-600" />}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = sppoAmendData || selectedItem;
        const hasDetailedData = !!sppoAmendData;

        const hasPlus = (displayData.AmendPlusValue || 0) > 0;
        const hasMinus = (displayData.AmendMinusValue || 0) > 0;

        return (
            <div className="space-y-6">
                {sppoAmendDataLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700 dark:text-blue-400 text-sm">
                                Loading amendment details...
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
                                    <Pencil className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.VendorName}
                                </h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                    Amendment #{displayData.AmendId} • SPPO: {displayData.SPPONo}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        Service PO Amendment
                                    </span>
                                    {hasPlus && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium flex items-center space-x-1">
                                            <Plus className="w-3 h-3" />
                                            <span>Addition: ₹{formatIndianCurrency(displayData.AmendPlusValue || 0)}</span>
                                        </span>
                                    )}
                                    {hasMinus && (
                                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium flex items-center space-x-1">
                                            <Minus className="w-3 h-3" />
                                            <span>Deduction: ₹{formatIndianCurrency(displayData.AmendMinusValue || 0)}</span>
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                                        Status: {displayData.Status}
                                    </span>
                                    {displayData.VendorName && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            {displayData.VendorName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amendment Amount</p>
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                    ₹{formatIndianCurrency(sppoAmendData.AmendAmount || 0)}
                                </p>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        PO Value: ₹{formatIndianCurrency(sppoAmendData.POValue || 0)}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        PO Balance: ₹{formatIndianCurrency(sppoAmendData.POBalance || 0)}
                                    </p>
                                    {sppoAmendData.AmendDate && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Amend Date: {sppoAmendData.AmendDate}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-5 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        {hasDetailedData && sppoAmendData.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {sppoAmendData.MOID}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amendment ID</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.AmendId}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SPPO No</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.SPPONo}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vendor Code</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.VendorCode}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cost Center</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.CCCode}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Amendment Value Breakdown */}
                {hasDetailedData && (displayData.AmendPlusValue > 0 || displayData.AmendMinusValue > 0 || displayData.AmendTotalValue > 0) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            <span>Amendment Value Breakdown</span>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {displayData.AmendPlusValue > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Plus className="w-4 h-4 text-green-600" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Addition</p>
                                    </div>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                        ₹{formatIndianCurrency(displayData.AmendPlusValue)}
                                    </p>
                                </div>
                            )}
                            {displayData.AmendMinusValue > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Minus className="w-4 h-4 text-red-600" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Deduction</p>
                                    </div>
                                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                        ₹{formatIndianCurrency(displayData.AmendMinusValue)}
                                    </p>
                                </div>
                            )}
                            {displayData.SubstractAmount > 0 && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <TrendingDown className="w-4 h-4 text-orange-600" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Subtract Amount</p>
                                    </div>
                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                        ₹{formatIndianCurrency(displayData.SubstractAmount)}
                                    </p>
                                </div>
                            )}
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                                <div className="flex items-center space-x-2 mb-2">
                                    <IndianRupee className="w-4 h-4 text-indigo-600" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amendment</p>
                                </div>
                                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                    ₹{formatIndianCurrency(displayData.AmendTotalValue || displayData.AmendAmount)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* PO Value Comparison */}
                {hasDetailedData && (displayData.OldPOValue > 0 || displayData.TotalPOValue > 0) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                            <span>PO Value Comparison</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Old PO Value</p>
                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                    ₹{formatIndianCurrency(displayData.OldPOValue || 0)}
                                </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current PO Value</p>
                                <p className="text-base font-semibold text-purple-600 dark:text-purple-400">
                                    ₹{formatIndianCurrency(displayData.POValue || 0)}
                                </p>
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">PO Balance</p>
                                <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
                                    ₹{formatIndianCurrency(displayData.POBalance || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Item Details */}
                {hasDetailedData && sppoAmendData.ItemDescList && sppoAmendData.ItemDescList.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Amendment Item Details
                                </h3>
                            </div>
                            {sppoAmendData.FilePath && (
                                <button
                                    onClick={() => {
                                        console.log('🔘 Main Document View Button Clicked');
                                        console.log('File Path:', sppoAmendData.FilePath);
                                        handleViewAttachment(sppoAmendData.FilePath);
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium shadow-md hover:shadow-lg flex items-center space-x-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>View Document</span>
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Unit
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Current Qty
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Amend Qty
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Rate
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Client Rate
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {sppoAmendData.ItemDescList.map((item, index) => (
                                        <tr key={item.SPPOItemId || index} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {item.Description}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">
                                                {item.Unit}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">
                                                {item.CurrentQuantity || item.Quantity || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                {item.AmendQuantity ? (
                                                    <span className={`font-medium ${item.AmendQuantity > 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {item.AmendQuantity > 0 ? '+' : ''}{item.AmendQuantity}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-indigo-700 dark:text-indigo-400">
                                                ₹{formatIndianCurrency(item.Rate || item.PRWRate || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-purple-700 dark:text-purple-400">
                                                ₹{formatIndianCurrency(item.ClientRate || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-bold text-gray-900 dark:text-white">
                                                ₹{formatIndianCurrency(item.Amount || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.POType && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.POType.toLowerCase() === 'add'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                        }`}>
                                                        {item.POType}
                                                    </span>
                                                )}
                                                {item.ItemStatus && (
                                                    <span className="ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                                                        {item.ItemStatus}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Terms & Conditions */}
                {hasDetailedData && (sppoAmendData.Terms || sppoAmendData.OldTerms) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <span>Terms & Conditions</span>
                        </h3>

                        {sppoAmendData.OldTerms && (
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Original Terms:</p>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {sppoAmendData.OldTerms.split('|').filter(Boolean).join('\n• ')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {sppoAmendData.Terms && sppoAmendData.Terms !== sppoAmendData.OldTerms && (
                            <div>
                                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Amended Terms:</p>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {sppoAmendData.Terms.split('|').filter(Boolean).join('\n• ')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Approval History */}
                {hasDetailedData && sppoAmendData.ApprovedUser && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                            <User className="w-5 h-5 text-green-600" />
                            <span>Approved By</span>
                        </h3>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {sppoAmendData.ApprovedUser}
                            </p>
                        </div>
                    </div>
                )}

                {/* Uploaded Documents */}
                {/* Uploaded Documents */}
                {poUploadedDocs && poUploadedDocs.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span>Uploaded Documents ({poUploadedDocs.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {poUploadedDocs.map((doc, index) => {
                                // Check if Path exists and is not null
                                if (!doc.Path) {
                                    console.log(`⚠️ Document #${index + 1} has no path:`, doc);
                                    return null; // Skip documents without Path
                                }

                                // Build S3 URL using the Path field
                                const docUrl = buildS3Url(S3_FOLDERS.SPPO_AMENDMENTS, doc.Path);
                                const fileName = getFileName(doc.Path) || `Document ${index + 1}`;

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {fileName}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${doc.POType === 'Amend'
                                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                        }`}>
                                                        {doc.POType}
                                                    </span>
                                                    {doc.For && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {doc.For}
                                                        </span>
                                                    )}
                                                    {doc.POCount > 0 && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Count: {doc.POCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                console.log(`🔘 Uploaded Document #${index + 1} View Button Clicked`);
                                                console.log('Document Info:', {
                                                    fileName,
                                                    path: doc.Path,
                                                    poType: doc.POType,
                                                    poNo: doc.PONO,
                                                    for: doc.For,
                                                    generatedUrl: docUrl
                                                });
                                                handleViewAttachment(doc.Path);
                                            }}
                                            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex-shrink-0"
                                        >
                                            View
                                        </button>
                                    </div>
                                );
                            }).filter(Boolean)} {/* Filter out null entries */}
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
                        checkboxLabel: '✓ I have verified all SPPO Amendment details',
                        checkboxDescription: 'Including vendor information, amendment values, item changes, and supporting documentation',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify amendment details, value changes, item modifications, and reason for amendment...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-indigo-200 dark:border-indigo-700'
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
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
                            ℹ️ No actions available for this SPPO amendment
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
                title={`${InboxTitle || 'SPPO Amendment'} (${sppoAmendList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={sppoAmendList.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Pencil}
                badgeText="SPPO Amendment"
                badgeCount={sppoAmendList.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by SPPO no, amend ID, vendor, CC code...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterCCCode,
                        onChange: (e) => setFilterCCCode(e.target.value),
                        defaultLabel: 'All Cost Centers',
                        options: ccCodes
                    },
                    {
                        value: filterVendor,
                        onChange: (e) => setFilterVendor(e.target.value),
                        defaultLabel: 'All Vendors',
                        options: vendors
                    }
                ]}
                className="bg-gradient-to-r from-indigo-600 via-purple-500 to-purple-600"
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
                            loading={sppoAmendLoading}
                            error={sppoAmendError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Amendments',
                                icon: Clock,
                                emptyMessage: 'No SPPO amendments found!',
                                itemKey: 'AmendId',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
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
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                        <Pencil className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'SPPO Amendment Verification' : 'Amendment Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Pencil className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Amendment Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select an amendment from the list to view details and take action.
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
                title="SPPO Amendment Document"
            />
        </div>
    );
};

export default VerifySPPOAmend;