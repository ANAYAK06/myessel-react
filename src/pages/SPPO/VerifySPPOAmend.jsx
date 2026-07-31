import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, IndianRupee, Calendar,
    User, Package, Pencil, DollarSign, Plus, Minus,
    TrendingUp, TrendingDown, Loader2,
} from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import AttachmentModal   from '../../components/Inbox/AttachmentModal';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
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
    selectVerificationSPPOAmendError,
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

    const poUploadedDocs = useSelector(selectPOUploadedDocs);

    const approvalLoading = useSelector(selectApproveSPPOAmendLoading);

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

    const getCurrentUser = () => userData?.userName || userDetails?.userName || 'system';

    const getCurrentRoleName = () =>
        userDetails?.roleName || userData?.roleName ||
        notificationData?.InboxTitle || notificationData?.ModuleDisplayName || 'SPPO Amendment Verifier';

    const formatApprovalComment = (roleName, userName, comment) => `${roleName} : ${userName} : ${comment}`;

    const updateRemarksHistory = (existingRemarks, newRoleName, newUserName, newComment) => {
        const formattedNewComment = formatApprovalComment(newRoleName, newUserName, newComment);
        if (!existingRemarks || existingRemarks.trim() === '') return formattedNewComment;
        return `${existingRemarks.trim()}||${formattedNewComment}`;
    };

    const handleViewAttachment = (filePath) => {
        if (!filePath) {
            toast.error('No attachment available');
            return;
        }
        const fullUrl = buildS3Url(S3_FOLDERS.SPPO_AMENDMENTS, filePath);
        setAttachmentUrl(fullUrl);
        setShowAttachmentModal(true);
    };

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId && uid) {
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

    useEffect(() => {
        if (selectedItem?.AmendId) {
            dispatch(setSelectedAmendId(selectedItem.AmendId));
            dispatch(setSelectedPONo(selectedItem.SPPONo));
            dispatch(fetchSPPOAmendById({ roleId, amendId: selectedItem.AmendId, userId: uid }));

            if (selectedItem.SPPONo) {
                dispatch(fetchPOUploadedDocs({ poNo: selectedItem.SPPONo, forType: 'Amendment' }));
            }

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, roleId, uid, dispatch]);

    useEffect(() => {
        if (selectedItem && roleId && sppoAmendData?.MOID) {
            dispatch(fetchStatusList({
                MOID: sppoAmendData.MOID,
                ROID: roleId,
                ChkAmt: sppoAmendData?.AmendAmount || 0
            }));
        }
    }, [selectedItem, roleId, sppoAmendData, dispatch]);

    useEffect(() => {
        if (selectedItem && sppoAmendData?.MOID) {
            dispatch(setSelectedMOID(sppoAmendData.MOID));
            dispatch(fetchRemarks({ trno: sppoAmendData.SPPONo || selectedItem.SPPONo || '', moid: sppoAmendData.MOID }));
        }
    }, [selectedItem, sppoAmendData, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleRefresh = () => {
        if (roleId && uid) {
            dispatch(fetchVerificationSPPOAmend({ roleId, userId: uid }));
            if (selectedItem) {
                dispatch(fetchSPPOAmendById({ roleId, amendId: selectedItem.AmendId, userId: uid }));
            }
        }
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

        return {
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
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No SPPO Amendment selected'); return; }
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
            const typeToValueMap = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = typeToValueMap[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const payload = buildSPPOAmendApprovalPayload(actionValue);
            const result = await dispatch(approveSPPOAmend(payload)).unwrap();

            if (result && typeof result === 'string' && result.includes('$')) {
                const [, additionalInfo] = result.split('$');
                toast.success(`${action.text || actionValue} completed successfully!`);
                if (additionalInfo) setTimeout(() => toast.info(additionalInfo, { autoClose: 6000 }), 500);
            } else {
                toast.success((typeof result === 'string' && result) || `${action.text || actionValue} completed successfully!`);
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
            let errorMessage = `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;
            if (error && typeof error === 'string') errorMessage = error;
            else if (error?.message) errorMessage = error.message;
            else if (error?.response?.data?.message) errorMessage = error.response.data.message;
            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────

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

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderItemCard = (item) => {
        const hasPlus = (item.AmendPlusValue || 0) > 0;
        const hasMinus = (item.AmendMinusValue || 0) > 0;

        return (
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center shrink-0">
                        <Pencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.VendorName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.SPPONo} • Amend #{item.AmendId}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" /> {item.AmendDate}
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        ₹{formatIndianCurrency(item.AmendAmount || 0)}
                        {hasPlus && <Plus className="w-3 h-3 text-green-600" />}
                        {hasMinus && <Minus className="w-3 h-3 text-red-600" />}
                    </span>
                </div>
            </div>
        );
    };

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[160px]">{item.VendorName}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[140px]">{item.SPPONo} • #{item.AmendId}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">{item.AmendDate}</span>
            <span className="ml-auto font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">₹{formatIndianCurrency(item.AmendAmount || 0)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <Pencil className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail panel ──────────────────────────────────────────────────────────

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const displayData = sppoAmendData || selectedItem;
        const hasDetailedData = !!sppoAmendData;
        const hasPlus = (displayData.AmendPlusValue || 0) > 0;
        const hasMinus = (displayData.AmendMinusValue || 0) > 0;

        return (
            <div className="space-y-6">
                {sppoAmendDataLoading && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading amendment details...</span>
                    </div>
                )}

                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                                <Pencil className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayData.VendorName}</h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">
                                    Amendment #{displayData.AmendId} • SPPO: {displayData.SPPONo}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        Service PO Amendment
                                    </span>
                                    {hasPlus && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Plus className="w-3 h-3" /> Addition: ₹{formatIndianCurrency(displayData.AmendPlusValue || 0)}
                                        </span>
                                    )}
                                    {hasMinus && (
                                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Minus className="w-3 h-3" /> Deduction: ₹{formatIndianCurrency(displayData.AmendMinusValue || 0)}
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                                        Status: {displayData.Status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {hasDetailedData && (
                            <div className="text-right shrink-0">
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">₹{formatIndianCurrency(sppoAmendData.AmendAmount || 0)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Amendment Amount</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PO Value: ₹{formatIndianCurrency(sppoAmendData.POValue || 0)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">PO Balance: ₹{formatIndianCurrency(sppoAmendData.POBalance || 0)}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Amendment ID</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{displayData.AmendId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">SPPO No</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{displayData.SPPONo}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Vendor Code</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{displayData.VendorCode}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Cost Center</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{displayData.CCCode}</p>
                        </div>
                    </div>
                </div>

                {hasDetailedData && (displayData.AmendPlusValue > 0 || displayData.AmendMinusValue > 0 || displayData.AmendTotalValue > 0) && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" /> Amendment Value Breakdown
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {displayData.AmendPlusValue > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1"><Plus className="w-3 h-3 text-green-600" /> Addition</p>
                                    <p className="text-sm font-bold text-green-600 dark:text-green-400">₹{formatIndianCurrency(displayData.AmendPlusValue)}</p>
                                </div>
                            )}
                            {displayData.AmendMinusValue > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1"><Minus className="w-3 h-3 text-red-600" /> Deduction</p>
                                    <p className="text-sm font-bold text-red-600 dark:text-red-400">₹{formatIndianCurrency(displayData.AmendMinusValue)}</p>
                                </div>
                            )}
                            {displayData.SubstractAmount > 0 && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1"><TrendingDown className="w-3 h-3 text-orange-600" /> Subtract Amount</p>
                                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">₹{formatIndianCurrency(displayData.SubstractAmount)}</p>
                                </div>
                            )}
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1"><IndianRupee className="w-3 h-3 text-indigo-600" /> Total Amendment</p>
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₹{formatIndianCurrency(displayData.AmendTotalValue || displayData.AmendAmount)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {hasDetailedData && (displayData.OldPOValue > 0 || displayData.TotalPOValue > 0) && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5" /> PO Value Comparison
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Old PO Value</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">₹{formatIndianCurrency(displayData.OldPOValue || 0)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Current PO Value</p>
                                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">₹{formatIndianCurrency(displayData.POValue || 0)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">PO Balance</p>
                                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">₹{formatIndianCurrency(displayData.POBalance || 0)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {hasDetailedData && sppoAmendData.ItemDescList && sppoAmendData.ItemDescList.length > 0 && (
                    <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 p-4">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5" /> Amendment Item Details
                            </p>
                            {sppoAmendData.FilePath && (
                                <button
                                    onClick={() => handleViewAttachment(sppoAmendData.FilePath)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all text-xs font-semibold shadow-sm flex items-center gap-1.5"
                                >
                                    <FileText className="w-3.5 h-3.5" /> View Document
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-indigo-100/60 dark:bg-indigo-900/20">
                                        <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">Description</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">Unit</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">Current Qty</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">Amend Qty</th>
                                        <th className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase">Rate</th>
                                        <th className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase">Client Rate</th>
                                        <th className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase">Amount</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sppoAmendData.ItemDescList.map((item, index) => (
                                        <tr key={item.SPPOItemId || index} className="border-t border-indigo-100 dark:border-indigo-900/30">
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.Description}</td>
                                            <td className="px-3 py-2 text-center font-medium text-gray-900 dark:text-white">{item.Unit}</td>
                                            <td className="px-3 py-2 text-center font-medium text-gray-900 dark:text-white">{item.CurrentQuantity || item.Quantity || '-'}</td>
                                            <td className="px-3 py-2 text-center">
                                                {item.AmendQuantity ? (
                                                    <span className={`font-medium ${item.AmendQuantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {item.AmendQuantity > 0 ? '+' : ''}{item.AmendQuantity}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium text-indigo-700 dark:text-indigo-400">₹{formatIndianCurrency(item.Rate || item.PRWRate || 0)}</td>
                                            <td className="px-3 py-2 text-right font-medium text-violet-700 dark:text-violet-400">₹{formatIndianCurrency(item.ClientRate || 0)}</td>
                                            <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">₹{formatIndianCurrency(item.Amount || 0)}</td>
                                            <td className="px-3 py-2 text-center">
                                                {item.POType && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.POType.toLowerCase() === 'add' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                                        {item.POType}
                                                    </span>
                                                )}
                                                {item.ItemStatus && (
                                                    <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
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

                {hasDetailedData && (sppoAmendData.Terms || sppoAmendData.OldTerms) && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Terms &amp; Conditions
                        </p>
                        {sppoAmendData.OldTerms && (
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Original Terms:</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                    {sppoAmendData.OldTerms.split('|').filter(Boolean).join('\n• ')}
                                </p>
                            </div>
                        )}
                        {sppoAmendData.Terms && sppoAmendData.Terms !== sppoAmendData.OldTerms && (
                            <div>
                                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1.5">Amended Terms:</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
                                    {sppoAmendData.Terms.split('|').filter(Boolean).join('\n• ')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {hasDetailedData && sppoAmendData.ApprovedUser && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-2 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> Approved By
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                            {sppoAmendData.ApprovedUser}
                        </p>
                    </div>
                )}

                {poUploadedDocs && poUploadedDocs.length > 0 && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Uploaded Documents ({poUploadedDocs.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {poUploadedDocs.map((doc, index) => {
                                if (!doc.Path) return null;
                                const fileName = getFileName(doc.Path) || `Document ${index + 1}`;
                                return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${doc.POType === 'Amend' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'}`}>
                                                        {doc.POType}
                                                    </span>
                                                    {doc.For && <span className="text-xs text-gray-500 dark:text-gray-400">{doc.For}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewAttachment(doc.Path)}
                                            className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium shrink-0"
                                        >
                                            View
                                        </button>
                                    </div>
                                );
                            }).filter(Boolean)}
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
                        No actions available for this SPPO amendment
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

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
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
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                filters={[
                    { value: filterCCCode, onChange: (e) => setFilterCCCode(e.target.value), defaultValue: 'All', defaultLabel: 'All Cost Centers', options: ccCodes },
                    { value: filterVendor, onChange: (e) => setFilterVendor(e.target.value), defaultValue: 'All', defaultLabel: 'All Vendors', options: vendors },
                ]}
                enableViewToggle
            />

            <InboxSplitLayout
                isLeftPanelCollapsed={isLeftPanelCollapsed}
                onLeftPanelCollapseToggle={setIsLeftPanelCollapsed}
                isLeftPanelHovered={isLeftPanelHovered}
                onLeftPanelHoverChange={setIsLeftPanelHovered}
                left={{
                    items: filteredItems,
                    selectedItem: selectedItem,
                    onItemSelect: setSelectedItem,
                    renderItem: renderItemCard,
                    renderListItem: renderListItem,
                    renderCollapsedItem: renderCollapsedItem,
                    loading: sppoAmendLoading,
                    error: sppoAmendError,
                    onRefresh: handleRefresh,
                    config: {
                        title: 'Pending Amendments',
                        icon: Clock,
                        emptyMessage: 'No SPPO amendments found!',
                        itemKey: 'AmendId',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'SPPO Amendment Verification',
                        icon: Pencil,
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: sppoAmendDataLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Amendment Details',
                        icon: Pencil,
                        selectedTitle: 'SPPO Amendment Verification',
                        emptyTitle: 'No Amendment Selected',
                        emptyMessage: 'Select an amendment from the list to view details and take action.',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        maxHeight: 'calc(100vh - 200px)',
                        sticky: true,
                        stickyTop: '1.5rem',
                    },
                }}
            />

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
