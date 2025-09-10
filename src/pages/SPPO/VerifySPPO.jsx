// VerifySPPO.jsx - Service Provider Purchase Order Verification with Enhanced Features
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeft, Building, Calendar, FileText,
    CheckCircle, XCircle, Clock, AlertCircle, Search, RefreshCw,
    ShoppingCart, User, MapPin, Hash, Target, TrendingUp,
    Truck, Package, BadgeCheck, X, Eye, FileCheck,
    Timer, UserCheck, CircleIndianRupee, FileBarChart,
    FileX, ArrowUpCircle, Percent, Calculator,
    CreditCard, FileSpreadsheet, Clipboard,
    Landmark, CheckSquare, ArrowRightLeft, Layers, ExternalLink,
    AlertTriangle, Download, ClipboardList, Receipt, Edit3,
    BarChart3, History, MousePointer, Info, ChevronDown, ChevronUp,
    ChevronRight, ChevronLeft, Maximize2, Minimize2, Square, CheckBox,
    DollarSign, TrendingDown, RefreshCcw, AlertOctagon, Briefcase,
    Users, Settings, Award, Star
} from 'lucide-react';

// SPPO SLICE IMPORTS
import {
    fetchVerificationSPPOs,
    fetchSPPOByNoForVerify,
    approveSPPO,
    selectVerificationSPPOs,
    selectVerificationSPPOsArray,
    selectSPPOData,
    selectSelectedRoleId,
    selectVerificationSPPOsLoading,
    selectSPPODataLoading,
    selectApproveSPPOLoading,
    selectVerificationSPPOsError,
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedSppono,
    setSelectedCCCode,
    setSelectedVendorCode,
    setSelectedAmendId,
    resetSPPOData
} from '../../slices/spPOSlice/spPoSlice';

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

