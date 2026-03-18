import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    CreditCard, Clock, Calendar, Hash,
    Building2, UserCheck, TrendingUp, Wallet,
    FileText, User, Briefcase, IndianRupee,
    ShieldCheck, AlertCircle, CheckCircle2,
} from 'lucide-react';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchAdvanceVerifyInbox,
    fetchAdvanceDetail,
    approveAdvanceRequest,
    setSelectedTransNo,
    clearApproveResult,
    clearAdvanceDetail,
    resetAll,
    selectVerifyInbox,
    selectVerifyInboxLoading,
    selectAdvanceDetail,
    selectAdvanceDetailLoading,
    selectApproveStatus,
    selectApproveLoading,
    selectSelectedTransNo,
} from '../../slices/HRSlice/staffAdvanceSlice';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val, dec = 2) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

// Determine advance type label from detail/item data
const getAdvanceType = (item) => {
    const t = (item?.AdvanceType || item?.AdvType || '').toString().toUpperCase();
    if (t === 'LTA') return 'LTA';
    if (t === 'SA')  return 'SA';
    return t || 'LTA';
};

// ─── Main Component ────────────────────────────────────────────────────────────
const VerifyStaffAdvance = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ── Selectors ─────────────────────────────────────────────────────────────
    const verifyInbox     = useSelector(selectVerifyInbox);
    const inboxLoading    = useSelector(selectVerifyInboxLoading);
    const advanceDetail   = useSelector(selectAdvanceDetail);
    const detailsLoading  = useSelector(selectAdvanceDetailLoading);
    const approveStatus   = useSelector(selectApproveStatus);
    const approvalLoading = useSelector(selectApproveLoading);
    const selectedTransNo = useSelector(selectSelectedTransNo);
    const remarks         = useSelector(selectRemarks);
    const remarksLoading  = useSelector(selectRemarksLoading);
    const statusLoading   = useSelector(selectStatusListLoading);
    const statusError     = useSelector(selectStatusListError);
    const enabledActions  = useSelector(selectEnabledActions);
    const hasActions      = useSelector(selectHasActions);

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
    const d = advanceDetail || selectedItem || {};

    // ── Helpers ────────────────────────────────────────────────────────────────
    const uniqueStatuses = [...new Set(verifyInbox.map(i => i.Status))].filter(Boolean);

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchAdvanceVerifyInbox(userRoleId));
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
        if (selectedItem?.TransactionRefNo) {
            dispatch(setSelectedTransNo(selectedItem.TransactionRefNo));
            dispatch(fetchAdvanceDetail({
                transNo:  selectedItem.TransactionRefNo,
                empRefno: selectedItem.EmployeeID || selectedItem.EmpRefno || '',
            }));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // ── Fetch remarks & status list when MOID available ───────────────────────
    useEffect(() => {
        if (selectedItem && userRoleId && advanceDetail?.MOID) {
            const moid = Number(advanceDetail.MOID);
            const trno = String(advanceDetail.TransactionRefNo || selectedItem.TransactionRefNo || '');
            dispatch(fetchStatusList({ MOID: moid, ROID: userRoleId, ChkAmt: 0 }));
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({ trno, moid }));
        }
    }, [selectedItem, userRoleId, advanceDetail?.MOID, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Also fetch remarks/status from inbox item MOID if detail not loaded yet
    useEffect(() => {
        if (selectedItem?.MOID && !advanceDetail?.MOID && userRoleId) {
            const moid = Number(selectedItem.MOID);
            const trno = String(selectedItem.TransactionRefNo || '');
            dispatch(fetchStatusList({ MOID: moid, ROID: userRoleId, ChkAmt: 0 }));
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({ trno, moid }));
        }
    }, [selectedItem, userRoleId, advanceDetail?.MOID, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

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
            dispatch(fetchAdvanceVerifyInbox(userRoleId));
            if (selectedItem?.TransactionRefNo) {
                dispatch(fetchAdvanceDetail({
                    transNo:  selectedItem.TransactionRefNo,
                    empRefno: selectedItem.EmployeeID || selectedItem.EmpRefno || '',
                }));
            }
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        return {
            EmpRefno:         advanceDetail?.EmpRefno         || selectedItem?.EmployeeID    || selectedItem?.EmpRefno || '',
            TransactionRefNo: advanceDetail?.TransactionRefNo || selectedItem?.TransactionRefNo || '',
            Action:           actionValue,
            RoleID:           userRoleId,
            Createdby:        userName,
            ApprovalNote:     verificationComment.trim(),
        };
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No advance request selected'); return; }
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
            const result  = await dispatch(approveAdvanceRequest(payload)).unwrap();

            const dataVal   = result?.Data;
            const dataStr   = typeof dataVal === 'string' ? dataVal : (result?.Message || '');
            const isSuccess = dataStr.toLowerCase().includes('submit');

            if (!isSuccess) throw new Error(dataStr || `Failed to ${actionValue}`);

            toast.success(`${action.text || actionValue} completed successfully!`);

            setTimeout(() => {
                dispatch(fetchAdvanceVerifyInbox(userRoleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearAdvanceDetail());
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
            item.EmployeName?.toLowerCase().includes(q)       ||
            item.EmployeeID?.toLowerCase().includes(q)        ||
            String(item.LTAAmount || '').includes(q)          ||
            String(item.TransactionRefNo || '').toLowerCase().includes(q);
        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ── Stats cards ────────────────────────────────────────────────────────────
    const statsCards = [
        { icon: CreditCard,   value: verifyInbox.length,             label: 'Total Pending',    color: 'indigo'  },
        { icon: Clock,        value: verifyInbox.length,             label: 'Awaiting Action',  color: 'purple'  },
        { icon: IndianRupee,  value: d.LTAAmount ? `₹${fmt(d.LTAAmount)}` : '—', label: 'Advance Amount', color: 'violet' },
        { icon: IndianRupee,  value: d.EMIAmount ? `₹${fmt(d.EMIAmount)}`  : '—', label: 'EMI Amount',     color: 'indigo'  },
    ];

    // ── Left panel renderers ───────────────────────────────────────────────────
    const renderItemCard = (item) => {
        const advType  = getAdvanceType(item);
        const isLTA    = advType === 'LTA';
        const badgeCls = isLTA
            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';

        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.EmployeName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.EmployeeID}
                        </p>
                    </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeCls}`}>
                            {advType}
                        </span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">
                            ₹{fmt(item.LTAAmount)}
                        </span>
                    </div>
                    {item.TransactionRefNo && (
                        <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-purple-400" />
                            <span className="truncate">Ref: {item.TransactionRefNo}</span>
                        </div>
                    )}
                    {item.RequestedDate && (
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-indigo-400" />
                            <span>{item.RequestedDate}</span>
                        </div>
                    )}
                    {item.Status && (
                        <div className="flex items-center space-x-1">
                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-medium">
                                {item.Status}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail sub-sections ────────────────────────────────────────────────────

    // Stat card — financial summary
    const FinStatCard = ({ label, value, icon: Icon, gradient, note }) => (
        <div className={`relative overflow-hidden rounded-xl p-4 text-white bg-gradient-to-br ${gradient} shadow-md`}>
            <div className="absolute top-0 right-0 w-14 h-14 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">{label}</p>
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                        <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                </div>
                <p className="text-xl font-black">₹{fmt(value)}</p>
                {note && <p className="text-[10px] text-white/70 mt-0.5">{note}</p>}
            </div>
        </div>
    );

    // Info row helper
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

    const renderAdvanceSummary = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-white" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Advance Summary</h3>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <FinStatCard
                        label="Advance Amount"
                        value={d.LTAAmount}
                        icon={Wallet}
                        gradient="from-indigo-500 to-purple-600"
                        note="Total advance"
                    />
                    <FinStatCard
                        label="EMI Amount"
                        value={d.EMIAmount}
                        icon={TrendingUp}
                        gradient="from-purple-500 to-indigo-600"
                        note="Per instalment"
                    />
                    <FinStatCard
                        label="Instalments"
                        value={d.NoOfInstallments || 0}
                        icon={Hash}
                        gradient="from-violet-500 to-purple-600"
                        note="Total count"
                    />
                    <FinStatCard
                        label="Balance EMIs"
                        value={d.NoOfBalanceInstallments || 0}
                        icon={Clock}
                        gradient="from-indigo-600 to-violet-700"
                        note="Remaining"
                    />
                </div>
            </div>
        </div>
    );

    const renderEmployeeAndCCInfo = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center gap-2">
                <User className="w-4 h-4 text-white" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Employee &amp; Cost Center</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <InfoRow icon={User}      label="Employee Name"  value={d.EmployeName  || d.EmployeeName}  accent="text-indigo-700 dark:text-indigo-300" />
                <InfoRow icon={Hash}      label="Employee ID"    value={d.EmpRefno     || d.EmployeeID}    accent="text-purple-700 dark:text-purple-300" />
                <InfoRow icon={Building2} label="CC Code"        value={d.CCCode}                          accent="text-violet-700 dark:text-violet-300" />
                <InfoRow icon={Briefcase} label="CC Name"        value={d.CCName}                          accent="text-indigo-700 dark:text-indigo-300" />
            </div>
        </div>
    );

    const renderAdvanceDetails = () => {
        const advType  = getAdvanceType(d);
        const isLTA    = advType === 'LTA';
        const badgeCls = isLTA
            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700';

        return (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white" />
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Advance Details</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {/* Advance type badge row */}
                    <div className="flex items-center justify-between px-5 py-3">
                        <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <CreditCard className="w-4 h-4 text-indigo-400" />
                            <span>Advance Type</span>
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeCls}`}>
                            {d.AdvanceType || advType}
                        </span>
                    </div>
                    <InfoRow icon={Calendar}    label="Requested Date"    value={d.RequestedDate}   accent="text-indigo-700 dark:text-indigo-300" />
                    <InfoRow icon={Calendar}    label="EMI Start Date"    value={d.EMIStartDate}    accent="text-purple-700 dark:text-purple-300" />
                    <InfoRow icon={FileText}    label="Transaction Ref"   value={d.TransactionRefNo} accent="text-violet-700 dark:text-violet-300" />
                    <InfoRow icon={FileText}    label="SA Deduct Month"   value={d.SADeductMonth}   accent="text-indigo-700 dark:text-indigo-300" />
                    {/* Purpose */}
                    {(d.EmpRemarks || d.Purpose) && (
                        <div className="px-5 py-3">
                            <span className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                <FileText className="w-4 h-4 text-indigo-400" />
                                <span>Purpose</span>
                            </span>
                            <p className="text-sm text-gray-800 dark:text-gray-200 pl-6 leading-relaxed">
                                {d.EmpRemarks || d.Purpose}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Eligibility check — only if EmpLTARuleData present
    const renderEligibilityCheck = () => {
        const rules = d.EmpLTARuleData;
        if (!rules) return null;

        const PASS_VALUES = ['pass', 'noneed', 'ctcexist', 'exist'];
        const isPass = (val) => PASS_VALUES.includes(String(val || '').toLowerCase());

        const ruleFields = [
            { key: 'ExperienceRule',   label: 'Experience Rule' },
            { key: 'AmountLimitRule',  label: 'Amount Limit Rule' },
            { key: 'NoticePeriodRule', label: 'Notice Period Rule' },
            { key: 'CTCStatus',        label: 'CTC Status' },
            { key: 'LTACreditCCStatus', label: 'LTA Credit CC Status' },
        ];

        return (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 py-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Eligibility Check</h3>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ruleFields.map(({ key, label }) => {
                            const val     = rules[key];
                            const passing = isPass(val);
                            return (
                                <div
                                    key={key}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                                        passing
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                    }`}
                                >
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                                    <span className={`flex items-center gap-1 text-xs font-bold ${passing ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                        {passing
                                            ? <CheckCircle2 className="w-3.5 h-3.5" />
                                            : <AlertCircle  className="w-3.5 h-3.5" />
                                        }
                                        {val || 'N/A'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // ── Full detail pane ───────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;
        const hasDetailData = !!advanceDetail;
        const advType       = getAdvanceType(d);
        const isLTA         = advType === 'LTA';

        return (
            <div className="space-y-6">

                {/* Loading */}
                {detailsLoading && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                            <span className="text-indigo-700 dark:text-indigo-400 text-sm">Loading advance details…</span>
                        </div>
                    </div>
                )}

                {/* Hero header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start space-x-4">
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <CreditCard className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <UserCheck className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                                {d.EmployeName || d.EmployeeName}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                {d.EmpRefno || d.EmployeeID}
                                {d.TransactionRefNo ? ` • Ref: ${d.TransactionRefNo}` : ''}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    isLTA
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                }`}>
                                    {advType} Advance
                                </span>
                                {hasDetailData && d.MOID && (
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                        MOID: {d.MOID}
                                    </span>
                                )}
                                {d.CCCode && (
                                    <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium">
                                        CC: {d.CCCode}
                                    </span>
                                )}
                                {d.Status && (
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {d.Status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick chips */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Advance Amount</p>
                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">₹{fmt(d.LTAAmount)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">EMI Amount</p>
                            <p className="text-sm font-bold text-purple-700 dark:text-purple-300">₹{fmt(d.EMIAmount)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Instalments</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.NoOfInstallments || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Requested Date</p>
                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{d.RequestedDate || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Detail sections — gated on hasDetailData */}
                {hasDetailData ? (
                    <>
                        {renderAdvanceSummary()}
                        {renderEmployeeAndCCInfo()}
                        {renderAdvanceDetails()}
                        {renderEligibilityCheck()}
                    </>
                ) : !detailsLoading && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600 text-center text-sm text-gray-400">
                        Loading advance details…
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
                        checkboxLabel: '✓ I have verified the advance request details, eligibility, and supporting documents',
                        checkboxDescription: 'Including advance amount, EMI schedule, purpose, and employee eligibility',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify the advance amount, EMI plan, eligibility checks, and any discrepancies…',
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
                        <p className="text-red-600 dark:text-red-400 text-center">⚠️ Error loading actions: {statusError}</p>
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                        <p className="text-yellow-700 dark:text-yellow-400 text-center">
                            ℹ️ No actions available for this advance request
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

            <InboxHeader
                title={`${InboxTitle || 'Staff Advance Verification'} (${verifyInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verifyInbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={CreditCard}
                badgeText="Advance"
                badgeCount={verifyInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, emp ID, ref no…',
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
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 shadow-indigo-500/20"
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
                                emptyMessage: 'No advance requests found!',
                                itemKey: 'TransactionRefNo',
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
                                        <CreditCard className="w-4 h-4 text-white" />
                                    </div>
                                    <span>{selectedItem ? 'Staff Advance Verification' : 'Advance Details'}</span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? renderDetailContent() : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Request Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a staff advance request from the list to view the details and take action.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyStaffAdvance;
