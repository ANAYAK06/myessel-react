import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, CheckCircle2,
    AlertCircle, Hash, IndianRupee, Calendar,
    User, Building2, Package, TrendingDown,
    TrendingUp, DollarSign
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import AttachmentModal from '../../components/Inbox/AttachmentModal';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerificationLDItems,
    fetchLDItemsByRefnoForVerify,
    approveLostDamagedItems,
    setSelectedRefNo,
    resetLDItemData,
    clearApprovalResult,
    selectVerificationLDItemsArray,
    selectLDItemData,
    selectVerificationLDItemsLoading,
    selectLDItemDataLoading,
    selectApproveLostDamagedItemsLoading,
    selectVerificationLDItemsError,
    selectLDItemDataError,
    selectApproveLostDamagedItemsError,
    selectSelectedRefNo,
    selectApprovalResult,
    setSelectedRoleId,
    setSelectedUserId
} from '../../slices/stockSlice/lostDamagedItemsVerificationSlice';

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

const VerifyLostDamagedItems = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Selectors
    const ldItemsList = useSelector(selectVerificationLDItemsArray);
    const ldItemsLoading = useSelector(selectVerificationLDItemsLoading);
    const ldItemsError = useSelector(selectVerificationLDItemsError);

    const ldItemData = useSelector(selectLDItemData);
    const ldItemDataLoading = useSelector(selectLDItemDataLoading);
    const ldItemDataError = useSelector(selectLDItemDataError);

    const approvalLoading = useSelector(selectApproveLostDamagedItemsLoading);
    const selectedRefNo = useSelector(selectSelectedRefNo);

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
    const [filterStatus, setFilterStatus] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const ccCodes = [...new Set(ldItemsList.map(item => item.CCCode))].filter(Boolean);
    const statuses = [...new Set(ldItemsList.map(item => item.Status))].filter(Boolean);

    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'LD Items Verifier';
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
        
        const fullUrl = filePath; // Adjust based on your S3 config
        
        if (!fullUrl) {
            toast.error('Invalid file path');
            return;
        }
        
        console.log('Viewing attachment:', fullUrl);
        setAttachmentUrl(fullUrl);
        setShowAttachmentModal(true);
    };

    // Initialize
    useEffect(() => {
        if (roleId && uid) {
            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));
            dispatch(fetchVerificationLDItems({ roleId, userId: uid }));
        }
    }, [roleId, uid, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetLDItemData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    useEffect(() => {
        if (selectedItem?.Refno) {
            dispatch(setSelectedRefNo(selectedItem.Refno));
            dispatch(fetchLDItemsByRefnoForVerify({ refNo: selectedItem.Refno }));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (selectedItem && roleId && ldItemData) {
            const moid = ldItemData?.MOID;
            if (moid) {
                dispatch(fetchStatusList({
                    MOID: moid,
                    ROID: roleId,
                    ChkAmt: 0 // LD Items typically don't have amount check
                }));
            }
        }
    }, [selectedItem, roleId, ldItemData, dispatch]);

    useEffect(() => {
        if (selectedItem && ldItemData) {
            const moid = ldItemData?.MOID;
            if (moid) {
                dispatch(setSelectedMOID(moid));
                dispatch(fetchRemarks({
                    trno: ldItemData.Refno || selectedItem.Refno || '',
                    moid: moid
                }));
            }
        }
    }, [selectedItem, ldItemData, dispatch]);

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
            dispatch(fetchVerificationLDItems({ roleId, userId: uid }));
            if (selectedItem) {
                dispatch(fetchLDItemsByRefnoForVerify({ refNo: selectedItem.Refno }));
            }
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item);
    };

    const buildLDItemsApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            ldItemData?.UserRemarks || ldItemData?.Remarks || '',
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        return {
            Id: ldItemData?.Id || 0,
            Date: ldItemData?.Date || '',
            CCCode: ldItemData?.CCCode || '',
            Category: ldItemData?.Category || null,
            Createdby: currentUser,
            Roleid: roleId,
            itemids: ldItemData?.itemlist?.map(item => item.id).join(',') || '',
            itemcodes: ldItemData?.itemlist?.map(item => item.itemcode).join(',') || '',
            Reporttype: ldItemData?.Reporttype || null,
            Lostqtys: ldItemData?.itemlist?.map(item => item.Lost || 0).join(',') || '',
            Damangedqtys: ldItemData?.itemlist?.map(item => item.Damaged || 0).join(',') || '',
            Stocktype: ldItemData?.Stocktype || null,
            Remarks: updatedRemarks,
            AvlQtys: ldItemData?.AvlQtys || null,
            CategoryNo: ldItemData?.CategoryNo || 0,
            Refno: ldItemData?.Refno || '',
            MOID: ldItemData?.MOID || 0,
            Action: actionValue,
            ApprovalNote: verificationComment.trim(),
            Status: ldItemData?.Status || '',
            itemlist: ldItemData?.itemlist || [],
            ApprovedUser: ldItemData?.ApprovedUser || '',
            ApprUserList: ldItemData?.ApprUserList || [],
            UserRemarks: updatedRemarks,
            Filechk: ldItemData?.Filechk || null,
            Extension: ldItemData?.Extension || null,
            FilePath: ldItemData?.FilePath || null,
            Userid: uid
        };
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No Lost/Damaged Item selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!isVerified) {
            toast.error('Please verify the Lost/Damaged Items details by checking the verification checkbox.');
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
            const payload = buildLDItemsApprovalPayload(actionValue);
            
            console.log('📤 Lost/Damaged Items Approval Payload:', payload);

            const result = await dispatch(approveLostDamagedItems(payload)).unwrap();

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
                dispatch(fetchVerificationLDItems({ roleId, userId: uid }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetLDItemData());
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

    const filteredItems = ldItemsList.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.Refno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.CCCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Date?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCCCode = filterCCCode === 'All' || item.CCCode === filterCCCode;
        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;

        return matchesSearch && matchesCCCode && matchesStatus;
    });

    // Calculate totals
    const calculateTotalAmounts = () => {
        if (!ldItemData?.itemlist) return { lostTotal: 0, damagedTotal: 0, grandTotal: 0 };
        
        const lostTotal = ldItemData.itemlist.reduce((sum, item) => sum + (parseFloat(item.LostAmt) || 0), 0);
        const damagedTotal = ldItemData.itemlist.reduce((sum, item) => sum + (parseFloat(item.DamagedAmt) || 0), 0);
        const grandTotal = lostTotal + damagedTotal;
        
        return { lostTotal, damagedTotal, grandTotal };
    };

    const { lostTotal, damagedTotal, grandTotal } = calculateTotalAmounts();

    const statsCards = [
        {
            icon: FileText,
            value: ldItemsList.length,
            label: 'Total Reports',
            color: 'purple'
        },
        {
            icon: TrendingDown,
            value: ldItemData?.itemlist ? `${ldItemData.itemlist.reduce((sum, item) => sum + parseInt(item.Lost || 0), 0)}` : '0',
            label: 'Total Lost Items',
            color: 'red'
        },
        {
            icon: AlertCircle,
            value: ldItemData?.itemlist ? `${ldItemData.itemlist.reduce((sum, item) => sum + parseInt(item.Damaged || 0), 0)}` : '0',
            label: 'Total Damaged Items',
            color: 'orange'
        },
        {
            icon: IndianRupee,
            value: `₹${formatIndianCurrency(grandTotal)}`,
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
                            <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.Refno}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            CC: {item.CCCode}
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
            <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = ldItemData || selectedItem;
        const hasDetailedData = !!ldItemData;

        return (
            <div className="space-y-6">
                {ldItemDataLoading && (
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
                                    <Package className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    Lost/Damaged Items Report
                                </h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                    Reference Number: {displayData.Refno}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        Lost/Damaged Items
                                    </span>
                                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                                        Status: Pending Verification
                                    </span>
                                    {displayData.CCCode && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            CC: {displayData.CCCode}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    ₹{formatIndianCurrency(grandTotal)}
                                </p>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-red-600 dark:text-red-400">
                                        Lost: ₹{formatIndianCurrency(lostTotal)}
                                    </p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">
                                        Damaged: ₹{formatIndianCurrency(damagedTotal)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        {hasDetailedData && ldItemData.MOID && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MOID</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {ldItemData.MOID}
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference No</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.Refno}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cost Center</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.CCCode}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {displayData.Date?.split(' ')[0] || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                {hasDetailedData && ldItemData.itemlist && ldItemData.itemlist.length > 0 && (
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
                            {ldItemData.FilePath && (
                                <button
                                    onClick={() => handleViewAttachment(ldItemData.FilePath)}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all text-sm font-medium"
                                >
                                    View Document
                                </button>
                            )}
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
                                            Lost Qty
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Damaged Qty
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Lost Amt
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Damaged Amt
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Remarks
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {ldItemData.itemlist.map((item, index) => (
                                        <tr key={item.id || index} className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                {item.itemcode}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {item.itemname}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {item.specification}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                <span className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full font-medium">
                                                    {item.Lost || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                <span className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full font-medium">
                                                    {item.Damaged || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-red-700 dark:text-red-400">
                                                ₹{formatIndianCurrency(item.LostAmt || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-orange-700 dark:text-orange-400">
                                                ₹{formatIndianCurrency(item.DamagedAmt || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {item.Remarks || '-'}
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
                        checkboxLabel: '✓ I have verified all Lost/Damaged Items details',
                        checkboxDescription: 'Including item quantities, amounts, cost center information, and supporting documentation',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify item details, quantities, amounts, and reason for loss/damage...',
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
                            ℹ️ No actions available for this Lost/Damaged Items report
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
                title={`${InboxTitle || 'Lost/Damaged Items'} (${ldItemsList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={ldItemsList.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Package}
                badgeText="LD Items Verification"
                badgeCount={ldItemsList.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by ref no, CC code, date...',
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
                            loading={ldItemsLoading}
                            error={ldItemsError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending',
                                icon: Clock,
                                emptyMessage: 'No Lost/Damaged Items found!',
                                itemKey: 'Refno',
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
                                        <Package className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'Lost/Damaged Items Verification' : 'Item Details'}
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
                                            No Item Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a Lost/Damaged Items report from the list to view details and take action.
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
                title="Lost/Damaged Items Document"
            />
        </div>
    );
};

export default VerifyLostDamagedItems;