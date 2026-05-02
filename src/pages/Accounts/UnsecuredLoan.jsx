import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Landmark, ChevronDown, Loader2, RotateCcw, Send, CheckCircle,
    Navigation, PlusCircle, TrendingUp, ArrowDownCircle, Pencil,
    IndianRupee, User, Hash, Eye, AlertCircle, BadgePercent,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchAllUnsecuredLoans, fetchLoanAccess,
    submitNewUnsLoan, submitUnsLoanTopUp, submitUnsLoanRepay, submitUpdateInterest,
    clearSaveResult, clearInterestSaveResult, resetUnsecuredLoan,
    selectUnsLoans, selectUnsLoansLoading,
    selectLoanAccess, selectLoanAccessLoading,
    selectUnsSaveStatus, selectUnsSaveLoading, selectUnsSaveError,
    selectInterestSaveStatus, selectInterestSaveLoading, selectInterestSaveError,
} from '../../slices/accountsSlice/unsecuredLoanSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const MODE_OPTIONS  = ['Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI', 'Cash'];
const LOAN_TYPES    = ['Individual', 'Corporate', 'Director', 'Partnership', 'Others'];
const TDS_OPTIONS   = ['No', 'Yes'];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STEPS_NEW   = ['Loan Details', 'Payment Info', 'Review'];
const STEPS_TOPUP = ['Select Loan', 'Topup Details', 'Review'];
const STEPS_REPAY = ['Select Loan', 'Repay Details', 'Review'];

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDateForAPI = (val) => {
    if (!val) return '';
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const fmtAmt = (n) => {
    const num = parseFloat(n);
    if (!n && n !== 0) return '₹ 0.00';
    if (isNaN(num)) return '₹ 0.00';
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

const ChipGroup = ({ options, value, onChange, colorActive = 'indigo', disabled = false }) => {
    const colors = {
        indigo: 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30',
        violet: 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/30',
        emerald: 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30',
    };
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button key={opt} type="button" disabled={disabled} onClick={() => onChange(opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        value === opt ? colors[colorActive]
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}>
                    {opt}
                </button>
            ))}
        </div>
    );
};

