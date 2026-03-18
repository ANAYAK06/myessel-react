import React, { useState, useEffect, useMemo } from 'react';
import CustomDatePicker from '../../components/CustomDatePicker';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import {
    fetchSalaryEmpForAdvance,
    fetchEmpWorkingCC,
    saveAdvanceRequest,
    clearSaveResult,
    clearEmpCC,
    resetCreationFlow,
    selectEmpList,
    selectEmpCC,
    selectSaveStatus,
    selectSaveLoading,
    selectEmpListLoading,
    selectEmpCCLoading,
} from '../../slices/HRSlice/staffAdvanceSlice';

import {
    Wallet, User, Building2, Loader2, CheckCircle,
    AlertCircle, RotateCcw, Send, ChevronDown,
    Navigation, TrendingUp, Calendar, Hash,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// "DD/MM/YYYY" → "DD-MMM-YYYY" (server format)
const toServerDate = (ddmmyyyy) => {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return ddmmyyyy;
    const [dd, mm, yyyy] = parts;
    return `${dd}-${MONTH_ABBR[parseInt(mm, 10) - 1]}-${yyyy}`;
};

// Normalize CustomDatePicker onChange value → "DD/MM/YYYY"
const toDisplayDate = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (val instanceof Date) {
        return `${String(val.getDate()).padStart(2,'0')}/${String(val.getMonth()+1).padStart(2,'0')}/${val.getFullYear()}`;
    }
    return '';
};

