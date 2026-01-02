import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2,
    AlertCircle, Hash, Calendar,
    User, Building2, Package, TrendingUp,
    Recycle, DollarSign
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import AttachmentModal from '../../components/Inbox/AttachmentModal';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyScrapSaleGrid,
    fetchScrapSaleDetails,
    fetchScrapSaleDataDetails,
    approveScrapSale,
    setSelectedRequestNo,
    setSelectedRid,
    resetScrapSaleDetails,
    clearApprovalResult,
    selectScrapSaleGridArray,
    selectScrapSaleDetails,
    selectScrapSaleDataDetails,
    selectScrapSaleGridLoading,
    selectScrapSaleDetailsLoading,
    selectScrapSaleDataDetailsLoading,
    selectApproveScrapSaleLoading,
    selectScrapSaleGridError,
    selectScrapSaleDetailsError,
    selectSelectedRequestNo,
    selectSelectedRid,
    selectApprovalResult,
    setSelectedRoleId,
    setSelectedCreated,
    setSelectedUserId
} from '../../slices/stockSlice/scrapSalesVerificationSlice';

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

const VerifyScrapSale = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const scrapSaleGrid = useSelector(selectScrapSaleGridArray);
    const gridLoading = useSelector(selectScrapSaleGridLoading);
    const gridError = useSelector(selectScrapSaleGridError);

    const scrapSaleDetails = useSelector(selectScrapSaleDetails);
    const detailsLoading = useSelector(selectScrapSaleDetailsLoading);
    const detailsError = useSelector(selectScrapSaleDetailsError);

    const scrapSaleDataDetails = useSelector(selectScrapSaleDataDetails);
    const dataDetailsLoading = useSelector(selectScrapSaleDataDetailsLoading);

    const approvalLoading = useSelector(selectApproveScrapSaleLoading);
    const selectedRequestNo = useSelector(selectSelectedRequestNo);
    const selectedRid = useSelector(selectSelectedRid);

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
    const [filterFromCC, setFilterFromCC] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const fromCCs = [...new Set(scrapSaleGrid.map(item => item.FromCC))].filter(Boolean);
    const statuses = [...new Set(scrapSaleGrid.map(item => item.Status))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'Scrap Sale Verifier';
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
            const today = new Date().toISOString().split('T')[0];
            dispatch(setSelectedCreated(today));
            
            console.group('🚀 Initial Grid Fetch');
            console.log('Role ID:', roleId);
            console.log('User ID:', uid);
            console.log('Date:', today);
            console.groupEnd();
            
            dispatch(fetchVerifyScrapSaleGrid({ roleId, created: today, userId: uid }));
        }
    }, [roleId, uid, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetScrapSaleDetails());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    // When item is selected, fetch details using RequestNo and Rid (note: API uses RId)
    useEffect(() => {
        if (selectedItem?.RequestNo && selectedItem?.Rid) {
            console.group('🎯 Fetching Scrap Sale Details');
            console.log('Selected Item:', selectedItem);
            console.log('Request No:', selectedItem.RequestNo);
            console.log('RID:', selectedItem.Rid);
            console.groupEnd();

            dispatch(setSelectedRequestNo(selectedItem.RequestNo));
            dispatch(setSelectedRid(selectedItem.Rid));
            
            // Fetch both details APIs
            dispatch(fetchScrapSaleDetails({ 
                requestNo: selectedItem.RequestNo, 
                rid: selectedItem.Rid 
            }));
            
            dispatch(fetchScrapSaleDataDetails({ 
                requestNo: selectedItem.RequestNo, 
                rid: selectedItem.Rid 
            }));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when details are loaded - MOID comes from details API
    useEffect(() => {
        if (selectedItem && roleId && scrapSaleDetails) {
            const moid = scrapSaleDetails?.MOID;
            
            console.group('🎯 Status List Fetch');
            console.log('Selected Item:', selectedItem);
            console.log('Details:', scrapSaleDetails);
            console.log('MOID from details:', moid);
            console.log('Role ID:', roleId);
            console.groupEnd();
            
            if (moid) {
                dispatch(fetchStatusList({
                    MOID: moid,
                    ROID: roleId,
                    ChkAmt: 0
                }));
            } else {
                console.warn('⚠️ No MOID found in details. Status list cannot be fetched.');
            }
        }
    }, [selectedItem, roleId, scrapSaleDetails, dispatch]);

    // Fetch remarks history
    useEffect(() => {
        if (selectedItem && scrapSaleDetails) {
            const moid = scrapSaleDetails?.MOID;
            const requestNo = scrapSaleDetails?.RequestNo || selectedItem?.RequestNo;
            
            console.group('📝 Fetching Remarks');
            console.log('MOID:', moid);
            console.log('Request No:', requestNo);
            console.groupEnd();
            
            if (moid && requestNo) {
                dispatch(setSelectedMOID(moid));
                dispatch(fetchRemarks({
                    trno: requestNo,
                    moid: moid
                }));
            }
        }
    }, [selectedItem, scrapSaleDetails, dispatch]);

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
            dispatch(fetchVerifyScrapSaleGrid({ roleId, created: today, userId: uid }));
            if (selectedItem) {
                dispatch(fetchScrapSaleDetails({ 
                    requestNo: selectedItem.RequestNo, 
                    rid: selectedItem.Rid 
                }));
                dispatch(fetchScrapSaleDataDetails({ 
                    requestNo: selectedItem.RequestNo, 
                    rid: selectedItem.Rid 
                }));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('📌 Item Selected:', item);
        setSelectedItem(item);
    };

    const buildScrapSaleApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            scrapSaleDetails?.Remarks || '',
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        // Match the API structure exactly
        const payload = {
            Requestno: selectedItem?.RequestNo || scrapSaleDetails?.RequestNo || '',
            Appstatus: actionValue,
            Remarks: updatedRemarks,
            Createdby: currentUser,
            RoleID: roleId,
            UserId: uid,
            ItemId: scrapSaleDetails?.ItemId || ''
        };

        console.log('📦 Scrap Sale Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No Scrap Sale selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the Scrap Sale details by checking the verification checkbox.');
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
            const payload = buildScrapSaleApprovalPayload(actionValue);
            
            console.log('📤 Submitting Approval:', payload);

            const result = await dispatch(approveScrapSale(payload)).unwrap();

            console.log('📥 API Response:', result);

            let successMessage = '';
            
            if (typeof result === 'string') {
                successMessage = result;
            } else if (result?.saveStatus) {
                successMessage = result.saveStatus;
            } else {
                successMessage = `${action.text || actionValue} completed successfully!`;
            }

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
                dispatch(fetchVerifyScrapSaleGrid({ roleId, created: today, userId: uid }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetScrapSaleDetails());
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

    const filteredItems = scrapSaleGrid.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.RequestNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Tranno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.FromCC?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Date?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFromCC = filterFromCC === 'All' || item.FromCC === filterFromCC;
        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;

        return matchesSearch && matchesFromCC && matchesStatus;
    });

    // Calculate totals
    const calculateTotalAmount = () => {
        if (!scrapSaleDataDetails || !Array.isArray(scrapSaleDataDetails)) return 0;
        
        return scrapSaleDataDetails.reduce((sum, item) => {
            const amount = parseFloat(item.Amount) || 0;
            return sum + amount;
        }, 0);
    };

    const totalAmount = calculateTotalAmount();
    const totalItems = scrapSaleDataDetails?.length || 0;

    const statsCards = [
        {
            icon: FileText,
            value: scrapSaleGrid.length,
            label: 'Total Scrap Sales',
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
            value: scrapSaleDetails?.ClientName?.split(',')[0]?.trim() || selectedItem?.FromCC || '-',
            label: 'Client',
            color: 'indigo'
        },
        {
            icon: DollarSign,
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
                            <Recycle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.RequestNo || item.Tranno}
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
            <Recycle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const hasDetailedData = !!scrapSaleDetails;
        const hasDataDetails = scrapSaleDataDetails && Array.isArray(scrapSaleDataDetails) && scrapSaleDataDetails.length > 0;

        return (
            <div className="space-y-6">
                {(detailsLoading || dataDetailsLoading) && (
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
                                    <Recycle className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    Scrap Sale Request
                                </h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                    Request No: {selectedItem.RequestNo || selectedItem.Tranno || 'N/A'}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        Scrap Sale
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
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Value</p>
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
                        {hasDetailedData && scrapSaleDetails.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {scrapSaleDetails.MOID}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Request No</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {selectedItem.RequestNo || selectedItem.Tranno || 'N/A'}
                            </p>
                        </div>
                        {hasDetailedData && scrapSaleDetails.ClientName && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Client</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {scrapSaleDetails.ClientName.split(',')[1]?.trim() || scrapSaleDetails.ClientName.split(',')[0]?.trim() || scrapSaleDetails.ClientName}
                                </p>
                            </div>
                        )}
                        {hasDetailedData && scrapSaleDetails.SubmitDate && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submit Date</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {scrapSaleDetails.SubmitDate}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                {hasDataDetails && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Scrap Item Details
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
                                            Basic Price
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {scrapSaleDataDetails.map((item, index) => (
                                        <tr key={item.RId || index} className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
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
                                                    {item.Quantity || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {item.Units}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-700 dark:text-gray-400">
                                                ₹{parseFloat(item.BasicPrice || 0).toFixed(2)}
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

                {/* Remarks History */}
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
                        checkboxLabel: '✓ I have verified all Scrap Sale details',
                        checkboxDescription: 'Including item details, quantities, pricing, client information, and supporting documentation',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify item details, quantities, pricing, client information, and reason for scrap sale...',
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
                            ℹ️ No actions available for this Scrap Sale
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
                title={`${InboxTitle || 'Scrap Sale'} (${scrapSaleGrid.length})`}
                subtitle={ModuleDisplayName}
                itemCount={scrapSaleGrid.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Recycle}
                badgeText="Scrap Sale Verification"
                badgeCount={scrapSaleGrid.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by request no, from CC, date...',
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
                                emptyMessage: 'No Scrap Sales found!',
                                itemKey: 'RequestNo',
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
                                        <Recycle className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'Scrap Sale Verification' : 'Scrap Sale Details'}
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
                                            No Scrap Sale Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a Scrap Sale from the list to view details and take action.
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
                title="Scrap Sale Document"
            />
        </div>
    );
};

export default VerifyScrapSale;