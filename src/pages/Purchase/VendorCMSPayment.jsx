import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    CreditCard, Loader2, RotateCcw, Send, ChevronDown, ChevronRight,
    IndianRupee, CheckCircle, Navigation, FileText, Landmark,
    Users2, ShoppingBag, Receipt, Eye, Layers,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';
import { convertAmountToWords, formatIndianCurrency } from '../../utilities/amountToTextHelper';
import { addCMSTempInvoice, removeCMSTempInvoice } from '../../api/PurchaseAPI/vendorCMSPaymentAPI';

import {
    fetchCMSVendors, fetchVendorCMSPaymentData, fetchVendorCMSInnerData,
    submitVendorCMSPayment,
    clearCMSVendors, clearVendorData, clearInnerData, clearSaveResult, resetVendorCMSPayment,
    selectCMSVendors, selectCMSVendorsLoading,
    selectVendorData, selectVendorDataLoading, selectVendorDataError,
    selectInnerDataByVendor, selectInnerLoadingByVendor,
    selectCMSSaveStatus, selectCMSSaveLoading, selectCMSSaveError,
} from '../../slices/purchaseSlice/vendorCMSPaymentSlice';

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

const VENDOR_TYPES = ['Supplier', 'Service Provider'];
const MODE_OPTIONS = ['Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI'];
const STEPS        = ['Party', 'Invoices', 'Payment', 'Review'];

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

// ── Vendor Multi-Select Dropdown ───────────────────────────────────────────────

