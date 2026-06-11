import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Target, User, Building2, Calendar, FileText,
    Clock, Briefcase, CheckCircle2, ShieldCheck,
    AlertCircle, IndianRupee,
} from 'lucide-react';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchAppraisalVerifyInbox,
    fetchAppraisalDetail,
    approveAppraisalObjective,
    setSelectedId,
    clearApproveResult,
    clearAppraisalDetail,
    resetAll,
    selectVerifyInbox,
    selectVerifyInboxLoading,
    selectAppraisalDetail,
    selectAppraisalDetailLoading,
    selectApproveStatus,
    selectApproveLoading,
    selectSelectedId,
} from '../../slices/HRSlice/staffAppraisalSlice';

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

// ─── Month name helper ─────────────────────────────────────────────────────────
const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const getMonthName = (m) => {
    const n = parseInt(m, 10);
    return MONTH_NAMES[n] || m || '—';
};

// ─── Main Component ────────────────────────────────────────────────────────────
const VerifyStaffAppraisal = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ── Selectors ─────────────────────────────────────────────────────────────
    const verifyInbox       = useSelector(selectVerifyInbox);
    const inboxLoading      = useSelector(selectVerifyInboxLoading);
    const appraisalDetail   = useSelector(selectAppraisalDetail);
    const detailsLoading    = useSelector(selectAppraisalDetailLoading);
    const approveStatus     = useSelector(selectApproveStatus);
    const approvalLoading   = useSelector(selectApproveLoading);
    const selectedId        = useSelector(selectSelectedId);
    const remarks           = useSelector(selectRemarks);
    const remarksLoading    = useSelector(selectRemarksLoading);
    const statusLoading     = useSelector(selectStatusListLoading);
    const statusError       = useSelector(selectStatusListError);
    const enabledActions    = useSelector(selectEnabledActions);
    const hasActions        = useSelector(selectHasActions);

    const { userData } = useSelector((s) => s.auth);
    const userName    = userData?.userName || userData?.username || 'User';
    const userRoleId  = userData?.roleId   || userData?.RID      || 0;

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

    // Unified display object — prefer loaded detail, fall back to list item
    const d = appraisalDetail || selectedItem || {};

    // ── Helpers ────────────────────────────────────────────────────────────────
    const uniqueStatuses = [...new Set(verifyInbox.map(i => i.Status))].filter(Boolean);

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchAppraisalVerifyInbox(userRoleId));
        }
    }, [userRoleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
            dispatch(clearApproveResult());
        };
    }, [dispatch]);

    // ── Fetch detail when item selected ───────────────────────────────────────
    useEffect(() => {
        if (selectedItem) {
            const id       = selectedItem.Id       || selectedItem.ID       || selectedItem.id;
            const empRefNo = selectedItem.EmpRefNo || selectedItem.EmployeeID || selectedItem.EmpRefno || '';
            if (id) {
                dispatch(setSelectedId(id));
                dispatch(fetchAppraisalDetail({ id, empRefNo }));
            }
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // ── Fetch remarks & status list when MOID available ───────────────────────
    useEffect(() => {
        if (selectedItem && userRoleId && appraisalDetail?.MOID) {
            const moid = Number(appraisalDetail.MOID);
            const trno = String(appraisalDetail.Id || selectedItem.Id || '');
            dispatch(fetchStatusList({ MOID: moid, ROID: userRoleId, ChkAmt: 0 }));
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({ trno, moid }));
        }
    }, [selectedItem, userRoleId, appraisalDetail?.MOID, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Also fetch remarks/status from inbox item MOID if detail not loaded yet
    useEffect(() => {
        if (selectedItem?.MOID && !appraisalDetail?.MOID && userRoleId) {
            const moid = Number(selectedItem.MOID);
            const trno = String(selectedItem.Id || '');
            dispatch(fetchStatusList({ MOID: moid, ROID: userRoleId, ChkAmt: 0 }));
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({ trno, moid }));
        }
    }, [selectedItem, userRoleId, appraisalDetail?.MOID, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auto-collapse left panel on selection ─────────────────────────────────
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleRefresh = () => {
        if (userRoleId) {
            dispatch(fetchAppraisalVerifyInbox(userRoleId));
            if (selectedItem) {
                const id       = selectedItem.Id       || selectedItem.ID       || selectedItem.id;
                const empRefNo = selectedItem.EmpRefNo || selectedItem.EmployeeID || selectedItem.EmpRefno || '';
                if (id) dispatch(fetchAppraisalDetail({ id, empRefNo }));
            }
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const empRefNo = appraisalDetail?.EmpRefNo || appraisalDetail?.EmpRefno || selectedItem?.EmpRefNo || selectedItem?.EmployeeID || '';
        return {
            EmpRefNo:  empRefNo,
            Id:        appraisalDetail?.Id  || selectedItem?.Id  || selectedItem?.ID  || 0,
            Remarks:   verificationComment.trim(),
            Year:      appraisalDetail?.Year  || selectedItem?.Year  || 0,
            Month:     appraisalDetail?.Month || selectedItem?.Month || 0,
            CCCode:    appraisalDetail?.JoiningCostCenter || appraisalDetail?.CCCode || selectedItem?.CCCode || '',
            RoleId:    userRoleId,
            Createdby: userName,
            Action:    actionValue,
            Note:      verificationComment.trim(),
        };
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No appraisal record selected'); return; }
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
            const result  = await dispatch(approveAppraisalObjective(payload)).unwrap();

            const dataVal   = result?.Data;
            const dataStr   = typeof dataVal === 'string' ? dataVal : (result?.Message || '');
            const isSuccess = dataStr.toLowerCase().includes('submit');

            if (!isSuccess) throw new Error(dataStr || `Failed to ${actionValue}`);

            toast.success(`${action.text || actionValue} completed successfully!`);

            setTimeout(() => {
                dispatch(fetchAppraisalVerifyInbox(userRoleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearAppraisalDetail());
                dispatch(resetApprovalData());
                dispatch(clearApproveResult());
            }, 1000);

        } catch (error) {
            const msg =
                (typeof error === 'string' ? error : null) ||
                error?.message ||
                `Failed to ${action.text?.toLowerCase() || actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredItems = verifyInbox.filter(item => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            item.EmployeName?.toLowerCase().includes(q) ||
            item.EmployeeName?.toLowerCase().includes(q) ||
            item.EmpRefNo?.toLowerCase().includes(q)     ||
            item.EmployeeID?.toLowerCase().includes(q)   ||
            String(item.Year  || '').includes(q)         ||
            String(item.Month || '').includes(q);
        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ── Stats cards ────────────────────────────────────────────────────────────
    const statsCards = [
        { icon: Target,    value: verifyInbox.length,                     label: 'Total Pending',   color: 'indigo'   },
        { icon: Clock,     value: verifyInbox.length,                     label: 'Awaiting Action', color: 'purple'   },
        { icon: Calendar,  value: d.Year  || selectedItem?.Year  || '—',  label: 'Year',            color: 'indigo'   },
        { icon: Calendar,  value: d.Month ? getMonthName(d.Month) : '—',  label: 'Month',           color: 'purple'   },
    ];

    // ── Left panel item card ───────────────────────────────────────────────────
    const renderItemCard = (item) => {
        const empName = item.EmployeName || item.EmployeeName || item.Name || '—';
        const empId   = item.EmpRefNo    || item.EmployeeID   || '—';

        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {empName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {empId}
                        </p>
                    </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {(item.DesignatedAs || item.Designation) && (
                        <div className="flex items-center space-x-1">
                            <Briefcase className="w-3 h-3 text-indigo-400" />
                            <span className="truncate">{item.DesignatedAs || item.Designation}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        {item.Year && item.Month ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                {getMonthName(item.Month)} {item.Year}
                            </span>
                        ) : null}
                        {item.Status && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-medium">
                                {item.Status}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Info row helper ────────────────────────────────────────────────────────
    const InfoRow = ({ icon: Icon, label, value, accent = 'text-indigo-700 dark:text-indigo-300' }) => (
        <div className="flex items-center justify-between px-5 py-3">
            <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{label}</span>
            </span>
            <span className={`text-sm font-semibold ${accent} text-right max-w-[55%] truncate`}>
                {value || 'N/A'}
            </span>
        </div>
    );

    // ── Detail sub-sections ────────────────────────────────────────────────────
    const renderEmployeeInfo = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center gap-2">
                <User className="w-4 h-4 text-white" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Employee Information</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <InfoRow icon={User}      label="Employee Name"  value={d.EmployeName  || d.EmployeeName  || d.Name}          accent="text-indigo-700 dark:text-indigo-300" />
                <InfoRow icon={User}      label="Employee ID"    value={d.EmpRefNo     || d.EmpRefno      || d.EmployeeID}    accent="text-purple-700 dark:text-purple-300" />
                <InfoRow icon={Briefcase} label="Category"       value={d.Category}                                           accent="text-indigo-700 dark:text-indigo-300" />
                <InfoRow icon={Target}    label="Designated As"  value={d.DesignatedAs || d.Designation}                     accent="text-purple-700 dark:text-purple-300" />
                <InfoRow icon={Building2} label="Department"     value={d.Department}                                         accent="text-indigo-700 dark:text-indigo-300" />
            </div>
        </div>
    );

    const renderAppraisalPeriodAndCC = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Appraisal Period &amp; Details</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <InfoRow icon={Calendar}  label="Year"              value={d.Year  ? String(d.Year)  : '—'}                  accent="text-indigo-700 dark:text-indigo-300" />
                <InfoRow icon={Calendar}  label="Month"             value={d.Month ? getMonthName(d.Month) : '—'}            accent="text-purple-700 dark:text-purple-300" />
                <InfoRow icon={Building2} label="Cost Centre (CC)"  value={d.JoiningCostCenter || d.CCCode}                  accent="text-indigo-700 dark:text-indigo-300" />
                {d.LastAppraisalDate && (
                    <InfoRow icon={Clock} label="Last Appraisal Date" value={d.LastAppraisalDate}                            accent="text-purple-700 dark:text-purple-300" />
                )}
            </div>
        </div>
    );

    const renderRemarksSection = () => {
        const remarksText = d.Remarks || d.EmpRemarks || d.Goals || d.Objectives;
        if (!remarksText) return null;
        return (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 py-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white" />
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Objectives &amp; Remarks</h3>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {remarksText}
                    </p>
                </div>
            </div>
        );
    };

    // ── Full detail pane ───────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;
        const hasDetailData = !!appraisalDetail;
        const empName = d.EmployeName || d.EmployeeName || d.Name || '—';
        const empId   = d.EmpRefNo    || d.EmpRefno    || d.EmployeeID || '—';

        return (
            <div className="space-y-6">

                {/* Loading */}
                {detailsLoading && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                            <span className="text-indigo-700 dark:text-indigo-400 text-sm">Loading appraisal details…</span>
                        </div>
                    </div>
                )}

                {/* Hero header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start space-x-4">
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <ShieldCheck className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                                {empName}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                {empId}
                                {(d.DesignatedAs || d.Designation) ? ` · ${d.DesignatedAs || d.Designation}` : ''}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {d.Year && d.Month && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                        {getMonthName(d.Month)} {d.Year}
                                    </span>
                                )}
                                {d.CCCode && (
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                        CC: {d.CCCode}
                                    </span>
                                )}
                                {d.MOID && (
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        MOID: {d.MOID}
                                    </span>
                                )}
                                {d.Status && (
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                        {d.Status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick chips */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employee</p>
                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 truncate">{empName}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
                            <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{d.Category || '—'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Year</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.Year || '—'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Month</p>
                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{d.Month ? getMonthName(d.Month) : '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Detail sections — gated on hasDetailData */}
                {hasDetailData ? (
                    <>
                        {renderEmployeeInfo()}
                        {renderAppraisalPeriodAndCC()}
                        {renderRemarksSection()}
                    </>
                ) : !detailsLoading && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600 text-center text-sm text-gray-400">
                        Loading appraisal details…
                    </div>
                )}

                {/* Remarks history */}
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
                        checkboxLabel: '✓ I have verified the appraisal objectives, employee details, and the appraisal period',
                        checkboxDescription: 'Including objectives, goals, employee designation, department, and cost centre',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify the appraisal objectives, goals, and any discrepancies…',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        commentGradient:  'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        commentBorder:    'border-indigo-200 dark:border-indigo-700',
                    }}
                />

                {/* Action buttons */}
                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                            <span className="text-gray-600 dark:text-gray-400">Loading actions…</span>
                        </div>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                        <p className="text-red-600 dark:text-red-400 text-center">Warning: Error loading actions: {statusError}</p>
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                        <p className="text-yellow-700 dark:text-yellow-400 text-center">
                            No actions available for this appraisal objective
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
                title={`${InboxTitle || 'Appraisal Objective Verification'} (${verifyInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verifyInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Target}
                badgeText="Appraisal"
                badgeCount={verifyInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, emp ID, year…',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                filters={[
                    {
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        defaultLabel: 'All Statuses',
                        options: uniqueStatuses,
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
                            error={null}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No appraisal objectives found!',
                                itemKey: 'Id',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                            }}
                        />
                    </div>

                    {/* Detail panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                        <Target className="w-4 h-4 text-white" />
                                    </div>
                                    <span>{selectedItem ? 'Appraisal Objective Verification' : 'Appraisal Details'}</span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? renderDetailContent() : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Target className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Record Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select an appraisal objective from the list to view the details and take action.
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

export default VerifyStaffAppraisal;
