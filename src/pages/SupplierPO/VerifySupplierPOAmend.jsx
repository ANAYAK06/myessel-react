import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileEdit, Clock, Calendar,
    Package, Plus, Minus, TrendingUp, FileText, Loader2,
} from 'lucide-react';

import InboxHeader       from '../../components/Inbox/InboxHeader';
import AttachmentModal   from '../../components/Inbox/AttachmentModal';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout  from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import { buildSupplierPOUrl, buildSupplierPOAmendUrl, getFileName } from '../../config/s3Config';

import {
    fetchSupplierPOAmendList,
    fetchSupplierPOAmendDetail,
    approveSupplierPOAmend,
    fetchSupplierPOAmendUploadedDocs,
    clearSupplierPOAmendDetail,
    clearSupplierPOAmendUploadedDocs,
    clearSupplierPOAmendApproveResult,
    resetSupplierPOAmendVerification,
    selectSupplierPOAmendList,
    selectSupplierPOAmendDetail,
    selectSupplierPOAmendUploadedDocs,
    selectSupplierPOAmendListLoading,
    selectSupplierPOAmendDetailLoading,
    selectSupplierPOAmendApproveLoading,
    selectSupplierPOAmendListError,
} from '../../slices/supplierPOSlice/supplierPOAmendVerificationSlice';

import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID,
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton,
} from '../../slices/CommonSlice/getStatusSlice';

import { formatIndianCurrency } from '../../utilities/amountToTextHelper';

