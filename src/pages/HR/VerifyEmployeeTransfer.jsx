import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowRightLeft, Clock,
    Calendar, Hash,
    Building2, MapPin,
    UserCheck, CalendarDays
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyEmployeeTransferGrid,
    fetchVerifyEmployeeTransferView,
    approveEmployeeTransfer,
    setSelectedLvId,
    clearApproveResult,
    clearTransferDetail,
    resetAll,
    selectTransferGridListArray,
    selectTransferViewData,
    selectTransferGridListLoading,
    selectTransferViewDataLoading,
    selectApproveLoading,
    selectTransferGridListError,
    selectTransferViewDataError,
    selectApproveStatus,
    selectApproveResult,
    selectTransferSummary,
} from '../../slices/HRSlice/employeeTransferSlice';

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

// ─── ROOT CAUSE NOTES ─────────────────────────────────────────────────────────
// The API returns: { Data: [ {...record...} ], IsSuccessful: false, ... }
// The slice stores:  state.transferViewData = action.payload?.Data || action.payload
// So selectTransferViewData returns the ARRAY  [ {...} ]  — NOT the object.
//
// Fix: always unwrap with  Array.isArray(raw) ? raw[0] : raw
// Same applies to the inbox grid list — the selector already handles it via
// selectTransferGridListArray (safe-array selector), but item fields come
// directly from the inbox array elements, which are already objects.
//
// Remarks fix: the remarks API expects  trno = TransactionRefno (string),
// NOT the numeric lid. For transfers there is no separate TransactionRefno —
// pass lid as the trno. The MOID must be a Number, not the string "380".
// ─────────────────────────────────────────────────────────────────────────────

