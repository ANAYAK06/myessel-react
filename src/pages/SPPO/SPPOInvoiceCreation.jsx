import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';
import { getSubDCAByDCA } from '../../api/SpPOAPI/sppoInvoiceAPI';
import { S3_BASE_URL, UPLOAD_DOCS_PATH, S3_FOLDERS } from '../../config/s3Config';

import {
    fetchServiceVendors,
    fetchPOsForVendor, fetchPODetails,
    fetchVendorGSTNos, fetchCompanyGSTNos,
    fetchGSTConfig, fetchOtherChargeDCAs, fetchDeductionDCAs,
    checkBudget, submitSPPOInvoice,
    clearPODetails, clearGSTConfig, clearSaveResult, clearPOList,
    resetSppoInvoice,
    selectSPPOInvServiceVendors, selectSPPOInvServiceVendorsLoading,
    selectSPPOInvPOList, selectSPPOInvPODetails,
    selectSPPOInvVendorGSTNos, selectSPPOInvCompanyGSTNos,
    selectSPPOInvGSTConfig, selectSPPOInvOtherDCAs, selectSPPOInvDeductionDCAs,
    selectSPPOInvBudgetResult, selectSPPOInvSaveResult,
    selectSPPOInvPOListLoading, selectSPPOInvPODetailsLoading,
    selectSPPOInvVendorGSTLoading, selectSPPOInvCompanyGSTLoading,
    selectSPPOInvGSTConfigLoading, selectSPPOInvOtherDCAsLoading,
    selectSPPOInvDeductionDCAsLoading, selectSPPOInvBudgetLoading,
    selectSPPOInvSaveLoading, selectSPPOInvSaveError,
} from '../../slices/spPOSlice/sppoInvoiceSlice';

