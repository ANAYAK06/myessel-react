import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Building2, CreditCard, Loader2, RotateCcw, Send, ChevronDown,
    IndianRupee, Hash, CheckCircle, Navigation, StickyNote,
    FileText, Landmark, Receipt, ChevronRight, ChevronLeft,
    Eye, AlertTriangle, Pencil, Layers,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';
import { formatIndianCurrency } from '../../utilities/amountToTextHelper';

import {
    fetchPaymentTypes, fetchPaymentVendors, fetchPOList,
    fetchInvoiceData, fetchVenLCCodes,
    validateTransactionType, validatePaymentDates,
    submitSPPOPayment,
    clearVendors, clearPOList, clearInvoiceData, clearLCCodes,
    clearSaveResult, resetSPPOPayment,
    selectPaymentTypes, selectPaymentTypesLoading,
    selectSPPOVendors, selectSPPOVendorsLoading,
    selectSPPOPOList, selectSPPOPOLoading,
    selectSPPOInvoiceData, selectSPPOInvoiceDataLoading,
    selectLCCodes, selectLCCodesLoading,
    selectTxnCheckLoading,
    selectSPPOSaveStatus, selectSPPOSaveLoading, selectSPPOSaveError,
} from '../../slices/purchaseSlice/sppoPaymentSlice';

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

// ── Constants ─────────────────────────────────────────────────────────────────

const VENDOR_TYPES  = ['Supplier', 'Service Provider'];
const MODE_OPTIONS  = ['Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI'];
const MONTH_ABBR    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STEPS         = ['Party', 'Invoices', 'Payment', 'Review'];

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// parse a date string to Date object for comparisons
const parseDate = (str) => {
    if (!str) return null;
    const m = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/.exec(str);
    if (!m) return new Date(str);
    return new Date(`${m[2]} ${m[1]} ${m[3]}`);
};

