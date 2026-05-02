import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Landmark, ChevronDown, Loader2, RotateCcw, Send, CheckCircle,
    Navigation, IndianRupee, Hash, FileText, Eye, BadgePercent,
    CreditCard, Building2, Info,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchAllLoans, fetchLoanDetails, submitTermLoanPayment,
    clearLoanDetails, clearSaveResult, resetTermLoanPayment,
    selectLoans, selectLoansLoading,
    selectLoanDetails, selectLoanDetailsLoading, selectLoanDetailsError,
    selectTLPSaveStatus, selectTLPSaveLoading, selectTLPSaveError,
} from '../../slices/accountsSlice/termLoanPaymentSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const PAYMENT_TYPES   = ['Installment', 'Preclosure'];
const CLOSURE_TYPES   = ['Full', 'Partial'];
const MODE_OPTIONS    = ['Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI'];
const STEPS           = ['Loan Selection', 'Payment Details', 'Review'];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDateForAPI = (val) => {
    if (!val) return '';
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
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

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
        <Icon className="h-4 w-4 text-indigo-500" />
        <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
    </div>
);

const ChipGroup = ({ options, value, onChange, colorActive = 'indigo' }) => {
    const colors = {
        indigo:  'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30',
        violet:  'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/30',
        rose:    'bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-200 dark:shadow-rose-900/30',
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
            const done   = idx < current;
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

const TermLoanPayment = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId    = userData?.roleId    || userData?.RID  || 0;
    const createdBy = userData?.empCode   || userData?.userId || userData?.UID || '';

    const loans              = useSelector(selectLoans);
    const loansLoading       = useSelector(selectLoansLoading);
    const loanDetails        = useSelector(selectLoanDetails);
    const loanDetailsLoading = useSelector(selectLoanDetailsLoading);
    const loanDetailsError   = useSelector(selectLoanDetailsError);
    const saveStatus         = useSelector(selectTLPSaveStatus);
    const saveLoading        = useSelector(selectTLPSaveLoading);
    const saveError          = useSelector(selectTLPSaveError);

    // ── Form state ────────────────────────────────────────────────────────────

    const [step,        setStep]       = useState(1);
    const [submitted,   setSubmitted]  = useState(false);

    // Step 1
    const [paymentType, setPaymentType] = useState('');
    const [loanNo,      setLoanNo]      = useState('');

    // Step 2 — Amounts
    const [balAmount,      setBalAmount]      = useState('');
    const [principleAmt,   setPrincipleAmt]   = useState('');
    const [interestAmt,    setInterestAmt]    = useState('');
    const [installmentNo,  setInstallmentNo]  = useState('');
    const [closureType,    setClosureType]    = useState('');   // Preclosure only
    const [remarks,        setRemarks]        = useState('');

    // Step 2 — Bank
    const [bankName,     setBankName]     = useState('');
    const [bankDate,     setBankDate]     = useState(null);
    const [modeOfPay,    setModeOfPay]    = useState('');
    const [chequeNo,     setChequeNo]     = useState('');
    const [instrumentNo, setInstrumentNo] = useState('');
    const [bankRemarks,  setBankRemarks]  = useState('');

    // ── Derived ───────────────────────────────────────────────────────────────

    const totalAmount = (
        (parseFloat(principleAmt)  || 0) +
        (parseFloat(interestAmt)   || 0)
    ).toFixed(2);

    const isPreclosure = paymentType === 'Preclosure';

    // ── On mount ──────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAllLoans());
        return () => dispatch(resetTermLoanPayment());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── Fetch loan details when loan number selected ──────────────────────────
    useEffect(() => {
        if (loanNo) {
            dispatch(fetchLoanDetails(loanNo));
        } else {
            dispatch(clearLoanDetails());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loanNo]);

    // ── Pre-fill amounts from loan details ────────────────────────────────────
    useEffect(() => {
        if (loanDetails) {
            setBalAmount(loanDetails.Pricipleamt || '');        // balance remaining on the loan
            setInstallmentNo(loanDetails.instno != null ? String(loanDetails.instno) : '');
        }
    }, [loanDetails]);

    // ── Toast on save result ──────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Term loan payment saved successfully!');
            setSubmitted(true);
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleReset = useCallback(() => {
        setStep(1); setSubmitted(false);
        setPaymentType(''); setLoanNo('');
        setBalAmount(''); setPrincipleAmt(''); setInterestAmt('');
        setInstallmentNo(''); setClosureType(''); setRemarks('');
        setBankName(''); setBankDate(null); setModeOfPay('');
        setChequeNo(''); setInstrumentNo(''); setBankRemarks('');
        dispatch(resetTermLoanPayment());
        dispatch(fetchAllLoans());
    }, [dispatch]);

    const handleLoanChange = (val) => {
        setLoanNo(val);
        // Reset pre-filled fields when loan changes
        setBalAmount('');
        setInstallmentNo('');
    };

    const handleSubmit = () => {
        dispatch(submitTermLoanPayment({
            PaymentType:  paymentType,
            LoanNo:       loanNo,
            BalAmount:    String(balAmount   || '0'),
            Principleamt: String(principleAmt || '0'),
            IntrestAmt:   String(interestAmt  || '0'),
            instno:       parseInt(installmentNo || '0', 10),
            TLPRemarks:   remarks,
            BankName:     bankName,
            Bankdate:     formatDateForAPI(bankDate),
            Modeofpay:    modeOfPay,
            paymentstatus: isPreclosure ? closureType : paymentType,
            Cheque:       modeOfPay === 'Cheque' ? chequeNo : '0',
            Instrumentno: modeOfPay !== 'Cheque' ? instrumentNo : '0',
            BankRemarks:  bankRemarks,
            TotalAmount:  String(totalAmount),
            RoleId:       parseInt(roleId, 10),
            Createdby:    String(createdBy),
        }));
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const step1Valid = paymentType && loanNo;

    const step2Valid =
        principleAmt && parseFloat(principleAmt) >= 0 &&
        interestAmt  !== '' &&
        installmentNo &&
        bankName && bankDate instanceof Date && modeOfPay &&
        (isPreclosure ? !!closureType : true);

    // ── Success screen ────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-sm w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Payment Recorded</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Loan <span className="font-semibold text-gray-700 dark:text-gray-300">{loanNo}</span> payment has been submitted.
                    </p>
                    <p className="text-xs text-gray-400 mb-6">{paymentType}{isPreclosure && closureType ? ` — ${closureType}` : ''}</p>
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
                                    {menuData?.name || 'Term Loan Repayment'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Record installment or preclosure payment for a term loan</p>
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

                {/* ── STEP 1: Loan Selection ────────────────────────────────── */}
                {step === 1 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader icon={FileText} title="Loan Selection"
                            subtitle="Choose payment type and the loan to repay"
                        />
                        <div className="p-6 md:p-8 space-y-6">

                            {/* Payment Type */}
                            <div>
                                <Label required>Payment Type</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                    {PAYMENT_TYPES.map(type => {
                                        const active = paymentType === type;
                                        return (
                                            <button key={type} type="button" onClick={() => { setPaymentType(type); setClosureType(''); }}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                                                    ${active ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
                                                <div className={`p-2 rounded-lg shrink-0 ${active ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                    {type === 'Installment'
                                                        ? <IndianRupee className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                                        : <Building2   className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                                    }
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${active ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>{type}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                        {type === 'Installment' ? 'Regular scheduled repayment' : 'Early full or partial closure of loan'}
                                                    </p>
                                                </div>
                                                {active && <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 ml-auto shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Loan Number */}
                            <div className="max-w-sm">
                                <Label required>Loan Number</Label>
                                <div className="relative">
                                    <select className={inputCls} value={loanNo} onChange={e => handleLoanChange(e.target.value)} disabled={loansLoading}>
                                        <option value="">{loansLoading ? 'Loading…' : '— Select loan —'}</option>
                                        {loans.map(l => (
                                            <option key={l.Loanid} value={l.Loanid}>{l.Loanvalue}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={loansLoading} />
                                </div>
                            </div>

                            {/* Loan details preview */}
                            {loanDetailsLoading && (
                                <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Fetching loan details…
                                </div>
                            )}
                            {loanDetailsError && (
                                <p className="text-sm text-rose-500">{loanDetailsError}</p>
                            )}
                            {loanDetails && !loanDetailsLoading && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4 flex flex-wrap gap-6">
                                    <div>
                                        <p className="text-xs text-indigo-400 uppercase tracking-wider font-bold mb-0.5">Loan / Agency</p>
                                        <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{loanDetails.Termloancodeandname || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-400 uppercase tracking-wider font-bold mb-0.5">Principal Amount</p>
                                        <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{fmtAmt(loanDetails.Pricipleamt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-400 uppercase tracking-wider font-bold mb-0.5">Installment No.</p>
                                        <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{loanDetails.instno ?? '—'}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setStep(2)} disabled={!step1Valid || loanDetailsLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    Continue <CheckCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Payment Details ───────────────────────────────── */}
                {step === 2 && (
                    <>
                        {/* Payment Amounts */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={IndianRupee} title="Payment Amounts"
                                subtitle="Enter the payment breakdown for this repayment"
                            />
                            <div className="p-6 md:p-8 space-y-6">

                                {/* Loan info strip */}
                                {loanDetails && (
                                    <div className="flex items-start gap-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-3 border border-indigo-100 dark:border-indigo-800/40">
                                        <Info className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                            <span className="font-bold">{loanNo}</span> — {loanDetails.Termloancodeandname || ''}
                                            &ensp;·&ensp;<span className="font-bold">{paymentType}</span>
                                            {isPreclosure && closureType ? ` (${closureType})` : ''}
                                        </p>
                                    </div>
                                )}

                                {/* Preclosure sub-type */}
                                {isPreclosure && (
                                    <div>
                                        <Label required>Closure Type</Label>
                                        <ChipGroup options={CLOSURE_TYPES} value={closureType} onChange={setClosureType} colorActive="rose" />
                                    </div>
                                )}

                                {/* Amount fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <Label>Balance Amount (₹)</Label>
                                        <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                            value={balAmount} onChange={e => setBalAmount(e.target.value)} />
                                        <p className="text-xs text-gray-400 mt-1">Pre-filled from loan balance</p>
                                    </div>
                                    <div>
                                        <Label required>Principal Amount (₹)</Label>
                                        <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                            value={principleAmt} onChange={e => setPrincipleAmt(e.target.value)} />
                                        <p className="text-xs text-gray-400 mt-1">Principal portion of this payment</p>
                                    </div>
                                    <div>
                                        <Label required>Interest Amount (₹)</Label>
                                        <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                            value={interestAmt} onChange={e => setInterestAmt(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Total Amount (₹)</Label>
                                        <div className="relative">
                                            <input type="text" readOnly className={readonlyCls + ' pr-8'}
                                                value={parseFloat(totalAmount) > 0 ? totalAmount : ''} placeholder="Auto-computed" />
                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <Hash className="h-3.5 w-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Principal + Interest</p>
                                    </div>
                                </div>

                                {/* Installment No + Remarks */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label required>Installment Number</Label>
                                        <div className="relative">
                                            <input type="number" min="1" step="1" className={inputCls + ' pr-8'} placeholder="e.g. 12"
                                                value={installmentNo} onChange={e => setInstallmentNo(e.target.value)} />
                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <BadgePercent className="h-3.5 w-3.5 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Pre-filled from loan</p>
                                    </div>
                                    <div>
                                        <Label>Remarks</Label>
                                        <input type="text" className={inputCls} placeholder="Payment remarks…"
                                            value={remarks} onChange={e => setRemarks(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank & Payment Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={CreditCard} title="Bank & Payment Details"
                                subtitle="Bank account, date and mode of payment"
                            />
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <Label required>Bank Name</Label>
                                        <input type="text" className={inputCls} placeholder="Enter bank name"
                                            value={bankName} onChange={e => setBankName(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label required>Bank / Payment Date</Label>
                                        <CustomDatePicker value={bankDate} onChange={setBankDate}
                                            format="DD-MMM-YYYY" placeholder="Select date" />
                                    </div>
                                    <div>
                                        <Label>Bank Remarks</Label>
                                        <input type="text" className={inputCls} placeholder="Bank transaction remarks…"
                                            value={bankRemarks} onChange={e => setBankRemarks(e.target.value)} />
                                    </div>
                                </div>

                                <div>
                                    <Label required>Mode of Payment</Label>
                                    <ChipGroup options={MODE_OPTIONS} value={modeOfPay} onChange={setModeOfPay} colorActive="violet" />
                                </div>

                                {modeOfPay && (
                                    <div className="max-w-sm">
                                        <Label>{modeOfPay === 'Cheque' ? 'Cheque Number' : 'Instrument / Reference No'}</Label>
                                        <input type="text" className={inputCls} placeholder="Enter number"
                                            value={modeOfPay === 'Cheque' ? chequeNo : instrumentNo}
                                            onChange={e => modeOfPay === 'Cheque' ? setChequeNo(e.target.value) : setInstrumentNo(e.target.value)} />
                                    </div>
                                )}
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
                            subtitle="Confirm all payment details before submitting"
                        />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                                {/* Left — Loan Identity */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Loan Identity</p>
                                    <ReviewRow label="Payment Type"   value={paymentType} highlight />
                                    {isPreclosure && <ReviewRow label="Closure Type" value={closureType} />}
                                    <ReviewRow label="Loan Number"    value={loanNo} />
                                    {loanDetails?.Termloancodeandname && (
                                        <ReviewRow label="Agency / Loan"  value={loanDetails.Termloancodeandname} />
                                    )}
                                    <ReviewRow label="Installment No" value={installmentNo} />
                                    {remarks && <ReviewRow label="Remarks" value={remarks} />}
                                </div>

                                {/* Right — Payment Amounts */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Payment Amounts</p>
                                    {balAmount && <ReviewRow label="Balance Amount"    value={fmtAmt(balAmount)} />}
                                    <ReviewRow label="Principal Amount"  value={fmtAmt(principleAmt)} />
                                    <ReviewRow label="Interest Amount"   value={fmtAmt(interestAmt)} />
                                    <ReviewRow label="Total Amount"      value={fmtAmt(totalAmount)} highlight />
                                </div>

                                {/* Bank Details — full width */}
                                <div className="md:col-span-2 bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Bank & Payment Details</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                                        <div><ReviewRow label="Bank"         value={bankName} /></div>
                                        <div><ReviewRow label="Bank Date"    value={formatDateForAPI(bankDate)} /></div>
                                        <div><ReviewRow label="Mode"         value={modeOfPay} /></div>
                                        {(chequeNo || instrumentNo) && (
                                            <div><ReviewRow label={modeOfPay === 'Cheque' ? 'Cheque No' : 'Instrument No'}
                                                value={modeOfPay === 'Cheque' ? chequeNo : instrumentNo} /></div>
                                        )}
                                        {bankRemarks && <div className="col-span-2"><ReviewRow label="Bank Remarks" value={bankRemarks} /></div>}
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

export default TermLoanPayment;
