import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchGenCCTypes, fetchGenCCSubTypes, fetchGenCostCenters,
    fetchPANSuggestions, submitNewPAN,
    fetchGenDCA, fetchGenSubDCA,
    fetchGenDedCostCenters, fetchGenDedDCA, fetchGenDedSubDCA,
    submitGenInvoice,
    clearGenSaveResult, clearGenPANSuggestions, clearGenNewPANResult,
    clearGenCostCenters, clearGenDCA, clearGenSubDCA,
    clearGenDedDCA, clearGenDedSubDCA, resetGenInvoice,
    selectGenCCTypes, selectGenCCSubTypes, selectGenCostCenters,
    selectGenPANSuggestions, selectGenMainDCA, selectGenSubDCA,
    selectGenDedCostCenters, selectGenDedDCA, selectGenDedSubDCA,
    selectGenSaveResult, selectGenNewPANResult,
    selectGenCCLoading, selectGenPANLoading,
    selectGenDCALoading, selectGenSubDCALoading,
    selectGenDedCCLoading, selectGenDedDCALoading, selectGenDedSubDCALoading,
    selectGenSaveLoading, selectGenNewPANLoading,
    selectGenSaveError, selectGenNewPANError,
} from '../../slices/accountsSlice/generalInvoiceCreationSlice';

import {
    FileText, Building2, User, Percent,
    Search, Plus, RotateCcw, Send, Loader2,
    ChevronDown, Navigation, CreditCard, Minus,
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────
const PERFORMING_TYPE = 'Performing';

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

const CardHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
        <Icon className="h-4 w-4 text-indigo-500" />
        <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
    </div>
);

