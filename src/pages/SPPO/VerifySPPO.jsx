// VerifySPPO.jsx - Service Provider Purchase Order Verification
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Briefcase, Building, Calendar, FileText,
    CheckCircle, XCircle, Clock, AlertCircle,
    Hash, Target, Layers, Edit3, Clipboard,
    CheckSquare, Settings, Award, Loader2,
} from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

// SPPO SLICE IMPORTS
import {
    fetchVerificationSPPOs,
    fetchSPPOByNoForVerify,
    approveSPPO,
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
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
} from '../../slices/CommonSlice/getStatusSlice';

// AMOUNT HELPER
import { formatIndianCurrency, getAmountDisplay } from '../../utilities/amountToTextHelper';

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
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);

    // FIXED SERVICE DATA FUNCTION
    const getServiceData = () => {
        if (!selectedSPPOData) return [];
        if (selectedSPPOData.ItemDescList && Array.isArray(selectedSPPOData.ItemDescList) && selectedSPPOData.ItemDescList.length > 0) {
            return selectedSPPOData.ItemDescList;
        }
        if (selectedSPPOData.Data?.ItemDescList && Array.isArray(selectedSPPOData.Data.ItemDescList)) {
            return selectedSPPOData.Data.ItemDescList;
        }
        if (Array.isArray(selectedSPPOData)) {
            return selectedSPPOData;
        }
        return [];
    };

    const serviceData = useMemo(() => getServiceData(), [selectedSPPOData]);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId && uid && roleId !== selectedRoleId) {
            dispatch(setSelectedRoleId(roleId));
            dispatch(setSelectedUserId(uid));
            dispatch(fetchVerificationSPPOs({ roleId: roleId, userId: uid }));
        }
    }, [roleId, uid, selectedRoleId, dispatch, userData]);

    useEffect(() => {
        if (selectedSPPOData?.MOID && roleId) {
            dispatch(fetchStatusList({
                MOID: selectedSPPOData.MOID,
                ROID: roleId,
                ChkAmt: calculateSPPOTotalAmount(selectedSPPOData) || 0
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSPPOData?.MOID, roleId, dispatch]);

    useEffect(() => {
        if (selectedSPPO?.SPPONo && selectedSPPOData?.MOID) {
            dispatch(setSelectedTrno(selectedSPPO.SPPONo));
            dispatch(setSelectedMOID(selectedSPPOData.MOID));
            dispatch(fetchRemarks({ trno: selectedSPPO.SPPONo, moid: selectedSPPOData.MOID }));
        }
    }, [selectedSPPO?.SPPONo, selectedSPPOData?.MOID, dispatch]);

    useEffect(() => {
        if (selectedSPPO) setIsLeftPanelCollapsed(true);
    }, [selectedSPPO]);

    useEffect(() => {
        const data = getServiceData();
        if (data && data.length > 0) {
            const initialCheckedState = {};
            data.forEach((_item, index) => { initialCheckedState[index] = false; });
            setCheckedItems(initialCheckedState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSPPOData]);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const getCurrentUser = () => userData?.userName || userDetails?.userName || 'system';

    const getCurrentRoleName = () =>
        userDetails?.roleName || userData?.roleName ||
        notificationData?.InboxTitle || notificationData?.ModuleDisplayName || 'SPPO Verifier';

    const formatApprovalComment = (roleName, userName, comment) => `${roleName} : ${userName} : ${comment}`;

    const updateRemarksHistory = (existingRemarks, newRoleName, newUserName, newComment) => {
        const formattedNewComment = formatApprovalComment(newRoleName, newUserName, newComment);
        if (!existingRemarks || existingRemarks.trim() === '') return formattedNewComment;
        return `${existingRemarks.trim()}||${formattedNewComment}`;
    };

    function calculateSPPOTotalAmount(sppoData) {
        const data = getServiceData();
        if (!data || !Array.isArray(data) || data.length === 0) return sppoData?.TotalValue || 0;
        return data.reduce((total, item, index) => {
            const rate = parseFloat(editableRates[index] || item.Rate || 0);
            const quantity = parseFloat(item.Quantity || 0);
            return total + (rate * quantity);
        }, 0);
    }

    const getRateColorClass = (newRate, prwRate) => {
        const numericNewRate = parseFloat(newRate);
        const numericPRWRate = parseFloat(prwRate);
        if (numericNewRate > numericPRWRate) return 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-300';
        if (numericNewRate < numericPRWRate) return 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300';
        return 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200';
    };

    const getPriority = (sppo) => {
        if (!sppo) return 'Low';
        const totalAmount = sppo.TotalValue || 0;
        if (totalAmount > 50000) return 'High';
        if (totalAmount > 25000) return 'Medium';
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

    const handleRateEdit = (itemIndex, newRate, originalRate) => {
        const numericNewRate = parseFloat(newRate);
        const numericOriginalRate = parseFloat(originalRate);
        if (numericNewRate > numericOriginalRate) { toast.error('Rate can only be reduced, not increased!'); return; }
        if (numericNewRate < 0) { toast.error('Rate cannot be negative!'); return; }
        setEditableRates(prev => ({ ...prev, [itemIndex]: numericNewRate }));
    };

    const handleItemCheck = (itemIndex, checked) => {
        setCheckedItems(prev => ({ ...prev, [itemIndex]: checked }));
    };

    const handleSelectAllItems = (checked) => {
        const data = getServiceData();
        if (data && data.length > 0) {
            const newCheckedState = {};
            data.forEach((_item, index) => { newCheckedState[index] = checked; });
            setCheckedItems(newCheckedState);
        }
    };

    const areAllItemsChecked = () => {
        const data = getServiceData();
        if (!data || data.length === 0) return false;
        return data.every((_item, index) => checkedItems[index]);
    };

    const getCheckedItemsCount = () => Object.values(checkedItems).filter(Boolean).length;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleRefresh = () => {
        dispatch(fetchVerificationSPPOs({ roleId: roleId || selectedRoleId, userId: uid }));
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

        setEditableRates({});
        setCheckedItems({});
        setShowRemarksHistory(false);
        setVerificationComment('');
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

        return {
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
    };

    const handleActionClick = async (action) => {
        if (!selectedSPPO) { toast.error('No SPPO selected'); return; }
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
            const typeToValueMap = { approve: 'Approve', verify: 'Verify', reject: 'Reject' };
            actionValue = typeToValueMap[action.type.toLowerCase()] || action.type;
        }

        try {
            const payload = buildSPPOApprovalPayload(actionValue, selectedSPPO, selectedSPPOData, verificationComment);
            const result = await dispatch(approveSPPO(payload)).unwrap();

            if (result && typeof result === 'string' && result.includes('$')) {
                const [, additionalInfo] = result.split('$');
                toast.success(`${action.text} completed successfully!`);
                if (additionalInfo) setTimeout(() => toast.info(additionalInfo, { autoClose: 6000 }), 500);
            } else {
                toast.success(`${action.text} completed successfully!`);
            }

            setTimeout(() => {
                dispatch(fetchVerificationSPPOs({ roleId: roleId || selectedRoleId, userId: uid }));
                setSelectedSPPO(null);
                setVerificationComment('');
                setEditableRates({});
                setCheckedItems({});
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetSPPOData());
                dispatch(resetApprovalData());
            }, 1000);
        } catch (error) {
            let errorMessage = `Failed to ${action.text.toLowerCase()}`;
            if (error && typeof error === 'string') errorMessage = error;
            else if (error?.message) errorMessage = error.message;
            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────

    const filteredSPPOs = verificationSPPOs.filter(sppo => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = sppo.VendorName?.toLowerCase().includes(q) ||
            sppo.SPPONo?.toLowerCase().includes(q) ||
            sppo.CCCode?.toLowerCase().includes(q) ||
            sppo.VendorCode?.toLowerCase().includes(q);
        const matchesVendor = filterVendor === 'All' || sppo.VendorName === filterVendor;
        const matchesCCCode = filterCCCode === 'All' || sppo.CCCode === filterCCCode;
        return matchesSearch && matchesVendor && matchesCCCode;
    });

    const vendors = [...new Set(verificationSPPOs.map(sppo => sppo.VendorName).filter(Boolean))];
    const ccCodes = [...new Set(verificationSPPOs.map(sppo => sppo.CCCode).filter(Boolean))];

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderItemCard = (sppo) => {
        const priority = getPriority(sppo);
        const amountDisplay = getAmountDisplay(sppo.TotalValue || 0);
        return (
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{sppo.VendorName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sppo.SPPONo}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(priority)}`}>{priority}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Hash className="w-3 h-3" /> {sppo.CCCode}
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{amountDisplay.formatted}</span>
                </div>
            </div>
        );
    };

    const renderListItem = (sppo) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[160px]">{sppo.VendorName}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[110px]">{sppo.SPPONo}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[90px]">{sppo.CCCode}</span>
            <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">₹{formatIndianCurrency(sppo.TotalValue || 0)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail panel ──────────────────────────────────────────────────────────

    const DetailField = ({ label, value }) => value ? (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
    ) : null;

    const renderDetailContent = () => {
        if (!selectedSPPO) return null;

        if (sppoDataLoading || !selectedSPPOData) {
            return (
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700 dark:text-blue-400">Loading SPPO details...</span>
                </div>
            );
        }

        const d = selectedSPPOData;

        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                                <Briefcase className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{d.VendorName}</h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">SPPO: {d.SPPONo}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        Service Provider
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(d.Status)}`}>
                                        Status: {d.Status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">₹{formatIndianCurrency(calculateSPPOTotalAmount(d))}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Balance: ₹{formatIndianCurrency(d.Balance)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                        <DetailField label="SPPO ID" value={d.SPPOId} />
                        <DetailField label="Start Date" value={d.SPPOStartDate || 'N/A'} />
                        <DetailField label="End Date" value={d.SPPOEndDate || 'N/A'} />
                        <DetailField label="Cost Center" value={d.CCCode} />
                    </div>
                </div>

                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide mb-1.5 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5" /> Cost Center
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{d.CCName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide mb-1.5 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" /> DCA
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{d.DCAName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide mb-1.5 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5" /> Sub DCA
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{d.SubDCAName}</p>
                        </div>
                    </div>
                </div>

                {serviceData && serviceData.length > 0 ? (
                    <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 p-4">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                                <Settings className="w-3.5 h-3.5" /> Service Details ({serviceData.length}) — Verification Required
                            </p>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={areAllItemsChecked()}
                                    onChange={(e) => handleSelectAllItems(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                    Select All ({getCheckedItemsCount()}/{serviceData.length})
                                </span>
                            </label>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-indigo-100/60 dark:bg-indigo-900/20">
                                        <th className="w-16 p-3 font-bold text-indigo-700 dark:text-indigo-300 uppercase text-center">Verify</th>
                                        <th className="p-3 font-bold text-indigo-700 dark:text-indigo-300 uppercase text-left">Service Description</th>
                                        <th className="w-16 p-3 font-bold text-indigo-700 dark:text-indigo-300 uppercase text-center">Unit</th>
                                        <th className="w-20 p-3 font-bold text-indigo-700 dark:text-indigo-300 uppercase text-center">Qty</th>
                                        <th className="w-32 p-3 font-bold text-indigo-700 dark:text-indigo-300 uppercase text-center">Rate (Editable)</th>
                                        <th className="w-24 p-3 font-bold text-indigo-700 dark:text-indigo-300 uppercase text-center">Client Rate</th>
                                        <th className="w-24 p-3 font-bold text-indigo-700 dark:text-indigo-300 uppercase text-center">PRW Rate</th>
                                        <th className="w-28 p-3 font-bold text-indigo-700 dark:text-indigo-300 uppercase text-center">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceData.map((service, index) => {
                                        const currentEditableRate = editableRates[index] || service.Rate;
                                        const quantity = parseFloat(service.Quantity || 0);
                                        const amount = parseFloat(currentEditableRate) * quantity;
                                        const isChecked = checkedItems[index] || false;

                                        return (
                                            <tr key={index} className={`border-t border-indigo-100 dark:border-indigo-900/30 ${isChecked ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                                                <td className="p-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => handleItemCheck(index, e.target.checked)}
                                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{service.Description}</p>
                                                    <p className="text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">Service ID: {service.SPPOItemId}</p>
                                                </td>
                                                <td className="p-3 text-center text-gray-600 dark:text-gray-400 font-medium">{service.Unit}</td>
                                                <td className="p-3 text-center font-bold text-indigo-700 dark:text-indigo-300">{service.Quantity}</td>
                                                <td className="p-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span>₹</span>
                                                        <input
                                                            type="number"
                                                            value={currentEditableRate}
                                                            onChange={(e) => handleRateEdit(index, e.target.value, service.Rate)}
                                                            disabled={isChecked}
                                                            className={`w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center transition-all ${isChecked ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : getRateColorClass(currentEditableRate, service.PRWRate)}`}
                                                            step="0.01"
                                                            min="0"
                                                            max={service.Rate}
                                                            title={isChecked ? 'Rate locked after verification' : `Current Rate: ₹${formatIndianCurrency(currentEditableRate)} vs PRW Rate: ₹${formatIndianCurrency(service.PRWRate)}`}
                                                        />
                                                        {isChecked ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Edit3 className="w-3 h-3 text-gray-400" />}
                                                    </div>
                                                    {parseFloat(currentEditableRate) !== parseFloat(service.Rate) && (
                                                        <p className="text-indigo-600 dark:text-indigo-400 mt-1">Modified: ₹{formatIndianCurrency(Math.abs(currentEditableRate - service.Rate))}</p>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <p className="font-medium text-indigo-600 dark:text-indigo-400">₹{formatIndianCurrency(service.ClientRate)}</p>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <p className="font-medium text-orange-600 dark:text-orange-400">₹{formatIndianCurrency(service.PRWRate)}</p>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <p className="font-bold text-green-700 dark:text-green-300">₹{formatIndianCurrency(amount)}</p>
                                                    <p className="text-gray-500 dark:text-gray-400">{quantity} × ₹{formatIndianCurrency(currentEditableRate)}</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                            <div className={`flex items-center gap-1.5 text-xs font-semibold ${areAllItemsChecked() ? 'text-green-600' : 'text-orange-600'}`}>
                                <CheckSquare className="w-4 h-4" />
                                <span>Verified: {getCheckedItemsCount()}/{serviceData.length}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Total SPPO Amount</p>
                                <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">₹{formatIndianCurrency(calculateSPPOTotalAmount(d))}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-6 text-center">
                        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">This SPPO doesn't have any service items to display.</p>
                    </div>
                )}

                {d.Remarks && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Clipboard className="w-3.5 h-3.5" /> SPPO Terms &amp; Conditions
                        </p>
                        <div className="space-y-1.5">
                            {d.Remarks.split('|').map((term, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span>{term.trim()}</span>
                                </div>
                            ))}
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
                    isVerified={areAllItemsChecked()}
                    onVerifiedChange={() => handleSelectAllItems(!areAllItemsChecked())}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: `✓ All services verified (${getCheckedItemsCount()}/${serviceData.length || 0})`,
                        checkboxDescription: 'Verify each service row individually above, or toggle all at once here.',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify SPPO amount, service details, quantities, rates, terms & conditions, delivery requirements...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        commentBorder: 'border-indigo-200 dark:border-indigo-700',
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-700 text-center text-sm text-red-600 dark:text-red-400">
                        Error loading actions: {statusError}
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700 text-center text-sm text-yellow-700 dark:text-yellow-400">
                        No actions available for this SPPO
                    </div>
                ) : (
                    <ActionButtons
                        actions={enabledActions}
                        onActionClick={handleActionClick}
                        loading={approvalLoading}
                        isVerified={areAllItemsChecked()}
                        comment={verificationComment}
                        showValidation={true}
                        excludeActions={['return', 'send back']}
                    />
                )}
            </div>
        );
    };

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'SPPO Verification'} (${verificationSPPOs.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verificationSPPOs.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Briefcase}
                badgeText="Service Provider PO"
                badgeCount={verificationSPPOs.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by vendor, SPPO, CC code...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                filters={[
                    {
                        value: filterVendor,
                        onChange: (e) => setFilterVendor(e.target.value),
                        defaultValue: 'All',
                        defaultLabel: 'All Vendors',
                        options: vendors.map((v) => ({ value: v, label: v })),
                    },
                    {
                        value: filterCCCode,
                        onChange: (e) => setFilterCCCode(e.target.value),
                        defaultValue: 'All',
                        defaultLabel: 'All Cost Centers',
                        options: ccCodes.map((c) => ({ value: c, label: c })),
                    },
                ]}
                enableViewToggle
            />

            <InboxSplitLayout
                isLeftPanelCollapsed={isLeftPanelCollapsed}
                onLeftPanelCollapseToggle={setIsLeftPanelCollapsed}
                isLeftPanelHovered={isLeftPanelHovered}
                onLeftPanelHoverChange={setIsLeftPanelHovered}
                left={{
                    items: filteredSPPOs,
                    selectedItem: selectedSPPO,
                    onItemSelect: handleSPPOSelect,
                    renderItem: renderItemCard,
                    renderListItem: renderListItem,
                    renderCollapsedItem: renderCollapsedItem,
                    loading: spposLoading,
                    error: spposError,
                    onRefresh: handleRefresh,
                    config: {
                        title: 'Pending Verification',
                        icon: Clock,
                        emptyMessage: 'No SPPOs found!',
                        itemKey: 'SPPONo',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'SPPO Verification',
                        icon: Briefcase,
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                }}
                right={{
                    selectedItem: selectedSPPO,
                    loading: sppoDataLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'SPPO Details',
                        icon: Briefcase,
                        selectedTitle: 'SPPO Verification',
                        emptyTitle: 'No SPPO Selected',
                        emptyMessage: 'Select a Service Provider Purchase Order from the list to view details and take action.',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        maxHeight: 'calc(100vh - 200px)',
                        sticky: true,
                        stickyTop: '1.5rem',
                    },
                }}
            />
        </div>
    );
};

export default VerifySPPO;
