import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Landmark, ChevronDown, Loader2, RotateCcw, Send, CheckCircle,
    Navigation, Building2, IndianRupee, Hash, Calendar, FileText,
    Eye, BadgePercent, Banknote, CreditCard,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchAgencyCodes, submitTermLoan,
    clearSaveResult, resetTermLoanCreation,
    selectAgencies, selectAgenciesLoading,
    selectTLSaveStatus, selectTLSaveLoading, selectTLSaveError,
} from '../../slices/accountsSlice/termLoanCreationSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const LOAN_TYPES      = ['For Capital', 'For Asset Purchase'];
const EMI_FREQUENCIES = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
const MODE_OPTIONS    = ['Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI'];
const STEPS           = ['Loan Setup', 'Financial Details', 'Review'];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDateForAPI = (val) => {
    if (!val) return '';
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const calcInstallments = (start, end, freq) => {
    if (!(start instanceof Date) || !(end instanceof Date) || !freq) return '';
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months <= 0) return '';
    const divisor = { Monthly: 1, Quarterly: 3, 'Half-Yearly': 6, Yearly: 12 }[freq] ?? 1;
    return String(Math.round(months / divisor));
};

const fmtAmt = (n) => {
    const num = parseFloat(n);
    if (!n && n !== 0) return '—';
    if (isNaN(num)) return '—';
    return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const readonlyCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 cursor-not-allowed';

const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const SelectIcon = ({ loading }) => (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        {loading ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                 : <ChevronDown className="h-4 w-4 text-gray-400" />}
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
        <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-indigo-500" />
            <div>
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
            </div>
        </div>
        {action}
    </div>
);

const ChipGroup = ({ options, value, onChange, colorActive = 'indigo' }) => {
    const colors = {
        indigo:  'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30',
        violet:  'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/30',
        emerald: 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30',
    };
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button key={opt} type="button" onClick={() => onChange(opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        value === opt ? colors[colorActive]
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}>
                    {opt}
                </button>
            ))}
        </div>
    );
};