const StepIndicator = ({ steps, current }) => (
    <div className="flex items-center">
        {steps.map((label, i) => {
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
                    {i < steps.length - 1 && (
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

const StatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();
    const map = {
        running:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        new:      'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        closed:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    const cls = map[s] || map.pending;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{status || '—'}</span>;
};

// ── Main Component ─────────────────────────────────────────────────────────────

const UnsecuredLoan = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId    = userData?.roleId    || userData?.RID  || 0;
    const createdBy = userData?.empCode   || userData?.userId || userData?.UID || '';

    const loans         = useSelector(selectUnsLoans);
    const loansLoading  = useSelector(selectUnsLoansLoading);
    const access        = useSelector(selectLoanAccess);
    const accessLoading = useSelector(selectLoanAccessLoading);
    const banks         = useSelector(selectBankDetailsArray);
    const banksLoading  = useSelector(selectBankDetailsLoading);
    const saveStatus    = useSelector(selectUnsSaveStatus);
    const saveLoading   = useSelector(selectUnsSaveLoading);
    const saveError     = useSelector(selectUnsSaveError);
    const intSaveStatus = useSelector(selectInterestSaveStatus);
    const intSaveLoading= useSelector(selectInterestSaveLoading);

    // ── Page state ────────────────────────────────────────────────────────────
    const [action,       setAction]       = useState('');  // '' | 'New' | 'Topup' | 'Repay'
    const [step,         setStep]         = useState(1);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [submitted,    setSubmitted]    = useState(false);

    // Edit interest state
    const [editingLoan,     setEditingLoan]     = useState(null);
    const [editRate,        setEditRate]        = useState('');
    const [editRemarks,     setEditRemarks]     = useState('');

    // Shared form state (used across New / Topup / Repay)
    const [form, setForm] = useState({
        // Loan info (New)
        loanNo:    '', loanDate: null, name: '', loanType: '',
        loanAmount: '', rateOfIntrest: '',
        // Payment
        bankId: '', modeOfPay: '', paymentNo: '',
        paymentDate: null, finalAmount: '', txnRefNo: '', remarks: '',
        // Repay extras
        repayPrinciple: '', repayInterest: '', tdsExist: 'No', tdsAmount: '',
        // Ledger (New only, optional)
        natureGroupId: '', groupId: '', subGroupId: '',
        ledgerValueType: '', openingBalance: '', balanceAsOnDate: null,
    });

    const set = useCallback((field, val) =>
        setForm(f => ({ ...f, [field]: val })), []);

    // ── On mount ──────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAllUnsecuredLoans({ Roleid: roleId }));
        dispatch(fetchLoanAccess({ Roleid: roleId }));
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => dispatch(resetUnsecuredLoan());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── Auto-compute finalAmount for Repay ────────────────────────────────────
    useEffect(() => {
        if (action === 'Repay') {
            const p = parseFloat(form.repayPrinciple) || 0;
            const i = parseFloat(form.repayInterest)  || 0;
            const t = form.tdsExist === 'Yes' ? (parseFloat(form.tdsAmount) || 0) : 0;
            set('finalAmount', (p + i - t).toFixed(2));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.repayPrinciple, form.repayInterest, form.tdsAmount, form.tdsExist, action]);

    // ── Toast on save result ──────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success(`${action} saved successfully!`);
            setSubmitted(true);
            dispatch(fetchAllUnsecuredLoans({ Roleid: roleId }));
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    useEffect(() => {
        if (intSaveStatus === 'success') {
            toast.success('Interest rate updated successfully!');
            setEditingLoan(null);
            setEditRate(''); setEditRemarks('');
            dispatch(fetchAllUnsecuredLoans({ Roleid: roleId }));
            dispatch(clearInterestSaveResult());
        } else if (intSaveStatus === 'failed') {
            toast.error('Failed to update interest rate.');
            dispatch(clearInterestSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intSaveStatus]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleActionChange = (val) => {
        setAction(val);
        setStep(1);
        setSelectedLoan(null);
        setSubmitted(false);
        setForm(f => ({ ...f,
            loanNo: '', loanDate: null, name: '', loanType: '', loanAmount: '', rateOfIntrest: '',
            bankId: '', modeOfPay: '', paymentNo: '', paymentDate: null,
            finalAmount: '', txnRefNo: '', remarks: '',
            repayPrinciple: '', repayInterest: '', tdsExist: 'No', tdsAmount: '',
            natureGroupId: '', groupId: '', subGroupId: '',
            ledgerValueType: '', openingBalance: '', balanceAsOnDate: null,
        }));
        dispatch(clearSaveResult());
    };

    const handleReset = () => {
        setAction(''); setStep(1); setSelectedLoan(null); setSubmitted(false);
        setEditingLoan(null); setEditRate(''); setEditRemarks('');
        setForm({
            loanNo: '', loanDate: null, name: '', loanType: '', loanAmount: '', rateOfIntrest: '',
            bankId: '', modeOfPay: '', paymentNo: '', paymentDate: null,
            finalAmount: '', txnRefNo: '', remarks: '',
            repayPrinciple: '', repayInterest: '', tdsExist: 'No', tdsAmount: '',
            natureGroupId: '', groupId: '', subGroupId: '',
            ledgerValueType: '', openingBalance: '', balanceAsOnDate: null,
        });
        dispatch(clearSaveResult());
    };

    const handleLoanSelect = (loan) => {
        if (action !== 'Topup' && action !== 'Repay') return;
        setSelectedLoan(loan);
        // Pre-fill name and loan amount from the selected loan
        setForm(f => ({ ...f, name: loan.Name, loanAmount: String(loan.LoanBalance || 0) }));
    };

    const handleSubmit = () => {
        const base = {
            LoanNo:            action === 'New' ? form.loanNo : selectedLoan?.LoanNo,
            LoanDate:          formatDateForAPI(form.loanDate),
            Name:              action === 'New' ? form.name : selectedLoan?.Name,
            LoanAmount:        parseFloat(form.loanAmount) || 0,
            BankID:            parseInt(form.bankId, 10) || 0,
            ModeofPay:         form.modeOfPay,
            UnsLoanPaymentNo:  form.paymentNo,
            PaymentDate:       formatDateForAPI(form.paymentDate),
            LoanfinalAmount:   parseFloat(form.finalAmount) || 0,
            Remarks:           form.remarks,
            Createdby:         String(createdBy),
            LoanType:          form.loanType || '',
            Roleid:            roleId,
            RateOfIntrest:     parseFloat(form.rateOfIntrest) || 0,
            AddorUpdate:       'Add',
            BankTransactionRefNo: form.txnRefNo,
        };

        if (action === 'New') {
            dispatch(submitNewUnsLoan({
                ...base,
                NatureGroupId:  form.natureGroupId  || null,
                GroupId:        form.groupId        || null,
                SubGroupId:     parseInt(form.subGroupId, 10) || 0,
                LedgerValueType: form.ledgerValueType || null,
                OpeningBalance:  parseFloat(form.openingBalance) || 0,
                BalanceAsOnDate: form.balanceAsOnDate ? formatDateForAPI(form.balanceAsOnDate) : null,
            }));
        } else if (action === 'Topup') {
            dispatch(submitUnsLoanTopUp(base));
        } else if (action === 'Repay') {
            dispatch(submitUnsLoanRepay({
                ...base,
                RePayPrinciple: parseFloat(form.repayPrinciple) || 0,
                RePayInterest:  parseFloat(form.repayInterest)  || 0,
                TDSAmount:      parseFloat(form.tdsAmount)      || 0,
                TDSExist:       form.tdsExist,
                LoanAmount:     selectedLoan?.LoanBalance || 0,
            }));
        }
    };

    const handleInterestSubmit = () => {
        if (!editingLoan || !editRate) return;
        dispatch(submitUpdateInterest({
            LoanNo:       editingLoan.LoanNo,
            RateOfIntrest: parseFloat(editRate),
            Remarks:      editRemarks,
            Createdby:    String(createdBy),
            Roleid:       roleId,
        }));
    };

    // ── Derived ───────────────────────────────────────────────────────────────

    const currentSteps = action === 'New' ? STEPS_NEW : action === 'Topup' ? STEPS_TOPUP : STEPS_REPAY;
    const canNew   = access?.NewLoanAccess   === 'Exist';
    const canTopup = access?.TopupAccess     === 'Exist';
    const canRepay = access?.RepayAccess     === 'Exist';
    const canEditRate = access?.EditInteresAccess === 'Exist';

    // Step 1 validation
    const step1Valid = action === 'New'
        ? form.loanNo && form.loanDate && form.name && form.loanAmount && form.rateOfIntrest
        : !!selectedLoan;

    // Step 2 validation
    const step2Valid = (() => {
        const hasBank = form.bankId && form.modeOfPay && form.paymentDate;
        if (action === 'New')    return hasBank && !!form.finalAmount && !!form.loanDate;
        if (action === 'Topup')  return form.loanDate instanceof Date && form.loanAmount && hasBank && !!form.finalAmount;
        if (action === 'Repay')  return form.loanDate instanceof Date && hasBank && !!form.repayPrinciple;
        return false;
    })();

    // Loan stats
    const totalLoans   = loans.length;
    const runningLoans = loans.filter(l => l.LoanStatus === 'Running').length;
    const totalBalance = loans.reduce((a, l) => a + (parseFloat(l.LoanBalance) || 0), 0);

    // ── Success screen ────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-sm w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                        {action === 'New' ? 'Loan Created' : action === 'Topup' ? 'Topup Saved' : 'Repayment Saved'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Unsecured loan {action.toLowerCase()} has been submitted successfully.
                    </p>
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
                                    {menuData?.name || 'Unsecured Loan'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">New loan · Topup · Repayment management</p>
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
                                    <p className="text-sm font-bold text-white">Accounts / Loans</p>
                                </div>
                                <Navigation className="h-5 w-5 opacity-60" />
                            </div>
                        </div>
                    </div>

                    {/* Step indicator — only when action is chosen */}
                    {action && (
                        <div className="relative">
                            <StepIndicator steps={currentSteps} current={step} />
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Loan Overview Card ──────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader icon={Landmark} title="Loan Portfolio Overview"
                        subtitle="All unsecured loans · click a row to select for Topup / Repay"
                    />
                    <div className="p-6 md:p-8">

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            {[
                                { lbl: 'Total Loans',   val: totalLoans,   icon: Hash,        hi: false },
                                { lbl: 'Running Loans', val: runningLoans,  icon: TrendingUp,  hi: false },
                                { lbl: 'Total Balance', val: fmtAmt(totalBalance), icon: IndianRupee, hi: true },
                            ].map(({ lbl, val, icon: Icon, hi }) => (
                                <div key={lbl} className={`p-3 rounded-xl border text-center ${hi ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-700'}`}>
                                    <Icon className={`h-4 w-4 mx-auto mb-1 ${hi ? 'text-indigo-500' : 'text-gray-400'}`} />
                                    <p className="text-xs text-gray-400 mb-0.5">{lbl}</p>
                                    <p className={`text-sm font-bold ${hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>{val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Edit interest form */}
                        {editingLoan && (
                            <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <BadgePercent className="h-3.5 w-3.5" />
                                    Edit Interest Rate — {editingLoan.LoanNo} ({editingLoan.Name})
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                    <div>
                                        <Label required>New Interest Rate (%)</Label>
                                        <input type="number" min="0" step="0.01" className={inputCls}
                                            placeholder={`Current: ${editingLoan.RateOfIntrest}%`}
                                            value={editRate} onChange={e => setEditRate(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Remarks</Label>
                                        <input type="text" className={inputCls} placeholder="Reason for rate change"
                                            value={editRemarks} onChange={e => setEditRemarks(e.target.value)} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleInterestSubmit} disabled={!editRate || intSaveLoading}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-40 transition-all">
                                            {intSaveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                            Update
                                        </button>
                                        <button onClick={() => { setEditingLoan(null); setEditRate(''); setEditRemarks(''); }}
                                            className="px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 hover:border-gray-400 transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loans table */}
                        {loansLoading ? (
                            <div className="flex items-center justify-center h-24 gap-2 text-indigo-500">
                                <Loader2 className="h-5 w-5 animate-spin" /> Loading loans…
                            </div>
                        ) : loans.length === 0 ? (
                            <div className="flex items-center justify-center h-24 text-sm text-gray-400">No loans found.</div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700">
                                            {['Loan No', 'Name', 'Loan Amount', 'Balance', 'Rate %', 'Status', 'Approval', ...(canEditRate ? [''] : [])].map(h => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                        {loans.map((loan, idx) => {
                                            const isSelectable = action === 'Topup' || action === 'Repay';
                                            const isSelected = selectedLoan?.LoanNo === loan.LoanNo;
                                            return (
                                                <tr key={idx}
                                                    onClick={() => isSelectable && handleLoanSelect(loan)}
                                                    className={`transition-all ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                                        : isSelectable ? 'hover:bg-indigo-50/60 dark:hover:bg-indigo-900/10 cursor-pointer'
                                                        : 'hover:bg-gray-50/60 dark:hover:bg-gray-900/20'}`}>
                                                    <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                        {isSelected && <CheckCircle className="h-3.5 w-3.5 inline mr-1 text-indigo-500" />}
                                                        {loan.LoanNo}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">{loan.Name}</td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">{fmtAmt(loan.LoanAmount)}</td>
                                                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">{fmtAmt(loan.LoanBalance)}</td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{loan.RateOfIntrest}%</td>
                                                    <td className="px-4 py-3"><StatusBadge status={loan.LoanStatus} /></td>
                                                    <td className="px-4 py-3"><StatusBadge status={loan.Status} /></td>
                                                    {canEditRate && (
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setEditingLoan(loan); setEditRate(String(loan.RateOfIntrest)); setEditRemarks(''); }}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all">
                                                                <Pencil className="h-3 w-3" /> Rate
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Action Form Card ────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader
                        icon={accessLoading ? Loader2 : PlusCircle}
                        title="Loan Action"
                        subtitle="Select an action to proceed"
                    />
                    <div className="p-6 md:p-8 space-y-6">

                        {/* Action selector — always visible */}
                        <div>
                            <Label required>Select Action</Label>
                            {accessLoading ? (
                                <p className="text-xs text-indigo-500 flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" />Checking access…</p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { val: 'New',   label: 'New Unsecured Loan',           icon: PlusCircle,      show: canNew,   color: 'indigo' },
                                        { val: 'Topup', label: 'Topup Existing Loan',           icon: TrendingUp,      show: canTopup, color: 'violet' },
                                        { val: 'Repay', label: 'Repay Unsecured Loan',          icon: ArrowDownCircle, show: canRepay, color: 'emerald' },
                                    ].filter(o => o.show).map(({ val, label, icon: Icon, color }) => {
                                        const colors = {
                                            indigo:  action === val ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700',
                                            violet:  action === val ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'border-gray-200 dark:border-gray-700',
                                            emerald: action === val ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'border-gray-200 dark:border-gray-700',
                                        };
                                        const iconColors = { indigo: 'text-indigo-600', violet: 'text-violet-600', emerald: 'text-emerald-600' };
                                        return (
                                            <button key={val} type="button" onClick={() => handleActionChange(val)}
                                                className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${colors[color]} ${action !== val ? 'text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800' : ''}`}>
                                                <Icon className={`h-4 w-4 ${action === val ? '' : iconColors[color]}`} />
                                                {label}
                                                {action === val && <CheckCircle className="h-4 w-4 ml-1" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ── STEP 1 ──────────────────────────────────────── */}
                        {action && step === 1 && (
                            <>
                                {/* New Loan — loan info */}
                                {action === 'New' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <Label required>Loan Number</Label>
                                                <input type="text" className={inputCls} placeholder="e.g. UL012"
                                                    value={form.loanNo} onChange={e => set('loanNo', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label required>Loan Date</Label>
                                                <CustomDatePicker value={form.loanDate} onChange={v => set('loanDate', v)}
                                                    format="DD-MMM-YYYY" placeholder="Select loan date" />
                                            </div>
                                            <div>
                                                <Label required>Borrower Name</Label>
                                                <input type="text" className={inputCls} placeholder="Enter name"
                                                    value={form.name} onChange={e => set('name', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Loan Type</Label>
                                                <div className="relative">
                                                    <select className={inputCls} value={form.loanType} onChange={e => set('loanType', e.target.value)}>
                                                        <option value="">— Select type —</option>
                                                        {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                    <SelectIcon loading={false} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label required>Loan Amount (₹)</Label>
                                                <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                                    value={form.loanAmount} onChange={e => set('loanAmount', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label required>Rate of Interest (%)</Label>
                                                <input type="number" min="0" step="0.01" className={inputCls} placeholder="e.g. 13"
                                                    value={form.rateOfIntrest} onChange={e => set('rateOfIntrest', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Topup / Repay — loan selection reminder */}
                                {(action === 'Topup' || action === 'Repay') && (
                                    <div className={`p-4 rounded-xl border-2 border-dashed ${selectedLoan ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                        {selectedLoan ? (
                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{selectedLoan.LoanNo} — {selectedLoan.Name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Balance: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{fmtAmt(selectedLoan.LoanBalance)}</span>
                                                            &nbsp;·&nbsp;Rate: {selectedLoan.RateOfIntrest}%
                                                            &nbsp;·&nbsp;<StatusBadge status={selectedLoan.LoanStatus} />
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setSelectedLoan(null); set('name', ''); set('loanAmount', ''); }}
                                                    className="text-xs text-gray-400 hover:text-rose-500 transition-colors">Change</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                Click a row in the <span className="font-semibold text-gray-600 dark:text-gray-300">Loan Portfolio table above</span> to select the loan for {action}.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                        Continue <CheckCircle className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ── STEP 2 ──────────────────────────────────────── */}
                        {action && step === 2 && (
                            <>
                                {/* Selected loan summary (Topup/Repay) */}
                                {selectedLoan && (
                                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                                        <Landmark className="h-4 w-4 text-indigo-500 shrink-0" />
                                        <p className="text-sm text-gray-700 dark:text-gray-200">
                                            <span className="font-bold">{selectedLoan.LoanNo}</span> — {selectedLoan.Name}
                                            &nbsp;&nbsp;Balance: <span className="font-bold text-indigo-600 dark:text-indigo-400">{fmtAmt(selectedLoan.LoanBalance)}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Topup / New shared: date + amount */}
                                {(action === 'New' || action === 'Topup') && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {action === 'Topup' && (
                                            <>
                                                <div>
                                                    <Label required>Topup Date</Label>
                                                    <CustomDatePicker value={form.loanDate} onChange={v => set('loanDate', v)}
                                                        format="DD-MMM-YYYY" placeholder="Select topup date" />
                                                </div>
                                                <div>
                                                    <Label required>Topup Amount (₹)</Label>
                                                    <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                                        value={form.loanAmount} onChange={e => set('loanAmount', e.target.value)} />
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <Label required>Bank</Label>
                                            <div className="relative">
                                                <select className={inputCls} value={form.bankId} onChange={e => set('bankId', e.target.value)} disabled={banksLoading}>
                                                    <option value="">{banksLoading ? 'Loading…' : '— Select bank —'}</option>
                                                    {banks.map(b => <option key={b.BankId} value={b.BankId}>{b.BankName}</option>)}
                                                </select>
                                                <SelectIcon loading={banksLoading} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label required>Mode of Payment</Label>
                                            <ChipGroup options={MODE_OPTIONS} value={form.modeOfPay} onChange={v => set('modeOfPay', v)} colorActive="indigo" />
                                        </div>
                                        {form.modeOfPay && (
                                            <div>
                                                <Label>{form.modeOfPay === 'Cheque' ? 'Cheque Number' : 'Transaction Number'}</Label>
                                                <input type="text" className={inputCls} placeholder="Enter number"
                                                    value={form.paymentNo} onChange={e => set('paymentNo', e.target.value)} />
                                            </div>
                                        )}
                                        <div>
                                            <Label required>Transaction Date</Label>
                                            <CustomDatePicker value={form.paymentDate} onChange={v => set('paymentDate', v)}
                                                format="DD-MMM-YYYY" placeholder="Select date" />
                                        </div>
                                        <div>
                                            <Label required>Transaction Amount (₹)</Label>
                                            <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                                value={form.finalAmount} onChange={e => set('finalAmount', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Bank Transaction Ref No</Label>
                                            <input type="text" className={inputCls} placeholder="Reference number"
                                                value={form.txnRefNo} onChange={e => set('txnRefNo', e.target.value)} />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <Label>Remarks</Label>
                                            <textarea rows={2} className={inputCls + ' resize-none'} placeholder="Enter remarks…"
                                                value={form.remarks} onChange={e => set('remarks', e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {/* Ledger section — New only, optional */}
                                {action === 'New' && (
                                    <details className="group">
                                        <summary className="cursor-pointer text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none hover:text-indigo-500 transition-colors">
                                            Ledger Classification (Optional) ▸
                                        </summary>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <Label>Nature Group ID</Label>
                                                <input type="text" className={inputCls} placeholder="Nature group"
                                                    value={form.natureGroupId} onChange={e => set('natureGroupId', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Group ID</Label>
                                                <input type="text" className={inputCls} placeholder="Group"
                                                    value={form.groupId} onChange={e => set('groupId', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Sub Group ID</Label>
                                                <input type="number" className={inputCls} placeholder="Sub group"
                                                    value={form.subGroupId} onChange={e => set('subGroupId', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Ledger Value Type</Label>
                                                <input type="text" className={inputCls} placeholder="Value type"
                                                    value={form.ledgerValueType} onChange={e => set('ledgerValueType', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Opening Balance (₹)</Label>
                                                <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                                    value={form.openingBalance} onChange={e => set('openingBalance', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Balance As On Date</Label>
                                                <CustomDatePicker value={form.balanceAsOnDate} onChange={v => set('balanceAsOnDate', v)}
                                                    format="DD-MMM-YYYY" placeholder="Select date" />
                                            </div>
                                        </div>
                                    </details>
                                )}

                                {/* Repay fields */}
                                {action === 'Repay' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <Label required>Repay Date</Label>
                                            <CustomDatePicker value={form.loanDate} onChange={v => set('loanDate', v)}
                                                format="DD-MMM-YYYY" placeholder="Select repay date" />
                                        </div>
                                        <div>
                                            <Label required>Bank</Label>
                                            <div className="relative">
                                                <select className={inputCls} value={form.bankId} onChange={e => set('bankId', e.target.value)} disabled={banksLoading}>
                                                    <option value="">{banksLoading ? 'Loading…' : '— Select bank —'}</option>
                                                    {banks.map(b => <option key={b.BankId} value={b.BankId}>{b.BankName}</option>)}
                                                </select>
                                                <SelectIcon loading={banksLoading} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label required>Mode of Payment</Label>
                                            <ChipGroup options={MODE_OPTIONS} value={form.modeOfPay} onChange={v => set('modeOfPay', v)} colorActive="emerald" />
                                        </div>
                                        {form.modeOfPay && (
                                            <div>
                                                <Label>{form.modeOfPay === 'Cheque' ? 'Cheque Number' : 'Transaction Number'}</Label>
                                                <input type="text" className={inputCls} placeholder="Enter number"
                                                    value={form.paymentNo} onChange={e => set('paymentNo', e.target.value)} />
                                            </div>
                                        )}
                                        <div>
                                            <Label required>Transaction Date</Label>
                                            <CustomDatePicker value={form.paymentDate} onChange={v => set('paymentDate', v)}
                                                format="DD-MMM-YYYY" placeholder="Select date" />
                                        </div>
                                        <div>
                                            <Label required>Principal Repayment (₹)</Label>
                                            <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                                value={form.repayPrinciple} onChange={e => set('repayPrinciple', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label required>Interest Repayment (₹)</Label>
                                            <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                                value={form.repayInterest} onChange={e => set('repayInterest', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>TDS Applicable</Label>
                                            <ChipGroup options={TDS_OPTIONS} value={form.tdsExist} onChange={v => set('tdsExist', v)} colorActive="violet" />
                                        </div>
                                        {form.tdsExist === 'Yes' && (
                                            <div>
                                                <Label>TDS Amount (₹)</Label>
                                                <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                                                    value={form.tdsAmount} onChange={e => set('tdsAmount', e.target.value)} />
                                            </div>
                                        )}
                                        <div>
                                            <Label>Total Payment Amount (₹)</Label>
                                            <div className="relative">
                                                <input type="number" readOnly className={readonlyCls + ' pr-8'} value={form.finalAmount} placeholder="Auto-computed" />
                                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                    <Hash className="h-3.5 w-3.5 text-gray-400" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">Principal + Interest − TDS</p>
                                        </div>
                                        <div>
                                            <Label>Bank Transaction Ref No</Label>
                                            <input type="text" className={inputCls} placeholder="Reference number"
                                                value={form.txnRefNo} onChange={e => set('txnRefNo', e.target.value)} />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <Label>Remarks</Label>
                                            <textarea rows={2} className={inputCls + ' resize-none'} placeholder="Enter remarks…"
                                                value={form.remarks} onChange={e => set('remarks', e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-2">
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

                        {/* ── STEP 3: Review ───────────────────────────────── */}
                        {action && step === 3 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Loan Reference</p>
                                        <ReviewRow label="Action"     value={action} highlight />
                                        <ReviewRow label="Loan No"    value={action === 'New' ? form.loanNo : selectedLoan?.LoanNo} />
                                        <ReviewRow label="Name"       value={action === 'New' ? form.name  : selectedLoan?.Name}   />
                                        {action === 'New' && (
                                            <>
                                                <ReviewRow label="Loan Date"  value={formatDateForAPI(form.loanDate)} />
                                                <ReviewRow label="Loan Type"  value={form.loanType} />
                                                <ReviewRow label="Loan Amount" value={fmtAmt(form.loanAmount)} highlight />
                                                <ReviewRow label="Interest Rate" value={`${form.rateOfIntrest}%`} />
                                            </>
                                        )}
                                        {(action === 'Topup' || action === 'Repay') && (
                                            <>
                                                <ReviewRow label="Loan Balance" value={fmtAmt(selectedLoan?.LoanBalance)} highlight />
                                                <ReviewRow label="Current Rate" value={`${selectedLoan?.RateOfIntrest}%`} />
                                            </>
                                        )}
                                    </div>

                                    <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                            {action === 'Repay' ? 'Repayment Details' : 'Payment Details'}
                                        </p>
                                        {action === 'Topup' && (
                                            <>
                                                <ReviewRow label="Topup Date"   value={formatDateForAPI(form.loanDate)} />
                                                <ReviewRow label="Topup Amount" value={fmtAmt(form.loanAmount)} highlight />
                                            </>
                                        )}
                                        {action === 'Repay' && (
                                            <>
                                                <ReviewRow label="Repay Date"    value={formatDateForAPI(form.loanDate)} />
                                                <ReviewRow label="Principal"     value={fmtAmt(form.repayPrinciple)} />
                                                <ReviewRow label="Interest"      value={fmtAmt(form.repayInterest)} />
                                                {form.tdsExist === 'Yes' && <ReviewRow label="TDS Amount" value={fmtAmt(form.tdsAmount)} />}
                                                <ReviewRow label="Total Payment" value={fmtAmt(form.finalAmount)} highlight />
                                            </>
                                        )}
                                        {action === 'New' && <ReviewRow label="Transaction Amount" value={fmtAmt(form.finalAmount)} highlight />}
                                        <ReviewRow label="Bank"        value={banks.find(b => String(b.BankId) === String(form.bankId))?.BankName} />
                                        <ReviewRow label="Pay Mode"    value={form.modeOfPay} />
                                        <ReviewRow label="Txn Date"    value={formatDateForAPI(form.paymentDate)} />
                                        {form.paymentNo && <ReviewRow label="Payment No" value={form.paymentNo} />}
                                        {form.txnRefNo  && <ReviewRow label="Ref No"     value={form.txnRefNo}  />}
                                        {form.remarks   && <ReviewRow label="Remarks"    value={form.remarks}   />}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-2">
                                    <button type="button" onClick={() => setStep(2)} disabled={saveLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 disabled:opacity-40 transition-all">
                                        Back
                                    </button>
                                    <button type="button" onClick={handleSubmit} disabled={saveLoading}
                                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                        {saveLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Send className="h-4 w-4" /> Submit</>}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnsecuredLoan;
