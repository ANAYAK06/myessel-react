import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Building2, Landmark, ChevronDown, Loader2,
    RotateCcw, Send, CheckCircle, Search, X,
    Hash, IndianRupee, StickyNote, ListChecks,
    ShieldCheck, Navigation, ChevronRight, ChevronLeft, Eye,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';
import { formatIndianCurrency } from '../../utilities/amountToTextHelper';

import {
    fetchLCVendorCodes,
    fetchPOForVendor,
    fetchBGClientCodes,
    fetchSubClientsForBGClient,
    fetchClientPOsForBG,
    fetchLCBGFDNumbers,
    submitLCBGData,
    clearPOList,
    clearSubClients,
    clearBGPoList,
    clearSaveResult,
    resetLCBGCreation,
    selectLCVendors,
    selectLCVendorsLoading,
    selectPOList,
    selectPOLoading,
    selectBGClients,
    selectBGClientsLoading,
    selectSubClients,
    selectSubClientsLoading,
    selectBGPoList,
    selectBGPoLoading,
    selectFDList,
    selectFDLoading,
    selectLCBGSaveStatus,
    selectLCBGSaveLoading,
    selectLCBGSaveError,
} from '../../slices/accountsSlice/lcbgCreationSlice';

// ── Constants ─────────────────────────────────────────────────────────────────

const LCBG_TYPES = [
    { value: 'LC', label: 'Letter of Credit', icon: FileText,    desc: 'Vendor-based' },
    { value: 'BG', label: 'Bank Guarantee',   icon: ShieldCheck, desc: 'Client-based' },
];

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

// ── Step Indicator ────────────────────────────────────────────────────────────

const STEPS = ['Party & PO', 'LC/BG Details', 'Review'];

