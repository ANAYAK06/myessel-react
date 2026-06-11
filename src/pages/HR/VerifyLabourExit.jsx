import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    LogOut, Clock,
    Calendar, Hash,
    Building2, UserCheck, CalendarDays,
    FileText, Briefcase, Users,
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyLBExit,
    fetchLBExitById,
    approveLBExit,
    setSelectedId,
    clearApproveResult,
    clearExitDetail,
    resetAll,
    selectExitGridListArray,
    selectExitViewData,
    selectExitGridListLoading,
    selectExitViewDataLoading,
    selectApproveLoading,
    selectExitGridListError,
    selectExitViewDataError,
    selectApproveStatus,
    selectExitSummary,
} from '../../slices/HRSlice/labourExitSlice';

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

const VerifyLabourExit = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ── Selectors ─────────────────────────────────────────────────────────────
    const exitGrid        = useSelector(selectExitGridListArray);
    const exitViewRaw     = useSelector(selectExitViewData);
    const inboxLoading    = useSelector(selectExitGridListLoading);
    const inboxError      = useSelector(selectExitGridListError);
    const detailsLoading  = useSelector(selectExitViewDataLoading);
    const detailsError    = useSelector(selectExitViewDataError);
    const approvalLoading = useSelector(selectApproveLoading);
    const approvalStatus  = useSelector(selectApproveStatus);
    const summary         = useSelector(selectExitSummary);
    const remarks         = useSelector(selectRemarks);
    const remarksLoading  = useSelector(selectRemarksLoading);
    const statusLoading   = useSelector(selectStatusListLoading);
    const statusError     = useSelector(selectStatusListError);
    const enabledActions  = useSelector(selectEnabledActions);
    const hasActions      = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;

    // Unwrap Data[0] if slice stored the array
    const exitView = Array.isArray(exitViewRaw)
        ? (exitViewRaw[0] || null)
        : exitViewRaw;

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

    // "d" = unified display: detail when loaded, else inbox item
    const d = exitView || selectedItem || {};

    // Helpers for null-safe display — LabourName is null in the API; EmployeeName holds it
    const labourDisplayName = d.LabourName || d.EmployeeName || '';
    const contractorDisplayName = d.ContractorName?.trim() || '';

    // ── Helpers ────────────────────────────────────────────────────────────────
    const getCurrentUser = () =>
        userData?.userName || userDetails?.userName || 'system';

    const getCurrentRoleName = () =>
        userDetails?.roleName        ||
        userData?.roleName           ||
        notificationData?.InboxTitle ||
        notificationData?.ModuleDisplayName ||
        'Labour Exit Verifier';

    const updateRemarksHistory = (existing, roleName, userName, comment) => {
        const formatted = `${roleName} : ${userName} : ${comment}`;
        if (!existing || existing.trim() === '') return formatted;
        return `${existing.trim()}||${formatted}`;
    };

    const uniqueStatuses = [...new Set(exitGrid.map(i => i.Status))].filter(Boolean);

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (roleId) {
            console.log('🎯 Initializing Labour Exit Verification — RoleID:', roleId);
            dispatch(fetchVerifyLBExit(roleId));
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
        if (selectedItem?.Id) {
            console.log('🔍 Fetching Labour Exit View — Id:', selectedItem.Id);
            dispatch(setSelectedId(selectedItem.Id));
            dispatch(fetchLBExitById({
                labourId: selectedItem.LabourId,
                id:       selectedItem.Id,
                roleId,
            }));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // ── Fetch status list after detail loads ──────────────────────────────────
    useEffect(() => {
        if (selectedItem && roleId && exitView?.MOID) {
            const moid = Number(exitView.MOID);
            console.log('📊 Fetching Status List — MOID:', moid, 'ROID:', roleId);
            dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        }
    }, [selectedItem, roleId, exitView?.MOID, dispatch]);

    // ── Fetch remarks ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (selectedItem && exitView?.MOID) {
            const moid = Number(exitView.MOID);
            const trno = String(exitView.Id || selectedItem.Id || '');
            console.log('💬 Fetching Remarks — trno:', trno, 'MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({ trno, moid }));
        }
    }, [selectedItem, exitView?.MOID, dispatch]);

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
            dispatch(fetchVerifyLBExit(roleId));
            if (selectedItem?.Id) {
                dispatch(fetchLBExitById({
                    labourId: selectedItem.LabourId,
                    id:       selectedItem.Id,
                    roleId,
                }));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected Labour Exit Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser     = getCurrentUser();
        const currentRoleName = getCurrentRoleName();
        const updatedRemarks  = updateRemarksHistory(
            exitView?.Remarks || '',
            currentRoleName, currentUser, verificationComment.trim()
        );
        const payload = {
            id:              exitView?.Id              || selectedItem?.Id              || '',
            costCenter:      exitView?.CostCenter      || exitView?.CCCode              || '',
            labourId:        exitView?.LabourId        || selectedItem?.LabourId        || '',
            groupId:         exitView?.GroupId         || selectedItem?.GroupId         || 0,
            resignationDate: exitView?.ResignationDate || selectedItem?.ResignationDate || '',
            relievingDate:   exitView?.RelievingDate   || selectedItem?.RelievingDate   || '',
            RoleId:          roleId,
            CreatedBy:       currentUser,
            Action:          actionValue,
            Note:            verificationComment.trim(),
            Remarks:         updatedRemarks,
        };
        console.log('📤 Labour Exit Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No exit record selected'); return; }
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
            const result  = await dispatch(approveLBExit(payload)).unwrap();

            // Only Data === "Submited" is a real success — anything else is a business-rule error
            const dataVal = result?.Data;
            const dataStr = typeof dataVal === 'string' ? dataVal : (result?.Message || '');
            const isRealSuccess = dataStr.toLowerCase() === 'submited';

            if (!isRealSuccess) {
                throw new Error(dataStr || `Failed to ${actionValue}`);
            }

            toast.success(`${action.text || actionValue} completed successfully!`);

            setTimeout(() => {
                dispatch(fetchVerifyLBExit(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearExitDetail());
                dispatch(resetApprovalData());
                dispatch(clearApproveResult());
            }, 1000);

        } catch (error) {
            console.error('❌ Labour Exit Approval Error:', error);
            const msg =
                (typeof error === 'string' ? error : null) ||
                error?.message ||
                `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredItems = exitGrid.filter(item => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            item.LabourName?.toLowerCase().includes(q) ||
            item.LabourId?.toLowerCase().includes(q)   ||
            String(item.Id).includes(q);
        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ── Stats cards ────────────────────────────────────────────────────────────
    const statsCards = [
        { icon: LogOut,       value: exitGrid.length,                   label: 'Total Records',        color: 'teal'    },
        { icon: Clock,        value: summary.pending || exitGrid.length, label: 'Pending Verification', color: 'emerald' },
        { icon: CalendarDays, value: d.ResignationDate || '-',           label: 'Resignation Date',     color: 'green'   },
        { icon: CalendarDays, value: d.RelievingDate   || '-',           label: 'Relieving Date',       color: 'cyan'    },
    ];

    // ── Left panel renderers ───────────────────────────────────────────────────
    const renderItemCard = (item) => {
        const itemName = item.LabourName || item.EmployeeName || 'Unknown';
        const itemContractor = item.ContractorName?.trim() || '';
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-teal-200 dark:border-teal-600 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-800/50 dark:to-emerald-800/50 flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {itemName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.LabourId}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span>Ref: {item.Id}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
                            {item.LabourType || 'Exit'}
                        </span>
                    </div>
                    {item.Category && (
                        <div className="flex items-center space-x-1">
                            <Briefcase className="w-3 h-3 text-emerald-400" />
                            <span className="truncate">{item.Category}</span>
                        </div>
                    )}
                    {item.CCName && (
                        <div className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3 text-teal-400" />
                            <span className="truncate">{item.CCName}</span>
                        </div>
                    )}
                    {itemContractor && (
                        <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-cyan-400" />
                            <span className="truncate">{itemContractor}</span>
                        </div>
                    )}
                    <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-teal-400" />
                        <span>Resignation: {item.ResignationDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        <span>Relieving: {item.RelievingDate || '—'}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-teal-200 dark:border-teal-600 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-800/50 dark:to-emerald-800/50 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
    );

    // ── Labour Exit Info Card ──────────────────────────────────────────────────
    const renderExitInfo = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-4 py-3">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Exit Information</span>
                </h3>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-700">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 mb-3 shadow">
                            <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Labour</p>
                        <p className="font-bold text-teal-700 dark:text-teal-300 text-sm">
                            {labourDisplayName || 'N/A'}
                        </p>
                        <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-0.5 font-medium">{d.LabourId}</p>
                        {d.DesignationName && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5 font-medium">{d.DesignationName}</p>
                        )}
                        {d.LabourType && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.LabourType}</p>
                        )}
                        {d.Category && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.Category}</p>
                        )}
                        {contractorDisplayName && (
                            <p className="text-xs text-cyan-500 dark:text-cyan-400 mt-0.5">{contractorDisplayName}</p>
                        )}
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-3 shadow">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Cost Center</p>
                        <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                            {d.CostCenter || d.CCCode || 'N/A'}
                        </p>
                        {d.CCName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.CCName}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Timeline ───────────────────────────────────────────────────────────────
    const renderTimeline = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-4 py-3">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Exit Details
                </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between px-5 py-3">
                    <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <Calendar className="w-4 h-4 text-teal-400" />
                        <span>Resignation Date</span>
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {d.ResignationDate || 'N/A'}
                    </span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                    <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span>Relieving Date</span>
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {d.RelievingDate || 'N/A'}
                    </span>
                </div>
                {d.LabourType && (
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <Users className="w-4 h-4 text-indigo-400" />
                            <span>Labour Type</span>
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {d.LabourType}
                        </span>
                    </div>
                )}
                {d.DesignationName && (
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <Briefcase className="w-4 h-4 text-indigo-400" />
                            <span>Designation</span>
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {d.DesignationName}
                        </span>
                    </div>
                )}
                {d.Category && (
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <Briefcase className="w-4 h-4 text-teal-400" />
                            <span>Category</span>
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {d.Category}
                        </span>
                    </div>
                )}
                {contractorDisplayName && (
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <Users className="w-4 h-4 text-cyan-400" />
                            <span>Contractor</span>
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {contractorDisplayName}
                        </span>
                    </div>
                )}
                {(d.NoticePereiodDays !== null && d.NoticePereiodDays !== undefined) && (
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span>Notice Period</span>
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {d.NoticePereiodDays} {d.NoticePereiodDays === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                )}
                {(d.DocType || d.DocName) && (
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <FileText className="w-4 h-4 text-teal-400" />
                            <span>Document</span>
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {d.DocName
                                ? <span title={d.DocName} className="flex items-center gap-1">
                                    <span className="truncate max-w-[180px]">{d.DocName}</span>
                                    {d.DocType && <span className="text-xs text-teal-500 uppercase bg-teal-50 dark:bg-teal-900/30 px-1.5 py-0.5 rounded">{d.DocType}</span>}
                                  </span>
                                : <span className="uppercase">{d.DocType}</span>
                            }
                        </span>
                    </div>
                )}
                {d.Remarks?.trim() && (
                    <div className="flex flex-col px-5 py-3 gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Remarks</span>
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
        const hasDetailData = !!exitView;

        return (
            <div className="space-y-6">

                {/* Loading indicator */}
                {detailsLoading && (
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600" />
                            <span className="text-teal-700 dark:text-teal-400 text-sm">Loading exit details...</span>
                        </div>
                    </div>
                )}

                {/* Hero header */}
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-teal-200 dark:border-teal-700">
                    <div className="flex items-start space-x-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <LogOut className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <UserCheck className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {labourDisplayName || 'Labour'}
                            </h2>
                            <p className="text-teal-600 dark:text-teal-400 font-semibold mb-1">
                                {d.LabourId} • Ref: {d.Id}
                            </p>
                            {d.DesignationName && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{d.DesignationName}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
                                    Labour Exit
                                </span>
                                {hasDetailData && d.MOID && (
                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                                        MOID: {d.MOID}
                                    </span>
                                )}
                                {d.LabourType && (
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {d.LabourType}
                                    </span>
                                )}
                                {d.Category && (
                                    <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium">
                                        {d.Category}
                                    </span>
                                )}
                                {contractorDisplayName && (
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                        {contractorDisplayName}
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-teal-200 dark:border-teal-700">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference ID</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.Id || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Labour ID</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.LabourId || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resignation Date</p>
                            <p className="text-sm font-bold text-teal-700 dark:text-teal-300">{d.ResignationDate || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Relieving Date</p>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{d.RelievingDate || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Exit info — gated on hasDetailData */}
                {hasDetailData
                    ? renderExitInfo()
                    : !detailsLoading && (
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600 text-center text-sm text-gray-400">
                            Loading exit details...
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
                        checkboxLabel: '✓ I have verified the labour exit details, dates, and supporting documents',
                        checkboxDescription: 'Including resignation date, relieving date, and labour information',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify the exit dates, labour details, and any discrepancies...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20',
                        commentBorder: 'border-teal-200 dark:border-teal-700'
                    }}
                />

                {/* Action buttons */}
                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
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
                            ℹ️ No actions available for this exit record
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
                title={`${InboxTitle || 'Labour Exit Verification'} (${exitGrid.length})`}
                subtitle={ModuleDisplayName}
                itemCount={exitGrid.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={LogOut}
                badgeText="Exit Verification"
                badgeCount={exitGrid.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, labour ID, ref no...',
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
                                emptyMessage: 'No labour exit records found!',
                                itemKey: 'Id',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20'
                            }}
                        />
                    </div>

                    {/* Detail panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
                                        <LogOut className="w-4 h-4 text-white" />
                                    </div>
                                    <span>{selectedItem ? 'Labour Exit Verification' : 'Exit Details'}</span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? renderDetailContent() : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <LogOut className="w-12 h-12 text-teal-500 dark:text-teal-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Exit Record Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a labour exit record from the list to view details and verify.
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

export default VerifyLabourExit;
