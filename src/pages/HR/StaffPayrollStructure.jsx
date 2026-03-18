import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import {
    fetchNewEmpForCTC,
    fetchCTCHeadsData,
    saveNewEmployeeCTC,
    updateHeadAmount,
    clearCTCData,
    clearSaveResult,
    resetAll,
    selectEmpListArray,
    selectEmpListLoading,
    selectEmpListError,
    selectCTCData,
    selectLocalHeads,
    selectCTCDataLoading,
    selectCTCDataError,
    selectEarningHeads,
    selectDeductionHeads,
    selectBenefitHeads,
    selectOtherBenefitHeads,
    selectGrossRow,
    selectDeductionTotalRow,
    selectNetSalaryRow,
    selectBenefitTotalRow,
    selectOtherBenefitTotalRow,
    selectCTCTotalRow,
    selectSaveStatus,
    selectSaveLoading,
    selectSaveError,
} from '../../slices/HRSlice/staffCTCCreationSlice';

import {
    User, Loader2, AlertCircle,
    RotateCcw, Send, IndianRupee, TrendingUp, TrendingDown,
    FileText, ChevronDown, Briefcase, Award, Info,
    DollarSign, Navigation,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val, dec = 2) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

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

const StatCard = ({ label, value, icon: Icon, gradient, sub }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} shadow-lg`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">{label}</p>
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </div>
            <p className="text-2xl font-black">₹{fmt(value)}</p>
            {sub && <p className="text-xs text-white/70 mt-1">{sub}</p>}
        </div>
    </div>
);

// Editable head row
const HeadRow = ({ head, onAmountChange, disabled }) => {
    const [inputVal, setInputVal] = useState(
        head.HeadAmount != null ? String(head.HeadAmount) : ''
    );

    useEffect(() => {
        setInputVal(head.HeadAmount != null ? String(head.HeadAmount) : '');
    }, [head.HeadAmount]);

    const handleBlur = () => {
        const parsed = parseFloat(inputVal);
        const val = isNaN(parsed) ? 0 : parsed;
        if (val < (head.MinMonthAmount || 0)) {
            toast.warn(`Minimum monthly amount for ${head.HeadName} is ₹${fmt(head.MinMonthAmount)}`);
        }
        onAmountChange(head.Rowno, val);
    };

    return (
        <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{head.HeadName}</td>
            <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{head.AmountType || '—'}</td>
            <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{head.ApplicableType || '—'}</td>
            <td className="py-3 px-4 text-xs">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    head.MandatoryType === 'Mandatory'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>{head.MandatoryType || '—'}</span>
            </td>
            <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{head.ValidationMsg || '—'}</td>
            <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">₹</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={disabled}
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onBlur={handleBlur}
                        className="w-28 px-2 py-1.5 text-sm text-right border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all"
                    />
                </div>
            </td>
        </tr>
    );
};

// Total row (read-only)
const TotalRow = ({ label, value, colorClass = 'text-indigo-700 dark:text-indigo-300' }) => (
    <tr className="bg-indigo-50/60 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
        <td colSpan={5} className={`py-3 px-4 text-sm font-bold ${colorClass}`}>{label}</td>
        <td className={`py-3 px-4 text-sm font-bold text-right ${colorClass}`}>₹{fmt(value)}</td>
    </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffPayrollStructure = () => {
    const dispatch = useDispatch();

    const { userData } = useSelector((state) => state.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'User';

    const empList        = useSelector(selectEmpListArray);
    const empListLoading = useSelector(selectEmpListLoading);
    const empListError   = useSelector(selectEmpListError);

    const ctcData        = useSelector(selectCTCData);
    const localHeads     = useSelector(selectLocalHeads);
    const ctcDataLoading = useSelector(selectCTCDataLoading);
    const ctcDataError   = useSelector(selectCTCDataError);

    const earningHeads      = useSelector(selectEarningHeads);
    const deductionHeads    = useSelector(selectDeductionHeads);
    const benefitHeads      = useSelector(selectBenefitHeads);
    const otherBenefitHeads = useSelector(selectOtherBenefitHeads);

    const grossRow           = useSelector(selectGrossRow);
    const deductionTotalRow  = useSelector(selectDeductionTotalRow);
    const netSalaryRow       = useSelector(selectNetSalaryRow);
    const benefitTotalRow    = useSelector(selectBenefitTotalRow);
    const otherBenefitTotalRow = useSelector(selectOtherBenefitTotalRow);
    const ctcTotalRow        = useSelector(selectCTCTotalRow);

    const saveStatus  = useSelector(selectSaveStatus);
    const saveLoading = useSelector(selectSaveLoading);
    const saveError   = useSelector(selectSaveError);

    const [selectedEmp, setSelectedEmp] = useState('');
    const [remarks, setRemarks]         = useState('');

    // Load employees on mount
    useEffect(() => {
        dispatch(fetchNewEmpForCTC());
        return () => { dispatch(resetAll()); };
    }, [dispatch]);

    // Handle save success / failure toasts
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('CTC saved successfully!');
            dispatch(clearSaveResult());
            dispatch(clearCTCData());
            setSelectedEmp('');
            setRemarks('');
            dispatch(fetchNewEmpForCTC());
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
        }
    }, [saveStatus, saveError, dispatch]);

    const handleLoadCTC = useCallback(() => {
        if (!selectedEmp) {
            toast.warn('Please select an employee first.');
            return;
        }
        dispatch(fetchCTCHeadsData(selectedEmp));
    }, [selectedEmp, dispatch]);

    const handleEmpChange = (e) => {
        setSelectedEmp(e.target.value);
        dispatch(clearCTCData());
    };

    const handleAmountChange = useCallback((rowno, amount) => {
        dispatch(updateHeadAmount({ rowno, amount }));
    }, [dispatch]);

    const handleSubmit = () => {
        if (!selectedEmp) { toast.warn('Please select an employee.'); return; }
        if (!ctcData)     { toast.warn('Please load CTC data first.'); return; }
        if (localHeads.length === 0) { toast.warn('No CTC heads to save.'); return; }

        const EDITABLE_TYPES = ['Earning', 'Deduction', 'Benefit', 'OtherBenefit'];
        const empRule = ctcData?.EmpRuleStatus;

        // 1. All mandatory editable heads must be non-zero
        const zeroMandatory = localHeads.filter(
            (h) => EDITABLE_TYPES.includes(h.HeadType) &&
                   h.MandatoryType === 'Mandatory' &&
                   (parseFloat(h.HeadAmount) || 0) === 0
        );
        if (zeroMandatory.length > 0) {
            toast.error(`Amount required for: ${zeroMandatory.map((h) => h.HeadName).join(', ')}`);
            return;
        }

        // 2. If PF is applicable, PF-related heads must be non-zero
        if (empRule?.PFExist === 'Yes') {
            const pfHeads = localHeads.filter(
                (h) => EDITABLE_TYPES.includes(h.HeadType) &&
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

        // 3. If ESI is applicable, ESI-related heads must be non-zero
        if (empRule?.ESIExist === 'Yes') {
            const esiHeads = localHeads.filter(
                (h) => EDITABLE_TYPES.includes(h.HeadType) &&
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

        dispatch(saveNewEmployeeCTC({
            empRefNo:  selectedEmp,
            remarks:   remarks.trim(),
            heads:     localHeads,
            createdBy: userName,
            roleId:    roleId,
        }));
    };

    const empRule     = ctcData?.EmpRuleStatus;
    const hasCtcData  = ctcData && localHeads.length > 0;
    const isBusy      = ctcDataLoading || saveLoading;
    const isFormValid = Boolean(selectedEmp && hasCtcData);

    const tableHead = (
        <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Head Name</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applicable</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mandatory</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Validation</th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Amount</th>
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
                                <IndianRupee className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Payroll Structure (CTC Creation)</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Define Cost To Company for new employees</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Payroll</p>
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
                                <p className="text-xs text-gray-400 dark:text-gray-500">Select an employee to define their CTC structure</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => { dispatch(clearCTCData()); setSelectedEmp(''); setRemarks(''); }}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader
                            icon={User}
                            title="Select Employee"
                            subtitle="Choose the employee for whom CTC is being defined"
                        />

                        {empListError && (
                            <div className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{empListError}</span>
                            </div>
                        )}

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
                                                {emp.FirstName} ({emp.EmpRefNo})
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
                                    onClick={handleLoadCTC}
                                    disabled={!selectedEmp || ctcDataLoading || saveLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {ctcDataLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                                        : <><FileText className="h-4 w-4" /> Load CTC Data</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CTC Data Error ───────────────────────────────────────── */}
                {ctcDataError && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{ctcDataError}</span>
                    </div>
                )}

                {/* ── CTC Data Loaded ──────────────────────────────────────── */}
                {hasCtcData && (
                    <>
                        {/* Employee Info & Rule Status */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Employee Info */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center gap-3">
                                    <Briefcase className="h-4 w-4 text-indigo-500" />
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Employee Info</h2>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Basic employee details</p>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8">
                                    <SectionHeader icon={Briefcase} title="Employee Info" />
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        {[
                                            { label: 'Name',       value: ctcData.EmpName },
                                            { label: 'Category',   value: ctcData.Category || '—' },
                                            { label: 'State',      value: ctcData.State    || '—' },
                                            { label: 'Group',      value: ctcData.GroupName ? `${ctcData.GroupName} (${ctcData.GroupId})` : '—' },
                                            { label: 'Join Month', value: empRule?.JoiningMonthName ? `${empRule.JoiningMonthName} ${empRule.JoiningYear}` : '—' },
                                            { label: 'Probation',  value: ctcData.ProbationAge > 0 ? `${ctcData.ProbationAge} days` : '—' },
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
                                                { label: 'PF Exist',    value: empRule.PFExist    || '—' },
                                                { label: 'ESI Exist',   value: empRule.ESIExist   || '—' },
                                                { label: 'PF %',        value: empRule.PFPercent != null ? `${empRule.PFPercent}%` : '—' },
                                                { label: 'ESI %',       value: empRule.ESIPercent != null ? `${empRule.ESIPercent}%` : '—' },
                                                { label: 'PF Emp %',    value: empRule.PFemployerPercent != null ? `${empRule.PFemployerPercent}%` : '—' },
                                                { label: 'ESI Emp %',   value: empRule.ESIemployerPercent != null ? `${empRule.ESIemployerPercent}%` : '—' },
                                                { label: 'PF Admin %',  value: empRule.PFAdminPercent != null ? `${empRule.PFAdminPercent}%` : '—' },
                                                { label: 'Gratuity',    value: empRule.GratuityRuleExist || '—' },
                                                { label: 'PT Rule',     value: empRule.PTRuleStatus || '—' },
                                                { label: 'Paid Leave',  value: empRule.PaidLeaveExist || '—' },
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                label="Gross Salary"
                                value={grossRow?.HeadAmount || 0}
                                icon={TrendingUp}
                                gradient="from-indigo-500 to-indigo-700"
                                sub="Monthly earnings total"
                            />
                            <StatCard
                                label="Total Deductions"
                                value={deductionTotalRow?.HeadAmount || 0}
                                icon={TrendingDown}
                                gradient="from-rose-500 to-rose-700"
                                sub="Monthly deductions total"
                            />
                            <StatCard
                                label="Net Salary"
                                value={netSalaryRow?.HeadAmount || 0}
                                icon={IndianRupee}
                                gradient="from-emerald-500 to-emerald-700"
                                sub="Gross minus deductions"
                            />
                            <StatCard
                                label="CTC"
                                value={ctcTotalRow?.HeadAmount || 0}
                                icon={Award}
                                gradient="from-purple-500 to-violet-700"
                                sub="Cost To Company"
                            />
                        </div>

                        {/* ── Earnings Table ─────────────────────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 flex items-center gap-3">
                                <TrendingUp className="h-4 w-4 text-indigo-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Earnings</h2>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Define monthly earning amounts for each head</p>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 pb-0">
                                <SectionHeader icon={TrendingUp} title="Earnings" subtitle="Define monthly earning amounts for each head" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    {tableHead}
                                    <tbody>
                                        {earningHeads.map((h) => (
                                            <HeadRow key={h.Rowno} head={h} onAmountChange={handleAmountChange} disabled={saveLoading} />
                                        ))}
                                        {grossRow && (
                                            <TotalRow
                                                label="GROSS SALARY"
                                                value={grossRow.HeadAmount}
                                                colorClass="text-emerald-700 dark:text-emerald-400"
                                            />
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
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Define monthly deduction amounts</p>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 pb-0">
                                    <SectionHeader icon={TrendingDown} title="Deductions" subtitle="Define monthly deduction amounts" />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        {tableHead}
                                        <tbody>
                                            {deductionHeads.map((h) => (
                                                <HeadRow key={h.Rowno} head={h} onAmountChange={handleAmountChange} disabled={saveLoading} />
                                            ))}
                                            {deductionTotalRow && (
                                                <TotalRow
                                                    label="DEDUCTION TOTAL"
                                                    value={deductionTotalRow.HeadAmount}
                                                    colorClass="text-rose-700 dark:text-rose-400"
                                                />
                                            )}
                                            {netSalaryRow && (
                                                <TotalRow
                                                    label="NET SALARY"
                                                    value={netSalaryRow.HeadAmount}
                                                    colorClass="text-indigo-700 dark:text-indigo-400"
                                                />
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
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Define benefit amounts</p>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 pb-0">
                                    <SectionHeader icon={Award} title="Reimbursable Payments / Benefits" subtitle="Define benefit amounts" />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        {tableHead}
                                        <tbody>
                                            {benefitHeads.map((h) => (
                                                <HeadRow key={h.Rowno} head={h} onAmountChange={handleAmountChange} disabled={saveLoading} />
                                            ))}
                                            {benefitTotalRow && (
                                                <TotalRow
                                                    label="BENEFITS TOTAL"
                                                    value={benefitTotalRow.HeadAmount}
                                                    colorClass="text-amber-700 dark:text-amber-400"
                                                />
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
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Define other benefit amounts</p>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 pb-0">
                                    <SectionHeader icon={DollarSign} title="Other Benefits" subtitle="Define other benefit amounts" />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        {tableHead}
                                        <tbody>
                                            {otherBenefitHeads.map((h) => (
                                                <HeadRow key={h.Rowno} head={h} onAmountChange={handleAmountChange} disabled={saveLoading} />
                                            ))}
                                            {otherBenefitTotalRow && (
                                                <TotalRow
                                                    label="OTHER BENEFITS TOTAL"
                                                    value={otherBenefitTotalRow.HeadAmount}
                                                    colorClass="text-purple-700 dark:text-purple-400"
                                                />
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── CTC Summary Banner ─────────────────────────────── */}
                        {ctcTotalRow && (
                            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 p-5 text-white shadow-lg shadow-indigo-500/20">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Award className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Cost To Company (CTC)</p>
                                            <p className="text-3xl font-black mt-0.5">₹{fmt(ctcTotalRow.HeadAmount)}</p>
                                            <p className="text-xs text-white/70">Per Month</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-white/70">Annual CTC</p>
                                        <p className="text-2xl font-bold">₹{fmt((ctcTotalRow.HeadAmount || 0) * 12)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Remarks & Submit ───────────────────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center gap-3">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Remarks &amp; Submission</h2>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Add remarks and submit the CTC structure</p>
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
                                    disabled={saveLoading}
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
                                    ? <><span className="font-bold text-indigo-600 dark:text-indigo-400">CTC Structure</span> — ready to be saved</>
                                    : 'Select an employee and load CTC data first'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => { dispatch(clearCTCData()); setSelectedEmp(''); setRemarks(''); }}
                                disabled={saveLoading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-4 w-4" /> Reset
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saveLoading || !hasCtcData}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {saveLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                                    : <><Send className="h-4 w-4" /> Submit CTC</>
                                }
                            </button>
                        </div>
                    </div>

                    {!isFormValid && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg px-4 py-2.5">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Please select an employee and load CTC data before submitting.</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StaffPayrollStructure;
