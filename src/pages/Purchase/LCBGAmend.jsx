import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, ShieldCheck, ChevronDown, Loader2, RotateCcw,
    Send, CheckCircle, IndianRupee, Building2, Eye,
    Navigation, PenLine, Hash, StickyNote,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchLCBGCodes, fetchLCBGVendorClient, submitLCBGAmend,
    clearCodes, clearDetails, clearSaveResult, resetLCBGAmend,
    selectLCBGCodes, selectLCBGCodesLoading,
    selectLCBGDetails, selectLCBGDetailsLoading, selectLCBGDetailsError,
    selectLCBGAmendSaveStatus, selectLCBGAmendSaveLoading, selectLCBGAmendSaveError,
} from '../../slices/purchaseSlice/lcbgAmendSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const LCBG_TYPES   = ['LC', 'BG'];
const LCBG_TYPE_LABELS = { LC: 'Letter of Credit', BG: 'Bank Guarantee' };
const LCBG_STATUSES = ['Amend', 'Close'];

const STEPS = ['Select LC/BG', 'Enter Details', 'Review & Submit'];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Helpers ────────────────────────────────────────────────────────────────────

// Convert Date object → "DD-Mon-YYYY" string for the API payload
const formatDateForAPI = (val) => {
    if (!val) return '';
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const fmt = (n) => {
    const num = parseFloat(n);
    if (!n && n !== 0) return '—';
    if (isNaN(num)) return '—';
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

const ChipGroup = ({ options, value, onChange, labelMap, colorActive = 'indigo' }) => {
    const colors = {
        indigo: 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30',
        violet: 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/30',
    };
    return (
        <div className="flex gap-3">
            {options.map((opt) => (
                <button key={opt} type="button" onClick={() => onChange(opt)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        value === opt
                            ? colors[colorActive]
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}>
                    {labelMap ? labelMap[opt] : opt}
                </button>
            ))}
        </div>
    );
};

// Step indicator — white circles inside the gradient header banner
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
                        <div className={`flex-1 h-0.5 mx-2 mb-4 rounded transition-all ${done ? 'bg-white/60' : 'bg-white/20'}`} />
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

const LCBGAmend = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const codes          = useSelector(selectLCBGCodes);
    const codesLoading   = useSelector(selectLCBGCodesLoading);
    const details        = useSelector(selectLCBGDetails);
    const detailsLoading = useSelector(selectLCBGDetailsLoading);
    const detailsError   = useSelector(selectLCBGDetailsError);
    const saveStatus     = useSelector(selectLCBGAmendSaveStatus);
    const saveLoading    = useSelector(selectLCBGAmendSaveLoading);
    const saveError      = useSelector(selectLCBGAmendSaveError);

    // step uses 1-based indexing (1, 2, 3)
    const [step, setStep]           = useState(1);
    const [lcbgType,   setLcbgType]   = useState('');   // 'LC' | 'BG'
    const [lcbgStatus, setLcbgStatus] = useState('');   // 'Amend' | 'Close'
    const [selectedCode, setSelectedCode] = useState(null); // { LCBGID, LCBGVAL }

    const [amendDate,   setAmendDate]   = useState(null);
    const [closeDate,   setCloseDate]   = useState(null);
    const [tolerance,   setTolerance]   = useState('');
    const [basicValue,  setBasicValue]  = useState('');
    const [gstValue,    setGstValue]    = useState('');
    const [charges,     setCharges]     = useState('');
    const [totalValue,  setTotalValue]  = useState('');
    const [lcbgRemarks, setLcbgRemarks] = useState('');
    const [bankRemarks, setBankRemarks] = useState('');

    const [submitted, setSubmitted] = useState(false);

    // ── Effects ───────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => { dispatch(resetLCBGAmend()); };
    }, [dispatch]);

    // Fetch codes when both type and status chosen
    useEffect(() => {
        if (lcbgType && lcbgStatus) {
            dispatch(clearDetails());
            setSelectedCode(null);
            dispatch(fetchLCBGCodes({ LCBGType: lcbgType, LCBGStatus: lcbgStatus }));
        } else {
            dispatch(clearCodes());
            dispatch(clearDetails());
            setSelectedCode(null);
        }
    }, [lcbgType, lcbgStatus, dispatch]);

    // Fetch vendor/client details on code selection
    useEffect(() => {
        if (selectedCode) {
            dispatch(fetchLCBGVendorClient({
                LCBGNo:   selectedCode.LCBGVAL,
                LCBGNoId: selectedCode.LCBGID,
            }));
        } else {
            dispatch(clearDetails());
        }
    }, [selectedCode, dispatch]);

    // Auto-compute total for amendment
    useEffect(() => {
        if (lcbgStatus === 'Amend') {
            const b = parseFloat(basicValue) || 0;
            const g = parseFloat(gstValue)   || 0;
            const c = parseFloat(charges)    || 0;
            setTotalValue((b + g + c).toFixed(2));
        }
    }, [basicValue, gstValue, charges, lcbgStatus]);

    // Toast on save result
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('LC/BG ' + (lcbgStatus === 'Amend' ? 'Amendment' : 'Closure') + ' saved successfully!');
            setSubmitted(true);
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleTypeChange = (val) => {
        setLcbgType(val);
        setLcbgStatus('');
        setSelectedCode(null);
    };

    const handleStatusChange = (val) => {
        setLcbgStatus(val);
        setSelectedCode(null);
        setAmendDate(null); setCloseDate(null); setTolerance('');
        setBasicValue(''); setGstValue(''); setCharges(''); setTotalValue('');
        setLcbgRemarks(''); setBankRemarks('');
    };

    const handleCodeChange = (e) => {
        const id    = e.target.value;
        const found = codes.find(c => String(c.LCBGID) === String(id));
        setSelectedCode(found || null);
        setAmendDate(null); setCloseDate(null); setTolerance('');
        setBasicValue(''); setGstValue(''); setCharges(''); setTotalValue('');
        setLcbgRemarks(''); setBankRemarks('');
    };

    const handleReset = useCallback(() => {
        setStep(1);
        setLcbgType('');
        setLcbgStatus('');
        setSelectedCode(null);
        setAmendDate(null); setCloseDate(null); setTolerance('');
        setBasicValue(''); setGstValue(''); setCharges(''); setTotalValue('');
        setLcbgRemarks(''); setBankRemarks('');
        setSubmitted(false);
        dispatch(resetLCBGAmend());
    }, [dispatch]);

    const handleSubmit = () => {
        const roleId    = userData?.roleId    || userData?.RID    || 0;
        const createdBy = userData?.empCode   || userData?.userId || userData?.UID || '';

        const payload = {
            LCBGType:       lcbgType,
            LCBGStatusType: lcbgStatus,
            LCBGId:         parseInt(selectedCode?.LCBGID, 10) || 0,
            LCBGNo:         selectedCode?.LCBGVAL || '',
            AmendDate:      lcbgStatus === 'Amend' ? formatDateForAPI(amendDate) : '',
            CloseDate:      lcbgStatus === 'Close' ? formatDateForAPI(closeDate) : '',
            Tolerance:      lcbgStatus === 'Amend' ? (tolerance  || '0') : '0',
            BasicValue:     lcbgStatus === 'Amend' ? (basicValue || '0') : '0',
            GSTValue:       lcbgStatus === 'Amend' ? (gstValue   || '0') : '0',
            Charges:        lcbgStatus === 'Amend' ? (charges    || '0') : '0',
            TotalValue:     lcbgStatus === 'Amend' ? (totalValue || '0') : '0',
            LCBGRemarks:    lcbgRemarks,
            BankRemarks:    lcbgStatus === 'Amend' ? bankRemarks : '',
            CreatedBy:      String(createdBy),
            RoleId:         roleId,
        };

        dispatch(submitLCBGAmend(payload));
    };

    // ── Validation gates ──────────────────────────────────────────────────────

    const step1Valid = lcbgType && lcbgStatus && selectedCode && details && !detailsLoading;

    const step2Valid = (() => {
        if (!details) return false;
        if (lcbgStatus === 'Amend') return amendDate instanceof Date && parseFloat(basicValue) > 0;
        return closeDate instanceof Date;
    })();

    // ── Success screen ────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-sm w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                        {lcbgStatus === 'Amend' ? 'Amendment Saved' : 'Closure Recorded'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        LC/BG {lcbgStatus === 'Amend' ? 'amendment' : 'closure'} has been submitted successfully.
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
                    {/* Decorative bg */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <PenLine className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Purchase Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'LC / BG Amendment & Closure'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Amend or close an existing Letter of Credit / Bank Guarantee</p>
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
                                    <p className="text-sm font-bold text-white">Purchase / LC BG</p>
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

                {/* ── STEP 1: Select LC/BG ──────────────────────────────────── */}
                {step === 1 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader
                            icon={FileText}
                            title="Select LC / BG"
                            subtitle="Choose the instrument type, action, and reference number"
                        />
                        <div className="p-6 md:p-8 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Type */}
                                <div>
                                    <Label required>LC / BG Type</Label>
                                    <ChipGroup
                                        options={LCBG_TYPES}
                                        value={lcbgType}
                                        onChange={handleTypeChange}
                                        labelMap={LCBG_TYPE_LABELS}
                                        colorActive="indigo"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <Label required>Action</Label>
                                    <ChipGroup
                                        options={LCBG_STATUSES}
                                        value={lcbgStatus}
                                        onChange={handleStatusChange}
                                        colorActive="violet"
                                    />
                                </div>
                            </div>

                            {/* LC/BG Number — shown when both type + status selected */}
                            {lcbgType && lcbgStatus && (
                                <div className="max-w-md">
                                    <Label required>LC / BG Number</Label>
                                    <div className="relative">
                                        <select
                                            className={inputCls}
                                            value={selectedCode?.LCBGID || ''}
                                            onChange={handleCodeChange}
                                            disabled={codesLoading}>
                                            <option value="">{codesLoading ? 'Loading…' : codes.length === 0 ? 'No records found' : '— Select LC/BG No —'}</option>
                                            {codes.map(c => (
                                                <option key={c.LCBGID} value={c.LCBGID}>{c.LCBGVAL}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={codesLoading} />
                                    </div>

                                    {detailsLoading && (
                                        <p className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching details…
                                        </p>
                                    )}
                                    {detailsError && (
                                        <p className="mt-2 text-xs text-rose-500">{detailsError}</p>
                                    )}
                                </div>
                            )}

                            {/* Quick preview card */}
                            {details && !detailsLoading && (
                                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5" /> Reference Info
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{details.VendorCode ? 'Vendor' : 'Client'}</p>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{details.VendorCode || details.ClientCode || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">PO Number</p>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{details.PONO || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Prev Total</p>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fmt(details.PrevSumTotalValue)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Prev Balance</p>
                                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{fmt(details.PrevBalance)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Next */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!step1Valid}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    Continue
                                    <CheckCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Enter Details ──────────────────────────────────── */}
                {step === 2 && (
                    <>
                        {/* Previous amounts — read-only summary */}
                        {details && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <SectionHeader icon={Building2} title="LC / BG Reference" subtitle="Previous record details" />
                                <div className="p-6 md:p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <Label>{details.VendorCode ? 'Vendor' : 'Client'}</Label>
                                            <div className={readonlyCls}>{details.VendorCode || details.ClientCode || '—'}</div>
                                        </div>
                                        <div>
                                            <Label>PO Number</Label>
                                            <div className={readonlyCls}>{details.PONO || '—'}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { lbl: 'Prev Basic',   val: details.PrevSumBasicValue },
                                            { lbl: 'Prev GST',     val: details.PrevSumGSTValue   },
                                            { lbl: 'Prev Charges', val: details.PrevSumCharges    },
                                            { lbl: 'Prev Balance', val: details.PrevBalance,       hi: true },
                                        ].map(({ lbl, val, hi }) => (
                                            <div key={lbl} className={`p-3 rounded-xl text-center border ${hi ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-700'}`}>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{lbl}</p>
                                                <p className={`text-sm font-bold ${hi ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>{fmt(val)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Input fields card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <SectionHeader
                                icon={lcbgStatus === 'Amend' ? IndianRupee : StickyNote}
                                title={lcbgStatus === 'Amend' ? 'Amendment Details' : 'Closure Details'}
                                subtitle={lcbgStatus === 'Amend' ? 'Enter amendment date and revised values' : 'Enter the closing date and remarks'}
                            />
                            <div className="p-6 md:p-8 space-y-6">

                                {/* Date + Tolerance row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {lcbgStatus === 'Amend' ? (
                                        <>
                                            <div>
                                                <Label required>Amendment Date</Label>
                                                <CustomDatePicker
                                                    value={amendDate}
                                                    onChange={setAmendDate}
                                                    format="DD-MMM-YYYY"
                                                    placeholder="Select date"
                                                />
                                            </div>
                                            <div>
                                                <Label>Tolerance (%)</Label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className={inputCls}
                                                    placeholder="0.00"
                                                    value={tolerance}
                                                    onChange={e => setTolerance(e.target.value)}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <Label required>Closing Date</Label>
                                            <CustomDatePicker
                                                value={closeDate}
                                                onChange={setCloseDate}
                                                format="DD-MMM-YYYY"
                                                placeholder="Select date"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Value inputs — Amendment only */}
                                {lcbgStatus === 'Amend' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <Label required>Basic Value (₹)</Label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className={inputCls}
                                                placeholder="0.00"
                                                value={basicValue}
                                                onChange={e => setBasicValue(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>GST Value (₹)</Label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className={inputCls}
                                                placeholder="0.00"
                                                value={gstValue}
                                                onChange={e => setGstValue(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Charges (₹)</Label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className={inputCls}
                                                placeholder="0.00"
                                                value={charges}
                                                onChange={e => setCharges(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Total Value (₹)</Label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    readOnly
                                                    className={readonlyCls + ' pr-10'}
                                                    value={totalValue}
                                                    placeholder="Auto-computed"
                                                />
                                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                    <Hash className="h-3.5 w-3.5 text-gray-400" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">Basic + GST + Charges</p>
                                        </div>
                                    </div>
                                )}

                                {/* Remarks */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>LC / BG Remarks</Label>
                                        <textarea
                                            rows={3}
                                            className={inputCls + ' resize-none'}
                                            placeholder="Enter remarks…"
                                            value={lcbgRemarks}
                                            onChange={e => setLcbgRemarks(e.target.value)}
                                        />
                                    </div>
                                    {lcbgStatus === 'Amend' && (
                                        <div>
                                            <Label>Bank Remarks</Label>
                                            <textarea
                                                rows={3}
                                                className={inputCls + ' resize-none'}
                                                placeholder="Enter bank remarks…"
                                                value={bankRemarks}
                                                onChange={e => setBankRemarks(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-between pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        disabled={!step2Valid}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                        <Eye className="h-4 w-4" />
                                        Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── STEP 3: Review & Submit ────────────────────────────────── */}
                {step === 3 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader
                            icon={Eye}
                            title="Review & Submit"
                            subtitle="Confirm all details before submitting"
                        />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left column */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Instrument</p>
                                    <ReviewRow label="Type"      value={LCBG_TYPE_LABELS[lcbgType] || lcbgType} />
                                    <ReviewRow label="Action"    value={lcbgStatus} highlight />
                                    <ReviewRow label="LC/BG No"  value={selectedCode?.LCBGVAL} />
                                    {details?.VendorCode && <ReviewRow label="Vendor" value={details.VendorCode} />}
                                    {details?.ClientCode && <ReviewRow label="Client" value={details.ClientCode} />}
                                    {details?.PONO       && <ReviewRow label="PO No"  value={details.PONO}      />}
                                </div>

                                {/* Right column */}
                                <div className="bg-gray-50/60 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                        {lcbgStatus === 'Amend' ? 'Amendment Values' : 'Closure'}
                                    </p>
                                    {lcbgStatus === 'Amend' ? (
                                        <>
                                            <ReviewRow label="Amendment Date" value={formatDateForAPI(amendDate)} highlight />
                                            {tolerance && <ReviewRow label="Tolerance (%)" value={tolerance} />}
                                            <ReviewRow label="Basic Value"  value={fmt(basicValue)} />
                                            <ReviewRow label="GST Value"    value={fmt(gstValue)}   />
                                            <ReviewRow label="Charges"      value={fmt(charges)}    />
                                            <ReviewRow label="Total Value"  value={fmt(totalValue)} highlight />
                                            {bankRemarks  && <ReviewRow label="Bank Remarks" value={bankRemarks} />}
                                        </>
                                    ) : (
                                        <ReviewRow label="Closing Date" value={formatDateForAPI(closeDate)} highlight />
                                    )}
                                    {lcbgRemarks && <ReviewRow label="Remarks" value={lcbgRemarks} />}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={saveLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 disabled:opacity-40 transition-all">
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={saveLoading}
                                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    {saveLoading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                                    ) : (
                                        <><Send className="h-4 w-4" /> Submit</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LCBGAmend;