const StepIndicator = ({ current }) => (
    <div className="flex items-center">
        {STEPS.map((label, i) => {
            const idx   = i + 1;
            const done  = idx < current;
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
                        <div className={`flex-1 h-0.5 mx-2 mb-4 rounded transition-all ${done ? 'bg-white/60' : 'bg-white/20'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Multi-Select PO Dropdown ──────────────────────────────────────────────────
// valueKey / labelKey allow reuse for both LC (Vendorpos/VendorpoName) and BG (Clientpos/ClientpoName)

const POMultiSelect = ({ poList, loading, selected, onChange, disabled, valueKey = 'Vendorpos', labelKey = 'VendorpoName' }) => {
    const [open, setOpen]     = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = poList.filter(p =>
        p[labelKey]?.toLowerCase().includes(search.toLowerCase())
    );

    const toggleItem = (val) => {
        if (selected.includes(val)) onChange(selected.filter(v => v !== val));
        else onChange([...selected, val]);
    };

    const toggleAll = () => {
        if (selected.length === filtered.length) onChange([]);
        else onChange(filtered.map(p => p[valueKey]));
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled || loading}
                onClick={() => setOpen(o => !o)}
                className={`${inputCls} text-left flex items-center justify-between`}
            >
                <span className={selected.length === 0 ? 'text-gray-400 dark:text-gray-500' : ''}>
                    {loading
                        ? 'Loading POs…'
                        : selected.length === 0
                            ? 'Select PO Numbers'
                            : `${selected.length} PO${selected.length > 1 ? 's' : ''} selected`}
                </span>
                {loading
                    ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" />
                    : <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </button>

            {open && !loading && (
                <div className="absolute z-[9999] mt-1.5 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search PO…"
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-400"
                            />
                        </div>
                    </div>

                    {filtered.length > 0 && (
                        <button
                            type="button"
                            onClick={toggleAll}
                            className="w-full px-3 py-2 text-left text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-gray-100 dark:border-gray-700"
                        >
                            {selected.length === filtered.length ? 'Deselect All' : 'Select All'} ({filtered.length})
                        </button>
                    )}

                    <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="px-3 py-4 text-xs text-gray-400 text-center">No POs found</p>
                        ) : filtered.map((p, i) => (
                            <label
                                key={`${p[valueKey]}_${i}`}
                                className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(p[valueKey])}
                                    onChange={() => toggleItem(p[valueKey])}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{p[labelKey]}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {selected.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {selected.map(v => (
                        <span
                            key={v}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-800"
                        >
                            {v}
                            <button type="button" onClick={() => toggleItem(v)}>
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Review Row ────────────────────────────────────────────────────────────────

const ReviewRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <span className={`text-xs font-semibold text-right max-w-[60%] ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
        </span>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const LCBGCreation = ({ menuData }) => {
    const dispatch     = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Redux ──────────────────────────────────────────────────────────────────
    const vendors           = useSelector(selectLCVendors);
    const vendorsLoading    = useSelector(selectLCVendorsLoading);
    const poList            = useSelector(selectPOList);
    const poLoading         = useSelector(selectPOLoading);
    const bgClients         = useSelector(selectBGClients);
    const bgClientsLoading  = useSelector(selectBGClientsLoading);
    const subClients        = useSelector(selectSubClients);
    const subClientsLoading = useSelector(selectSubClientsLoading);
    const bgPoList          = useSelector(selectBGPoList);
    const bgPoLoading       = useSelector(selectBGPoLoading);
    const fdList            = useSelector(selectFDList);
    const fdLoading         = useSelector(selectFDLoading);
    const saveStatus        = useSelector(selectLCBGSaveStatus);
    const saveLoading       = useSelector(selectLCBGSaveLoading);
    const saveError         = useSelector(selectLCBGSaveError);

    // ── Step 1: Party & PO ─────────────────────────────────────────────────────
    const [step,          setStep]          = useState(1);
    const [lcbgType,      setLcbgType]      = useState('LC');
    const [vendorCode,    setVendorCode]    = useState('');
    const [clientCode,    setClientCode]    = useState('');
    const [subClientCode, setSubClientCode] = useState('');
    const [selectedPOs,   setSelectedPOs]   = useState([]);
    const [fdNo,          setFdNo]          = useState('');

    // ── Step 2: Details ────────────────────────────────────────────────────────
    const [lcbgNo,       setLcbgNo]       = useState('');
    const [openingDate,  setOpeningDate]   = useState(null);
    const [validityDate, setValidityDate]  = useState(null);
    const [tolerance,    setTolerance]     = useState('');
    const [basicValue,   setBasicValue]    = useState('');
    const [gstValue,     setGstValue]      = useState('');
    const [charges,      setCharges]       = useState('');
    const [lcbgRemarks,  setLcbgRemarks]   = useState('');
    const [bankRemarks,  setBankRemarks]   = useState('');

    const totalValue = (
        (parseFloat(basicValue) || 0) +
        (parseFloat(gstValue)   || 0) +
        (parseFloat(charges)    || 0)
    ).toFixed(2);

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchLCVendorCodes({ RoleId: roleId, Userid: userId }));
        dispatch(fetchBGClientCodes({ RoleId: roleId, Userid: userId }));
        dispatch(fetchLCBGFDNumbers());
        return () => dispatch(resetLCBGCreation());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Reset party + POs when type changes
    useEffect(() => {
        setVendorCode(''); setClientCode(''); setSubClientCode('');
        setSelectedPOs([]);
        dispatch(clearPOList());
        dispatch(clearSubClients());
        dispatch(clearBGPoList());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lcbgType]);

    // LC — fetch POs when vendor changes
    useEffect(() => {
        if (lcbgType !== 'LC') return;
        if (!vendorCode) { dispatch(clearPOList()); setSelectedPOs([]); return; }
        dispatch(fetchPOForVendor({ VendorCode: vendorCode }));
        setSelectedPOs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vendorCode]);

    // BG — fetch sub-clients when client changes
    useEffect(() => {
        if (lcbgType !== 'BG') return;
        setSubClientCode('');
        setSelectedPOs([]);
        dispatch(clearSubClients());
        dispatch(clearBGPoList());
        if (!clientCode) return;
        dispatch(fetchSubClientsForBGClient({ ClientCode: clientCode }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientCode]);

    // BG — fetch client POs when sub-client changes
    useEffect(() => {
        if (lcbgType !== 'BG') return;
        setSelectedPOs([]);
        dispatch(clearBGPoList());
        if (!clientCode || !subClientCode) return;
        dispatch(fetchClientPOsForBG({ ClientCode: clientCode, Subclient: subClientCode }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subClientCode]);

    // Handle save result
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('LC/BG data submitted successfully!');
            handleReset();
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Submission failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Validation ─────────────────────────────────────────────────────────────
    const validateStep1 = useCallback(() => {
        if (lcbgType === 'LC' && !vendorCode)   { toast.warn('Please select a vendor.');         return false; }
        if (lcbgType === 'BG' && !clientCode)    { toast.warn('Please select a client.');         return false; }
        if (lcbgType === 'BG' && !subClientCode) { toast.warn('Please select a sub-client.');     return false; }
        if (selectedPOs.length === 0)             { toast.warn('Please select at least one PO.');  return false; }
        return true;
    }, [lcbgType, vendorCode, clientCode, subClientCode, selectedPOs]);

    const validateStep2 = useCallback(() => {
        if (!lcbgNo.trim())  { toast.warn('Please enter the LC/BG number.');   return false; }
        if (!openingDate)     { toast.warn('Please select the opening date.');  return false; }
        if (!validityDate)    { toast.warn('Please select the validity date.'); return false; }
        if (!basicValue || parseFloat(basicValue) <= 0) {
            toast.warn('Please enter a valid basic value.'); return false;
        }
        return true;
    }, [lcbgNo, openingDate, validityDate, basicValue]);

    // ── Navigation ─────────────────────────────────────────────────────────────
    const goNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep(s => s + 1);
    };
    const goBack = () => setStep(s => s - 1);

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        dispatch(submitLCBGData({
            LCBGType:      lcbgType,
            VendorCode:    lcbgType === 'LC' ? vendorCode    : '',
            PONO:          selectedPOs.join(','),
            ClientCode:    lcbgType === 'BG' ? clientCode    : '',
            SubClientCode: lcbgType === 'BG' ? subClientCode : '',
            LCBGno:        lcbgNo,
            OpeningDate:   formatDateForAPI(openingDate),
            ValidityDate:  formatDateForAPI(validityDate),
            Tolerance:     String(tolerance || '0'),
            FD:            fdNo || '',
            BasicValue:    String(basicValue || '0'),
            GSTValue:      String(gstValue   || '0'),
            Charges:       String(charges    || '0'),
            TotalValue:    String(totalValue),
            LCBGRemarks:   lcbgRemarks || '',
            BankRemarks:   bankRemarks || '',
            Polength:      parseInt(selectedPOs.length, 10),
            CreatedBy:     userName,
            RoleId:        parseInt(roleId, 10),
        }));
    };

    // ── Reset ──────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setStep(1); setLcbgType('LC');
        setVendorCode(''); setClientCode(''); setSubClientCode('');
        setSelectedPOs([]); setFdNo('');
        setLcbgNo(''); setOpeningDate(null); setValidityDate(null);
        setTolerance(''); setBasicValue(''); setGstValue(''); setCharges('');
        setLcbgRemarks(''); setBankRemarks('');
        dispatch(resetLCBGCreation());
        dispatch(fetchLCVendorCodes({ RoleId: roleId, Userid: userId }));
        dispatch(fetchBGClientCodes({ RoleId: roleId, Userid: userId }));
        dispatch(fetchLCBGFDNumbers());
    };

    const selectedVendor    = vendors.find(v => v.VendorCode === vendorCode);
    const selectedClient    = bgClients.find(c => c.ClientCode === clientCode);
    const selectedSubClient = subClients.find(s => s.SubClientCode === subClientCode);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    {/* Decorative bg */}
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
                                    {menuData?.name || 'LC / BG Creation'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Letter of Credit &amp; Bank Guarantee</p>
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
                                    <p className="text-sm font-bold text-white">Purchase / LCBG</p>
                                </div>
                                <Navigation className="h-5 w-5 opacity-60" />
                            </div>
                        </div>
                    </div>

                    {/* Step Indicator */}
                    <div className="relative">
                        <StepIndicator current={step} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── STEP 1: Party & PO ────────────────────────────────────── */}
                {step === 1 && (
                    <>
                        {/* Type + Party Selection */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader
                                icon={Building2}
                                title="Instrument Type & Party"
                                subtitle="Select LC or BG and the associated vendor / client"
                            />
                            <div className="p-6 md:p-8">
                                <InnerHeader icon={Building2} title="Type Selection" subtitle="Choose Letter of Credit or Bank Guarantee" />

                                {/* Type Toggle */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {LCBG_TYPES.map(t => {
                                        const Icon   = t.icon;
                                        const active = lcbgType === t.value;
                                        return (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => setLcbgType(t.value)}
                                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all
                                                    ${active
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
                                            >
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                    <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                                                </div>
                                                <div className="text-left">
                                                    <div>{t.label}</div>
                                                    <div className="text-xs font-normal text-gray-400 mt-0.5">{t.desc}</div>
                                                </div>
                                                {active && <CheckCircle className="h-4 w-4 text-indigo-500 ml-auto" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Party fields */}
                                {lcbgType === 'LC' ? (
                                    <div>
                                        <Label required>Vendor</Label>
                                        <div className="relative">
                                            <select
                                                value={vendorCode}
                                                onChange={e => setVendorCode(e.target.value)}
                                                className={`${inputCls} appearance-none pr-10`}
                                                disabled={vendorsLoading}
                                            >
                                                <option value="">
                                                    {vendorsLoading ? 'Loading vendors…' : '— Select Vendor —'}
                                                </option>
                                                {vendors.map((v, i) => (
                                                    <option key={`${v.VendorCode}_${i}`} value={v.VendorCode}>{v.VendorName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={vendorsLoading} />
                                        </div>
                                        {selectedVendor && (
                                            <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">{selectedVendor.VendorName}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* BG Client */}
                                        <div>
                                            <Label required>Client</Label>
                                            <div className="relative">
                                                <select
                                                    value={clientCode}
                                                    onChange={e => setClientCode(e.target.value)}
                                                    className={`${inputCls} appearance-none pr-10`}
                                                    disabled={bgClientsLoading}
                                                >
                                                    <option value="">
                                                        {bgClientsLoading ? 'Loading clients…' : '— Select Client —'}
                                                    </option>
                                                    {bgClients.map((c, i) => (
                                                        <option key={`cl_${c.ClientCode}_${i}`} value={c.ClientCode}>{c.ClientName}</option>
                                                    ))}
                                                </select>
                                                <SelectIcon loading={bgClientsLoading} />
                                            </div>
                                            {selectedClient && (
                                                <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">{selectedClient.ClientName}</p>
                                            )}
                                        </div>
                                        {/* BG Sub-Client (cascades from Client) */}
                                        <div>
                                            <Label required>Sub-Client</Label>
                                            <div className="relative">
                                                <select
                                                    value={subClientCode}
                                                    onChange={e => setSubClientCode(e.target.value)}
                                                    className={`${inputCls} appearance-none pr-10`}
                                                    disabled={!clientCode || subClientsLoading}
                                                >
                                                    <option value="">
                                                        {!clientCode
                                                            ? 'Select client first'
                                                            : subClientsLoading
                                                                ? 'Loading sub-clients…'
                                                                : '— Select Sub-Client —'}
                                                    </option>
                                                    {subClients.map((s, i) => (
                                                        <option key={`scl_${s.SubClientCode}_${i}`} value={s.SubClientCode}>{s.SubClientName}</option>
                                                    ))}
                                                </select>
                                                <SelectIcon loading={subClientsLoading} />
                                            </div>
                                            {selectedSubClient && (
                                                <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">{selectedSubClient.SubClientName}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PO Multi-Select */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader
                                icon={ListChecks}
                                title="Purchase Order Numbers"
                                subtitle="Select one or more PO numbers (multi-select)"
                            />
                            <div className="p-6 md:p-8">
                                <InnerHeader icon={ListChecks} title="PO Selection" subtitle="Search and select applicable PO numbers" />
                                <Label required>PO Numbers</Label>
                                {lcbgType === 'LC' ? (
                                    <>
                                        <POMultiSelect
                                            poList={poList}
                                            loading={poLoading}
                                            selected={selectedPOs}
                                            onChange={setSelectedPOs}
                                            disabled={!vendorCode}
                                            valueKey="Vendorpos"
                                            labelKey="VendorpoName"
                                        />
                                        {!vendorCode && (
                                            <p className="mt-2 text-xs text-amber-500">Select a vendor first to load PO numbers.</p>
                                        )}
                                        {vendorCode && !poLoading && poList.length === 0 && (
                                            <p className="mt-2 text-xs text-gray-400">No PO numbers found for this vendor.</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <POMultiSelect
                                            poList={bgPoList}
                                            loading={bgPoLoading}
                                            selected={selectedPOs}
                                            onChange={setSelectedPOs}
                                            disabled={!clientCode || !subClientCode}
                                            valueKey="Clientpos"
                                            labelKey="ClientpoName"
                                        />
                                        {(!clientCode || !subClientCode) && (
                                            <p className="mt-2 text-xs text-amber-500">
                                                {!clientCode ? 'Select a client first.' : 'Select a sub-client to load PO numbers.'}
                                            </p>
                                        )}
                                        {clientCode && subClientCode && !bgPoLoading && bgPoList.length === 0 && (
                                            <p className="mt-2 text-xs text-gray-400">No PO numbers found.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* FD Number */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={Hash} title="FD Number" subtitle="Fixed Deposit reference — optional" />
                            <div className="p-6 md:p-8">
                                <InnerHeader icon={Hash} title="Fixed Deposit" subtitle="Link an FD number if applicable" />
                                <Label>FD Number <span className="text-xs font-normal text-gray-400 normal-case">(optional)</span></Label>
                                <div className="relative">
                                    <select
                                        value={fdNo}
                                        onChange={e => setFdNo(e.target.value)}
                                        className={`${inputCls} appearance-none pr-10`}
                                        disabled={fdLoading}
                                    >
                                        <option value="">{fdLoading ? 'Loading…' : '— None —'}</option>
                                        {fdList.map(fd => (
                                            <option key={fd.Fdid} value={fd.Fdid}>{fd.FdVal}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={fdLoading} />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── STEP 2: LC/BG Details ─────────────────────────────────── */}
                {step === 2 && (
                    <>
                        {/* Reference & Dates */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={Hash} title="Reference & Dates" subtitle="LC/BG number and validity period" />
                            <div className="p-6 md:p-8">
                                <InnerHeader icon={Hash} title="Reference Details" subtitle="Enter the instrument number and relevant dates" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <Label required>{lcbgType === 'LC' ? 'LC' : 'BG'} Number</Label>
                                        <input
                                            type="text"
                                            value={lcbgNo}
                                            onChange={e => setLcbgNo(e.target.value)}
                                            placeholder={`Enter ${lcbgType} number`}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <Label required>Opening Date</Label>
                                        <CustomDatePicker
                                            value={openingDate}
                                            onChange={setOpeningDate}
                                            format="DD-MMM-YYYY"
                                            placeholder="Select opening date"
                                        />
                                    </div>
                                    <div>
                                        <Label required>Validity Date</Label>
                                        <CustomDatePicker
                                            value={validityDate}
                                            onChange={setValidityDate}
                                            format="DD-MMM-YYYY"
                                            placeholder="Select validity date"
                                            minDate={openingDate}
                                        />
                                    </div>
                                    <div>
                                        <Label>Tolerance (%)</Label>
                                        <input
                                            type="number"
                                            value={tolerance}
                                            onChange={e => setTolerance(e.target.value)}
                                            placeholder="0.00"
                                            min="0" max="100" step="0.01"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Values */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={IndianRupee} title="Financial Values" subtitle="All amounts in INR" />
                            <div className="p-6 md:p-8">
                                <InnerHeader icon={IndianRupee} title="Amount Breakdown" subtitle="Enter basic value, GST and charges" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-5">
                                    <div>
                                        <Label required>Basic Value</Label>
                                        <input
                                            type="number"
                                            value={basicValue}
                                            onChange={e => setBasicValue(e.target.value)}
                                            placeholder="0.00"
                                            min="0" step="0.01"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <Label>GST Value</Label>
                                        <input
                                            type="number"
                                            value={gstValue}
                                            onChange={e => setGstValue(e.target.value)}
                                            placeholder="0.00"
                                            min="0" step="0.01"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <Label>Charges</Label>
                                        <input
                                            type="number"
                                            value={charges}
                                            onChange={e => setCharges(e.target.value)}
                                            placeholder="0.00"
                                            min="0" step="0.01"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <Label>Total Value</Label>
                                        <div className={`${inputCls} bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold cursor-default`}>
                                            ₹ {parseFloat(totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                {parseFloat(totalValue) > 0 && (
                                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Total {lcbgType} Value</span>
                                        <span className="text-base font-black text-indigo-800 dark:text-indigo-200">
                                            ₹ {parseFloat(totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader icon={StickyNote} title="Remarks" subtitle="LC/BG and bank remarks" />
                            <div className="p-6 md:p-8">
                                <InnerHeader icon={StickyNote} title="Remarks" subtitle="Add any relevant notes" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>{lcbgType} Remarks</Label>
                                        <textarea
                                            value={lcbgRemarks}
                                            onChange={e => setLcbgRemarks(e.target.value)}
                                            rows={3}
                                            placeholder={`Enter ${lcbgType} remarks…`}
                                            className={`${inputCls} resize-none`}
                                        />
                                    </div>
                                    <div>
                                        <Label>Bank Remarks</Label>
                                        <textarea
                                            value={bankRemarks}
                                            onChange={e => setBankRemarks(e.target.value)}
                                            rows={3}
                                            placeholder="Enter bank remarks…"
                                            className={`${inputCls} resize-none`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── STEP 3: Review & Submit ───────────────────────────────── */}
                {step === 3 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader icon={Eye} title="Review & Submit" subtitle="Verify all details before submitting" />
                        <div className="p-6 md:p-8">
                            <InnerHeader icon={Eye} title="Submission Summary" subtitle="Please review all information carefully" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Party &amp; PO</h3>
                                    <ReviewRow label="Type"    value={lcbgType === 'LC' ? 'Letter of Credit' : 'Bank Guarantee'} highlight />
                                    {lcbgType === 'LC'
                                        ? <ReviewRow label="Vendor"      value={selectedVendor?.VendorName         || vendorCode} />
                                        : <>
                                            <ReviewRow label="Client"     value={selectedClient?.ClientName       || clientCode} />
                                            <ReviewRow label="Sub-Client" value={selectedSubClient?.SubClientName || subClientCode || '—'} />
                                          </>}
                                    <ReviewRow label="POs Selected" value={`${selectedPOs.length} PO(s)`} />
                                    <ReviewRow label="FD Number"    value={fdNo || 'Not selected'} />
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Reference &amp; Dates</h3>
                                    <ReviewRow label={`${lcbgType} Number`} value={lcbgNo} highlight />
                                    <ReviewRow label="Opening Date"  value={formatDateForAPI(openingDate)} />
                                    <ReviewRow label="Validity Date" value={formatDateForAPI(validityDate)} />
                                    <ReviewRow label="Tolerance"     value={tolerance ? `${tolerance}%` : '0%'} />
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Financial Values</h3>
                                    <ReviewRow label="Basic Value" value={`₹ ${parseFloat(basicValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                                    <ReviewRow label="GST Value"   value={`₹ ${parseFloat(gstValue   || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                                    <ReviewRow label="Charges"     value={`₹ ${parseFloat(charges    || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                                    <ReviewRow label="Total Value" value={`₹ ${parseFloat(totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} highlight />
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Remarks</h3>
                                    <ReviewRow label={`${lcbgType} Remarks`} value={lcbgRemarks} />
                                    <ReviewRow label="Bank Remarks"          value={bankRemarks} />
                                </div>
                            </div>

                            {/* Selected POs */}
                            {selectedPOs.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Selected PO Numbers</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedPOs.map(po => (
                                            <span key={po} className="px-2 py-0.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium border border-violet-100 dark:border-violet-800">
                                                {po}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Navigation Buttons ────────────────────────────────────── */}
                <div className="flex items-center justify-between pb-6">
                    <button
                        type="button"
                        onClick={step === 1 ? handleReset : goBack}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        {step === 1 ? <RotateCcw className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        {step === 1 ? 'Reset' : 'Back'}
                    </button>

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saveLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saveLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                : <><Send className="h-4 w-4" /> Submit</>}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LCBGCreation;