const VendorMultiSelect = ({ options, selected, onChange, loading, disabled }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const toggle = (code) =>
        onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code]);
    const selectAll = () => onChange(options.map(v => v.VendorCode));
    const clearAll  = () => onChange([]);

    const label = loading
        ? 'Loading vendors…'
        : selected.length === 0
            ? (options.length === 0 ? 'No vendors available' : '— Select Vendors —')
            : `${selected.length} vendor${selected.length > 1 ? 's' : ''} selected`;

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => !disabled && !loading && setOpen(o => !o)}
                disabled={disabled || loading}
                className={`${inputCls} text-left flex items-center justify-between`}
            >
                <span className={selected.length === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}>
                    {label}
                </span>
                {loading
                    ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" />
                    : <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </button>

            {open && options.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    <div className="flex gap-3 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 rounded-t-xl sticky top-0">
                        <button type="button" onClick={selectAll} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Select All</button>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <button type="button" onClick={clearAll} className="text-xs text-rose-500 font-semibold hover:underline">Clear</button>
                        <span className="ml-auto text-xs text-gray-400">{selected.length}/{options.length}</span>
                    </div>
                    {options.map(v => (
                        <label key={v.VendorCode} className="flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                            <input
                                type="checkbox"
                                checked={selected.includes(v.VendorCode)}
                                onChange={() => toggle(v.VendorCode)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{v.VendorName}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const VendorCMSPayment = ({ menuData }) => {
    const dispatch     = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Redux ──────────────────────────────────────────────────────────────────
    const cmsVendors         = useSelector(selectCMSVendors);
    const cmsVendorsLoading  = useSelector(selectCMSVendorsLoading);
    const vendorData         = useSelector(selectVendorData);
    const vendorDataLoading  = useSelector(selectVendorDataLoading);
    const vendorDataError    = useSelector(selectVendorDataError);
    const innerDataByVendor  = useSelector(selectInnerDataByVendor);
    const innerLoadingByVendor = useSelector(selectInnerLoadingByVendor);
    const bankList           = useSelector(selectBankDetailsArray);
    const bankLoading        = useSelector(selectBankDetailsLoading);
    const chequeList         = useSelector(selectChequeNumbersArray);
    const chequeLoading      = useSelector(selectChequeNumbersLoading);
    const saveStatus         = useSelector(selectCMSSaveStatus);
    const saveLoading        = useSelector(selectCMSSaveLoading);
    const saveError          = useSelector(selectCMSSaveError);

    // ── Step 1: Party Selection ────────────────────────────────────────────────
    const [step,               setStep]               = useState(1);
    const [vendorType,         setVendorType]         = useState('Supplier');
    const [selectedVendorCodes, setSelectedVendorCodes] = useState([]);

    // ── Step 2: Invoice Selection ──────────────────────────────────────────────
    const [expandedVendors,  setExpandedVendors]  = useState(new Set());
    // selectedInvoices: array of { vendorCode, Id, Invoiceno, InvoiceDate, PoNo, CCCode, BasicBalance }
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    // payingAmts keyed by invoice Id
    const [payingAmts, setPayingAmts] = useState({});

    // ── Step 3: Payment Details ────────────────────────────────────────────────
    const [payDate,      setPayDate]     = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);
    const [modeOfPay,    setModeOfPay]   = useState('');
    const [chequeId,     setChequeId]    = useState('');
    const [refNo,        setRefNo]       = useState('');
    const [remarks,      setRemarks]     = useState('');

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetVendorCMSPayment());
            dispatch(resetChequeNumbersData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Vendor type change → reload vendor dropdown options, clear downstream
    useEffect(() => {
        setSelectedVendorCodes([]);
        dispatch(clearCMSVendors());
        dispatch(clearVendorData());
        dispatch(clearInnerData());
        setExpandedVendors(new Set());
        setSelectedInvoices([]);
        setPayingAmts({});
        if (!vendorType) return;
        dispatch(fetchCMSVendors({ CMSVendorType: vendorType, RoleId: roleId, Userid: userId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vendorType]);

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

    // Handle save result
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Vendor CMS payment saved successfully!');
            handleReset();
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Payment save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Derived ────────────────────────────────────────────────────────────────

    const totalPayingAmt = selectedInvoices.reduce(
        (sum, inv) => sum + (parseFloat(payingAmts[inv.Id] || 0)), 0
    );

    const amountInWords = totalPayingAmt > 0
        ? convertAmountToWords(totalPayingAmt)
        : '';

    // Selected invoices grouped by vendor for display
    const invoicesByVendor = selectedInvoices.reduce((acc, inv) => {
        if (!acc[inv.vendorCode]) acc[inv.vendorCode] = [];
        acc[inv.vendorCode].push(inv);
        return acc;
    }, {});

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleLoadVendors = () => {
        if (selectedVendorCodes.length === 0) {
            toast.warn('Please select at least one vendor.'); return;
        }
        dispatch(clearVendorData());
        dispatch(clearInnerData());
        setExpandedVendors(new Set());
        setSelectedInvoices([]);
        setPayingAmts({});
        dispatch(fetchVendorCMSPaymentData({
            Ventype:    vendorType,
            AllVendors: selectedVendorCodes.join(','),
            Userid:     userId,
        }));
    };

    const toggleExpand = (vendorCode) => {
        setExpandedVendors(prev => {
            const next = new Set(prev);
            if (next.has(vendorCode)) {
                next.delete(vendorCode);
            } else {
                next.add(vendorCode);
                // Load inner data only if not yet loaded
                if (!innerDataByVendor[vendorCode]) {
                    dispatch(fetchVendorCMSInnerData({ Vendorcode: vendorCode, Userid: userId }));
                }
            }
            return next;
        });
    };

    const isInvoiceSelected = (vendorCode, id) =>
        selectedInvoices.some(inv => inv.vendorCode === vendorCode && inv.Id === id);

    const toggleInvoice = (vendorCode, row) => {
        const id = row.Id;
        if (isInvoiceSelected(vendorCode, id)) {
            setSelectedInvoices(prev => prev.filter(inv => !(inv.vendorCode === vendorCode && inv.Id === id)));
            setPayingAmts(prev => { const next = { ...prev }; delete next[id]; return next; });
            removeCMSTempInvoice({ invoiceId: id }).catch(() => {});
        } else {
            setSelectedInvoices(prev => [...prev, {
                vendorCode,
                Id:          row.Id,
                Invoiceno:   row.Invoiceno,
                InvoiceDate: row.InvoiceDate,
                PoNo:        row.PoNo,
                CCCode:      row.CCCode,
                BasicBalance: row.BasicBalance,
            }]);
            setPayingAmts(prev => ({ ...prev, [id]: String(row.BasicBalance || 0) }));
            addCMSTempInvoice({ invoiceId: id, userId, payingAmount: row.BasicBalance }).catch(() => {});
        }
    };

    const toggleAllInvoicesForVendor = (vendorCode) => {
        const invoices = innerDataByVendor[vendorCode] || [];
        const allSelected = invoices.every(r => isInvoiceSelected(vendorCode, r.Id));
        if (allSelected) {
            const ids = new Set(invoices.map(r => r.Id));
            setSelectedInvoices(prev => prev.filter(inv => !(inv.vendorCode === vendorCode && ids.has(inv.Id))));
            setPayingAmts(prev => {
                const next = { ...prev };
                invoices.forEach(r => delete next[r.Id]);
                return next;
            });
            invoices.forEach(r => removeCMSTempInvoice({ invoiceId: r.Id }).catch(() => {}));
        } else {
            const newInvoices = invoices
                .filter(r => !isInvoiceSelected(vendorCode, r.Id))
                .map(r => ({
                    vendorCode, Id: r.Id, Invoiceno: r.Invoiceno, InvoiceDate: r.InvoiceDate,
                    PoNo: r.PoNo, CCCode: r.CCCode, BasicBalance: r.BasicBalance,
                }));
            setSelectedInvoices(prev => [...prev, ...newInvoices]);
            setPayingAmts(prev => {
                const next = { ...prev };
                invoices.forEach(r => { if (!next[r.Id]) next[r.Id] = String(r.BasicBalance || 0); });
                return next;
            });
            newInvoices.forEach(inv => addCMSTempInvoice({ invoiceId: inv.Id, userId, payingAmount: inv.BasicBalance }).catch(() => {}));
        }
    };

    const setPayingAmt = (id, val) => setPayingAmts(prev => ({ ...prev, [id]: val }));

    // ── Validation ─────────────────────────────────────────────────────────────

    const validateStep1 = useCallback(() => {
        if (!vendorType)                   { toast.warn('Please select a vendor type.'); return false; }
        if (selectedVendorCodes.length === 0) { toast.warn('Please select at least one vendor.'); return false; }
        if (vendorData.length === 0)       { toast.warn('Please load vendor data first.'); return false; }
        return true;
    }, [vendorType, selectedVendorCodes, vendorData]);

    const validateStep2 = useCallback(() => {
        if (selectedInvoices.length === 0) { toast.warn('Please select at least one invoice.'); return false; }
        if (totalPayingAmt <= 0)           { toast.warn('Total payment amount must be greater than 0.'); return false; }
        const overLimit = selectedInvoices.find(inv => parseFloat(payingAmts[inv.Id] || 0) > inv.BasicBalance);
        if (overLimit) { toast.warn('Paying amount cannot exceed the invoice balance.'); return false; }
        return true;
    }, [selectedInvoices, totalPayingAmt, payingAmts]);

    const validateStep3 = useCallback(() => {
        if (!payDate)                               { toast.warn('Please select a payment date.'); return false; }
        if (!selectedBank)                          { toast.warn('Please select a bank account.'); return false; }
        if (!modeOfPay)                             { toast.warn('Please select mode of payment.'); return false; }
        if (modeOfPay === 'Cheque' && !chequeId)    { toast.warn('Please select a cheque number.'); return false; }
        if (modeOfPay !== 'Cheque' && !refNo.trim()) { toast.warn('Please enter the reference number.'); return false; }
        if (!remarks.trim())                        { toast.warn('Please enter remarks.'); return false; }
        return true;
    }, [payDate, selectedBank, modeOfPay, chequeId, refNo, remarks]);

    const goNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        if (step === 3 && !validateStep3()) return;
        setStep(s => s + 1);
    };

    const goBack = () => setStep(s => s - 1);

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = () => {
        const payload = {
            BankId:            String(selectedBank?.BankId || ''),
            ModeofPay:         modeOfPay,
            Number:            modeOfPay === 'Cheque' ? chequeId : refNo,
            TransactionDate:   fmtDate(payDate),
            TransactionAmount: String(totalPayingAmt),
            Remarks:           remarks,
            CreatedUID:        String(userId),
            Createdby:         userName,
            Roleid:            parseInt(roleId, 10),
        };

        dispatch(submitVendorCMSPayment(payload));
    };

    // ── Reset ──────────────────────────────────────────────────────────────────

    const handleReset = () => {
        // Clear any invoices still in the temp staging table
        setSelectedInvoices(prev => {
            prev.forEach(inv => removeCMSTempInvoice({ invoiceId: inv.Id }).catch(() => {}));
            return [];
        });
        setStep(1);
        setVendorType('Supplier');
        setSelectedVendorCodes([]);
        setExpandedVendors(new Set());
        setPayingAmts({});
        setPayDate(null); setSelectedBank(null); setModeOfPay('');
        setChequeId(''); setRefNo(''); setRemarks('');
        dispatch(resetVendorCMSPayment());
        dispatch(resetChequeNumbersData());
        dispatch(fetchBankDetailsWithAvailableBalance());
        dispatch(fetchCMSVendors({ CMSVendorType: 'Supplier', RoleId: roleId, Userid: userId }));
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
                                    {menuData?.name || 'Vendor CMS Payment'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">CMS Vendor Invoice Payment via Bank</p>
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
                                    <p className="text-sm font-bold text-white">Purchase / CMS</p>
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

                {/* ── STEP 1: Party Selection ───────────────────────────────── */}
                {step === 1 && (
                    <SectionCard>
                        <SectionHeader icon={Users2} title="Party Selection" subtitle="Select vendor type and vendors to pay" />
                        <div className="p-6">
                            <InnerHeader icon={ShoppingBag} title="Vendor Details" subtitle="Select vendor type and pick vendors for payment" />

                            {/* Vendor Type */}
                            <div className="mb-5">
                                <Label required>Vendor Type</Label>
                                <div className="flex gap-3">
                                    {VENDOR_TYPES.map(vt => (
                                        <button
                                            key={vt}
                                            type="button"
                                            onClick={() => setVendorType(vt)}
                                            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                                                ${vendorType === vt
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800'}`}
                                        >
                                            {vt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Vendor Multi-Select */}
                            <div className="mb-5">
                                <Label required>Select Vendors</Label>
                                <VendorMultiSelect
                                    options={cmsVendors}
                                    selected={selectedVendorCodes}
                                    onChange={setSelectedVendorCodes}
                                    loading={cmsVendorsLoading}
                                    disabled={cmsVendors.length === 0 && !cmsVendorsLoading}
                                />
                                {selectedVendorCodes.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {selectedVendorCodes.map(code => {
                                            const v = cmsVendors.find(x => x.VendorCode === code);
                                            return (
                                                <span key={code} className="inline-flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                                                    {v?.VendorName?.split(',')[0] || code}
                                                    <button type="button" onClick={() => setSelectedVendorCodes(prev => prev.filter(c => c !== code))} className="hover:text-rose-500 ml-0.5">×</button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Load Button */}
                            <button
                                type="button"
                                onClick={handleLoadVendors}
                                disabled={selectedVendorCodes.length === 0 || vendorDataLoading}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {vendorDataLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>
                                    : <><Eye className="h-4 w-4" /> Load Vendor Data</>}
                            </button>

                            {/* Vendor Summary Table */}
                            {vendorData.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                        {vendorData.length} Vendor{vendorData.length > 1 ? 's' : ''} Loaded
                                    </p>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendor Code</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendor Name</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vendorData.map((v, i) => (
                                                    <tr key={v.VendorCode || i} className="border-t border-gray-100 dark:border-gray-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                                        <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                                                        <td className="px-4 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{v.VendorCode}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{v.VendorName}</td>
                                                        <td className="px-4 py-3 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                                            {fmt(v.BasicBalance)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {vendorDataError && (
                                <p className="mt-4 text-sm text-rose-500 font-medium">{vendorDataError}</p>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* ── STEP 2: Invoice Selection ─────────────────────────────── */}
                {step === 2 && (
                    <SectionCard>
                        <SectionHeader icon={FileText} title="Invoice Selection" subtitle="Expand each vendor to select invoices for payment" />
                        <div className="p-6">
                            <InnerHeader icon={Receipt} title="Vendor Invoices" subtitle="Select invoices to include in this payment" />

                            {vendorData.map((vendor) => {
                                const vCode    = vendor.VendorCode;
                                const expanded = expandedVendors.has(vCode);
                                const invoices = innerDataByVendor[vCode] || [];
                                const loading  = !!innerLoadingByVendor[vCode];
                                const vendorSelectedCount = (invoicesByVendor[vCode] || []).length;
                                const allSelected = invoices.length > 0 && invoices.every(r => isInvoiceSelected(vCode, r.Id));

                                return (
                                    <div key={vCode} className="mb-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                                        {/* Vendor Row Header */}
                                        <div
                                            className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors
                                                ${expanded
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-b-2 border-indigo-200 dark:border-indigo-700'
                                                    : 'bg-gray-50 dark:bg-gray-900/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'}`}
                                            onClick={() => toggleExpand(vCode)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                    ${expanded ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                                    {expanded
                                                        ? <ChevronDown className="h-4 w-4" />
                                                        : <ChevronRight className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{vendor.VendorName}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">{vCode}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {vendorSelectedCount > 0 && (
                                                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                                                        {vendorSelectedCount} selected
                                                    </span>
                                                )}
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">Balance</p>
                                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmt(vendor.BasicBalance)}</p>
                                                </div>
                                                {loading && <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />}
                                            </div>
                                        </div>

                                        {/* Inner Invoice Table */}
                                        {expanded && (
                                            <div className="overflow-x-auto">
                                                {loading ? (
                                                    <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
                                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading invoices…
                                                    </div>
                                                ) : invoices.length === 0 ? (
                                                    <div className="py-8 text-center text-sm text-gray-400">No invoices found for this vendor.</div>
                                                ) : (
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-indigo-50/60 dark:bg-indigo-900/10">
                                                                <th className="px-4 py-2.5 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={allSelected}
                                                                        onChange={() => toggleAllInvoicesForVendor(vCode)}
                                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                </th>
                                                                <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Invoice No</th>
                                                                <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Invoice Date</th>
                                                                <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">PO No</th>
                                                                <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">CC Code</th>
                                                                <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Balance</th>
                                                                <th className="px-3 py-2.5 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Pay Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {invoices.map((row, i) => {
                                                                const sel = isInvoiceSelected(vCode, row.Id);
                                                                const paying = parseFloat(payingAmts[row.Id] || 0);
                                                                const exceedsBalance = sel && paying > row.BasicBalance;
                                                                return (
                                                                    <tr key={row.Id || i}
                                                                        className={`border-t border-gray-100 dark:border-gray-700 transition-colors
                                                                            ${sel ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                                                                        <td className="px-4 py-2.5 text-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={sel}
                                                                                onChange={() => toggleInvoice(vCode, row)}
                                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{row.Invoiceno || '—'}</td>
                                                                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.InvoiceDate || '—'}</td>
                                                                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.PoNo || '—'}</td>
                                                                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.CCCode || '—'}</td>
                                                                        <td className="px-3 py-2.5 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                                            {fmt(row.BasicBalance)}
                                                                        </td>
                                                                        <td className="px-3 py-2 min-w-[130px]">
                                                                            <input
                                                                                type="number"
                                                                                value={payingAmts[row.Id] ?? ''}
                                                                                onChange={e => setPayingAmt(row.Id, e.target.value)}
                                                                                disabled={!sel}
                                                                                min="0"
                                                                                step="0.01"
                                                                                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs text-right font-semibold focus:outline-none focus:ring-1 transition-all
                                                                                    ${!sel
                                                                                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed'
                                                                                        : exceedsBalance
                                                                                            ? 'border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 focus:ring-rose-400'
                                                                                            : 'border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 focus:ring-indigo-400'}`}
                                                                            />
                                                                            {exceedsBalance && (
                                                                                <p className="text-rose-500 text-[10px] mt-0.5 text-right leading-tight">
                                                                                    Max {fmt(row.BasicBalance)}
                                                                                </p>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className="bg-gray-50 dark:bg-gray-900/40 border-t-2 border-gray-200 dark:border-gray-700">
                                                                <td colSpan={5} className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                                    Vendor Subtotal
                                                                </td>
                                                                <td className="px-3 py-2.5 text-xs text-right font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                                    {fmt(invoices.reduce((s, r) => s + (r.BasicBalance || 0), 0))}
                                                                </td>
                                                                <td className="px-3 py-2.5 text-xs text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                                    {fmt((invoicesByVendor[vCode] || []).reduce((s, inv) => s + parseFloat(payingAmts[inv.Id] || 0), 0))}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Payment Basket Summary */}
                            {selectedInvoices.length > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-indigo-500" />
                                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                                {selectedInvoices.length} Invoice{selectedInvoices.length > 1 ? 's' : ''} Selected
                                            </span>
                                            <span className="text-xs text-indigo-400">
                                                across {Object.keys(invoicesByVendor).length} vendor{Object.keys(invoicesByVendor).length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Payment</p>
                                            <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(totalPayingAmt)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* ── STEP 3: Payment Details ───────────────────────────────── */}
                {step === 3 && (
                    <>
                        {/* Payment Summary Table */}
                        <SectionCard>
                            <SectionHeader icon={Receipt} title="Payment Summary" subtitle="Invoices included in this payment" />
                            <div className="p-6">
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendor</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice No</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO No</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pay Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedInvoices.map((inv, i) => {
                                                const vendorRow = vendorData.find(v => v.VendorCode === inv.vendorCode);
                                                return (
                                                    <tr key={inv.Id} className={`border-t border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-900/20'}`}>
                                                        <td className="px-4 py-2.5">
                                                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{inv.vendorCode}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{vendorRow?.VendorName || ''}</p>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{inv.Invoiceno || '—'}</td>
                                                        <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{inv.InvoiceDate || '—'}</td>
                                                        <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{inv.PoNo || '—'}</td>
                                                        <td className="px-4 py-2.5 text-xs text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                            {fmt(payingAmts[inv.Id])}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-indigo-50 dark:bg-indigo-900/20 border-t-2 border-indigo-200 dark:border-indigo-700">
                                                <td colSpan={4} className="px-4 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                                                    Total Payment
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-black text-indigo-700 dark:text-indigo-300">
                                                    {fmt(totalPayingAmt)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Amount in Words */}
                                {amountInWords && (
                                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Amount in Words</p>
                                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 italic">{amountInWords}</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Payment Details */}
                        <SectionCard>
                            <SectionHeader icon={Landmark} title="Payment Details" subtitle="Bank account and transaction details" />
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

                                    {/* Cheque or Reference Number */}
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
                                            value={payDate}
                                            onChange={setPayDate}
                                            placeholder="Select transaction date"
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

                                {/* Amount in Words (repeated in payment section) */}
                                {amountInWords && (
                                    <div className="mt-5 p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-700">
                                        <div className="flex items-center gap-2 mb-1">
                                            <IndianRupee className="h-3.5 w-3.5 text-violet-500" />
                                            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Amount in Words</p>
                                        </div>
                                        <p className="text-sm font-semibold text-violet-800 dark:text-violet-200 italic">{amountInWords}</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ── STEP 4: Review & Submit ───────────────────────────────── */}
                {step === 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Transaction Summary */}
                        <SectionCard>
                            <SectionHeader icon={Eye} title="Transaction Summary" subtitle="Review before submitting" />
                            <div className="p-6">
                                <ReviewRow label="Vendor Type"     value={vendorType} />
                                <ReviewRow label="Vendors Selected" value={`${selectedVendorCodes.length} vendor${selectedVendorCodes.length > 1 ? 's' : ''}`} />
                                <ReviewRow label="Invoices Selected" value={`${selectedInvoices.length} invoice${selectedInvoices.length > 1 ? 's' : ''}`} />
                                <ReviewRow label="Total Amount"    value={fmt(totalPayingAmt)} highlight />
                                <ReviewRow label="Bank Account"    value={selectedBank?.BankName || '—'} />
                                <ReviewRow label="Mode of Payment" value={modeOfPay} />
                                <ReviewRow label="Cheque / Ref No" value={modeOfPay === 'Cheque' ? chequeId : refNo} />
                                <ReviewRow label="Transaction Date" value={fmtDate(payDate)} />
                                <ReviewRow label="Remarks"         value={remarks} />
                            </div>
                        </SectionCard>

                        {/* Invoice Breakdown */}
                        <SectionCard>
                            <SectionHeader icon={Layers} title="Invoice Breakdown" subtitle="Per-vendor payment summary" />
                            <div className="p-6">
                                {Object.entries(invoicesByVendor).map(([vCode, invs]) => {
                                    const vendorRow = vendorData.find(v => v.VendorCode === vCode);
                                    const subtotal  = invs.reduce((s, inv) => s + parseFloat(payingAmts[inv.Id] || 0), 0);
                                    return (
                                        <div key={vCode} className="mb-4 last:mb-0">
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                                <div>
                                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{vCode}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{vendorRow?.VendorName || ''}</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{fmt(subtotal)}</p>
                                            </div>
                                            {invs.map(inv => (
                                                <div key={inv.Id} className="flex items-center justify-between py-1.5 pl-4 border-b border-dashed border-gray-100 dark:border-gray-700/50 last:border-0">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{inv.Invoiceno || inv.Id}</p>
                                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{fmt(payingAmts[inv.Id])}</p>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}

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

                    {step < 4 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={step === 1 && vendorDataLoading}
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

export default VendorCMSPayment;