const StepIndicator = ({ current }) => (
    <div className="flex items-center">
        {STEPS.map((label, i) => {
            const idx = i + 1;
            const done = idx < current;
            const active = idx === current;
            return (
                <React.Fragment key={idx}>
                    <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                            ${done   ? 'bg-white border-white text-indigo-600'
                            : active ? 'bg-white/20 border-white text-white'
                            :          'bg-white/10 border-white/30 text-white/50'}`}>
                            {done ? <CheckCircle className="h-4 w-4" /> : idx}
                        </div>
                        <span className={`mt-1 text-xs font-medium hidden sm:block ${active ? 'text-white' : done ? 'text-indigo-200' : 'text-white/40'}`}>
                            {label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-4 rounded ${done ? 'bg-white/60' : 'bg-white/20'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

const ReviewRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <span className={`text-xs font-semibold text-right max-w-[60%] ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
        </span>
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const TermLoanCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId    = userData?.roleId    || userData?.RID  || 0;
    const createdBy = userData?.empCode   || userData?.userId || userData?.UID || '';

    const agencies       = useSelector(selectAgencies);
    const agenciesLoading= useSelector(selectAgenciesLoading);
    const banks          = useSelector(selectBankDetailsArray);
    const banksLoading   = useSelector(selectBankDetailsLoading);
    const saveStatus     = useSelector(selectTLSaveStatus);
    const saveLoading    = useSelector(selectTLSaveLoading);
    const saveError      = useSelector(selectTLSaveError);

    // ── Form state ────────────────────────────────────────────────────────────
    const [step,             setStep]           = useState(1);
    const [submitted,        setSubmitted]      = useState(false);

    // Step 1 — Loan Setup
    const [loanType,         setLoanType]       = useState('');
    const [agencyCode,       setAgencyCode]     = useState('');
    const [loanNo,           setLoanNo]         = useState('');
    const [loanAppliedDate,  setLoanAppliedDate]= useState(null);
    const [loanPurpose,      setLoanPurpose]    = useState('');

    // Step 2 — Financial Details
    const [disbursalAmt,     setDisbursalAmt]   = useState('');
    const [processingAmt,    setProcessingAmt]  = useState('');
    const [instStartDate,    setInstStartDate]  = useState(null);
    const [instEndDate,      setInstEndDate]    = useState(null);
    const [installmentNos,   setInstallmentNos] = useState('');
    const [emiFrequency,     setEmiFrequency]   = useState('');
    const [interestRate,     setInterestRate]   = useState('');

    // Step 2 — Disbursement / Payment
    const [creditBankId,     setCreditBankId]   = useState('');   // For Capital only
    const [bankNameText,     setBankNameText]   = useState('');   // For Asset Purchase
    const [bankDate,         setBankDate]       = useState(null);
    const [modeOfPay,        setModeOfPay]      = useState('');
    const [instrumentNo,     setInstrumentNo]   = useState('');

    // ── Derived ───────────────────────────────────────────────────────────────

    const totalAmt = (
        (parseFloat(disbursalAmt)  || 0) +
        (parseFloat(processingAmt) || 0)
    ).toFixed(2);

    const isCapital     = loanType === 'For Capital';
    const selectedBank  = banks.find(b => String(b.BankId) === String(creditBankId));
    const effectiveBankName = isCapital ? (selectedBank?.BankName || '') : bankNameText;

    // ── On mount ──────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAgencyCodes());
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => dispatch(resetTermLoanCreation());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── Toast on save result ──────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Term loan created successfully!');
            setSubmitted(true);
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Auto-calculate installments ───────────────────────────────────────────
    useEffect(() => {
        setInstallmentNos(calcInstallments(instStartDate, instEndDate, emiFrequency));
    }, [instStartDate, instEndDate, emiFrequency]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleReset = useCallback(() => {
        setStep(1); setSubmitted(false);
        setLoanType(''); setAgencyCode(''); setLoanNo('');
        setLoanAppliedDate(null); setLoanPurpose('');
        setDisbursalAmt(''); setProcessingAmt('');
        setInstStartDate(null); setInstEndDate(null);
        setInstallmentNos(''); setEmiFrequency(''); setInterestRate('');
        setCreditBankId(''); setBankNameText('');
        setBankDate(null); setModeOfPay(''); setInstrumentNo('');
        dispatch(resetTermLoanCreation());
    }, [dispatch]);

    const handleSubmit = () => {
        dispatch(submitTermLoan({
            LoanType:           loanType,
            LoanNo:             loanNo,
            AgencyNo:           agencyCode,
            LoanAppliedDate:    formatDateForAPI(loanAppliedDate),
            DisbursalAmt:       String(disbursalAmt  || '0'),
            ProcessingAmt:      String(processingAmt || '0'),
            TotalAmt:           String(totalAmt),
            Installmentstartdate: formatDateForAPI(instStartDate),
            InstallmentEndDate: formatDateForAPI(instEndDate),
            InstallmentNos:     String(installmentNos || ''),
            Emifrequency:       emiFrequency,
            IntrestRate:        String(interestRate || '0'),
            BankName:           effectiveBankName,
            Bankdate:           formatDateForAPI(bankDate),
            Modeofpay:          modeOfPay,
            Instrumentno:       instrumentNo,
            Loanpurpose:        loanPurpose,
            RoleId:             parseInt(roleId, 10),
            Createdby:          String(createdBy),
        }));
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const step1Valid = loanType && agencyCode && loanNo && loanAppliedDate instanceof Date;

    const step2Valid = disbursalAmt && parseFloat(disbursalAmt) > 0 &&
        instStartDate instanceof Date && instEndDate instanceof Date &&
        installmentNos && emiFrequency && interestRate &&
        modeOfPay && bankDate instanceof Date &&
        (isCapital ? !!creditBankId : true);

    // ── Success screen ────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-sm w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Term Loan Created</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Loan <span className="font-semibold text-gray-700 dark:text-gray-300">{loanNo}</span> has been submitted successfully.
                    </p>
                    <p className="text-xs text-gray-400 mb-6">{loanType}</p>
                    <button onClick={handleReset}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all">
                        New Entry
                    </button>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Landmark className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Term Loan Creation'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Create a new term loan — Capital or Asset Purchase</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                            <div className="hidden sm:flex items-center gap-2 text-indigo-200">
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wider">Module</p>
                                    <p className="text-sm font-bold text-white">Accounts / Term Loan</p>
                                </div>
                                <Navigation className="h-5 w-5 opacity-60" />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <StepIndicator current={step} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── STEP 1: Loan Setup ────────────────────────────────────── */}
                {step === 1 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader icon={FileText} title="Loan Setup"
                            subtitle="Loan type, agency, reference number and purpose"
                            action={
                                <button onClick={handleReset}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                                </button>
                            }
                        />
                        <div className="p-6 md:p-8 space-y-6">

                            {/* Loan Type */}
                            <div>
                                <Label required>Loan Type</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                    {LOAN_TYPES.map(type => {
                                        const active = loanType === type;
                                        return (
                                            <button key={type} type="button" onClick={() => setLoanType(type)}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                                                    ${active ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
                                                <div className={`p-2 rounded-lg shrink-0 ${active ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                    {type === 'For Capital'
                                                        ? <Banknote className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                                        : <Building2 className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                                    }
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>{type}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                        {type === 'For Capital' ? 'Loan credited to company bank account' : 'Loan for purchasing a fixed asset'}
                                                    </p>
                                                </div>
                                                {active && <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 ml-auto shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Agency + Loan No + Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <Label required>Agency / Lender</Label>
                                    <div className="relative">
                                        <select className={inputCls} value={agencyCode} onChange={e => setAgencyCode(e.target.value)} disabled={agenciesLoading}>
                                            <option value="">{agenciesLoading ? 'Loading…' : '— Select agency —'}</option>
                                            {agencies.map(a => (
                                                <option key={a.Agencycode} value={a.Agencycode}>{a.AgencyName}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={agenciesLoading} />
                                    </div>
                                </div>

                                <div>
                                    <Label required>Loan Number</Label>
                                    <input type="text" className={inputCls} placeholder="e.g. TL-2024-001"
                                        value={loanNo} onChange={e => setLoanNo(e.target.value)} />
                                </div>

                                <div>
                                    <Label required>Loan Applied Date</Label>
                                    <CustomDatePicker value={loanAppliedDate} onChange={setLoanAppliedDate}
                                        format="DD-MMM-YYYY" placeholder="Select date" />
                                </div>
                            </div>

                            {/* Loan Purpose */}
                            <div>
                                <Label>Loan Purpose</Label>
                                <textarea rows={3} className={inputCls + ' resize-none'} placeholder="Describe the purpose of this term loan…"
                                    value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)} />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    Continue <CheckCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Financial Details ─────────────────────────────── */}
                {step === 2 && (
                    <>
                        {/* Financial structure */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={IndianRupee} title="Loan Amounts & Installments"
                                subtitle="Disbursal, processing fee, EMI schedule and interest rate"
                            />
                            <div className="p-6 md:p-8 space-y-6">

                                {/* Amounts */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label required>Disbursal Amount (₹)</Label>
                                        <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                            value={disbursalAmt} onChange={e => setDisbursalAmt(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Processing Amount (₹)</Label>
                                        <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                            value={processingAmt} onChange={e => setProcessingAmt(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Total Amount (₹)</Label>
                                        <div className="relative">
                                            <input type="text" readOnly className={readonlyCls + ' pr-8'}
                                                value={parseFloat(totalAmt) > 0 ? totalAmt : ''} placeholder="Auto-computed" />
                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <Hash className="h-3.5 w-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Disbursal + Processing</p>
                                    </div>
                                </div>

                                {/* Installment start & end dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label required>Installment Start Date</Label>
                                        <CustomDatePicker value={instStartDate} onChange={setInstStartDate}
                                            format="DD-MMM-YYYY" placeholder="Select date" />
                                    </div>
                                    <div>
                                        <Label required>Installment End Date</Label>
                                        <CustomDatePicker value={instEndDate} onChange={setInstEndDate}
                                            format="DD-MMM-YYYY" placeholder="Select date"
                                            minDate={instStartDate instanceof Date ? instStartDate : null} />
                                    </div>
                                </div>

                                {/* EMI Frequency (drives auto-calculation) */}
                                <div>
                                    <Label required>EMI Frequency</Label>
                                    <ChipGroup options={EMI_FREQUENCIES} value={emiFrequency} onChange={setEmiFrequency} colorActive="indigo" />
                                </div>

                                {/* Auto-calculated installments + Interest Rate */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label required>No. of Installments</Label>
                                        <div className="relative">
                                            <input type="text" readOnly className={readonlyCls + ' pr-8'}
                                                value={installmentNos} placeholder="Select dates & frequency" />
                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <Hash className="h-3.5 w-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Auto-calculated from dates &amp; frequency</p>
                                    </div>
                                    <div>
                                        <Label required>Interest Rate (%)</Label>
                                        <div className="relative">
                                            <input type="number" min="0" step="0.01" className={inputCls + ' pr-8'} placeholder="e.g. 12.5"
                                                value={interestRate} onChange={e => setInterestRate(e.target.value)} />
                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <BadgePercent className="h-3.5 w-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Disbursement / Payment details */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={CreditCard} title="Disbursement Details"
                                subtitle={isCapital ? 'Select the bank account where loan proceeds are credited' : 'Bank and payment details for disbursement'}
                            />
                            <div className="p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                    {/* Bank — dropdown for Capital, text for Asset Purchase */}
                                    {isCapital ? (
                                        <div>
                                            <Label required>Credit to Bank Account</Label>
                                            <div className="relative">
                                                <select className={inputCls} value={creditBankId} onChange={e => setCreditBankId(e.target.value)} disabled={banksLoading}>
                                                    <option value="">{banksLoading ? 'Loading…' : '— Select bank account —'}</option>
                                                    {banks.map(b => (
                                                        <option key={b.BankId} value={b.BankId}>{b.BankName}</option>
                                                    ))}
                                                </select>
                                                <SelectIcon loading={banksLoading} />
                                            </div>
                                            {creditBankId && selectedBank && (
                                                <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" /> {selectedBank.BankName}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <Label>Bank Name</Label>
                                            <input type="text" className={inputCls} placeholder="Enter bank / lender name"
                                                value={bankNameText} onChange={e => setBankNameText(e.target.value)} />
                                        </div>
                                    )}

                                    <div>
                                        <Label required>Bank / Disbursement Date</Label>
                                        <CustomDatePicker value={bankDate} onChange={setBankDate}
                                            format="DD-MMM-YYYY" placeholder="Select date" />
                                    </div>

                                    <div>
                                        <Label required>Mode of Payment</Label>
                                        <ChipGroup options={MODE_OPTIONS} value={modeOfPay} onChange={setModeOfPay} colorActive="violet" />
                                    </div>

                                    {modeOfPay && (
                                        <div>
                                            <Label>{modeOfPay === 'Cheque' ? 'Cheque Number' : 'Instrument / Reference No'}</Label>
                                            <input type="text" className={inputCls} placeholder="Enter number"
                                                value={instrumentNo} onChange={e => setInstrumentNo(e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <button type="button" onClick={() => setStep(1)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                Back
                            </button>
                            <button type="button" onClick={() => setStep(3)} disabled={!step2Valid}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <Eye className="h-4 w-4" /> Review
                            </button>
                        </div>
                    </>
                )}

                {/* ── STEP 3: Review & Submit ───────────────────────────────── */}
                {step === 3 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader icon={Eye} title="Review & Submit"
                            subtitle="Confirm all term loan details before submitting"
                        />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                                {/* Left — Loan Identity */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Loan Identity</p>
                                    <ReviewRow label="Loan Type"        value={loanType} highlight />
                                    <ReviewRow label="Loan Number"      value={loanNo}   />
                                    <ReviewRow label="Agency / Lender"  value={agencies.find(a => a.Agencycode === agencyCode)?.AgencyName || agencyCode} />
                                    <ReviewRow label="Applied Date"     value={formatDateForAPI(loanAppliedDate)} />
                                    {loanPurpose && <ReviewRow label="Purpose" value={loanPurpose} />}
                                </div>

                                {/* Right — Financial */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Financial Details</p>
                                    <ReviewRow label="Disbursal Amount"  value={fmtAmt(disbursalAmt)}  />
                                    <ReviewRow label="Processing Amount" value={fmtAmt(processingAmt)} />
                                    <ReviewRow label="Total Amount"      value={fmtAmt(totalAmt)} highlight />
                                    <ReviewRow label="Interest Rate"     value={interestRate ? `${interestRate}%` : ''} />
                                    <ReviewRow label="EMI Frequency"     value={emiFrequency} />
                                    <ReviewRow label="No. of Installments" value={installmentNos} />
                                    <ReviewRow label="Inst. Start Date"  value={formatDateForAPI(instStartDate)} />
                                    <ReviewRow label="Inst. End Date"    value={formatDateForAPI(instEndDate)} />
                                </div>

                                {/* Disbursement — full width */}
                                <div className="md:col-span-2 bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Disbursement Details</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                                        <div><ReviewRow label="Bank"         value={effectiveBankName} /></div>
                                        <div><ReviewRow label="Bank Date"    value={formatDateForAPI(bankDate)} /></div>
                                        <div><ReviewRow label="Mode"         value={modeOfPay} /></div>
                                        {instrumentNo && <div><ReviewRow label="Instrument No" value={instrumentNo} /></div>}
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between">
                                <button type="button" onClick={() => setStep(2)} disabled={saveLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 disabled:opacity-40 transition-all">
                                    Back
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={saveLoading}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    {saveLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                                        : <><Send className="h-4 w-4" /> Submit</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TermLoanCreation;
