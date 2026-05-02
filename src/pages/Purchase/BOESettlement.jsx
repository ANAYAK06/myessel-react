import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Landmark, ChevronDown, Loader2, CheckCircle, RotateCcw,
    Send, FileText, Receipt, Building2, IndianRupee, CreditCard,
    Navigation, Eye,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchBOELCNos, fetchBOETrans, fetchBOEPaymentData,
    fetchBOEPaymentInnerData, fetchLCDetails, submitBOESettlementPayment,
    clearBOETrans, clearPaymentData, clearInnerData, clearLCDetails,
    clearSaveResult, resetBOESettlement,
    selectBOELCNos, selectBOELCNosLoading,
    selectBOETrans, selectBOETransLoading,
    selectBOEPaymentData,
    selectBOEPaymentDataLoading, selectBOEPaymentDataError,
    selectBOEInnerData, selectBOEInnerDataLoading,
    selectLCDetails, selectLCDetailsLoading,
    selectBOESaveStatus, selectBOESaveLoading, selectBOESaveError,
} from '../../slices/purchaseSlice/boeSettlementSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

import {
    fetchChequeNumbers,
    selectChequeNumbersArray,
    selectChequeNumbersLoading,
    resetChequeNumbersData,
} from '../../slices/bankSlice/chequeNumbersSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const MODE_OPTIONS = ['Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI'];
const STEPS        = ['Select BOE', 'Payment Details', 'Review'];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtDate = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(val)) return val;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        const [yyyy, mm, dd] = val.split('T')[0].split('-');
        return `${dd}-${MONTH_ABBR[parseInt(mm, 10) - 1]}-${yyyy}`;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2,'0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const fmt = (n) =>
    n ? `₹ ${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹ 0.00';

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const SelectIcon = ({ loading }) => (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        {loading
            ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />}
    </div>
);

const SectionCard = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
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

const InnerHeader = ({ icon: Icon, title, subtitle }) => (
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

const ReviewRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <span className={`text-xs font-semibold text-right max-w-[60%] ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
        </span>
    </div>
);

// ── Step Indicator ─────────────────────────────────────────────────────────────

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

// ── Main Component ─────────────────────────────────────────────────────────────

