import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    IndianRupee, User, Loader2, AlertCircle,
    RotateCcw, Send, TrendingUp, TrendingDown,
    FileText, ChevronDown, Briefcase, Award, Info,
    DollarSign, Navigation, ArrowRight, RefreshCw, Layers,
} from 'lucide-react';

import {
    fetchAppraisalEmp,
    fetchEmpDataForAppraisal,
    fetchCTCAccess,
    fetchGroupSalaryType,
    fetchPayRevisionCTCHeadsData,
    saveEmpPayRevision,
    updateRevisionHeadAmount,
    updateRevisionHeadAmountType,
    clearRevisionData,
    clearRevisionHeadsOnly,
    clearSaveRevisionResult,
    resetCreationFlow,
    selectRevisionEmpListArray,
    selectRevisionEmpListLoading,
    selectRevisionEmpListError,
    selectAppraisalData,
    selectAppraisalGroups,
    selectAppraisalDataLoading,
    selectAppraisalDataError,
    selectCTCAccess,
    selectCTCAccessLoading,
    selectGroupSalaryType,
    selectRevisionHeadsData,
    selectLocalRevisionHeads,
    selectRevisionHeadsLoading,
    selectRevisionHeadsError,
    selectRevisionEarningHeads,
    selectRevisionDeductionHeads,
    selectRevisionBenefitHeads,
    selectRevisionOtherBenefitHeads,
    selectRevisionGrossRow,
    selectRevisionDeductionTotalRow,
    selectRevisionNetSalaryRow,
    selectRevisionBenefitTotalRow,
    selectRevisionOtherBenefitTotalRow,
    selectRevisionCTCTotalRow,
    selectSaveRevisionStatus,
    selectSaveRevisionLoading,
    selectSaveRevisionError,
} from '../../slices/HRSlice/staffPayRevisionSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val, dec = 2) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

const diff = (newAmt, existAmt) => {
    const d = (parseFloat(newAmt) || 0) - (parseFloat(existAmt) || 0);
    return d;
};

const TOTAL_HEAD_TYPES = ['GROSSSALARY', 'DEDUCTIONTOTAL', 'NETSALARY', 'BENEFITTOTAL', 'OTHERBENEFITTOTAL', 'CTCTOTAL'];

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all';

const StatCard = ({ label, existing, revised, icon: Icon, gradient }) => {
    const d = diff(revised, existing);
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} shadow-lg`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/80">{label}</p>
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-white/60 line-through">₹{fmt(existing)}</p>
                    <ArrowRight className="h-3 w-3 text-white/60" />
                    <p className="text-xl font-black">₹{fmt(revised)}</p>
                </div>
                {d !== 0 && (
                    <p className={`text-xs font-bold ${d > 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                        {d > 0 ? '+' : ''}₹{fmt(d)} / month
                    </p>
                )}
            </div>
        </div>
    );
};

