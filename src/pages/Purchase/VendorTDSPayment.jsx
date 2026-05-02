import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    CreditCard, Loader2, RotateCcw, Send, ChevronDown, IndianRupee,
    CheckCircle, Navigation, FileText, Landmark, Receipt, Eye,
    Search, Filter, AlertCircle,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';
import { convertAmountToWords } from '../../utilities/amountToTextHelper';

import {
    fetchTDSCostCenters, fetchTDSCategories, fetchTDSSubDCA, fetchTDSITCodes,
    fetchTDSReport, submitTDSBudgetCheck, submitTDSPayment,
    clearTDSReport, clearBudgetResult, clearSaveResult, resetTDSPayment,
    selectTDSCostCenters, selectTDSCostCentersLoading,
    selectTDSCategories, selectTDSCategoriesLoading,
    selectTDSSubDCAs, selectTDSSubDCAsLoading,
    selectTDSITCodes, selectTDSITCodesLoading,
    selectTDSData, selectTDSReportLoading, selectTDSReportError,
    selectTDSBudgetResult, selectTDSBudgetStatus, selectTDSBudgetLoading,
    selectTDSSaveStatus, selectTDSSaveLoading, selectTDSSaveError,
} from '../../slices/purchaseSlice/vendorTDSPaymentSlice';

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
const STEPS        = ['Search & Select', 'Payment', 'Review'];
const MONTH_ABBR   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
    n !== undefined && n !== null && n !== ''
        ? `₹ ${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : '₹ 0.00';

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const selectCls = `${inputCls} appearance-none pr-10`;

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

const VendorTDSPayment = ({ menuData }) => {
    const dispatch     = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Redux state ────────────────────────────────────────────────────────────
    const costCenters        = useSelector(selectTDSCostCenters);
    const costCentersLoading = useSelector(selectTDSCostCentersLoading);
    const categories         = useSelector(selectTDSCategories);
    const categoriesLoading  = useSelector(selectTDSCategoriesLoading);
    const subDCAs            = useSelector(selectTDSSubDCAs);
    const subDCAsLoading     = useSelector(selectTDSSubDCAsLoading);
    const itCodes            = useSelector(selectTDSITCodes);
    const itCodesLoading     = useSelector(selectTDSITCodesLoading);
    const tdsData            = useSelector(selectTDSData);
    const reportLoading      = useSelector(selectTDSReportLoading);
    const reportError        = useSelector(selectTDSReportError);
    const budgetResult       = useSelector(selectTDSBudgetResult);
    const budgetStatus       = useSelector(selectTDSBudgetStatus);
    const budgetLoading      = useSelector(selectTDSBudgetLoading);
    const bankList           = useSelector(selectBankDetailsArray);
    const bankLoading        = useSelector(selectBankDetailsLoading);
    const chequeList         = useSelector(selectChequeNumbersArray);
    const chequeLoading      = useSelector(selectChequeNumbersLoading);
    const saveStatus         = useSelector(selectTDSSaveStatus);
    const saveLoading        = useSelector(selectTDSSaveLoading);
    const saveError          = useSelector(selectTDSSaveError);

    // ── Step 1: Search & Select ────────────────────────────────────────────────
    const [step,           setStep]           = useState(1);
    const [selectedCC,     setSelectedCC]     = useState('');
    const [selectedCat,    setSelectedCat]    = useState('');   // 'SelectAll' | 'SubDca' | 'ItCode'
    const [selectedFilter, setSelectedFilter] = useState('');   // SUBID or ITID value
    const [fromDate,       setFromDate]       = useState(null);
    const [toDate,         setToDate]         = useState(null);
    const [reportLoaded,   setReportLoaded]   = useState(false);

    // selectedRows: array of { _key, VendorTaxId, InvoiceNo, InvoiceDate, VendorName, PAN, CCCode, ITCode, BasicAmount, TDSAmount, TDSBalance, PaymentFor }
    const [selectedRows, setSelectedRows] = useState([]);
    const [payingAmts,   setPayingAmts]   = useState({});  // keyed by row._key

    // ── Step 2: Payment Details ────────────────────────────────────────────────
    const [selectedBank, setSelectedBank] = useState(null);
    const [modeOfPay,    setModeOfPay]    = useState('');
    const [chequeId,     setChequeId]     = useState('');
    const [refNo,        setRefNo]        = useState('');
    const [payDate,      setPayDate]      = useState(null);
    const [remarks,      setRemarks]      = useState('');

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchTDSCostCenters({ UID: String(userId), RID: String(roleId) }));
        dispatch(fetchTDSCategories());
        dispatch(fetchTDSSubDCA());
        dispatch(fetchTDSITCodes());
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetTDSPayment());
            dispatch(resetChequeNumbersData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Bank change → reload cheques, clear mode
    useEffect(() => {
        setModeOfPay(''); setChequeId(''); setRefNo('');
        dispatch(resetChequeNumbersData());
        if (!selectedBank) return;
        dispatch(fetchChequeNumbers(selectedBank.BankName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBank]);

    // Mode change → clear cheque/ref
    useEffect(() => { setChequeId(''); setRefNo(''); }, [modeOfPay]);

    // Category change → reset filter selection
    useEffect(() => { setSelectedFilter(''); }, [selectedCat]);

    // Handle budget check result
    useEffect(() => {
        if (budgetStatus === 'ok') {
            setStep(2);
        } else if (budgetStatus === 'fail' && budgetResult) {
            toast.error(`Budget Check: ${budgetResult}`);
            dispatch(clearBudgetResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [budgetStatus]);

    // Handle save result
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('TDS payment saved successfully!');
            handleReset();
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Payment save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Debug: log tdsData when it changes ────────────────────────────────────
    useEffect(() => {
        if (tdsData.length > 0) {
            console.log('[tdsData from Redux] first 3:', tdsData.slice(0, 3).map(r => ({
                InvoiceNo: r.InvoiceNo, VendorTaxId: r.VendorTaxId, PaymentFor: r.PaymentFor, TdsAmountBal: r.TdsAmountBal,
            })));
        }
    }, [tdsData]);

    // ── Derived ────────────────────────────────────────────────────────────────

    // Composite key — VendorTaxId + InvoiceNo uniquely identifies a TDS row
    const rowKey = (row) => `${row.VendorTaxId ?? ''}_${row.InvoiceNo ?? ''}`;

    // Only show rows that have an outstanding TDS balance
    const displayRows = tdsData.filter(r => parseFloat(r.TdsAmountBal || 0) > 0);

    // Total paying amount: sum of user-edited amounts for all selected rows
    const totalPayingAmt = selectedRows.reduce(
        (sum, row) => sum + parseFloat(payingAmts[row._key] || 0), 0
    );

    const amountInWords = totalPayingAmt > 0 ? convertAmountToWords(totalPayingAmt) : '';

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleLoadReport = () => {
        if (!selectedCC)  { toast.warn('Please select a cost center.'); return; }
        if (!selectedCat) { toast.warn('Please select a category.'); return; }
        if (!fromDate)    { toast.warn('Please select a From date.'); return; }
        if (!toDate)      { toast.warn('Please select a To date.'); return; }

        setSelectedRows([]);
        setPayingAmts({});
        setReportLoaded(false);
        dispatch(clearTDSReport());
        dispatch(fetchTDSReport({
            CCVal:    selectedCC === 'All' ? '' : selectedCC,
            Catid:    selectedCat,
            FromDate: fmtDate(fromDate),
            ToDate:   fmtDate(toDate),
            Type:     'Payment',
            ItSdca:   selectedFilter,
        })).then(() => setReportLoaded(true));
    };

    const isRowSelected = (key) => selectedRows.some(r => r._key === key);

    // buildRow copies ALL fields needed for budget check & submit from the raw API row
    const buildRow = (r) => ({
        _key:        rowKey(r),
        VendorTaxId: r.VendorTaxId,          // ← preserved exactly from API
        InvoiceNo:   r.InvoiceNo   || '',
        InvoiceDate: r.date        || '',
        VendorName:  r.VendorName  || '',
        PAN:         r.panno       || '',
        CCCode:      r.CCCode      || '',
        ITCode:      r.TDSITCode   || '',
        BasicAmount: r.Basicvalue  || 0,
        TDSAmount:   r.TdsAmount   || 0,
        TDSBalance:  r.TdsAmountBal|| 0,
        PaymentFor:  r.PaymentFor  || '',     // ← preserved exactly from API
    });

    const toggleRow = (row) => {
        console.log('[toggleRow] raw:', { VendorTaxId: row.VendorTaxId, PaymentFor: row.PaymentFor, InvoiceNo: row.InvoiceNo, TdsAmountBal: row.TdsAmountBal });
        const key = rowKey(row);
        if (isRowSelected(key)) {
            setSelectedRows(prev => prev.filter(r => r._key !== key));
            setPayingAmts(prev => { const next = { ...prev }; delete next[key]; return next; });
        } else {
            setSelectedRows(prev => [...prev, buildRow(row)]);
            // Default paying amount = full TDS balance for that invoice
            setPayingAmts(prev => ({ ...prev, [key]: String(parseFloat(row.TdsAmountBal || 0)) }));
        }
    };

    const toggleAllRows = () => {
        const allSel = displayRows.length > 0 && displayRows.every(r => isRowSelected(rowKey(r)));
        if (allSel) {
            setSelectedRows([]);
            setPayingAmts({});
        } else {
            const newRows = displayRows.filter(r => !isRowSelected(rowKey(r))).map(buildRow);
            setSelectedRows(prev => [...prev, ...newRows]);
            setPayingAmts(prev => {
                const next = { ...prev };
                newRows.forEach(r => {
                    if (!next[r._key]) next[r._key] = String(parseFloat(r.TDSBalance || 0));
                });
                return next;
            });
        }
    };

    const setPayingAmt = (key, val) => setPayingAmts(prev => ({ ...prev, [key]: val }));

    // ── Validation ─────────────────────────────────────────────────────────────

    const validateStep1 = useCallback(() => {
        if (tdsData.length === 0)      { toast.warn('Please load the TDS report first.'); return false; }
        if (selectedRows.length === 0) { toast.warn('Please select at least one invoice.'); return false; }
        if (totalPayingAmt <= 0)       { toast.warn('Total payment amount must be greater than 0.'); return false; }

        // Per-row: amount must be > 0
        const zeroPay = selectedRows.find(r => parseFloat(payingAmts[r._key] || 0) <= 0);
        if (zeroPay) {
            toast.warn(`Paying amount must be greater than 0 for invoice: ${zeroPay.InvoiceNo || zeroPay._key}`);
            return false;
        }

        // Per-row: amount must not exceed TDS balance
        const over = selectedRows.find(
            r => parseFloat(payingAmts[r._key] || 0) > parseFloat(r.TDSBalance || 0)
        );
        if (over) {
            toast.warn(`Paying amount cannot exceed the TDS balance for invoice: ${over.InvoiceNo || over._key}`);
            return false;
        }

        return true;
    }, [tdsData, selectedRows, totalPayingAmt, payingAmts]);

    const validateStep2 = useCallback(() => {
        if (!payDate)                                { toast.warn('Please select a payment date.'); return false; }
        if (!selectedBank)                           { toast.warn('Please select a bank account.'); return false; }
        if (!modeOfPay)                              { toast.warn('Please select mode of payment.'); return false; }
        if (modeOfPay === 'Cheque' && !chequeId)     { toast.warn('Please select a cheque number.'); return false; }
        if (modeOfPay !== 'Cheque' && !refNo.trim()) { toast.warn('Please enter the reference number.'); return false; }
        if (!remarks.trim())                         { toast.warn('Please enter remarks.'); return false; }
        return true;
    }, [payDate, selectedBank, modeOfPay, chequeId, refNo, remarks]);

    // ── Navigation ─────────────────────────────────────────────────────────────

    const goNext = () => {
        if (step === 1) {
            if (!validateStep1()) return;

            const joinC = (arr) => arr.join(',') + ',';
            const ids        = joinC(selectedRows.map(r => r.VendorTaxId));
            const amounts    = joinC(selectedRows.map(r => payingAmts[r._key] ?? String(r.TDSBalance || 0)));
            const paymentFor = joinC(selectedRows.map(r => r.PaymentFor));
            console.log('[TDS] selectedRows[0]:', selectedRows[0]);
            console.log('[TDS] budget payload:', { ids, amounts, paymentFor });
            dispatch(submitTDSBudgetCheck({ Ids: ids, Amounts: amounts, PaymentFor: paymentFor }));
            return; // step advance handled in budgetStatus effect
        }
        if (step === 2) {
            if (!validateStep2()) return;
            setStep(3);
        }
    };

    const goBack = () => setStep(s => s - 1);

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = () => {
        // ── FIX: use the user-entered payingAmts[r._key] as the authoritative amount.
        //         Never fall back to TDSBalance — the user may have intentionally
        //         entered a partial amount, and that is what should be debited.
        // SP uses WHILE charindex(',', @Ids) <> 0 — last item only processed with trailing comma
        const joinC = (arr) => arr.join(',') + ',';
        const payload = {
            Ids:               joinC(selectedRows.map(r => String(r.VendorTaxId))),
            Amounts:           joinC(selectedRows.map(r => String(parseFloat(payingAmts[r._key] || 0)))),
            Inovicenos:        joinC(selectedRows.map(r => r.InvoiceNo)),
            InoviceDates:      joinC(selectedRows.map(r => r.InvoiceDate)),
            TransactionDate:   fmtDate(payDate),
            Remarks:           remarks,
            ModeofPay:         modeOfPay,
            BankId:            parseInt(selectedBank?.BankId || 0, 10),
            Number:            modeOfPay === 'Cheque' ? chequeId : refNo,
            TransactionAmount: String(totalPayingAmt),
            Createdby:         userName,
            PaymentFor:        joinC(selectedRows.map(r => r.PaymentFor || '')),
            RoleId:            parseInt(roleId, 10),
        };
        dispatch(submitTDSPayment(payload));
    };

    // ── Reset ──────────────────────────────────────────────────────────────────

    const handleReset = () => {
        setStep(1);
        setSelectedCC(''); setSelectedCat(''); setSelectedFilter('');
        setFromDate(null); setToDate(null); setReportLoaded(false);
        setSelectedRows([]); setPayingAmts({});
        setSelectedBank(null); setModeOfPay(''); setChequeId(''); setRefNo('');
        setPayDate(null); setRemarks('');
        dispatch(resetTDSPayment());
        dispatch(resetChequeNumbersData());
        dispatch(fetchTDSCostCenters({ UID: String(userId), RID: String(roleId) }));
        dispatch(fetchTDSCategories());
        dispatch(fetchTDSSubDCA());
        dispatch(fetchTDSITCodes());
        dispatch(fetchBankDetailsWithAvailableBalance());
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
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
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Purchase Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Vendor TDS Payment'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">TDS Invoice Payment via Bank</p>
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
                                    <p className="text-sm font-bold text-white">Purchase / TDS</p>
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

                {/* ── STEP 1: Search & Select ───────────────────────────────── */}
                {step === 1 && (
                    <>
                        {/* Filter Panel */}
                        <SectionCard>
                            <SectionHeader icon={Filter} title="Search Filters" subtitle="Select criteria and load the TDS report" />
                            <div className="p-6">
                                <InnerHeader icon={Search} title="TDS Report Filters" subtitle="Choose cost center, category, date range and load" />

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                                    {/* Cost Center */}
                                    <div>
                                        <Label required>Cost Center</Label>
                                        <div className="relative">
                                            <select
                                                value={selectedCC}
                                                onChange={e => {
                                                    setSelectedCC(e.target.value);
                                                    setReportLoaded(false);
                                                    setSelectedRows([]);
                                                    setPayingAmts({});
                                                    dispatch(clearTDSReport());
                                                }}
                                                className={selectCls}
                                                disabled={costCentersLoading}
                                            >
                                                <option value="">— Select Cost Center —</option>
                                                <option value="All">All Cost Centers</option>
                                                {costCenters.map((cc, i) => (
                                                    <option key={i} value={cc.CCID}>
                                                        {cc.CCVAL}
                                                    </option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={costCentersLoading} />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <Label required>Category</Label>
                                        <div className="relative">
                                            <select
                                                value={selectedCat}
                                                onChange={e => {
                                                    setSelectedCat(e.target.value);
                                                    setReportLoaded(false);
                                                    setSelectedRows([]);
                                                    setPayingAmts({});
                                                    dispatch(clearTDSReport());
                                                }}
                                                className={selectCls}
                                                disabled={categoriesLoading}
                                            >
                                                <option value="">— Select Category —</option>
                                                {categories.map((cat, i) => (
                                                    <option key={cat.CATID || i} value={cat.CATID}>
                                                        {cat.CATVAL}
                                                    </option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={categoriesLoading} />
                                        </div>
                                    </div>

                                    {/* SubDCA — shown only when Category = SubDca */}
                                    {selectedCat === 'SubDca' && (
                                        <div>
                                            <Label>Sub DCA</Label>
                                            <div className="relative">
                                                <select
                                                    value={selectedFilter}
                                                    onChange={e => setSelectedFilter(e.target.value)}
                                                    className={selectCls}
                                                    disabled={subDCAsLoading}
                                                >
                                                    <option value="">— All SubDCA —</option>
                                                    {subDCAs.map((s, i) => (
                                                        <option key={s.SUBID || i} value={s.SUBID}>
                                                            {s.SUBVAL}
                                                        </option>
                                                    ))}
                                                </select>
                                                <SelectIcon loading={subDCAsLoading} />
                                            </div>
                                        </div>
                                    )}

                                    {/* IT Code — shown only when Category = ItCode */}
                                    {selectedCat === 'ItCode' && (
                                        <div>
                                            <Label>IT Code</Label>
                                            <div className="relative">
                                                <select
                                                    value={selectedFilter}
                                                    onChange={e => setSelectedFilter(e.target.value)}
                                                    className={selectCls}
                                                    disabled={itCodesLoading}
                                                >
                                                    <option value="">— All IT Codes —</option>
                                                    {itCodes.map((it, i) => (
                                                        <option key={it.ITID || i} value={it.ITID}>
                                                            {it.ITVAL}
                                                        </option>
                                                    ))}
                                                </select>
                                                <SelectIcon loading={itCodesLoading} />
                                            </div>
                                        </div>
                                    )}

                                    {/* From Date */}
                                    <div>
                                        <Label required>From Date</Label>
                                        <CustomDatePicker
                                            value={fromDate}
                                            onChange={(d) => { setFromDate(d); setReportLoaded(false); dispatch(clearTDSReport()); }}
                                            placeholder="Select from date"
                                        />
                                    </div>

                                    {/* To Date */}
                                    <div>
                                        <Label required>To Date</Label>
                                        <CustomDatePicker
                                            value={toDate}
                                            onChange={(d) => { setToDate(d); setReportLoaded(false); dispatch(clearTDSReport()); }}
                                            placeholder="Select to date"
                                        />
                                    </div>

                                    {/* Load Button */}
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={handleLoadReport}
                                            disabled={!selectedCC || !selectedCat || !fromDate || !toDate || reportLoading}
                                            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {reportLoading
                                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading Report…</>
                                                : <><Eye className="h-4 w-4" /> Load TDS Report</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* TDS Invoice Table */}
                        {(tdsData.length > 0 || reportLoaded) && (
                            <SectionCard>
                                <SectionHeader icon={FileText} title="TDS Invoices" subtitle="Select invoices and enter paying amount" />
                                <div className="p-6">
                                    {reportError && (
                                        <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-xl mb-4">
                                            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                                            <p className="text-sm text-rose-600 dark:text-rose-400">{reportError}</p>
                                        </div>
                                    )}

                                    {displayRows.length === 0 && !reportLoading ? (
                                        <div className="py-12 text-center">
                                            <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-sm text-gray-400 dark:text-gray-500">No pending TDS invoices found for the selected criteria.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-indigo-50/60 dark:bg-indigo-900/10">
                                                            <th className="px-4 py-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={displayRows.length > 0 && displayRows.every(r => isRowSelected(rowKey(r)))}
                                                                    onChange={toggleAllRows}
                                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                            </th>
                                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Invoice No</th>
                                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Inv. Date</th>
                                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Vendor Name</th>
                                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">PAN</th>
                                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">CC</th>
                                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">IT Code</th>
                                                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Basic Amt</th>
                                                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">TDS Amt</th>
                                                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">TDS Balance</th>
                                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Type</th>
                                                            <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Pay Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {displayRows.map((row, i) => {
                                                            const key     = rowKey(row);
                                                            const sel     = isRowSelected(key);
                                                            const paying  = parseFloat(payingAmts[key] || 0);
                                                            const balance = parseFloat(row.TdsAmountBal || 0);
                                                            const exceeds = sel && paying > balance;
                                                            return (
                                                                <tr key={key || i}
                                                                    className={`border-t border-gray-100 dark:border-gray-700 transition-colors
                                                                        ${sel ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                                                                    <td className="px-4 py-2.5 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={sel}
                                                                            onChange={() => toggleRow(row)}
                                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                                        {row.InvoiceNo || '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                                        {row.date || '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300">
                                                                        {row.VendorName || '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap font-mono">
                                                                        {row.panno || '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                                        {row.CCCode || '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                                        {row.TDSITCode || '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                                        {fmt(row.Basicvalue)}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-right text-amber-600 dark:text-amber-400 whitespace-nowrap font-semibold">
                                                                        {fmt(row.TdsAmount)}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                                        {fmt(row.TdsAmountBal)}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                                        {row.PaymentFor || '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2 min-w-[130px]">
                                                                        <input
                                                                            type="number"
                                                                            value={payingAmts[key] ?? ''}
                                                                            onChange={e => setPayingAmt(key, e.target.value)}
                                                                            disabled={!sel}
                                                                            min="0"
                                                                            step="0.01"
                                                                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs text-right font-semibold focus:outline-none focus:ring-1 transition-all
                                                                                ${!sel
                                                                                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed'
                                                                                    : exceeds
                                                                                        ? 'border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 focus:ring-rose-400'
                                                                                        : 'border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 focus:ring-indigo-400'}`}
                                                                        />
                                                                        {exceeds && (
                                                                            <p className="text-rose-500 text-[10px] mt-0.5 text-right leading-tight">
                                                                                Max {fmt(balance)}
                                                                            </p>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-gray-50 dark:bg-gray-900/40 border-t-2 border-gray-200 dark:border-gray-700">
                                                            <td colSpan={7} className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                                Total
                                                            </td>
                                                            <td className="px-3 py-2.5 text-xs text-right font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                                {fmt(displayRows.reduce((s, r) => s + parseFloat(r.Basicvalue || 0), 0))}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-xs text-right font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                                                                {fmt(displayRows.reduce((s, r) => s + parseFloat(r.TdsAmount || 0), 0))}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-xs text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                                {fmt(displayRows.reduce((s, r) => s + parseFloat(r.TdsAmountBal || 0), 0))}
                                                            </td>
                                                            <td />
                                                            <td className="px-3 py-2.5 text-xs text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                                {fmt(totalPayingAmt)}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            {/* Selection summary */}
                                            {selectedRows.length > 0 && (
                                                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                                            {selectedRows.length} Invoice{selectedRows.length > 1 ? 's' : ''} Selected
                                                        </span>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Paying</p>
                                                            <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(totalPayingAmt)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </SectionCard>
                        )}

                        {/* IT Code-wise summary of selected invoices */}
                        {selectedRows.length > 0 && (() => {
                            const itGroups = selectedRows.reduce((acc, row) => {
                                const code = row.ITCode || '—';
                                if (!acc[code]) acc[code] = { count: 0, basicAmt: 0, tdsAmt: 0, paying: 0 };
                                acc[code].count    += 1;
                                acc[code].basicAmt += parseFloat(row.BasicAmount || 0);
                                acc[code].tdsAmt   += parseFloat(row.TDSAmount   || 0);
                                acc[code].paying   += parseFloat(payingAmts[row._key] || 0);
                                return acc;
                            }, {});
                            const groups = Object.entries(itGroups);
                            return (
                                <SectionCard>
                                    <SectionHeader icon={FileText} title="IT Code Summary" subtitle="Paying amount grouped by IT code for selected invoices" />
                                    <div className="p-6 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-violet-50/60 dark:bg-violet-900/10">
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IT Code</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Invoices</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Basic Amount</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">TDS Amount</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Paying Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groups.map(([code, g], i) => (
                                                    <tr key={code} className={`border-t border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? '' : 'bg-violet-50/20 dark:bg-violet-900/5'}`}>
                                                        <td className="px-4 py-2.5 text-xs font-semibold text-violet-600 dark:text-violet-400">{code}</td>
                                                        <td className="px-4 py-2.5 text-xs text-center text-gray-600 dark:text-gray-400">{g.count}</td>
                                                        <td className="px-4 py-2.5 text-xs text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">{fmt(g.basicAmt)}</td>
                                                        <td className="px-4 py-2.5 text-xs text-right text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">{fmt(g.tdsAmt)}</td>
                                                        <td className="px-4 py-2.5 text-xs text-right text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">{fmt(g.paying)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-violet-50 dark:bg-violet-900/20 border-t-2 border-violet-200 dark:border-violet-700">
                                                    <td className="px-4 py-2.5 text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">Total</td>
                                                    <td className="px-4 py-2.5 text-xs text-center font-bold text-violet-700 dark:text-violet-300">{selectedRows.length}</td>
                                                    <td className="px-4 py-2.5 text-xs text-right font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{fmt(groups.reduce((s, [, g]) => s + g.basicAmt, 0))}</td>
                                                    <td className="px-4 py-2.5 text-xs text-right font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">{fmt(groups.reduce((s, [, g]) => s + g.tdsAmt, 0))}</td>
                                                    <td className="px-4 py-2.5 text-xs text-right font-black text-indigo-700 dark:text-indigo-300 whitespace-nowrap">{fmt(totalPayingAmt)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </SectionCard>
                            );
                        })()}
                    </>
                )}

                {/* ── STEP 2: Payment Details ───────────────────────────────── */}
                {step === 2 && (
                    <>
                        {/* Selected Invoices Summary */}
                        <SectionCard>
                            <SectionHeader icon={Receipt} title="Selected Invoices" subtitle="Invoices included in this payment" />
                            <div className="p-6">
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Invoice No</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendor</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PAN</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">IT Code</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">TDS Balance</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Pay Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRows.map((row, i) => (
                                                <tr key={row._key} className={`border-t border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-900/20'}`}>
                                                    <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                                                    <td className="px-4 py-2.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{row.InvoiceNo || '—'}</td>
                                                    <td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300">{row.VendorName || '—'}</td>
                                                    <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-nowrap">{row.PAN || '—'}</td>
                                                    <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.ITCode || '—'}</td>
                                                    <td className="px-4 py-2.5 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{fmt(row.TDSBalance)}</td>
                                                    <td className="px-4 py-2.5 text-xs text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                        {fmt(payingAmts[row._key])}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-indigo-50 dark:bg-indigo-900/20 border-t-2 border-indigo-200 dark:border-indigo-700">
                                                <td colSpan={6} className="px-4 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                                                    Total Payment
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-black text-indigo-700 dark:text-indigo-300">
                                                    {fmt(totalPayingAmt)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {amountInWords && (
                                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Amount in Words</p>
                                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 italic">{amountInWords}</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Bank & Payment Details */}
                        <SectionCard>
                            <SectionHeader icon={Landmark} title="Payment Details" subtitle="Bank account and transaction information" />
                            <div className="p-6">
                                <InnerHeader icon={CreditCard} title="Bank & Transaction Details" subtitle="Select bank and enter payment information" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Bank */}
                                    <div>
                                        <Label required>Bank Account</Label>
                                        <div className="relative">
                                            <select
                                                value={selectedBank?.BankId || ''}
                                                onChange={e => {
                                                    const b = bankList.find(x => String(x.BankId) === e.target.value);
                                                    setSelectedBank(b || null);
                                                }}
                                                className={selectCls}
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
                                                className={selectCls}
                                                disabled={!selectedBank}
                                            >
                                                <option value="">— Select Mode —</option>
                                                {MODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <SelectIcon loading={false} />
                                        </div>
                                    </div>

                                    {/* Cheque or Reference Number */}
                                    {modeOfPay === 'Cheque' ? (
                                        <div>
                                            <Label required>Cheque Number</Label>
                                            <div className="relative">
                                                <select
                                                    value={chequeId}
                                                    onChange={e => setChequeId(e.target.value)}
                                                    className={selectCls}
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

                                    {/* Payment Date */}
                                    <div>
                                        <Label required>Payment Date</Label>
                                        <CustomDatePicker
                                            value={payDate}
                                            onChange={setPayDate}
                                            placeholder="Select payment date"
                                        />
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

                                {/* Total & Amount in Words */}
                                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">Total Amount</p>
                                        <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{fmt(totalPayingAmt)}</p>
                                    </div>
                                    {amountInWords && (
                                        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-700">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IndianRupee className="h-3.5 w-3.5 text-violet-500" />
                                                <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Amount in Words</p>
                                            </div>
                                            <p className="text-sm font-semibold text-violet-800 dark:text-violet-200 italic">{amountInWords}</p>
                                        </div>
                                    )}
                                </div>
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
                                <ReviewRow label="Cost Center"     value={selectedCC} />
                                <ReviewRow label="Category"        value={categories.find(c => c.CATID === selectedCat)?.CATVAL || selectedCat} />
                                <ReviewRow label="Filter Value"    value={selectedFilter || 'All'} />
                                <ReviewRow label="Date Range"      value={`${fmtDate(fromDate)} — ${fmtDate(toDate)}`} />
                                <ReviewRow label="Invoices"        value={`${selectedRows.length} invoice${selectedRows.length > 1 ? 's' : ''}`} />
                                <ReviewRow label="Total Amount"    value={fmt(totalPayingAmt)} highlight />
                                <ReviewRow label="Bank Account"    value={selectedBank?.BankName || '—'} />
                                <ReviewRow label="Mode of Payment" value={modeOfPay} />
                                <ReviewRow label="Cheque / Ref No" value={modeOfPay === 'Cheque' ? chequeId : refNo} />
                                <ReviewRow label="Payment Date"    value={fmtDate(payDate)} />
                                <ReviewRow label="Remarks"         value={remarks} />
                            </div>
                        </SectionCard>

                        {/* Invoice Breakdown */}
                        <SectionCard>
                            <SectionHeader icon={Receipt} title="Invoice Breakdown" subtitle="Selected invoices summary" />
                            <div className="p-6">
                                {selectedRows.map((row) => (
                                    <div key={row._key} className="mb-3 last:mb-0">
                                        <div className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{row.InvoiceNo || '—'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{row.VendorName || ''}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{row.PAN || ''}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 dark:text-gray-500">TDS Balance</p>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{fmt(row.TDSBalance)}</p>
                                                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                                                    {fmt(payingAmts[row._key])}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Grand Total</span>
                                        <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(totalPayingAmt)}</span>
                                    </div>
                                    {amountInWords && (
                                        <p className="text-xs italic text-indigo-500 dark:text-indigo-400 mt-1">{amountInWords}</p>
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
                            disabled={reportLoading || budgetLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {budgetLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking Budget…</>
                                : 'Next →'}
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

export default VendorTDSPayment;