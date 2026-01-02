import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2,
    AlertCircle, Hash, IndianRupee, Calendar,
    User, Building2, Package, XCircle,
    ShoppingCart, Truck, DollarSign
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import AttachmentModal from '../../components/Inbox/AttachmentModal';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerificationSPPOClose,
    fetchSPPOByNoForVerify,
    approveCloseSPPO,
    setSelectedSppoNo,
    setSelectedCCCode,
    setSelectedVendorCode,
    resetSPPOData,
    clearApprovalResult,
    selectVerificationSPPOCloseArray,
    selectSPPOData,
    selectVerificationSPPOCloseLoading,
    selectSPPODataLoading,
    selectApproveCloseSPPOLoading,
    selectVerificationSPPOCloseError,
    selectSPPODataError,
    selectApproveCloseSPPOError,
    selectSelectedSppoNo,
    selectApprovalResult,
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedType
} from '../../slices/spPOSlice/closeSPPOSlice';

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

// ============================================================================
// HELPER FUNCTION - Extract type from notification path
// ============================================================================
const getTypeFromPath = (notificationData) => {
    const path = notificationData?.NavigationPath || '';
    console.log('🔍 Checking path for close type:', path);
    
    // Extract type from URL query parameter
    // Example: /purchase/verifysppoclose?closetype=performing
    if (path.toLowerCase().includes('closetype=performing')) {
        console.log('✅ Type detected: Performing');
        return 'Performing';
    } else if (path.toLowerCase().includes('closetype=non-performing')) {
        console.log('✅ Type detected: Non-Performing');
        return 'Non-Performing';
    }
    
    // Default to Performing if not specified
    console.log('⚠️ No type specified in path, defaulting to: Performing');
    return 'Performing';
};

const VerifySPPOClose = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const sppoCloseList = useSelector(selectVerificationSPPOCloseArray);
    const sppoCloseLoading = useSelector(selectVerificationSPPOCloseLoading);
    const sppoCloseError = useSelector(selectVerificationSPPOCloseError);

    const sppoData = useSelector(selectSPPOData);
    const sppoDataLoading = useSelector(selectSPPODataLoading);
    const sppoDataError = useSelector(selectSPPODataError);

    const approvalLoading = useSelector(selectApproveCloseSPPOLoading);
    const selectedSppoNo = useSelector(selectSelectedSppoNo);

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
    const [closeType, setCloseType] = useState('Performing'); // Track current type

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const ccCodes = [...new Set(sppoCloseList.map(item => item.CCCode))].filter(Boolean);
    const vendors = [...new Set(sppoCloseList.map(item => item.VendorName))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'SPPO Close Verifier';
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
        
        // Construct S3 URL - adjust based on your S3 config
        const fullUrl = `https://your-s3-bucket.s3.amazonaws.com/sppo/${filePath}`;
        
        if (!fullUrl) {
            toast.error('Invalid file path');
            return;
        }
        
        console.log('📄 Viewing attachment:', fullUrl);
        setAttachmentUrl(fullUrl);
        setShowAttachmentModal(true);
    };

    // Initialize - Extract type from path and fetch data
    useEffect(() => {
        if (roleId && uid) {
            // Extract type from notification data path
            const typeValue = getTypeFromPath(notificationData);
            setCloseType(typeValue);
            
            console.log('🎯 Initializing SPPO Close with:', {
                roleId,
                uid,
                type: typeValue,
                notificationPath: notificationData?.NavigationPath
            });
            
            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));
            dispatch(setSelectedType(typeValue));
            dispatch(fetchVerificationSPPOClose({ 
                roleId, 
                userId: uid, 
                type: typeValue 
            }));
        }
    }, [roleId, uid, notificationData, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetSPPOData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    useEffect(() => {
        if (selectedItem?.SPPONo && selectedItem?.CCCode && selectedItem?.VendorCode) {
            console.log('🔍 Fetching SPPO Details:', {
                sppoNo: selectedItem.SPPONo,
                ccCode: selectedItem.CCCode,
                vendorCode: selectedItem.VendorCode
            });

            dispatch(setSelectedSppoNo(selectedItem.SPPONo));
            dispatch(setSelectedCCCode(selectedItem.CCCode));
            dispatch(setSelectedVendorCode(selectedItem.VendorCode));
            
            dispatch(fetchSPPOByNoForVerify({ 
                sppoNo: selectedItem.SPPONo,
                ccCode: selectedItem.CCCode,
                vendorCode: selectedItem.VendorCode
            }));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (selectedItem && roleId && sppoData) {
            const moid = sppoData?.MOID;
            if (moid) {
                console.log('📊 Fetching Status List for MOID:', moid);
                dispatch(fetchStatusList({
                    MOID: moid,
                    ROID: roleId,
                    ChkAmt: sppoData?.ClosingBalance || 0
                }));
            }
        }
    }, [selectedItem, roleId, sppoData, dispatch]);

    useEffect(() => {
        if (selectedItem && sppoData) {
            const moid = sppoData?.MOID;
            if (moid) {
                console.log('💬 Fetching Remarks for MOID:', moid);
                dispatch(setSelectedMOID(moid));
                dispatch(fetchRemarks({
                    trno: sppoData.SPPONo || selectedItem.SPPONo || '',
                    moid: moid
                }));
            }
        }
    }, [selectedItem, sppoData, dispatch]);

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
            const typeValue = getTypeFromPath(notificationData);
            
            console.log('🔄 Refreshing with type:', typeValue);
            
            dispatch(fetchVerificationSPPOClose({ 
                roleId, 
                userId: uid, 
                type: typeValue 
            }));
            
            if (selectedItem) {
                dispatch(fetchSPPOByNoForVerify({ 
                    sppoNo: selectedItem.SPPONo,
                    ccCode: selectedItem.CCCode,
                    vendorCode: selectedItem.VendorCode
                }));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected SPPO Item:', item);
        setSelectedItem(item);
    };

    const buildSPPOCloseApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            sppoData?.POCloseRemarks || '',
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        // Get current date in dd-MMM-yyyy format
        const currentDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const payload = {
            VendorCode: sppoData?.VendorCode || selectedItem?.VendorCode || '',
            SPPONo: sppoData?.SPPONo || selectedItem?.SPPONo || '',
            CCCode: sppoData?.CCCode || selectedItem?.CCCode || '',
            POCloseDate: currentDate,
            POCloseRemarks: updatedRemarks,
            RoleId: roleId,
            CreatedBy: currentUser,
            Action: actionValue
        };

        console.log('📤 SPPO Close Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No SPPO selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the SPPO close details by checking the verification checkbox.');
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
            const payload = buildSPPOCloseApprovalPayload(actionValue);

            const result = await dispatch(approveCloseSPPO(payload)).unwrap();

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
                const typeValue = getTypeFromPath(notificationData);
                dispatch(fetchVerificationSPPOClose({ 
                    roleId, 
                    userId: uid, 
                    type: typeValue 
                }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetSPPOData());
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

    const filteredItems = sppoCloseList.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.SPPONo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.VendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.CCCode?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCCCode = filterCCCode === 'All' || item.CCCode === filterCCCode;
        const matchesVendor = filterVendor === 'All' || item.VendorName === filterVendor;

        return matchesSearch && matchesCCCode && matchesVendor;
    });

    const statsCards = [
        {
            icon: FileText,
            value: sppoCloseList.length,
            label: 'Total SPPOs',
            color: 'indigo'
        },
        {
            icon: XCircle,
            value: sppoCloseList.length,
            label: `Pending ${closeType}`,
            color: 'orange'
        },
        {
            icon: IndianRupee,
            value: sppoData ? `₹${formatIndianCurrency(sppoData.ClosingBalance || 0)}` : '₹0',
            label: 'Closing Balance',
            color: 'green'
        },
        {
            icon: DollarSign,
            value: sppoData ? `₹${formatIndianCurrency(sppoData.TotalValue || 0)}` : '₹0',
            label: 'Total Value',
            color: 'purple'
        }
    ];

    const renderItemCard = (item, isSelected) => {
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                             {item.VendorName} -{item.SPPONo} 
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.vendorCode}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span>{item.CCCode}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <IndianRupee className="w-3 h-3" />
                            <span>₹{formatIndianCurrency(item.Balance || 0)}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item, isSelected) => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = sppoData || selectedItem;
        const hasDetailedData = !!sppoData;

        return (
            <div className="space-y-6">
                {sppoDataLoading && (
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
                                    <ShoppingCart className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <XCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {displayData.VendorName}
                                </h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                    SPPO Number:# {displayData.SPPONo} 
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        Service PO
                                    </span>
                                    <span className={`px-3 py-1 ${
                                        closeType === 'Performing' 
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    } rounded-full text-xs font-medium`}>
                                        {closeType}
                                    </span>
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
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Closing Balance</p>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    ₹{formatIndianCurrency(sppoData.ClosingBalance || 0)}
                                </p>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Total Value: ₹{formatIndianCurrency(sppoData.TotalValue || 0)}
                                    </p>
                                    {sppoData.POCloseDate && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Close Date: {sppoData.POCloseDate}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        {hasDetailedData && sppoData.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {sppoData.MOID}
                                </p>
                            </div>
                        )}
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

                {/* PO Period */}
                {hasDetailedData && (sppoData.SPPOStartDate || sppoData.SPPOEndDate) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            <span>PO Period</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                    {sppoData.SPPOStartDate || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">End Date</p>
                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                    {sppoData.SPPOEndDate || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Item Details */}
                {hasDetailedData && sppoData.ItemDescList && sppoData.ItemDescList.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Item Details
                                </h3>
                            </div>
                            {sppoData.FilePath && (
                                <button
                                    onClick={() => handleViewAttachment(sppoData.FilePath)}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium"
                                >
                                    View Document
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
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Rate
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Client Rate
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {sppoData.ItemDescList.map((item, index) => (
                                        <tr key={item.SPPOItemId || index} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {item.Description}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">
                                                {item.Unit}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">
                                                {item.Quantity}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-indigo-700 dark:text-indigo-400">
                                                ₹{formatIndianCurrency(item.Rate || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-purple-700 dark:text-purple-400">
                                                ₹{formatIndianCurrency(item.ClientRate || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Remarks Section */}
                {hasDetailedData && sppoData.Remarks && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <span>PO Remarks</span>
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {sppoData.Remarks}
                            </p>
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
                        checkboxLabel: '✓ I have verified all SPPO Close details',
                        checkboxDescription: 'Including vendor information, closing balance, item details, and supporting documentation',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify SPPO details, closing balance, vendor information, and reason for closure...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
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
                            ℹ️ No actions available for this SPPO close request
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
                title={`${InboxTitle || 'SPPO Close'} (${sppoCloseList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={sppoCloseList.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={ShoppingCart}
                badgeText={`SPPO Close - ${closeType}`}
                badgeCount={sppoCloseList.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by SPPO no, vendor, CC code...',
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
                className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600"
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
                            loading={sppoCloseLoading}
                            error={sppoCloseError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending',
                                icon: Clock,
                                emptyMessage: 'No SPPO Close requests found!',
                                itemKey: 'SPPONo',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20'
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
                            <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-500 rounded-lg">
                                        <ShoppingCart className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'SPPO Close Verification' : 'SPPO Details'}
                                    </span>
                                </h2>
                            </div>
                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <XCircle className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No SPPO Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a SPPO from the list to view details and take action.
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
                title="SPPO Document"
            />
        </div>
    );
};

export default VerifySPPOClose;