// VerifySupplierPO.jsx - Enhanced with Price Update Functionality
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeft, IndianRupee, Building, Calendar, FileText,
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
    DollarSign, TrendingDown, RefreshCcw, AlertOctagon
} from 'lucide-react';

// ✅ SUPPLIER PO SLICE IMPORTS
import {
    // Async Thunks
    fetchVerificationSupplierPOs,
    fetchSupplierPOByNo,
    approveSupplierPO,

    // Data Selectors
    selectVerificationSupplierPOs,
    selectVerificationSupplierPOsArray,
    selectSupplierPOData,
    selectSelectedRoleId,

    // Loading Selectors
    selectVerificationSupplierPOsLoading,
    selectSupplierPODataLoading,
    selectApproveSupplierPOLoading,

    // Error Selectors
    selectVerificationSupplierPOsError,

    // Actions
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedCCType,
    setSelectedPONo,
    setSelectedIndentNo,
    setSelectedSupplierCode,
    resetSupplierPOData
} from '../../slices/supplierPOSlice/supplierPOSlice';

// ✅ PURCHASE HELPER SLICE IMPORTS
import {
    fetchRemarks,
    fetchPreviousPODetails,
    selectRemarks,
    selectPreviousPODetails,
    selectRemarksLoading,
    selectPreviousPODetailsLoading,
    setSelectedTrno,
    setSelectedMOID,
    setSelectedItemCode
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

// ✅ APPROVAL SLICE IMPORTS (Generic/Reusable)
import {
    // Async Thunks
    fetchStatusList,

    // Data Selectors
    selectStatusList,
    selectAvailableActions,
    selectEnabledActions,
    selectHasActions,

    // Loading Selectors  
    selectStatusListLoading,

    // Error Selectors
    selectStatusListError,

    // Actions
    resetApprovalData,
    clearError as clearApprovalError
} from '../../slices/CommonSlice/getStatusSlice';

// ✅ IMPORT AMOUNT HELPER
import {
    convertAmountToWords,
    formatIndianCurrency,
    getAmountDisplay,
    isValidAmount
} from '../../utilities/amountToTextHelper';

const VerifySupplierPO = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ✅ SUPPLIER PO STATE
    const verificationPOs = useSelector(selectVerificationSupplierPOsArray);
    const selectedPOData = useSelector(selectSupplierPOData);
    const posLoading = useSelector(selectVerificationSupplierPOsLoading);
    const poDataLoading = useSelector(selectSupplierPODataLoading);
    const approvalLoading = useSelector(selectApproveSupplierPOLoading);
    const posError = useSelector(selectVerificationSupplierPOsError);
    const selectedRoleId = useSelector(selectSelectedRoleId);

    // ✅ PURCHASE HELPER STATE
    const remarks = useSelector(selectRemarks);
    const previousPODetails = useSelector(selectPreviousPODetails);
    const remarksLoading = useSelector(selectRemarksLoading);
    const previousPOLoading = useSelector(selectPreviousPODetailsLoading);

    // ✅ APPROVAL STATE (Generic/Reusable)
    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);

    // ✅ GET USER ID AND ROLE ID FROM AUTH STATE
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // 🔍 COMPREHENSIVE DEBUG LOGGING
    console.log('🔍 Auth State Debug:', {
        userData,
        roleId,
        uid,
        'userData.roleId': userData?.roleId,
        'userData.RID': userData?.RID,
        'userData.UID': userData?.UID,
        'userData.uid': userData?.uid,
        'notificationData': notificationData
    });

    // ✅ LOCAL STATE
    const [selectedPO, setSelectedPO] = useState(null);
    const [verificationComment, setVerificationComment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVendor, setFilterVendor] = useState('All');
    const [filterCCType, setFilterCCType] = useState('All');

    // ✅ ENHANCED STATE FOR PRICE MANAGEMENT
    const [editablePrices, setEditablePrices] = useState({});
    const [showPreviousDetails, setShowPreviousDetails] = useState(null);
    const [selectedItemCodeLocal, setSelectedItemCodeLocal] = useState(null);
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);

    // ✅ UI Enhancement States
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    // ✅ NEW: Price Update Management States
    const [priceUpdateModal, setPriceUpdateModal] = useState({
        show: false,
        itemCode: null,
        itemName: '',
        basicPrice: 0,
        newBasicPrice: 0,
        onConfirm: null,
        onCancel: null
    });
    const [updatedStandardPrices, setUpdatedStandardPrices] = useState({});
    const [recentPriceChanges, setRecentPriceChanges] = useState({});

    // ✅ EXTRACT NOTIFICATION DATA (FOR UI DISPLAY ONLY)
    const {
        InboxTitle,
        ModuleDisplayName
    } = notificationData || {};

    // ✅ INITIALIZE WITH ROLE ID AND USER ID FROM AUTH STATE
    useEffect(() => {
        console.log('🚀 useEffect Trigger - Auth Values Check:', {
            roleId,
            uid,
            selectedRoleId,
            'roleId !== selectedRoleId': roleId !== selectedRoleId,
            'Both roleId and uid exist': !!(roleId && uid)
        });

        if (roleId && uid && roleId !== selectedRoleId) {
            console.log('📡 Dispatching API Calls with:', { roleId, uid });

            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));
            dispatch(setSelectedCCType('PCC')); // Default CC Type

            console.log('📋 Fetching Verification Supplier POs...');
            dispatch(fetchVerificationSupplierPOs({ roleId: roleId, userId: uid, ccType: 'PCC' }));
        } else {
            console.log('❌ Skipping API call. Missing values:', {
                'roleId missing': !roleId,
                'uid missing': !uid,
                'roleId same as selectedRoleId': roleId === selectedRoleId
            });
        }
    }, [roleId, uid, selectedRoleId, dispatch, userData]);

    // ✅ ADD CONSOLE LOGGING FOR DATA STATE CHANGES
    useEffect(() => {
        console.log('📊 Data State Update:', {
            'POs Loading': posLoading,
            'POs Error': posError,
            'POs Count': verificationPOs.length,
            'PO Data Loading': poDataLoading,
            'Selected PO Data': selectedPOData ? 'Loaded' : 'Not Loaded',
            'Selected PO': selectedPO?.PONo || 'None'
        });
    }, [posLoading, posError, verificationPOs.length, poDataLoading, selectedPOData, selectedPO]);

    useEffect(() => {
        if (selectedPOData?.MOID && roleId) {
            const statusParams = {
                MOID: selectedPOData.MOID,
                ROID: roleId,
                ChkAmt: calculatePOTotalAmount(selectedPOData) || 0
            };
            console.log('📊 Fetching Status List with params:', statusParams);
            dispatch(fetchStatusList(statusParams));
        } else {
            console.log('❌ Skipping Status List fetch:', {
                'MOID missing': !selectedPOData?.MOID,
                'roleId missing': !roleId,
                'selectedPOData': selectedPOData
            });
        }
    }, [selectedPOData?.MOID, roleId, dispatch]);

    // ✅ FETCH REMARKS WHEN PO IS SELECTED
    useEffect(() => {
        if (selectedPO?.PONo && selectedPOData?.MOID) {
            dispatch(setSelectedTrno(selectedPO.PONo));
            dispatch(setSelectedMOID(selectedPOData.MOID));
            dispatch(fetchRemarks({ trno: selectedPO.PONo, moid: selectedPOData.MOID }));
        }
    }, [selectedPO?.PONo, selectedPOData?.MOID, dispatch]);

    // ✅ NEW: Auto-collapse left panel when PO is selected
    useEffect(() => {
        if (selectedPO) {
            setIsLeftPanelCollapsed(true);
        }
    }, [selectedPO]);

    // ✅ NEW: Initialize checked items and check for recent price changes when PO data is loaded
    useEffect(() => {
        if (selectedPOData?.PODataList) {
            const initialCheckedState = {};
            const priceChanges = {};

            selectedPOData.PODataList.forEach(item => {
                initialCheckedState[item.itemcode] = false;

                // ✅ NEW: Check for recent price changes
                const basicPrice = parseFloat(item.basicprice || 0);
                const itemNewPrice = parseFloat(item.ItemNewPrice || 0);

                if (basicPrice !== itemNewPrice && itemNewPrice > 0) {
                    priceChanges[item.itemcode] = {
                        basicPrice,
                        itemNewPrice,
                        hasRecentChange: true
                    };
                }
            });

            setCheckedItems(initialCheckedState);
            setRecentPriceChanges(priceChanges);

            // Show notification if there are recent price changes
            const changedItemsCount = Object.keys(priceChanges).length;
            if (changedItemsCount > 0) {
                toast.info(
                    `⚠️ ${changedItemsCount} item(s) have recent price changes. Check item details for updated prices.`,
                    { autoClose: 8000 }
                );
            }
        }
    }, [selectedPOData]);

    // ✅ NEW: Price Comparison and Update Functions
    const checkPriceDifference = (item) => {
        const basicPrice = parseFloat(item.basicprice || 0);
        const newBasicPrice = parseFloat(item.NewBasicprice || 0);
        return basicPrice !== newBasicPrice;
    };

    const hasRecentPriceChange = (itemCode) => {
        return recentPriceChanges[itemCode]?.hasRecentChange || false;
    };

    const showPriceUpdateConfirmation = (item, onConfirm, onCancel) => {
        setPriceUpdateModal({
            show: true,
            itemCode: item.itemcode,
            itemName: item.itemname,
            basicPrice: parseFloat(item.basicprice || 0),
            newBasicPrice: parseFloat(item.NewBasicprice || 0),
            onConfirm,
            onCancel
        });
    };

    const handlePriceUpdate = (itemCode, shouldUpdate) => {
        if (shouldUpdate) {
            const item = selectedPOData.PODataList.find(i => i.itemcode === itemCode);
            if (item) {
                const newPrice = parseFloat(item.NewBasicprice);

                // Update the standard price and ItemNewPrice
                setUpdatedStandardPrices(prev => ({
                    ...prev,
                    [itemCode]: {
                        oldBasicPrice: parseFloat(item.basicprice),
                        newBasicPrice: newPrice,
                        updatedAt: new Date().toISOString()
                    }
                }));

                console.log('💰 Price Update Applied:', {
                    itemCode,
                    oldBasicPrice: item.basicprice,
                    newBasicPrice: newPrice,
                    itemName: item.itemname
                });

                toast.success(`✅ Standard price updated for ${item.itemname} from ₹${formatIndianCurrency(item.basicprice)} to ₹${formatIndianCurrency(newPrice)}`);
            }
        }

        setPriceUpdateModal({ show: false, itemCode: null, itemName: '', basicPrice: 0, newBasicPrice: 0, onConfirm: null, onCancel: null });
    };

    // ✅ HELPER FUNCTIONS
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

    const calculatePOTotalAmount = (poData) => {
        if (!poData?.PODataList || !Array.isArray(poData.PODataList)) return 0;

        return poData.PODataList.reduce((total, item) => {
            const unitPrice = parseFloat(editablePrices[item.itemcode] || item.NewBasicprice || item.Amount || 0);
            const itemAmount = unitPrice * parseFloat(item.quantity || 0);
            const cgstAmount = itemAmount * (parseFloat(item.CGSTPercent || 0) / 100);
            const sgstAmount = itemAmount * (parseFloat(item.SGSTPercent || 0) / 100);
            const igstAmount = itemAmount * (parseFloat(item.IGSTPercent || 0) / 100);

            return total + itemAmount + cgstAmount + sgstAmount + igstAmount;
        }, 0);
    };

    const getPriority = (po) => {
        if (!po) return 'Low';
        const totalAmount = calculatePOTotalAmount(po);
        const poDate = po.PODate ? new Date(po.PODate) : new Date();
        const today = new Date();
        const daysOld = Math.ceil((today - poDate) / (1000 * 60 * 60 * 24));

        if (totalAmount > 100000 || daysOld > 30) return 'High';
        if (totalAmount > 50000 || daysOld > 15) return 'Medium';
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

    const parseApprovalComments = (remarks) => {
        if (!remarks) return [];

        return remarks.split('||').map(comment => {
            const parts = comment.trim().split(' : ');
            if (parts.length >= 3) {
                return {
                    role: parts[0].trim(),
                    name: parts[1].trim(),
                    comment: parts.slice(2).join(' : ').trim()
                };
            }
            return { role: '', name: '', comment: comment.trim() };
        }).filter(item => item.comment);
    };

    // ✅ ENHANCED FUNCTIONS FOR PRICE MANAGEMENT

    // Price Editing Functions
    const handlePriceEdit = (itemCode, newPrice, originalPrice) => {
        const numericNewPrice = parseFloat(newPrice);
        const numericOriginalPrice = parseFloat(originalPrice);

        if (numericNewPrice > numericOriginalPrice) {
            toast.error('Price can only be reduced, not increased!');
            return;
        }

        if (numericNewPrice < 0) {
            toast.error('Price cannot be negative!');
            return;
        }

        setEditablePrices(prev => ({
            ...prev,
            [itemCode]: numericNewPrice
        }));

        console.log('💰 Price Updated:', {
            itemCode,
            originalPrice: numericOriginalPrice,
            newPrice: numericNewPrice,
            savings: numericOriginalPrice - numericNewPrice
        });
    };

    // ✅ NEW: Price Color Coding Function
    const getPriceColorClass = (newPrice, standardPrice) => {
        const numericNewPrice = parseFloat(newPrice);
        const numericStandardPrice = parseFloat(standardPrice);

        if (numericNewPrice > numericStandardPrice) {
            return 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-300';
        } else if (numericNewPrice < numericStandardPrice) {
            return 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300';
        }
        return 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200';
    };

    // Previous Purchase Details Functions
    const handleItemCodeClick = async (itemCode) => {
        setSelectedItemCodeLocal(itemCode);
        dispatch(setSelectedItemCode(itemCode));
        dispatch(fetchPreviousPODetails({ itemcode: itemCode }));
        setShowPreviousDetails(itemCode);

        console.log('📊 Fetching Previous Purchase Details for:', itemCode);
    };

    const calculatePriceVariation = (currentPrice, previousPrice) => {
        if (!previousPrice || previousPrice === 0) return { percentage: 0, amount: 0, trend: 'same' };

        const priceDiff = currentPrice - previousPrice;
        const percentage = ((priceDiff / previousPrice) * 100).toFixed(2);

        return {
            percentage: Math.abs(percentage),
            amount: Math.abs(priceDiff),
            trend: priceDiff > 0 ? 'increase' : priceDiff < 0 ? 'decrease' : 'same'
        };
    };

    // ✅ ENHANCED: Item Checkbox Functions with Price Update Logic
    const handleItemCheck = (itemCode, checked) => {
        const item = selectedPOData?.PODataList?.find(i => i.itemcode === itemCode);

        if (!item) {
            console.error('Item not found:', itemCode);
            return;
        }

        if (checked) {
            // ✅ NEW: Check for price difference when item is being checked
            if (checkPriceDifference(item)) {
                // Show price update confirmation
                showPriceUpdateConfirmation(
                    item,
                    (shouldUpdate) => {
                        // Handle the price update decision
                        handlePriceUpdate(itemCode, shouldUpdate);

                        // Complete the item check
                        setCheckedItems(prev => ({
                            ...prev,
                            [itemCode]: true
                        }));

                        console.log('✅ Item Checked with Price Update Decision:', {
                            itemCode,
                            itemName: item.itemname,
                            priceUpdated: shouldUpdate,
                            basicPrice: item.basicprice,
                            newBasicPrice: item.NewBasicprice
                        });
                    },
                    () => {
                        // User cancelled, don't check the item
                        console.log('❌ Item Check Cancelled due to Price Update Refusal:', itemCode);
                    }
                );
            } else {
                // No price difference, directly check the item
                setCheckedItems(prev => ({
                    ...prev,
                    [itemCode]: checked
                }));

                console.log('✅ Item Checked (No Price Difference):', {
                    itemCode,
                    itemName: item.itemname,
                    basicPrice: item.basicprice,
                    newBasicPrice: item.NewBasicprice
                });
            }
        } else {
            // Unchecking item
            setCheckedItems(prev => ({
                ...prev,
                [itemCode]: checked
            }));

            console.log('⬜ Item Unchecked:', itemCode);
        }
    };

    const handleSelectAllItems = (checked) => {
        if (selectedPOData?.PODataList) {
            if (checked) {
                // Check if any items have price differences
                const itemsWithPriceDiff = selectedPOData.PODataList.filter(item => checkPriceDifference(item));

                if (itemsWithPriceDiff.length > 0) {
                    toast.warning(
                        `${itemsWithPriceDiff.length} item(s) have price differences. Please verify each item individually to handle price updates.`,
                        { autoClose: 5000 }
                    );
                    return;
                }
            }

            const newCheckedState = {};
            selectedPOData.PODataList.forEach(item => {
                newCheckedState[item.itemcode] = checked;
            });
            setCheckedItems(newCheckedState);
        }
    };

    const areAllItemsChecked = () => {
        if (!selectedPOData?.PODataList) return false;
        return selectedPOData.PODataList.every(item => checkedItems[item.itemcode]);
    };

    const getCheckedItemsCount = () => {
        return Object.values(checkedItems).filter(Boolean).length;
    };

    // ✅ EVENT HANDLERS
    const handleBackToInbox = () => {
        if (onNavigate) {
            onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
        }
    };

    const handlePOSelect = async (po) => {
        console.log('📄 PO Selected:', {
            'PO No': po.PONo,
            'Indent No': po.IndentNo,
            'Vendor Name': po.VendorName,
            'PO': po
        });

        setSelectedPO(po);
        dispatch(setSelectedPONo(po.PONo));
        dispatch(setSelectedIndentNo(po.IndentNo));
        dispatch(setSelectedSupplierCode(po.VendorCode));

        console.log('📡 Fetching PO Details for:', po.PONo, po.IndentNo);
        dispatch(fetchSupplierPOByNo({ poNo: po.PONo, indentNo: po.IndentNo }));

        // Reset states when new PO is selected
        setEditablePrices({});
        setShowPreviousDetails(null);
        setShowRemarksHistory(false);
        setCheckedItems({});
        setUpdatedStandardPrices({});
        setRecentPriceChanges({});
        setPriceUpdateModal({ show: false, itemCode: null, itemName: '', basicPrice: 0, newBasicPrice: 0, onConfirm: null, onCancel: null });
    };

    const buildPOApprovalPayload = (actionValue, selectedPO, selectedPOData, verificationComment) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            selectedPOData?.ApprovedUser,
            currentRoleName,
            currentUser,
            verificationComment
        );

        // ✅ ENHANCED: Include updated prices and standard price changes in payload
        const updatedPODataList = selectedPOData?.PODataList?.map(item => {
            const baseItem = {
                ...item,
                NewBasicprice: editablePrices[item.itemcode] || item.NewBasicprice
            };

            // Apply standard price updates
            if (updatedStandardPrices[item.itemcode]) {
                baseItem.basicprice = updatedStandardPrices[item.itemcode].newBasicPrice;
                baseItem.ItemNewPrice = updatedStandardPrices[item.itemcode].newBasicPrice;
            }

            return baseItem;
        });

        const payload = {
            PONo: selectedPO.PONo,
            IndentNo: selectedPO.IndentNo,
            ApprovalNote: verificationComment,
            Remarks: updatedRemarks,
            Action: actionValue,
            Roleid: roleId || selectedRoleId,
            Userid: uid,
            SupplierCode: selectedPOData?.VendorCode || selectedPO.VendorCode,
            Createdby: getCurrentUser(),
            Amount: calculatePOTotalAmount(selectedPOData),
            PODate: selectedPOData?.PODate || selectedPO.PODate,
            ApprovalStatus: actionValue,

            // Additional PO-specific fields
            ...(selectedPOData?.MOID && { MOID: selectedPOData.MOID }),
            ...(selectedPOData?.CCCode && { CCCode: selectedPOData.CCCode }),
            ...(selectedPOData?.CCType && { CCType: selectedPOData.CCType }),
            ...(updatedPODataList && { PODataList: updatedPODataList }),

            // ✅ NEW: Include price update information
            ...(Object.keys(updatedStandardPrices).length > 0 && {
                UpdatedStandardPrices: updatedStandardPrices
            })
        };

        console.log('🎯 Built PO Approval Payload with Price Updates:', {
            'Action': actionValue,
            'PO No': selectedPO.PONo,
            'Indent No': selectedPO.IndentNo,
            'RoleId Used': roleId || selectedRoleId,
            'UserId Used': uid,
            'Updated Prices': Object.keys(editablePrices).length,
            'Standard Price Updates': Object.keys(updatedStandardPrices).length,
            'Full Payload': payload
        });

        return payload;
    };

    const onActionClick = async (action) => {
        console.log('🎬 Action Click Started:', {
            'Action': action,
            'Selected PO': selectedPO?.PONo,
            'Comment Length': verificationComment.trim().length,
            'All Items Checked': areAllItemsChecked(),
            'Checked Items': getCheckedItemsCount(),
            'Total Items': selectedPOData?.PODataList?.length || 0,
            'Price Updates': Object.keys(updatedStandardPrices).length
        });

        if (!selectedPO) {
            console.log('❌ No PO selected');
            toast.error('No PO selected');
            return;
        }

        if (!verificationComment || verificationComment.trim() === '') {
            console.log('❌ No verification comment provided');
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }

        // ✅ Check if all items are verified (checked)
        if (!areAllItemsChecked()) {
            console.log('❌ Not all items checked');
            toast.error(`Please verify all items before proceeding. ${getCheckedItemsCount()}/${selectedPOData?.PODataList?.length || 0} items verified.`);
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

        console.log('🎯 Final Action Value:', actionValue);

        try {
            const payload = buildPOApprovalPayload(
                actionValue,
                selectedPO,
                selectedPOData,
                verificationComment
            );

            console.log(`🚀 Dispatching Approval for PO ${actionValue}:`, selectedPO.PONo);

            const result = await dispatch(approveSupplierPO(payload)).unwrap();

            console.log('✅ Approval Result:', result);

            if (result && typeof result === 'string') {
                if (result.includes('$')) {
                    const [status, additionalInfo] = result.split('$');
                    toast.success(`✅ ${action.text} completed successfully!`);
                    if (additionalInfo) {
                        setTimeout(() => {
                            toast.info(additionalInfo, { autoClose: 6000 });
                        }, 500);
                    }
                } else {
                    toast.success(`✅ ${action.text} completed successfully!`);
                }
            } else {
                toast.success(`✅ ${action.text} completed successfully!`);
            }

            // Show price update summary if any
            const priceUpdateCount = Object.keys(updatedStandardPrices).length;
            if (priceUpdateCount > 0) {
                setTimeout(() => {
                    toast.info(`💰 ${priceUpdateCount} standard price(s) updated successfully!`, { autoClose: 5000 });
                }, 1000);
            }

            console.log('🔄 Refreshing data after successful approval...');
            setTimeout(() => {
                dispatch(fetchVerificationSupplierPOs({ roleId: roleId || selectedRoleId, userId: uid, ccType: 'PCC' }));
                setSelectedPO(null);
                setVerificationComment('');
                setEditablePrices({});
                setShowPreviousDetails(null);
                setShowRemarksHistory(false);
                setCheckedItems({});
                setUpdatedStandardPrices({});
                setRecentPriceChanges({});
                setIsLeftPanelCollapsed(false);
                dispatch(resetSupplierPOData());
                dispatch(resetApprovalData());
            }, 1000);

        } catch (error) {
            console.error(`❌ PO ${action.type} Error:`, error);
            let errorMessage = `Failed to ${action.text.toLowerCase()}`;

            if (error && typeof error === 'string') {
                errorMessage = `❌ ${error}`;
            } else if (error?.message) {
                errorMessage = `❌ ${error.message}`;
            }

            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    // ✅ FILTER POs BASED ON SEARCH AND FILTERS
    const filteredPOs = verificationPOs.filter(po => {
        const matchesSearch = po.VendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.PONo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.IndentNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.CCCode?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesVendor = filterVendor === 'All' || po.VendorName === filterVendor;
        const matchesCCType = filterCCType === 'All' || po.CCType === filterCCType;

        return matchesSearch && matchesVendor && matchesCCType;
    });

    const vendors = [...new Set(verificationPOs.map(po => po.VendorName).filter(Boolean))];
    const ccTypes = [...new Set(verificationPOs.map(po => po.CCType).filter(Boolean))];

    // ✅ NEW: Price Update Confirmation Modal
    const renderPriceUpdateModal = () => {
        if (!priceUpdateModal.show) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg mr-3">
                            <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Price Update Confirmation
                        </h3>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {priceUpdateModal.itemName}
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Current Standard Price:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    ₹{formatIndianCurrency(priceUpdateModal.basicPrice)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">New Purchase Price:</span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    ₹{formatIndianCurrency(priceUpdateModal.newBasicPrice)}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Price Difference:</span>
                                    <span className={`font-medium ${priceUpdateModal.newBasicPrice > priceUpdateModal.basicPrice
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-green-600 dark:text-green-400'
                                        }`}>
                                        {priceUpdateModal.newBasicPrice > priceUpdateModal.basicPrice ? '+' : ''}
                                        ₹{formatIndianCurrency(Math.abs(priceUpdateModal.newBasicPrice - priceUpdateModal.basicPrice))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6">
                        <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium mb-2">
                            📢 Do you want to update the standard price as the new price?
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                            This will update the item's standard price for future PO approvals to ensure consistency.
                        </p>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => priceUpdateModal.onConfirm?.(true)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Yes, Update Price
                        </button>
                        <button
                            onClick={() => priceUpdateModal.onConfirm?.(false)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                            <X className="w-4 h-4 mr-2" />
                            No, Keep Current
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ✅ RENDER PREVIOUS PURCHASE DETAILS POPUP
    const renderPreviousDetailsPopup = () => {
        if (!showPreviousDetails) return null;

        if (previousPOLoading) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                            <p className="text-gray-700 dark:text-gray-300">Loading previous purchase details...</p>
                        </div>
                    </div>
                </div>
            );
        }

        const currentItem = selectedPOData?.PODataList?.find(item => item.itemcode === showPreviousDetails);
        const currentPrice = parseFloat(editablePrices[showPreviousDetails] || currentItem?.NewBasicprice || 0);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <History className="w-5 h-5 mr-2 text-purple-600" />
                            Previous Purchase History - {showPreviousDetails}
                        </h3>
                        <button
                            onClick={() => setShowPreviousDetails(null)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Current Item Info */}
                    {currentItem && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg mb-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Current Purchase</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Item Name:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{currentItem.itemname}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Price:</span>
                                    <p className="font-bold text-green-600">₹{formatIndianCurrency(currentPrice)}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Standard Price:</span>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">₹{formatIndianCurrency(currentItem.basicprice)}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Quoted Price:</span>
                                    <p className="font-medium text-indigo-600">₹{formatIndianCurrency(currentItem.QuotedPrice)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Previous Purchase History */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Previous Purchases ({previousPODetails.length})</h4>

                        {previousPODetails.length === 0 ? (
                            <div className="text-center py-8">
                                <FileX className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No previous purchase history found for this item</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {previousPODetails.map((detail, index) => {
                                    const previousPrice = parseFloat(detail.BasicPrice || 0);
                                    const variation = calculatePriceVariation(currentPrice, previousPrice);

                                    return (
                                        <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                            <div className="grid grid-cols-5 gap-4">
                                                <div>
                                                    <span className="text-xs text-gray-500">Date</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">{detail.PODate}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Vendor</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">{detail.VendorName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">CC Code</span>
                                                    <p className="font-medium text-gray-900 dark:text-white">{detail.CCCode}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Previous Price</span>
                                                    <p className="font-bold text-gray-900 dark:text-white">₹{formatIndianCurrency(previousPrice)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Price Change</span>
                                                    <div className="flex items-center space-x-2">
                                                        {variation.trend === 'increase' && (
                                                            <span className="flex items-center text-red-600">
                                                                <ArrowUpCircle className="w-4 h-4 mr-1" />
                                                                +{variation.percentage}%
                                                            </span>
                                                        )}
                                                        {variation.trend === 'decrease' && (
                                                            <span className="flex items-center text-green-600">
                                                                <ArrowUpCircle className="w-4 h-4 mr-1 rotate-180" />
                                                                -{variation.percentage}%
                                                            </span>
                                                        )}
                                                        {variation.trend === 'same' && (
                                                            <span className="text-gray-500">No Change</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ✅ RENDER REMARKS HISTORY
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
                            console.log('🔄 Status List Retry with values:', {
                                MOID: selectedPOData?.MOID,
                                roleId,
                                ChkAmt: calculatePOTotalAmount(selectedPOData) || 0
                            });
                            if (selectedPOData?.MOID && roleId) {
                                dispatch(fetchStatusList({
                                    MOID: selectedPOData.MOID,
                                    ROID: roleId,
                                    ChkAmt: calculatePOTotalAmount(selectedPOData) || 0
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
                    <div className="text-gray-500 mb-2">No actions available for this PO</div>
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
                    {/* ✅ ENHANCED: Items verification status with price update info */}
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className={`flex items-center space-x-1 text-sm ${areAllItemsChecked() ? 'text-green-600' : 'text-orange-600'}`}>
                            <CheckCircle className={`w-4 h-4 ${areAllItemsChecked() ? 'text-green-600' : 'text-orange-600'}`} />
                            <span>Items Verified: {getCheckedItemsCount()}/{selectedPOData?.PODataList?.length || 0}</span>
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${verificationComment.trim() ? 'text-green-600' : 'text-orange-600'}`}>
                            <FileText className={`w-4 h-4 ${verificationComment.trim() ? 'text-green-600' : 'text-orange-600'}`} />
                            <span>Comments: {verificationComment.trim() ? 'Added' : 'Required'}</span>
                        </div>
                        {Object.keys(updatedStandardPrices).length > 0 && (
                            <div className="flex items-center space-x-1 text-sm text-indigo-600">
                                <RefreshCcw className="w-4 h-4" />
                                <span>Price Updates: {Object.keys(updatedStandardPrices).length}</span>
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
                                        !areAllItemsChecked() ? `Please verify all items (${getCheckedItemsCount()}/${selectedPOData?.PODataList?.length || 0} verified)` :
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
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {InboxTitle || 'Supplier PO Verification'}
                                </h1>
                                <p className="text-purple-100 mt-1">
                                    {ModuleDisplayName} • {verificationPOs.length} POs pending
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-4 py-2 bg-purple-500 text-purple-100 text-sm rounded-full border border-purple-400">
                            PO Verification
                        </div>
                        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full shadow-md">
                            {verificationPOs.length} Pending
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
                                placeholder="Search by vendor, PO, indent, CC code..."
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
                            value={filterCCType}
                            onChange={(e) => setFilterCCType(e.target.value)}
                            className="w-full px-3 py-2.5 bg-purple-500/50 text-white border border-purple-400 rounded-xl focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
                        >
                            <option value="All">All CC Types</option>
                            {ccTypes.map(ccType => (
                                <option key={ccType} value={ccType}>{ccType}</option>
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
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{verificationPOs.length}</p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">Total POs</p>
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
                                    {verificationPOs.filter(po => getPriority(po) === 'High').length}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">High Priority</p>
                            </div>
                        </div>
                        <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2 mt-3">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${verificationPOs.length > 0 ? (verificationPOs.filter(po => getPriority(po) === 'High').length / verificationPOs.length) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 border border-indigo-200 dark:border-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{vendors.length}</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400">Suppliers</p>
                            </div>
                        </div>
                        <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2 mt-3">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 border border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                    ₹{formatIndianCurrency(verificationPOs.reduce((sum, po) => sum + (calculatePOTotalAmount(po) || 0), 0))}
                                </p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">Total Amount</p>
                            </div>
                        </div>
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-3">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ ENHANCED: Main Content with Dynamic Grid Layout */}
            <div className={`grid gap-6 transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                ? 'grid-cols-1 lg:grid-cols-12'
                : 'grid-cols-1 lg:grid-cols-3'
                }`}>
                {/* ✅ ENHANCED: Collapsible Supplier POs List */}
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
                                {/* ✅ Collapsible Header */}
                                {(isLeftPanelCollapsed && !isLeftPanelHovered) ? (
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                                            <Clock className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-xs text-purple-600 dark:text-purple-400 font-bold transform -rotate-90 whitespace-nowrap">
                                            {filteredPOs.length}
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
                                            <span>Pending ({filteredPOs.length})</span>
                                        </h2>
                                        <div className="flex items-center space-x-2">
                                            {selectedPO && (
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
                                                    console.log('🔄 Refresh Button Clicked with values:', { roleId, uid, selectedRoleId });
                                                    dispatch(fetchVerificationSupplierPOs({ roleId: roleId || selectedRoleId, userId: uid, ccType: 'PCC' }));
                                                }}
                                                className="p-2 text-purple-600 hover:text-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
                                                title="Refresh"
                                                disabled={posLoading}
                                            >
                                                <RefreshCw className={`w-4 h-4 ${posLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ✅ PO List Content */}
                        <div className={`p-4 max-h-[calc(100vh-300px)] overflow-y-auto transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'w-16' : 'w-full'
                            }`}>
                            {posLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && <p className="text-gray-500">Loading...</p>}
                                </div>
                            ) : posError ? (
                                <div className="text-center py-8">
                                    <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && (
                                        <>
                                            <p className="text-red-500 mb-2">Error loading data</p>
                                            <button
                                                onClick={() => {
                                                    console.log('🔄 Retry Button Clicked with values:', { roleId, uid, selectedRoleId });
                                                    dispatch(fetchVerificationSupplierPOs({ roleId: roleId || selectedRoleId, userId: uid, ccType: 'PCC' }));
                                                }}
                                                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                Retry
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : filteredPOs.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                    {(!isLeftPanelCollapsed || isLeftPanelHovered) && <p className="text-gray-500">No POs found!</p>}
                                </div>
                            ) : (
                                <div className={`space-y-3 ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'flex flex-col items-center' : ''}`}>
                                    {filteredPOs.map((po) => {
                                        const priority = getPriority(po);
                                        const totalAmount = calculatePOTotalAmount(po);
                                        const amountDisplay = getAmountDisplay(totalAmount);

                                        return (
                                            <div
                                                key={po.PONo}
                                                className={`rounded-xl cursor-pointer transition-all hover:shadow-md border-2 ${selectedPO?.PONo === po.PONo
                                                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-lg'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 bg-white dark:bg-gray-800'
                                                    } ${isLeftPanelCollapsed && !isLeftPanelHovered ? 'w-12 h-12 p-1' : ''}`}
                                                onClick={() => handlePOSelect(po)}
                                                title={isLeftPanelCollapsed && !isLeftPanelHovered ? `${po.VendorName} - ${po.PONo}` : ''}
                                            >
                                                {(isLeftPanelCollapsed && !isLeftPanelHovered) ? (
                                                    <div className="w-full h-full rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                                        <ShoppingCart className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                ) : (
                                                    <div className="p-4">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className="relative">
                                                                <div className="w-12 h-12 rounded-full border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                                                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                                    {po.VendorName}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 truncate">{po.VendorCode}</p>
                                                            </div>
                                                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(priority)}`}>
                                                                {priority}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center space-x-1">
                                                                    <Hash className="w-3 h-3" />
                                                                    <span className="truncate">{po.PONo}</span>
                                                                </span>
                                                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{po.CCType}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-purple-600 dark:text-purple-400 font-medium">₹{amountDisplay.formatted}</span>
                                                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">{po.CCCode}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-500 text-xs">
                                                                    <ClipboardList className="w-3 h-3 inline mr-1" />
                                                                    Indent: {po.IndentNo?.slice(-6) || 'N/A'}
                                                                </span>
                                                                <span className="text-gray-500 text-xs">
                                                                    Ref: {po.RefNo || 'N/A'}
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

                {/* ✅ ENHANCED: PO Details Panel with Dynamic Width */}
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
                                <span>{selectedPO ? 'PO Verification' : 'Select a PO'}</span>
                            </h2>
                        </div>

                        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {selectedPO ? (
                                <div className="space-y-6">
                                    {poDataLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                            <p className="text-gray-500 dark:text-gray-400">Loading detailed information...</p>
                                        </div>
                                    ) : selectedPOData ? (
                                        <>
                                            {/* Enhanced PO Header with Addresses */}
                                            <div className="p-6 rounded-xl border-2 bg-gradient-to-r from-indigo-50 via-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center shadow-lg">
                                                                <ShoppingCart className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                                <CheckCircle className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                                                {selectedPOData.VendorName}
                                                            </h3>
                                                            <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                                                                PO: {selectedPOData.PONo}
                                                            </p>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="px-3 py-1 text-sm rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-opacity-20 dark:border-opacity-50">
                                                                    {selectedPOData.CCType || 'PO'}
                                                                </span>
                                                                <span className="px-3 py-1 text-sm rounded-full border bg-purple-100 text-purple-800 border-purple-200 dark:bg-opacity-20 dark:border-opacity-50">
                                                                    {selectedPOData.PaymentType || 'Direct'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                                                            ₹{formatIndianCurrency(calculatePOTotalAmount(selectedPOData))}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                            Status: {selectedPOData.Status || 'Pending'}
                                                        </p>
                                                        {Object.keys(editablePrices).length > 0 && (
                                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                                Total Savings: ₹{formatIndianCurrency(
                                                                    selectedPOData.PODataList?.reduce((total, item) => {
                                                                        const originalAmount = parseFloat(item.QuotedPrice || item.NewBasicprice) * parseFloat(item.quantity || 0);
                                                                        const newAmount = parseFloat(editablePrices[item.itemcode] || item.NewBasicprice) * parseFloat(item.quantity || 0);
                                                                        return total + (originalAmount - newAmount);
                                                                    }, 0) || 0
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Indent No</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPOData.IndentNo}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">PO Date</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPOData.PODate || 'N/A'}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Ref No</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPOData.RefNo}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Cost Center</span>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPOData.CCCode}</span>
                                                    </div>
                                                </div>

                                                {/* ✅ Delivery and Invoice Addresses */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                                    {/* Invoice Address */}
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                            <Receipt className="w-4 h-4 mr-2" />
                                                            Invoice Address
                                                        </h5>
                                                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                                            <p className="font-medium">{selectedPOData.InvAddress1}</p>
                                                            <p>{selectedPOData.InvAddress2}</p>
                                                            <p className="text-xs text-gray-500">GST: {selectedPOData.GstNo}</p>
                                                            <p className="text-xs text-gray-500">Mobile: {selectedPOData.MobileNo}</p>
                                                        </div>
                                                    </div>

                                                    {/* Delivery Address */}
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
                                                            <Truck className="w-4 h-4 mr-2" />
                                                            Delivery Address
                                                        </h5>
                                                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                                            <p className="font-medium">{selectedPOData.SiteAddress1}</p>
                                                            <p>{selectedPOData.SiteAddress2}</p>
                                                            <p className="text-xs text-gray-500">Contact: {selectedPOData.Contact}</p>
                                                            <p className="text-xs text-gray-500">Mobile: {selectedPOData.SiteMobileNo}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Vendor Information */}
                                            {selectedPOData.VendorAddress && (
                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border border-green-200 dark:border-green-700">
                                                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                                                        <Building className="w-5 h-5 mr-2" />
                                                        Vendor Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <span className="text-xs text-green-600 dark:text-green-400 block">Vendor Address</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{selectedPOData.VendorAddress}</span>
                                                        </div>
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <span className="text-xs text-green-600 dark:text-green-400 block">Vendor GST</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">{selectedPOData.VendorGST}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ✅ ENHANCED: Item Details with Checkboxes, Price Editing, and Price Update Indicators */}
                                            {selectedPOData.PODataList && selectedPOData.PODataList.length > 0 && (
                                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center">
                                                            <FileSpreadsheet className="w-5 h-5 mr-2" />
                                                            Item Details ({selectedPOData.PODataList.length} Items) - Verification Required
                                                        </h4>
                                                        {/* ✅ ENHANCED: Select All Checkbox with Price Update Warning */}
                                                        <div className="flex items-center space-x-4">
                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={areAllItemsChecked()}
                                                                    onChange={(e) => handleSelectAllItems(e.target.checked)}
                                                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                />
                                                                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                                                    Select All ({getCheckedItemsCount()}/{selectedPOData.PODataList.length})
                                                                </span>
                                                            </label>
                                                            {Object.keys(recentPriceChanges).length > 0 && (
                                                                <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/50 px-2 py-1 rounded-full">
                                                                    <AlertOctagon className="w-3 h-3" />
                                                                    <span>{Object.keys(recentPriceChanges).length} Recent Price Changes</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                                        {/* Enhanced Table Structure */}
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full">
                                                                {/* Table Header */}
                                                                <thead className="bg-purple-100 dark:bg-purple-900/30 border-b border-gray-200 dark:border-gray-600">
                                                                    <tr>
                                                                        <th className="w-16 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">
                                                                            Verify
                                                                        </th>
                                                                        <th className="w-80 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-left">
                                                                            Item Details
                                                                        </th>
                                                                        <th className="w-20 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">
                                                                            Qty
                                                                        </th>
                                                                        <th className="w-32 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">
                                                                            Standard Price
                                                                        </th>
                                                                        <th className="w-32 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">
                                                                            Quoted Price
                                                                        </th>
                                                                        <th className="w-36 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">
                                                                            New Price (Editable)
                                                                        </th>
                                                                        <th className="w-32 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">
                                                                            Basic Value
                                                                        </th>
                                                                        {/* ✅ NEW: Tax Amount Column */}
                                                                        <th className="w-32 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">
                                                                            Tax Amount
                                                                        </th>
                                                                        {/* ✅ NEW: Total Column */}
                                                                        <th className="w-32 p-3 text-xs font-semibold text-purple-800 dark:text-purple-200 text-center">
                                                                            Total Amount
                                                                        </th>
                                                                    </tr>
                                                                </thead>

                                                                {/* Table Body with Items */}
                                                                <tbody className="max-h-80 overflow-y-auto">
                                                                    {selectedPOData.PODataList.map((item, index) => {
                                                                        const currentEditablePrice = editablePrices[item.itemcode] || item.NewBasicprice;
                                                                        const quantity = parseFloat(item.quantity || 0);

                                                                        // ✅ UPDATED: Separate calculations for Basic Value, Tax Amount, and Total
                                                                        const basicValue = parseFloat(currentEditablePrice) * quantity;
                                                                        const cgstAmount = basicValue * (parseFloat(item.CGSTPercent || 0) / 100);
                                                                        const sgstAmount = basicValue * (parseFloat(item.SGSTPercent || 0) / 100);
                                                                        const igstAmount = basicValue * (parseFloat(item.IGSTPercent || 0) / 100);
                                                                        const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
                                                                        const totalAmount = basicValue + totalTaxAmount;

                                                                        const isChecked = checkedItems[item.itemcode] || false;
                                                                        const hasPriceDifference = checkPriceDifference(item);
                                                                        const hasRecentChange = hasRecentPriceChange(item.itemcode);
                                                                        const isStandardPriceUpdated = updatedStandardPrices[item.itemcode];

                                                                        return (
                                                                            <tr key={index} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isChecked ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600' :
                                                                                hasPriceDifference ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-600' :
                                                                                    hasRecentChange ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-600' : ''
                                                                                }`}>
                                                                                {/* ✅ ENHANCED: Checkbox Column with Price Difference Indicators */}
                                                                                <td className="p-3 text-center">
                                                                                    <div className="flex flex-col items-center space-y-2">
                                                                                        <label className="flex items-center justify-center cursor-pointer">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={isChecked}
                                                                                                onChange={(e) => handleItemCheck(item.itemcode, e.target.checked)}
                                                                                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                                                            />
                                                                                        </label>
                                                                                        {isChecked && (
                                                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                                                        )}
                                                                                        {hasPriceDifference && !isChecked && (
                                                                                            <AlertTriangle className="w-4 h-4 text-orange-600" title="Price difference detected" />
                                                                                        )}
                                                                                        {hasRecentChange && (
                                                                                            <TrendingDown className="w-4 h-4 text-indigo-600" title="Recent price change detected" />
                                                                                        )}
                                                                                        {isStandardPriceUpdated && (
                                                                                            <RefreshCcw className="w-4 h-4 text-purple-600" title="Standard price updated" />
                                                                                        )}
                                                                                    </div>
                                                                                </td>

                                                                                {/* Item Details with Click Handler */}
                                                                                <td className="p-3">
                                                                                    <div className="flex items-start space-x-3">
                                                                                        <button
                                                                                            onClick={() => handleItemCodeClick(item.itemcode)}
                                                                                            className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors group mt-1"
                                                                                            title="View previous purchase history"
                                                                                        >
                                                                                            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                                                                                        </button>
                                                                                        <div className="min-w-0 flex-1">
                                                                                            {/* ✅ Item Name with Tooltip */}
                                                                                            <div className="relative group">
                                                                                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1">
                                                                                                    {item.itemname}
                                                                                                    {/* ✅ NEW: Price Status Indicators */}
                                                                                                    {hasPriceDifference && (
                                                                                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                                                                                                            <DollarSign className="w-3 h-3 mr-1" />
                                                                                                            Price Diff
                                                                                                        </span>
                                                                                                    )}
                                                                                                    {hasRecentChange && (
                                                                                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                                                                                            <TrendingDown className="w-3 h-3 mr-1" />
                                                                                                            Recent Change
                                                                                                        </span>
                                                                                                    )}
                                                                                                    {isStandardPriceUpdated && (
                                                                                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                                                                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                                                                            Updated
                                                                                                        </span>
                                                                                                    )}
                                                                                                </p>
                                                                                                {/* Smart positioned tooltip */}
                                                                                                <div className={`absolute left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap max-w-xs ${index === 0
                                                                                                    ? 'top-full mt-2'
                                                                                                    : 'bottom-full mb-2'
                                                                                                    }`}>
                                                                                                    <div className="break-words whitespace-normal">{item.itemname}</div>
                                                                                                    {hasPriceDifference && (
                                                                                                        <div className="text-xs text-orange-300 mt-1">
                                                                                                            Standard: ₹{formatIndianCurrency(item.basicprice)} | Purchase: ₹{formatIndianCurrency(item.NewBasicprice)}
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {hasRecentChange && (
                                                                                                        <div className="text-xs text-indigo-300 mt-1">
                                                                                                            Recent price change: ₹{formatIndianCurrency(recentPriceChanges[item.itemcode]?.itemNewPrice)}
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {/* Arrow pointer */}
                                                                                                    <div className={`absolute left-4 w-0 h-0 border-l-4 border-r-4 border-transparent ${index === 0
                                                                                                        ? 'bottom-full border-b-4 border-b-gray-900'
                                                                                                        : 'top-full border-t-4 border-t-gray-900'
                                                                                                        }`}></div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={() => handleItemCodeClick(item.itemcode)}
                                                                                                className="text-xs text-purple-600 dark:text-purple-400 font-mono hover:underline cursor-pointer block mb-1"
                                                                                            >
                                                                                                {item.itemcode}
                                                                                            </button>
                                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">HSN: {item.HSNCode}</p>
                                                                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">{item.specification}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>

                                                                                {/* Quantity */}
                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className="font-bold text-purple-700 dark:text-purple-300 text-lg">{item.quantity}</p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.units}</p>
                                                                                    </div>
                                                                                </td>

                                                                                {/* ✅ ENHANCED: Standard Price with Update Status */}
                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className={`font-medium ${isStandardPriceUpdated ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                                            ₹{formatIndianCurrency(isStandardPriceUpdated ? updatedStandardPrices[item.itemcode].newBasicPrice : item.basicprice)}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                            {isStandardPriceUpdated ? 'Updated' : 'Standard'}
                                                                                        </p>
                                                                                        {isStandardPriceUpdated && (
                                                                                            <p className="text-xs text-purple-600 dark:text-purple-400">
                                                                                                Was: ₹{formatIndianCurrency(updatedStandardPrices[item.itemcode].oldBasicPrice)}
                                                                                            </p>
                                                                                        )}
                                                                                        {hasRecentChange && (
                                                                                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                                                                                Latest: ₹{formatIndianCurrency(recentPriceChanges[item.itemcode]?.itemNewPrice)}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </td>

                                                                                {/* Quoted Price */}
                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className="font-medium text-indigo-600 dark:text-indigo-400">₹{formatIndianCurrency(item.QuotedPrice)}</p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Quoted</p>
                                                                                        {hasPriceDifference && (
                                                                                            <p className="text-xs text-orange-600 dark:text-orange-400">
                                                                                                Diff: ₹{formatIndianCurrency(Math.abs(parseFloat(item.QuotedPrice) - parseFloat(item.basicprice)))}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </td>

                                                                                {/* ✅ ENHANCED: Editable New Price with Enhanced Status Indicators */}
                                                                                <td className="p-3 text-center">
                                                                                    <div className="space-y-2">
                                                                                        <div className="flex items-center justify-center space-x-1">
                                                                                            <span className="text-xs">₹</span>
                                                                                            <input
                                                                                                type="number"
                                                                                                value={currentEditablePrice}
                                                                                                onChange={(e) => handlePriceEdit(item.itemcode, e.target.value, item.QuotedPrice)}
                                                                                                disabled={isChecked}
                                                                                                className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center transition-all ${isChecked
                                                                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60'
                                                                                                    : getPriceColorClass(currentEditablePrice, item.basicprice)
                                                                                                    }`}
                                                                                                step="0.01"
                                                                                                min="0"
                                                                                                max={item.QuotedPrice}
                                                                                                title={
                                                                                                    isChecked
                                                                                                        ? 'Price locked after verification'
                                                                                                        : `Current: ₹${formatIndianCurrency(currentEditablePrice)} | Standard: ₹${formatIndianCurrency(item.basicprice)} | ${parseFloat(currentEditablePrice) > parseFloat(item.basicprice) ? 'Above Standard (Red)' : parseFloat(currentEditablePrice) < parseFloat(item.basicprice) ? 'Below Standard (Green)' : 'Equal to Standard'}`
                                                                                                }
                                                                                            />
                                                                                            {isChecked ? (
                                                                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                                                                            ) : (
                                                                                                <Edit3 className="w-3 h-3 text-gray-400" />
                                                                                            )}
                                                                                        </div>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                            {isChecked ? 'Verified' : 'Editable'}
                                                                                        </p>
                                                                                        {parseFloat(currentEditablePrice) < parseFloat(item.QuotedPrice) && (
                                                                                            <p className="text-xs text-green-600">
                                                                                                Saved: ₹{formatIndianCurrency((item.QuotedPrice - currentEditablePrice) * item.quantity)}
                                                                                            </p>
                                                                                        )}
                                                                                        {/* ✅ ENHANCED: Price Status Indicator */}
                                                                                        <div className="text-xs">
                                                                                            {parseFloat(currentEditablePrice) > parseFloat(item.basicprice) && (
                                                                                                <span className="text-red-600 dark:text-red-400">Above Standard</span>
                                                                                            )}
                                                                                            {parseFloat(currentEditablePrice) < parseFloat(item.basicprice) && (
                                                                                                <span className="text-green-600 dark:text-green-400">Below Standard</span>
                                                                                            )}
                                                                                            {parseFloat(currentEditablePrice) === parseFloat(item.basicprice) && (
                                                                                                <span className="text-gray-600 dark:text-gray-400">Standard Price</span>
                                                                                            )}
                                                                                        </div>
                                                                                        {hasPriceDifference && !isChecked && (
                                                                                            <div className="text-xs text-orange-600 dark:text-orange-400">
                                                                                                ⚠️ Price update required
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">
                                                                                            ₹{formatIndianCurrency(basicValue)}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                            {quantity} × ₹{formatIndianCurrency(currentEditablePrice)}
                                                                                        </p>
                                                                                        {parseFloat(currentEditablePrice) < parseFloat(item.QuotedPrice) && (
                                                                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                                                                Saved: ₹{formatIndianCurrency((item.QuotedPrice - currentEditablePrice) * quantity)}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </td>

                                                                                {/* Amount & GST */}
                                                                                <td className="p-3 text-center">
                                                                                    <div className="space-y-2">
                                                                                        <p className="font-bold text-orange-700 dark:text-orange-300">
                                                                                            ₹{formatIndianCurrency(totalTaxAmount)}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total GST</p>

                                                                                        {/* GST Breakdown */}
                                                                                        <div className="space-y-1 text-xs">
                                                                                            {parseFloat(item.CGSTPercent || 0) > 0 && (
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-500">CGST {item.CGSTPercent}%:</span>
                                                                                                    <span className="text-orange-600">₹{formatIndianCurrency(cgstAmount)}</span>
                                                                                                </div>
                                                                                            )}
                                                                                            {parseFloat(item.SGSTPercent || 0) > 0 && (
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-500">SGST {item.SGSTPercent}%:</span>
                                                                                                    <span className="text-orange-600">₹{formatIndianCurrency(sgstAmount)}</span>
                                                                                                </div>
                                                                                            )}
                                                                                            {parseFloat(item.IGSTPercent || 0) > 0 && (
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-500">IGST {item.IGSTPercent}%:</span>
                                                                                                    <span className="text-orange-600">₹{formatIndianCurrency(igstAmount)}</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="p-3 text-center">
                                                                                    <div>
                                                                                        <p className="font-bold text-green-700 dark:text-green-300 text-xl">
                                                                                            ₹{formatIndianCurrency(totalAmount)}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Final Amount</p>
                                                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                                            <div>Basic: ₹{formatIndianCurrency(basicValue)}</div>
                                                                                            <div>Tax: ₹{formatIndianCurrency(totalTaxAmount)}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {/* ✅ ENHANCED: Summary Footer with Price Update Information */}
                                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-4 border-t border-gray-200 dark:border-gray-600">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {/* Left side - Item verification status */}
                                                                <div className="space-y-2">
                                                                    <span className="font-semibold text-purple-800 dark:text-purple-200">
                                                                        Total Items ({selectedPOData.PODataList.length} items):
                                                                    </span>
                                                                    <div className="flex items-center space-x-4 flex-wrap">
                                                                        <div className={`flex items-center space-x-1 text-sm ${areAllItemsChecked() ? 'text-green-600' : 'text-orange-600'}`}>
                                                                            <CheckSquare className="w-4 h-4" />
                                                                            <span>Verified: {getCheckedItemsCount()}/{selectedPOData.PODataList.length}</span>
                                                                        </div>
                                                                        {Object.keys(editablePrices).length > 0 && (
                                                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                                                Total Savings: ₹{formatIndianCurrency(
                                                                                    selectedPOData.PODataList.reduce((total, item) => {
                                                                                        const originalPrice = parseFloat(item.QuotedPrice) * parseFloat(item.quantity || 0);
                                                                                        const newPrice = parseFloat(editablePrices[item.itemcode] || item.QuotedPrice) * parseFloat(item.quantity || 0);
                                                                                        return total + (originalPrice - newPrice);
                                                                                    }, 0)
                                                                                )}
                                                                            </p>
                                                                        )}
                                                                        {Object.keys(updatedStandardPrices).length > 0 && (
                                                                            <p className="text-sm text-purple-600 dark:text-purple-400">
                                                                                Price Updates: {Object.keys(updatedStandardPrices).length}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* ✅ NEW: Right side - Amount breakdown */}
                                                                <div className="space-y-2">
                                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                                                        <div className="grid grid-cols-3 gap-4 text-center">
                                                                            {/* Basic Amount Total */}
                                                                            <div className="space-y-1">
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Basic Amount</p>
                                                                                <p className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">
                                                                                    ₹{formatIndianCurrency(
                                                                                        selectedPOData.PODataList.reduce((total, item) => {
                                                                                            const currentPrice = editablePrices[item.itemcode] || item.NewBasicprice;
                                                                                            return total + (parseFloat(currentPrice) * parseFloat(item.quantity || 0));
                                                                                        }, 0)
                                                                                    )}
                                                                                </p>
                                                                            </div>

                                                                            {/* Tax Amount Total */}
                                                                            <div className="space-y-1">
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Tax Amount</p>
                                                                                <p className="font-bold text-orange-700 dark:text-orange-300 text-lg">
                                                                                    ₹{formatIndianCurrency(
                                                                                        selectedPOData.PODataList.reduce((total, item) => {
                                                                                            const currentPrice = editablePrices[item.itemcode] || item.NewBasicprice;
                                                                                            const basicValue = parseFloat(currentPrice) * parseFloat(item.quantity || 0);
                                                                                            const cgst = basicValue * (parseFloat(item.CGSTPercent || 0) / 100);
                                                                                            const sgst = basicValue * (parseFloat(item.SGSTPercent || 0) / 100);
                                                                                            const igst = basicValue * (parseFloat(item.IGSTPercent || 0) / 100);
                                                                                            return total + cgst + sgst + igst;
                                                                                        }, 0)
                                                                                    )}
                                                                                </p>
                                                                            </div>

                                                                            {/* Grand Total */}
                                                                            <div className="space-y-1">
                                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Grand Total</p>
                                                                                <p className="font-bold text-green-700 dark:text-green-300 text-xl">
                                                                                    ₹{formatIndianCurrency(calculatePOTotalAmount(selectedPOData))}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Additional breakdown row */}
                                                                        <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
                                                                            <div className="flex justify-between items-center text-sm">
                                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                                    PO Total: Basic + Tax = Grand Total
                                                                                </span>
                                                                                <span className="font-semibold text-purple-700 dark:text-purple-300">
                                                                                    {selectedPOData.PODataList.length} Items Verified
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* PO Terms & Remarks */}
                                            {selectedPOData.Remarks && (
                                                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
                                                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center">
                                                        <Clipboard className="w-5 h-5 mr-2" />
                                                        PO Terms & Conditions
                                                    </h4>
                                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {selectedPOData.Remarks.split('|').map((term, index) => (
                                                                <div key={index} className="flex items-start space-x-2">
                                                                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                                                    <span>{term.trim()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ✅ Approval History Toggle */}
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
                                                    Please verify all PO details, item quantities, prices, terms & conditions, and vendor information.
                                                </p>
                                                <textarea
                                                    value={verificationComment}
                                                    onChange={(e) => setVerificationComment(e.target.value)}
                                                    className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 transition-all ${verificationComment.trim() === ''
                                                        ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                                        : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                                                        }`}
                                                    rows="4"
                                                    placeholder="Please verify PO amount, item details, quantities, prices, terms & conditions, delivery requirements..."
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
                                            <p className="text-gray-500 dark:text-gray-400">Loading PO details...</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No PO Selected</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Select a supplier PO from the list to view details and take action.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ NEW: Price Update Confirmation Modal */}
            {renderPriceUpdateModal()}

            {/* ✅ Previous Purchase Details Popup */}
            {showPreviousDetails && renderPreviousDetailsPopup()}
        </div>
    );
};

export default VerifySupplierPO;