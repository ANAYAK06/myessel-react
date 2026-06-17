import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, Users, Calendar,
    DollarSign, Building2, AlertCircle,
    ChevronDown, ChevronUp, Banknote, TrendingDown,
    ShieldCheck, Layers
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchPayrollInbox,
    fetchPayrollDetailForVerification,
    submitApproveLabourPayroll,
    clearApproveResult,
    clearVerifyDetail,
} from '../../slices/labourPayrollSlice/labourPayrollSlice';

import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID,
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectStatusListLoading,
    resetApprovalData,
    setShowReturnButton,
} from '../../slices/CommonSlice/getStatusSlice';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const fmt = (v) => (v == null ? '—' : Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

// ─── Main component ────────────────────────────────────────────────────────────
const VerifyLabourPayRoll = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ── Selectors ──
    const inbox          = useSelector((s) => s.labourPayroll.inbox);
    const inboxLoading   = useSelector((s) => s.labourPayroll.inboxLoading);
    const inboxError     = useSelector((s) => s.labourPayroll.inboxError);
    const verifyDetail   = useSelector((s) => s.labourPayroll.verifyDetail);
    const detailLoading  = useSelector((s) => s.labourPayroll.verifyDetailLoading);
    const detailError    = useSelector((s) => s.labourPayroll.verifyDetailError);
    const approveLoading = useSelector((s) => s.labourPayroll.approveLoading);
    const remarks        = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);
    const enabledActions = useSelector(selectEnabledActions);
    const { userData, userDetails } = useSelector((s) => s.auth);
    const roleId = userData?.roleId || userData?.RID;

    // ── Local state ──
    const [selectedItem,         setSelectedItem]         = useState(null);
    const [isVerified,           setIsVerified]           = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [filterCC,             setFilterCC]             = useState('All');
    const [filterMonth,          setFilterMonth]          = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]  = useState(false);
    const [expandedCategory,     setExpandedCategory]     = useState(true);
    const [expandedWorkers,      setExpandedWorkers]      = useState(false);

    const currentUser = userData?.userName || userDetails?.userName || 'system';
    const currentRole = userDetails?.roleName || userData?.roleName || notificationData?.InboxTitle || 'Payroll Verifier';
    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ── Init ──
    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        if (roleId) dispatch(fetchPayrollInbox(roleId));
        return () => {
            dispatch(clearApproveResult());
            dispatch(clearVerifyDetail());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    // ── Fetch detail when item selected ──
    useEffect(() => {
        if (!selectedItem?.PayrollId) return;
        dispatch(fetchPayrollDetailForVerification(selectedItem.PayrollId));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
        setExpandedWorkers(false);
    }, [selectedItem, dispatch]);

    // ── Fetch status & remarks when detail loads ──
    useEffect(() => {
        if (!selectedItem || !roleId || !verifyDetail) return;
        const moid = verifyDetail?.Header?.MOID || verifyDetail?.MOID || 648;
        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        dispatch(setSelectedMOID(moid));
        dispatch(fetchRemarks({
            trno: verifyDetail?.Header?.NotifRefno || selectedItem?.NotifRefno || '',
            moid,
        }));
    }, [selectedItem, roleId, verifyDetail, dispatch]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Filters ──
    const costCentres = useMemo(() => ['All', ...new Set(inbox.map(i => i.CCName).filter(Boolean))], [inbox]);
    const months      = useMemo(() => ['All', ...new Set(inbox.map(i => i.MonthYear || `${i.PayrollMonth}/${i.PayrollYear}`).filter(Boolean))], [inbox]);

    const filteredInbox = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return inbox.filter(item => {
            const monthYear  = item.MonthYear || `${item.PayrollMonth}/${item.PayrollYear}`;
            const matchCC    = filterCC    === 'All' || item.CCName === filterCC;
            const matchMonth = filterMonth === 'All' || monthYear   === filterMonth;
            const matchQ     = !q
                || (item.CCName || '').toLowerCase().includes(q)
                || (item.TransactionRefNo || '').toLowerCase().includes(q)
                || String(item.TotalWorkers || '').includes(q);
            return matchCC && matchMonth && matchQ;
        });
    }, [inbox, filterCC, filterMonth, searchQuery]);

    // ── Stats cards ──
    const statsCards = useMemo(() => [
        { icon: Clock,    value: inbox.length, label: 'Pending',       color: 'indigo' },
        { icon: Users,    value: inbox.reduce((s, i) => s + (i.TotalWorkers || 0), 0), label: 'Total Workers', color: 'blue' },
        { icon: Banknote, value: `₹${(inbox.reduce((s, i) => s + (i.TotalGrossAmount || 0), 0) / 100000).toFixed(1)}L`, label: 'Gross Payable', color: 'purple' },
    ], [inbox]);

    // ── Handlers ──
    const handleItemSelect = (item) => {
        dispatch(clearVerifyDetail());
        setSelectedItem(item);
    };

    const handleRefresh = () => {
        if (roleId) dispatch(fetchPayrollInbox(roleId));
        if (selectedItem?.PayrollId) dispatch(fetchPayrollDetailForVerification(selectedItem.PayrollId));
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No payroll record selected'); return; }
        if (!verificationComment?.trim()) { toast.error('Verification comment is mandatory before proceeding.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox to confirm you have reviewed the payroll.'); return; }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        const hdr = verifyDetail?.Header || {};

        const payload = {
            PayrollId:         hdr.PayrollId || selectedItem.PayrollId,
            TransactionRefNo:  hdr.TransactionRefNo || selectedItem.TransactionRefNo || '',
            ConslidateTransNo: hdr.ConslidateTransNo || 0,
            Note:              verificationComment.trim(),
            Action:            actionValue,
            RoleId:            roleId,
            CreatedBy:         currentUser,
        };

        try {
            const result = await dispatch(submitApproveLabourPayroll(payload)).unwrap();
            // result is { Result: "SUCCESS_...", Message: "..." }
            toast.success(result?.Message || `${actionValue} completed successfully!`);
            setTimeout(() => {
                dispatch(fetchPayrollInbox(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearVerifyDetail());
                dispatch(resetApprovalData());
                dispatch(clearApproveResult());
            }, 800);
        } catch (err) {
            const errMsg = typeof err === 'string' ? err : (err?.message || err?.Message || `Failed to ${actionValue.toLowerCase()}`);
            toast.error(errMsg, { autoClose: 8000 });
        }
    };

    // ── Data shortcuts ──
    const hdr  = verifyDetail?.Header || null;
    const cats = verifyDetail?.CategoryBreakdown || [];
    const wkrs = verifyDetail?.Workers || verifyDetail?.Details || [];

    // ── Left panel card renderers ──
    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.CCName || 'Cost Centre'}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.TransactionRefNo}</p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.MonthYear || `${MONTH_NAMES[(item.PayrollMonth || 1) - 1]} ${item.PayrollYear}`}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                        Payroll
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{item.TotalWorkers} workers</span>
                </div>
            </div>
        </div>
    );

    const renderCollapsedItem = (item) => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail content ──
    const renderDetailContent = () => {
        if (!selectedItem) return null;

        return (
            <div className="space-y-6">
                {detailLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                        <span className="text-blue-700 dark:text-blue-400 text-sm">Loading payroll details…</span>
                    </div>
                )}

                {detailError && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700 flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{detailError}</p>
                    </div>
                )}

                {hdr && (
                    <>
                        {/* ── Header card ── */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex items-start space-x-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                        <Building2 className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {hdr.CCName || selectedItem.CCName}
                                        </h2>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                                            {hdr.TransactionRefNo}
                                            {hdr.ConslidateTransNo && <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">| {hdr.ConslidateTransNo}</span>}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                {MONTH_NAMES[(hdr.PayrollMonth || 1) - 1]} {hdr.PayrollYear}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                {hdr.TotalWorkers} Workers
                                            </span>
                                            {hdr.WorkingDays && (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {hdr.WorkingDays} Working Days
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Payable</p>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        ₹{fmt(hdr.TotalNetPayable)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generated by: <strong>{hdr.GeneratedBy}</strong></p>
                                </div>
                            </div>

                            {/* Summary figures */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-indigo-200 dark:border-indigo-700">
                                {[
                                    { label: 'Gross Payable',    value: fmt(hdr.TotalGrossAmount),      icon: <DollarSign size={14} />,  color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20'    },
                                    { label: 'Basic Payable',    value: fmt(hdr.TotalBasicPayable),    icon: <Banknote size={14} />,    color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                                    { label: 'Total Deductions', value: fmt((hdr.TotalPFEmployee || 0) + (hdr.TotalESIEmployee || 0) + (hdr.TotalPTAmount || 0) + (hdr.TotalLWFEmployee || 0) + (hdr.TotalAdvance || 0)), icon: <TrendingDown size={14} />, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                                    { label: 'Net Payable',      value: fmt(hdr.TotalNetPayable),     icon: <ShieldCheck size={14} />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                                ].map(({ label, value, icon, color, bg }) => (
                                    <div key={label} className={`${bg} rounded-xl p-3`}>
                                        <div className={`flex items-center gap-1 text-xs mb-1 ${color}`}>{icon}<span>{label}</span></div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">₹{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* PF / ESI rates */}
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                {[
                                    { k: 'PF (Emp)',    v: hdr.PFEmpPct },
                                    { k: 'PF (Empr)',   v: hdr.PFEmprPct },
                                    { k: 'ESI (Emp)',   v: hdr.ESIEmpPct },
                                    { k: 'ESI (Empr)',  v: hdr.ESIEmprPct },
                                ].filter(x => x.v != null).map(({ k, v }) => (
                                    <span key={k} className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                        {k}: <strong>{v}%</strong>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ── Category Breakdown ── */}
                        {cats.length > 0 && (() => {
                            const hasPT  = !!hdr.PTApply;
                            const hasLWF = !!hdr.LWFApply;
                            return (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedCategory(p => !p)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                            <Layers size={13} className="text-white" />
                                        </div>
                                        Category-wise Breakdown
                                    </span>
                                    {expandedCategory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                                {expandedCategory && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-700">
                                                <tr>
                                                    {[
                                                        'Category','Workers','Basic Payable','Allowance Payable',
                                                        'PF (Emp)','ESI (Emp)',
                                                        ...(hasPT  ? ['PT (Emp)']  : []),
                                                        ...(hasLWF ? ['LWF (Emp)'] : []),
                                                        'Advance','Net Pay',
                                                    ].map(h => (
                                                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-white whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {cats.map((c, i) => (
                                                    <tr key={c.Category || i} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                                                        <td className="px-3 py-2.5">
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">{c.Category}</span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center font-semibold text-blue-700 dark:text-blue-300">{c.WorkerCount}</td>
                                                        <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">{fmt(c.BasicPayable)}</td>
                                                        <td className="px-3 py-2.5 text-right text-purple-700 dark:text-purple-300">{fmt(c.AllowancePayable)}</td>
                                                        <td className="px-3 py-2.5 text-right text-red-600 dark:text-red-400">{fmt(c.PFEmployee)}</td>
                                                        <td className="px-3 py-2.5 text-right text-red-600 dark:text-red-400">{fmt(c.ESIEmployee)}</td>
                                                        {hasPT  && <td className="px-3 py-2.5 text-right text-teal-600 dark:text-teal-400">{fmt(c.PTAmount)}</td>}
                                                        {hasLWF && <td className="px-3 py-2.5 text-right text-rose-600 dark:text-rose-400">{fmt(c.LWFEmployee)}</td>}
                                                        <td className="px-3 py-2.5 text-right text-orange-600 dark:text-orange-400">{fmt(c.Advance)}</td>
                                                        <td className="px-3 py-2.5 text-right font-bold text-green-700 dark:text-green-400">{fmt(c.NetPayable)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            {cats.length > 1 && (
                                                <tfoot className="bg-indigo-50 dark:bg-indigo-900/20 border-t-2 border-indigo-200 dark:border-indigo-700">
                                                    <tr>
                                                        <td className="px-3 py-2.5 font-bold text-indigo-700 dark:text-indigo-300">Total</td>
                                                        <td className="px-3 py-2.5 text-center font-bold text-blue-700 dark:text-blue-300">{hdr.TotalWorkers}</td>
                                                        <td className="px-3 py-2.5 text-right font-bold text-gray-800 dark:text-gray-200">{fmt(hdr.TotalBasicPayable)}</td>
                                                        <td className="px-3 py-2.5 text-right font-bold text-purple-700 dark:text-purple-300">{fmt(hdr.TotalAllowancePayable)}</td>
                                                        <td className="px-3 py-2.5 text-right font-bold text-red-600 dark:text-red-400">{fmt(hdr.TotalPFEmployee)}</td>
                                                        <td className="px-3 py-2.5 text-right font-bold text-red-600 dark:text-red-400">{fmt(hdr.TotalESIEmployee)}</td>
                                                        {hasPT  && <td className="px-3 py-2.5 text-right font-bold text-teal-600 dark:text-teal-400">{fmt(hdr.TotalPTAmount)}</td>}
                                                        {hasLWF && <td className="px-3 py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">{fmt(hdr.TotalLWFEmployee)}</td>}
                                                        <td className="px-3 py-2.5 text-right font-bold text-orange-600 dark:text-orange-400">{fmt(hdr.TotalAdvance)}</td>
                                                        <td className="px-3 py-2.5 text-right font-bold text-green-700 dark:text-green-400">{fmt(hdr.TotalNetPayable)}</td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                )}
                            </div>
                            );
                        })()}

                        {/* ── Worker-wise Breakdown (inline) ── */}
                        {wkrs.length > 0 && (() => {
                            const hasPT  = !!hdr.PTApply;
                            const hasLWF = !!hdr.LWFApply;
                            const totalCols = 11 + (hasPT ? 1 : 0) + (hasLWF ? 1 : 0);
                            return (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedWorkers(p => !p)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                            <Users size={13} className="text-white" />
                                        </div>
                                        Worker-wise Breakdown ({wkrs.length})
                                    </span>
                                    {expandedWorkers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                                {expandedWorkers && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gradient-to-r from-purple-600 to-indigo-700">
                                                <tr>
                                                    {[
                                                        '#','Labour ID','Name','Category','Days',
                                                        'Basic Payable','Allowance Payable',
                                                        'PF (Emp)','ESI (Emp)',
                                                        ...(hasPT  ? ['PT (Emp)']  : []),
                                                        ...(hasLWF ? ['LWF (Emp)'] : []),
                                                        'Advance','Net Pay',
                                                    ].map(h => (
                                                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-white whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {(() => {
                                                    const rows = [];
                                                    let lastGroupKey = null;
                                                    let rowNum = 0;
                                                    wkrs.forEach((w, i) => {
                                                        const isOwn = !w.LabourType || w.LabourType === 'Own Labour';
                                                        const groupKey = isOwn ? '__own__' : `__ctr__${w.ContractorName || ''}`;
                                                        if (groupKey !== lastGroupKey) {
                                                            lastGroupKey = groupKey;
                                                            rows.push(
                                                                <tr key={`grp-${groupKey}-${i}`} className="bg-purple-50/80 dark:bg-purple-900/20">
                                                                    <td colSpan={totalCols} className="px-3 py-1.5 border-t-2 border-purple-200 dark:border-purple-700">
                                                                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                                                                            {isOwn ? 'Own Labour' : `Contractor — ${w.ContractorName || 'Unknown'}`}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                        rowNum++;
                                                        rows.push(
                                                            <tr key={w.LabourId || i} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                                                                <td className="px-3 py-2 text-gray-400">{rowNum}</td>
                                                                <td className="px-3 py-2 font-mono text-indigo-700 dark:text-indigo-300">{w.LabourId}</td>
                                                                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 whitespace-nowrap font-medium">{w.LabourName}</td>
                                                                <td className="px-3 py-2">
                                                                    <span className="px-1.5 py-0.5 rounded text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">{w.Category}</span>
                                                                </td>
                                                                <td className="px-3 py-2 text-center text-blue-700 dark:text-blue-300 font-semibold">{w.DaysWorked}</td>
                                                                <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{fmt(w.BasicPayable)}</td>
                                                                <td className="px-3 py-2 text-right text-purple-700 dark:text-purple-300">{fmt(w.AllowancePayable)}</td>
                                                                <td className="px-3 py-2 text-right text-red-600 dark:text-red-400">{fmt(w.PFEmployee)}</td>
                                                                <td className="px-3 py-2 text-right text-red-600 dark:text-red-400">{fmt(w.ESIEmployee)}</td>
                                                                {hasPT  && <td className="px-3 py-2 text-right text-teal-600 dark:text-teal-400">{fmt(w.PTAmount)}</td>}
                                                                {hasLWF && <td className="px-3 py-2 text-right text-rose-600 dark:text-rose-400">{fmt(w.LWFEmployee)}</td>}
                                                                <td className="px-3 py-2 text-right text-orange-600 dark:text-orange-400">{fmt(w.Advance)}</td>
                                                                <td className="px-3 py-2 text-right font-bold text-green-700 dark:text-green-400">{fmt(w.NetPayable)}</td>
                                                            </tr>
                                                        );
                                                    });
                                                    return rows;
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            );
                        })()}
                    </>
                )}

                {/* ── Remarks History ── */}
                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(p => !p)}
                    remarks={remarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                {/* ── Verification Input ── */}
                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have reviewed the payroll and confirm its accuracy',
                        checkboxDescription: 'Including all worker details, deductions, and net payable amounts',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Enter your verification comments before proceeding...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-indigo-200 dark:border-indigo-700',
                    }}
                />

                {/* ── Action Buttons ── */}
                <ActionButtons
                    actions={enabledActions}
                    onActionClick={handleActionClick}
                    loading={approveLoading}
                    isVerified={isVerified}
                    comment={verificationComment}
                    showValidation={true}
                />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <InboxHeader
                title={`${InboxTitle || 'Labour Payroll Verification'} (${inbox.length})`}
                subtitle={ModuleDisplayName || 'Review and approve generated payrolls'}
                itemCount={inbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Building2}
                badgeText="Labour Payroll"
                badgeCount={inbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by cost centre, ref no...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                filters={[
                    {
                        value: filterCC,
                        onChange: (e) => setFilterCC(e.target.value),
                        defaultLabel: 'All Cost Centres',
                        options: costCentres.filter(c => c !== 'All'),
                    },
                    {
                        value: filterMonth,
                        onChange: (e) => setFilterMonth(e.target.value),
                        defaultLabel: 'All Months',
                        options: months.filter(m => m !== 'All'),
                    },
                ]}
            />

            {/* ── Stats ── */}
            <div className="px-6 mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-3"
                    gap="gap-4"
                />
            </div>

            {/* ── Body ── */}
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
                    {/* Left Panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <LeftPanel
                            items={filteredInbox}
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
                                emptyMessage: 'No pending payrolls for verification',
                                itemKey: 'PayrollId',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                            }}
                        />
                    </div>

                    {/* Right Detail Panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span>{selectedItem ? 'Payroll Verification' : 'Payroll Details'}</span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Payroll Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a payroll record from the list to review and verify.
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

export default VerifyLabourPayRoll;
