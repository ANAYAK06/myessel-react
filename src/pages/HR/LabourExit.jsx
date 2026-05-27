import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchLabourForExit,
    fetchLBContractors,
    fetchLabourDataForExit,
    fetchLBRelieveDate,
    saveLabourExit,
    clearLabourSearchList,
    clearLabourData,
    clearSaveResult,
    resetAll,
    selectLabourSearchList,
    selectContractors,
    selectLabourData,
    selectRelieveDate,
    selectSaveStatus,
    selectSaveError,
    selectSaveLoading,
    selectLabourSearchLoading,
    selectLabourDataLoading,
    selectRelieveDateLoading,
} from '../../slices/HRSlice/labourExitSlice';

import {
    Search, LogOut, Calendar, MessageSquare,
    User, Building2, Loader2, CheckCircle,
    AlertCircle, X, RotateCcw, Send,
    FileText, Upload, Trash2, Navigation,
    Briefcase, HardHat, Hash,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDateForAPI = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(date)) return date;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
        const [yyyy, mm, dd] = date.split('T')[0].split('-');
        return `${dd}-${MONTH_ABBR[parseInt(mm, 10) - 1]}-${yyyy}`;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const serializeDate = (val) => {
    if (!val) return '';
    if (val instanceof Date) {
        const yyyy = val.getFullYear();
        const mm = String(val.getMonth() + 1).padStart(2, '0');
        const dd = String(val.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    return String(val);
};

const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const getDocType = (file) => {
    if (!file) return '';
    return file.name.split('.').pop().toLowerCase();
};

// ─── Style helpers ────────────────────────────────────────────────────────────
const inputCls = (error, touched) =>
    `w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
     focus:outline-none focus:ring-2 transition-all duration-150
     ${touched && error
        ? 'border-rose-300 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-900/30'
        : 'border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-teal-100 dark:focus:ring-teal-900/30 hover:border-gray-300 dark:hover:border-gray-600'
    }`;

const FormField = ({ label, required, error, touched, children, hint, className = '' }) => (
    <div className={className}>
        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        {children}
        {hint && !error && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
        {touched && error && (
            <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{error}
            </p>
        )}
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, gradient = 'from-teal-600 to-emerald-600' }) => (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

const InfoBadge = ({ label, value, icon: Icon, loading, color = 'teal' }) => {
    const colorMap = {
        teal:    { border: 'border-teal-200 dark:border-teal-800',    bg: 'bg-teal-50 dark:bg-teal-900/20',    icon: 'bg-teal-100 dark:bg-teal-900/40',    text: 'text-teal-600 dark:text-teal-400',    val: 'text-teal-700 dark:text-teal-300'    },
        emerald: { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400', val: 'text-emerald-700 dark:text-emerald-300' },
        amber:   { border: 'border-amber-200 dark:border-amber-800',   bg: 'bg-amber-50 dark:bg-amber-900/20',   icon: 'bg-amber-100 dark:bg-amber-900/40',   text: 'text-amber-600 dark:text-amber-400',   val: 'text-amber-700 dark:text-amber-300'   },
        gray:    { border: 'border-gray-200 dark:border-gray-700',     bg: 'bg-gray-50 dark:bg-gray-900/40',     icon: 'bg-gray-100 dark:bg-gray-700',         text: 'text-gray-400',                        val: 'text-gray-400'                        },
    };
    const c = colorMap[value ? color : 'gray'];
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${c.border} ${c.bg}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-teal-500" /> : <Icon className={`h-4 w-4 ${c.text}`} />}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-bold truncate mt-0.5 ${c.val}`}>
                    {loading ? 'Fetching…' : (value || 'Not available')}
                </p>
            </div>
        </div>
    );
};

// ─── Labour Search Input ────────────────────────────────────────────────────
const LabourSearchInput = ({ displayValue, onChange, onSelect, suggestions, loading, touched, error }) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef();
    const debounceRef = useRef();

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        onChange(val);
        clearTimeout(debounceRef.current);
        if (val.trim().length >= 2) {
            debounceRef.current = setTimeout(() => setOpen(true), 300);
        } else {
            setOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleInput}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder="Search by name or Labour ID…"
                    className={inputCls(error, touched) + ' pl-10 pr-10'}
                />
                {loading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-teal-500" />}
                {!loading && displayValue && (
                    <button type="button" onClick={() => { onChange(''); onSelect(null); setOpen(false); }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {open && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl z-30 overflow-hidden max-h-56 overflow-y-auto">
                    {suggestions.map((labour, idx) => (
                        <button
                            key={labour.LabourId || idx}
                            type="button"
                            onClick={() => { onSelect(labour); setOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 text-left"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                <HardHat className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                    {labour.LabourName || labour.Name || ''}
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500">ID: {labour.LabourId}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const LabourExit = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId || userData?.RID || '';
    const userName = userData?.userName || userData?.username || 'User';

    // ── Selectors ──────────────────────────────────────────────────────────
    const labourSuggestions  = useSelector(selectLabourSearchList);
    const contractorList     = useSelector(selectContractors);
    const labourData         = useSelector(selectLabourData);
    const relieveDateData    = useSelector(selectRelieveDate);
    const saveStatus         = useSelector(selectSaveStatus);
    const saveError          = useSelector(selectSaveError);
    const saveLoading        = useSelector(selectSaveLoading);
    const labourSearchLoad   = useSelector(selectLabourSearchLoading);
    const labourDataLoading  = useSelector(selectLabourDataLoading);
    const relieveDateLoading = useSelector(selectRelieveDateLoading);

    // ── Local state ─────────────────────────────────────────────────────────
    const [labourType,        setLabourType]        = useState('Own Labour');
    const [contractor,        setContractor]        = useState('');
    const [searchInput,       setSearchInput]       = useState('');
    const [selectedLabour,    setSelectedLabour]    = useState(null);
    const [resignationDate,   setResignationDate]   = useState('');
    const [relievingDate,     setRelievingDate]     = useState('');
    const [remarks,           setRemarks]           = useState('');
    const [docFile,           setDocFile]           = useState(null);
    const [touched,           setTouched]           = useState({});
    const [errors,            setErrors]            = useState({});
    const fileRef = useRef();

    // ── Init ────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchLBContractors());
        return () => dispatch(resetAll());
    }, [dispatch]);

    // ── Labour search ────────────────────────────────────────────────────────
    useEffect(() => {
        if (searchInput.trim().length >= 2) {
            dispatch(fetchLabourForExit({
                prefix: searchInput.trim(),
                labourType,
                contractor: labourType === 'Contractor' ? contractor : '',
            }));
        } else {
            dispatch(clearLabourSearchList());
        }
    }, [searchInput, labourType, contractor, dispatch]);

    // ── Fetch labour details on selection ────────────────────────────────────
    useEffect(() => {
        if (selectedLabour?.LabourId) {
            dispatch(fetchLabourDataForExit(selectedLabour.LabourId));
        } else {
            dispatch(clearLabourData());
        }
    }, [selectedLabour, dispatch]);

    // ── Auto-fetch relieving date when resignation date changes ──────────────
    useEffect(() => {
        const lb = labourData;
        if (resignationDate && lb?.LabourId) {
            const groupId = lb.GroupId || lb.GroupID || 0;
            dispatch(fetchLBRelieveDate({
                resignDate: formatDateForAPI(resignationDate),
                labourId:   lb.LabourId,
                groupId,
            }));
        }
    }, [resignationDate, labourData, dispatch]);

    // ── Populate relieving date from API ─────────────────────────────────────
    useEffect(() => {
        if (relieveDateData) {
            const date = relieveDateData?.RelievingDate || relieveDateData?.relievingDate
                || (typeof relieveDateData === 'string' ? relieveDateData : '');
            if (date) setRelievingDate(date);
        }
    }, [relieveDateData]);

    // ── Save status watcher ──────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Labour exit request submitted successfully!');
            handleReset();
            dispatch(clearSaveResult());
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(typeof saveError === 'string' ? saveError : 'Exit submission failed. Please try again.');
        }
    }, [saveStatus, saveError]);

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = useCallback(() => {
        const errs = {};
        if (labourType === 'Contractor' && !contractor) errs.contractor     = 'Please select a contractor';
        if (!selectedLabour)                             errs.labour         = 'Please select a labour';
        if (!resignationDate)                            errs.resignationDate = 'Resignation date is required';
        if (!relievingDate)                              errs.relievingDate  = 'Relieving date is required';
        return errs;
    }, [labourType, contractor, selectedLabour, resignationDate, relievingDate]);

    const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

    // ── Labour type change ────────────────────────────────────────────────────
    const handleLabourTypeChange = (type) => {
        setLabourType(type);
        setContractor('');
        setSelectedLabour(null);
        setSearchInput('');
        setResignationDate('');
        setRelievingDate('');
        dispatch(clearLabourSearchList());
        dispatch(clearLabourData());
    };

    // ── Labour selection ──────────────────────────────────────────────────────
    const handleLabourSelect = (labour) => {
        setSelectedLabour(labour);
        if (labour) {
            setSearchInput(`${labour.LabourId} — ${labour.LabourName || ''}`);
        } else {
            setSearchInput('');
            setResignationDate('');
            setRelievingDate('');
        }
    };

    // ── File upload ───────────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setDocFile(file);
        e.target.value = '';
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const allTouched = { contractor: true, labour: true, resignationDate: true, relievingDate: true };
        setTouched(allTouched);
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            toast.error(Object.values(errs)[0]);
            return;
        }

        const costCenter = labourData?.CCCode || labourData?.CostCenter || '';
        const groupId    = labourData?.GroupId || labourData?.GroupID || 0;

        let docBaseString = '';
        let docType = '';
        let docName = '';
        if (docFile) {
            try {
                docBaseString = await fileToBase64(docFile);
                docType       = getDocType(docFile);
                docName       = docFile.name;
            } catch {
                toast.error('Failed to process document. Please try again.');
                return;
            }
        }

        dispatch(saveLabourExit({
            costCenter:      String(costCenter),
            labourId:        String(selectedLabour.LabourId),
            groupId,
            resignationDate: formatDateForAPI(resignationDate),
            relievingDate:   typeof relievingDate === 'string' && relievingDate.includes('-')
                ? formatDateForAPI(relievingDate)
                : relievingDate,
            remarks:         remarks.trim(),
            docName,
            docBaseString,
            docType,
            createdBy:       userName,
            roleId,
        }));
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setSelectedLabour(null);
        setSearchInput('');
        setResignationDate('');
        setRelievingDate('');
        setRemarks('');
        setDocFile(null);
        setTouched({});
        setErrors({});
        dispatch(clearLabourSearchList());
        dispatch(clearLabourData());
    };

    // ── Derived values ────────────────────────────────────────────────────────
    const lb = labourData;
    const ccDisplay        = lb?.CCCode    || lb?.CostCenter || null;
    const ccNameDisplay    = lb?.CCName    || null;
    const categoryDisplay  = lb?.Category  || null;
    const contractorName   = lb?.ContractorName || null;

    const contractorListArr = Array.isArray(contractorList?.Data)
        ? contractorList.Data
        : (Array.isArray(contractorList) ? contractorList : []);

    const suggestionsArr = Array.isArray(labourSuggestions?.Data)
        ? labourSuggestions.Data
        : (Array.isArray(labourSuggestions) ? labourSuggestions : []);

    const isFormReady = selectedLabour && resignationDate && relievingDate;

    const relievingDisplay = typeof relievingDate === 'string'
        ? (relievingDate.includes('-') ? formatDateForAPI(relievingDate) : relievingDate)
        : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ──────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 shadow-xl shadow-teal-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <LogOut className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-teal-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Labour Exit</h1>
                                <p className="text-teal-200 text-sm mt-0.5">Initiate a labour exit / resignation request</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-teal-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Exit</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ─────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                        {/* Form title bar */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40">
                            <div className="flex items-center gap-3">
                                <LogOut className="h-4 w-4 text-teal-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Labour Exit Request Form</h2>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Fill all required fields before submitting</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">

                            {/* ── Section 1: Labour Type ──────────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={HardHat}
                                    title="Labour Type"
                                    subtitle="Select whether this is own labour or a contractor labour"
                                    gradient="from-teal-600 to-emerald-600"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    {[
                                        { value: 'Own Labour',  label: 'Own Labour',  icon: HardHat,  desc: "Company's direct labours" },
                                        { value: 'Contractor',  label: 'Contractor',  icon: Briefcase, desc: 'Labour supplied by a contractor' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleLabourTypeChange(opt.value)}
                                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 text-left
                                                ${labourType === opt.value
                                                    ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 text-teal-700 dark:text-teal-300'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <opt.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-semibold">{opt.label}</div>
                                                <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Contractor dropdown */}
                                {labourType === 'Contractor' && (
                                    <FormField
                                        label="Select Contractor"
                                        required
                                        error={errors.contractor}
                                        touched={touched.contractor}
                                        className="max-w-sm"
                                    >
                                        <select
                                            value={contractor}
                                            onChange={(e) => {
                                                setContractor(e.target.value);
                                                setSelectedLabour(null);
                                                setSearchInput('');
                                                setErrors((er) => ({ ...er, contractor: undefined }));
                                            }}
                                            className={inputCls(errors.contractor, touched.contractor)}
                                        >
                                            <option value="">— Select Contractor —</option>
                                            {contractorListArr.map((c, i) => (
                                                <option key={c.ContractorCode || i} value={c.ContractorCode}>
                                                    {c.ContractorName || c.ContractorCode}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                )}
                            </div>

                            {/* ── Section 2: Labour Search ────────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={User}
                                    title="Select Labour"
                                    subtitle="Search by labour name or ID"
                                    gradient="from-emerald-600 to-teal-600"
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <FormField
                                        label="Labour Search"
                                        required
                                        error={errors.labour}
                                        touched={touched.labour}
                                    >
                                        <LabourSearchInput
                                            displayValue={searchInput}
                                            onChange={(val) => {
                                                setSearchInput(val);
                                                if (!val) handleLabourSelect(null);
                                            }}
                                            onSelect={handleLabourSelect}
                                            suggestions={suggestionsArr}
                                            loading={labourSearchLoad}
                                            touched={touched.labour}
                                            error={errors.labour}
                                        />
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                            {labourType === 'Contractor' && !contractor
                                                ? 'Select a contractor first'
                                                : 'Type at least 2 characters to search'}
                                        </p>
                                    </FormField>

                                    {selectedLabour ? (
                                        <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/30">
                                                <HardHat className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                                                    {selectedLabour.LabourName || selectedLabour.Name || selectedLabour.LabourId}
                                                </p>
                                                <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5 font-medium">ID: {selectedLabour.LabourId}</p>
                                                {ccDisplay && (
                                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" /> {ccDisplay}
                                                    </p>
                                                )}
                                            </div>
                                            <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 text-gray-400">
                                            <HardHat className="h-5 w-5 opacity-40" />
                                            <p className="text-xs font-medium">Labour details will appear here</p>
                                        </div>
                                    )}
                                </div>

                                {selectedLabour && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <InfoBadge label="Cost Center"   value={ccDisplay}       icon={Building2} loading={labourDataLoading} color="teal"    />
                                        <InfoBadge label="CC Name"       value={ccNameDisplay}   icon={Hash}      loading={labourDataLoading} color="emerald" />
                                        <InfoBadge label="Category"      value={categoryDisplay} icon={Briefcase} loading={labourDataLoading} color="amber"   />
                                        {labourType === 'Contractor' && (
                                            <InfoBadge label="Contractor" value={contractorName} icon={Briefcase} loading={labourDataLoading} color="amber" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Section 3: Exit Dates ───────────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={Calendar}
                                    title="Exit Dates"
                                    subtitle="Resignation date — relieving date is auto-calculated"
                                    gradient="from-teal-600 to-emerald-600"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField
                                        label="Resignation Date"
                                        required
                                        error={errors.resignationDate}
                                        touched={touched.resignationDate}
                                        hint="Date the resignation letter was submitted"
                                    >
                                        <CustomDatePicker
                                            value={resignationDate}
                                            onChange={(val) => {
                                                setResignationDate(serializeDate(val));
                                                setRelievingDate('');
                                                setErrors((er) => ({ ...er, resignationDate: undefined }));
                                                handleBlur('resignationDate');
                                            }}
                                            placeholder="Select resignation date"
                                        />
                                    </FormField>

                                    <FormField
                                        label="Relieving Date"
                                        required
                                        error={errors.relievingDate}
                                        touched={touched.relievingDate}
                                        hint="Auto-calculated based on notice period — can be overridden"
                                    >
                                        {relieveDateLoading ? (
                                            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 text-sm text-teal-600 dark:text-teal-400">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Calculating relieving date…
                                            </div>
                                        ) : (
                                            <CustomDatePicker
                                                value={relievingDate}
                                                onChange={(val) => {
                                                    setRelievingDate(serializeDate(val));
                                                    setErrors((er) => ({ ...er, relievingDate: undefined }));
                                                    handleBlur('relievingDate');
                                                }}
                                                placeholder="Auto-populated or select manually"
                                            />
                                        )}
                                    </FormField>
                                </div>

                                {(resignationDate || relievingDate) && (
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Resignation', date: resignationDate, color: 'teal' },
                                            { label: 'Relieving',   date: relievingDisplay, color: 'emerald', note: relieveDateLoading ? '(calculating…)' : '' },
                                        ].map(({ label, date, color, note }) => (
                                            <div key={label} className={`p-3 rounded-xl border-2 transition-all
                                                ${date
                                                    ? `border-${color}-200 dark:border-${color}-800 bg-${color}-50/60 dark:bg-${color}-900/10`
                                                    : 'border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className={`h-3 w-3 ${date ? `text-${color}-600` : 'text-gray-400'}`} />
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                                                </div>
                                                <p className={`text-sm font-bold ${date ? `text-${color}-700 dark:text-${color}-300` : 'text-gray-400'}`}>
                                                    {date ? (resignationDate && label === 'Resignation' ? formatDateForAPI(resignationDate) : (date || '—')) : '—'}
                                                    {note && <span className="text-xs ml-1 opacity-60">{note}</span>}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Section 4: Document Upload ──────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={FileText}
                                    title="Document"
                                    subtitle="Upload supporting document (resignation letter, etc.)"
                                    gradient="from-emerald-500 to-teal-600"
                                />

                                <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                                    ${docFile
                                        ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${docFile ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        {docFile
                                            ? <CheckCircle className="h-5 w-5 text-green-600" />
                                            : <FileText className="h-5 w-5 text-gray-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {docFile ? (
                                            <>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{docFile.name}</p>
                                                <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5">
                                                    {(docFile.size / 1024).toFixed(0)} KB · {getDocType(docFile).toUpperCase()}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No document uploaded</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Accepted: PDF, PNG, JPG, JPEG</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {docFile && (
                                            <button type="button" onClick={() => setDocFile(null)}
                                                className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 flex items-center justify-center text-rose-500 transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <button type="button" onClick={() => fileRef.current?.click()}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                                ${docFile
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
                                                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-sm'
                                                }`}>
                                            <Upload className="h-3 w-3" />
                                            {docFile ? 'Replace' : 'Upload'}
                                        </button>
                                        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                                    </div>
                                </div>
                            </div>

                            {/* ── Section 5: Remarks ──────────────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={MessageSquare}
                                    title="Remarks"
                                    subtitle="Optional notes or reason for the exit"
                                    gradient="from-teal-500 to-emerald-500"
                                />
                                <div className="relative">
                                    <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        rows={4}
                                        placeholder="Enter reason for exit, additional notes, or any other information…"
                                        className={`${inputCls()} pl-10 resize-none`}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-gray-400">Optional</span>
                                    <span className="text-[10px] text-gray-400">{remarks.length} chars</span>
                                </div>
                            </div>

                            {/* ── Exit Summary Preview ────────────────────────────────── */}
                            {isFormReady && (
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                        <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">Exit Summary</h4>
                                        <span className="ml-auto text-[10px] font-bold text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 rounded-full">Ready to Submit</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        {[
                                            { label: 'Labour Name',      value: selectedLabour?.LabourName || '—' },
                                            { label: 'Labour ID',        value: selectedLabour?.LabourId   || '—' },
                                            { label: 'Labour Type',      value: labourType                       },
                                            { label: 'Cost Center',      value: ccDisplay                  || '—' },
                                            { label: 'CC Name',          value: ccNameDisplay              || '—' },
                                            { label: 'Resignation Date', value: formatDateForAPI(resignationDate) || '—' },
                                            { label: 'Relieving Date',   value: relievingDisplay           || '—' },
                                            { label: 'Document',         value: docFile ? docFile.name : 'Not uploaded' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-teal-100 dark:border-teal-800">
                                                <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wide">{label}</p>
                                                <p className="text-gray-800 dark:text-gray-200 font-semibold truncate mt-0.5">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Footer Actions ──────────────────────────────────────── */}
                        <div className="px-6 md:px-8 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-900/20 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                                <RotateCcw className="h-4 w-4" /> Clear Form
                            </button>

                            <button
                                type="submit"
                                disabled={saveLoading}
                                className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saveLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                    : <><Send className="h-4 w-4" /> Submit Exit Request</>
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LabourExit;
