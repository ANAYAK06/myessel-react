import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    BadgeDollarSign, Clock, Calendar, Hash,
    Building2, UserCheck, TrendingUp, TrendingDown,
    Wallet, Award, FileText, User, Briefcase,
    DollarSign, Percent, IndianRupee,
} from 'lucide-react';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
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
            const trno = String(viewData.Id || selectedItem.Id || '');
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

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <BadgeDollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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

    // Info row helper (for details table)
    const InfoRow = ({ icon: Icon, label, value, accent = 'text-indigo-600 dark:text-indigo-400' }) => (
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

    const renderFinancialSummary = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 py-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-white" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Financial Summary</h3>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <FinStatCard label="Net Payable"      value={d.FinalNet}       icon={Wallet}       gradient="from-indigo-500 to-violet-600" note="Net to employee" />
                    <FinStatCard label="Final Gross"      value={d.FinalGross}     icon={TrendingUp}   gradient="from-purple-500 to-indigo-600" note="Total earnings" />
                    <FinStatCard label="Total Deductions" value={d.FinalDeduction} icon={TrendingDown} gradient="from-rose-500 to-pink-600"     note="Total deducted" />
                </div>
                {/* Secondary financial fields */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <InfoRow icon={Award}      label="Leave Encashment"    value={`₹${fmt(d.LeaveEncashment)}`}       accent="text-indigo-700 dark:text-indigo-300" />
                    <InfoRow icon={DollarSign} label="Last Drawn Salary"   value={`₹${fmt(d.LastDrawnSalary)}`}      accent="text-purple-700 dark:text-purple-300" />
                    <InfoRow icon={Percent}    label="Per Day Rate"        value={`₹${fmt(d.LastDrawnSalaryPerDay)}`} accent="text-violet-700 dark:text-violet-300" />
                    <InfoRow icon={Wallet}     label="Other Due"           value={`₹${fmt(d.OtherDue)}`}             accent="text-blue-700 dark:text-blue-300" />
                </div>
            </div>
        </div>
    );

    const renderEmployeeInfo = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 py-3 flex items-center gap-2">
                <User className="w-4 h-4 text-white" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Employee Information</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <InfoRow icon={User}         label="Employee Name"      value={d.EmployeeName}                                           accent="text-indigo-700 dark:text-indigo-300" />
                <InfoRow icon={Hash}         label="Employee ID"        value={d.EmpRefNo}                                               accent="text-purple-700 dark:text-purple-300" />
                <InfoRow icon={Building2}    label="Cost Center"        value={d.CCCode}                                                  accent="text-violet-700 dark:text-violet-300" />
                <InfoRow icon={Briefcase}    label="Group"              value={d.GroupName || (d.GroupId ? `Group ${d.GroupId}` : null)} accent="text-blue-700 dark:text-blue-300" />
                <InfoRow icon={FileText}     label="Transaction Ref"    value={d.TransactionRefNo}                                        accent="text-indigo-700 dark:text-indigo-300" />
                <InfoRow icon={Calendar}     label="Joining Date"       value={d.JoiningDate}                                             accent="text-purple-700 dark:text-purple-300" />
                <InfoRow icon={Calendar}     label="Resignation Date"   value={d.ResignationDate}                                         accent="text-rose-600 dark:text-rose-400" />
                <InfoRow icon={Calendar}     label="Relieving Date"     value={d.RelievingDate}                                           accent="text-rose-700 dark:text-rose-300" />
            </div>
        </div>
    );

    const renderGratuity = () => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-700 to-purple-700 px-4 py-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-white" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Gratuity &amp; Experience</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <InfoRow icon={Clock}        label="Total Days"         value={`${d.TotalExperiencedays ?? '—'} days`} />
                <InfoRow icon={Clock}        label="Gratuity Years"     value={`${d.GratuityYears ?? '—'} yrs`} />
                <InfoRow icon={Clock}        label="Gratuity Days"      value={`${d.Gratuitydays ?? '—'} days`} />
                <InfoRow icon={DollarSign}   label="Gratuity Per Day"   value={`₹${fmt(d.GratuityPerday)}`} />
                <InfoRow icon={Award}        label="Gratuity Amount"    value={`₹${fmt(d.Gratuity)}`}        accent="text-indigo-700 dark:text-indigo-300" />
                <InfoRow icon={TrendingUp}   label="Bonus Basic"        value={`₹${fmt(d.BonusBasic)}`}      accent="text-purple-700 dark:text-purple-300" />
            </div>
        </div>
    );

    const renderLastMonthSalary = () => {
        const ms = viewData?.MonthSalary;
        if (!ms) return null;
        return (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white" />
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                        Last Month Salary {ms.PayRollFortheDate ? `— ${ms.PayRollFortheDate}` : ''}
                    </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    <InfoRow icon={TrendingUp}   label="Gross"          value={`₹${fmt(ms.Gross)}`}          accent="text-indigo-700 dark:text-indigo-300" />
                    <InfoRow icon={TrendingDown} label="Total Deduction" value={`₹${fmt(ms.TotalDeduction)}`} accent="text-rose-600 dark:text-rose-400" />
                    <InfoRow icon={Wallet}       label="Net Amount"     value={`₹${fmt(ms.NetAmount)}`}      accent="text-purple-700 dark:text-purple-300" />
                    <InfoRow icon={Calendar}     label="Present Days"   value={`${ms.NoofPresentDays} days`} />
                    <InfoRow icon={Calendar}     label="PL Days"        value={`${ms.NoofPLDays} days`} />
                    <InfoRow icon={Clock}        label="Total Days"     value={`${ms.TotalSalaryDays} days`} />
                    <InfoRow icon={Award}        label="Balance Leaves" value={`${ms.BalanceLeaves} days`} />
                    {ms.AmountStatus && <InfoRow icon={UserCheck}    label="Status"         value={ms.AmountStatus} />}
                    {ms.Category      && <InfoRow icon={Briefcase}   label="Category"       value={ms.Category} />}
                </div>
            </div>
        );
    };

    const renderHeadsTable = ({ title, icon: Icon, rows, gradient, emptyMsg }) => (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className={`px-4 py-3 bg-gradient-to-r ${gradient} flex items-center gap-2`}>
                <Icon className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{title}</span>
                <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{rows.length}</span>
            </div>
            {rows.length === 0 ? (
                <div className="px-4 py-5 text-center text-sm text-gray-400 dark:text-gray-500">{emptyMsg}</div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {rows.map((r, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.SalaryHead || r.HeadName}</p>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">₹{fmt(r.HeadAmount)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSalaryHeads = () => {
        if (earnings.length === 0 && deductions.length === 0) return null;
        return (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 py-3 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-white" />
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Salary Head Breakdown</h3>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderHeadsTable({ title: 'Earnings',   icon: TrendingUp,   rows: earnings,   gradient: 'from-indigo-500 to-violet-600', emptyMsg: 'No earnings heads' })}
                    {renderHeadsTable({ title: 'Deductions', icon: TrendingDown, rows: deductions, gradient: 'from-rose-500 to-pink-600',     emptyMsg: 'No deduction heads' })}
                </div>
            </div>
        );
    };

    // ── Full detail pane ───────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;
        const hasDetailData = !!viewData;

        return (
            <div className="space-y-6">

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
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start space-x-4">
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <BadgeDollarSign className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <UserCheck className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                                {d.EmployeeName}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                {d.EmpRefNo} {d.TransactionRefNo ? `• Ref: ${d.TransactionRefNo}` : ''}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                    Full &amp; Final Settlement
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
                                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                                        {d.Status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick chips */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-700">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Record ID</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.Id || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employee Code</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{d.EmpRefNo || '-'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Payable</p>
                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">₹{fmt(d.FinalNet)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Relieving Date</p>
                            <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{d.RelievingDate || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Detail sections — gated on hasDetailData */}
                {hasDetailData ? (
                    <>
                        {renderFinancialSummary()}
                        {renderEmployeeInfo()}
                        {renderGratuity()}
                        {renderLastMonthSalary()}
                        {renderSalaryHeads()}
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

            <InboxHeader
                title={`${InboxTitle || 'Full & Final Verification'} (${gridList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={gridList.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={BadgeDollarSign}
                badgeText="Full & Final"
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
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600"
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
                            error={inboxError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No Full & Final records found!',
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
                                        <BadgeDollarSign className="w-4 h-4 text-white" />
                                    </div>
                                    <span>{selectedItem ? 'Full & Final Settlement Verification' : 'Settlement Details'}</span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? renderDetailContent() : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BadgeDollarSign className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Record Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a Full &amp; Final record from the list to view the settlement breakdown and take action.
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

export default VerifyStaffFullFinal;
