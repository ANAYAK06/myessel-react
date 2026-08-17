import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    BadgeDollarSign, Clock, Hash,
    Building2, UserCheck, Award, FileText, User,
    IndianRupee,
} from 'lucide-react';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import InboxSplitLayout from '../../components/Inbox/InboxSplitLayout';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifyFinalSalary,
    fetchFinalSalaryById,
    approveFinalSalary,
    setSelectedId,
    clearApproveResult,
    clearFinalSalaryDetail,
    resetAll,
    selectVerifyGridListArray,
    selectFinalSalaryViewData,
    selectVerifyGridListLoading,
    selectFinalSalaryViewDataLoading,
    selectApproveLoading,
    selectVerifyGridListError,
    selectVerifySummary,
} from '../../slices/HRSlice/staffFullFinalSlice';

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

// ─── Main Component ────────────────────────────────────────────────────────────
const VerifyStaffFullFinal = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ── Selectors ─────────────────────────────────────────────────────────────
    const gridList        = useSelector(selectVerifyGridListArray);
    const viewDataRaw     = useSelector(selectFinalSalaryViewData);
    const inboxLoading    = useSelector(selectVerifyGridListLoading);
    const inboxError      = useSelector(selectVerifyGridListError);
    const detailsLoading  = useSelector(selectFinalSalaryViewDataLoading);
    const approvalLoading = useSelector(selectApproveLoading);
    const summary         = useSelector(selectVerifySummary);
    const remarks         = useSelector(selectRemarks);
    const remarksLoading  = useSelector(selectRemarksLoading);
    const statusLoading   = useSelector(selectStatusListLoading);
    const statusError     = useSelector(selectStatusListError);
    const enabledActions  = useSelector(selectEnabledActions);
    const hasActions      = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;

    // Unwrap array if slice stored it that way
    const viewData = Array.isArray(viewDataRaw)
        ? (viewDataRaw[0] || null)
        : viewDataRaw;

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

    // "d" = unified display object
    const d = viewData || selectedItem || {};

    // Derived salary breakdowns
    const earnings   = viewData?.lstMonthSalaryHeads?.filter(h => h.HeadType === 'Earning')   || [];
    const deductions = viewData?.lstMonthSalaryHeads?.filter(h => h.HeadType === 'Deduction') || [];

    // ── Helpers ────────────────────────────────────────────────────────────────
    const getCurrentUser = () =>
        userData?.userName || userDetails?.userName || 'system';

    const uniqueStatuses = [...new Set(gridList.map(i => i.Status))].filter(Boolean);

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (roleId) {
            console.log('🎯 Initializing Full & Final Verification — RoleID:', roleId);
            dispatch(fetchVerifyFinalSalary(roleId));
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

    // ── Fetch detail when item selected ───────────────────────────────────────
    useEffect(() => {
        if (selectedItem?.Id) {
            console.log('🔍 Fetching Final Salary Detail — Id:', selectedItem.Id);
            dispatch(setSelectedId(selectedItem.Id));
            dispatch(fetchFinalSalaryById({
                transNo:  selectedItem.TransactionRefNo || selectedItem.TransNo || '',
                id:       selectedItem.Id,
                empRefNo: selectedItem.EmpRefNo,
            }));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // ── Fetch status list after detail loads ──────────────────────────────────
    useEffect(() => {
        if (selectedItem && roleId && viewData?.MOID) {
            const moid = Number(viewData.MOID);
            console.log('📊 Fetching Status List — MOID:', moid, 'ROID:', roleId);
            dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
        }
    }, [selectedItem, roleId, viewData?.MOID, dispatch]);

    // ── Fetch remarks ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (selectedItem && viewData?.MOID) {
            const moid = Number(viewData.MOID);
            const trno = String(viewData.TransactionRefNo || selectedItem.TransactionRefNo || '');
            console.log('💬 Fetching Remarks — trno:', trno, 'MOID:', moid);
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({ trno, moid }));
        }
    }, [selectedItem, viewData?.MOID, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auto-collapse left panel on selection ─────────────────────────────────
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleRefresh = () => {
        if (roleId) {
            dispatch(fetchVerifyFinalSalary(roleId));
            if (selectedItem?.Id) {
                dispatch(fetchFinalSalaryById({
                    transNo:  selectedItem.TransactionRefNo || '',
                    id:       selectedItem.Id,
                    empRefNo: selectedItem.EmpRefNo,
                }));
            }
        }
    };

    const handleItemSelect = (item) => {
        console.log('✅ Selected Full & Final Item:', item);
        setSelectedItem(item);
    };

    const buildApprovalPayload = (actionValue) => {
        const currentUser = getCurrentUser();
        const payload = {
            id:               viewData?.Id              || selectedItem?.Id              || '',
            transactionRefNo: viewData?.TransactionRefNo || selectedItem?.TransactionRefNo || '',
            empRefNo:         viewData?.EmpRefNo         || selectedItem?.EmpRefNo         || '',
            ccCode:           viewData?.CCCode           || selectedItem?.CCCode           || '',
            groupId:          viewData?.GroupId          || selectedItem?.GroupId          || 0,
            Note:             verificationComment.trim(),
            RoleId:           roleId,
            Createdby:        currentUser,
            Action:           actionValue,
        };
        console.log('📤 Full & Final Approval Payload:', payload);
        return payload;
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No Full & Final record selected'); return; }
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
            const result  = await dispatch(approveFinalSalary(payload)).unwrap();

            const dataVal = result?.Data;
            const dataStr = typeof dataVal === 'string' ? dataVal : (result?.Message || '');
            const isRealSuccess = dataStr.toLowerCase() === 'submited';

            if (!isRealSuccess) throw new Error(dataStr || `Failed to ${actionValue}`);

            toast.success(`${action.text || actionValue} completed successfully!`);

            setTimeout(() => {
                dispatch(fetchVerifyFinalSalary(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearFinalSalaryDetail());
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
    const filteredItems = gridList.filter(item => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            item.EmployeeName?.toLowerCase().includes(q) ||
            item.EmpRefNo?.toLowerCase().includes(q)     ||
            String(item.Id || '').includes(q)            ||
            String(item.TransactionRefNo || '').toLowerCase().includes(q);
        const matchesStatus = filterStatus === 'All' || item.Status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ── Stats cards ────────────────────────────────────────────────────────────
    const statsCards = [
        { icon: BadgeDollarSign, value: gridList.length,                    label: 'Total Records',        color: 'indigo' },
        { icon: Clock,           value: summary.pending || gridList.length,  label: 'Pending Verification', color: 'purple' },
        { icon: IndianRupee,     value: d.FinalNet  ? `₹${fmt(d.FinalNet)}`  : '—', label: 'Net Payable',  color: 'violet' },
        { icon: IndianRupee,     value: d.FinalGross ? `₹${fmt(d.FinalGross)}` : '—', label: 'Gross Amount', color: 'blue'   },
    ];

    // ── Left panel renderers ───────────────────────────────────────────────────
    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                        <BadgeDollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {item.EmployeeName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.EmpRefNo}
                    </p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                        <Hash className="w-3 h-3" />
                        <span>ID: {item.Id}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                        Full &amp; Final
                    </span>
                </div>
                {item.CCCode && (
                    <div className="flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-indigo-400" />
                        <span className="truncate">CC: {item.CCCode}</span>
                    </div>
                )}
                {item.TransactionRefNo && (
                    <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-purple-400" />
                        <span className="truncate">Ref: {item.TransactionRefNo}</span>
                    </div>
                )}
                {item.Status && (
                    <div className="flex items-center space-x-1">
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-medium">
                            {item.Status}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    // Compact single-line row for the "classic" list view — same fields as
    // renderItemCard, laid out horizontally instead of stacked.
    const renderListItem = (item) => (
        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap text-sm">
            <span className="font-semibold text-gray-900 dark:text-white min-w-[160px] truncate">
                {item.EmployeeName}
            </span>
            <span className="text-gray-500 dark:text-gray-400 min-w-[90px]">
                {item.EmpRefNo}
            </span>
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-[80px]">
                <Hash className="w-3 h-3" />
                ID: {item.Id}
            </span>
            {item.CCCode && (
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-[110px] truncate">
                    <Building2 className="w-3 h-3 text-indigo-400" />
                    CC: {item.CCCode}
                </span>
            )}
            {item.TransactionRefNo && (
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 min-w-[120px] truncate">
                    <FileText className="w-3 h-3 text-purple-400" />
                    Ref: {item.TransactionRefNo}
                </span>
            )}
            {item.Status && (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-medium whitespace-nowrap">
                    {item.Status}
                </span>
            )}
            <span className="ml-auto px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium whitespace-nowrap">
                Full &amp; Final
            </span>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <BadgeDollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail sub-sections ────────────────────────────────────────────────────

    // Compact grid cell (label above value) — used for dense info tables
    const GridCell = ({ label, value }) => (
        <div className="bg-white dark:bg-gray-800 px-3 py-1.5">
            <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{value ?? 'N/A'}</p>
        </div>
    );

    const renderEmployeeInfo = () => (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-3 py-1.5 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-white" />
                <h3 className="text-[11px] font-semibold text-white uppercase tracking-wider">Employee Information</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 dark:bg-gray-700">
                <GridCell label="Employee Name"    value={d.EmployeeName} />
                <GridCell label="Employee ID"      value={d.EmpRefNo} />
                <GridCell label="Cost Center"      value={d.CCCode} />
                <GridCell label="Group"            value={d.GroupName || (d.GroupId ? `Group ${d.GroupId}` : null)} />
                <GridCell label="Transaction Ref"  value={d.TransactionRefNo} />
                <GridCell label="Joining Date"     value={d.JoiningDate} />
                <GridCell label="Resignation Date" value={d.ResignationDate} />
                <GridCell label="Relieving Date"   value={d.RelievingDate} />
            </div>
        </div>
    );

    // Gratuity — collapses to a single "not eligible" line when the amount is zero
    const renderGratuity = () => {
        const gratuityAmount = parseFloat(d.Gratuity) || 0;
        return (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                <div className="bg-gradient-to-r from-violet-700 to-purple-700 px-3 py-1.5 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-white" />
                    <h3 className="text-[11px] font-semibold text-white uppercase tracking-wider">Gratuity</h3>
                </div>
                {gratuityAmount <= 0 ? (
                    <div className="px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold">
                        Not Eligible for Gratuity
                        {d.TotalExperiencedays ? ` — ${d.TotalExperiencedays} days of service` : ''}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 dark:bg-gray-700">
                        <GridCell label="Total Service Days" value={`${d.TotalExperiencedays ?? '—'} days`} />
                        <GridCell label="Gratuity Years"     value={`${d.GratuityYears ?? '—'} yrs`} />
                        <GridCell label="Gratuity Days"      value={`${d.Gratuitydays ?? '—'} days`} />
                        <GridCell label="Per Day"            value={`₹${fmt(d.GratuityPerday)}`} />
                        <GridCell label="Gratuity Amount"    value={`₹${fmt(d.Gratuity)}`} />
                    </div>
                )}
            </div>
        );
    };

    // Compact settlement slip — salary-slip style table combining last month
    // earnings/deductions, bonus/leave encashment, and final totals in one view.
    const renderSettlementSlip = () => {
        const ms = viewData?.MonthSalary;
        const bonusBasic       = parseFloat(d.BonusBasic) || 0;
        const leaveEncashment  = parseFloat(d.LeaveEncashment) || 0;

        const otherEarningsRows = [];
        if (bonusBasic > 0) {
            otherEarningsRows.push({ label: 'Bonus Basic (8.33%)', amount: bonusBasic });
        }
        if (leaveEncashment > 0) {
            const days = ms?.BalanceLeaves;
            otherEarningsRows.push({
                label: 'Leave Encashment',
                detail: `Last drawn ₹${fmt(d.LastDrawnSalary)}${days != null ? ` × ${days} days` : ''} @ ₹${fmt(d.LastDrawnSalaryPerDay)}/day`,
                amount: leaveEncashment,
            });
        }

        return (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">

                {/* Header bar */}
                <div className="grid grid-cols-2 bg-indigo-900 text-white text-[11px] font-semibold">
                    <div className="px-3 py-1.5 border-r border-indigo-700">
                        Salary For: {ms?.PayRollFortheDate || '—'}
                    </div>
                    <div className="px-3 py-1.5">
                        Paid Days: {ms?.TotalSalaryDays ?? ms?.NoofPresentDays ?? '—'}
                    </div>
                </div>

                {/* Earnings / Deductions */}
                <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                    <div>
                        <div className="bg-indigo-700 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide">Earnings</div>
                        {earnings.length === 0 ? (
                            <div className="px-3 py-2 text-gray-400">No earnings heads</div>
                        ) : earnings.map((r, i) => (
                            <div key={i} className="flex justify-between px-3 py-1 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-300 truncate pr-2">{r.SalaryHead || r.HeadName}</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0">{fmt(r.HeadAmount)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 font-bold text-indigo-800 dark:text-indigo-300">
                            <span>GROSS</span><span>{fmt(ms?.Gross ?? d.FinalGross)}</span>
                        </div>
                    </div>
                    <div>
                        <div className="bg-rose-700 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide">Deductions</div>
                        {deductions.length === 0 ? (
                            <div className="px-3 py-2 text-gray-400">No deduction heads</div>
                        ) : deductions.map((r, i) => (
                            <div key={i} className="flex justify-between px-3 py-1 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-300 truncate pr-2">{r.SalaryHead || r.HeadName}</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0">{fmt(r.HeadAmount)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 font-bold text-rose-800 dark:text-rose-300">
                            <span>DEDUCTION</span><span>{fmt(ms?.TotalDeduction ?? d.FinalDeduction)}</span>
                        </div>
                    </div>
                </div>

                {/* Other Earnings */}
                {otherEarningsRows.length > 0 && (
                    <div>
                        <div className="bg-indigo-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide">Other Earnings</div>
                        {otherEarningsRows.map((row, i) => (
                            <div key={i} className="flex justify-between items-center px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                <div className="min-w-0 pr-2">
                                    <span className="text-gray-700 dark:text-gray-200 font-medium">{row.label}</span>
                                    {row.detail && <span className="block text-[10px] text-gray-400 dark:text-gray-500 truncate">{row.detail}</span>}
                                </div>
                                <span className="font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0">{fmt(row.amount)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Totals */}
                <div className="grid grid-cols-3 bg-indigo-900 text-white text-[11px] font-bold divide-x divide-indigo-700">
                    <div className="px-3 py-2">Total Earnings: {fmt(d.FinalGross)}</div>
                    <div className="px-3 py-2">Total Deductions: {fmt(d.FinalDeduction)}</div>
                    <div className="px-3 py-2">Net Due: {fmt(d.FinalNet)}</div>
                </div>
            </div>
        );
    };

    // ── Full detail pane ───────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;
        const hasDetailData = !!viewData;

        return (
            <div className="space-y-4">

                {/* Loading */}
                {detailsLoading && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                            <span className="text-indigo-700 dark:text-indigo-400 text-sm">Loading settlement details...</span>
                        </div>
                    </div>
                )}

                {/* Hero header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start space-x-3">
                        <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                                <BadgeDollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <UserCheck className="w-2.5 h-2.5 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                {d.EmployeeName}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
                                {d.EmpRefNo} {d.TransactionRefNo ? `• Ref: ${d.TransactionRefNo}` : ''}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-medium">
                                    Full &amp; Final Settlement
                                </span>
                                {hasDetailData && d.MOID && (
                                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-medium">
                                        MOID: {d.MOID}
                                    </span>
                                )}
                                {d.CCCode && (
                                    <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-[10px] font-medium">
                                        CC: {d.CCCode}
                                    </span>
                                )}
                                {d.Status && (
                                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-medium">
                                        {d.Status}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Net Payable</p>
                            <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">₹{fmt(d.FinalNet)}</p>
                        </div>
                    </div>
                </div>

                {/* Detail sections — gated on hasDetailData */}
                {hasDetailData ? (
                    <>
                        {renderSettlementSlip()}
                        {renderEmployeeInfo()}
                        {renderGratuity()}
                    </>
                ) : !detailsLoading && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600 text-center text-sm text-gray-400">
                        Loading settlement details…
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
                        checkboxLabel: '✓ I have verified the Full & Final settlement amounts, gratuity calculations, and supporting documents',
                        checkboxDescription: 'Including earnings, deductions, leave encashment, and net payable amount',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify the settlement amounts, deductions, gratuity calculations and any discrepancies…',
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
                            ℹ️ No actions available for this settlement record
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
                title={`${InboxTitle || 'Full & Final Verification'} (${gridList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={gridList.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={BadgeDollarSign}
                badgeText="Full & Final"
                enableViewToggle
                badgeCount={gridList.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by name, emp code, ref no…',
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

            <InboxSplitLayout
                isLeftPanelCollapsed={isLeftPanelCollapsed}
                onLeftPanelCollapseToggle={setIsLeftPanelCollapsed}
                isLeftPanelHovered={isLeftPanelHovered}
                onLeftPanelHoverChange={setIsLeftPanelHovered}
                left={{
                    items: filteredItems,
                    selectedItem: selectedItem,
                    onItemSelect: handleItemSelect,
                    renderItem: renderItemCard,
                    renderListItem: renderListItem,
                    renderCollapsedItem: renderCollapsedItem,
                    loading: inboxLoading,
                    error: inboxError,
                    onRefresh: handleRefresh,
                    config: {
                        title: 'Pending Verification',
                        icon: Clock,
                        emptyMessage: 'No Full & Final records found!',
                        itemKey: 'Id',
                        enableCollapse: true,
                        enableRefresh: true,
                        enableHover: true,
                        maxHeight: '100%',
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                    },
                    renderPopupContent: (_item) => renderDetailContent(),
                    popupConfig: {
                        title: 'Full & Final Settlement Verification',
                        icon: BadgeDollarSign,
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        maxWidth: 'max-w-[80vw]',
                    },
                }}
                right={{
                    selectedItem: selectedItem,
                    loading: false,
                    renderContent: renderDetailContent,
                    config: {
                        title: 'Settlement Details',
                        icon: BadgeDollarSign,
                        selectedTitle: 'Full & Final Settlement Verification',
                        emptyTitle: 'No Record Selected',
                        emptyMessage: 'Select a Full & Final record from the list to view the settlement breakdown and take action.',
                        headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        maxHeight: 'calc(100vh - 200px)',
                        sticky: true,
                        stickyTop: '1.5rem',
                    },
                }}
            />
        </div>
    );
};

export default VerifyStaffFullFinal;