import {
    Receipt, Building2, Search, Plus, Trash2, RotateCcw, Send,
    Loader2, ChevronDown, IndianRupee, ShieldCheck,
    FileText, AlertCircle, CheckCircle2, Layers, Calculator, MapPin,
    Navigation, X, Paperclip, Upload, CloudUpload,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatDateForAPI = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(val)) return val;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        const [yyyy, mm, dd] = val.split('T')[0].split('-');
        return `${dd}-${MONTH_ABBR[parseInt(mm, 10) - 1]}-${yyyy}`;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const fmt = (v) => {
    const n = parseFloat(v);
    if ((!v && v !== 0) || isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── UI Primitives (matches ClientInvoiceCreation exactly) ─────────────────────
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

const CardHeader = ({ icon: Icon, title, subtitle, action }) => (
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

const Card = ({ children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        {children}
    </div>
);

const InfoBadge = ({ label, value }) => (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/30">
        <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200 truncate">{value || '—'}</p>
    </div>
);

const YesNoToggle = ({ value, onChange }) => (
    <div className="flex gap-3 mt-1">
        {['Yes', 'No'].map(opt => (
            <button key={opt} type="button" onClick={() => onChange(opt)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    value === opt
                        ? opt === 'Yes'
                            ? 'bg-green-500 border-green-500 text-white shadow-sm'
                            : 'bg-rose-500 border-rose-500 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
            >{opt}</button>
        ))}
    </div>
);

// ── Vendor Combobox ───────────────────────────────────────────────────────────
const VendorCombobox = ({ vendors, loading, value, onChange }) => {
    const [query, setQuery] = useState('');
    const [open,  setOpen]  = useState(false);
    const containerRef      = useRef(null);
    const inputRef          = useRef(null);

    const selected = vendors.find(v => v.Contractorcode === value) || null;

    const filtered = query.trim()
        ? vendors.filter(v =>
              v.ContractorName.toLowerCase().includes(query.toLowerCase()) ||
              v.Contractorcode.toLowerCase().includes(query.toLowerCase())
          )
        : vendors;

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (vendor) => {
        onChange(vendor.Contractorcode, vendor.ContractorName);
        setQuery('');
        setOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('', '');
        setQuery('');
        setOpen(false);
    };

    const handleInputClick = () => {
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Input box */}
            <div
                onClick={handleInputClick}
                className={`${inputCls} flex items-center gap-2 cursor-pointer min-h-[42px]`}
            >
                {loading
                    ? <Loader2 className="h-4 w-4 text-indigo-400 animate-spin flex-shrink-0" />
                    : <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />}

                {open ? (
                    <input
                        ref={inputRef}
                        autoFocus
                        className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400"
                        placeholder="Type name or code..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <span className={`flex-1 text-sm truncate ${selected ? 'text-gray-800 dark:text-gray-100 font-medium' : 'text-gray-400'}`}>
                        {selected ? selected.ContractorName : loading ? 'Loading vendors...' : 'Select service vendor...'}
                    </span>
                )}

                {selected && (
                    <button type="button" onClick={handleClear}
                        className="p-0.5 rounded-full text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0">
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
                {!selected && <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            </div>

            {/* Selected chip (below input when closed) */}
            {selected && !open && (
                <div className="mt-1.5 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{selected.Contractorcode}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {selected.ContractorName.replace(/\([^)]*\)$/, '').trim()}
                    </span>
                </div>
            )}

            {/* Dropdown */}
            {open && (
                <div className="absolute z-[200] left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-4 text-sm text-gray-400 text-center">No vendors found</div>
                    ) : (
                        filtered.slice(0, 100).map(v => (
                            <div
                                key={v.Contractorcode}
                                onClick={() => handleSelect(v)}
                                className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors
                                    ${value === v.Contractorcode
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                            >
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                                    {v.ContractorName.replace(/\([^)]*\)$/, '').trim()}
                                </p>
                                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5 font-mono">{v.Contractorcode}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// ── Initial State ─────────────────────────────────────────────────────────────
const INITIAL_FORM = {
    VendorCode: '', VendorDisplayName: '',
    SPPONo: '', CCCode: '', DCACode: '', SubDCACode: '',
    VendorName: '', Balance: 0, Advance: 0,
    CCType: '', CCSubType: '', POStartDate: '',
    SPPOInvoiceNo: '', SPPOInvoiceDate: '', SPPOInvoiceMakingDate: '',
    SPPOBasicValue: '', Description: '',
    IsGstApplicable: 'No',
    VendorGST: '', VendorGSTTaxId: '', CompanyGST: '',
    Statecheck: false,
    Cgstsdca: '', Cgstsdcaamt: '',
    Sgstsdca: '', Sgstsdcaamt: '',
    Igstsdca: '', Igstsdcaamt: '',
    Retention: '', Hold: '',
    Filechk: 'No', Extension: '',
};

let _rowId = 0;
const newRow = () => ({ id: ++_rowId, dcaCode: '', sdcaCode: '', amount: '' });

// ── Component ─────────────────────────────────────────────────────────────────
const SPPOInvoiceCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId    = userData?.roleId    || userData?.RID || 0;
    const createdBy = userData?.userName  || userData?.username || 'User';

    // Redux selectors
    const serviceVendors         = useSelector(selectSPPOInvServiceVendors);
    const loadingServiceVendors  = useSelector(selectSPPOInvServiceVendorsLoading);
    const poList          = useSelector(selectSPPOInvPOList);
    const poDetails       = useSelector(selectSPPOInvPODetails);
    const vendorGSTNos    = useSelector(selectSPPOInvVendorGSTNos);
    const companyGSTNos   = useSelector(selectSPPOInvCompanyGSTNos);
    const gstConfig       = useSelector(selectSPPOInvGSTConfig);
    const otherDCAs       = useSelector(selectSPPOInvOtherDCAs);
    const deductionDCAs   = useSelector(selectSPPOInvDeductionDCAs);
    const budgetResult    = useSelector(selectSPPOInvBudgetResult);
    const saveResult      = useSelector(selectSPPOInvSaveResult);
    const saveError       = useSelector(selectSPPOInvSaveError);

    const loadingPOList      = useSelector(selectSPPOInvPOListLoading);
    const loadingPODetails   = useSelector(selectSPPOInvPODetailsLoading);
    const loadingVendorGST   = useSelector(selectSPPOInvVendorGSTLoading);
    const loadingCompanyGST  = useSelector(selectSPPOInvCompanyGSTLoading);
    const loadingGSTConfig   = useSelector(selectSPPOInvGSTConfigLoading);
    const loadingOtherDCAs   = useSelector(selectSPPOInvOtherDCAsLoading);
    const loadingDeductDCAs  = useSelector(selectSPPOInvDeductionDCAsLoading);
    const loadingBudget      = useSelector(selectSPPOInvBudgetLoading);
    const loadingSave        = useSelector(selectSPPOInvSaveLoading);

    // Local state
    const [form, setForm]             = useState(INITIAL_FORM);
    const [otherCharges, setOtherCharges] = useState([newRow()]);
    const [deductions,   setDeductions]   = useState([newRow()]);
    // SubDCA cache: { [dcaCode]: SubDCA[] }
    const [subDCACache,      setSubDCACache]      = useState({});
    const [loadingSubDCAs,   setLoadingSubDCAs]   = useState({});
    // Track if budget has been checked
    const [budgetChecked, setBudgetChecked] = useState(false);
    // File upload state
    const [attachedFile,    setAttachedFile]    = useState(null);   // File object
    const [uploadProgress,  setUploadProgress]  = useState(0);      // 0-100
    const [uploadStatus,    setUploadStatus]     = useState('idle'); // 'idle'|'uploading'|'done'|'error'
    const [uploadError,     setUploadError]      = useState('');
    const fileInputRef = useRef(null);

    const isBusy = loadingSave || loadingBudget || uploadStatus === 'uploading';

    // ── SubDCA fetch (local, not redux) ───────────────────────────────────────
    const fetchSubDCAs = async (dcaCode) => {
        if (!dcaCode || subDCACache[dcaCode] !== undefined) return;
        setLoadingSubDCAs(p => ({ ...p, [dcaCode]: true }));
        try {
            const res = await getSubDCAByDCA(dcaCode);
            setSubDCACache(p => ({ ...p, [dcaCode]: res.data?.Data || [] }));
        } catch {
            setSubDCACache(p => ({ ...p, [dcaCode]: [] }));
        } finally {
            setLoadingSubDCAs(p => ({ ...p, [dcaCode]: false }));
        }
    };

    // ── Bootstrap ─────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchServiceVendors());
        dispatch(fetchCompanyGSTNos());
        return () => dispatch(resetSppoInvoice());
    }, [dispatch]);

    // ── PO details → form ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!poDetails) return;
        setForm(f => ({
            ...f,
            CCCode: poDetails.CCCode || '', DCACode: poDetails.DCACode || '',
            SubDCACode: poDetails.SubDCACode || '', VendorName: poDetails.VendorName || '',
            Balance: poDetails.Balance || 0, Advance: poDetails.Advance || 0,
            CCType: poDetails.CCType || '', CCSubType: poDetails.CCSubType || '',
            POStartDate: poDetails.POStartDate || '',
        }));
    }, [poDetails]);

    // ── CCCode + InvDate → DCA lists ──────────────────────────────────────────
    useEffect(() => {
        const invDate = formatDateForAPI(form.SPPOInvoiceDate);
        if (!form.CCCode || !invDate) return;
        dispatch(fetchOtherChargeDCAs({ ccCode: form.CCCode, invDate }));
        dispatch(fetchDeductionDCAs({ ccCode: form.CCCode, invDate }));
    }, [form.CCCode, form.SPPOInvoiceDate, dispatch]);

    // ── GST config auto-fetch ─────────────────────────────────────────────────
    useEffect(() => {
        const { IsGstApplicable, CompanyGST, VendorGST, CCCode, SPPONo, SPPOInvoiceDate } = form;
        if (IsGstApplicable !== 'Yes') return;
        if (!CompanyGST || !VendorGST || !CCCode || !SPPONo || !SPPOInvoiceDate) return;
        const invDate = formatDateForAPI(SPPOInvoiceDate);
        dispatch(fetchGSTConfig({
            CompanyGST, VendorClientGSTNo: VendorGST,
            InvoiceType: 'Vendor', Cccode: CCCode, Taxtype: 'Creditable',
            PONO: SPPONo, InvDate: invDate,
            Configtyp: 'Input GST', VendorOrClient: 'Service Provider',
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.IsGstApplicable, form.CompanyGST, form.VendorGST, form.CCCode, form.SPPONo, form.SPPOInvoiceDate, dispatch]);

    // ── GST config → populate DCA fields ─────────────────────────────────────
    useEffect(() => {
        if (!gstConfig) return;
        setForm(f => ({
            ...f,
            Statecheck: gstConfig.SameState,
            Cgstsdca: gstConfig.CGSTSubDCA || '',
            Sgstsdca: gstConfig.SGSTSubDCA || '',
            Igstsdca: gstConfig.IGSTSubDCA || '',
            Cgstsdcaamt: '', Sgstsdcaamt: '', Igstsdcaamt: '',
        }));
    }, [gstConfig]);

    // ── Save/upload errors (fallback, should be handled inline) ──────────────
    useEffect(() => {
        if (saveError) toast.error(String(saveError));
    }, [saveError]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleVendorSelect = (code, name) => {
        dispatch(clearPOList()); dispatch(clearPODetails()); dispatch(clearGSTConfig());
        setBudgetChecked(false);
        setForm(f => ({
            ...f, VendorCode: code, VendorDisplayName: name || '',
            SPPONo: '', CCCode: '', DCACode: '', SubDCACode: '',
            VendorName: '', Balance: 0, Advance: 0,
            IsGstApplicable: 'No', VendorGST: '', CompanyGST: '',
            Cgstsdca: '', Sgstsdca: '', Igstsdca: '',
            Cgstsdcaamt: '', Sgstsdcaamt: '', Igstsdcaamt: '', Statecheck: false,
        }));
        if (code) { dispatch(fetchPOsForVendor(code)); dispatch(fetchVendorGSTNos(code)); }
    };

    const handlePOChange = (poNo) => {
        dispatch(clearPODetails()); dispatch(clearGSTConfig());
        setBudgetChecked(false);
        setForm(f => ({
            ...f, SPPONo: poNo, CCCode: '', DCACode: '', SubDCACode: '',
            VendorName: '', Balance: 0, Advance: 0,
            Cgstsdca: '', Sgstsdca: '', Igstsdca: '',
            Cgstsdcaamt: '', Sgstsdcaamt: '', Igstsdcaamt: '', Statecheck: false,
        }));
        if (poNo) dispatch(fetchPODetails(poNo));
    };

    const handleGSTApplicable = (val) => {
        setForm(f => ({
            ...f, IsGstApplicable: val,
            VendorGST: '', VendorGSTTaxId: '', CompanyGST: '',
            Statecheck: false,
            Cgstsdca: '', Cgstsdcaamt: '', Sgstsdca: '', Sgstsdcaamt: '',
            Igstsdca: '', Igstsdcaamt: '',
        }));
        dispatch(clearGSTConfig());
    };

    // Other charges rows
    const addOtherRow    = ()         => setOtherCharges(r => [...r, newRow()]);
    const removeOtherRow = (id)       => setOtherCharges(r => r.filter(x => x.id !== id));
    const updateOtherRow = (id, k, v) => {
        setOtherCharges(r => r.map(x => x.id === id ? { ...x, [k]: v } : x));
        if (k === 'dcaCode' && v) fetchSubDCAs(v);
    };

    // Deduction rows
    const addDeductRow    = ()         => setDeductions(r => [...r, newRow()]);
    const removeDeductRow = (id)       => setDeductions(r => r.filter(x => x.id !== id));
    const updateDeductRow = (id, k, v) => {
        setDeductions(r => r.map(x => x.id === id ? { ...x, [k]: v } : x));
        if (k === 'dcaCode' && v) fetchSubDCAs(v);
    };

    // ── File upload ───────────────────────────────────────────────────────────
    const handleFileSelect = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be under 10 MB.');
            return;
        }
        // Just hold the file — actual S3 upload happens after invoice is saved
        setAttachedFile(file);
        setUploadStatus('ready');
        setUploadProgress(0);
        setUploadError('');
    };

    const handleRemoveFile = () => {
        setAttachedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
        setUploadError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Calculations ──────────────────────────────────────────────────────────
    const basicValue  = parseFloat(form.SPPOBasicValue) || 0;
    const gstTotal    = form.IsGstApplicable !== 'Yes' ? 0
        : form.Statecheck
            ? (parseFloat(form.Cgstsdcaamt) || 0) + (parseFloat(form.Sgstsdcaamt) || 0)
            : (parseFloat(form.Igstsdcaamt) || 0);
    const otherTotal  = otherCharges.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const deductTotal = deductions.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const invoiceValue = basicValue + gstTotal + otherTotal;
    const netAmount    = invoiceValue - deductTotal
        - (parseFloat(form.Retention) || 0)
        - (parseFloat(form.Hold) || 0)
        - (parseFloat(form.Advance) || 0);

    // ── Builders ──────────────────────────────────────────────────────────────
    const buildTaxStrings = () => {
        if (form.IsGstApplicable !== 'Yes' || !gstConfig)
            return { Taxtypes: null, Taxdcas: null, Taxamounts: null };
        if (form.Statecheck) {
            return {
                Taxtypes: 'CGST,SGST',
                Taxdcas: `${form.Cgstsdca},${form.Sgstsdca}`,
                Taxamounts: `${parseFloat(form.Cgstsdcaamt) || 0},${parseFloat(form.Sgstsdcaamt) || 0}`,
            };
        }
        return {
            Taxtypes: 'IGST',
            Taxdcas: form.Igstsdca,
            Taxamounts: String(parseFloat(form.Igstsdcaamt) || 0),
        };
    };

    const buildChargeStrings = (rows) => {
        const valid = rows.filter(r => r.dcaCode && r.sdcaCode && r.amount);
        return {
            dcas:    valid.length ? valid.map(r => r.dcaCode).join(',')  : null,
            sdcas:   valid.length ? valid.map(r => r.sdcaCode).join(',') : null,
            amounts: valid.length ? valid.map(r => r.amount).join(',')   : null,
        };
    };

    const buildBudgetPayload = () => {
        const taxStr = buildTaxStrings();
        const other  = buildChargeStrings(otherCharges);
        return {
            CCCode:             form.CCCode,
            SPPOInvoiceDate:    formatDateForAPI(form.SPPOInvoiceDate),
            Taxtypes:           taxStr.Taxtypes,
            Taxdcas:            taxStr.Taxdcas,
            Taxamounts:         taxStr.Taxamounts,
            Otherchargedcas:    other.dcas,
            Otherchargeamounts: other.amounts,
        };
    };

    // ── Validate form ─────────────────────────────────────────────────────────
    const validateForm = () => {
        if (!form.VendorCode || !form.SPPONo)
            { toast.error('Select vendor and PO number.'); return false; }
        if (!form.SPPOInvoiceNo.trim())
            { toast.error('Invoice number is required.'); return false; }
        if (!form.SPPOInvoiceDate)
            { toast.error('Invoice date is required.'); return false; }
        if (!form.SPPOInvoiceMakingDate)
            { toast.error('Invoice making date is required.'); return false; }
        if (!form.SPPOBasicValue || basicValue <= 0)
            { toast.error('Basic value must be greater than 0.'); return false; }
        if (basicValue > form.Balance)
            { toast.error(`Basic value (₹ ${fmt(basicValue)}) cannot exceed PO balance (₹ ${fmt(form.Balance)}).`); return false; }
        if (form.IsGstApplicable === 'Yes' && (!form.VendorGST || !form.CompanyGST))
            { toast.error('Select vendor and company GST numbers.'); return false; }
        // Validate other charges: SubDCA mandatory if row has DCA + amount
        const invalidOther = otherCharges.some(r => (r.dcaCode || r.amount) && !r.sdcaCode);
        if (invalidOther)
            { toast.error('Sub-DCA is mandatory for all Other Charges rows.'); return false; }
        const invalidDeduct = deductions.some(r => (r.dcaCode || r.amount) && !r.sdcaCode);
        if (invalidDeduct)
            { toast.error('Sub-DCA is mandatory for all Deduction rows.'); return false; }
        return true;
    };

    // ── Budget Check (manual button) ──────────────────────────────────────────
    const handleCheckBudget = () => {
        if (!form.CCCode || !form.SPPOInvoiceDate || !form.SPPOBasicValue) {
            toast.warning('Complete vendor, PO, and invoice details before checking budget.');
            return;
        }
        dispatch(checkBudget(buildBudgetPayload())).then(res => {
            const msg = res?.payload;
            if (msg && typeof msg === 'string' && msg.trim()) {
                toast.warning(`Budget warning: ${msg}`);
            } else {
                toast.success('Budget check passed!');
            }
            setBudgetChecked(true);
        });
    };

    // ── Direct S3 PUT (XMLHttpRequest for progress tracking) ─────────────────
    const uploadToS3 = (file, s3Key, onProgress) =>
        new Promise((resolve, reject) => {
            const url = `${S3_BASE_URL}/${UPLOAD_DOCS_PATH}/${S3_FOLDERS.VENDOR_INVOICES}/${s3Key}`;
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress)
                    onProgress(Math.round((e.loaded / e.total) * 100));
            });
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve();
                else reject(new Error(`S3 upload failed: HTTP ${xhr.status}`));
            });
            xhr.addEventListener('error', () => reject(new Error('Network error during S3 upload')));
            xhr.open('PUT', url);
            xhr.setRequestHeader('Content-Type', 'application/pdf');
            xhr.send(file);
        });

    // ── Submit: Phase 1 save → Phase 2 direct S3 PUT ─────────────────────────
    const handleSubmit = async () => {
        if (!validateForm()) return;

        const buildPayload = () => {
            const taxStr = buildTaxStrings();
            const other  = buildChargeStrings(otherCharges);
            const deduct = buildChargeStrings(deductions);
            return {
                CCCode: form.CCCode, VendorCode: form.VendorCode,
                SPPOInvoiceDate: formatDateForAPI(form.SPPOInvoiceDate),
                SPPOInvoiceMakingDate: formatDateForAPI(form.SPPOInvoiceMakingDate),
                SPPOInvoiceNo: form.SPPOInvoiceNo,
                SPPOBasicValue: basicValue,
                DCACode: form.DCACode, SubDCACode: form.SubDCACode, SPPONo: form.SPPONo,
                ...taxStr,
                Otherchargedcas: other.dcas, Otherchargesdcas: other.sdcas, Otherchargeamounts: other.amounts,
                Deductiondcas: deduct.dcas, Deductionsdcas: deduct.sdcas, Deductionamounts: deduct.amounts,
                InvoiceValue: invoiceValue, Description: form.Description,
                Retention: parseFloat(form.Retention) || 0,
                Hold: parseFloat(form.Hold) || 0,
                NetAmount: netAmount,
                Advance: parseFloat(form.Advance) || 0,
                VendorGST: form.VendorGST, CompanyGST: form.CompanyGST, Statecheck: form.Statecheck,
                Cgstsdca: form.Cgstsdca, Cgstsdcaamt: parseFloat(form.Cgstsdcaamt) || 0,
                Sgstsdca: form.Sgstsdca, Sgstsdcaamt: parseFloat(form.Sgstsdcaamt) || 0,
                Igstsdca: form.Igstsdca, Igstsdcaamt: parseFloat(form.Igstsdcaamt) || 0,
                TaxApplicable: form.IsGstApplicable,
                CreatedBy: String(createdBy), RoleId: Number(roleId),
                // SP checks Filechk='Yes' to generate the S3 key (VendorCode_ID.ext)
                Filechk:   attachedFile ? 'Yes' : 'No',
                Extension: attachedFile ? 'pdf' : '',
            };
        };

        const doSave = async () => {
            // Phase 1: save invoice — SP generates S3 key, returns "Submited,<s3key>"
            const result   = await dispatch(submitSPPOInvoice(buildPayload()));
            const response = String(result?.payload || '');

            if (!response.toLowerCase().startsWith('submited') && !response.toLowerCase().startsWith('submitted')) {
                toast.error(response || 'Failed to save SPPO Invoice.');
                dispatch(clearSaveResult());
                return;
            }

            // Phase 2: PUT file directly to S3 using the key the SP generated
            if (attachedFile) {
                const s3Key = response.split(',')[1]?.trim(); // e.g. "SP100787_123.pdf"
                if (s3Key) {
                    setUploadStatus('uploading');
                    setUploadProgress(0);
                    try {
                        await uploadToS3(attachedFile, s3Key, (pct) => setUploadProgress(pct));
                        toast.success('Invoice submitted and PDF uploaded successfully!');
                    } catch (err) {
                        toast.warning(`Invoice saved (${s3Key}) but PDF upload failed: ${err.message}. You can re-upload later.`);
                        setUploadStatus('error');
                        setUploadError(err.message);
                        dispatch(clearSaveResult());
                        return;
                    }
                } else {
                    toast.success('SPPO Invoice submitted successfully!');
                }
            } else {
                toast.success('SPPO Invoice submitted successfully!');
            }

            dispatch(clearSaveResult());
            handleReset();
        };

        if (budgetChecked) {
            await doSave();
        } else {
            const budgetRes = await dispatch(checkBudget(buildBudgetPayload()));
            setBudgetChecked(true);
            const budgetMsg = budgetRes?.payload;
            if (budgetMsg && typeof budgetMsg === 'string' && budgetMsg.trim())
                toast.warning(`Budget warning: ${budgetMsg}. Proceeding...`);
            await doSave();
        }
    };

    const handleReset = () => {
        setForm(INITIAL_FORM);
        setOtherCharges([newRow()]);
        setDeductions([newRow()]);
        setSubDCACache({});
        setLoadingSubDCAs({});
        setBudgetChecked(false);
        setAttachedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
        setUploadError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        dispatch(resetSppoInvoice());
        dispatch(fetchServiceVendors());
        dispatch(fetchCompanyGSTNos());
    };

    // ── Row renderer helpers ──────────────────────────────────────────────────
    const renderChargeRows = (rows, dcaList, loadingDCA, updateFn, removeFn, type) => (
        <div className="space-y-3">
            {rows.map((row, idx) => {
                const rowSubDCAs = row.dcaCode ? (subDCACache[row.dcaCode] || []) : [];
                const isLoadingSubDCA = row.dcaCode && loadingSubDCAs[row.dcaCode];
                return (
                    <div key={row.id} className="grid grid-cols-12 gap-3 items-end">
                        {/* DCA */}
                        <div className="col-span-4">
                            {idx === 0 && <Label required>DCA</Label>}
                            <div className="relative">
                                <select
                                    className={`${inputCls} appearance-none pr-10`}
                                    value={row.dcaCode}
                                    onChange={e => {
                                        updateFn(row.id, 'dcaCode', e.target.value);
                                        updateFn(row.id, 'sdcaCode', '');
                                    }}
                                    disabled={loadingDCA || isBusy}
                                >
                                    <option value="">{loadingDCA ? 'Loading...' : 'Select DCA...'}</option>
                                    {dcaList.map(d => (
                                        <option key={d.DCAID} value={d.DCACode}>{d.DCAIDSTR}</option>
                                    ))}
                                </select>
                                <SelectIcon loading={loadingDCA} />
                            </div>
                        </div>
                        {/* Sub-DCA */}
                        <div className="col-span-4">
                            {idx === 0 && <Label required>Sub-DCA</Label>}
                            <div className="relative">
                                <select
                                    className={`${inputCls} appearance-none pr-10`}
                                    value={row.sdcaCode}
                                    onChange={e => updateFn(row.id, 'sdcaCode', e.target.value)}
                                    disabled={!row.dcaCode || isLoadingSubDCA || isBusy}
                                >
                                    <option value="">
                                        {!row.dcaCode ? 'Select DCA first' : isLoadingSubDCA ? 'Loading...' : 'Select Sub-DCA...'}
                                    </option>
                                    {rowSubDCAs.map(d => (
                                        <option key={d.SubDCACode} value={d.SubDCACode}>{d.SubDCAIDSTR}</option>
                                    ))}
                                </select>
                                <SelectIcon loading={!!isLoadingSubDCA} />
                            </div>
                        </div>
                        {/* Amount */}
                        <div className="col-span-3">
                            {idx === 0 && <Label required>Amount (₹)</Label>}
                            <input
                                className={inputCls}
                                type="number" min="0" step="0.01" placeholder="0.00"
                                value={row.amount}
                                onChange={e => updateFn(row.id, 'amount', e.target.value)}
                                disabled={isBusy}
                            />
                        </div>
                        {/* Remove */}
                        <div className="col-span-1 flex justify-center pb-0.5">
                            {rows.length > 1 && (
                                <button type="button" onClick={() => removeFn(row.id)}
                                    disabled={isBusy}
                                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-40">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Receipt className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Purchase Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'SPPO Invoice Creation'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Service Provider Purchase Order Invoice</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Purchase / SPPO</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: Vendor & PO ── */}
                <Card>
                    <CardHeader icon={Building2} title="Vendor & PO Selection" subtitle="Search service vendor and select PO"
                        action={
                            <button onClick={handleReset} disabled={isBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                        }
                    />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <Label required>Service Vendor</Label>
                                <VendorCombobox
                                    vendors={serviceVendors}
                                    loading={loadingServiceVendors}
                                    value={form.VendorCode}
                                    onChange={handleVendorSelect}
                                />
                            </div>
                            <div>
                                <Label required>PO Number</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={form.SPPONo}
                                        onChange={e => handlePOChange(e.target.value)}
                                        disabled={!poList.length || loadingPODetails || !form.VendorCode || isBusy}
                                    >
                                        <option value="">
                                            {!form.VendorCode ? 'Select vendor first' : loadingPOList ? 'Loading...' : 'Select PO...'}
                                        </option>
                                        {poList.map(po => (
                                            <option key={po.SPPONo} value={po.SPPONo}>{po.SPPONoDesc}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={loadingPODetails || loadingPOList} />
                                </div>
                            </div>
                        </div>

                        {/* PO auto-filled details */}
                        {form.CCCode && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <InfoBadge label="Vendor"      value={form.VendorName} />
                                <InfoBadge label="CC Code"     value={form.CCCode} />
                                <InfoBadge label="DCA Code"    value={form.DCACode} />
                                <InfoBadge label="Sub-DCA"     value={form.SubDCACode} />
                                <InfoBadge label="CC Type"     value={form.CCType} />
                                <InfoBadge label="CC Sub-Type" value={form.CCSubType} />
                                <InfoBadge label="PO Start"    value={form.POStartDate} />
                                <InfoBadge label="PO Balance"  value={`₹ ${fmt(form.Balance)}`} />
                            </div>
                        )}
                    </div>
                </Card>

                {/* ── Section 2: Invoice Details ── */}
                <Card>
                    <CardHeader icon={FileText} title="Invoice Details" subtitle="Invoice number, dates and basic value" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label required>Invoice Number</Label>
                                <input className={inputCls} placeholder="Vendor's invoice number"
                                    value={form.SPPOInvoiceNo}
                                    onChange={e => setField('SPPOInvoiceNo', e.target.value)}
                                    disabled={isBusy} />
                            </div>
                            <div>
                                <Label required>Invoice Date</Label>
                                <CustomDatePicker value={form.SPPOInvoiceDate}
                                    onChange={val => setField('SPPOInvoiceDate', val)}
                                    format="DD-MMM-YYYY" placeholder="Select invoice date" />
                            </div>
                            <div>
                                <Label required>Invoice Making Date</Label>
                                <CustomDatePicker value={form.SPPOInvoiceMakingDate}
                                    onChange={val => setField('SPPOInvoiceMakingDate', val)}
                                    format="DD-MMM-YYYY" placeholder="Select making date" />
                            </div>
                            <div>
                                <Label required>Basic Value (₹)</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <input className={`${inputCls} pl-8`}
                                        type="number" min="0" step="0.01" placeholder="0.00"
                                        value={form.SPPOBasicValue}
                                        onChange={e => { setField('SPPOBasicValue', e.target.value); setBudgetChecked(false); }}
                                        disabled={isBusy} />
                                </div>
                                {form.Balance > 0 && (
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                                        Max: ₹ {fmt(form.Balance)}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <input className={inputCls} placeholder="Invoice description / remarks"
                                    value={form.Description}
                                    onChange={e => setField('Description', e.target.value)}
                                    disabled={isBusy} />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Section 3: GST Details ── */}
                <Card>
                    <CardHeader icon={ShieldCheck} title="GST Details" subtitle="Tax configuration and amounts" />
                    <div className="p-6 md:p-8">
                        <div className="mb-5 max-w-xs">
                            <Label required>Is GST Applicable?</Label>
                            <YesNoToggle value={form.IsGstApplicable} onChange={handleGSTApplicable} />
                        </div>

                        {form.IsGstApplicable === 'Yes' && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label required>Vendor GST Number</Label>
                                        <div className="relative">
                                            <select className={`${inputCls} appearance-none pr-10`}
                                                value={form.VendorGST}
                                                onChange={e => {
                                                    const sel = vendorGSTNos.find(g => g.TaxNoName === e.target.value);
                                                    setForm(f => ({ ...f, VendorGST: e.target.value, VendorGSTTaxId: sel?.TaxNoID || '' }));
                                                    dispatch(clearGSTConfig());
                                                }}
                                                disabled={loadingVendorGST || !vendorGSTNos.length || isBusy}
                                            >
                                                <option value="">Select vendor GST...</option>
                                                {vendorGSTNos.map(g => (
                                                    <option key={g.TaxNoID} value={g.TaxNoName}>{g.TaxNoName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={loadingVendorGST} />
                                        </div>
                                        {!loadingVendorGST && !vendorGSTNos.length && form.VendorCode && (
                                            <p className="text-xs text-amber-500 mt-1">No GST numbers found for this vendor.</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label required>Company GST Number</Label>
                                        <div className="relative">
                                            <select className={`${inputCls} appearance-none pr-10`}
                                                value={form.CompanyGST}
                                                onChange={e => { setForm(f => ({ ...f, CompanyGST: e.target.value })); dispatch(clearGSTConfig()); }}
                                                disabled={loadingCompanyGST || !companyGSTNos.length || isBusy}
                                            >
                                                <option value="">Select company GST...</option>
                                                {companyGSTNos.map(g => (
                                                    <option key={g.TaxNoID} value={g.GSTNo}>{g.TaxNoName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={loadingCompanyGST} />
                                        </div>
                                    </div>
                                </div>

                                {loadingGSTConfig && (
                                    <div className="flex items-center gap-2 text-sm text-indigo-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Fetching GST configuration...
                                    </div>
                                )}

                                {gstConfig && (
                                    <div className="space-y-4">
                                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                                            form.Statecheck
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                                : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700'
                                        }`}>
                                            <MapPin className="h-4 w-4 flex-shrink-0" />
                                            {form.Statecheck ? 'Same State — CGST + SGST applicable' : 'Different State — IGST applicable'}
                                        </div>

                                        {form.Statecheck ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label>CGST Sub-DCA</Label>
                                                    <input className={`${inputCls} bg-gray-50 dark:bg-gray-700`} value={form.Cgstsdca} readOnly />
                                                </div>
                                                <div>
                                                    <Label required>CGST Amount (₹)</Label>
                                                    <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
                                                        value={form.Cgstsdcaamt}
                                                        onChange={e => setField('Cgstsdcaamt', e.target.value)} disabled={isBusy} />
                                                </div>
                                                <div>
                                                    <Label>SGST Sub-DCA</Label>
                                                    <input className={`${inputCls} bg-gray-50 dark:bg-gray-700`} value={form.Sgstsdca} readOnly />
                                                </div>
                                                <div>
                                                    <Label required>SGST Amount (₹)</Label>
                                                    <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
                                                        value={form.Sgstsdcaamt}
                                                        onChange={e => setField('Sgstsdcaamt', e.target.value)} disabled={isBusy} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label>IGST Sub-DCA</Label>
                                                    <input className={`${inputCls} bg-gray-50 dark:bg-gray-700`} value={form.Igstsdca} readOnly />
                                                </div>
                                                <div>
                                                    <Label required>IGST Amount (₹)</Label>
                                                    <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
                                                        value={form.Igstsdcaamt}
                                                        onChange={e => setField('Igstsdcaamt', e.target.value)} disabled={isBusy} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* ── Section 4: Other Charges ── */}
                <Card>
                    <CardHeader icon={Plus} title="Other Charges" subtitle="Additional charges beyond basic value (optional)" />
                    <div className="p-6 md:p-8">
                        {renderChargeRows(otherCharges, otherDCAs, loadingOtherDCAs, updateOtherRow, removeOtherRow, 'other')}
                        <div className="flex items-center justify-between mt-4">
                            <button type="button" onClick={addOtherRow} disabled={isBusy}
                                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold disabled:opacity-40">
                                <Plus className="h-4 w-4" /> Add Row
                            </button>
                            {otherTotal > 0 && (
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                    Total: ₹ {fmt(otherTotal)}
                                </span>
                            )}
                        </div>
                    </div>
                </Card>

                {/* ── Section 5: Deductions ── */}
                <Card>
                    <CardHeader icon={Layers} title="Deductions" subtitle="Amounts to be deducted from invoice (optional)" />
                    <div className="p-6 md:p-8">
                        {renderChargeRows(deductions, deductionDCAs, loadingDeductDCAs, updateDeductRow, removeDeductRow, 'deduct')}
                        <div className="flex items-center justify-between mt-4">
                            <button type="button" onClick={addDeductRow} disabled={isBusy}
                                className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold disabled:opacity-40">
                                <Plus className="h-4 w-4" /> Add Row
                            </button>
                            {deductTotal > 0 && (
                                <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
                                    Total: ₹ {fmt(deductTotal)}
                                </span>
                            )}
                        </div>
                    </div>
                </Card>

                {/* ── Section 6: Financial Summary ── */}
                <Card>
                    <CardHeader icon={Calculator} title="Financial Summary" subtitle="Invoice totals and net payable" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <Label>Retention (₹)</Label>
                                <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
                                    value={form.Retention} onChange={e => setField('Retention', e.target.value)} disabled={isBusy} />
                            </div>
                            <div>
                                <Label>Hold (₹)</Label>
                                <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
                                    value={form.Hold} onChange={e => setField('Hold', e.target.value)} disabled={isBusy} />
                            </div>
                            <div>
                                <Label>Advance (₹)</Label>
                                <input className={`${inputCls} bg-gray-50 dark:bg-gray-700`} value={fmt(form.Advance)} readOnly />
                                <p className="text-xs text-gray-400 mt-1">Auto-filled from PO</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800/30">
                            <div className="space-y-2 text-sm">
                                {[
                                    { label: 'Basic Value',   val: basicValue  },
                                    { label: 'GST Total',     val: gstTotal    },
                                    { label: 'Other Charges', val: otherTotal  },
                                ].map(({ label, val }) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">{label}</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">₹ {fmt(val)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 border-t border-indigo-200 dark:border-indigo-700 pt-2 mt-1">
                                    <span>Invoice Total</span>
                                    <span>₹ {fmt(invoiceValue)}</span>
                                </div>
                                {[
                                    { label: 'Deductions', val: deductTotal },
                                    { label: 'Retention',  val: parseFloat(form.Retention) || 0 },
                                    { label: 'Hold',       val: parseFloat(form.Hold) || 0 },
                                    { label: 'Advance',    val: parseFloat(form.Advance) || 0 },
                                ].filter(x => x.val > 0).map(({ label, val }) => (
                                    <div key={label} className="flex justify-between text-rose-600 dark:text-rose-400">
                                        <span>— {label}</span>
                                        <span className="font-medium">₹ {fmt(val)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold text-lg border-t-2 border-indigo-300 dark:border-indigo-600 pt-3 mt-2 text-indigo-800 dark:text-indigo-200">
                                    <span>Net Amount</span>
                                    <span>₹ {fmt(netAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Section 7: Invoice PDF Attachment ── */}
                <Card>
                    <CardHeader icon={Paperclip} title="Invoice PDF Attachment"
                        subtitle="Attach the vendor's invoice PDF before submitting" />
                    <div className="p-6 md:p-8">
                        {/* Drop zone / file selector */}
                        {uploadStatus === 'idle' && (
                            <label
                                className="flex flex-col items-center justify-center gap-3 w-full min-h-[140px] rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all group"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={e => handleFileSelect(e.target.files?.[0])}
                                />
                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <CloudUpload className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                        Click to attach invoice PDF
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">PDF only · Max 10 MB</p>
                                </div>
                            </label>
                        )}

                        {/* Ready state — file selected, will upload after save */}
                        {uploadStatus === 'ready' && attachedFile && (
                            <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-900/10 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                        <Paperclip className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{attachedFile.name}</p>
                                        <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
                                            {(attachedFile.size / 1024).toFixed(0)} KB · Will upload to S3 after invoice is saved
                                        </p>
                                    </div>
                                    <button type="button" onClick={handleRemoveFile} disabled={isBusy}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex-shrink-0"
                                        title="Remove attachment">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Uploading state — S3 upload in progress after save */}
                        {uploadStatus === 'uploading' && attachedFile && (
                            <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-900/10 p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                        <Upload className="h-5 w-5 text-indigo-500 animate-bounce" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{attachedFile.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {(attachedFile.size / 1024).toFixed(0)} KB · Uploading to S3...
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                        {uploadProgress}%
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="w-full bg-indigo-100 dark:bg-indigo-900/40 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                                        Uploading PDF to S3... please do not close or refresh the page.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error state */}
                        {uploadStatus === 'error' && (
                            <div className="rounded-2xl border-2 border-rose-200 dark:border-rose-700 bg-rose-50/60 dark:bg-rose-900/10 p-5">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Upload Failed</p>
                                        <p className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">{uploadError}</p>
                                    </div>
                                    <button type="button" onClick={handleRemoveFile}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 transition-colors flex-shrink-0">
                                        <RotateCcw className="h-3.5 w-3.5" /> Retry
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* ── Budget result ── */}
                {budgetResult !== null && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                        typeof budgetResult === 'string' && budgetResult.trim()
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
                    }`}>
                        {typeof budgetResult === 'string' && budgetResult.trim()
                            ? <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            : <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div>
                            <p className="font-semibold mb-0.5">
                                {typeof budgetResult === 'string' && budgetResult.trim() ? 'Budget Warning' : 'Budget Check Passed'}
                            </p>
                            <p>{typeof budgetResult === 'string' && budgetResult.trim() ? budgetResult : 'Sufficient budget is available for this invoice.'}</p>
                        </div>
                    </div>
                )}

                {/* ── Actions ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
                    <button type="button" onClick={handleReset} disabled={isBusy}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-all disabled:opacity-50">
                        <RotateCcw className="h-4 w-4" /> Reset
                    </button>

                    <div className="flex gap-3 flex-wrap">
                        <button type="button" onClick={handleCheckBudget} disabled={isBusy || !form.CCCode}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60 ${
                                budgetChecked
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}>
                            {loadingBudget
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : budgetChecked ? <CheckCircle2 className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
                            {budgetChecked ? 'Budget Checked' : 'Check Budget'}
                        </button>

                        <button type="button" onClick={handleSubmit} disabled={isBusy}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-sm">
                            {isBusy
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Send className="h-4 w-4" />}
                            {uploadStatus === 'uploading'
                                ? `Uploading PDF ${uploadProgress}%...`
                                : loadingBudget ? 'Checking Budget...'
                                : loadingSave   ? 'Saving Invoice...'
                                : 'Submit Invoice'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SPPOInvoiceCreation;
