import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
    CreditCard, ChevronDown, Loader2, RotateCcw, Send, CheckCircle,
    Navigation, FileText, Eye, Building2, AlertTriangle, IndianRupee,
    MessageSquare, Hash,
} from 'lucide-react';
import CustomDatePicker from '../../components/CustomDatePicker';
import {
    fetchApprovedDistributionsForPayment,
    insertDividendBankPayment,
    selectApprovedDistributionsArray,
    selectApprovedDistributionsLoading,
    selectInsertOperationStatus,
    setSelectedDistributionId,
    setSelectedBankId,
    setPaymentMode as setPaymentModeAction,
    clearInsertResult,
} from '../../slices/capitalSlice/dividendBankPaymentSlice';
import {
    fetchBankDetailsWithAvailableBalance,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';
import {
    fetchChequeNumbers,
    selectChequeNumbersArray,
    selectChequeNumbersLoading,
    clearChequeNumbers,
} from '../../slices/bankSlice/chequeNumbersSlice';
import {
    convertAmountToWords,
    formatIndianCurrency,
} from '../../utilities/amountToTextHelper';

// ── Constants ──────────────────────────────────────────────────────────────────

const PAYMENT_MODES = ['NEFT', 'RTGS', 'IMPS', 'Cheque', 'DD'];
const STEPS         = ['Payment Details', 'Review'];

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDateForAPI = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

const fmtCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

const fmtNumber = (num) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const selectCls = inputCls + ' appearance-none pr-10';

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
        indigo: 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30',
        violet: 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/30',
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
            const idx    = i + 1;
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

const DividendBankPaymentCreate = ({ menuData }) => {
    const dispatch = useDispatch();

    const { userData } = useSelector((s) => s.auth);
    const userId = userData?.userName || userData?.UserName || userData?.userId || userData?.UserID || userData?.employeeId;
    const roleId = userData?.roleId   || userData?.RoleId   || userData?.roleID || userData?.RoleID;

    const approvedDistributions  = useSelector(selectApprovedDistributionsArray);
    const distributionsLoading   = useSelector(selectApprovedDistributionsLoading);
    const bankDetails            = useSelector(selectBankDetailsArray);
    const bankDetailsLoading     = useSelector(selectBankDetailsLoading);
    const chequeNumbers          = useSelector(selectChequeNumbersArray);
    const chequeNumbersLoading   = useSelector(selectChequeNumbersLoading);
    const { isLoading }          = useSelector(selectInsertOperationStatus);

    // ── Form state ────────────────────────────────────────────────────────────

    const [step,       setStep]      = useState(1);
    const [submitted,  setSubmitted] = useState(false);
    const [transRef,   setTransRef]  = useState('');

    const [distributionId, setDistributionId] = useState('');
    const [bankId,         setBankId]         = useState('');
    const [paymentMode,    setPaymentMode]     = useState('');
    const [chequeNo,       setChequeNo]        = useState('');
    const [chequeDate,     setChequeDate]      = useState(null);
    const [paymentDate,    setPaymentDate]     = useState(null);
    const [remarks,        setRemarks]         = useState('');

    // ── Derived ───────────────────────────────────────────────────────────────

    const selectedDistribution = approvedDistributions.find(d => String(d.DistributionId) === String(distributionId));
    const selectedBank         = bankDetails.find(b => String(b.BankId) === String(bankId));
    const isChequeDD           = paymentMode === 'Cheque' || paymentMode === 'DD';

    const hasInsufficientBalance = !!(selectedBank && selectedDistribution &&
        (selectedBank.AvailableBalance || 0) < (selectedDistribution.NetPayableAmount || 0));

    // ── On mount ──────────────────────────────────────────────────────────────

    useEffect(() => {
        dispatch(fetchApprovedDistributionsForPayment());
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(clearInsertResult());
            dispatch(clearChequeNumbers());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── Bank change → fetch cheque numbers ───────────────────────────────────

    useEffect(() => {
        if (bankId && isChequeDD) {
            const bank = bankDetails.find(b => String(b.BankId) === String(bankId));
            if (bank) dispatch(fetchChequeNumbers(bank.BankName));
        } else {
            dispatch(clearChequeNumbers());
            setChequeNo('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bankId, paymentMode]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleDistributionChange = (val) => {
        setDistributionId(val);
        dispatch(setSelectedDistributionId(parseInt(val) || 0));
    };

    const handleBankChange = (val) => {
        setBankId(val);
        dispatch(setSelectedBankId(parseInt(val) || 0));
        setChequeNo('');
    };

    const handleModeChange = (mode) => {
        setPaymentMode(mode);
        dispatch(setPaymentModeAction(mode));
        if (mode !== 'Cheque' && mode !== 'DD') {
            setChequeNo('');
            setChequeDate(null);
        }
    };

    const handleReset = useCallback(() => {
        setStep(1); setSubmitted(false); setTransRef('');
        setDistributionId(''); setBankId(''); setPaymentMode('');
        setChequeNo(''); setChequeDate(null); setPaymentDate(null); setRemarks('');
        dispatch(clearInsertResult());
        dispatch(clearChequeNumbers());
        dispatch(fetchApprovedDistributionsForPayment());
    }, [dispatch]);

    const handleSubmit = async () => {
        if (!userId) {
            toast.error('User information missing. Please login again.');
            return;
        }
        if (hasInsufficientBalance) {
            toast.error(`Insufficient balance! Available: ₹${fmtCurrency(selectedBank.AvailableBalance)} / Required: ₹${fmtCurrency(selectedDistribution.NetPayableAmount)}`);
            return;
        }
        try {
            const payload = {
                distributionId: parseInt(distributionId),
                bankId:         parseInt(bankId),
                paymentMode,
                chequeNo:       chequeNo || '',
                chequeDate:     chequeDate ? formatDateForAPI(chequeDate) : null,
                paymentDate:    formatDateForAPI(paymentDate),
                userId:         userId.toString(),
                roleId:         parseInt(roleId),
                remarks:        remarks.trim(),
            };
            const result = await dispatch(insertDividendBankPayment(payload)).unwrap();
            if (result?.IsSuccessful || result?.Data?.includes('Submited')) {
                const ref = result?.Data?.replace('Submited$', '') || '';
                setTransRef(ref);
                setSubmitted(true);
                toast.success('Dividend payment initiated successfully!');
            } else {
                toast.error(result?.Message || 'Failed to initiate payment.');
                dispatch(clearInsertResult());
            }
        } catch (err) {
            toast.error(err?.Message || err?.message || 'Failed to initiate payment.');
            dispatch(clearInsertResult());
        }
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const step1Valid =
        distributionId && bankId && paymentMode &&
        paymentDate instanceof Date &&
        (!isChequeDD || (chequeNo && chequeDate instanceof Date)) &&
        remarks.trim().length >= 10 &&
        !hasInsufficientBalance;

    // ── Success screen ────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-sm w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Payment Initiated</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Dividend bank payment submitted for approval.
                    </p>
                    {transRef && (
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Ref: {transRef}</p>
                    )}
                    <p className="text-xs text-gray-400 mb-6">{selectedDistribution?.LotName} — {paymentMode}</p>
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
                                <CreditCard className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Capital Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Dividend Bank Payment'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Process bank payment for approved dividend distributions</p>
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
                                    <p className="text-sm font-bold text-white">Capital / Dividend</p>
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

                {/* ── STEP 1: Payment Details ───────────────────────────────── */}
                {step === 1 && (
                    <>
                        {/* Distribution & Bank */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={FileText} title="Distribution & Bank"
                                subtitle="Select the approved distribution and the debit bank account"
                            />
                            <div className="p-6 md:p-8 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* Distribution */}
                                    <div>
                                        <Label required>Distribution</Label>
                                        <div className="relative">
                                            <select className={selectCls} value={distributionId}
                                                onChange={e => handleDistributionChange(e.target.value)}
                                                disabled={distributionsLoading}>
                                                <option value="">{distributionsLoading ? 'Loading…' : '— Select distribution —'}</option>
                                                {approvedDistributions.map(d => (
                                                    <option key={d.DistributionId} value={d.DistributionId}>
                                                        {d.LotName} — FY {d.FinancialYear} — ₹{fmtCurrency(d.NetPayableAmount)}
                                                    </option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={distributionsLoading} />
                                        </div>
                                    </div>

                                    {/* Bank */}
                                    <div>
                                        <Label required>Debit Bank Account</Label>
                                        <div className="relative">
                                            <select className={selectCls} value={bankId}
                                                onChange={e => handleBankChange(e.target.value)}
                                                disabled={bankDetailsLoading}>
                                                <option value="">{bankDetailsLoading ? 'Loading…' : '— Select bank —'}</option>
                                                {bankDetails.map(b => (
                                                    <option key={b.BankId} value={b.BankId}>
                                                        {b.BankName} — {b.AccountNo}{b.AccountType === 'Over Draft' ? ' (OD)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={bankDetailsLoading} />
                                        </div>
                                    </div>
                                </div>

                                {/* Bank info strip */}
                                {selectedBank && (
                                    <div className={`rounded-xl p-4 border grid grid-cols-2 md:grid-cols-4 gap-3 text-xs ${
                                        hasInsufficientBalance
                                            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                                            : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/40'
                                    }`}>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-0.5">Bank</p>
                                            <p className="font-bold text-gray-800 dark:text-gray-100">{selectedBank.BankName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-0.5">Account</p>
                                            <p className="font-bold text-gray-800 dark:text-gray-100 font-mono">{selectedBank.AccountNo}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-0.5">Type</p>
                                            <p className="font-bold text-gray-800 dark:text-gray-100">{selectedBank.AccountType}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-0.5">Available Balance</p>
                                            <p className={`font-bold ${hasInsufficientBalance ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                ₹{fmtCurrency(selectedBank.AvailableBalance)}
                                            </p>
                                        </div>
                                        {hasInsufficientBalance && (
                                            <div className="col-span-2 md:col-span-4 flex items-center gap-1.5 mt-1 text-rose-600 dark:text-rose-400">
                                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                                <span className="text-xs font-semibold">
                                                    Insufficient balance — required ₹{fmtCurrency(selectedDistribution?.NetPayableAmount)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Distribution amount summary */}
                                {selectedDistribution && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Payment Amount</span>
                                            </div>
                                            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                                                ₹{formatIndianCurrency(selectedDistribution.NetPayableAmount)}
                                            </span>
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 italic">
                                                {convertAmountToWords(selectedDistribution.NetPayableAmount)}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-emerald-700 dark:text-emerald-400">
                                            <span>Lot: <strong>{selectedDistribution.LotName}</strong></span>
                                            <span>FY: <strong>{selectedDistribution.FinancialYear}</strong></span>
                                            <span>Shareholders: <strong>{fmtNumber(selectedDistribution.ShareholderCount)}</strong></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Mode & Dates */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={CreditCard} title="Payment Mode & Date"
                                subtitle="Choose how the payment will be made and the transaction date"
                            />
                            <div className="p-6 md:p-8 space-y-5">

                                {/* Mode chips */}
                                <div>
                                    <Label required>Mode of Payment</Label>
                                    <ChipGroup options={PAYMENT_MODES} value={paymentMode} onChange={handleModeChange} colorActive="indigo" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Cheque / DD fields (conditional) */}
                                    {isChequeDD && (
                                        <>
                                            <div>
                                                <Label required>{paymentMode} Number</Label>
                                                <div className="relative">
                                                    <select className={selectCls} value={chequeNo}
                                                        onChange={e => setChequeNo(e.target.value)}
                                                        disabled={chequeNumbersLoading || !selectedBank}>
                                                        <option value="">
                                                            {chequeNumbersLoading ? 'Loading…'
                                                                : !selectedBank ? '— Select bank first —'
                                                                : chequeNumbers.length === 0 ? 'No cheques available'
                                                                : '— Select cheque —'}
                                                        </option>
                                                        {chequeNumbers.map(c => (
                                                            <option key={c.Cheque_Id} value={c.Cheque_No}>{c.Cheque_No}</option>
                                                        ))}
                                                    </select>
                                                    <SelectIcon loading={chequeNumbersLoading} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label required>{paymentMode} Date</Label>
                                                <CustomDatePicker value={chequeDate} onChange={setChequeDate}
                                                    format="DD-MMM-YYYY" placeholder="Select date" />
                                            </div>
                                        </>
                                    )}

                                    {/* Payment Date */}
                                    <div className={isChequeDD ? '' : 'md:col-span-2'}>
                                        <Label required>Payment Date</Label>
                                        <CustomDatePicker value={paymentDate} onChange={setPaymentDate}
                                            format="DD-MMM-YYYY" placeholder="Select date" />
                                    </div>
                                </div>

                                {/* Remarks */}
                                <div>
                                    <Label required>Remarks</Label>
                                    <div className="relative">
                                        <textarea rows={3} className={inputCls + ' resize-none pl-9'}
                                            placeholder="Enter payment remarks (min 10 characters)…"
                                            maxLength={500}
                                            value={remarks} onChange={e => setRemarks(e.target.value)} />
                                        <div className="pointer-events-none absolute top-3 left-3">
                                            <MessageSquare className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 text-right">{remarks.length}/500</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-end">
                            <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                <Eye className="h-4 w-4" /> Review
                            </button>
                        </div>
                    </>
                )}

                {/* ── STEP 2: Review & Submit ───────────────────────────────── */}
                {step === 2 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader icon={Eye} title="Review & Submit"
                            subtitle="Confirm dividend payment details before initiating"
                        />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                                {/* Distribution details */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Distribution</p>
                                    <ReviewRow label="Lot Name"       value={selectedDistribution?.LotName}        highlight />
                                    <ReviewRow label="Financial Year" value={selectedDistribution?.FinancialYear}   />
                                    <ReviewRow label="Shareholders"   value={fmtNumber(selectedDistribution?.ShareholderCount)} />
                                    <ReviewRow label="Net Payable"    value={`₹${fmtCurrency(selectedDistribution?.NetPayableAmount)}`} highlight />
                                    <ReviewRow label="Amount in Words" value={convertAmountToWords(selectedDistribution?.NetPayableAmount)} />
                                </div>

                                {/* Payment details */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Payment Details</p>
                                    <ReviewRow label="Bank"         value={selectedBank?.BankName} highlight />
                                    <ReviewRow label="Account No"   value={selectedBank?.AccountNo} />
                                    <ReviewRow label="Account Type" value={selectedBank?.AccountType} />
                                    <ReviewRow label="Mode"         value={paymentMode} />
                                    {isChequeDD && <ReviewRow label={`${paymentMode} No`}   value={chequeNo} />}
                                    {isChequeDD && <ReviewRow label={`${paymentMode} Date`} value={chequeDate instanceof Date ? chequeDate.toLocaleDateString('en-IN') : ''} />}
                                    <ReviewRow label="Payment Date" value={paymentDate instanceof Date ? paymentDate.toLocaleDateString('en-IN') : ''} />
                                </div>

                                {/* Remarks — full width */}
                                <div className="md:col-span-2 bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Remarks</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">{remarks}</p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between">
                                <button type="button" onClick={() => setStep(1)} disabled={isLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 disabled:opacity-40 transition-all">
                                    Back
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={isLoading || hasInsufficientBalance}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    {isLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                                        : <><Send className="h-4 w-4" /> Initiate Payment</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DividendBankPaymentCreate;