const VerifySupplierPOAmend = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const list          = useSelector(selectSupplierPOAmendList);
    const listLoading   = useSelector(selectSupplierPOAmendListLoading);
    const listError     = useSelector(selectSupplierPOAmendListError);

    const detail         = useSelector(selectSupplierPOAmendDetail);
    const detailLoading  = useSelector(selectSupplierPOAmendDetailLoading);

    const uploadedDocs   = useSelector(selectSupplierPOAmendUploadedDocs);
    const approveLoading = useSelector(selectSupplierPOAmendApproveLoading);

    const remarks        = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID || 0;
    const uid    = userData?.UID || userData?.uid;

    const [selectedItem,         setSelectedItem]         = useState(null);
    const [isVerified,           setIsVerified]           = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [filterCCCode,         setFilterCCCode]         = useState('All');
    const [filterVendor,         setFilterVendor]         = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);
    const [showAttachmentModal,  setShowAttachmentModal]  = useState(false);
    const [attachmentUrl,        setAttachmentUrl]        = useState('');

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const ccCodes  = [...new Set(list.map(item => item.CCCode))].filter(Boolean);
    const vendors  = [...new Set(list.map(item => item.VendorName))].filter(Boolean);

    const getCurrentUser = () => userData?.userName || userDetails?.userName || 'system';

    const getCurrentRoleName = () =>
        userDetails?.roleName || userData?.roleName ||
        notificationData?.InboxTitle || notificationData?.ModuleDisplayName || 'Supplier PO Amend Verifier';

    const formatApprovalComment = (roleName, userName, comment) => `${roleName} : ${userName} : ${comment}`;

    const updateRemarksHistory = (existingRemarks, newRoleName, newUserName, newComment) => {
        const formattedNewComment = formatApprovalComment(newRoleName, newUserName, newComment);
        if (!existingRemarks || existingRemarks.trim() === '') return formattedNewComment;
        return `${existingRemarks.trim()}||${formattedNewComment}`;
    };

    const handleViewDoc = (filePath, poType) => {
        if (!filePath) { toast.error('No document available'); return; }
        const buildUrl = poType === 'Amend' ? buildSupplierPOAmendUrl : buildSupplierPOUrl;
        setAttachmentUrl(buildUrl(filePath));
        setShowAttachmentModal(true);
    };

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId && uid) {
            dispatch(fetchSupplierPOAmendList({ roleId, userId: uid, ccType: 'PCC' }));
        }
    }, [roleId, uid, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetSupplierPOAmendVerification());
            dispatch(resetApprovalData());
        };
    }, [dispatch]);

    useEffect(() => {
        if (selectedItem) {
            dispatch(fetchSupplierPOAmendDetail({
                amendPONO: selectedItem.AmendPONO,
                poNo:      selectedItem.PONo,
                indentNo:  selectedItem.IndentNo,
            }));
            dispatch(fetchSupplierPOAmendUploadedDocs({ poNo: selectedItem.PONo, forType: 'Supplier' }));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    useEffect(() => {
        if (selectedItem && roleId && detail?.MOID) {
            dispatch(fetchStatusList({
                MOID: detail.MOID,
                ROID: roleId,
                ChkAmt: detail?.RevisedValue || 0,
            }));
        }
    }, [selectedItem, roleId, detail, dispatch]);

    useEffect(() => {
        if (selectedItem && detail?.MOID) {
            dispatch(setSelectedMOID(detail.MOID));
            dispatch(fetchRemarks({ trno: detail.AmendPONO || selectedItem.AmendPONO || '', moid: detail.MOID }));
        }
    }, [selectedItem, detail, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleRefresh = () => {
        if (roleId && uid) {
            dispatch(fetchSupplierPOAmendList({ roleId, userId: uid, ccType: 'PCC' }));
            if (selectedItem) {
                dispatch(fetchSupplierPOAmendDetail({
                    amendPONO: selectedItem.AmendPONO,
                    poNo:      selectedItem.PONo,
                    indentNo:  selectedItem.IndentNo,
                }));
            }
        }
    };

    // spApproveSupplierPOAmend reads the item list as parallel comma-separated
    // strings (one entry per item, same order, trailing comma) — matching the
    // convention already used by spApproveSupplierPO / spApproveClientRecievable.
    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const currentRoleName = getCurrentRoleName();

        const updatedRemarks = updateRemarksHistory(
            detail?.Remarks,
            currentRoleName,
            currentUser,
            verificationComment.trim()
        );

        const items = detail?.lstItems || [];
        let itemcodes = '', indentlistids = '', standardprices = '', standardpriceAmts = '',
            purchaseprices = '', purchasepriceAmts = '', newPurchaseprices = '', newPurchasepriceAmts = '';

        items.forEach(item => {
            itemcodes            += `${item.itemcode},`;
            indentlistids        += `${item.IndentListId},`;
            standardprices       += `${item.basicprice || 0},`;
            standardpriceAmts    += `${item.OldAmount || 0},`;
            purchaseprices       += `${item.POPurchasePrice || 0},`;
            purchasepriceAmts    += `${item.Amount || 0},`;
            newPurchaseprices    += `${item.NewBasicprice || 0},`;
            newPurchasepriceAmts += `${item.ItemNewPrice || 0},`;
        });

        return {
            PONo:      detail?.PONo || selectedItem?.PONo || '',
            AmendPONO: detail?.AmendPONO || selectedItem?.AmendPONO || 0,
            RoleId:    roleId,
            CreatedBy: currentUser,
            Action:    actionValue,
            Remarks:   updatedRemarks,
            IndentNo:  detail?.IndentNo || selectedItem?.IndentNo || '',

            PlusAmount:            detail?.PlusAmount || 0,
            MinusAmount:           detail?.MinusAmount || 0,
            ReducedBudgetAmount:   detail?.ReducedBudgetAmount || 0,
            ReturnBudgetAmount:    detail?.ReturnBudgetAmount || 0,
            NewPurchasepriceTotal: detail?.NewPurchasepriceTotal || 0,

            Itemcodes:            itemcodes,
            Indentlistids:        indentlistids,
            Standardprices:       standardprices,
            StandardpriceAmts:    standardpriceAmts,
            Purchaseprices:       purchaseprices,
            PurchasepriceAmts:    purchasepriceAmts,
            NewPurchaseprices:    newPurchaseprices,
            NewPurchasepriceAmts: newPurchasepriceAmts,

            AmendDiffValue: detail?.AmendDiffValue || 0,
            RevisedValue:   detail?.RevisedValue || 0,
            AddedPO:        detail?.AddedPO || 0,
            SubstractedPO:  detail?.SubstractedPO || 0,
        };
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No Supplier PO Amendment selected'); return; }
        if (!verificationComment || verificationComment.trim() === '') {
            toast.error('Verification comment is mandatory. Please add your comments before proceeding.');
            return;
        }
        if (!isVerified) {
            toast.error('Please verify the amendment details by checking the verification checkbox.');
            return;
        }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue || actionValue.trim() === '') {
            const typeToValueMap = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = typeToValueMap[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const payload = buildApprovalPayload(actionValue);
            const result = await dispatch(approveSupplierPOAmend(payload)).unwrap();

            if (result && typeof result === 'string' && result.includes('$')) {
                const [, additionalInfo] = result.split('$');
                toast.success(`${action.text || actionValue} completed successfully!`);
                if (additionalInfo) setTimeout(() => toast.info(additionalInfo, { autoClose: 6000 }), 500);
            } else {
                toast.success((typeof result === 'string' && result) || `${action.text || actionValue} completed successfully!`);
            }

            setTimeout(() => {
                dispatch(fetchSupplierPOAmendList({ roleId, userId: uid, ccType: 'PCC' }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearSupplierPOAmendDetail());
                dispatch(clearSupplierPOAmendUploadedDocs());
                dispatch(resetApprovalData());
                dispatch(clearSupplierPOAmendApproveResult());
            }, 1000);
        } catch (error) {
            let errorMessage = `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;
            if (error && typeof error === 'string') errorMessage = error;
            else if (error?.message) errorMessage = error.message;
            toast.error(errorMessage, { autoClose: 10000 });
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────

    const filteredItems = list.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.PONo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.IndentNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.VendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.CCCode?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCCCode = filterCCCode === 'All' || item.CCCode === filterCCCode;
        const matchesVendor = filterVendor === 'All' || item.VendorName === filterVendor;

        return matchesSearch && matchesCCCode && matchesVendor;
    });

    // ── Left panel card renderers ─────────────────────────────────────────────

    const renderImpactBadge = (item) => {
        const hasPlus  = (item.PlusAmount || 0) > 0;
        const hasMinus = (item.MinusAmount || 0) > 0;

        return (
            <span
                className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 whitespace-nowrap"
                title="Amendment difference value"
            >
                ₹{formatIndianCurrency(item.AmendDiffValue || 0)}
                {hasPlus && <Plus className="w-3 h-3 text-green-600" />}
                {hasMinus && <Minus className="w-3 h-3 text-red-600" />}
            </span>
        );
    };

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center shrink-0">
                    <FileEdit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.VendorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.PONo}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" /> {item.AmendDate}
                </span>
                {renderImpactBadge(item)}
            </div>
        </div>
    );

    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[160px] truncate">{item.VendorName}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[140px]">{item.PONo}</span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">{item.AmendDate}</span>
            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">{item.CCCode}</span>
            <span className="ml-auto">{renderImpactBadge(item)}</span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <FileEdit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail panel ──────────────────────────────────────────────────────────

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const d = detail || selectedItem;
        const hasDetail = !!detail;
        const hasPlus  = (d.PlusAmount || 0) > 0;
        const hasMinus = (d.MinusAmount || 0) > 0;

        return (
            <div className="space-y-6">
                {detailLoading && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading amendment details...</span>
                    </div>
                )}

                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                                <FileEdit className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{d.VendorName}</h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">
                                    PO: {d.PONo} • Indent: {d.IndentNo}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        Supplier PO Amendment
                                    </span>
                                    {hasPlus && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Plus className="w-3 h-3" /> Addition: ₹{formatIndianCurrency(d.PlusAmount || 0)}
                                        </span>
                                    )}
                                    {hasMinus && (
                                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Minus className="w-3 h-3" /> Deduction: ₹{formatIndianCurrency(d.MinusAmount || 0)}
                                        </span>
                                    )}
                                    {d.CCType && (
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                            {d.CCType}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {hasDetail && (
                            <div className="text-right shrink-0">
                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">₹{formatIndianCurrency(detail.RevisedValue || 0)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Revised PO Value</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Old Value: ₹{formatIndianCurrency(detail.OldPOValue || 0)}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Amend PO No</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{d.AmendPONO}{d.SerialNo != null ? ` (Amendment No: ${d.SerialNo})` : ''}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Vendor Code</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{d.VendorCode || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Cost Center</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{d.CCCode} {d.CCName ? `– ${d.CCName}` : ''}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Amend Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{d.AmendDate}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">PO Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{d.PODate || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">PO Expire Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{d.POExpireDate || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">MRR Type</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{d.MRRType || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Reference</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{d.RefNo || '—'}{d.RefDate ? ` (${d.RefDate})` : ''}</p>
                        </div>
                    </div>
                </div>

                {hasDetail && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" /> Amendment Value Breakdown
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Excess PO Value (+)</p>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">₹{formatIndianCurrency(detail.PlusAmount || 0)}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reduced PO Value (-)</p>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">₹{formatIndianCurrency(detail.MinusAmount || 0)}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Old PO Value</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">₹{formatIndianCurrency(detail.OldPOValue || 0)}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amend Diff. Value</p>
                                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">₹{formatIndianCurrency(detail.AmendDiffValue || 0)}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revised Value</p>
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₹{formatIndianCurrency(detail.RevisedValue || 0)}</p>
                            </div>
                            {(detail.AddedPO > 0 || detail.SubstractedPO > 0) && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Added / Subtracted</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                        +₹{formatIndianCurrency(detail.AddedPO || 0)} / -₹{formatIndianCurrency(detail.SubstractedPO || 0)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {hasDetail && detail.lstItems && detail.lstItems.length > 0 && (
                    <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" /> Amendment Item Details ({detail.lstItems.length})
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-indigo-100/60 dark:bg-indigo-900/20">
                                        <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">Item</th>
                                        <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">HSN</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">Units</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">Previous Qty</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">Amend Qty</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">Revised Qty</th>
                                        <th className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase">Quoted Price</th>
                                        <th className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase">Std. Price</th>
                                        <th className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase">Purchase Price</th>
                                        <th className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase">Amount</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">CGST%</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">SGST%</th>
                                        <th className="px-3 py-2 text-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">Type</th>
                                        <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detail.lstItems.map((item, index) => (
                                        <tr key={item.IndentListId || index} className="border-t border-indigo-100 dark:border-indigo-900/30">
                                            <td className="px-3 py-2">
                                                <p className="font-semibold text-gray-900 dark:text-white">{item.itemname}</p>
                                                <p className="text-gray-500 dark:text-gray-400 font-mono">{item.itemcode?.trim()}</p>
                                                {item.specification && (
                                                    <p className="text-gray-400 dark:text-gray-500">{item.specification}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono">{item.HSNCode || '-'}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{item.units || '-'}</td>
                                            <td className="px-3 py-2 text-center font-medium text-gray-900 dark:text-white">{item.quantity ?? item.CurrentQty ?? '-'}</td>
                                            <td className="px-3 py-2 text-center">
                                                {item.AmendQty ? (
                                                    <span className={`font-medium ${item.AmendType?.toLowerCase() === 'substract' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                        {item.AmendType?.toLowerCase() === 'substract' ? '-' : '+'}{item.AmendQty}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-center font-medium text-gray-900 dark:text-white">{item.PONewQty ?? '-'}</td>
                                            <td className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">₹{formatIndianCurrency(item.POQuotedPrice || 0)}</td>
                                            <td className="px-3 py-2 text-right font-medium text-indigo-700 dark:text-indigo-400">₹{formatIndianCurrency(item.basicprice || item.POStandardPrice || 0)}</td>
                                            <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">₹{formatIndianCurrency(item.POPurchasePrice || 0)}</td>
                                            <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">
                                                ₹{formatIndianCurrency(item.Amount || 0)}
                                                {item.OldAmount != null && item.OldAmount !== item.Amount && (
                                                    <span className="block text-gray-400 dark:text-gray-500 font-normal">was ₹{formatIndianCurrency(item.OldAmount)}</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{item.CGSTPercent ?? '-'}</td>
                                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{item.SGSTPercent ?? '-'}</td>
                                            <td className="px-3 py-2 text-center">
                                                {item.AmendType && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.AmendType.toLowerCase() === 'substract' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                                                        {item.AmendType}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{item.ItemRemark || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {hasDetail && detail.Remarks && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> PO Terms &amp; Conditions
                        </p>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {detail.Remarks.split('|').filter(Boolean).map((term, i) => (
                                <p key={i}>• {term.trim()}</p>
                            ))}
                        </div>
                    </div>
                )}

                {uploadedDocs && uploadedDocs.length > 0 && (
                    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Uploaded Documents ({uploadedDocs.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {uploadedDocs.filter(doc => doc.Path).map((doc, index) => {
                                const fileName = getFileName(doc.Path) || `Document ${index + 1}`;
                                return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${doc.POType === 'Amend' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'}`}>
                                                    {doc.POType === 'Amend' ? `Amendment ${doc.POCount}` : 'Original PO'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewDoc(doc.Path, doc.POType)}
                                            className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium shrink-0"
                                        >
                                            View
                                        </button>
                                    </div>
                                );
                            })}
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
                        checkboxLabel: '✓ I have verified this Supplier PO amendment',
                        checkboxDescription: 'Including item quantity/price changes, value breakdown, and supporting documentation',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify amendment items, value changes, and reason for amendment...',
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
                        No actions available for this amendment
                    </div>
                ) : (
                    <ActionButtons
                        actions={enabledActions}
                        onActionClick={handleActionClick}
                        loading={approveLoading}
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
                title={`${InboxTitle || 'Supplier PO Amendment'} (${list.length})`}
                subtitle={ModuleDisplayName}
                itemCount={list.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={FileEdit}
                badgeText="Supplier PO Amendment"
                badgeCount={list.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by PO no, indent no, vendor, CC code...',
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
                    loading: listLoading,
                    error: listError,
                    onRefresh: handleRefresh,
                    config: {
                        title: 'Pending Amendments',
                        icon: Clock,
                        emptyMessage: 'No Supplier PO amendments pending.',
                        itemKey: 'AmendId',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Supplier PO Amendment Verification',
                        icon: FileEdit,
                        headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: detailLoading,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Amendment Details',
                        icon: FileEdit,
                        selectedTitle: 'Supplier PO Amendment Verification',
                        emptyTitle: 'No Amendment Selected',
                        emptyMessage: 'Select an amendment from the list to review and take action.',
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
                title="Supplier PO Amendment Document"
            />
        </div>
    );
};

export default VerifySupplierPOAmend;