// get field value from an object trying multiple key variations
const getField = (obj, ...keys) => {
    for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    return '';
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

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

const SectionCard = ({ children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
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

// ── Step Indicator ────────────────────────────────────────────────────────────

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

// ── Invoice Row (editable) ────────────────────────────────────────────────────

const InvoiceRow = ({ row, idx, selected, onToggle, payingAmt, onAmtChange }) => {
    const invNo    = getField(row, 'InvoiceNo', 'Invno', 'InvNo', 'invoiceno');
    const poNo     = getField(row, 'SPPONo', 'PONo', 'Pono', 'PoNo', 'pono');
    const invDate  = getField(row, 'InvoiceDate', 'Invdate', 'InvDate', 'invdate');
    const invAmt   = parseFloat(getField(row, 'InvoiceAmount', 'NetAmount', 'Amount', 'InvAmt') || 0);
    const paidAmt  = parseFloat(getField(row, 'PaidAmount', 'Paidamt', 'PaidAmt') || 0);
    const balAmt   = parseFloat(getField(row, 'BalanceAmount', 'BalAmt', 'Balance', 'Balamt') || invAmt - paidAmt);

    return (
        <tr className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${selected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
            <td className="px-3 py-2.5 text-center">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(idx)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
            </td>
            <td className="px-3 py-2.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{invNo || `Row ${idx + 1}`}</td>
            <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{poNo}</td>
            <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{fmtDate(invDate) || invDate}</td>
            <td className="px-3 py-2.5 text-xs text-right text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                {invAmt ? `₹ ${invAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
            </td>
            <td className="px-3 py-2.5 text-xs text-right text-gray-500 dark:text-gray-500 whitespace-nowrap">
                {paidAmt ? `₹ ${paidAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
            </td>
            <td className="px-3 py-2.5 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                {`₹ ${balAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </td>
            <td className="px-3 py-2 min-w-[120px]">
                <input
                    type="number"
                    value={payingAmt}
                    onChange={e => onAmtChange(idx, e.target.value)}
                    disabled={!selected}
                    min="0"
                    step="0.01"
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs text-right font-semibold focus:outline-none focus:ring-1 transition-all
                        ${selected
                            ? 'border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 focus:ring-indigo-400'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed'}`}
                />
            </td>
        </tr>
    );
};

// ── PO Multi-Select Dropdown ──────────────────────────────────────────────────

const POMultiSelectDropdown = ({ options, selected, onChange, loading, disabled }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const togglePO = (po) => onChange(selected.includes(po) ? selected.filter(p => p !== po) : [...selected, po]);
    const selectAll = () => onChange([...options]);
    const clearAll  = () => onChange([]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => !disabled && !loading && setOpen(o => !o)}
                disabled={disabled || loading}
                className={`${inputCls} text-left flex items-center justify-between`}
            >
                <span className={selected.length === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}>
                    {loading ? 'Loading PO numbers…' : selected.length === 0
                        ? (options.length === 0 ? 'No PO numbers available' : '— Select PO Numbers —')
                        : `${selected.length} PO${selected.length > 1 ? 's' : ''} selected`}
                </span>
                {loading
                    ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" />
                    : <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </button>

            {open && options.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    <div className="flex gap-3 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 rounded-t-xl sticky top-0">
                        <button type="button" onClick={selectAll} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Select All</button>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <button type="button" onClick={clearAll} className="text-xs text-rose-500 font-semibold hover:underline">Clear</button>
                        <span className="ml-auto text-xs text-gray-400">{selected.length}/{options.length}</span>
                    </div>
                    {options.map(po => (
                        <label key={po} className="flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                            <input
                                type="checkbox"
                                checked={selected.includes(po)}
                                onChange={() => togglePO(po)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{po}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

const SPPOPayment = ({ menuData }) => {
    const dispatch     = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Redux ──────────────────────────────────────────────────────────────────
    const paymentTypes          = useSelector(selectPaymentTypes);
    const paymentTypesLoading   = useSelector(selectPaymentTypesLoading);
    const vendors               = useSelector(selectSPPOVendors);
    const vendorsLoading        = useSelector(selectSPPOVendorsLoading);
    const poList                = useSelector(selectSPPOPOList);        // PO number rows
    const poLoading             = useSelector(selectSPPOPOLoading);
    const invoiceData           = useSelector(selectSPPOInvoiceData);   // invoice rows per selected POs
    const invoiceDataLoading    = useSelector(selectSPPOInvoiceDataLoading);
    const lcCodes               = useSelector(selectLCCodes);
    const lcCodesLoading        = useSelector(selectLCCodesLoading);
    const txnCheckLoading       = useSelector(selectTxnCheckLoading);
    const bankList            = useSelector(selectBankDetailsArray);
    const bankLoading         = useSelector(selectBankDetailsLoading);
    const chequeList          = useSelector(selectChequeNumbersArray);
    const chequeLoading       = useSelector(selectChequeNumbersLoading);
    const saveStatus          = useSelector(selectSPPOSaveStatus);
    const saveLoading         = useSelector(selectSPPOSaveLoading);
    const saveError           = useSelector(selectSPPOSaveError);

    // ── Step 1: Party ─────────────────────────────────────────────────────────
    const [step,         setStep]        = useState(1);
    const [vendorType,   setVendorType]  = useState('Supplier');
    const [paymentType,  setPaymentType] = useState('');
    const [vendorCode,   setVendorCode]  = useState('');

    // ── Step 2: Invoice Selection ─────────────────────────────────────────────
    const [bankPayType,  setBankPayType] = useState('Normal');  // 'Normal' | 'LC'
    const [lcNo,         setLcNo]        = useState('');
    const [selectedPONumbers, setSelectedPONumbers] = useState([]); // multi-selected PO strings
    const [selectedIdxs, setSelectedIdxs] = useState([]);         // selected invoice row indices (within filtered list)
    const [payingAmts,   setPayingAmts]  = useState({});           // idx → amount string
    const [advanceAmount, setAdvanceAmount] = useState('');        // manual amount for Advance type

    // ── Step 3: Payment Details ───────────────────────────────────────────────
    const [payDate,      setPayDate]     = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);
    const [modeOfPay,    setModeOfPay]   = useState('');
    const [chequeId,     setChequeId]    = useState('');
    const [refNo,        setRefNo]       = useState('');
    const [boedays,      setBoedays]     = useState('');
    const [remarks,      setRemarks]     = useState('');

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetSPPOPayment());
            dispatch(resetChequeNumbersData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Vendor type change: reload payment types, clear downstream
    useEffect(() => {
        setPaymentType(''); setVendorCode('');
        dispatch(clearVendors()); dispatch(clearPOList()); dispatch(clearInvoiceData());
        if (!vendorType) return;
        dispatch(fetchPaymentTypes({ VendorType: vendorType }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vendorType]);

    // Payment type change: reload vendors, clear downstream
    useEffect(() => {
        setVendorCode('');
        dispatch(clearVendors()); dispatch(clearPOList()); dispatch(clearInvoiceData());
        if (!paymentType) return;
        dispatch(fetchPaymentVendors({ VendorType: vendorType, PaymentType: paymentType }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentType]);

    // Vendor change: fetch LC codes, reset POs + invoices
    useEffect(() => {
        setLcNo(''); setSelectedIdxs([]); setPayingAmts({}); setSelectedPONumbers([]); setAdvanceAmount('');
        dispatch(clearPOList()); dispatch(clearInvoiceData()); dispatch(clearLCCodes());
        if (!vendorCode) return;
        dispatch(fetchVenLCCodes({ VendorCode: vendorCode }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vendorCode]);

    // BankPayType / LCNo change: reload PO list
    useEffect(() => {
        setSelectedIdxs([]); setPayingAmts({}); setSelectedPONumbers([]); setAdvanceAmount('');
        dispatch(clearPOList()); dispatch(clearInvoiceData());
        if (!vendorCode || !paymentType) return;
        if (bankPayType === 'LC' && !lcNo) return;
        dispatch(fetchPOList({
            VendorCode: vendorCode,
            VendorType: vendorType,
            PaymentType: paymentType,
            LCno: bankPayType === 'LC' ? lcNo : '',
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vendorCode, bankPayType, lcNo]);

    // Bank change: fetch cheques, clear mode
    useEffect(() => {
        setModeOfPay(''); setChequeId(''); setRefNo('');
        dispatch(resetChequeNumbersData());
        if (!selectedBank) return;
        dispatch(fetchChequeNumbers(selectedBank.BankName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBank]);

    // Mode change: clear ref/cheque
    useEffect(() => { setChequeId(''); setRefNo(''); }, [modeOfPay]);

    // When PO selection changes: fetch invoice data (non-Advance), reset invoice selection
    useEffect(() => {
        setSelectedIdxs([]); setPayingAmts({});
        dispatch(clearInvoiceData());
        if (!selectedPONumbers.length || !vendorCode || !paymentType) return;
        if (isAdvance) return; // Advance has no invoices
        // PONo format expected by API: "PO1,PO2," (trailing comma)
        const poNos = selectedPONumbers.join(',') + ',';
        dispatch(fetchInvoiceData({ VendorCode: vendorCode, PONo: poNos, PayType: paymentType }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPONumbers]);

    // Auto-init paying amounts when invoice data loads
    useEffect(() => {
        if (!invoiceData.length) { setPayingAmts({}); setSelectedIdxs([]); return; }
        const amts = {};
        invoiceData.forEach((row, i) => {
            const bal  = parseFloat(getField(row, 'BalanceAmount', 'BalAmt', 'Balance', 'Balamt') || 0);
            const inv  = parseFloat(getField(row, 'InvoiceAmount', 'Invamt', 'Amount', 'InvAmt') || 0);
            const paid = parseFloat(getField(row, 'PaidAmount', 'Paidamt', 'PaidAmt') || 0);
            amts[i] = String(bal > 0 ? bal : Math.max(inv - paid, 0));
        });
        setPayingAmts(amts);
        setSelectedIdxs(invoiceData.map((_, i) => i));
    }, [invoiceData]);

    // Handle save result
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Vendor payment saved successfully!');
            handleReset();
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Payment save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Derived values ────────────────────────────────────────────────────────

    // paymentType state holds the PaymentType string (e.g. "Vendor Invoice", "Vendor Advance")
    const selectedPaymentTypeDesc =
        paymentTypes.find(pt => (pt.PaymentType || pt.Type) === paymentType)?.TypeDesc
        || paymentType; // fallback: paymentType itself is already the descriptive string
    const ptLower      = selectedPaymentTypeDesc.toLowerCase();
    const isAdvance    = ptLower.includes('advance');
    const isRetention  = ptLower.includes('retention');
    const isHold       = ptLower.includes('hold');

    // Unique PO numbers from the PO list (GetPOForPayment)
    const uniquePONos = [...new Set(poList.map(r => getField(r, 'SPPONo', 'PONo', 'Pono', 'PoNo', 'pono')).filter(Boolean))];

    // Invoice rows are from the dedicated invoice fetch (GetInvoiceDataForPayment)
    const selectedRows   = invoiceData.filter((_, i) => selectedIdxs.includes(i));
    const totalPayingAmt = isAdvance
        ? parseFloat(advanceAmount || 0)
        : selectedIdxs.reduce((sum, i) => sum + (parseFloat(payingAmts[i]) || 0), 0);
    const maxInvoiceDate = selectedRows.reduce((max, row) => {
        const d = getField(row, 'InvoiceDate', 'Invdate', 'InvDate', 'invdate');
        if (!d) return max;
        const parsed = parseDate(fmtDate(d) || d);
        return (!max || parsed > max) ? parsed : max;
    }, null);

    const selectedVendor     = vendors.find(v => v.VendorCode === vendorCode);
    // All values use trailing comma format to match backend SP expectations
    const selectedInvoiceNos = selectedRows.map(r => getField(r, 'InvoiceNo', 'Invno', 'InvNo', 'invoiceno')).filter(Boolean).join(',') + (selectedRows.length ? ',' : '');
    const payloadPONos       = selectedPONumbers.join(',') + (selectedPONumbers.length ? ',' : '');
    // All invoice dates comma-joined with trailing comma (backend expects this format)
    const allInvoiceDates    = selectedRows.map(r => { const d = getField(r, 'InvoiceDate', 'Invdate', 'InvDate', 'invdate'); return fmtDate(d) || d; }).filter(Boolean).join(',') + (selectedRows.length ? ',' : '');

    // ── Toggle helpers ────────────────────────────────────────────────────────

    const toggleRow = (idx) => {
        setSelectedIdxs(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const toggleAll = () => {
        if (selectedIdxs.length === invoiceData.length) setSelectedIdxs([]);
        else setSelectedIdxs(invoiceData.map((_, i) => i));
    };

    const setPayingAmt = (idx, val) => {
        setPayingAmts(prev => ({ ...prev, [idx]: val }));
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const validateStep1 = useCallback(() => {
        if (!vendorType)   { toast.warn('Please select a vendor type.');   return false; }
        if (!paymentType)  { toast.warn('Please select a payment type.');  return false; }
        if (!vendorCode)   { toast.warn('Please select a vendor.');        return false; }
        return true;
    }, [vendorType, paymentType, vendorCode]);

    const validateStep2 = useCallback(async () => {
        if (bankPayType === 'LC' && !lcNo) { toast.warn('Please select an LC number.'); return false; }
        if (selectedPONumbers.length === 0) { toast.warn('Please select at least one PO Number.'); return false; }

        if (isAdvance) {
            if (!advanceAmount || parseFloat(advanceAmount) <= 0) {
                toast.warn('Please enter the advance amount.'); return false;
            }
        } else {
            if (selectedIdxs.length === 0)  { toast.warn('Please select at least one invoice.'); return false; }
            if (totalPayingAmt <= 0)         { toast.warn('Total paying amount must be greater than 0.'); return false; }
        }

        // Validate each selected PO
        for (const poNo of selectedPONumbers) {
            const result = await dispatch(validateTransactionType({ PONo: poNo })).unwrap().catch(() => null);
            const resStr = typeof result === 'string' ? result : result?.Data || '';
            if (resStr && resStr !== 'Submited' && resStr.toLowerCase() !== 'ok') {
                toast.warn(`PO ${poNo}: ${resStr}`);
            }
        }
        return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bankPayType, lcNo, selectedPONumbers, isAdvance, advanceAmount, selectedIdxs, totalPayingAmt]);

    const validateStep3 = useCallback(() => {
        if (!payDate)                          { toast.warn('Please select a payment date.'); return false; }
        if (!selectedBank)                     { toast.warn('Please select a bank account.'); return false; }
        if (!modeOfPay)                        { toast.warn('Please select mode of payment.'); return false; }
        if (modeOfPay === 'Cheque' && !chequeId) { toast.warn('Please select a cheque number.'); return false; }
        if (modeOfPay !== 'Cheque' && !refNo.trim()) { toast.warn('Please enter the reference number.'); return false; }
        if (bankPayType === 'LC' && (!boedays || parseInt(boedays) <= 0)) {
            toast.warn('Please enter BOE days for LC payment.'); return false;
        }
        if (!remarks.trim()) { toast.warn('Please enter remarks.'); return false; }
        return true;
    }, [payDate, selectedBank, modeOfPay, chequeId, refNo, bankPayType, boedays, remarks]);

    // ── Navigation ────────────────────────────────────────────────────────────

    const goNext = async () => {
        if (step === 1 && !validateStep1())  return;
        if (step === 2 && !await validateStep2()) return;
        if (step === 3 && !validateStep3())  return;
        setStep(s => s + 1);
    };

    const goBack = () => setStep(s => s - 1);

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        // Date check
        if (maxInvoiceDate) {
            const dateCheckRes = await dispatch(validatePaymentDates({
                MaxInvoiceDate: fmtDate(maxInvoiceDate),
                TransactionDate: fmtDate(payDate),
            })).unwrap().catch(() => null);
            const resStr = typeof dateCheckRes === 'string' ? dateCheckRes : dateCheckRes?.Data || '';
            if (resStr && resStr !== 'Submited' && !resStr.toLowerCase().includes('ok')) {
                toast.warn(resStr);
                return;
            }
        }

        const payload = {
            InvoiceNos:        isAdvance ? '' : selectedInvoiceNos,
            PONumber:          payloadPONos,
            VendorCode:        vendorCode,
            TransactionDate:   fmtDate(payDate),
            BankName:          selectedBank?.BankName || '',
            ModeofPay:         modeOfPay,
            BankId:            String(selectedBank?.BankId || ''),
            TransactionAmount: totalPayingAmt,
            Remarks:           remarks,
            Number:            modeOfPay === 'Cheque' ? chequeId : refNo,
            Paytype:           paymentType,
            Createdby:         userName,
            Roleid:            parseInt(roleId, 10),
            BankorCash:        'Bank',
            VendorType:        vendorType,
            MaxInvoiceDate:    isAdvance ? '' : allInvoiceDates,
            BankPayType:       bankPayType === 'LC' ? 'LC' : 'Normal',  // correct key
            VenICNO:           bankPayType === 'LC' ? lcNo : '',          // correct key
            BOEDays:           bankPayType === 'LC' ? parseInt(boedays || '0', 10) : 0,
        };

        dispatch(submitSPPOPayment({ paymentTypeDesc: selectedPaymentTypeDesc, payload }));
    };

    // ── Reset ─────────────────────────────────────────────────────────────────

    const handleReset = () => {
        setStep(1);
        setVendorType('Supplier'); setPaymentType(''); setVendorCode('');
        setBankPayType('Normal'); setLcNo('');
        setSelectedPONumbers([]); setAdvanceAmount('');
        setSelectedIdxs([]); setPayingAmts({});
        setPayDate(null); setSelectedBank(null); setModeOfPay('');
        setChequeId(''); setRefNo(''); setBoedays(''); setRemarks('');
        dispatch(resetSPPOPayment());
        dispatch(resetChequeNumbersData());
        dispatch(fetchBankDetailsWithAvailableBalance());
        dispatch(clearInvoiceData());
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ─────────────────────────────────────────────── */}
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
                                    {menuData?.name || 'Vendor Bank Payment'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">SPPO Invoice Payment via Bank</p>
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
                                    <p className="text-sm font-bold text-white">Purchase / SPPO</p>
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

                {/* ── STEP 1: Party Selection ──────────────────────────────── */}
                {step === 1 && (
                    <SectionCard>
                        <SectionHeader icon={Building2} title="Party Selection" subtitle="Choose vendor type, payment type and vendor" />
                        <div className="p-6 md:p-8">
                            <InnerHeader icon={Building2} title="Party Details" subtitle="Select the party to make payment against" />

                            {/* Vendor Type */}
                            <div className="mb-6">
                                <Label required>Vendor Type</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {VENDOR_TYPES.map(vt => (
                                        <button
                                            key={vt}
                                            type="button"
                                            onClick={() => setVendorType(vt)}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all
                                                ${vendorType === vt
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${vendorType === vt ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                <Building2 className={`h-4 w-4 ${vendorType === vt ? 'text-white' : 'text-gray-400'}`} />
                                            </div>
                                            {vt}
                                            {vendorType === vt && <CheckCircle className="h-4 w-4 text-indigo-500 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label required>Payment Type</Label>
                                    <div className="relative">
                                        <select
                                            value={paymentType}
                                            onChange={e => setPaymentType(e.target.value)}
                                            className={`${inputCls} appearance-none pr-10`}
                                            disabled={paymentTypesLoading}
                                        >
                                            <option value="">{paymentTypesLoading ? 'Loading…' : '— Select Payment Type —'}</option>
                                            {paymentTypes.map((pt, i) => (
                                                <option key={`pt_${i}`} value={pt.PaymentType || pt.Type}>{pt.TypeDesc || pt.PaymentType || pt.Type}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={paymentTypesLoading} />
                                    </div>
                                </div>

                                {/* Vendor */}
                                <div>
                                    <Label required>Vendor</Label>
                                    <div className="relative">
                                        <select
                                            value={vendorCode}
                                            onChange={e => setVendorCode(e.target.value)}
                                            className={`${inputCls} appearance-none pr-10`}
                                            disabled={vendorsLoading || !paymentType}
                                        >
                                            <option value="">
                                                {!paymentType ? 'Select payment type first' : vendorsLoading ? 'Loading vendors…' : '— Select Vendor —'}
                                            </option>
                                            {vendors.map((v, i) => (
                                                <option key={`v_${v.VendorCode}_${i}`} value={v.VendorCode}>{v.VendorName}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={vendorsLoading} />
                                    </div>
                                    {selectedVendor && (
                                        <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">{selectedVendor.VendorName}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* ── STEP 2: Invoice Selection ────────────────────────────── */}
                {step === 2 && (
                    <>
                        {/* Bank Payment Type + LC Selection */}
                        <SectionCard>
                            <SectionHeader icon={Landmark} title="Bank Payment Type" subtitle="Select Normal or LC Transaction" />
                            <div className="p-6 md:p-8">
                                <InnerHeader icon={Landmark} title="Payment Method" subtitle="Choose the type of bank transaction" />

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[
                                        { val: 'Normal', label: 'Normal Transaction', desc: 'Direct bank payment' },
                                        { val: 'LC',     label: 'LC Transaction',     desc: 'Letter of Credit payment' },
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => { setBankPayType(opt.val); setLcNo(''); }}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all
                                                ${bankPayType === opt.val
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bankPayType === opt.val ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                <FileText className={`h-4 w-4 ${bankPayType === opt.val ? 'text-white' : 'text-gray-400'}`} />
                                            </div>
                                            <div className="text-left">
                                                <div>{opt.label}</div>
                                                <div className="text-xs font-normal text-gray-400 mt-0.5">{opt.desc}</div>
                                            </div>
                                            {bankPayType === opt.val && <CheckCircle className="h-4 w-4 text-indigo-500 ml-auto" />}
                                        </button>
                                    ))}
                                </div>

                                {/* LC Number (only if LC) */}
                                {bankPayType === 'LC' && (
                                    <div className="max-w-sm">
                                        <Label required>LC Number</Label>
                                        <div className="relative">
                                            <select
                                                value={lcNo}
                                                onChange={e => setLcNo(e.target.value)}
                                                className={`${inputCls} appearance-none pr-10`}
                                                disabled={lcCodesLoading}
                                            >
                                                <option value="">{lcCodesLoading ? 'Loading LC numbers…' : '— Select LC Number —'}</option>
                                                {lcCodes.map((lc, i) => {
                                                    const val  = getField(lc, 'LCNo', 'lcno', 'LcNo', 'Lcno', 'VendorLCNo');
                                                    const label = getField(lc, 'LCName', 'lcname', 'LcName', 'LCNo', 'lcno', 'VendorLCNo') || val;
                                                    return <option key={`lc_${i}`} value={val}>{label}</option>;
                                                })}
                                            </select>
                                            <SelectIcon loading={lcCodesLoading} />
                                        </div>
                                        {lcCodes.length === 0 && !lcCodesLoading && (
                                            <p className="mt-1.5 text-xs text-amber-500">No LC numbers found for this vendor.</p>
                                        )}
                                    </div>
                                )}

                                {/* PO Numbers Multi-Select — shown after transaction type is picked */}
                                {(bankPayType === 'Normal' || (bankPayType === 'LC' && lcNo)) && (
                                    <div className="mt-4">
                                        <Label required>PO Numbers</Label>
                                        <POMultiSelectDropdown
                                            options={uniquePONos}
                                            selected={selectedPONumbers}
                                            onChange={setSelectedPONumbers}
                                            loading={poLoading}
                                            disabled={uniquePONos.length === 0 && !poLoading}
                                        />
                                        {uniquePONos.length === 0 && !poLoading && (
                                            <p className="mt-1.5 text-xs text-amber-500">No PO numbers found for this vendor / payment type.</p>
                                        )}
                                        {selectedPONumbers.length > 0 && (
                                            <div className="mt-2.5 flex flex-wrap gap-2">
                                                {selectedPONumbers.map(po => (
                                                    <span key={po} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-700">
                                                        <Hash className="h-3 w-3" />{po}
                                                        <button type="button" onClick={() => setSelectedPONumbers(prev => prev.filter(p => p !== po))} className="ml-0.5 text-indigo-400 hover:text-rose-500 transition-colors">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Advance Amount — only for Advance payment type */}
                        {isAdvance && selectedPONumbers.length > 0 && (
                            <SectionCard>
                                <SectionHeader icon={IndianRupee} title="Advance Amount" subtitle="Enter the advance payment amount for selected POs" />
                                <div className="p-6 md:p-8">
                                    <div className="max-w-sm">
                                        <Label required>Advance Amount (₹)</Label>
                                        <input
                                            type="number"
                                            value={advanceAmount}
                                            onChange={e => setAdvanceAmount(e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            className={inputCls}
                                        />
                                        {advanceAmount && parseFloat(advanceAmount) > 0 && (
                                            <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                                ₹ {parseFloat(advanceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {/* Invoice Grid — only for non-Advance payment type */}
                        {!isAdvance && selectedPONumbers.length > 0 && (
                        <SectionCard>
                            <SectionHeader
                                icon={Receipt}
                                title="Invoice Selection"
                                subtitle="Select invoices and edit paying amounts"
                                action={
                                    selectedIdxs.length > 0 && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                                {selectedIdxs.length} selected
                                            </span>
                                            <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                                    ₹ {totalPayingAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                }
                            />
                            <div className="p-6 md:p-8">
                                <InnerHeader icon={Layers} title="Available Invoices" subtitle="Check invoices to include in this payment" />

                                {invoiceDataLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                                        <p className="text-sm text-gray-400">Loading invoices…</p>
                                    </div>
                                ) : invoiceData.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                                        <AlertTriangle className="h-8 w-8 text-amber-400" />
                                        <p className="text-sm text-gray-500">No pending invoices found for the selected POs.</p>
                                        <p className="text-xs text-gray-400">Try selecting different PO numbers above.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-b border-gray-200 dark:border-gray-700">
                                                        <th className="px-3 py-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIdxs.length === invoiceData.length && invoiceData.length > 0}
                                                                onChange={toggleAll}
                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                        </th>
                                                        {['Invoice No', 'PO No', 'Invoice Date', 'Invoice Amt', 'Paid Amt', 'Balance Amt', 'Paying Amt'].map(h => (
                                                            <th key={h} className="px-3 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                                {h === 'Paying Amt' ? <span className="flex items-center gap-1"><Pencil className="h-3 w-3" />{h}</span> : h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {invoiceData.map((row, i) => (
                                                        <InvoiceRow
                                                            key={i}
                                                            row={row}
                                                            idx={i}
                                                            selected={selectedIdxs.includes(i)}
                                                            onToggle={toggleRow}
                                                            payingAmt={payingAmts[i] ?? ''}
                                                            onAmtChange={setPayingAmt}
                                                        />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Total Summary */}
                                        {selectedIdxs.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Invoices Selected</p>
                                                    <p className="text-lg font-black text-gray-800 dark:text-gray-100 mt-0.5">{selectedIdxs.length}</p>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Invoice Amt</p>
                                                    <p className="text-base font-black text-gray-800 dark:text-gray-100 mt-0.5">
                                                        ₹ {selectedRows.reduce((s, r) => s + parseFloat(getField(r, 'InvoiceAmount', 'Invamt', 'Amount', 'InvAmt') || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-3 text-center border border-indigo-100 dark:border-indigo-800 col-span-2 md:col-span-1">
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Total Paying Amount</p>
                                                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-300 mt-0.5">
                                                        ₹ {totalPayingAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </SectionCard>
                        )}
                    </>
                )}

                {/* ── STEP 3: Payment Details ──────────────────────────────── */}
                {step === 3 && (
                    <>
                        {/* Date + Bank + Mode */}
                        <SectionCard>
                            <SectionHeader icon={CreditCard} title="Payment Details" subtitle="Bank, mode and transaction details" />
                            <div className="p-6 md:p-8">
                                <InnerHeader icon={CreditCard} title="Bank & Transaction" subtitle="Select bank account and payment method" />

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                    {/* Transaction Date */}
                                    <div>
                                        <Label required>Transaction Date</Label>
                                        <CustomDatePicker
                                            value={payDate}
                                            onChange={setPayDate}
                                            format="DD-MMM-YYYY"
                                            placeholder="Select payment date"
                                        />
                                    </div>

                                    {/* Bank Account */}
                                    <div className="md:col-span-2">
                                        <Label required>Bank Account</Label>
                                        <div className="relative">
                                            <select
                                                value={selectedBank?.BankId || ''}
                                                onChange={e => setSelectedBank(bankList.find(b => String(b.BankId) === e.target.value) || null)}
                                                className={`${inputCls} appearance-none pr-10`}
                                                disabled={bankLoading}
                                            >
                                                <option value="">{bankLoading ? 'Loading banks…' : '— Select Bank Account —'}</option>
                                                {bankList.map((b, i) => (
                                                    <option key={`bk_${b.BankId}_${i}`} value={b.BankId}>
                                                        {b.BankName}{b.AvailableBalance != null ? ` — Bal: ₹ ${parseFloat(b.AvailableBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={bankLoading} />
                                        </div>
                                        {selectedBank && (
                                            <div className="mt-2 flex items-center gap-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                                <IndianRupee className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                                                <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
                                                    Available: ₹ {parseFloat(selectedBank.AvailableBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </span>
                                                {totalPayingAmt > parseFloat(selectedBank.AvailableBalance || 0) && (
                                                    <span className="ml-auto flex items-center gap-1 text-xs text-rose-500 font-semibold">
                                                        <AlertTriangle className="h-3.5 w-3.5" /> Insufficient balance
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Mode of Payment */}
                                    <div>
                                        <Label required>Mode of Payment</Label>
                                        <div className="relative">
                                            <select
                                                value={modeOfPay}
                                                onChange={e => setModeOfPay(e.target.value)}
                                                className={`${inputCls} appearance-none pr-10`}
                                                disabled={!selectedBank}
                                            >
                                                <option value="">— Select Mode —</option>
                                                {MODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <SelectIcon loading={false} />
                                        </div>
                                    </div>

                                    {/* Cheque or Ref No */}
                                    {modeOfPay === 'Cheque' ? (
                                        <div>
                                            <Label required>Cheque Number</Label>
                                            <div className="relative">
                                                <select
                                                    value={chequeId}
                                                    onChange={e => setChequeId(e.target.value)}
                                                    className={`${inputCls} appearance-none pr-10`}
                                                    disabled={chequeLoading}
                                                >
                                                    <option value="">{chequeLoading ? 'Loading cheques…' : '— Select Cheque —'}</option>
                                                    {chequeList.map((c, i) => (
                                                        <option key={`ch_${i}`} value={c.ChequeId || c.ChequeNo || c}>{c.ChequeNo || c.ChequeId || c}</option>
                                                    ))}
                                                </select>
                                                <SelectIcon loading={chequeLoading} />
                                            </div>
                                        </div>
                                    ) : modeOfPay ? (
                                        <div>
                                            <Label required>Reference / Transaction No</Label>
                                            <input
                                                type="text"
                                                value={refNo}
                                                onChange={e => setRefNo(e.target.value)}
                                                placeholder={`Enter ${modeOfPay} reference number`}
                                                className={inputCls}
                                            />
                                        </div>
                                    ) : null}

                                    {/* BOE Days — only for LC */}
                                    {bankPayType === 'LC' && (
                                        <div>
                                            <Label required>BOE Days</Label>
                                            <input
                                                type="number"
                                                value={boedays}
                                                onChange={e => setBoedays(e.target.value)}
                                                placeholder="e.g. 90"
                                                min="1"
                                                className={inputCls}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Amount Summary */}
                                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                        Total Payment Amount {isAdvance ? '(Advance)' : `(${selectedIdxs.length} invoice${selectedIdxs.length !== 1 ? 's' : ''})`}
                                    </span>
                                    <span className="text-xl font-black text-indigo-800 dark:text-indigo-200">
                                        ₹ {totalPayingAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Remarks */}
                        <SectionCard>
                            <SectionHeader icon={StickyNote} title="Remarks" />
                            <div className="p-6 md:p-8">
                                <Label required>Remarks / Description</Label>
                                <textarea
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    rows={3}
                                    placeholder="Enter payment remarks…"
                                    className={`${inputCls} resize-none`}
                                />
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ── STEP 4: Review & Submit ──────────────────────────────── */}
                {step === 4 && (
                    <SectionCard>
                        <SectionHeader icon={Eye} title="Review & Submit" subtitle="Verify all details before submitting the payment" />
                        <div className="p-6 md:p-8">
                            <InnerHeader icon={Eye} title="Payment Summary" subtitle="Review carefully before confirming" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Party */}
                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Party</h3>
                                    <ReviewRow label="Vendor Type"   value={vendorType} />
                                    <ReviewRow label="Payment Type"  value={paymentType} highlight />
                                    <ReviewRow label="Vendor"        value={selectedVendor?.VendorName || vendorCode} />
                                </div>

                                {/* Transaction */}
                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Transaction</h3>
                                    <ReviewRow label="Bank Pay Type"   value={bankPayType === 'LC' ? 'LC Transaction' : 'Normal Transaction'} highlight />
                                    {bankPayType === 'LC' && <ReviewRow label="LC Number" value={lcNo} />}
                                    <ReviewRow label="PO Numbers"      value={selectedPONumbers.join(', ')} highlight />
                                    {!isAdvance && <ReviewRow label="Invoices" value={`${selectedIdxs.length} invoice(s) selected`} />}
                                    <ReviewRow label="Total Amount"    value={`₹ ${totalPayingAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} highlight />
                                </div>

                                {/* Payment */}
                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Details</h3>
                                    <ReviewRow label="Transaction Date" value={fmtDate(payDate)} />
                                    <ReviewRow label="Bank Account"     value={selectedBank?.BankName} />
                                    <ReviewRow label="Mode of Payment"  value={modeOfPay} />
                                    <ReviewRow label={modeOfPay === 'Cheque' ? 'Cheque No' : 'Ref No'} value={modeOfPay === 'Cheque' ? chequeId : refNo} />
                                    {bankPayType === 'LC' && <ReviewRow label="BOE Days" value={`${boedays} days`} />}
                                </div>

                                {/* Remarks */}
                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Remarks</h3>
                                    <ReviewRow label="Description" value={remarks} />
                                    {maxInvoiceDate && (
                                        <ReviewRow label="Max Invoice Date" value={fmtDate(maxInvoiceDate)} />
                                    )}
                                </div>
                            </div>

                            {/* Selected Invoices */}
                            {selectedRows.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Selected Invoices</p>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                                                    {['Invoice No', 'PO No', 'Invoice Date', 'Balance Amt', 'Paying Amt'].map(h => (
                                                        <th key={h} className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedIdxs.map(i => {
                                                    const row    = invoiceData[i];
                                                    const invNo  = getField(row, 'InvoiceNo', 'Invno', 'InvNo', 'invoiceno');
                                                    const poNo   = getField(row, 'SPPONo', 'PONo', 'Pono', 'PoNo', 'pono');
                                                    const invDate = getField(row, 'InvoiceDate', 'Invdate', 'InvDate', 'invdate');
                                                    const balAmt  = parseFloat(getField(row, 'BalanceAmount', 'BalAmt', 'Balance', 'Balamt') || 0);
                                                    return (
                                                        <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                                                            <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400 font-medium">{invNo}</td>
                                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{poNo}</td>
                                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{fmtDate(invDate) || invDate}</td>
                                                            <td className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                                                                ₹ {balAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300">
                                                                ₹ {parseFloat(payingAmts[i] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="bg-indigo-50 dark:bg-indigo-900/20 font-bold">
                                                    <td colSpan={4} className="px-3 py-2 text-right text-xs text-indigo-700 dark:text-indigo-300">Total Paying</td>
                                                    <td className="px-3 py-2 text-right text-sm text-indigo-700 dark:text-indigo-300">
                                                        ₹ {totalPayingAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* ── Navigation ───────────────────────────────────────────── */}
                <div className="flex items-center justify-between pb-6">
                    <button
                        type="button"
                        onClick={step === 1 ? handleReset : goBack}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        {step === 1 ? <RotateCcw className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        {step === 1 ? 'Reset' : 'Back'}
                    </button>

                    {step < 4 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={txnCheckLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                        >
                            {txnCheckLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Validating…</> : <>Next <ChevronRight className="h-4 w-4" /></>}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saveLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saveLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                                : <><Send className="h-4 w-4" /> Confirm Payment</>}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SPPOPayment;