// Revision head row — 9 columns matching old app layout
const RevisionHeadRow = ({ head, onAmountChange, onAmountTypeChange, disabled }) => {
    const isTotal    = TOTAL_HEAD_TYPES.includes(head.HeadType);
    const amountType = head.CTCAmounttype || head.ApplicableType || 'Monthly';

    const revisedMonthly  = parseFloat(head.HeadAmount) || 0;
    const revisedYearly   = parseFloat((revisedMonthly * 12).toFixed(2));
    const existingMonthly = parseFloat(head.ExistingMonthlyAmount) || 0;
    const existingYearly  = parseFloat(head.ExistingYearlyAmount)  || 0;
    const monthlyDiff     = parseFloat((revisedMonthly - existingMonthly).toFixed(2));
    const yearlyDiff      = parseFloat((revisedYearly  - existingYearly).toFixed(2));

    // Input shows the CTC amount in the user's selected type
    const toDisplay = (monthly, type) =>
        monthly > 0 ? (type === 'Yearly' ? String(parseFloat((monthly * 12).toFixed(2))) : String(monthly)) : '';

    const [inputVal, setInputVal] = useState(() => toDisplay(revisedMonthly, amountType));

    useEffect(() => {
        setInputVal(toDisplay(parseFloat(head.HeadAmount) || 0, amountType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [head.HeadAmount, amountType]);

    const handleTypeChange = (e) => { onAmountTypeChange(head.Rowno, e.target.value); };

    const handleBlur = () => {
        const parsed  = parseFloat(inputVal) || 0;
        const monthly = amountType === 'Yearly' ? parsed / 12 : parsed;
        if (monthly > 0 && monthly < (parseFloat(head.MinMonthAmount) || 0)) {
            toast.warn(`Min monthly for ${head.HeadName}: ₹${fmt(head.MinMonthAmount)}`);
        }
        onAmountChange(head.Rowno, monthly);
    };

    const c  = 'py-2 px-2 text-xs';
    const nr = `${c} text-right tabular-nums`;

    if (isTotal) {
        return (
            <tr className="bg-blue-700 dark:bg-blue-800 text-white font-bold border-b border-blue-600">
                <td className={`${c} font-bold`} colSpan={3}>{head.HeadName}</td>
                <td className={nr}>{fmt(existingMonthly)}</td>
                <td className={`${nr} ${monthlyDiff > 0 ? 'text-green-300' : monthlyDiff < 0 ? 'text-red-300' : ''}`}>
                    {monthlyDiff !== 0 ? (monthlyDiff > 0 ? '+' : '') + fmt(monthlyDiff) : ''}
                </td>
                <td className={nr}>{fmt(revisedMonthly)}</td>
                <td className={nr}>{fmt(existingYearly)}</td>
                <td className={`${nr} ${yearlyDiff > 0 ? 'text-green-300' : yearlyDiff < 0 ? 'text-red-300' : ''}`}>
                    {yearlyDiff !== 0 ? (yearlyDiff > 0 ? '+' : '') + fmt(yearlyDiff) : ''}
                </td>
                <td className={nr}>{fmt(revisedYearly)}</td>
            </tr>
        );
    }

    return (
        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
            <td className={c}>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{head.HeadName}</p>
                {head.ValidationMsg && <p className="text-[10px] text-gray-400 mt-0.5">{head.ValidationMsg}</p>}
            </td>
            <td className={`${c} text-center`}>
                <select
                    value={amountType}
                    onChange={handleTypeChange}
                    disabled={disabled}
                    className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-60"
                >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                </select>
            </td>
            <td className={`${c} text-center`}>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder="0.00"
                    className="w-24 text-xs text-right border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-60"
                />
            </td>
            <td className={`${nr} text-gray-600 dark:text-gray-400`}>{fmt(existingMonthly)}</td>
            <td className={`${nr} ${monthlyDiff > 0 ? 'text-emerald-600 dark:text-emerald-400' : monthlyDiff < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}`}>
                {monthlyDiff !== 0 ? (monthlyDiff > 0 ? '+' : '') + fmt(monthlyDiff) : '—'}
            </td>
            <td className={`${nr} font-semibold text-gray-800 dark:text-gray-100`}>
                {revisedMonthly > 0 ? fmt(revisedMonthly) : '—'}
            </td>
            <td className={`${nr} text-gray-600 dark:text-gray-400`}>{fmt(existingYearly)}</td>
            <td className={`${nr} ${yearlyDiff > 0 ? 'text-emerald-600 dark:text-emerald-400' : yearlyDiff < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}`}>
                {yearlyDiff !== 0 ? (yearlyDiff > 0 ? '+' : '') + fmt(yearlyDiff) : '—'}
            </td>
            <td className={`${nr} font-semibold text-gray-800 dark:text-gray-100`}>
                {revisedMonthly > 0 ? fmt(revisedYearly) : '—'}
            </td>
        </tr>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffPayRevision = () => {
    const dispatch = useDispatch();

    const { userData } = useSelector((state) => state.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'User';

    const empList        = useSelector(selectRevisionEmpListArray);
    const empListLoading = useSelector(selectRevisionEmpListLoading);
    const empListError   = useSelector(selectRevisionEmpListError);

    const appraisalData        = useSelector(selectAppraisalData);
    const appraisalGroups      = useSelector(selectAppraisalGroups);
    const appraisalDataLoading = useSelector(selectAppraisalDataLoading);
    const appraisalDataError   = useSelector(selectAppraisalDataError);

    const ctcAccess        = useSelector(selectCTCAccess);
    const ctcAccessLoading = useSelector(selectCTCAccessLoading);

    const groupSalaryType = useSelector(selectGroupSalaryType);

    const revisionHeadsData    = useSelector(selectRevisionHeadsData);
    const localRevisionHeads   = useSelector(selectLocalRevisionHeads);
    const revisionHeadsLoading = useSelector(selectRevisionHeadsLoading);
    const revisionHeadsError   = useSelector(selectRevisionHeadsError);

    const earningHeads      = useSelector(selectRevisionEarningHeads);
    const deductionHeads    = useSelector(selectRevisionDeductionHeads);
    const benefitHeads      = useSelector(selectRevisionBenefitHeads);
    const otherBenefitHeads = useSelector(selectRevisionOtherBenefitHeads);

    const grossRow             = useSelector(selectRevisionGrossRow);
    const deductionTotalRow    = useSelector(selectRevisionDeductionTotalRow);
    const netSalaryRow         = useSelector(selectRevisionNetSalaryRow);
    const benefitTotalRow      = useSelector(selectRevisionBenefitTotalRow);
    const otherBenefitTotalRow = useSelector(selectRevisionOtherBenefitTotalRow);
    const ctcTotalRow          = useSelector(selectRevisionCTCTotalRow);

    const saveRevisionStatus  = useSelector(selectSaveRevisionStatus);
    const saveRevisionLoading = useSelector(selectSaveRevisionLoading);
    const saveRevisionError   = useSelector(selectSaveRevisionError);


    const [selectedEmp,   setSelectedEmp]   = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [remarks,       setRemarks]       = useState('');

    // Load employees + check access on mount
    useEffect(() => {
        dispatch(fetchAppraisalEmp());
        if (roleId) dispatch(fetchCTCAccess(roleId));
        return () => { dispatch(resetCreationFlow()); };
    }, [dispatch, roleId]);

    // After appraisalData loads, pre-select the employee's current group
    useEffect(() => {
        if (!appraisalData) return;
        if (appraisalData.GroupId) {
            setSelectedGroup(String(appraisalData.GroupId));
        }
    }, [appraisalData]);

    // Handle save status
    useEffect(() => {
        if (saveRevisionStatus === 'success') {
            toast.success('Pay Revision submitted successfully!');
            dispatch(clearSaveRevisionResult());
            dispatch(clearRevisionData());
            setSelectedEmp('');
            setSelectedGroup('');
            setRemarks('');
            dispatch(fetchAppraisalEmp());
        } else if (saveRevisionStatus === 'failed' && saveRevisionError) {
            toast.error(saveRevisionError);
            dispatch(clearSaveRevisionResult());
        }
    }, [saveRevisionStatus, saveRevisionError, dispatch]);

    const handleEmpChange = (e) => {
        setSelectedEmp(e.target.value);
        setSelectedGroup('');
        dispatch(clearRevisionData());
    };

    const handleLoadRevision = useCallback(() => {
        if (!selectedEmp) { toast.warn('Please select an employee.'); return; }
        dispatch(clearRevisionData());
        dispatch(fetchEmpDataForAppraisal(selectedEmp));
    }, [selectedEmp, dispatch]);

    const handleLoadCTCStructure = useCallback(() => {
        if (!selectedEmp)   { toast.warn('Please select an employee.'); return; }
        if (!selectedGroup) { toast.warn('Please select a group.'); return; }
        dispatch(fetchGroupSalaryType(selectedGroup));
        dispatch(fetchPayRevisionCTCHeadsData({ empRefNo: selectedEmp, groupId: selectedGroup }));
    }, [selectedEmp, selectedGroup, dispatch]);

    const handleAmountChange = useCallback((rowno, amount) => {
        dispatch(updateRevisionHeadAmount({ rowno, amount }));
    }, [dispatch]);

    const handleAmountTypeChange = useCallback((rowno, amountType) => {
        dispatch(updateRevisionHeadAmountType({ rowno, amountType }));
    }, [dispatch]);

    const handleSubmit = () => {
        if (!selectedEmp)               { toast.warn('Please select an employee.');          return; }
        if (!appraisalData)             { toast.warn('Please load revision data first.');    return; }
        if (!selectedGroup)             { toast.warn('Please select a group.');              return; }
        if (localRevisionHeads.length === 0) { toast.warn('No revision heads to save.');    return; }

        const empRule = revisionHeadsData?.EmpRuleStatus;

        // Mandatory heads must be non-zero
        const zeroMandatory = localRevisionHeads.filter(
            (h) => !TOTAL_HEAD_TYPES.includes(h.HeadType) &&
                   h.MandatoryType === 'Mandatory' &&
                   (parseFloat(h.HeadAmount) || 0) === 0
        );
        if (zeroMandatory.length > 0) {
            toast.error(`Amount required for: ${zeroMandatory.map((h) => h.HeadName).join(', ')}`);
            return;
        }

        // PF check
        if (empRule?.PFExist === 'Yes') {
            const pfHeads = localRevisionHeads.filter(
                (h) => !TOTAL_HEAD_TYPES.includes(h.HeadType) &&
                       (h.HeadName?.toUpperCase().includes('P.F') ||
                        h.HeadName?.toUpperCase().includes('PF') ||
                        h.HeadName?.toUpperCase().includes('PROVIDENT')) &&
                       (parseFloat(h.HeadAmount) || 0) === 0
            );
            if (pfHeads.length > 0) {
                toast.error(`PF is applicable — amount required for: ${pfHeads.map((h) => h.HeadName).join(', ')}`);
                return;
            }
        }

        // ESI check
        if (empRule?.ESIExist === 'Yes') {
            const esiHeads = localRevisionHeads.filter(
                (h) => !TOTAL_HEAD_TYPES.includes(h.HeadType) &&
                       (h.HeadName?.toUpperCase().includes('E.S.I') ||
                        h.HeadName?.toUpperCase().includes('ESI') ||
                        h.HeadName?.toUpperCase().includes('EMPLOYEE STATE')) &&
                       (parseFloat(h.HeadAmount) || 0) === 0
            );
            if (esiHeads.length > 0) {
                toast.error(`ESI is applicable — amount required for: ${esiHeads.map((h) => h.HeadName).join(', ')}`);
                return;
            }
        }

        dispatch(saveEmpPayRevision({
            empRefNo:  selectedEmp,
            month:     appraisalData.Month  || 0,
            year:      appraisalData.Year   || 0,
            remarks:   remarks.trim(),
            heads:     localRevisionHeads,
            createdBy: userName,
            roleId:    roleId,
            groupId:   revisionHeadsData?.GroupId || selectedGroup,
        }));
    };

    const hasRevisionData = revisionHeadsData && localRevisionHeads.length > 0;
    const isBusy          = appraisalDataLoading || revisionHeadsLoading || saveRevisionLoading;
    const isFormValid     = Boolean(selectedEmp && hasRevisionData);

    const empRule = revisionHeadsData?.EmpRuleStatus;

    // Existing CTC totals — read from localRevisionHeads total rows (ExistingMonthlyAmount)
    const existingGross  = grossRow?.ExistingMonthlyAmount    || 0;
    const existingNet    = netSalaryRow?.ExistingMonthlyAmount || 0;
    const existingCTC    = ctcTotalRow?.ExistingMonthlyAmount  || 0;

    const tableHead = (
        <thead>
            <tr className="bg-slate-800 dark:bg-slate-900 text-white text-center">
                <th className="py-2.5 px-2 text-left text-xs font-semibold uppercase tracking-wider min-w-[130px]">Particulars</th>
                <th className="py-2.5 px-2 text-xs font-semibold uppercase tracking-wider min-w-[100px]">Amount Type</th>
                <th className="py-2.5 px-2 text-xs font-semibold uppercase tracking-wider min-w-[100px]">CTC Amount</th>
                <th className="py-2.5 px-2 text-xs font-semibold uppercase tracking-wider min-w-[95px]">Existing Monthly Amt</th>
                <th className="py-2.5 px-2 text-xs font-semibold uppercase tracking-wider min-w-[85px]">Monthly Diff Amt</th>
                <th className="py-2.5 px-2 text-xs font-semibold uppercase tracking-wider min-w-[95px]">Revised Monthly Amt</th>
                <th className="py-2.5 px-2 text-xs font-semibold uppercase tracking-wider min-w-[95px]">Existing Yearly Amt</th>
                <th className="py-2.5 px-2 text-xs font-semibold uppercase tracking-wider min-w-[85px]">Yearly Diff Amt</th>
                <th className="py-2.5 px-2 text-xs font-semibold uppercase tracking-wider min-w-[95px]">Revised Yearly Amt</th>
            </tr>
        </thead>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <RefreshCw className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                    {ctcAccess?.RevisionAccess === 'RevisionAccessExist' && (
                                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full">Revision Access</span>
                                    )}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Staff Pay Revision</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Revise employee CTC — update and submit new salary structure</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Pay Revision</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Employee Selection Card ──────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Employee Selection</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Select an employee to revise their pay structure</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => { dispatch(clearRevisionData()); setSelectedEmp(''); setSelectedGroup(''); setRemarks(''); }}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader icon={User} title="Select Employee" subtitle="Choose the employee for pay revision" />

                        {empListError && (
                            <div className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{empListError}</span>
                            </div>
                        )}

                        {/* Step 1: Employee select + Load */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Employee <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedEmp}
                                        onChange={handleEmpChange}
                                        disabled={empListLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10 disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        <option value="">
                                            {empListLoading ? 'Loading employees...' : '— Select Employee —'}
                                        </option>
                                        {empList.map((emp) => (
                                            <option key={emp.EmpRefNo} value={emp.EmpRefNo}>
                                                {emp.EmpName}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        {empListLoading
                                            ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                                            : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    onClick={handleLoadRevision}
                                    disabled={!selectedEmp || appraisalDataLoading || saveRevisionLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {appraisalDataLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                                        : <><RefreshCw className="h-4 w-4" /> Load Revision Data</>
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Group selection (shown after appraisal data is fetched) */}
                        {appraisalData && (
                            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <Layers className="h-4 w-4 text-indigo-500" />
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Select Group for CTC Structure
                                    </p>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">(pre-filled with employee's current group — change if needed)</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                            Group <span className="text-rose-500 ml-0.5">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedGroup}
                                                onChange={(e) => {
                                                    setSelectedGroup(e.target.value);
                                                    dispatch(clearRevisionHeadsOnly());
                                                }}
                                                disabled={revisionHeadsLoading || saveRevisionLoading}
                                                className={`${inputCls} appearance-none pr-10 disabled:opacity-60 disabled:cursor-not-allowed`}
                                            >
                                                <option value="">— Select Group —</option>
                                                {appraisalGroups.map((g) => (
                                                    <option key={g.GroupId} value={String(g.GroupId)}>
                                                        {g.GroupName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            onClick={handleLoadCTCStructure}
                                            disabled={!selectedGroup || revisionHeadsLoading || saveRevisionLoading}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/30 hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {revisionHeadsLoading
                                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                                                : <><Layers className="h-4 w-4" /> Load CTC Structure</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appraisal data error */}
                        {appraisalDataError && (
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{appraisalDataError}</span>
                            </div>
                        )}

                        {/* Revision heads error */}
                        {revisionHeadsError && (
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{revisionHeadsError}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Loaded Data ──────────────────────────────────────────── */}
                {hasRevisionData && (
                    <>
                        {/* Employee Info & Rule Status */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Employee Info */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center gap-3">
                                    <Briefcase className="h-4 w-4 text-indigo-500" />
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Employee Info</h2>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Current pay period details</p>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8">
                                    <SectionHeader icon={Briefcase} title="Employee Info" />
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        {[
                                            { label: 'Name',            value: revisionHeadsData?.EmpName || appraisalData?.Name || '—' },
                                            { label: 'Category',        value: revisionHeadsData?.Category || appraisalData?.Category || '—' },
                                            { label: 'State',           value: revisionHeadsData?.State || '—' },
                                            { label: 'Group',           value: revisionHeadsData?.GroupName ? `${revisionHeadsData.GroupName} (${revisionHeadsData.GroupId})` : appraisalData?.GroupName || '—' },
                                            { label: 'Effective Date',  value: appraisalData?.EffectiveDate || '—' },
                                            { label: 'Daily Wage',      value: groupSalaryType === 'Yes' ? 'Yes' : 'No' },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <dt className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</dt>
                                                <dd className="font-semibold text-gray-800 dark:text-gray-100 mt-0.5">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            </div>

                            {/* Rule Status */}
                            {empRule && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center gap-3">
                                        <Info className="h-4 w-4 text-indigo-500" />
                                        <div>
                                            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Rule Status &amp; Applicability</h2>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">PF, ESI, Gratuity and other rules</p>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8">
                                        <SectionHeader icon={Info} title="Rule Status &amp; Applicability" />
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {[
                                                { label: 'PF Exist',   value: empRule.PFExist  || '—' },
                                                { label: 'ESI Exist',  value: empRule.ESIExist || '—' },
                                                { label: 'PF %',       value: empRule.PFPercent != null ? `${empRule.PFPercent}%` : '—' },
                                                { label: 'ESI %',      value: empRule.ESIPercent != null ? `${empRule.ESIPercent}%` : '—' },
                                                { label: 'PF Emp %',   value: empRule.PFemployerPercent != null ? `${empRule.PFemployerPercent}%` : '—' },
                                                { label: 'ESI Emp %',  value: empRule.ESIemployerPercent != null ? `${empRule.ESIemployerPercent}%` : '—' },
                                                { label: 'Gratuity',   value: empRule.GratuityRuleExist || '—' },
                                                { label: 'PT Rule',    value: empRule.PTRuleStatus || '—' },
                                                { label: 'Paid Leave', value: empRule.PaidLeaveExist || '—' },
                                                { label: 'Join Month', value: empRule.JoiningMonthName ? `${empRule.JoiningMonthName} ${empRule.JoiningYear}` : '—' },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-700">
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{label}</span>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200 text-xs">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                label="Gross Salary"
                                existing={existingGross}
                                revised={grossRow?.HeadAmount || 0}
                                icon={TrendingUp}
                                gradient="from-indigo-500 to-indigo-700"
                            />
                            <StatCard
                                label="Net Salary"
                                existing={existingNet}
                                revised={netSalaryRow?.HeadAmount || 0}
                                icon={IndianRupee}
                                gradient="from-emerald-500 to-emerald-700"
                            />
                            <StatCard
                                label="CTC"
                                existing={existingCTC}
                                revised={ctcTotalRow?.HeadAmount || 0}
                                icon={Award}
                                gradient="from-purple-500 to-violet-700"
                            />
                        </div>

                        {/* ── Earnings Table ─────────────────────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 flex items-center gap-3">
                                <TrendingUp className="h-4 w-4 text-indigo-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Earnings</h2>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Enter revised monthly earning amounts</p>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 pb-0">
                                <SectionHeader icon={TrendingUp} title="Earnings" subtitle="Enter revised monthly earning amounts" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    {tableHead}
                                    <tbody>
                                        {earningHeads.map((h) => (
                                            <RevisionHeadRow key={h.Rowno} head={h} onAmountChange={handleAmountChange} onAmountTypeChange={handleAmountTypeChange} disabled={saveRevisionLoading} />
                                        ))}
                                        {grossRow && (
                                            <RevisionHeadRow key={grossRow.Rowno} head={grossRow} onAmountChange={handleAmountChange} onAmountTypeChange={handleAmountTypeChange} disabled={saveRevisionLoading} />
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Deductions Table ───────────────────────────────── */}
                        {deductionHeads.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 flex items-center gap-3">
                                    <TrendingDown className="h-4 w-4 text-indigo-500" />
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Deductions</h2>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Enter revised monthly deduction amounts</p>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 pb-0">
                                    <SectionHeader icon={TrendingDown} title="Deductions" subtitle="Enter revised monthly deduction amounts" />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        {tableHead}
                                        <tbody>
                                            {deductionHeads.map((h) => (
                                                <RevisionHeadRow key={h.Rowno} head={h} onAmountChange={handleAmountChange} onAmountTypeChange={handleAmountTypeChange} disabled={saveRevisionLoading} />
                                            ))}
                                            {deductionTotalRow && (
                                                <RevisionHeadRow key={deductionTotalRow.Rowno} head={deductionTotalRow} onAmountChange={handleAmountChange} onAmountTypeChange={handleAmountTypeChange} disabled={saveRevisionLoading} />
                                            )}
                                            {netSalaryRow && (
                                                <RevisionHeadRow key={netSalaryRow.Rowno} head={netSalaryRow} onAmountChange={handleAmountChange} onAmountTypeChange={handleAmountTypeChange} disabled={saveRevisionLoading} />
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Benefits Table ─────────────────────────────────── */}
                        {benefitHeads.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 flex items-center gap-3">
                                    <Award className="h-4 w-4 text-indigo-500" />
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Reimbursable Payments / Benefits</h2>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Enter revised benefit amounts</p>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 pb-0">
                                    <SectionHeader icon={Award} title="Reimbursable Payments / Benefits" subtitle="Enter revised benefit amounts" />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        {tableHead}
                                        <tbody>
                                            {benefitHeads.map((h) => (
                                                <RevisionHeadRow key={h.Rowno} head={h} onAmountChange={handleAmountChange} onAmountTypeChange={handleAmountTypeChange} disabled={saveRevisionLoading} />
                                            ))}
                                            {benefitTotalRow && (
                                                <RevisionHeadRow key={benefitTotalRow.Rowno} head={benefitTotalRow} onAmountChange={handleAmountChange} onAmountTypeChange={handleAmountTypeChange} disabled={saveRevisionLoading} />
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Other Benefits Table ───────────────────────────── */}
                        {otherBenefitHeads.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 flex items-center gap-3">
                                    <DollarSign className="h-4 w-4 text-indigo-500" />
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Other Benefits</h2>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Enter revised other benefit amounts</p>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 pb-0">
                                    <SectionHeader icon={DollarSign} title="Other Benefits" subtitle="Enter revised other benefit amounts" />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        {tableHead}
                                        <tbody>
                                            {otherBenefitHeads.map((h) => (
                                                <RevisionHeadRow key={h.Rowno} head={h} onAmountChange={handleAmountChange} onAmountTypeChange={handleAmountTypeChange} disabled={saveRevisionLoading} />
                                            ))}
                                            {otherBenefitTotalRow && (
                                                <RevisionHeadRow key={otherBenefitTotalRow.Rowno} head={otherBenefitTotalRow} onAmountChange={handleAmountChange} onAmountTypeChange={handleAmountTypeChange} disabled={saveRevisionLoading} />
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── CTC Summary Banner ─────────────────────────────── */}
                        {ctcTotalRow && (
                            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 p-5 text-white shadow-lg shadow-indigo-500/20">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Award className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Revised Cost To Company (CTC)</p>
                                            <p className="text-3xl font-black mt-0.5">₹{fmt(ctcTotalRow.HeadAmount)}</p>
                                            <p className="text-xs text-white/70">Per Month</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 text-right">
                                        <div>
                                            <p className="text-xs text-white/70">Previous CTC</p>
                                            <p className="text-lg font-bold line-through text-white/60">₹{fmt(existingCTC)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/70">Annual CTC</p>
                                            <p className="text-2xl font-bold">₹{fmt((ctcTotalRow.HeadAmount || 0) * 12)}</p>
                                        </div>
                                    </div>
                                </div>
                                {diff(ctcTotalRow.HeadAmount, existingCTC) !== 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/20">
                                        <p className={`text-sm font-bold ${diff(ctcTotalRow.HeadAmount, existingCTC) > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                            Monthly Increment: {diff(ctcTotalRow.HeadAmount, existingCTC) > 0 ? '+' : ''}₹{fmt(diff(ctcTotalRow.HeadAmount, existingCTC))}
                                            &nbsp;|&nbsp;Annual: {diff(ctcTotalRow.HeadAmount, existingCTC) > 0 ? '+' : ''}₹{fmt(diff(ctcTotalRow.HeadAmount, existingCTC) * 12)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Remarks Card ───────────────────────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center gap-3">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Remarks &amp; Submission</h2>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Add remarks and submit the pay revision</p>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <SectionHeader icon={FileText} title="Remarks &amp; Submission" />
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Remarks
                                </label>
                                <textarea
                                    rows={3}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    disabled={saveRevisionLoading}
                                    placeholder="Add any remarks (optional)..."
                                    className={`${inputCls} resize-none disabled:opacity-60 disabled:cursor-not-allowed`}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* ── Action Bar ──────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Ready to submit?</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {isFormValid
                                    ? <><span className="font-bold text-indigo-600 dark:text-indigo-400">Pay Revision</span> — ready to be submitted</>
                                    : 'Select an employee and load revision data first'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => { dispatch(clearRevisionData()); setSelectedEmp(''); setSelectedGroup(''); setRemarks(''); }}
                                disabled={saveRevisionLoading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-4 w-4" /> Reset
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saveRevisionLoading || !hasRevisionData}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {saveRevisionLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                                    : <><Send className="h-4 w-4" /> Submit Revision</>
                                }
                            </button>
                        </div>
                    </div>

                    {!isFormValid && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg px-4 py-2.5">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Please select an employee and load revision data before submitting.</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StaffPayRevision;