const VerifyEmployeeTransfer = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ── Raw selectors ─────────────────────────────────────────────────────────
    const transferGrid      = useSelector(selectTransferGridListArray);  // already safe-array
    const transferViewRaw   = useSelector(selectTransferViewData);       // may be array or object
    const inboxLoading      = useSelector(selectTransferGridListLoading);
    const inboxError        = useSelector(selectTransferGridListError);
    const detailsLoading    = useSelector(selectTransferViewDataLoading);
    const detailsError      = useSelector(selectTransferViewDataError);
    const approvalLoading   = useSelector(selectApproveLoading);
    const approvalStatus    = useSelector(selectApproveStatus);
    const summary           = useSelector(selectTransferSummary);
    const remarks           = useSelector(selectRemarks);
    const remarksLoading    = useSelector(selectRemarksLoading);
    const statusLoading     = useSelector(selectStatusListLoading);
    const statusError       = useSelector(selectStatusListError);
    const enabledActions    = useSelector(selectEnabledActions);
    const hasActions        = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;

    // ── CRITICAL: unwrap Data[0] if slice stored the array ───────────────────
    // The slice does: state.transferViewData = action.payload?.Data || action.payload
    // action.payload.Data is [ {...} ] — an array — so we must unwrap [0].
    const transferView = Array.isArray(transferViewRaw)
        ? (transferViewRaw[0] || null)
        : transferViewRaw;

    // ── Local State ────────────────────────────────────────────────────────────
    const [selectedItem,         setSelectedItem]         = useState(null);
    const [isVerified,           setIsVerified]           = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [filterStatus,         setFilterStatus]         = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ── "d" = unified display: detail (unwrapped) when loaded, else inbox item ─
    // After unwrapping, d fields are:
    //   d.lid, d.EmployeeId, d.EmployeeName,
    //   d.FromCC, d.ToCC, d.RelievingDate, d.JoiningDate,
    //   d.Remarks, d.Status, d.MOID, d.ReturnNotes, d.ErrorStatus
    const d = transferView || selectedItem || {};

    // ── Helpers ────────────────────────────────────────────────────────────────
    const getCurrentUser = () =>
        userData?.userName || userDetails?.userName || 'system';

    const getCurrentRoleName = () =>
        userDetails?.roleName        ||
        userData?.roleName           ||
        notificationData?.InboxTitle ||
        notificationData?.ModuleDisplayName ||
        'Transfer Verifier';

    const updateRemarksHistory = (existing, roleName, userName, comment) => {
        const formatted = `${roleName} : ${userName} : ${comment}`;
        if (!existing || existing.trim() === '') return formatted;
        return `${existing.trim()}||${formatted}`;
    };

    // "CC-144 , TOWL-MONET-RGH-FAB"  →  { code: "CC-144", name: "TOWL-MONET-RGH-FAB" }
    const parseCCField = (cc) => {
        if (!cc) return { code: null, name: null };
        const idx = cc.indexOf(',');
        if (idx === -1) return { code: cc.trim(), name: null };
        return { code: cc.slice(0, idx).trim(), name: cc.slice(idx + 1).trim() };
    };

    const uniqueStatuses = [...new Set(transferGrid.map(i => i.Status))].filter(Boolean);

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (roleId) {
            console.log('🎯 Initializing Employee Transfer Verification — RoleID:', roleId);
            dispatch(fetchVerifyEmployeeTransferGrid(roleId));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
            dispatch(clearApproveResult());
        };
    }, [dispatch]);

    // ── Fetch detail view when item is selected ───────────────────────────────
    useEffect(() => {
        if (selectedItem?.lid) {
            console.log('🔍 Fetching Transfer View — lid:', selectedItem.lid);
            dispatch(setSelectedLvId(selectedItem.lid));
            dispatch(fetchVerifyEmployeeTransferView(selectedItem.lid));

            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // ── Fetch status list — only after detail loads (MOID is null in inbox) ───
    // transferView is now the unwrapped object, so .MOID is reliable.
    useEffect(() => {
        if (selectedItem && roleId && transferView?.MOID) {
            const moid = Number(transferView.MOID); // "380" → 380
            console.log('📊 Fetching Status List — MOID:', moid, 'ROID:', roleId);
            dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        }
    }, [selectedItem, roleId, transferView?.MOID, dispatch]);

    // ── Fetch remarks — pass lid as trno, MOID as number ─────────────────────
    useEffect(() => {
        if (selectedItem && transferView?.MOID) {
            const moid = Number(transferView.MOID);
            const trno = String(transferView.lid || selectedItem.lid || '');
            console.log('💬 Fetching Remarks — trno:', trno, 'MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({ trno, moid }));
        }
    }, [selectedItem, transferView?.MOID, dispatch]);

    // ── Auto-collapse left panel ──────────────────────────────────────────────
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Event handlers ────────────────────────────────────────────────────────
    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleRefresh = () => {
        if (roleId) {
            console.log('🔄 Refreshing Employee Transfer list');
            dispatch(fetchVerifyEmployeeTransferGrid(roleId));
            if (selectedItem?.lid) dispatch(fetchVerifyEmployeeTransferView(selectedItem.lid));
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected Transfer Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser     = getCurrentUser();
        const currentRoleName = getCurrentRoleName();
        const updatedRemarks  = updateRemarksHistory(
            transferView?.Remarks || '',
            currentRoleName, currentUser, verificationComment.trim()
        );
        const payload = {
            lid:           transferView?.lid           || selectedItem?.lid           || '',
            EmployeeId:    transferView?.EmployeeId    || selectedItem?.EmployeeId    || '',
            FromCC:        transferView?.FromCC        || '',
            ToCC:          transferView?.ToCC          || '',
            RelievingDate: transferView?.RelievingDate || selectedItem?.RelievingDate || '',
            JoiningDate:   transferView?.JoiningDate   || selectedItem?.JoiningDate   || '',
            Roleid:        roleId,
            CreatedBy:     currentUser,
            Action:        actionValue,
            Note:          verificationComment.trim(),
            Remarks:       updatedRemarks,
        };
        console.log('📤 Employee Transfer Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No transfer record selected'); return; }
        if (!verificationComment?.trim()) {
            toast.error('Verification comment is mandatory.');
            return;
        }
        if (!isVerified) {
            toast.error('Please check the verification checkbox before proceeding.');
            return;
        }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        try {
            const payload = buildApprovalPayload(actionValue);
            const result  = await dispatch(approveEmployeeTransfer(payload)).unwrap();

            if (result?.IsSuccessful === false) {
                throw new Error(result?.Data || result?.Message || `Failed to ${actionValue}`);
            }

            toast.success(
                typeof result?.Data === 'string'
                    ? result.Data
                    : `${action.text || actionValue} completed successfully!`
            );

            setTimeout(() => {
                dispatch(fetchVerifyEmployeeTransferGrid(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearTransferDetail());
                dispatch(resetApprovalData());
                dispatch(clearApproveResult());
            }, 1000);

        } catch (error) {
            console.error('❌ Approval Error:', error);
            const msg =
                (typeof error === 'string' ? error : null) ||
                error?.message ||
                `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredItems = transferGrid.filter(item => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            item.EmployeeName?.toLowerCase().includes(q) ||
            item.EmployeeId?.toLowerCase().includes(q)   ||
            String(item.lid).includes(q);
        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ── Stats cards ────────────────────────────────────────────────────────────
    const statsCards = [
        { icon: ArrowRightLeft, value: transferGrid.length,    label: 'Total Records',       color: 'blue'   },
        { icon: Clock,          value: transferGrid.length,    label: 'Pending Verification', color: 'purple' },
        { icon: CalendarDays,   value: d.RelievingDate || '-', label: 'Relieving Date',       color: 'indigo' },
        { icon: CalendarDays,   value: d.JoiningDate   || '-', label: 'Joining Date',         color: 'violet' },
    ];

    // ── Left panel renderers ───────────────────────────────────────────────────
    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
                        <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {item.EmployeeName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.EmployeeId}
                    </p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                        <Hash className="w-3 h-3" />
                        <span>Ref: {item.lid}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        Transfer
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span>Relieving: {item.RelievingDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-purple-400" />
                    <span>Joining: {item.JoiningDate}</span>
                </div>
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
    );

    // ── Transfer Route card ────────────────────────────────────────────────────
    const renderTransferRoute = () => {
        const from = parseCCField(d.FromCC);
        const to   = parseCCField(d.ToCC);

        return (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>Transfer Route</span>
                    </h3>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800">
                    <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">

                        {/* From CC */}
                        <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700 text-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mx-auto mb-3 shadow">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">From Cost Centre</p>
                            {from.code ? (
                                <>
                                    <p className="font-bold text-blue-700 dark:text-blue-300 text-sm">{from.code}</p>
                                    {from.name && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{from.name}</p>}
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Not available</p>
                            )}
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <ArrowRightLeft className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs text-gray-400 font-medium">Transfer</span>
                        </div>

                        {/* To CC */}
                        <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-700 text-center">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 mx-auto mb-3 shadow">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">To Cost Centre</p>
                            {to.code ? (
                                <>
                                    <p className="font-bold text-purple-700 dark:text-purple-300 text-sm">{to.code}</p>
                                    {to.name && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{to.name}</p>}
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Not available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ── Timeline / Remarks table ───────────────────────────────────────────────
    const renderTimeline = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Transfer Timeline
                </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between px-5 py-3">
                    <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>Last Working Date (Relieving)</span>
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {d.RelievingDate || 'N/A'}
                    </span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                    <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>Joining Date (New CC)</span>
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {d.JoiningDate || 'N/A'}
                    </span>
                </div>
                {d.Remarks?.trim() && (
                    <div className="flex flex-col px-5 py-3 gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reason / Remarks</span>
                        <span className="text-sm text-gray-900 dark:text-white leading-relaxed">{d.Remarks}</span>
                    </div>
                )}
                {d.ReturnNotes?.trim() && (
                    <div className="flex flex-col px-5 py-3 gap-1 bg-yellow-50 dark:bg-yellow-900/10">
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 uppercase tracking-wide font-semibold">Return Notes</span>
                        <span className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">{d.ReturnNotes}</span>
                    </div>
                )}
                {d.ErrorStatus?.trim() && (
                    <div className="flex flex-col px-5 py-3 gap-1 bg-red-50 dark:bg-red-900/10">
                        <span className="text-xs text-red-500 uppercase tracking-wide font-semibold">Error Status</span>
                        <span className="text-sm text-red-700 leading-relaxed">{d.ErrorStatus}</span>
                    </div>
                )}
            </div>
        </div>
    );

    // ── Detail pane ────────────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;
        const hasDetailData = !!transferView; // true only after detail fetch resolves

        return (
            <div className="space-y-6">

                {/* Loading indicator */}
                {detailsLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                            <span className="text-blue-700 dark:text-blue-400 text-sm">Loading transfer details...</span>
                        </div>
                    </div>
                )}

                {/* Hero header — uses "d" which falls back to selectedItem while loading */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-start space-x-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <ArrowRightLeft className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <UserCheck className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {d.EmployeeName}
                            </h2>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                                {d.EmployeeId} • Ref: {d.lid}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                    CC Transfer
                                </span>
                                {hasDetailData && d.MOID && (
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        MOID: {d.MOID}
                                    </span>
                                )}
                                {d.Status && (
                                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                                        Status: {d.Status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick info chips */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference ID</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.lid || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employee Code</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.EmployeeId || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Relieving Date</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.RelievingDate || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Joining Date</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.JoiningDate || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Transfer route — gated on hasDetailData since FromCC/ToCC are null in inbox */}
                {hasDetailData
                    ? renderTransferRoute()
                    : !detailsLoading && (
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600 text-center text-sm text-gray-400">
                            Loading cost centre details...
                        </div>
                    )
                }

                {/* Timeline */}
                {hasDetailData && renderTimeline()}

                {/* Approval history */}
                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={remarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                {/* Verification checkbox + comment */}
                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have verified the transfer details, cost centres, and dates',
                        checkboxDescription: 'Including from/to cost centres, relieving date, and joining date',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify the transfer route, cost centres, dates and any discrepancies...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-blue-200 dark:border-blue-700'
                    }}
                />

                {/* Action buttons */}
                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                            <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                        </div>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                        <p className="text-red-600 dark:text-red-400 text-center">⚠️ Error loading actions: {statusError}</p>
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                        <p className="text-yellow-700 dark:text-yellow-400 text-center">
                            ℹ️ No actions available for this transfer record
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

    // ── Root render ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            <InboxHeader
                title={`${InboxTitle || 'Employee Transfer Verification'} (${transferGrid.length})`}
                subtitle={ModuleDisplayName}
                itemCount={transferGrid.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={ArrowRightLeft}
                badgeText="Transfer Verification"
                badgeCount={transferGrid.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, emp code, ref no...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    {
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        defaultLabel: 'All Statuses',
                        options: uniqueStatuses
                    }
                ]}
            />

            <div className="px-6 -mt-auto mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

            <div
                    className={`grid transition-all duration-300 ${
                        isLeftPanelCollapsed && !isLeftPanelHovered
                            ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                            : 'grid-cols-1 lg:grid-cols-3 gap-6'
                    }`}
                    onMouseLeave={() => {
                        if (selectedItem && isLeftPanelCollapsed) setIsLeftPanelHovered(false);
                    }}
                >
                    {/* Left panel */}
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
                            loading={inboxLoading}
                            error={inboxError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No transfer records found!',
                                itemKey: 'lid',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
                            }}
                        />
                    </div>

                    {/* Detail panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                        <ArrowRightLeft className="w-4 h-4 text-white" />
                                    </div>
                                    <span>{selectedItem ? 'Transfer Verification' : 'Transfer Details'}</span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? renderDetailContent() : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ArrowRightLeft className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Transfer Record Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a transfer record from the list to view details and verify the cost centre transfer.
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

export default VerifyEmployeeTransfer;