const BOESettlement = ({ menuData }) => {
    const dispatch     = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Redux state ──────────────────────────────────────────────────────────
    const lcNos              = useSelector(selectBOELCNos);
    const lcNosLoading       = useSelector(selectBOELCNosLoading);
    const boeTrans           = useSelector(selectBOETrans);
    const boeTransLoading    = useSelector(selectBOETransLoading);
    const paymentData        = useSelector(selectBOEPaymentData);
    const paymentDataLoading = useSelector(selectBOEPaymentDataLoading);
    const paymentDataError   = useSelector(selectBOEPaymentDataError);
    const innerData          = useSelector(selectBOEInnerData);
    const innerDataLoading   = useSelector(selectBOEInnerDataLoading);
    const lcDetails          = useSelector(selectLCDetails);
    const lcDetailsLoading   = useSelector(selectLCDetailsLoading);
    const bankList           = useSelector(selectBankDetailsArray);
    const bankLoading        = useSelector(selectBankDetailsLoading);
    const chequeList         = useSelector(selectChequeNumbersArray);
    const chequeLoading      = useSelector(selectChequeNumbersLoading);
    const saveStatus         = useSelector(selectBOESaveStatus);
    const saveLoading        = useSelector(selectBOESaveLoading);
    const saveError          = useSelector(selectBOESaveError);

    // ── Local state ──────────────────────────────────────────────────────────
    const [step, setStep] = useState(1);

    // Step 1
    const [selectedLC,     setSelectedLC]     = useState('');
    const [selectedTranID, setSelectedTranID] = useState('');
    const [selectedTranNo, setSelectedTranNo] = useState('');

    // Step 2
    const [selectedBank,       setSelectedBank]       = useState(null);
    const [modeOfPay,          setModeOfPay]          = useState('');
    const [chequeId,           setChequeId]           = useState('');
    const [refNo,              setRefNo]              = useState('');
    const [transactionDate,    setTransactionDate]    = useState(null);
    const [transactionAmount,  setTransactionAmount]  = useState('');
    const [remarks,            setRemarks]            = useState('');

    // ── On mount ─────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchBOELCNos());
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetBOESettlement());
            dispatch(resetChequeNumbersData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Bank change → reload cheques, clear mode/ref/cheque
    useEffect(() => {
        setModeOfPay(''); setChequeId(''); setRefNo('');
        dispatch(resetChequeNumbersData());
        if (!selectedBank) return;
        dispatch(fetchChequeNumbers(selectedBank.BankName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBank]);

    // Mode change → clear cheque/ref
    useEffect(() => { setChequeId(''); setRefNo(''); }, [modeOfPay]);

    // Populate transaction amount from LC details
    useEffect(() => {
        if (lcDetails?.TransactionAmount) {
            setTransactionAmount(lcDetails.TransactionAmount);
        }
    }, [lcDetails]);

    // Handle save result
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('BOE Settlement payment saved successfully!');
            handleReset();
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Payment save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleLCChange = useCallback((lcNo) => {
        setSelectedLC(lcNo);
        setSelectedTranID('');
        setSelectedTranNo('');
        dispatch(clearBOETrans());
        dispatch(clearPaymentData());
        dispatch(clearInnerData());
        dispatch(clearLCDetails());
        setTransactionAmount('');
        if (lcNo) dispatch(fetchBOETrans({ BOELCNO: lcNo }));
    }, [dispatch]);

    const handleTranChange = useCallback((tranId) => {
        if (!tranId) {
            setSelectedTranID('');
            setSelectedTranNo('');
            dispatch(clearPaymentData());
            dispatch(clearInnerData());
            dispatch(clearLCDetails());
            setTransactionAmount('');
            return;
        }
        const found = boeTrans.find(t => t.ID === tranId);
        setSelectedTranID(tranId);
        setSelectedTranNo(found?.TranNo || '');
        dispatch(clearPaymentData());
        dispatch(clearInnerData());
        dispatch(clearLCDetails());
        setTransactionAmount('');

        dispatch(fetchBOEPaymentData({ BOELCval: selectedLC, TranID: tranId }));
        dispatch(fetchBOEPaymentInnerData({ LCNO: selectedLC, Tranno: found?.TranNo || '' }));
        dispatch(fetchLCDetails({ LCNo: selectedLC, TranID: tranId }));
    }, [dispatch, selectedLC, boeTrans]);

    // ── Validation ────────────────────────────────────────────────────────────

    const validateStep1 = useCallback(() => {
        if (!selectedLC)      { toast.warn('Please select a BOE / LC number.'); return false; }
        if (!selectedTranID)  { toast.warn('Please select a BOE transaction.'); return false; }
        if (!paymentData)     { toast.warn('Payment data not loaded yet. Please wait.'); return false; }
        return true;
    }, [selectedLC, selectedTranID, paymentData]);

    const validateStep2 = useCallback(() => {
        if (!selectedBank)                              { toast.warn('Please select a bank account.'); return false; }
        if (!modeOfPay)                                 { toast.warn('Please select mode of payment.'); return false; }
        if (modeOfPay === 'Cheque' && !chequeId)        { toast.warn('Please select a cheque number.'); return false; }
        if (modeOfPay !== 'Cheque' && !refNo.trim())    { toast.warn('Please enter the reference number.'); return false; }
        if (!transactionDate)                           { toast.warn('Please select a transaction date.'); return false; }
        if (!transactionAmount)                         { toast.warn('Please enter the transaction amount.'); return false; }
        if (!remarks.trim())                            { toast.warn('Please enter remarks.'); return false; }
        return true;
    }, [selectedBank, modeOfPay, chequeId, refNo, transactionDate, transactionAmount, remarks]);

    const goNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep(s => s + 1);
    };

    const goBack = () => setStep(s => s - 1);

    const handleSubmit = () => {
        dispatch(submitBOESettlementPayment({
            BankId:            String(selectedBank?.BankId || ''),
            ModeofPay:         modeOfPay,
            Number:            modeOfPay === 'Cheque' ? chequeId : refNo,
            TransactionDate:   fmtDate(transactionDate),
            TransactionAmount: String(transactionAmount),
            Remarks:           remarks,
            LCNO:              selectedLC,
            TranNo:            selectedTranNo,
            Createdby:         userName,
            Roleid:            parseInt(roleId, 10),
        }));
    };

    const handleReset = () => {
        setStep(1);
        setSelectedLC('');
        setSelectedTranID('');
        setSelectedTranNo('');
        setSelectedBank(null);
        setModeOfPay('');
        setChequeId('');
        setRefNo('');
        setTransactionDate(null);
        setTransactionAmount('');
        setRemarks('');
        dispatch(resetBOESettlement());
        dispatch(resetChequeNumbersData());
        dispatch(fetchBOELCNos());
        dispatch(fetchBankDetailsWithAvailableBalance());
    };

    // min/max dates from lcDetails
    const minDate = lcDetails?.MinDate || null;
    const maxDate = lcDetails?.MaxDate || null;

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ──────────────────────────────────────────────── */}
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
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Purchase Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'BOE Settlement Payment'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Bill of Exchange Settlement via Bank</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                            <div className="hidden sm:flex items-center gap-2 text-indigo-200">
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wider">Module</p>
                                    <p className="text-sm font-bold text-white">Purchase / BOE</p>
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

                {/* ── STEP 1: Select BOE ───────────────────────────────────── */}
                {step === 1 && (
                    <SectionCard>
                        <SectionHeader icon={FileText} title="BOE Selection" subtitle="Select LC number and transaction to load payment details" />
                        <div className="p-6">
                            <InnerHeader icon={Receipt} title="BOE / LC Details" subtitle="Choose the LC and the BOE transaction to settle" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                {/* LC Number */}
                                <div>
                                    <Label required>BOE / LC Number</Label>
                                    <div className="relative">
                                        <select
                                            className={inputCls}
                                            value={selectedLC}
                                            onChange={(e) => handleLCChange(e.target.value)}
                                            disabled={lcNosLoading}
                                        >
                                            <option value="">— Select LC No —</option>
                                            {lcNos.map(lc => (
                                                <option key={lc.ID} value={lc.ID}>{lc.LCNo}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={lcNosLoading} />
                                    </div>
                                </div>

                                {/* BOE Transaction */}
                                <div>
                                    <Label required>BOE Transaction</Label>
                                    <div className="relative">
                                        <select
                                            className={inputCls}
                                            value={selectedTranID}
                                            onChange={(e) => handleTranChange(e.target.value)}
                                            disabled={!selectedLC || boeTransLoading}
                                        >
                                            <option value="">— Select Transaction —</option>
                                            {boeTrans.map(t => (
                                                <option key={t.ID} value={t.ID}>{t.TranNo}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={boeTransLoading} />
                                    </div>
                                </div>
                            </div>

                            {/* Loading state */}
                            {paymentDataLoading && (
                                <div className="flex items-center justify-center py-10 gap-2 text-sm text-gray-400">
                                    <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" /> Loading payment data…
                                </div>
                            )}

                            {paymentDataError && (
                                <p className="text-sm text-rose-500 font-medium mt-2">{paymentDataError}</p>
                            )}

                            {/* BOE Summary Table */}
                            {paymentData && !paymentDataLoading && (
                                <>
                                    <div className="mt-2 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">LC No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Transaction No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Paid Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Valid Upto</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">BOE Amount</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Settlement Amt</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-t border-gray-100 dark:border-gray-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                                    <td className="px-4 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{paymentData.LCNO || '—'}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{paymentData.TranNo || '—'}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{paymentData.PaidDate || '—'}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{paymentData.ValidUptoDate || '—'}</td>
                                                    <td className="px-4 py-3 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{fmt(paymentData.Amount)}</td>
                                                    <td className="px-4 py-3 text-xs text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                        {lcDetailsLoading
                                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" />
                                                            : fmt(lcDetails?.TransactionAmount)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Inner invoice detail table */}
                                    {innerDataLoading && (
                                        <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-400">
                                            <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" /> Loading invoice details…
                                        </div>
                                    )}

                                    {innerData.length > 0 && !innerDataLoading && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Invoice Breakdown</p>
                                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">#</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">CC Code</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Invoice No</th>
                                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">PO No</th>
                                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {innerData.map((row, i) => (
                                                            <tr key={i} className="border-t border-gray-100 dark:border-gray-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                                                <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                                                                <td className="px-4 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{row.CCCode || '—'}</td>
                                                                <td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.InvoiceNo || '—'}</td>
                                                                <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.PoNo || '—'}</td>
                                                                <td className="px-4 py-2.5 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{fmt(row.DetAmount)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-indigo-50 dark:bg-indigo-900/20 border-t-2 border-indigo-200 dark:border-indigo-700">
                                                            <td colSpan={4} className="px-4 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Total</td>
                                                            <td className="px-4 py-2.5 text-xs text-right font-black text-indigo-700 dark:text-indigo-300">
                                                                {fmt(innerData.reduce((s, r) => s + (r.DetAmount || 0), 0))}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Amount in words */}
                                    {lcDetails?.AmountInWords && (
                                        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Amount in Words</p>
                                            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 italic">{lcDetails.AmountInWords}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* ── STEP 2: Payment Details ───────────────────────────────── */}
                {step === 2 && (
                    <>
                        {/* BOE summary */}
                        <SectionCard>
                            <SectionHeader icon={Receipt} title="Payment Summary" subtitle="BOE selected for settlement" />
                            <div className="p-6">
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">LC No</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Transaction No</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Valid Upto</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Settlement Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-t border-gray-100 dark:border-gray-700">
                                                <td className="px-4 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{paymentData?.LCNO || '—'}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{paymentData?.TranNo || '—'}</td>
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{paymentData?.ValidUptoDate || '—'}</td>
                                                <td className="px-4 py-3 text-xs text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{fmt(transactionAmount)}</td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-indigo-50 dark:bg-indigo-900/20 border-t-2 border-indigo-200 dark:border-indigo-700">
                                                <td colSpan={3} className="px-4 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Total Payment</td>
                                                <td className="px-4 py-3 text-sm text-right font-black text-indigo-700 dark:text-indigo-300">{fmt(transactionAmount)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {lcDetails?.AmountInWords && (
                                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Amount in Words</p>
                                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 italic">{lcDetails.AmountInWords}</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Payment details form */}
                        <SectionCard>
                            <SectionHeader icon={Landmark} title="Payment Details" subtitle="Bank account and transaction details" />
                            <div className="p-6">
                                <InnerHeader icon={CreditCard} title="Bank & Transaction Details" subtitle="Select bank and enter payment information" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Bank Account */}
                                    <div>
                                        <Label required>Bank Account</Label>
                                        <div className="relative">
                                            <select
                                                value={selectedBank?.BankId || ''}
                                                onChange={e => {
                                                    const b = bankList.find(x => String(x.BankId) === e.target.value);
                                                    setSelectedBank(b || null);
                                                }}
                                                className={inputCls}
                                                disabled={bankLoading}
                                            >
                                                <option value="">— Select Bank —</option>
                                                {bankList.map(b => (
                                                    <option key={b.BankId} value={b.BankId}>
                                                        {b.BankName}{b.AvailableBalance !== undefined ? ` (Bal: ₹${parseFloat(b.AvailableBalance || 0).toLocaleString('en-IN')})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={bankLoading} />
                                        </div>
                                    </div>

                                    {/* Mode of Payment */}
                                    <div>
                                        <Label required>Mode of Payment</Label>
                                        <div className="relative">
                                            <select
                                                value={modeOfPay}
                                                onChange={e => setModeOfPay(e.target.value)}
                                                className={inputCls}
                                                disabled={!selectedBank}
                                            >
                                                <option value="">— Select Mode —</option>
                                                {MODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <SelectIcon loading={false} />
                                        </div>
                                    </div>

                                    {/* Cheque No or Reference No */}
                                    {modeOfPay === 'Cheque' ? (
                                        <div>
                                            <Label required>Cheque Number</Label>
                                            <div className="relative">
                                                <select
                                                    value={chequeId}
                                                    onChange={e => setChequeId(e.target.value)}
                                                    className={inputCls}
                                                    disabled={chequeLoading || !modeOfPay}
                                                >
                                                    <option value="">— Select Cheque No —</option>
                                                    {chequeList.map(c => (
                                                        <option key={c.ChequeId || c.ChequeNo} value={c.ChequeId || c.ChequeNo}>
                                                            {c.ChequeNo}
                                                        </option>
                                                    ))}
                                                </select>
                                                <SelectIcon loading={chequeLoading} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <Label required>Reference Number</Label>
                                            <input
                                                type="text"
                                                value={refNo}
                                                onChange={e => setRefNo(e.target.value)}
                                                placeholder="Enter transaction reference number"
                                                className={inputCls}
                                                disabled={!modeOfPay}
                                            />
                                        </div>
                                    )}

                                    {/* Transaction Date */}
                                    <div>
                                        <Label required>Transaction Date</Label>
                                        <CustomDatePicker
                                            value={transactionDate}
                                            onChange={setTransactionDate}
                                            placeholder="Select transaction date"
                                            minDate={minDate}
                                            maxDate={maxDate}
                                        />
                                        {minDate && maxDate && (
                                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Allowed: {minDate} – {maxDate}</p>
                                        )}
                                    </div>

                                    {/* Transaction Amount */}
                                    <div>
                                        <Label required>Transaction Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                            <input
                                                type="number"
                                                className={`${inputCls} pl-7`}
                                                placeholder="0.00"
                                                value={transactionAmount}
                                                onChange={(e) => setTransactionAmount(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Remarks */}
                                    <div className="md:col-span-2">
                                        <Label required>Remarks</Label>
                                        <textarea
                                            value={remarks}
                                            onChange={e => setRemarks(e.target.value)}
                                            rows={3}
                                            placeholder="Enter payment remarks…"
                                            className={`${inputCls} resize-none`}
                                        />
                                    </div>
                                </div>

                                {lcDetails?.AmountInWords && (
                                    <div className="mt-5 p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-700">
                                        <div className="flex items-center gap-2 mb-1">
                                            <IndianRupee className="h-3.5 w-3.5 text-violet-500" />
                                            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Amount in Words</p>
                                        </div>
                                        <p className="text-sm font-semibold text-violet-800 dark:text-violet-200 italic">{lcDetails.AmountInWords}</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ── STEP 3: Review & Submit ───────────────────────────────── */}
                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Transaction Summary */}
                        <SectionCard>
                            <SectionHeader icon={Eye} title="Transaction Summary" subtitle="Review before submitting" />
                            <div className="p-6">
                                <ReviewRow label="LC Number"          value={paymentData?.LCNO} />
                                <ReviewRow label="Transaction No"     value={paymentData?.TranNo} />
                                <ReviewRow label="BOE Amount"         value={fmt(paymentData?.Amount)} />
                                <ReviewRow label="Valid Upto"         value={paymentData?.ValidUptoDate} />
                                <ReviewRow label="Settlement Amount"  value={fmt(transactionAmount)} highlight />
                                <ReviewRow label="Bank Account"       value={selectedBank?.BankName || '—'} />
                                <ReviewRow label="Mode of Payment"    value={modeOfPay} />
                                <ReviewRow label="Cheque / Ref No"    value={modeOfPay === 'Cheque' ? chequeId : refNo} />
                                <ReviewRow label="Transaction Date"   value={fmtDate(transactionDate)} />
                                <ReviewRow label="Remarks"            value={remarks} />
                            </div>
                        </SectionCard>

                        {/* Invoice Breakdown */}
                        <SectionCard>
                            <SectionHeader icon={Building2} title="Invoice Breakdown" subtitle="Cost centre details for this BOE" />
                            <div className="p-6">
                                {innerData.map((row, i) => (
                                    <div key={i} className="mb-3 last:mb-0">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{row.CCCode || '—'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{row.InvoiceNo || ''}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{fmt(row.DetAmount)}</p>
                                        </div>
                                        {row.PoNo && (
                                            <div className="flex items-center justify-between pl-4 py-1 border-b border-dashed border-gray-100 dark:border-gray-700/50">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">PO: {row.PoNo}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Settlement Total</span>
                                        <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(transactionAmount)}</span>
                                    </div>
                                    {lcDetails?.AmountInWords && (
                                        <p className="text-xs italic text-indigo-500 dark:text-indigo-400 mt-1">{lcDetails.AmountInWords}</p>
                                    )}
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* ── Navigation Buttons ───────────────────────────────────── */}
                <div className="flex items-center justify-between pt-2 pb-6">
                    <button
                        type="button"
                        onClick={goBack}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-gray-800"
                    >
                        ← Back
                    </button>

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={step === 1 && paymentDataLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saveLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saveLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                : <><Send className="h-4 w-4" /> Submit Payment</>}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default BOESettlement;