const VerifySPPO = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // SPPO STATE
    const verificationSPPOs = useSelector(selectVerificationSPPOsArray);
    const selectedSPPOData = useSelector(selectSPPOData);
    const spposLoading = useSelector(selectVerificationSPPOsLoading);
    const sppoDataLoading = useSelector(selectSPPODataLoading);
    const approvalLoading = useSelector(selectApproveSPPOLoading);
    const spposError = useSelector(selectVerificationSPPOsError);
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
    const [selectedSPPO, setSelectedSPPO] = useState(null);
    const [verificationComment, setVerificationComment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVendor, setFilterVendor] = useState('All');
    const [filterCCCode, setFilterCCCode] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [editableRates, setEditableRates] = useState({});
    const [showServiceHistory, setShowServiceHistory] = useState(null);
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);

    // FIXED SERVICE DATA FUNCTION
    const getServiceData = () => {
        if (!selectedSPPOData) return [];
        
        // Primary path: Direct access to ItemDescList
        if (selectedSPPOData.ItemDescList && Array.isArray(selectedSPPOData.ItemDescList) && selectedSPPOData.ItemDescList.length > 0) {
            return selectedSPPOData.ItemDescList;
        }
        
        // Fallback: try to access nested Data.ItemDescList if Redux didn't extract properly
        if (selectedSPPOData.Data?.ItemDescList && Array.isArray(selectedSPPOData.Data.ItemDescList)) {
            return selectedSPPOData.Data.ItemDescList;
        }
        
        // Last resort: if selectedSPPOData IS the Data object
        if (Array.isArray(selectedSPPOData)) {
            return selectedSPPOData;
        }
        
        return [];
    };

    const serviceData = useMemo(() => getServiceData(), [selectedSPPOData]);

    // EXTRACT NOTIFICATION DATA
    const {
        InboxTitle,
        ModuleDisplayName
    } = notificationData || {};

    // INITIALIZE WITH ROLE ID AND USER ID FROM AUTH STATE
    useEffect(() => {
        if (roleId && uid && roleId !== selectedRoleId) {
            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));
            dispatch(fetchVerificationSPPOs({ roleId: roleId, userId: uid }));
        }
    }, [roleId, uid, selectedRoleId, dispatch, userData]);

    useEffect(() => {
        if (selectedSPPOData?.MOID && roleId) {
            const statusParams = {
                MOID: selectedSPPOData.MOID,
                ROID: roleId,
                ChkAmt: calculateSPPOTotalAmount(selectedSPPOData) || 0
            };
            dispatch(fetchStatusList(statusParams));
        }
    }, [selectedSPPOData?.MOID, roleId, dispatch]);

    // FETCH REMARKS WHEN SPPO IS SELECTED
    useEffect(() => {
        if (selectedSPPO?.SPPONo && selectedSPPOData?.MOID) {
            dispatch(setSelectedTrno(selectedSPPO.SPPONo));
            dispatch(setSelectedMOID(selectedSPPOData.MOID));
            dispatch(fetchRemarks({ trno: selectedSPPO.SPPONo, moid: selectedSPPOData.MOID }));
        }
    }, [selectedSPPO?.SPPONo, selectedSPPOData?.MOID, dispatch]);

    // Auto-collapse left panel when SPPO is selected
    useEffect(() => {
        if (selectedSPPO) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedSPPO]);

    // Initialize checked items when SPPO data is loaded
    useEffect(() => {
        const serviceData = getServiceData();
        if (serviceData && serviceData.length > 0) {
            const initialCheckedState = {};
            serviceData.forEach((item, index) => {
                initialCheckedState[index] = false;
            });
            setCheckedItems(initialCheckedState);
        }
    }, [selectedSPPOData]);

    // HELPER FUNCTIONS
    const getCurrentUser = () => {
        return userData?.userName || userDetails?.userName || 'system';
    };

    const getCurrentRoleName = () => {
        return userDetails?.roleName || userData?.roleName ||
            notificationData?.InboxTitle ||
            notificationData?.ModuleDisplayName ||
            'SPPO Verifier';
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

    const calculateSPPOTotalAmount = (sppoData) => {
        const serviceData = getServiceData();
        if (!serviceData || !Array.isArray(serviceData) || serviceData.length === 0) {
            return sppoData?.TotalValue || 0;
        }

        return serviceData.reduce((total, item, index) => {
            const rate = parseFloat(editableRates[index] || item.Rate || 0);
            const quantity = parseFloat(item.Quantity || 0);
            return total + (rate * quantity);
        }, 0);
    };

    // NEW: Rate Color Coding Function based on PRW Rate comparison
    const getRateColorClass = (newRate, prwRate) => {
        const numericNewRate = parseFloat(newRate);
        const numericPRWRate = parseFloat(prwRate);

        if (numericNewRate > numericPRWRate) {
            return 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-300';
        } else if (numericNewRate < numericPRWRate) {
            return 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300';
        }
        return 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200';
    };

    const getPriority = (sppo) => {
        if (!sppo) return 'Low';
        const totalAmount = sppo.TotalValue || 0;
        const daysOld = Math.ceil((new Date() - new Date()) / (1000 * 60 * 60 * 24));

        if (totalAmount > 50000 || daysOld > 30) return 'High';
        if (totalAmount > 25000 || daysOld > 15) return 'Medium';
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

    // ENHANCED: Service Rate Editing Functions with restrictions
    const handleRateEdit = (itemIndex, newRate, originalRate) => {
        const numericNewRate = parseFloat(newRate);
        const numericOriginalRate = parseFloat(originalRate);

        // Prevent increasing rates
        if (numericNewRate > numericOriginalRate) {
            toast.error('Rate can only be reduced, not increased!');
            return;
        }

        if (numericNewRate < 0) {
            toast.error('Rate cannot be negative!');
            return;
        }

        setEditableRates(prev => ({
            ...prev,
            [itemIndex]: numericNewRate
        }));
    };

    // Item Checkbox Functions
    const handleItemCheck = (itemIndex, checked) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemIndex]: checked
        }));
    };

    const handleSelectAllItems = (checked) => {
        const serviceData = getServiceData();
        if (serviceData && serviceData.length > 0) {
            const newCheckedState = {};
            serviceData.forEach((item, index) => {
                newCheckedState[index] = checked;
            });
            setCheckedItems(newCheckedState);
        }
    };

    const areAllItemsChecked = () => {
        const serviceData = getServiceData();
        if (!serviceData || serviceData.length === 0) return false;
        return serviceData.every((item, index) => checkedItems[index]);
    };

    const getCheckedItemsCount = () => {
        return Object.values(checkedItems).filter(Boolean).length;
    };

    // EVENT HANDLERS
    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handleSPPOSelect = async (sppo) => {
        setSelectedSPPO(sppo);
        dispatch(setSelectedSppono(sppo.SPPONo));
        dispatch(setSelectedCCCode(sppo.CCCode));
        dispatch(setSelectedVendorCode(sppo.VendorCode));
        dispatch(setSelectedAmendId(sppo.SPPOId || 0));

        try {
            await dispatch(fetchSPPOByNoForVerify({ 
                sppono: sppo.SPPONo, 
                ccCode: sppo.CCCode, 
                vendorCode: sppo.VendorCode, 
                amendId: sppo.SPPOId || 0
            })).unwrap();
        } catch (error) {
            console.error('SPPO Details API Error:', error);
        }

        // Reset states when new SPPO is selected
        setEditableRates({});
        setShowServiceHistory(null);
        setCheckedItems({});
        setShowRemarksHistory(false);
    };

    const buildSPPOApprovalPayload = (actionValue, selectedSPPO, selectedSPPOData, verificationComment) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            selectedSPPOData?.ApprovedUser,
            currentRoleName,
            currentUser,
            verificationComment
        );

        const updatedItemList = selectedSPPOData?.ItemDescList?.map((item, index) => ({
            ...item,
            Rate: editableRates[index] || item.Rate,
            Amount: (editableRates[index] || item.Rate) * parseFloat(item.Quantity || 0)
        }));

        const payload = {
            SPPONo: selectedSPPO.SPPONo,
            ApprovalNote: verificationComment,
            Remarks: updatedRemarks,
            Action: actionValue,
            RoleId: roleId || selectedRoleId,
            Userid: uid,
            VendorCode: selectedSPPOData?.VendorCode || selectedSPPO.VendorCode,
            CCCode: selectedSPPOData?.CCCode || selectedSPPO.CCCode,
            AmendId: 0,
            Createdby: getCurrentUser(),
            Amount: calculateSPPOTotalAmount(selectedSPPOData),
            ApprovalStatus: actionValue,
            ...(selectedSPPOData?.MOID && { MOID: selectedSPPOData.MOID }),
            ...(selectedSPPOData?.SPPOId && { SPPOId: selectedSPPOData.SPPOId }),
            ...(updatedItemList && { ItemDescList: updatedItemList }),
        };

        return payload;
    };

    const onActionClick = async (action) => {
        if (!selectedSPPO) {
            toast.error('No SPPO selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        if (!areAllItemsChecked()) {
            toast.error(`Please verify all services before proceeding. ${getCheckedItemsCount()}/${selectedSPPOData?.ItemDescList?.length || 0} services verified.`);
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
            const payload = buildSPPOApprovalPayload(
                actionValue,
                selectedSPPO,
                selectedSPPOData,
                verificationComment
            );

            const result = await dispatch(approveSPPO(payload)).unwrap();

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
                dispatch(fetchVerificationSPPOs({ roleId: roleId || selectedRoleId, userId: uid }));
                setSelectedSPPO(null);
                setVerificationComment('');
                setEditableRates({});
                setShowServiceHistory(null);
                setCheckedItems({});
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetSPPOData());
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

    // FILTER SPPOs BASED ON SEARCH AND FILTERS
    const filteredSPPOs = verificationSPPOs.filter(sppo => {
        const matchesSearch = sppo.VendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sppo.SPPONo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sppo.CCCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sppo.VendorCode?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesVendor = filterVendor === 'All' || sppo.VendorName === filterVendor;
        const matchesCCCode = filterCCCode === 'All' || sppo.CCCode === filterCCCode;

        return matchesSearch && matchesVendor && matchesCCCode;
    });

    const vendors = [...new Set(verificationSPPOs.map(sppo => sppo.VendorName).filter(Boolean))];
    const ccCodes = [...new Set(verificationSPPOs.map(sppo => sppo.CCCode).filter(Boolean))];

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
                            if (selectedSPPOData?.MOID && roleId) {
                                dispatch(fetchStatusList({
                                    MOID: selectedSPPOData.MOID,
                                    ROID: roleId,
                                    ChkAmt: calculateSPPOTotalAmount(selectedSPPOData) || 0
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
                    <div className="text-gray-500 mb-2">No actions available for this SPPO</div>
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

        const isDisabled = approvalLoading || verificationComment.trim() === '' || !areAllItemsChecked();

        return (
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Available Actions ({filteredActions.length})
                    </p>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className={`flex items-center space-x-1 text-sm ${areAllItemsChecked() ? 'text-green-600' : 'text-orange-600'}`}>
                            <CheckCircle className={`w-4 h-4 ${areAllItemsChecked() ? 'text-green-600' : 'text-orange-600'}`} />
                            <span>Services Verified: {getCheckedItemsCount()}/{selectedSPPOData?.ItemDescList?.length || 0}</span>
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${verificationComment.trim() ? 'text-green-600' : 'text-orange-600'}`}>
                            <FileText className={`w-4 h-4 ${verificationComment.trim() ? 'text-green-600' : 'text-orange-600'}`} />
                            <span>Comments: {verificationComment.trim() ? 'Added' : 'Required'}</span>
                        </div>
                        {Object.keys(editableRates).length > 0 && (
                            <div className="flex items-center space-x-1 text-sm text-indigo-600">
                                <RefreshCcw className="w-4 h-4" />
                                <span>Rate Updates: {Object.keys(editableRates).length}</span>
                            </div>
                        )}
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
                                        !areAllItemsChecked() ? `Please verify all services (${getCheckedItemsCount()}/${selectedSPPOData?.ItemDescList?.length || 0} verified)` :
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
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {InboxTitle || 'SPPO Verification'}
                                </h1>
                                <p className="text-purple-100 mt-1">
                                    {ModuleDisplayName} • {verificationSPPOs.length} SPPOs pending
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-4 py-2 bg-purple-500 text-purple-100 text-sm rounded-full border border-purple-400">
                            Service Provider PO
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full shadow-md">
                            {verificationSPPOs.length} Pending
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
                                placeholder="Search by vendor, SPPO, CC code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-purple-500/50 text-white placeholder-purple-200 border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-300 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={filterVendor}
                            onChange={(e) => setFilterVendor(e.target.value)}
                            className="w-full px-3 py-2.5 bg-purple-500/50 text-white border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
                        >
                            <option value="All">All Vendors</option>
                            {vendors.map(vendor => (
                                <option key={vendor} value={vendor}>{vendor}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterCCCode}
                            onChange={(e) => setFilterCCCode(e.target.value)}
                            className="w-full px-3 py-2.5 bg-purple-500/50 text-white border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
                        >
                            <option value="All">All Cost Centers</option>
                            {ccCodes.map(ccCode => (
                                <option key={ccCode} value={ccCode}>{ccCode}</option>
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
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{verificationSPPOs.length}</p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">Total SPPOs</p>
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
                                    {verificationSPPOs.filter(sppo => getPriority(sppo) === 'High').length}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">High Priority</p>
                            </div>
                        </div>
                        <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2 mt-3">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${verificationSPPOs.length > 0 ? (verificationSPPOs.filter(sppo => getPriority(sppo) === 'High').length / verificationSPPOs.length) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 border border-indigo-200 dark:border-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{vendors.length}</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">Service Providers</p>
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
                                    ₹{formatIndianCurrency(verificationSPPOs.reduce((sum, sppo) => sum + (sppo.TotalValue || 0), 0))}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">Total Amount</p>
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
                {/* Collapsible SPPOs List */}
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
                                            {filteredSPPOs.length}
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
                                            <span>Pending ({filteredSPPOs.length})</span>
                                        </h2>
                                        <div className="flex items-center space-x-2">
                                            {selectedSPPO && (
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
                                                    dispatch(fetchVerificationSPPOs({ roleId: roleId || selectedRoleId, userId: uid }));
                                                }}
                                                className="p-2 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                                                title="Refresh"
                                                disabled={spposLoading}
                                            >
                                                <RefreshCw className={`w-4 h-4 ${spposLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* SPPO List Content */}
                        <div className={`p-4 max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'w-16' : 'w-full'
                            }`}>
                            {spposLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && <p className="text-gray-500">Loading...</p>}
                                </div>
                            ) : spposError ? (
                                <div className="text-center py-8">
                                    <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && (
                                        <>
                                            <p className="text-red-500 mb-2">Error loading data</p>
                                            <button
                                                onClick={() => {
                                                    dispatch(fetchVerificationSPPOs({ roleId: roleId || selectedRoleId, userId: uid }));
                                                }}
                                                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                Retry
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : filteredSPPOs.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && <p className="text-gray-500">No SPPOs found!</p>}
                                </div>
                            ) : (
                                <div className={`space-y-3 ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'flex flex-col items-center' : ''}`}>
                                    {filteredSPPOs.map((sppo) => {
                                        const priority = getPriority(sppo);
                                        const totalAmount = sppo.TotalValue || 0;
                                        const amountDisplay = getAmountDisplay(totalAmount);

                                        return (
                                            <div
                                                key={sppo.SPPONo}
                                                className={`rounded-xl cursor-pointer transition-all hover:shadow-md border-2 ${selectedSPPO?.SPPONo === sppo.SPPONo
                                                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-lg'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 bg-white dark:bg-gray-800'
                                                    } ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'w-12 h-12 p-1' : ''}`}
                                                onClick={() => handleSPPOSelect(sppo)}
                                                title={isLeftPanelCollapsed && !isLeftPanelHovered ? `${sppo.VendorName} - ${sppo.SPPONo}` : ''}
                                            >
                                                {(isLeftPanelCollapsed && !isLeftPanelHovered) ? (
                                                    <div className="w-full h-full rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                                        <Briefcase className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-4">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className="relative">
                                                                <div className="w-12 h-12 rounded-full border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                                                    <Briefcase className="w-5 h-5 text-purple-600" />
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                                    {sppo.VendorName}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 truncate">{sppo.VendorCode}</p>
                                                            </div>
                                                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(priority)}`}>
                                                                {priority}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center space-x-1">
                                                                    <Hash className="w-3 h-3" />
                                                                    <span className="truncate">{sppo.SPPONo}</span>
                                                                </span>
                                                                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(sppo.Status)}`}>
                                                                    Status: {sppo.Status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-purple-600 dark:text-purple-400 font-medium">₹{amountDisplay.formatted}</span>
                                                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{sppo.CCCode}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-500 text-xs">
                                                                    <Award className="w-3 h-3 inline mr-1" />
                                                                    Service Provider
                                                                </span>
                                                                <span className="text-gray-500 text-xs">
                                                                    Balance: ₹{formatIndianCurrency(sppo.Balance)}
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

                {/* SPPO Details Panel with Dynamic Width */}
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
                                <span>{selectedSPPO ? 'SPPO Verification' : 'Select an SPPO'}</span>
                            </h2>
                        </div>

                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {selectedSPPO ? (
                                <div className="space-y-6">
                                    {sppoDataLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading detailed information...</p>
                                        </div>
                                    ) : selectedSPPOData ? (
                                        <>
                                            {/* Enhanced SPPO Header */}
                                            <div className="p-6 rounded-xl border-2 bg-gradient-to-r from-indigo-50 via-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
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
                                                                {selectedSPPOData.VendorName}
                                                            </h3>
                                                            <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                                                                SPPO: {selectedSPPOData.SPPONo}
                                                            </p>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="px-3 py-1 text-sm rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-opacity-20 dark:border-opacity-50">
                                                                    Service Provider
                                                                </span>
                                                                <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(selectedSPPOData.Status)}`}>
                                                                    Status: {selectedSPPOData.Status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                                                            ₹{formatIndianCurrency(calculateSPPOTotalAmount(selectedSPPOData))}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Balance: ₹{formatIndianCurrency(selectedSPPOData.Balance)}
                                                        </p>
                                                        {Object.keys(editableRates).length > 0 && (
                                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                                Rate Updates: {Object.keys(editableRates).length}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">SPPO ID</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedSPPOData.SPPOId}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Start Date</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedSPPOData.SPPOStartDate || 'N/A'}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">End Date</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedSPPOData.SPPOEndDate || 'N/A'}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Cost Center</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedSPPOData.CCCode}</span>
                                                    </div>
                                                </div>

                                                {/* Cost Center and DCA Information */}
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center">
                                                            <Building className="w-4 h-4 mr-2" />
                                                            Cost Center
                                                        </h5>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedSPPOData.CCName}</p>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center">
                                                            <Layers className="w-4 h-4 mr-2" />
                                                            DCA
                                                        </h5>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedSPPOData.DCAName}</p>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center">
                                                            <Target className="w-4 h-4 mr-2" />
                                                            Sub DCA
                                                        </h5>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedSPPOData.SubDCAName}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Service Details with Checkboxes and Enhanced Rate Editing */}
                                            {serviceData && serviceData.length > 0 ? (
                                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center">
                                                            <Settings className="w-5 h-5 mr-2" />
                                                            Service Details ({serviceData.length} Services) - Verification Required
                                                        </h4>
                                                        <div className="flex items-center space-x-4">
                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={areAllItemsChecked()}
                                                                    onChange={(e) => handleSelectAllItems(e.target.checked)}
                                                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                />
                                                                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                                                    Select All ({getCheckedItemsCount()}/{serviceData.length})
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full">
                                                                <thead className="bg-purple-100 dark:bg-purple-900/30 border-b border-gray-200 dark:border-gray-600">
                                                                    <tr>
                                                                        <th className="w-16 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">Verify</th>
                                                                        <th className="w-96 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-left">Service Description</th>
                                                                        <th className="w-20 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">Unit</th>
                                                                        <th className="w-24 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">Quantity</th>
                                                                        <th className="w-32 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">Rate (Editable)</th>
                                                                        <th className="w-24 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">Client Rate</th>
                                                                        <th className="w-24 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">PRW Rate</th>
                                                                        <th className="w-32 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">Amount</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody className="max-h-80 overflow-y-auto">
                                                                    {serviceData.map((service, index) => {
                                                                        const currentEditableRate = editableRates[index] || service.Rate;
                                                                        const quantity = parseFloat(service.Quantity || 0);
                                                                        const amount = parseFloat(currentEditableRate) * quantity;
                                                                        const isChecked = checkedItems[index] || false;

                                                                        return (
                                                                            <tr key={index} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isChecked ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600' : ''}`}>
                                                                                <td className="p-3 text-center">
                                                                                    <div className="flex flex-col items-center space-y-2">
                                                                                        <label className="flex items-center justify-center cursor-pointer">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={isChecked}
                                                                                                onChange={(e) => handleItemCheck(index, e.target.checked)}
                                                                                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                                                            />
                                                                                        </label>
                                                                                        {isChecked && (
                                                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                                                        )}
                                                                                    </div>
                                                                                </td>

                                                                                <td className="p-3">
                                                                                    <div className="flex items-start space-x-3">
                                                                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                                                                            <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                                                        </div>
                                                                                        <div className="min-w-0 flex-1">
                                                                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                                                                                                {service.Description}
                                                                                            </p>
                                                                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-mono mt-1">
                                                                                                Service ID: {service.SPPOItemId}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>

                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className="font-medium text-gray-600 dark:text-gray-400">{service.Unit}</p>
                                                                                    </div>
                                                                                </td>

                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className="font-bold text-purple-700 dark:text-purple-300 text-lg">{service.Quantity}</p>
                                                                                    </div>
                                                                                </td>

                                                                                {/* ENHANCED: Rate Input with PRW Color Coding */}
                                                                                <td className="p-3 text-center">
                                                                                    <div className="space-y-2">
                                                                                        <div className="flex items-center justify-center space-x-1">
                                                                                            <span className="text-xs">₹</span>
                                                                                            <input
                                                                                                type="number"
                                                                                                value={currentEditableRate}
                                                                                                onChange={(e) => handleRateEdit(index, e.target.value, service.Rate)}
                                                                                                disabled={isChecked}
                                                                                                className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center transition-all ${isChecked
                                                                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60'
                                                                                                    : getRateColorClass(currentEditableRate, service.PRWRate)
                                                                                                    }`}
                                                                                                step="0.01"
                                                                                                min="0"
                                                                                                max={service.Rate}
                                                                                                title={
                                                                                                    isChecked
                                                                                                        ? 'Rate locked after verification'
                                                                                                        : `Current Rate: ₹${formatIndianCurrency(currentEditableRate)} vs PRW Rate: ₹${formatIndianCurrency(service.PRWRate)}`
                                                                                                }
                                                                                            />
                                                                                            {isChecked ? (
                                                                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                                                                            ) : (
                                                                                                <Edit3 className="w-3 h-3 text-gray-400" />
                                                                                            )}
                                                                                        </div>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                            {isChecked ? 'Verified' : 'Editable (Down only)'}
                                                                                        </p>
                                                                                        {parseFloat(currentEditableRate) !== parseFloat(service.Rate) && (
                                                                                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                                                                                Modified: ₹{formatIndianCurrency(Math.abs(currentEditableRate - service.Rate))}
                                                                                            </p>
                                                                                        )}
                                                                                        {/* Rate Comparison Status */}
                                                                                        <div className="text-xs">
                                                                                            {parseFloat(currentEditableRate) > parseFloat(service.PRWRate) && (
                                                                                                <span className="text-red-600 dark:text-red-400">Above PRW</span>
                                                                                            )}
                                                                                            {parseFloat(currentEditableRate) < parseFloat(service.PRWRate) && (
                                                                                                <span className="text-green-600 dark:text-green-400">Below PRW</span>
                                                                                            )}
                                                                                            {parseFloat(currentEditableRate) === parseFloat(service.PRWRate) && (
                                                                                                <span className="text-gray-600 dark:text-gray-400">Equal PRW</span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </td>

                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className="font-medium text-indigo-600 dark:text-indigo-400">₹{formatIndianCurrency(service.ClientRate)}</p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                                                                                    </div>
                                                                                </td>

                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className="font-medium text-orange-600 dark:text-orange-400">₹{formatIndianCurrency(service.PRWRate)}</p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">PRW</p>
                                                                                    </div>
                                                                                </td>

                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className="font-bold text-green-700 dark:text-green-300 text-lg">
                                                                                            ₹{formatIndianCurrency(amount)}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                            {quantity} × ₹{formatIndianCurrency(currentEditableRate)}
                                                                                        </p>
                                                                                        {parseFloat(currentEditableRate) !== parseFloat(service.Rate) && (
                                                                                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                                                                                Original: ₹{formatIndianCurrency(parseFloat(service.Rate) * quantity)}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-4 border-t border-gray-200 dark:border-gray-600">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <span className="font-semibold text-purple-800 dark:text-purple-200">
                                                                        Total Services ({selectedSPPOData.ItemDescList.length} services):
                                                                    </span>
                                                                    <div className="flex items-center space-x-4 flex-wrap">
                                                                        <div className={`flex items-center space-x-1 text-sm ${areAllItemsChecked() ? 'text-green-600' : 'text-orange-600'}`}>
                                                                            <CheckSquare className="w-4 h-4" />
                                                                            <span>Verified: {getCheckedItemsCount()}/{selectedSPPOData.ItemDescList.length}</span>
                                                                        </div>
                                                                        {Object.keys(editableRates).length > 0 && (
                                                                            <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                                                                Rate Updates: {Object.keys(editableRates).length}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                                                        <div className="text-center">
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total SPPO Amount</p>
                                                                            <p className="font-bold text-green-700 dark:text-green-300 text-xl">
                                                                                ₹{formatIndianCurrency(calculateSPPOTotalAmount(selectedSPPOData))}
                                                                            </p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                                Original: ₹{formatIndianCurrency(selectedSPPOData.TotalValue)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                                    <div className="text-center py-8">
                                                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Service Details Found</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                            This SPPO doesn't have any service items to display.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* SPPO Terms & Remarks */}
                                            {selectedSPPOData.Remarks && (
                                                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
                                                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center">
                                                        <Clipboard className="w-5 h-5 mr-2" />
                                                        SPPO Terms & Conditions
                                                    </h4>
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {selectedSPPOData.Remarks.split('|').map((term, index) => (
                                                                <div key={index} className="flex items-start space-x-2">
                                                                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                                                    <span>{term.trim()}</span>
                                                                </div>
                                                            ))}
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

                                            {/* Verification Comments */}
                                            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-5 rounded-xl border-2 border-red-200 dark:border-red-700">
                                                <label className="text-sm font-bold text-red-800 dark:text-red-200 mb-3 flex items-center">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    <span className="text-red-600 dark:text-red-400">*</span> Verification Comments (Mandatory)
                                                </label>
                                                <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                                                    Please verify all SPPO details, service descriptions, quantities, rates, terms & conditions, and vendor information.
                                                </p>
                                                <textarea
                                                    value={verificationComment}
                                                    onChange={(e) => setVerificationComment(e.target.value)}
                                                    className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 transition-all ${verificationComment.trim() === ''
                                                        ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                                        : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                                                        }`}
                                                    rows="4"
                                                    placeholder="Please verify SPPO amount, service details, quantities, rates, terms & conditions, delivery requirements..."
                                                    required
                                                />
                                                {verificationComment.trim() === '' && (
                                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                                        Verification comment is required before proceeding
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
                                            <p className="text-gray-500 dark:text-gray-400">Loading SPPO details...</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No SPPO Selected</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Select a Service Provider Purchase Order from the list to view details and take action.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifySPPO;