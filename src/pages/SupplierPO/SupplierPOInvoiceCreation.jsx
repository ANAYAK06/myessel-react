import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';
import { getSubDCAByDCA } from '../../api/SupplierPOAPI/supplierPOInvoiceAPI';
import { S3_BASE_URL, UPLOAD_DOCS_PATH, S3_FOLDERS } from '../../config/s3Config';

import {
    fetchMRRForUser, fetchVendorDetailsByMRR, fetchCompanyGSTNos,
    fetchItemsByMRRNo, fetchAnlyzeTax,
    fetchTransportDCAs, fetchOtherChargeDCAs, fetchDeductionDCAs,
    checkBudget, submitSupplierPOInvoice,
    clearVendorDetails, clearItemsData, clearTaxAnalysis, clearSaveResult,
    resetSupplierPOInvoice,
    selectSupInvMRRList, selectSupInvVendorDetails, selectSupInvCompanyGSTNos,
    selectSupInvItemsData, selectSupInvTaxAnalysis,
    selectSupInvTransportDCAs, selectSupInvOtherDCAs, selectSupInvDeductionDCAs,
    selectSupInvBudgetResult, selectSupInvSaveResult,
    selectSupInvMRRListLoading, selectSupInvVendorDetailsLoading,
    selectSupInvCompanyGSTLoading, selectSupInvItemsDataLoading,
    selectSupInvTaxAnalysisLoading, selectSupInvTransportDCAsLoading,
    selectSupInvOtherDCAsLoading, selectSupInvDeductionDCAsLoading,
    selectSupInvBudgetLoading, selectSupInvSaveLoading, selectSupInvSaveError,
} from '../../slices/supplierPOSlice/supplierPOInvoiceSlice';

import {
    Receipt, Building2, Plus, Trash2, RotateCcw, Send,
    Loader2, ChevronDown, IndianRupee, ShieldCheck,
    FileText, AlertCircle, CheckCircle2, Layers, Calculator, MapPin,
    Truck, Package, Navigation, X, Paperclip, Upload, CloudUpload,
    RefreshCw, ArrowLeftRight,
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
    return `${String(d.getDate()).padStart(2,'0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const fmt = (v) => {
    const n = parseFloat(v);
    if ((!v && v !== 0) || isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── UI Primitives ─────────────────────────────────────────────────────────────
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

const YesNoToggle = ({ value, onChange, disabled }) => (
    <div className="flex gap-3 mt-1">
        {['Yes', 'No'].map(opt => (
            <button key={opt} type="button" onClick={() => !disabled && onChange(opt)} disabled={disabled}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-50 ${
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

// ── Initial State ─────────────────────────────────────────────────────────────
const INITIAL_FORM = {
    MRRNo: '',
    // Auto-filled from vendor details
    VendorId: '', VendorName: '', PONo: '', CCCode: '', DCACode: '',
    Advance: 0, VendorType: '', isAssetPO: false,
    // Invoice details
    InvoiceNo: '', InvoiceDate: '', InvoiceMakingDate: '',
    // GST — empty string means "not yet chosen"; prevents auto-fetch before user decides
    TaxApplicable: '',
    CompanyGST: '', VendorGST: '',
    // TCS
    TCSApplicable: 'No', TCSAmount: '',
    // Transport
    TransportDCA: '', TransportSubDCA: '',
    TransportAmount: '', TransportGSTPct: '',
    // Exchange
    isExchangeExist: 'No', ExchangeItem: '', ExItemAmount: '',
    // E-Way Bill
    EWaybillApplicable: 'No',
    EWaybillNumber: '', VehicleNumber: '', TransporterName: '', LRNumber: '', EWaybillDate: '',
    // Financial adjustments
    Retention: '', Hold: '',
};

let _rowId = 0;
const newRow = () => ({ id: ++_rowId, dcaCode: '', sdcaCode: '', amount: '' });

// ── Component ─────────────────────────────────────────────────────────────────
const SupplierPOInvoiceCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId    = userData?.roleId    || userData?.RID || 0;
    const userId    = userData?.userId    || userData?.UID || userData?.employeeId || '';
    const userName  = userData?.userName  || userData?.username || 'User';
    const createdBy = userName;

    // Redux selectors
    const mrrList           = useSelector(selectSupInvMRRList);
    const vendorDetails     = useSelector(selectSupInvVendorDetails);
    const companyGSTNos     = useSelector(selectSupInvCompanyGSTNos);
    const itemsData         = useSelector(selectSupInvItemsData);
    const taxAnalysis       = useSelector(selectSupInvTaxAnalysis);
    const transportDCAs     = useSelector(selectSupInvTransportDCAs);
    const otherDCAs         = useSelector(selectSupInvOtherDCAs);
    const deductionDCAs     = useSelector(selectSupInvDeductionDCAs);
    const budgetResult      = useSelector(selectSupInvBudgetResult);
    const saveResult        = useSelector(selectSupInvSaveResult);
    const saveError         = useSelector(selectSupInvSaveError);

    const loadingMRRList        = useSelector(selectSupInvMRRListLoading);
    const loadingVendorDetails  = useSelector(selectSupInvVendorDetailsLoading);
    const loadingCompanyGST     = useSelector(selectSupInvCompanyGSTLoading);
    const loadingItemsData      = useSelector(selectSupInvItemsDataLoading);
    const loadingTaxAnalysis    = useSelector(selectSupInvTaxAnalysisLoading);
    const loadingTransportDCAs  = useSelector(selectSupInvTransportDCAsLoading);
    const loadingOtherDCAs      = useSelector(selectSupInvOtherDCAsLoading);
    const loadingDeductDCAs     = useSelector(selectSupInvDeductionDCAsLoading);
    const loadingBudget         = useSelector(selectSupInvBudgetLoading);
    const loadingSave           = useSelector(selectSupInvSaveLoading);

    // Local state
    const [form, setForm]                 = useState(INITIAL_FORM);
    const [otherCharges, setOtherCharges] = useState([newRow()]);
    const [deductions,   setDeductions]   = useState([newRow()]);
    const [subDCACache,    setSubDCACache]    = useState({});
    const [loadingSubDCAs, setLoadingSubDCAs] = useState({});
    const [budgetChecked,  setBudgetChecked]  = useState(false);

    // File upload state
    const [attachedFile,   setAttachedFile]   = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus,   setUploadStatus]   = useState('idle'); // idle | ready | uploading | error
    const [uploadError,    setUploadError]    = useState('');
    const fileInputRef = useRef(null);

    const isBusy = loadingSave || loadingBudget || uploadStatus === 'uploading';

    // Derived vendor tax list (GST numbers)
    const vendorTaxList = vendorDetails?.vendorTaxlist || [];

    // ── SubDCA fetch (local cache) ─────────────────────────────────────────────
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
        dispatch(fetchMRRForUser({ roleId, userId }));
        dispatch(fetchCompanyGSTNos());
        dispatch(fetchTransportDCAs());
        return () => dispatch(resetSupplierPOInvoice());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── Vendor details → form ─────────────────────────────────────────────────
    useEffect(() => {
        if (!vendorDetails) return;
        setForm(f => ({
            ...f,
            VendorId:   vendorDetails.VendorCode || '',
            VendorName: vendorDetails.VendorName  || '',
            PONo:       vendorDetails.PONo        || '',
            CCCode:     vendorDetails.CCCode      || '',
            DCACode:    vendorDetails.DcaCode     || '',
            Advance:    vendorDetails.Advance     || 0,
            VendorType: vendorDetails.VendorType  || '',
            isAssetPO:  vendorDetails.isAssetPO   || false,
        }));
    }, [vendorDetails]);

    // ── Same-state detection from GST number prefixes ─────────────────────────
    // First 2 characters of a GST number are the state code (e.g. "22" = Gujarat)
    const sameState = form.TaxApplicable === 'Yes' && form.VendorGST && form.CompanyGST
        ? form.VendorGST.substring(0, 2) === form.CompanyGST.substring(0, 2)
        : false;

    // ── MRRNo change → fetch other/deduction DCAs ─────────────────────────────
    useEffect(() => {
        if (!form.MRRNo) return;
        dispatch(fetchOtherChargeDCAs(form.MRRNo));
        dispatch(fetchDeductionDCAs(form.MRRNo));
    }, [form.MRRNo, dispatch]);

    // ── Fetch items — only after TaxApplicable is explicitly chosen ───────────
    // 'Yes' path: waits for both GST numbers (backend needs them to compute CGST/SGST vs IGST)
    // 'No'  path: fetches immediately once MRR is set (no GST numbers needed)
    // ''    path: user hasn't decided yet — do nothing
    useEffect(() => {
        if (!form.MRRNo || !form.TaxApplicable) return;
        if (form.TaxApplicable === 'Yes' && form.CompanyGST && form.VendorGST) {
            dispatch(fetchItemsByMRRNo({
                gstNo: form.CompanyGST, vendorGstNo: form.VendorGST,
                mrrNo: form.MRRNo, vendorType: form.VendorType,
            }));
            dispatch(fetchAnlyzeTax({
                gstNo: form.CompanyGST, vendorGstNo: form.VendorGST,
                mrrNo: form.MRRNo,
            }));
        } else if (form.TaxApplicable === 'No') {
            dispatch(fetchItemsByMRRNo({
                gstNo: '', vendorGstNo: '', mrrNo: form.MRRNo, vendorType: form.VendorType,
            }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.TaxApplicable, form.CompanyGST, form.VendorGST, form.MRRNo, dispatch]);

    // ── Save errors ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (saveError) toast.error(String(saveError));
    }, [saveError]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleMRRChange = (mrrNo) => {
        dispatch(clearVendorDetails());
        dispatch(clearItemsData());
        dispatch(clearTaxAnalysis());
        setBudgetChecked(false);
        setForm({ ...INITIAL_FORM, MRRNo: mrrNo });
        if (mrrNo) dispatch(fetchVendorDetailsByMRR(mrrNo));
    };

    const handleTaxApplicableChange = (val) => {
        setForm(f => ({ ...f, TaxApplicable: val, CompanyGST: '', VendorGST: '' }));
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
        if (file.type !== 'application/pdf') { toast.error('Only PDF files are allowed.'); return; }
        if (file.size > 10 * 1024 * 1024)    { toast.error('File size must be under 10 MB.'); return; }
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
    const mrrItems  = itemsData?.MRRItemData || [];
    const itemTotal = itemsData?.ItemTotal != null
        ? parseFloat(itemsData.ItemTotal)
        : mrrItems.reduce((s, i) => s + (parseFloat(i.Amount) || 0), 0);
    // taxAnalysis (GetAnlyzeTaxbyMRRNo) gives state-adjusted CGST/SGST vs IGST;
    // fall back to itemsData totals, then item-level reduce
    const gstSource = taxAnalysis || itemsData;
    const cgstTotal = form.TaxApplicable === 'Yes'
        ? (gstSource?.CGSTTotal != null
            ? parseFloat(gstSource.CGSTTotal)
            : mrrItems.reduce((s, i) => s + (parseFloat(i.CGSTAmt) || 0), 0))
        : 0;
    const sgstTotal = form.TaxApplicable === 'Yes'
        ? (gstSource?.SGSTTotal != null
            ? parseFloat(gstSource.SGSTTotal)
            : mrrItems.reduce((s, i) => s + (parseFloat(i.SGSTAmt) || 0), 0))
        : 0;
    const igstTotal = form.TaxApplicable === 'Yes'
        ? (gstSource?.IGSTTotal != null
            ? parseFloat(gstSource.IGSTTotal)
            : mrrItems.reduce((s, i) => s + (parseFloat(i.IGSTAmt) || 0), 0))
        : 0;
    const gstTotal    = cgstTotal + sgstTotal + igstTotal;
    const transportAmt      = parseFloat(form.TransportAmount) || 0;
    const transportGSTPct   = parseFloat(form.TransportGSTPct) || 0;
    const transportGSTAmt   = transportAmt > 0 ? +(transportAmt * transportGSTPct / 100).toFixed(2) : 0;
    const transportCGSTCalc = sameState ? +(transportGSTAmt / 2).toFixed(2) : 0;
    const transportSGSTCalc = sameState ? +(transportGSTAmt / 2).toFixed(2) : 0;
    const transportIGSTCalc = !sameState ? transportGSTAmt : 0;
    const transportGST      = transportGSTAmt;
    const otherTotal  = otherCharges.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const deductTotal = deductions.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const tcsAmount   = form.TCSApplicable === 'Yes' ? (parseFloat(form.TCSAmount) || 0) : 0;
    const exchangeAmt = form.isExchangeExist === 'Yes' ? (parseFloat(form.ExItemAmount) || 0) : 0;

    const invoiceValue = itemTotal + gstTotal + transportAmt + transportGST + otherTotal;
    const netAmount    = invoiceValue - deductTotal
        - (parseFloat(form.Retention) || 0)
        - (parseFloat(form.Hold) || 0)
        - (parseFloat(form.Advance) || 0)
        + tcsAmount - exchangeAmt;

    // ── Build charge strings ──────────────────────────────────────────────────
    const buildChargeStrings = (rows) => {
        const valid = rows.filter(r => r.dcaCode && r.sdcaCode && r.amount);
        return {
            dcas:    valid.length ? valid.map(r => r.dcaCode).join(',')  : null,
            sdcas:   valid.length ? valid.map(r => r.sdcaCode).join(',') : null,
            amounts: valid.length ? valid.map(r => r.amount).join(',')   : null,
        };
    };

    const buildItemStrings = () => {
        const items = itemsData?.MRRItemData || [];
        if (!items.length) return { ids: null, amts: null, cgst: null, sgst: null, igst: null };
        // Use taxAnalysis MRRItemData for state-adjusted GST percents (CGST/SGST vs IGST)
        // Fall back to itemsData if taxAnalysis not yet loaded
        const taxItems = taxAnalysis?.MRRItemData || items;
        return {
            ids:  items.map(i => i.Id).join(','),
            amts: items.map(i => i.Amount || 0).join(','),
            cgst: taxItems.map(i => i.CGSTpercent || 0).join(','),
            sgst: taxItems.map(i => i.SGSTpercent || 0).join(','),
            igst: taxItems.map(i => i.IGSTpercent || 0).join(','),
        };
    };

    // ── Validate ──────────────────────────────────────────────────────────────
    const validateForm = () => {
        if (!form.MRRNo)
            { toast.error('Select an MRR number.'); return false; }
        if (!form.TaxApplicable)
            { toast.error('Please select whether GST is applicable.'); return false; }
        if (!form.InvoiceNo.trim())
            { toast.error('Invoice number is required.'); return false; }
        if (!form.InvoiceDate)
            { toast.error('Invoice date is required.'); return false; }
        if (!form.InvoiceMakingDate)
            { toast.error('Invoice making date is required.'); return false; }
        if (!itemsData || itemTotal <= 0)
            { toast.error('Item data not loaded or basic value is zero.'); return false; }
        if (form.TaxApplicable === 'Yes' && (!form.VendorGST || !form.CompanyGST))
            { toast.error('Select vendor and company GST numbers.'); return false; }
        if (form.TCSApplicable === 'Yes' && !(parseFloat(form.TCSAmount) > 0))
            { toast.error('Enter TCS amount.'); return false; }
        if (form.EWaybillApplicable === 'Yes') {
            if (!form.EWaybillNumber.trim() || !form.VehicleNumber.trim())
                { toast.error('E-Way bill number and vehicle number are required.'); return false; }
        }
        const invalidOther = otherCharges.some(r => (r.dcaCode || r.amount) && !r.sdcaCode);
        if (invalidOther)
            { toast.error('Sub-DCA is mandatory for all Other Charges rows.'); return false; }
        const invalidDeduct = deductions.some(r => (r.dcaCode || r.amount) && !r.sdcaCode);
        if (invalidDeduct)
            { toast.error('Sub-DCA is mandatory for all Deduction rows.'); return false; }
        return true;
    };

    // ── Budget Check ──────────────────────────────────────────────────────────
    const buildBudgetPayload = () => {
        const other = buildChargeStrings(otherCharges);
        return {
            CCCode:             form.CCCode,
            InvoiceDate:        formatDateForAPI(form.InvoiceDate),
            BasicValue:         itemTotal,
            CGSTTotal:          cgstTotal,
            SGSTTotal:          sgstTotal,
            IGSTTotal:          igstTotal,
            TransportAmount:    transportAmt,
            Otherchargedcas:    other.dcas,
            Otherchargeamounts: other.amounts,
        };
    };

    const handleCheckBudget = () => {
        if (!form.CCCode || !form.InvoiceDate || !itemTotal) {
            toast.warning('Complete MRR selection and invoice date before checking budget.');
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

    // ── Direct S3 PUT ─────────────────────────────────────────────────────────
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

    // ── Submit: Phase 1 save → Phase 2 S3 PUT ────────────────────────────────
    const handleSubmit = async () => {
        if (!validateForm()) return;

        const buildPayload = () => {
            const other  = buildChargeStrings(otherCharges);
            const deduct = buildChargeStrings(deductions);
            const items  = buildItemStrings();

            const payload = {
                // Field names must match the C# model (InvData) properties exactly
                VendorId:            form.VendorId,
                VendorName:          form.VendorName,
                MRR:                 form.MRRNo,
                PONo:                form.PONo,
                InvoiceNo:           form.InvoiceNo,
                InvoiceDate:         formatDateForAPI(form.InvoiceDate),
                InvoiceMakingDate:   formatDateForAPI(form.InvoiceMakingDate),
                CCCode:              form.CCCode,
                AccountHead:         form.DCACode,       // SP @DCACode ← InvData.AccountHead
                BasicValue:          itemTotal,
                NetAmount:           netAmount,
                VendorType:          form.VendorType,
                CGSTTotal:           cgstTotal,          // SP @Cgst ← InvData.CGSTTotal
                SGSTTotal:           sgstTotal,          // SP @Sgst ← InvData.SGSTTotal
                IGSTTotal:           igstTotal,          // SP @Igst ← InvData.IGSTTotal
                InvGSTTotal:         gstTotal,           // SP @GSTtaxamt ← InvData.InvGSTTotal
                Itemids:             items.ids,
                ItemAmts:            items.amts,         // SP @Basicamts ← InvData.ItemAmts
                CGSTpercents:        items.cgst,
                SGSTpercents:        items.sgst,
                IGSTpercents:        items.igst,
                Otherchargedcas:     other.dcas,
                Otherchargesdcas:    other.sdcas,
                Otherchargeamounts:  other.amounts,
                Deductiondcas:       deduct.dcas,
                Deductionsdcas:      deduct.sdcas,
                Deductionamounts:    deduct.amounts,
                TransportDCA:        form.TransportDCA || 0,
                TransportSubDCA:     form.TransportSubDCA || 0,
                TransportAmount:     transportAmt,
                TransportCGSTAmt:    transportCGSTCalc,
                TransportSGSTAmt:    transportSGSTCalc,
                TransportIGSTAmt:    transportIGSTCalc,
                Advance:             parseFloat(form.Advance) || 0,
                TaxApplicable:       form.TaxApplicable || 'No',
                TCSApplicable:       form.TCSApplicable,
                TCSAmount:           tcsAmount,
                ExchangeItem:        form.isExchangeExist === 'Yes' ? form.ExchangeItem : null,
                ExItemAmount:        exchangeAmt,
                isExchangeExist:     form.isExchangeExist,
                EWaybillApplicable:  form.EWaybillApplicable,
                CreatedBy:           String(createdBy),
                RoleId:              Number(roleId),
                Filechk:             attachedFile ? 'Yes' : 'No',
                Extension:           attachedFile ? 'pdf' : '',
            };

            if (form.TaxApplicable === 'Yes') {
                payload.CompanyGST  = form.CompanyGST;   // SP @GSTno ← InvData.CompanyGST
                payload.VendorGST   = form.VendorGST;    // SP @VendorGstno ← InvData.VendorGST
                payload.GSTType     = 'Creditable';      // SP @GSTtaxtype ← InvData.GSTType
                // GST accounting DCA codes from analyze-tax response
                payload.Taxdca      = taxAnalysis?.Taxdca    || null;
                payload.Cgstsdca    = taxAnalysis?.Cgstsdca  || null;
                payload.Sgstsdca    = taxAnalysis?.Sgstsdca  || null;
                payload.Igstsdca    = taxAnalysis?.Igstsdca  || null;
            }

            if (form.EWaybillApplicable === 'Yes') {
                payload.EWaybillNumber  = form.EWaybillNumber;
                payload.VehicleNumber   = form.VehicleNumber;
                payload.TransporterName = form.TransporterName;
                payload.LRNumber        = form.LRNumber;
                payload.EWaybillDate    = formatDateForAPI(form.EWaybillDate);
            }

            return payload;
        };

        const doSave = async () => {
            const result   = await dispatch(submitSupplierPOInvoice(buildPayload()));
            const apiResp  = result?.payload;                   // full { Data, IsSuccessful, Message }
            const response = typeof apiResp === 'string'
                ? apiResp
                : String(apiResp?.Data || '');

            // SP signals success by setting @AddInvoicestatus = "Submited"
            if (!response.toLowerCase().startsWith('submited') && !response.toLowerCase().startsWith('submitted')) {
                const errMsg = (typeof apiResp === 'object' ? apiResp?.Message : null)
                    || response || 'Failed to save Supplier PO Invoice.';
                toast.error(errMsg);
                dispatch(clearSaveResult());
                return;
            }

            if (attachedFile) {
                const s3Key = response.includes(',') ? response.split(',')[1]?.trim() : null;
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
                    toast.success('Supplier PO Invoice submitted successfully!');
                }
            } else {
                toast.success('Supplier PO Invoice submitted successfully!');
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
        dispatch(resetSupplierPOInvoice());
        dispatch(fetchMRRForUser({ roleId, userId }));
        dispatch(fetchCompanyGSTNos());
        dispatch(fetchTransportDCAs());
    };

    // ── Row renderer ──────────────────────────────────────────────────────────
    const renderChargeRows = (rows, dcaList, loadingDCA, updateFn, removeFn) => (
        <div className="space-y-3">
            {rows.map((row, idx) => {
                const rowSubDCAs    = row.dcaCode ? (subDCACache[row.dcaCode] || []) : [];
                const isLoadingSDCA = row.dcaCode && loadingSubDCAs[row.dcaCode];
                return (
                    <div key={row.id} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-4">
                            {idx === 0 && <Label required>DCA</Label>}
                            <div className="relative">
                                <select className={`${inputCls} appearance-none pr-10`}
                                    value={row.dcaCode}
                                    onChange={e => { updateFn(row.id, 'dcaCode', e.target.value); updateFn(row.id, 'sdcaCode', ''); }}
                                    disabled={loadingDCA || isBusy}>
                                    <option value="">{loadingDCA ? 'Loading...' : 'Select DCA...'}</option>
                                    {dcaList.map(d => (
                                        <option key={d.DCAID} value={d.DCACode}>{d.DCAIDSTR}</option>
                                    ))}
                                </select>
                                <SelectIcon loading={loadingDCA} />
                            </div>
                        </div>
                        <div className="col-span-4">
                            {idx === 0 && <Label required>Sub-DCA</Label>}
                            <div className="relative">
                                <select className={`${inputCls} appearance-none pr-10`}
                                    value={row.sdcaCode}
                                    onChange={e => updateFn(row.id, 'sdcaCode', e.target.value)}
                                    disabled={!row.dcaCode || !!isLoadingSDCA || isBusy}>
                                    <option value="">
                                        {!row.dcaCode ? 'Select DCA first' : isLoadingSDCA ? 'Loading...' : 'Select Sub-DCA...'}
                                    </option>
                                    {rowSubDCAs.map(d => (
                                        <option key={d.SubDCACode} value={d.SubDCACode}>{d.SubDCAIDSTR}</option>
                                    ))}
                                </select>
                                <SelectIcon loading={!!isLoadingSDCA} />
                            </div>
                        </div>
                        <div className="col-span-3">
                            {idx === 0 && <Label required>Amount (₹)</Label>}
                            <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
                                value={row.amount}
                                onChange={e => updateFn(row.id, 'amount', e.target.value)}
                                disabled={isBusy} />
                        </div>
                        <div className="col-span-1 flex justify-center pb-0.5">
                            {rows.length > 1 && (
                                <button type="button" onClick={() => removeFn(row.id)} disabled={isBusy}
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

    // ── Transport SubDCA list ─────────────────────────────────────────────────
    const tDCAs    = transportDCAs?.lstDCA    || [];
    const tSubDCAs = transportDCAs?.lstSubDCA || [];
    const filteredTSubDCAs = form.TransportDCA ? tSubDCAs : [];

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
                                    {menuData?.name || 'Supplier PO Invoice Creation'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Material Receipt — Supplier Invoice Entry</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Purchase / Supplier PO</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: MRR Selection ── */}
                <Card>
                    <CardHeader icon={Package} title="MRR Selection" subtitle="Select Material Receipt Report to create invoice"
                        action={
                            <button onClick={handleReset} disabled={isBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                        }
                    />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label required>MRR Number</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={form.MRRNo}
                                        onChange={e => handleMRRChange(e.target.value)}
                                        disabled={loadingMRRList || isBusy}
                                    >
                                        <option value="">
                                            {loadingMRRList ? 'Loading MRRs...' : 'Select MRR...'}
                                        </option>
                                        {mrrList.map(m => (
                                            <option key={m.MRRNo} value={m.MRRNo}>
                                                {m.MRRNo}{m.VendorName ? ` — ${m.VendorName}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={loadingMRRList || loadingVendorDetails} />
                                </div>
                            </div>
                        </div>

                        {/* Auto-filled PO/Vendor details */}
                        {form.CCCode && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <InfoBadge label="Vendor"      value={form.VendorName} />
                                <InfoBadge label="PO Number"   value={form.PONo} />
                                <InfoBadge label="CC Code"     value={form.CCCode} />
                                <InfoBadge label="DCA Code"    value={form.DCACode} />
                                <InfoBadge label="Vendor Type" value={form.VendorType} />
                                <InfoBadge label="Advance"     value={`₹ ${fmt(form.Advance)}`} />
                                <InfoBadge label="Asset PO"    value={form.isAssetPO ? 'Yes' : 'No'} />
                            </div>
                        )}
                    </div>
                </Card>

                {/* ── Section 2: Invoice Details ── */}
                <Card>
                    <CardHeader icon={FileText} title="Invoice Details" subtitle="Invoice number, dates" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label required>Invoice Number</Label>
                                <input className={inputCls} placeholder="Vendor's invoice number"
                                    value={form.InvoiceNo}
                                    onChange={e => setField('InvoiceNo', e.target.value)}
                                    disabled={isBusy} />
                            </div>
                            <div>
                                <Label required>Invoice Date</Label>
                                <CustomDatePicker value={form.InvoiceDate}
                                    onChange={val => setField('InvoiceDate', val)}
                                    format="DD-MMM-YYYY" placeholder="Select invoice date" />
                            </div>
                            <div>
                                <Label required>Invoice Making Date</Label>
                                <CustomDatePicker value={form.InvoiceMakingDate}
                                    onChange={val => setField('InvoiceMakingDate', val)}
                                    format="DD-MMM-YYYY" placeholder="Select making date" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Section 3: GST Details ── */}
                <Card>
                    <CardHeader icon={ShieldCheck} title="GST Details" subtitle="Tax applicability and GST configuration" />
                    <div className="p-6 md:p-8">
                        <div className="mb-5 max-w-xs">
                            <Label required>Is GST Applicable?</Label>
                            <YesNoToggle value={form.TaxApplicable} onChange={handleTaxApplicableChange} disabled={isBusy} />
                        </div>

                        {form.TaxApplicable === 'Yes' && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label required>Vendor GST Number</Label>
                                        <div className="relative">
                                            <select className={`${inputCls} appearance-none pr-10`}
                                                value={form.VendorGST}
                                                onChange={e => setField('VendorGST', e.target.value)}
                                                disabled={!vendorTaxList.length || isBusy}>
                                                <option value="">Select vendor GST...</option>
                                                {vendorTaxList.map(g => (
                                                    <option key={g.TaxNoID || g.TaxNoName} value={g.TaxNoName}>{g.TaxNoName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={false} />
                                        </div>
                                        {!vendorTaxList.length && form.VendorId && (
                                            <p className="text-xs text-amber-500 mt-1">No GST numbers found for this vendor.</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label required>Company GST Number</Label>
                                        <div className="relative">
                                            <select className={`${inputCls} appearance-none pr-10`}
                                                value={form.CompanyGST}
                                                onChange={e => setField('CompanyGST', e.target.value)}
                                                disabled={loadingCompanyGST || !companyGSTNos.length || isBusy}>
                                                <option value="">Select company GST...</option>
                                                {companyGSTNos.map(g => (
                                                    <option key={g.TaxNoID} value={g.GSTNo}>{g.TaxNoName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={loadingCompanyGST} />
                                        </div>
                                    </div>
                                </div>

                                {loadingItemsData && (
                                    <div className="flex items-center gap-2 text-sm text-indigo-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Fetching item details with GST...
                                    </div>
                                )}

                                {/* State badge — computed from first 2 digits of each GST number */}
                                {form.VendorGST && form.CompanyGST && (
                                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                                        sameState
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                            : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700'
                                    }`}>
                                        <MapPin className="h-4 w-4 flex-shrink-0" />
                                        {sameState
                                            ? `Same State (${form.VendorGST.substring(0,2)}) — CGST + SGST applicable`
                                            : `Different State (Vendor: ${form.VendorGST.substring(0,2)} / Company: ${form.CompanyGST.substring(0,2)}) — IGST applicable`}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* ── Section 4: Items ── */}
                {form.MRRNo && (
                    <Card>
                        <CardHeader icon={Package} title="MRR Items"
                            subtitle="Items from the material receipt — amounts auto-loaded"
                            action={
                                loadingItemsData
                                    ? <div className="flex items-center gap-1.5 text-xs text-indigo-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...</div>
                                    : null
                            }
                        />
                        <div className="p-6 md:p-8">
                            {!itemsData && !loadingItemsData && (
                                <div className="flex flex-col items-center gap-2 py-6 text-center">
                                    {!form.TaxApplicable ? (
                                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                            Select whether GST is applicable in the GST section above to load items.
                                        </p>
                                    ) : form.TaxApplicable === 'Yes' && (!form.CompanyGST || !form.VendorGST) ? (
                                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                                            Select vendor and company GST numbers above — items will load with the correct GST amounts.
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400">Loading items...</p>
                                    )}
                                </div>
                            )}

                            {itemsData && (
                                <>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-900/40 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">#</th>
                                                    <th className="px-4 py-3 text-left">Item Code</th>
                                                    <th className="px-4 py-3 text-left">Item Name</th>
                                                    <th className="px-4 py-3 text-right">Qty</th>
                                                    <th className="px-4 py-3 text-left">Unit</th>
                                                    <th className="px-4 py-3 text-right">Purchase Price</th>
                                                    <th className="px-4 py-3 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {(itemsData.MRRItemData || []).map((item, idx) => (
                                                    <tr key={item.Id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                                                                {item.itemcode || '—'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                                                            <p className="font-semibold">{item.itemname || `Item ${idx + 1}`}</p>
                                                            {item.specification && (
                                                                <p className="text-xs text-gray-400 mt-0.5">{item.specification}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                                                            {item.Requestedqty ?? '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                                                            {item.units || '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-300">
                                                            ₹ {fmt(item.NewBasicprice || 0)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-800 dark:text-gray-100">
                                                            ₹ {fmt(item.Amount || 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-indigo-50/60 dark:bg-indigo-900/10">
                                                <tr className="font-bold text-gray-800 dark:text-gray-100">
                                                    <td colSpan={6} className="px-4 py-3">Items Total</td>
                                                    <td className="px-4 py-3 text-right font-mono">₹ {fmt(itemTotal)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* GST Summary for items */}
                                    {form.TaxApplicable === 'Yes' && gstTotal > 0 && (
                                        <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-100 dark:border-blue-800/30">
                                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                                                GST on Items ({sameState ? 'Same State — CGST + SGST' : 'Different State — IGST'})
                                            </p>
                                            <div className="flex flex-wrap gap-4">
                                                {sameState ? (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">CGST Total:</span>
                                                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">₹ {fmt(cgstTotal)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">SGST Total:</span>
                                                            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">₹ {fmt(sgstTotal)}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">IGST Total:</span>
                                                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">₹ {fmt(igstTotal)}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Total Items GST:</span>
                                                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">₹ {fmt(gstTotal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Card>
                )}

                {/* ── Section 5: Transport ── */}
                <Card>
                    <CardHeader icon={Truck} title="Transport Charges" subtitle="Optional transport/freight charges" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <Label>Transport DCA</Label>
                                <div className="relative">
                                    <select className={`${inputCls} appearance-none pr-10`}
                                        value={form.TransportDCA}
                                        onChange={e => { setField('TransportDCA', e.target.value); setField('TransportSubDCA', ''); }}
                                        disabled={loadingTransportDCAs || isBusy}>
                                        <option value="">{loadingTransportDCAs ? 'Loading...' : 'Select transport DCA...'}</option>
                                        {tDCAs.map(d => (
                                            <option key={d.DCAID || d.DCACode} value={d.DCACode}>{d.DCAIDSTR || d.DCACode}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={loadingTransportDCAs} />
                                </div>
                            </div>
                            <div>
                                <Label>Transport Sub-DCA</Label>
                                <div className="relative">
                                    <select className={`${inputCls} appearance-none pr-10`}
                                        value={form.TransportSubDCA}
                                        onChange={e => setField('TransportSubDCA', e.target.value)}
                                        disabled={!form.TransportDCA || isBusy}>
                                        <option value="">{!form.TransportDCA ? 'Select DCA first' : 'Select Sub-DCA...'}</option>
                                        {filteredTSubDCAs.map(d => (
                                            <option key={d.SubDCACode} value={d.SubDCACode}>{d.SubDCAIDSTR || d.SubDCACode}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>
                            <div>
                                <Label>Transport Amount (₹)</Label>
                                <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
                                    value={form.TransportAmount}
                                    onChange={e => setField('TransportAmount', e.target.value)}
                                    disabled={isBusy} />
                            </div>
                            <div>
                                <Label>GST %</Label>
                                <input className={inputCls} type="number" min="0" max="100" step="0.01" placeholder="0"
                                    value={form.TransportGSTPct}
                                    onChange={e => setField('TransportGSTPct', e.target.value)}
                                    disabled={isBusy} />
                            </div>
                        </div>

                        {transportAmt > 0 && transportGSTPct > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-800/30">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Transport Amount</p>
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">₹ {fmt(transportAmt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">GST @ {transportGSTPct}%</p>
                                        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">₹ {fmt(transportGSTAmt)}</p>
                                    </div>
                                    {sameState ? (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">CGST ({transportGSTPct / 2}%)</p>
                                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">₹ {fmt(transportCGSTCalc)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">SGST ({transportGSTPct / 2}%)</p>
                                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">₹ {fmt(transportSGSTCalc)}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">IGST ({transportGSTPct}%)</p>
                                            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">₹ {fmt(transportIGSTCalc)}</p>
                                        </div>
                                    )}
                                    <div className="ml-auto">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Transport Total (incl. GST)</p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">₹ {fmt(transportAmt + transportGSTAmt)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* ── Section 6: TCS ── */}
                <Card>
                    <CardHeader icon={Calculator} title="TCS" subtitle="Tax Collected at Source (if applicable)" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label required>Is TCS Applicable?</Label>
                                <YesNoToggle value={form.TCSApplicable} onChange={val => setField('TCSApplicable', val)} disabled={isBusy} />
                            </div>
                            {form.TCSApplicable === 'Yes' && (
                                <div>
                                    <Label required>TCS Amount (₹)</Label>
                                    <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
                                        value={form.TCSAmount}
                                        onChange={e => setField('TCSAmount', e.target.value)}
                                        disabled={isBusy} />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* ── Section 7: Other Charges ── */}
                <Card>
                    <CardHeader icon={Plus} title="Other Charges" subtitle="Additional charges beyond basic value (optional)" />
                    <div className="p-6 md:p-8">
                        {renderChargeRows(otherCharges, otherDCAs, loadingOtherDCAs, updateOtherRow, removeOtherRow)}
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

                {/* ── Section 8: Deductions ── */}
                <Card>
                    <CardHeader icon={Layers} title="Deductions" subtitle="Amounts to be deducted from invoice (optional)" />
                    <div className="p-6 md:p-8">
                        {renderChargeRows(deductions, deductionDCAs, loadingDeductDCAs, updateDeductRow, removeDeductRow)}
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

                {/* ── Section 9: Exchange Item ── */}
                <Card>
                    <CardHeader icon={ArrowLeftRight} title="Exchange Item" subtitle="Old item exchanged against this invoice (optional)" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label required>Exchange Item Exists?</Label>
                                <YesNoToggle value={form.isExchangeExist} onChange={val => { setField('isExchangeExist', val); setField('ExchangeItem', ''); setField('ExItemAmount', ''); }} disabled={isBusy} />
                            </div>
                            {form.isExchangeExist === 'Yes' && (
                                <>
                                    <div>
                                        <Label required>Exchange Item Description</Label>
                                        <input className={inputCls} placeholder="Description of exchanged item"
                                            value={form.ExchangeItem}
                                            onChange={e => setField('ExchangeItem', e.target.value)}
                                            disabled={isBusy} />
                                    </div>
                                    <div>
                                        <Label required>Exchange Item Amount (₹)</Label>
                                        <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00"
                                            value={form.ExItemAmount}
                                            onChange={e => setField('ExItemAmount', e.target.value)}
                                            disabled={isBusy} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Card>

                {/* ── Section 10: E-Way Bill ── */}
                <Card>
                    <CardHeader icon={Truck} title="E-Way Bill" subtitle="E-Way bill details (if applicable)" />
                    <div className="p-6 md:p-8">
                        <div className="mb-5 max-w-xs">
                            <Label required>Is E-Way Bill Applicable?</Label>
                            <YesNoToggle value={form.EWaybillApplicable} onChange={val => setField('EWaybillApplicable', val)} disabled={isBusy} />
                        </div>

                        {form.EWaybillApplicable === 'Yes' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <Label required>E-Way Bill Number</Label>
                                    <input className={inputCls} placeholder="E-Way bill number"
                                        value={form.EWaybillNumber}
                                        onChange={e => setField('EWaybillNumber', e.target.value)}
                                        disabled={isBusy} />
                                </div>
                                <div>
                                    <Label required>Vehicle Number</Label>
                                    <input className={inputCls} placeholder="Vehicle registration number"
                                        value={form.VehicleNumber}
                                        onChange={e => setField('VehicleNumber', e.target.value)}
                                        disabled={isBusy} />
                                </div>
                                <div>
                                    <Label>Transporter Name</Label>
                                    <input className={inputCls} placeholder="Transporter's name"
                                        value={form.TransporterName}
                                        onChange={e => setField('TransporterName', e.target.value)}
                                        disabled={isBusy} />
                                </div>
                                <div>
                                    <Label>LR Number</Label>
                                    <input className={inputCls} placeholder="Lorry receipt number"
                                        value={form.LRNumber}
                                        onChange={e => setField('LRNumber', e.target.value)}
                                        disabled={isBusy} />
                                </div>
                                <div>
                                    <Label>E-Way Bill Date</Label>
                                    <CustomDatePicker value={form.EWaybillDate}
                                        onChange={val => setField('EWaybillDate', val)}
                                        format="DD-MMM-YYYY" placeholder="Select date" />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* ── Section 11: Financial Summary ── */}
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
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Basic Value (Items)</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">₹ {fmt(itemTotal)}</span>
                                </div>

                                {/* GST on Items breakdown */}
                                {form.TaxApplicable === 'Yes' && gstTotal > 0 && (
                                    sameState ? (
                                        <>
                                            <div className="flex justify-between text-blue-600 dark:text-blue-400 pl-3 border-l-2 border-blue-200 dark:border-blue-700">
                                                <span>Items CGST</span>
                                                <span className="font-medium">₹ {fmt(cgstTotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-blue-600 dark:text-blue-400 pl-3 border-l-2 border-blue-200 dark:border-blue-700">
                                                <span>Items SGST</span>
                                                <span className="font-medium">₹ {fmt(sgstTotal)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between text-orange-600 dark:text-orange-400 pl-3 border-l-2 border-orange-200 dark:border-orange-700">
                                            <span>Items IGST</span>
                                            <span className="font-medium">₹ {fmt(igstTotal)}</span>
                                        </div>
                                    )
                                )}

                                {transportAmt > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Transport Amount</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">₹ {fmt(transportAmt)}</span>
                                    </div>
                                )}

                                {/* GST on Transport breakdown */}
                                {transportGSTAmt > 0 && (
                                    sameState ? (
                                        <>
                                            <div className="flex justify-between text-blue-600 dark:text-blue-400 pl-3 border-l-2 border-blue-200 dark:border-blue-700">
                                                <span>Transport CGST</span>
                                                <span className="font-medium">₹ {fmt(transportCGSTCalc)}</span>
                                            </div>
                                            <div className="flex justify-between text-blue-600 dark:text-blue-400 pl-3 border-l-2 border-blue-200 dark:border-blue-700">
                                                <span>Transport SGST</span>
                                                <span className="font-medium">₹ {fmt(transportSGSTCalc)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between text-orange-600 dark:text-orange-400 pl-3 border-l-2 border-orange-200 dark:border-orange-700">
                                            <span>Transport IGST</span>
                                            <span className="font-medium">₹ {fmt(transportIGSTCalc)}</span>
                                        </div>
                                    )
                                )}

                                {/* Combined GST total */}
                                {(gstTotal > 0 || transportGSTAmt > 0) && (
                                    <div className="flex justify-between font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 -mx-2 px-2 py-1.5 rounded-lg">
                                        <span>Total GST (Items + Transport)</span>
                                        <span>₹ {fmt(gstTotal + transportGSTAmt)}</span>
                                    </div>
                                )}

                                {otherTotal > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Other Charges</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">₹ {fmt(otherTotal)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 border-t border-indigo-200 dark:border-indigo-700 pt-2 mt-1">
                                    <span>Invoice Total</span>
                                    <span>₹ {fmt(invoiceValue)}</span>
                                </div>
                                {[
                                    { label: 'Deductions',  val: deductTotal },
                                    { label: 'Retention',   val: parseFloat(form.Retention) || 0 },
                                    { label: 'Hold',        val: parseFloat(form.Hold) || 0 },
                                    { label: 'Advance',     val: parseFloat(form.Advance) || 0 },
                                    { label: 'Exchange Item', val: exchangeAmt },
                                ].filter(x => x.val > 0).map(({ label, val }) => (
                                    <div key={label} className="flex justify-between text-rose-600 dark:text-rose-400">
                                        <span>— {label}</span>
                                        <span className="font-medium">₹ {fmt(val)}</span>
                                    </div>
                                ))}
                                {tcsAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                        <span>+ TCS</span>
                                        <span className="font-medium">₹ {fmt(tcsAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t-2 border-indigo-300 dark:border-indigo-600 pt-3 mt-2 text-indigo-800 dark:text-indigo-200">
                                    <span>Net Amount</span>
                                    <span>₹ {fmt(netAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ── Section 12: Invoice PDF Attachment ── */}
                <Card>
                    <CardHeader icon={Paperclip} title="Invoice PDF Attachment"
                        subtitle="Attach the vendor's invoice PDF before submitting" />
                    <div className="p-6 md:p-8">
                        {uploadStatus === 'idle' && (
                            <label className="flex flex-col items-center justify-center gap-3 w-full min-h-[140px] rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all group">
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
                            <p>
                                {typeof budgetResult === 'string' && budgetResult.trim()
                                    ? budgetResult
                                    : 'Sufficient budget is available for this invoice.'}
                            </p>
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

export default SupplierPOInvoiceCreation;
