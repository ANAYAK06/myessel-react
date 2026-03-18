import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchEmployeesForExit,
    fetchEmployeeForExit,
    saveEmpExit,
    clearEmployeesForExitList,
    clearEmployeeForExitData,
    clearSaveResult,
    selectEmployeesForExitListArray,
    selectEmployeeForExitData,
    selectSaveStatus,
    selectSaveError,
    selectSaveLoading,
    selectEmployeesForExitListLoading,
    selectEmployeeForExitDataLoading,
    resetAll,
} from '../../slices/HRSlice/employeeExitSlice';

import {
    Search, LogOut, Calendar, MessageSquare,
    User, Building2, Loader2, CheckCircle,
    AlertCircle, X, RotateCcw, Send,
    FileText, Upload, Trash2, Navigation,
    Briefcase, Hash,
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
        reader.onload = () => resolve(reader.result.split(',')[1]); // strip data:...;base64,
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const getDocType = (file) => {
    if (!file) return '';
    const ext = file.name.split('.').pop().toLowerCase();
    return ext;
};

// ─── Style helpers ────────────────────────────────────────────────────────────
const inputCls = (error, touched) =>
    `w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
     focus:outline-none focus:ring-2 transition-all duration-150
     ${touched && error
        ? 'border-rose-300 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-900/30'
        : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 dark:hover:border-gray-600'
    }`;

// ─── FormField wrapper ────────────────────────────────────────────────────────
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

// ─── SectionHeader ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, gradient = 'from-indigo-600 to-purple-600' }) => (
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

// ─── Parse employee display string ────────────────────────────────────────────
const parseEmpDisplay = (emp) => {
    const raw = emp?.FirstName || emp?.EmpName || '';
    const match = raw.match(/^([^,]+)\s*,\s*\((.+)\)$/);
    if (match) {
        return {
            empId: emp.EmpRefNo || match[1].trim(),
            empName: match[2].trim(),
            displayLabel: `${emp.EmpRefNo || match[1].trim()} — ${match[2].trim()}`,
        };
    }
    return {
        empId: emp.EmpRefNo || '',
        empName: raw,
        displayLabel: raw,
    };
};

// ─── Employee Search with Autocomplete ────────────────────────────────────────
const EmployeeSearchInput = ({ value, displayValue, onChange, onSelect, suggestions, loading, touched, error }) => {
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
                    placeholder="Search by name or employee ID…"
                    className={inputCls(error, touched) + ' pl-10 pr-10'}
                />
                {loading && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-500" />
                )}
                {!loading && displayValue && (
                    <button type="button" onClick={() => { onChange(''); onSelect(null); setOpen(false); }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {open && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl z-30 overflow-hidden max-h-56 overflow-y-auto">
                    {suggestions.map((emp, idx) => {
                        const { empId, empName } = parseEmpDisplay(emp);
                        return (
                            <button
                                key={empId || idx}
                                type="button"
                                onClick={() => { onSelect(emp); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{empName}</p>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">ID: {empId}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── Info Badge (read-only field display) ─────────────────────────────────────
const InfoBadge = ({ label, value, icon: Icon, loading, color = 'rose' }) => {
    const colorMap = {
        indigo:  { border: 'border-indigo-200 dark:border-indigo-800',  bg: 'bg-indigo-50 dark:bg-indigo-900/20',  icon: 'bg-indigo-100 dark:bg-indigo-900/40',  text: 'text-indigo-600 dark:text-indigo-400',  val: 'text-indigo-700 dark:text-indigo-300'  },
        purple:  { border: 'border-purple-200 dark:border-purple-800',  bg: 'bg-purple-50 dark:bg-purple-900/20',  icon: 'bg-purple-100 dark:bg-purple-900/40',  text: 'text-purple-600 dark:text-purple-400',  val: 'text-purple-700 dark:text-purple-300'  },
        violet:  { border: 'border-violet-200 dark:border-violet-800',  bg: 'bg-violet-50 dark:bg-violet-900/20',  icon: 'bg-violet-100 dark:bg-violet-900/40',  text: 'text-violet-600 dark:text-violet-400',  val: 'text-violet-700 dark:text-violet-300'  },
        gray:    { border: 'border-gray-200 dark:border-gray-700',      bg: 'bg-gray-50 dark:bg-gray-900/40',      icon: 'bg-gray-100 dark:bg-gray-700',          text: 'text-gray-400',                         val: 'text-gray-400'                         },
    };
    const c = colorMap[value ? color : 'gray'];
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${c.border} ${c.bg}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                {loading
                    ? <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    : <Icon className={`h-4 w-4 ${c.text}`} />
                }
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

// ─── Main Component ────────────────────────────────────────────────────────────
const EmployeeExit = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId  = userData?.roleId || userData?.RID || '';
    const userName = userData?.userName || userData?.username || 'User';

    // ── Selectors ──────────────────────────────────────────────────────────
    const employeeSuggestions  = useSelector(selectEmployeesForExitListArray);
    const employeeData         = useSelector(selectEmployeeForExitData);
    const saveStatus           = useSelector(selectSaveStatus);
    const saveError            = useSelector(selectSaveError);
    const saveLoading          = useSelector(selectSaveLoading);
    const empSearchLoading     = useSelector(selectEmployeesForExitListLoading);
    const empDataLoading       = useSelector(selectEmployeeForExitDataLoading);

    // ── Local State ────────────────────────────────────────────────────────
    const [searchInput,      setSearchInput]      = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [resignationDate,  setResignationDate]  = useState('');
    const [relievingDate,    setRelievingDate]     = useState('');
    const [remarks,          setRemarks]          = useState('');
    const [docFile,          setDocFile]          = useState(null);
    const [touched,          setTouched]          = useState({});
    const [errors,           setErrors]           = useState({});
    const fileRef = useRef();

    // cleanup on unmount
    useEffect(() => { return () => dispatch(resetAll()); }, [dispatch]);

    // ── Search trigger ─────────────────────────────────────────────────────
    useEffect(() => {
        if (searchInput.trim().length >= 2) {
            dispatch(fetchEmployeesForExit(searchInput.trim()));
        } else {
            dispatch(clearEmployeesForExitList());
        }
    }, [searchInput, dispatch]);

    // ── Fetch employee details on selection ────────────────────────────────
    useEffect(() => {
        if (selectedEmployee?.EmpRefNo) {
            dispatch(fetchEmployeeForExit(selectedEmployee.EmpRefNo));
        } else {
            dispatch(clearEmployeeForExitData());
        }
    }, [selectedEmployee, dispatch]);

    // ── Save status watcher ────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Employee exit request submitted successfully!');
            handleReset();
            dispatch(clearSaveResult());
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(typeof saveError === 'string' ? saveError : 'Exit submission failed. Please try again.');
        }
    }, [saveStatus, saveError]);

    // ── Validation ─────────────────────────────────────────────────────────
    const validate = useCallback(() => {
        const errs = {};
        if (!selectedEmployee)  errs.employee        = 'Please select an employee';
        if (!resignationDate)   errs.resignationDate = 'Resignation date is required';
        if (!relievingDate)     errs.relievingDate   = 'Relieving date is required';
        if (resignationDate && relievingDate && new Date(relievingDate) < new Date(resignationDate)) {
            errs.relievingDate = 'Relieving date must be on or after resignation date';
        }
        return errs;
    }, [selectedEmployee, resignationDate, relievingDate]);

    const handleBlur = (field) => setTouched(t => ({ ...t, [field]: true }));

    // ── Employee selection ─────────────────────────────────────────────────
    const handleEmployeeSelect = (emp) => {
        setSelectedEmployee(emp);
        if (emp) {
            const { empName } = parseEmpDisplay(emp);
            setSearchInput(empName);
            setErrors(e => ({ ...e, employee: undefined }));
        } else {
            setSearchInput('');
        }
    };

    // ── Document upload ────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setDocFile(file);
        e.target.value = '';
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const allTouched = { employee: true, resignationDate: true, relievingDate: true };
        setTouched(allTouched);
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            toast.error(Object.values(errs)[0]);
            return;
        }

        // Pull CC and GroupId from fetched employee data
        const empDetail = Array.isArray(employeeData) ? employeeData[0] : employeeData;
        const costCenter = empDetail?.CCCode || empDetail?.CostCenter || empDetail?.CC_Code || '';
        const groupId    = empDetail?.GroupId || empDetail?.GroupID || 0;

        let docBaseString = '';
        let docType = '';
        if (docFile) {
            try {
                docBaseString = await fileToBase64(docFile);
                docType       = getDocType(docFile);
            } catch {
                toast.error('Failed to process document. Please try again.');
                return;
            }
        }

        dispatch(saveEmpExit({
            costCenter:      String(costCenter),
            empRefNo:        String(selectedEmployee.EmpRefNo),
            groupId:         groupId,
            resignationDate: formatDateForAPI(resignationDate),
            relievingDate:   formatDateForAPI(relievingDate),
            remarks:         remarks.trim(),
            docBaseString:   docBaseString,
            docType:         docType,
            createdBy:       userName,
            roleId:          roleId,
        }));
    };

    // ── Reset ──────────────────────────────────────────────────────────────
    const handleReset = () => {
        setSearchInput('');
        setSelectedEmployee(null);
        setResignationDate('');
        setRelievingDate('');
        setRemarks('');
        setDocFile(null);
        setTouched({});
        setErrors({});
        dispatch(clearEmployeesForExitList());
        dispatch(clearEmployeeForExitData());
    };

    // Derived employee details
    const empDetail      = Array.isArray(employeeData) ? employeeData[0] : employeeData;
    const ccDisplay      = empDetail?.CCCode || empDetail?.CostCenter || empDetail?.CC_Code || null;
    const ccNameDisplay  = empDetail?.CCName || null;
    const designDisplay  = empDetail?.DesignationName || empDetail?.Designation || null;

    const { empId: selEmpId, empName: selEmpName } = selectedEmployee
        ? parseEmpDisplay(selectedEmployee) : { empId: '', empName: '' };

    const isFormReady = selectedEmployee && resignationDate && relievingDate;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ──────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <LogOut className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Employee Exit</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Initiate an employee exit / resignation request</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
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
                                <LogOut className="h-4 w-4 text-indigo-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Exit Request Form</h2>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Fill all required fields before submitting</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">

                            {/* ── Section 1: Employee Search ──────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={User}
                                    title="Select Employee"
                                    subtitle="Search by employee name or ID to begin the exit process"
                                    gradient="from-indigo-600 to-purple-600"
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <FormField
                                        label="Employee Search"
                                        required
                                        error={errors.employee}
                                        touched={touched.employee}
                                    >
                                        <EmployeeSearchInput
                                            value={selectedEmployee?.EmpRefNo || ''}
                                            displayValue={searchInput}
                                            onChange={(val) => {
                                                setSearchInput(val);
                                                if (!val) handleEmployeeSelect(null);
                                            }}
                                            onSelect={handleEmployeeSelect}
                                            suggestions={employeeSuggestions}
                                            loading={empSearchLoading}
                                            touched={touched.employee}
                                            error={errors.employee}
                                        />
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                            Type at least 2 characters to search
                                        </p>
                                    </FormField>

                                    {/* Selected Employee Card */}
                                    {selectedEmployee ? (
                                        <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
                                                <User className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{selEmpName}</p>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">ID: {selEmpId}</p>
                                                {ccDisplay && (
                                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" /> {ccDisplay}
                                                    </p>
                                                )}
                                            </div>
                                            <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 text-gray-400">
                                            <User className="h-5 w-5 opacity-40" />
                                            <p className="text-xs font-medium">Employee details will appear here</p>
                                        </div>
                                    )}
                                </div>

                                {/* Auto-filled employee info */}
                                {selectedEmployee && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <InfoBadge label="Cost Center"  value={ccDisplay}     icon={Building2} loading={empDataLoading} color="indigo" />
                                        <InfoBadge label="Designation"  value={designDisplay} icon={Briefcase} loading={empDataLoading} color="purple" />
                                        <InfoBadge label="CC Name"      value={ccNameDisplay} icon={Hash}      loading={empDataLoading} color="violet" />
                                    </div>
                                )}
                            </div>

                            {/* ── Section 2: Exit Dates ───────────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={Calendar}
                                    title="Exit Dates"
                                    subtitle="Resignation date and last working day"
                                    gradient="from-purple-600 to-indigo-600"
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
                                                setErrors(er => ({ ...er, resignationDate: undefined }));
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
                                        hint="Last working day / date of relieving"
                                    >
                                        <CustomDatePicker
                                            value={relievingDate}
                                            onChange={(val) => {
                                                setRelievingDate(serializeDate(val));
                                                setErrors(er => ({ ...er, relievingDate: undefined }));
                                                handleBlur('relievingDate');
                                            }}
                                            placeholder="Select relieving date"
                                        />
                                    </FormField>
                                </div>

                                {/* Date visual summary */}
                                {(resignationDate || relievingDate) && (
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className={`p-3 rounded-xl border-2 transition-all
                                            ${resignationDate
                                                ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/10'
                                                : 'border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${resignationDate ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                    <Calendar className={`h-3 w-3 ${resignationDate ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resignation</p>
                                            </div>
                                            <p className={`text-sm font-bold ${resignationDate ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-400'}`}>
                                                {resignationDate ? formatDateForAPI(resignationDate) : '—'}
                                            </p>
                                        </div>

                                        <div className={`p-3 rounded-xl border-2 transition-all
                                            ${relievingDate
                                                ? 'border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-900/10'
                                                : 'border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${relievingDate ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                    <Calendar className={`h-3 w-3 ${relievingDate ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Relieving</p>
                                            </div>
                                            <p className={`text-sm font-bold ${relievingDate ? 'text-purple-700 dark:text-purple-300' : 'text-gray-400'}`}>
                                                {relievingDate ? formatDateForAPI(relievingDate) : '—'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Section 3: Document Upload ──────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={FileText}
                                    title="Document"
                                    subtitle="Upload supporting document (resignation letter, NOC, etc.)"
                                    gradient="from-indigo-500 to-violet-600"
                                />

                                <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                                    ${docFile
                                        ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${docFile ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        {docFile
                                            ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            : <FileText className="h-5 w-5 text-gray-400" />
                                        }
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
                                                className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center text-rose-500 transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <button type="button" onClick={() => fileRef.current?.click()}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                                ${docFile
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm'
                                                }`}>
                                            <Upload className="h-3 w-3" />
                                            {docFile ? 'Replace' : 'Upload'}
                                        </button>
                                        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                                    </div>
                                </div>
                            </div>

                            {/* ── Section 4: Remarks ──────────────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={MessageSquare}
                                    title="Remarks"
                                    subtitle="Optional notes or reason for the exit"
                                    gradient="from-purple-500 to-indigo-500"
                                />

                                <FormField
                                    label="Remarks / Notes"
                                    hint="Add any relevant information about this exit request"
                                >
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <textarea
                                            value={remarks}
                                            onChange={e => setRemarks(e.target.value)}
                                            rows={4}
                                            placeholder="Enter reason for exit, additional notes, or any other information…"
                                            className={`${inputCls()} pl-10 resize-none`}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">Optional</span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{remarks.length} chars</span>
                                    </div>
                                </FormField>
                            </div>

                            {/* ── Exit Summary Preview ────────────────────────────────── */}
                            {isFormReady && (
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Exit Summary</h4>
                                        <span className="ml-auto text-[10px] font-bold text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">Ready to Submit</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        {[
                                            { label: 'Employee',         value: selEmpName  || '—' },
                                            { label: 'Employee ID',      value: selEmpId    || '—' },
                                            { label: 'Cost Center',      value: ccDisplay   || '—' },
                                            { label: 'CC Name',          value: ccNameDisplay || '—' },
                                            { label: 'Resignation Date', value: formatDateForAPI(resignationDate) || '—' },
                                            { label: 'Relieving Date',   value: formatDateForAPI(relievingDate)   || '—' },
                                            { label: 'Document',         value: docFile ? docFile.name : 'Not uploaded' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-indigo-100 dark:border-indigo-800">
                                                <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wide">{label}</p>
                                                <p className="text-gray-800 dark:text-gray-200 font-semibold truncate mt-0.5">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {remarks && (
                                        <div className="mt-3 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                            <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wide mb-0.5">Remarks</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{remarks}</p>
                                        </div>
                                    )}
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

                            <div className="flex items-center gap-3">
                                {!isFormReady && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                                        Fill all required fields to enable submission
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={saveLoading}
                                    className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saveLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                        : <><Send className="h-4 w-4" /> Submit Exit Request</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeExit;