const YesNoToggle = ({ value, onChange, disabled }) => (
    <div className="flex gap-3 mt-1">
        {['Yes', 'No'].map(opt => (
            <button key={opt} type="button" onClick={() => onChange(opt)} disabled={disabled}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-50 ${
                    value === opt
                        ? opt === 'Yes' ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                        : 'bg-rose-500 border-rose-500 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'
                }`}>{opt}</button>
        ))}
    </div>
);

// ── Initial state ─────────────────────────────────────────────────────────────
const INITIAL_FORM = {
    InvoiceDate:    '',
    CostCentertype: '',
    CostCentersubtype: '',
    CostCenter:     '',
    PanApplicable:  '',
    SelectionType:  '1',   // '1' = PAN | '2' = Name
    PANno:          '',
    Name:           '',
    DCACode:        '',
    CreditSubDca:   '',
    DebitSubDca:    '',
    InvoiceAmount:  '',
    Remarks:        '',
    Ded_CC_Code:    '',
    Ded_DCA_Code:   '',
    Ded_Sub_DCA_Code: '',
    DedAmount:      '',
};

// ── Component ─────────────────────────────────────────────────────────────────
const GeneralInvoiceCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId = userData?.roleId || userData?.RID || 0;
    const userId = userData?.userId || userData?.UID || userData?.employeeId || '';

    // Redux state
    const ccTypes         = useSelector(selectGenCCTypes);
    const ccSubTypes      = useSelector(selectGenCCSubTypes);
    const costCenters     = useSelector(selectGenCostCenters);
    const panSuggestions  = useSelector(selectGenPANSuggestions);
    const mainDCA         = useSelector(selectGenMainDCA);
    const subDCA          = useSelector(selectGenSubDCA);
    const dedCostCenters  = useSelector(selectGenDedCostCenters);
    const dedDCA          = useSelector(selectGenDedDCA);
    const dedSubDCA       = useSelector(selectGenDedSubDCA);
    const saveResult      = useSelector(selectGenSaveResult);
    const newPANResult    = useSelector(selectGenNewPANResult);

    const ccLoading       = useSelector(selectGenCCLoading);
    const panLoading      = useSelector(selectGenPANLoading);
    const dcaLoading      = useSelector(selectGenDCALoading);
    const subDcaLoading   = useSelector(selectGenSubDCALoading);
    const dedCCLoading    = useSelector(selectGenDedCCLoading);
    const dedDcaLoading   = useSelector(selectGenDedDCALoading);
    const dedSubDcaLoading= useSelector(selectGenDedSubDCALoading);
    const saveLoading     = useSelector(selectGenSaveLoading);
    const newPanLoading   = useSelector(selectGenNewPANLoading);
    const saveError       = useSelector(selectGenSaveError);
    const newPANError     = useSelector(selectGenNewPANError);

    // Local state
    const [form, setForm]             = useState(INITIAL_FORM);
    const [panSearch, setPanSearch]   = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAddPAN, setShowAddPAN] = useState(false);
    const [newPAN, setNewPAN]         = useState({ NewPANno: '', NewPANname: '', NewMobile: '' });
    const suggestRef = useRef(null);

    // Computed
    const invoiceAmt = parseFloat(form.InvoiceAmount) || 0;
    const dedAmt     = parseFloat(form.DedAmount) || 0;
    const finalAmt   = Math.max(0, invoiceAmt - dedAmt);
    const isPAN      = form.PanApplicable === 'Yes';

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchGenCCTypes());
        dispatch(fetchGenCCSubTypes());
        return () => { dispatch(resetGenInvoice()); };
    }, [dispatch]);

    // Fetch DCA when CC + date both set
    useEffect(() => {
        if (form.CostCenter && form.InvoiceDate) {
            dispatch(fetchGenDCA({ ccCode: form.CostCenter, finalDate: formatDateForAPI(form.InvoiceDate) }));
        }
    }, [form.CostCenter, form.InvoiceDate]);

    // Fetch SubDCA when DCA selected
    useEffect(() => {
        if (form.DCACode) {
            dispatch(fetchGenSubDCA(form.DCACode));
        } else {
            dispatch(clearGenSubDCA());
        }
    }, [form.DCACode]);

    // Fetch deduction DCA when Ded CC + date set
    useEffect(() => {
        if (form.Ded_CC_Code && form.InvoiceDate) {
            dispatch(fetchGenDedDCA({ ccCode: form.Ded_CC_Code, finalDate: formatDateForAPI(form.InvoiceDate) }));
        } else {
            dispatch(clearGenDedDCA());
        }
    }, [form.Ded_CC_Code, form.InvoiceDate]);

    // Fetch Ded SubDCA when Ded DCA selected
    useEffect(() => {
        if (form.Ded_DCA_Code) {
            dispatch(fetchGenDedSubDCA(form.Ded_DCA_Code));
        } else {
            dispatch(clearGenDedSubDCA());
        }
    }, [form.Ded_DCA_Code]);

    // Load ded cost centers when PAN = Yes
    useEffect(() => {
        if (isPAN && dedCostCenters.length === 0) {
            dispatch(fetchGenDedCostCenters());
        }
    }, [isPAN]);

    // Handle save result
    useEffect(() => {
        if (!saveResult) return;
        const raw = typeof saveResult === 'string' ? saveResult : (saveResult?.Message || '');
        const msg = raw.split('$')[0];
        if (msg === 'Submited') {
            toast.success('General invoice submitted successfully!');
            handleReset();
        } else if (msg) {
            toast.error(msg);
        }
        dispatch(clearGenSaveResult());
    }, [saveResult]);

    // Handle new PAN result
    useEffect(() => {
        if (!newPANResult) return;
        const msg = typeof newPANResult === 'string' ? newPANResult : '';
        if (msg === 'Submited') {
            toast.success('New PAN added successfully!');
            setNewPAN({ NewPANno: '', NewPANname: '', NewMobile: '' });
            setShowAddPAN(false);
            dispatch(clearGenNewPANResult());
        } else if (msg) {
            toast.error(msg);
            dispatch(clearGenNewPANResult());
        }
    }, [newPANResult]);

    useEffect(() => {
        if (saveError) toast.error(saveError);
    }, [saveError]);

    useEffect(() => {
        if (newPANError) toast.error(newPANError);
    }, [newPANError]);

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (suggestRef.current && !suggestRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Cascade Handlers ──────────────────────────────────────────────────────
    const handleCCTypeChange = (val) => {
        setForm(p => ({ ...INITIAL_FORM, InvoiceDate: p.InvoiceDate, CostCentertype: val }));
        dispatch(clearGenCostCenters());
        dispatch(clearGenDCA());
        if (val) {
            const subType = val === PERFORMING_TYPE ? '' : '';
            if (val !== PERFORMING_TYPE) {
                dispatch(fetchGenCostCenters({ ccType: val, subType: '' }));
            }
        }
    };

    const handleSubTypeChange = (val) => {
        setForm(p => ({ ...p, CostCentersubtype: val, CostCenter: '', DCACode: '', CreditSubDca: '', DebitSubDca: '' }));
        dispatch(clearGenCostCenters());
        dispatch(clearGenDCA());
        if (val && form.CostCentertype) {
            dispatch(fetchGenCostCenters({ ccType: form.CostCentertype, subType: val }));
        }
    };

    const handleCCChange = (val) => {
        setForm(p => ({ ...p, CostCenter: val, DCACode: '', CreditSubDca: '', DebitSubDca: '' }));
        dispatch(clearGenDCA());
    };

    const handleDCAChange = (val) => {
        setForm(p => ({ ...p, DCACode: val, CreditSubDca: '', DebitSubDca: '' }));
    };

    const handlePANApplicableChange = (val) => {
        setForm(p => ({
            ...p, PanApplicable: val,
            PANno: '', Name: '',
            Ded_CC_Code: '', Ded_DCA_Code: '', Ded_Sub_DCA_Code: '', DedAmount: '',
        }));
        setPanSearch('');
        dispatch(clearGenPANSuggestions());
        dispatch(clearGenDedDCA());
    };

    // ── PAN Search ────────────────────────────────────────────────────────────
    const handlePANSearch = () => {
        if (panSearch.trim().length < 3) { toast.warn('Enter at least 3 characters to search'); return; }
        dispatch(fetchPANSuggestions({ pfx: panSearch.trim(), typ: form.SelectionType }));
        setShowSuggestions(true);
    };

    const handleSelectPAN = (item) => {
        // SearchItem format: "PANNO , NAME"
        const parts = (item.SearchItem || '').split(' , ');
        const pan  = parts[0]?.trim() || '';
        const name = parts[1]?.trim() || '';
        setForm(p => ({ ...p, PANno: pan, Name: name }));
        setPanSearch('');
        setShowSuggestions(false);
        dispatch(clearGenPANSuggestions());
    };

    const handleSaveNewPAN = () => {
        if (!newPAN.NewPANno) { toast.warn('Enter PAN number'); return; }
        if (!newPAN.NewPANname) { toast.warn('Enter PAN holder name'); return; }
        dispatch(submitNewPAN(newPAN));
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setForm(INITIAL_FORM);
        setPanSearch('');
        setShowSuggestions(false);
        setShowAddPAN(false);
        setNewPAN({ NewPANno: '', NewPANname: '', NewMobile: '' });
        dispatch(clearGenDCA());
        dispatch(clearGenPANSuggestions());
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!form.InvoiceDate)      { toast.warn('Select Invoice Date');        return; }
        if (!form.CostCentertype)   { toast.warn('Select Cost Center Type');    return; }
        if (form.CostCentertype === PERFORMING_TYPE && !form.CostCentersubtype) {
            toast.warn('Select Cost Center Sub Type'); return;
        }
        if (!form.CostCenter)       { toast.warn('Select Cost Center');         return; }
        if (!form.DCACode)          { toast.warn('Select DCA Code');            return; }
        if (!form.CreditSubDca)     { toast.warn('Select Credit Sub DCA');      return; }
        if (!form.DebitSubDca)      { toast.warn('Select Debit Sub DCA');       return; }
        if (!form.InvoiceAmount)    { toast.warn('Enter Invoice Amount');       return; }
        if (!form.PanApplicable)    { toast.warn('Specify if PAN is applicable'); return; }

        dispatch(submitGenInvoice({
            CostCenter:          form.CostCenter,
            DCACode:             form.DCACode,
            CreditSubDca:        form.CreditSubDca,
            DebitSubDca:         form.DebitSubDca,
            Remarks:             form.Remarks || null,
            InvoiceAmount:       invoiceAmt,
            InvoiceDate:         formatDateForAPI(form.InvoiceDate),
            Name:                form.Name || null,
            Createdby:           String(userId),
            RoleId:              roleId,
            PanApplicable:       form.PanApplicable,
            Ded_CC_Code:         isPAN ? (form.Ded_CC_Code || null) : null,
            Ded_DCA_Code:        isPAN ? (form.Ded_DCA_Code || null) : null,
            Ded_Sub_DCA_Code:    isPAN ? (form.Ded_Sub_DCA_Code || null) : null,
            DedAmount:           isPAN ? dedAmt : 0,
            InvoiceFinalAmount:  isPAN ? finalAmt : invoiceAmt,
            PANno:               isPAN ? (form.PANno || null) : null,
        }));
    };

    // ── Options ───────────────────────────────────────────────────────────────
    const ccTypeOptions   = ccTypes.map(t => ({ value: t.CCTypeDescription, label: t.CCTypeDescription }));
    const ccSubTypeOptions= ccSubTypes.map(t => ({ value: t.CC_SubType, label: t.CC_SubType }));
    const ccOptions       = costCenters.map(c => ({ value: c.CC_Code, label: c.CC_Name }));
    const dcaOptions      = mainDCA.map(d => ({ value: d.DCACode, label: d.DCAIDSTR }));
    const subDcaOptions   = subDCA.map(d => ({ value: d.SubDCACode, label: d.SubDCAIDSTR }));
    const dedCCOptions    = dedCostCenters.map(c => ({ value: c.CC_Id, label: c.CC_Code }));
    const dedDcaOptions   = dedDCA.map(d => ({ value: d.DCACode, label: d.DCAIDSTR }));
    const dedSubDcaOptions= dedSubDCA.map(d => ({ value: d.SubDCACode, label: d.SubDCAIDSTR }));

    const isBusy = saveLoading;
    const isPerforming = form.CostCentertype === PERFORMING_TYPE;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* Page Header */}
            <div className="max-w-5xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'General Invoice'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Create general invoice with DCA account heads and optional PAN deduction</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / General</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Section 1: Invoice Setup ──────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Invoice Setup</h2>
                                <p className="text-xs text-gray-400">Date and cost center selection</p>
                            </div>
                        </div>
                        <button onClick={handleReset} disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Date */}
                            <div>
                                <Label required>Invoice Date</Label>
                                <CustomDatePicker
                                    value={form.InvoiceDate}
                                    onChange={val => setForm(p => ({ ...p, InvoiceDate: val }))}
                                    disabled={isBusy}
                                    placeholder="Select date"
                                />
                            </div>

                            {/* CC Type */}
                            <div>
                                <Label required>Cost Center Type</Label>
                                <div className="relative">
                                    <select value={form.CostCentertype} onChange={e => handleCCTypeChange(e.target.value)}
                                        disabled={isBusy} className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">— Select Type —</option>
                                        {ccTypeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>

                            {/* Sub Type — only for Performing */}
                            {isPerforming && (
                                <div>
                                    <Label required>Sub Type</Label>
                                    <div className="relative">
                                        <select value={form.CostCentersubtype} onChange={e => handleSubTypeChange(e.target.value)}
                                            disabled={isBusy} className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">— Select Sub Type —</option>
                                            {ccSubTypeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                        <SelectIcon loading={false} />
                                    </div>
                                </div>
                            )}

                            {/* Cost Center */}
                            <div>
                                <Label required>Cost Center</Label>
                                <div className="relative">
                                    <select value={form.CostCenter} onChange={e => handleCCChange(e.target.value)}
                                        disabled={!form.CostCentertype || (isPerforming && !form.CostCentersubtype) || ccLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">
                                            {!form.CostCentertype ? 'Select type first'
                                            : isPerforming && !form.CostCentersubtype ? 'Select sub type first'
                                            : ccLoading ? 'Loading…'
                                            : '— Select CC —'}
                                        </option>
                                        {ccOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <SelectIcon loading={ccLoading} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Payee / PAN ────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={User} title="Payee Details" subtitle="PAN applicability and payee information" />
                    <div className="p-6 md:p-8 space-y-6">

                        {/* PAN Applicable */}
                        <div className="max-w-xs">
                            <Label required>Is PAN Applicable?</Label>
                            <YesNoToggle value={form.PanApplicable} onChange={handlePANApplicableChange} disabled={isBusy} />
                        </div>

                        {/* PAN search panel */}
                        {isPAN && (
                            <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800 space-y-4">
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">PAN Search</p>

                                {/* Search type + input */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>Search By</Label>
                                        <div className="relative">
                                            <select value={form.SelectionType}
                                                onChange={e => { setForm(p => ({ ...p, SelectionType: e.target.value })); setPanSearch(''); dispatch(clearGenPANSuggestions()); }}
                                                disabled={isBusy} className={`${inputCls} appearance-none pr-10`}>
                                                <option value="1">PAN Number</option>
                                                <option value="2">Name</option>
                                            </select>
                                            <SelectIcon loading={false} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Enter {form.SelectionType === '1' ? 'PAN prefix' : 'Name prefix'} (min 3 chars)</Label>
                                        <div ref={suggestRef} className="relative">
                                            <div className="flex gap-2">
                                                <input type="text" placeholder={`Type first 3+ characters…`}
                                                    value={panSearch}
                                                    onChange={e => { setPanSearch(e.target.value); if (e.target.value.length < 3) { setShowSuggestions(false); dispatch(clearGenPANSuggestions()); } }}
                                                    onKeyDown={e => e.key === 'Enter' && handlePANSearch()}
                                                    disabled={isBusy} className={inputCls} />
                                                <button type="button" onClick={handlePANSearch}
                                                    disabled={panLoading || panSearch.trim().length < 3 || isBusy}
                                                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors whitespace-nowrap">
                                                    {panLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                                    Search
                                                </button>
                                            </div>
                                            {showSuggestions && panSuggestions.length > 0 && (
                                                <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                    {panSuggestions.map((item, idx) => (
                                                        <li key={idx} onClick={() => handleSelectPAN(item)}
                                                            className="px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 text-gray-800 dark:text-gray-100">
                                                            {item.SearchItem}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {showSuggestions && !panLoading && panSuggestions.length === 0 && (
                                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-500">
                                                    No results found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Selected PAN display */}
                                {(form.PANno || form.Name) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                        <div>
                                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1">Selected PAN</p>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{form.PANno || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1">PAN Holder Name</p>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{form.Name || '—'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Add New PAN */}
                                <div>
                                    <button type="button" onClick={() => setShowAddPAN(p => !p)}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors">
                                        <Plus className="h-3.5 w-3.5" />
                                        {showAddPAN ? 'Hide' : 'Add New PAN'}
                                    </button>
                                    {showAddPAN && (
                                        <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Register New PAN</p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label required>PAN Number</Label>
                                                    <input type="text" placeholder="e.g. ABCDE1234F"
                                                        value={newPAN.NewPANno}
                                                        onChange={e => setNewPAN(p => ({ ...p, NewPANno: e.target.value.toUpperCase() }))}
                                                        maxLength={10} className={inputCls} />
                                                </div>
                                                <div>
                                                    <Label required>Holder Name</Label>
                                                    <input type="text" placeholder="Full name…"
                                                        value={newPAN.NewPANname}
                                                        onChange={e => setNewPAN(p => ({ ...p, NewPANname: e.target.value }))}
                                                        className={inputCls} />
                                                </div>
                                                <div>
                                                    <Label>Mobile</Label>
                                                    <input type="tel" placeholder="Mobile number…"
                                                        value={newPAN.NewMobile}
                                                        onChange={e => setNewPAN(p => ({ ...p, NewMobile: e.target.value }))}
                                                        className={inputCls} />
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button type="button" onClick={handleSaveNewPAN} disabled={newPanLoading}
                                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors">
                                                    {newPanLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                    Save PAN
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payee Name — always visible, auto-filled on PAN select */}
                        <div className="max-w-md">
                            <Label>Payee Name</Label>
                            <input type="text" placeholder="Payee / beneficiary name…"
                                value={form.Name} onChange={e => setForm(p => ({ ...p, Name: e.target.value }))}
                                disabled={isBusy} className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* ── Section 3: Account Head ───────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={CreditCard} title="Account Head" subtitle="DCA, credit/debit sub-accounts and invoice amount" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* DCA */}
                            <div>
                                <Label required>DCA Code</Label>
                                <div className="relative">
                                    <select value={form.DCACode} onChange={e => handleDCAChange(e.target.value)}
                                        disabled={!form.CostCenter || !form.InvoiceDate || dcaLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">
                                            {!form.CostCenter || !form.InvoiceDate ? 'Select CC & date first'
                                            : dcaLoading ? 'Loading…' : '— Select DCA —'}
                                        </option>
                                        {dcaOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                    <SelectIcon loading={dcaLoading} />
                                </div>
                            </div>

                            {/* Credit Sub DCA */}
                            <div>
                                <Label required>Credit Account Head</Label>
                                <div className="relative">
                                    <select value={form.CreditSubDca} onChange={e => setForm(p => ({ ...p, CreditSubDca: e.target.value }))}
                                        disabled={!form.DCACode || subDcaLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">
                                            {!form.DCACode ? 'Select DCA first' : subDcaLoading ? 'Loading…' : '— Select Credit —'}
                                        </option>
                                        {subDcaOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                    <SelectIcon loading={subDcaLoading} />
                                </div>
                            </div>

                            {/* Debit Sub DCA */}
                            <div>
                                <Label required>Debit Account Head</Label>
                                <div className="relative">
                                    <select value={form.DebitSubDca} onChange={e => setForm(p => ({ ...p, DebitSubDca: e.target.value }))}
                                        disabled={!form.DCACode || subDcaLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">
                                            {!form.DCACode ? 'Select DCA first' : subDcaLoading ? 'Loading…' : '— Select Debit —'}
                                        </option>
                                        {subDcaOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                    <SelectIcon loading={subDcaLoading} />
                                </div>
                            </div>

                            {/* Invoice Amount */}
                            <div>
                                <Label required>Invoice Amount (₹)</Label>
                                <input type="number" min="0" step="0.01" placeholder="0.00"
                                    value={form.InvoiceAmount}
                                    onChange={e => setForm(p => ({ ...p, InvoiceAmount: e.target.value }))}
                                    disabled={isBusy} className={inputCls} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 4: Deduction (only when PAN = Yes) ───────────── */}
                {isPAN && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Minus} title="Deduction Details" subtitle="TDS/deduction applicable when PAN is selected" />
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                {/* Ded CC */}
                                <div>
                                    <Label>Deduction Cost Center</Label>
                                    <div className="relative">
                                        <select value={form.Ded_CC_Code}
                                            onChange={e => setForm(p => ({ ...p, Ded_CC_Code: e.target.value, Ded_DCA_Code: '', Ded_Sub_DCA_Code: '' }))}
                                            disabled={dedCCLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{dedCCLoading ? 'Loading…' : '— Select CC —'}</option>
                                            {dedCCOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                        <SelectIcon loading={dedCCLoading} />
                                    </div>
                                </div>

                                {/* Ded DCA */}
                                <div>
                                    <Label>Deduction DCA</Label>
                                    <div className="relative">
                                        <select value={form.Ded_DCA_Code}
                                            onChange={e => setForm(p => ({ ...p, Ded_DCA_Code: e.target.value, Ded_Sub_DCA_Code: '' }))}
                                            disabled={!form.Ded_CC_Code || dedDcaLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{!form.Ded_CC_Code ? 'Select CC first' : dedDcaLoading ? 'Loading…' : '— Select DCA —'}</option>
                                            {dedDcaOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                        </select>
                                        <SelectIcon loading={dedDcaLoading} />
                                    </div>
                                </div>

                                {/* Ded SubDCA */}
                                <div>
                                    <Label>Deduction Sub DCA</Label>
                                    <div className="relative">
                                        <select value={form.Ded_Sub_DCA_Code}
                                            onChange={e => setForm(p => ({ ...p, Ded_Sub_DCA_Code: e.target.value }))}
                                            disabled={!form.Ded_DCA_Code || dedSubDcaLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{!form.Ded_DCA_Code ? 'Select DCA first' : dedSubDcaLoading ? 'Loading…' : '— Select Sub DCA —'}</option>
                                            {dedSubDcaOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                        </select>
                                        <SelectIcon loading={dedSubDcaLoading} />
                                    </div>
                                </div>

                                {/* Ded Amount */}
                                <div>
                                    <Label>Deduction Amount (₹)</Label>
                                    <input type="number" min="0" step="0.01" placeholder="0.00"
                                        value={form.DedAmount}
                                        onChange={e => setForm(p => ({ ...p, DedAmount: e.target.value }))}
                                        disabled={isBusy} className={inputCls} />
                                </div>
                            </div>

                            {/* Final amount summary */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Invoice Amount', value: invoiceAmt, color: 'indigo' },
                                    { label: 'Deduction Amount', value: dedAmt, color: 'rose' },
                                    { label: 'Final Amount', value: finalAmt, color: 'green' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className={`p-4 rounded-xl border-2 ${
                                        color === 'indigo' ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20'
                                        : color === 'rose' ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20'
                                        : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                    }`}>
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                                            color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400'
                                            : color === 'rose' ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-green-600 dark:text-green-400'
                                        }`}>{label}</p>
                                        <p className="text-xl font-black text-gray-800 dark:text-gray-100">₹ {fmt(value)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section 5: Remarks & Submit ───────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={FileText} title="Remarks & Submission" subtitle="Add remarks and submit the invoice" />
                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <Label>Remarks</Label>
                            <textarea rows={3} placeholder="Enter remarks…"
                                value={form.Remarks}
                                onChange={e => setForm(p => ({ ...p, Remarks: e.target.value }))}
                                disabled={isBusy}
                                className={`${inputCls} resize-none`} />
                        </div>

                        {/* Summary row */}
                        <div className="flex flex-wrap gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <div className="flex-1 min-w-[120px]">
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Cost Center</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">{form.CostCenter || '—'}</p>
                            </div>
                            <div className="flex-1 min-w-[120px]">
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">DCA</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">{form.DCACode || '—'}</p>
                            </div>
                            <div className="flex-1 min-w-[120px]">
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Invoice Date</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">{formatDateForAPI(form.InvoiceDate) || '—'}</p>
                            </div>
                            <div className="flex-1 min-w-[120px]">
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                                    {isPAN ? 'Final Amount' : 'Invoice Amount'}
                                </p>
                                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                    ₹ {fmt(isPAN ? finalAmt : invoiceAmt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={handleSubmit} disabled={isBusy}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-60 transition-all">
                                {isBusy
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                    : <><Send className="h-4 w-4" /> Submit Invoice</>}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GeneralInvoiceCreation;