// Today as "DD/MM/YYYY"
const todayDisplayDate = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const generateEMIMonths = () => {
    const result = [];
    const now = new Date();
    let year  = now.getFullYear();
    let month = now.getMonth() + 1; // start from next month
    for (let i = 0; i < 12; i++) {
        if (month > 11) { month = 0; year += 1; }
        result.push({
            label: `${MONTH_FULL[month]} ${year}`,
            value: `01-${MONTH_ABBR[month]}-${year}`,
        });
        month += 1;
    }
    return result;
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

const readOnlyInputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-gray-50 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700/60 cursor-not-allowed select-none';

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffAdvanceRequest = () => {
    const dispatch = useDispatch();

    const { userData }  = useSelector((s) => s.auth);
    const userName      = userData?.userName || userData?.username || 'User';
    const userRoleId    = userData?.roleId   || userData?.RID      || 0;

    const empList        = useSelector(selectEmpList);
    const empCC          = useSelector(selectEmpCC);
    const saveStatus     = useSelector(selectSaveStatus);
    const saveLoading    = useSelector(selectSaveLoading);
    const empListLoading = useSelector(selectEmpListLoading);
    const empCCLoading   = useSelector(selectEmpCCLoading);

    const [selectedEmp,    setSelectedEmp]    = useState('');
    const [advanceType,    setAdvanceType]    = useState('LTA');
    const [amount,         setAmount]         = useState('');
    const [installments,   setInstallments]   = useState('');
    const [emiStartMonth,  setEmiStartMonth]  = useState('');
    const [purpose,        setPurpose]        = useState('');
    const [requestedDate,  setRequestedDate]  = useState(todayDisplayDate());

    const emiMonths = useMemo(() => generateEMIMonths(), []);

    const { ccCode, ccName } = useMemo(() => {
        if (!empCC) return { ccCode: '', ccName: '' };
        const idx = empCC.indexOf(',');
        if (idx === -1) return { ccCode: empCC.trim(), ccName: '' };
        return { ccCode: empCC.slice(0, idx).trim(), ccName: empCC.slice(idx + 1).trim() };
    }, [empCC]);

    const emiAmount = useMemo(() => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return '';
        if (advanceType === 'SA') return amt.toFixed(2);
        const inst = parseInt(installments, 10);
        if (isNaN(inst) || inst <= 0) return '';
        return (amt / inst).toFixed(2);
    }, [amount, installments, advanceType]);

    const effectiveInstallments = advanceType === 'SA' ? 1 : (parseInt(installments, 10) || 0);

    const selectedEmpName = useMemo(() => {
        if (!selectedEmp || !Array.isArray(empList)) return '';
        return empList.find((e) => String(e.EmpRefNo) === String(selectedEmp))?.Name || '';
    }, [selectedEmp, empList]);

    useEffect(() => {
        dispatch(fetchSalaryEmpForAdvance());
        return () => { dispatch(resetCreationFlow()); };
    }, [dispatch]);

    const handleEmpChange = (e) => {
        const val = e.target.value;
        setSelectedEmp(val);
        dispatch(clearEmpCC());
        if (val) dispatch(fetchEmpWorkingCC(val));
    };

    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Advance request submitted successfully!');
            setSelectedEmp(''); setAdvanceType('LTA'); setAmount('');
            setInstallments(''); setEmiStartMonth(''); setPurpose('');
            setRequestedDate(todayDisplayDate());
            dispatch(clearEmpCC());
            dispatch(clearSaveResult());
        } else if (saveStatus === 'failed') {
            toast.error('Submission failed. Please try again.');
            dispatch(clearSaveResult());
        }
    }, [saveStatus]); // eslint-disable-line

    const handleReset = () => {
        setSelectedEmp(''); setAdvanceType('LTA'); setAmount('');
        setInstallments(''); setEmiStartMonth(''); setPurpose('');
        setRequestedDate(todayDisplayDate());
        dispatch(clearEmpCC());
        dispatch(clearSaveResult());
    };

    const handleSubmit = () => {
        if (!selectedEmp)                                          { toast.error('Please select an employee.');               return; }
        if (!requestedDate)                                        { toast.error('Please select a request date.');            return; }
        if (!amount || parseFloat(amount) <= 0)                    { toast.error('Please enter a valid advance amount.');     return; }
        if (advanceType === 'LTA' && (!installments || parseInt(installments, 10) <= 0)) { toast.error('Please enter number of installments.'); return; }
        if (!emiStartMonth)                                        { toast.error('Please select an EMI start month.');        return; }
        if (!purpose.trim())                                       { toast.error('Please enter purpose / remarks.');          return; }

        dispatch(saveAdvanceRequest({
            EmpRefno:         String(selectedEmp),
            AdvanceType:      advanceType,
            LTAAmount:        parseFloat(amount),
            NoOfInstallments: effectiveInstallments,
            EMIAmount:        parseFloat(emiAmount || '0'),
            EMIStartDate:     emiStartMonth,
            Purpose:          purpose.trim(),
            RequestedDate:    toServerDate(requestedDate),
            CCCode:           ccCode,
            RoleID:           Number(userRoleId),
            Createdby:        userName,
        }));
    };

    const isFormValid = Boolean(
        selectedEmp &&
        requestedDate &&
        amount && parseFloat(amount) > 0 &&
        (advanceType === 'SA' || (installments && parseInt(installments, 10) > 0)) &&
        emiStartMonth &&
        purpose.trim().length > 0
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Wallet className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">HR Advance Request</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Submit LTA or Salary Advance requests for staff</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Advance</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ═══ Section 1: Employee Selection ═══ */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Employee Selection</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Select the employee for this advance request</p>
                            </div>
                        </div>
                        <button type="button" onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader icon={User} title="Select Employee" subtitle="Choose the employee for whom this advance is being raised" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Employee <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedEmp}
                                        onChange={handleEmpChange}
                                        disabled={empListLoading}
                                        className={`${inputCls} appearance-none pr-10 disabled:opacity-60 disabled:cursor-not-allowed`}>
                                        <option value="">{empListLoading ? 'Loading employees…' : '— Select Employee —'}</option>
                                        {Array.isArray(empList) && empList
                                            .filter((emp, idx, arr) => arr.findIndex((e) => e.EmpRefNo === emp.EmpRefNo) === idx)
                                            .map((emp) => (
                                                <option key={emp.EmpRefNo} value={emp.EmpRefNo}>{emp.Name}</option>
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
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Request Date <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                                <CustomDatePicker
                                    value={requestedDate}
                                    onChange={(val) => setRequestedDate(toDisplayDate(val))}
                                    format="DD/MM/YYYY"
                                    placeholder="Select request date"
                                />
                            </div>
                        </div>

                        {/* Employee info strip */}
                        {selectedEmp && (
                            <div className="mt-5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
                                {empCCLoading ? (
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Fetching cost centre…</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedEmpName || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                                                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{ccCode || 'Cost Centre'}</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{ccName || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ Section 2: Advance Type ═══ */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Advance Type</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Select the type of advance</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader icon={TrendingUp} title="Select Advance Type" subtitle="Choose between Long Term Advance (LTA) or Salary Advance (SA)" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* LTA */}
                            <button type="button"
                                onClick={() => { setAdvanceType('LTA'); setInstallments(''); }}
                                className={`relative rounded-xl border-2 p-5 text-left transition-all
                                    ${advanceType === 'LTA'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-md shadow-indigo-100 dark:shadow-indigo-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10'
                                    }`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${advanceType === 'LTA' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        <TrendingUp className={`h-5 w-5 ${advanceType === 'LTA' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold ${advanceType === 'LTA' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>LTA</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Long Term Advance</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Repaid in multiple EMIs over time</p>
                                    </div>
                                    {advanceType === 'LTA' && <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />}
                                </div>
                            </button>

                            {/* SA */}
                            <button type="button"
                                onClick={() => { setAdvanceType('SA'); setInstallments(''); }}
                                className={`relative rounded-xl border-2 p-5 text-left transition-all
                                    ${advanceType === 'SA'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-md shadow-purple-100 dark:shadow-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-950/10'
                                    }`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${advanceType === 'SA' ? 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-md' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        <Wallet className={`h-5 w-5 ${advanceType === 'SA' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold ${advanceType === 'SA' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200'}`}>SA</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Salary Advance</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Single instalment deducted from next salary</p>
                                    </div>
                                    {advanceType === 'SA' && <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══ Section 3: Advance Details ═══ */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <Hash className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Advance Details</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {advanceType === 'LTA' ? 'Amount, installments and EMI start month' : 'Amount and EMI start month'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader icon={Hash} title="Advance Details"
                            subtitle={advanceType === 'LTA' ? 'Enter amount, number of installments, and EMI start month' : 'Enter salary advance amount and EMI start month'} />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Advance Amount */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Advance Amount (₹) <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                                <input type="number" min="0" step="0.01" placeholder="0.00"
                                    value={amount} onChange={(e) => setAmount(e.target.value)}
                                    className={inputCls} />
                            </div>

                            {/* Installments — LTA only */}
                            {advanceType === 'LTA' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        No. of Installments <span className="text-rose-500 ml-0.5">*</span>
                                    </label>
                                    <input type="number" min="1" step="1" placeholder="e.g. 12"
                                        value={installments} onChange={(e) => setInstallments(e.target.value)}
                                        className={inputCls} />
                                </div>
                            )}

                            {/* EMI Amount (read-only) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">EMI Amount (₹)</label>
                                <div className="relative">
                                    <input type="text" readOnly
                                        value={emiAmount !== '' ? `₹ ${parseFloat(emiAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                        className={readOnlyInputCls} />
                                    {advanceType === 'SA' && (
                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">1 inst.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* EMI Start Month */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    EMI Start Month <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                                <div className="relative">
                                    <select value={emiStartMonth} onChange={(e) => setEmiStartMonth(e.target.value)}
                                        className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">— Select Month —</option>
                                        {emiMonths.map((m) => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* EMI breakdown strip (LTA only) */}
                        {advanceType === 'LTA' && amount && installments && emiAmount && (
                            <div className="mt-5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-5 py-4">
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Total Amount</span>
                                        <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                            ₹ {parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-700 hidden sm:block" />
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Installments</span>
                                        <span className="font-bold text-purple-700 dark:text-purple-300">{installments}</span>
                                    </div>
                                    <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-700 hidden sm:block" />
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Monthly EMI</span>
                                        <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                            ₹ {parseFloat(emiAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ Section 4: Purpose ═══ */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Purpose / Remarks</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Describe the reason for this advance request</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader icon={Building2} title="Purpose / Remarks" subtitle="Provide a clear reason for raising this advance" />
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            Purpose <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        <textarea rows={4} placeholder="Enter the purpose or reason for this advance request…"
                            value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={500}
                            className={`${inputCls} resize-none`} />
                        <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500 text-right">{purpose.trim().length} / 500</p>
                    </div>
                </div>

                {/* ═══ Action Bar ═══ */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Ready to submit?</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {isFormValid
                                    ? <><span className="font-bold text-indigo-600 dark:text-indigo-400">{advanceType === 'LTA' ? 'Long Term Advance' : 'Salary Advance'}</span> · ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}{emiAmount ? ` · EMI ₹${parseFloat(emiAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}</>
                                    : 'Fill in all required fields above'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={handleReset} disabled={saveLoading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-4 w-4" /> Reset
                            </button>
                            <button type="button" onClick={handleSubmit} disabled={!isFormValid || saveLoading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {saveLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                    : <><Send className="h-4 w-4" /> Submit Request</>
                                }
                            </button>
                        </div>
                    </div>

                    {!isFormValid && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg px-4 py-2.5">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Please fill in all required fields before submitting.</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StaffAdvanceRequest;
