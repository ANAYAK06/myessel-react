import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchEmployeeExtender,
    fetchEmployeeCCCode,
    fetchAllEmpCC,
    saveEmployeeTransferDetails,
    clearEmployeeExtenderList,
    clearEmployeeCCCode,
    clearSaveResult,
    selectEmployeeExtenderListArray,
    selectEmployeeCCCode,
    selectAllEmpCCListArray,
    selectSaveStatus,
    selectSaveError,
    selectSaveLoading,
    selectEmployeeExtenderListLoading,
    selectEmployeeCCCodeLoading,
    selectAllEmpCCListLoading,
    resetAll,
} from '../../slices/HRSlice/employeeTransferSlice';

import {
    Search, ArrowRightLeft, MapPin, Calendar, MessageSquare,
    User, Building2, ChevronDown, Loader2, CheckCircle,
    AlertCircle, X, ArrowRight, RotateCcw, Send,
    Briefcase, Navigation, FileText,
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

// ─── Reusable style helpers (matches reference app) ───────────────────────────
const inputCls = (error, touched) =>
    `w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 
     focus:outline-none focus:ring-2 transition-all duration-150
     ${touched && error
        ? 'border-rose-300 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-900/30'
        : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 dark:hover:border-gray-600'
    }`;

const selectCls = (error, touched) =>
    `w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
     focus:outline-none focus:ring-2 transition-all duration-150 cursor-pointer
     ${touched && error
        ? 'border-rose-300 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-100'
        : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 dark:hover:border-gray-600'
    }`;

// ─── FormField wrapper (matches reference app pattern) ────────────────────────
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

// ─── SectionHeader (matches reference app) ────────────────────────────────────
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
// API returns FirstName as "MS00001 , (ANOOP KOMALAM NARAYANAN)"
// Extract: empId = "MS00001", empName = "ANOOP KOMALAM NARAYANAN"
const parseEmpDisplay = (emp) => {
    const raw = emp?.FirstName || '';
    // Format: "MS00001 , (ANOOP KOMALAM NARAYANAN)"
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
                        const { empId, empName, displayLabel } = parseEmpDisplay(emp);
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

// ─── CC Info Badge ─────────────────────────────────────────────────────────────
const CCBadge = ({ label, cc, loading }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
        ${cc
            ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40'
        }`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
            ${cc ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {loading
                ? <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                : <MapPin className={`h-4 w-4 ${cc ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
            }
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
            <p className={`text-sm font-bold truncate mt-0.5 ${cc ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500'}`}>
                {loading ? 'Fetching…' : (cc || 'Not assigned')}
            </p>
        </div>
    </div>
);

// ─── Transfer Arrow Divider ────────────────────────────────────────────────────
const TransferArrow = () => (
    <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-300 dark:to-indigo-700" />
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                <ArrowRightLeft className="h-4 w-4 text-white" />
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-300 dark:to-purple-700" />
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const EmployeeTransfer = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId = userData?.roleId || userData?.RID || '';
    const userName = userData?.userName || userData?.username || 'User';

    // ── Selectors ──────────────────────────────────────────────────────────
    const employeeSuggestions = useSelector(selectEmployeeExtenderListArray);
    const employeeCCCode = useSelector(selectEmployeeCCCode);
    const allEmpCCList = useSelector(selectAllEmpCCListArray);
    const saveStatus = useSelector(selectSaveStatus);
    const saveError = useSelector(selectSaveError);
    const saveLoading = useSelector(selectSaveLoading);
    const empSearchLoading = useSelector(selectEmployeeExtenderListLoading);
    const ccLoading = useSelector(selectEmployeeCCCodeLoading);
    const toCCLoading = useSelector(selectAllEmpCCListLoading);

    // ── Local State ────────────────────────────────────────────────────────
    const [searchInput, setSearchInput] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [toCC, setToCC] = useState('');
    const [relievingDate, setRelievingDate] = useState('');
    const [joiningDate, setJoiningDate] = useState('');
    const [remarks, setRemarks] = useState('');
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});

    // cleanup on unmount
    useEffect(() => { return () => dispatch(resetAll()); }, [dispatch]);

    // ── Search trigger ─────────────────────────────────────────────────────
    useEffect(() => {
        if (searchInput.trim().length >= 2) {
            dispatch(fetchEmployeeExtender(searchInput.trim()));
        } else {
            dispatch(clearEmployeeExtenderList());
        }
    }, [searchInput, dispatch]);

    // Step 2+3: fetch CC then chain to fetch CC list
    useEffect(() => {
        if (selectedEmployee?.EmpRefNo) {
            dispatch(fetchEmployeeCCCode(selectedEmployee.EmpRefNo)).then((action) => {
                // Raw payload: { Data: [{ FromCC: "CC-12 , Raipur Office", ... }], ... }
                const raw = action?.payload?.Data;
                const record = Array.isArray(raw) ? raw[0] : raw;
                const fromCCFull = record?.FromCC || '';         // "CC-12 , Raipur Office"
                const fromCCCode = fromCCFull.split(',')[0].trim(); // "CC-12"
                console.log('🏗️ FromCC fetched:', fromCCFull, '→ code:', fromCCCode);
                if (fromCCCode) dispatch(fetchAllEmpCC(fromCCCode));
            });
        } else {
            dispatch(clearEmployeeCCCode());
        }
    }, [selectedEmployee, dispatch]);

    // ── Save status watcher ────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Employee transfer request submitted successfully!');
            handleReset();
            dispatch(clearSaveResult());
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(typeof saveError === 'string' ? saveError : 'Transfer submission failed. Please try again.');
        }
    }, [saveStatus, saveError]);

    // ── Validation ─────────────────────────────────────────────────────────
    const validate = useCallback(() => {
        const errs = {};
        if (!selectedEmployee) errs.employee = 'Please select an employee';
        if (!toCC) errs.toCC = 'Please select a target cost center';
        if (!relievingDate) errs.relievingDate = 'Relieving date is required';
        if (!joiningDate) errs.joiningDate = 'Joining date is required';
        if (relievingDate && joiningDate && new Date(joiningDate) < new Date(relievingDate)) {
            errs.joiningDate = 'Joining date must be on or after relieving date';
        }
        return errs;
    }, [selectedEmployee, toCC, relievingDate, joiningDate]);

    const handleBlur = (field) => setTouched(t => ({ ...t, [field]: true }));

    // ── Employee selection ─────────────────────────────────────────────────
    const handleEmployeeSelect = (emp) => {
        setSelectedEmployee(emp);
        if (emp) {
            const { empName } = parseEmpDisplay(emp);
            setToCC('');
            setSearchInput(empName);
            setErrors(e => ({ ...e, employee: undefined }));
        } else {
            setSearchInput('');
        }
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        const allTouched = { employee: true, toCC: true, relievingDate: true, joiningDate: true };
        setTouched(allTouched);
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            toast.error(Object.values(errs)[0]);
            return;
        }

        // employeeCCCode.FromCC = 'CC-12 , Raipur Office'
        const _fromFull = employeeCCCode?.FromCC || '';
        const fromCC = _fromFull.split(',')[0].trim();
        const empId = selectedEmployee.EmpRefNo;

        dispatch(saveEmployeeTransferDetails({
            employeeId: String(empId),
            fromCC: String(fromCC),
            toCC: String(toCC),
            relievingDate: formatDateForAPI(relievingDate),
            joiningDate: formatDateForAPI(joiningDate),
            remarks: remarks.trim(),
            createdBy: userName,
            roleId: roleId,
        }));
    };

    // ── Reset ──────────────────────────────────────────────────────────────
    const handleReset = () => {
        setSearchInput('');
        setSelectedEmployee(null);
        setToCC('');
        setRelievingDate('');
        setJoiningDate('');
        setRemarks('');
        setTouched({});
        setErrors({});
        dispatch(clearEmployeeExtenderList());
        dispatch(clearEmployeeCCCode());
    };

    // Derived: employeeCCCode = Data[0] { FromCC: "CC-12 , Raipur Office", ... }
    const fromCCFull    = employeeCCCode?.FromCC || '';
    const fromCCCode    = fromCCFull.split(',')[0].trim();
    const fromCCDisplay = fromCCFull || null;
    // CC list items: { CC_Code: "CC-01", CC_Name: "CC-01 , NEW STOCK" }
    const toCCObj    = allEmpCCList.find(cc => cc.CC_Code === toCC);
    const toCCDisplay = toCCObj ? toCCObj.CC_Name : null;

    const isFormReady = selectedEmployee && toCC && relievingDate && joiningDate;

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
                                <ArrowRightLeft className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Employee Transfer</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Initiate a cost center transfer request</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Transfers</p>
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
                                <ArrowRightLeft className="h-4 w-4 text-indigo-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Transfer Request Form</h2>
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
                                    subtitle="Search by employee name or ID to begin the transfer"
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
{(() => {
                                                        const { empId, empName } = parseEmpDisplay(selectedEmployee);
                                                        return (<>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{empName}</p>
                                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">ID: {empId}</p>
                                                            {fromCCDisplay && (
                                                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" /> {fromCCDisplay}
                                                                </p>
                                                            )}
                                                        </>);
                                                    })()}
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
                            </div>

                            {/* ── Section 2: Cost Center Transfer ────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={Building2}
                                    title="Cost Center Transfer"
                                    subtitle="Current location and the destination cost center"
                                    gradient="from-purple-600 to-violet-600"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* From CC (read-only, auto-filled) */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                            Relieving Cost Center
                                        </label>
                                        <CCBadge
                                            label="Current Cost Center"
                                            cc={fromCCDisplay}
                                            loading={ccLoading}
                                        />
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                            Auto-filled from selected employee record
                                        </p>
                                    </div>

                                    {/* To CC dropdown */}
                                    <FormField
                                        label="Target Cost Center"
                                        required
                                        error={errors.toCC}
                                        touched={touched.toCC}
                                    >
                                        <div className="relative">
                                            <select
                                                value={toCC}
                                                onChange={e => {
                                                    setToCC(e.target.value);
                                                    setErrors(er => ({ ...er, toCC: undefined }));
                                                }}
                                                onBlur={() => handleBlur('toCC')}
                                                className={selectCls(errors.toCC, touched.toCC)}
                                            >
                                                <option value="">
                                                    {toCCLoading ? 'Loading cost centers…' : 'Select destination cost center'}
                                                </option>
                                                {allEmpCCList.map(cc => (
                                                    <option
                                                        key={cc.CC_Code}
                                                        value={cc.CC_Code}
                                                        disabled={cc.CC_Code === fromCCCode}
                                                    >
                                                        {cc.CC_Name}
                                                    </option>
                                                ))}
                                            </select>
                                            {toCCLoading && (
                                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-indigo-500" />
                                            )}
                                        </div>
                                    </FormField>
                                </div>

                                {/* Visual Transfer Summary */}
                                {(fromCCDisplay || toCC) && (
                                    <div className="mt-4 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0 text-center">
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">From</p>
                                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-sm">
                                                    <MapPin className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[140px]">
                                                        {fromCCCode || '—'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                                                    <ArrowRight className="h-4 w-4 text-white" />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 text-center">
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">To</p>
                                                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm
                                                    ${toCC
                                                        ? 'bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700'
                                                        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                                    }`}>
                                                    <MapPin className={`h-3.5 w-3.5 flex-shrink-0 ${toCC ? 'text-purple-500' : 'text-gray-400'}`} />
                                                    <span className={`text-sm font-bold truncate max-w-[140px] ${toCC ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
                                                        {toCC || '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Section 3: Dates ────────────────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={Calendar}
                                    title="Transfer Dates"
                                    subtitle="Set relieving and joining dates for the transfer"
                                    gradient="from-violet-600 to-purple-600"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField
                                        label="Relieving Date"
                                        required
                                        error={errors.relievingDate}
                                        touched={touched.relievingDate}
                                        hint="Last working day at current cost center"
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

                                    <FormField
                                        label="Joining Date at New CC"
                                        required
                                        error={errors.joiningDate}
                                        touched={touched.joiningDate}
                                        hint="First working day at the new cost center"
                                    >
                                        <CustomDatePicker
                                            value={joiningDate}
                                            onChange={(val) => {
                                                setJoiningDate(serializeDate(val));
                                                setErrors(er => ({ ...er, joiningDate: undefined }));
                                                handleBlur('joiningDate');
                                            }}
                                            placeholder="Select joining date"
                                        />
                                    </FormField>
                                </div>

                                {/* Date visual summary */}
                                {(relievingDate || joiningDate) && (
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className={`p-3 rounded-xl border-2 transition-all
                                            ${relievingDate
                                                ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/10'
                                                : 'border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${relievingDate ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                    <Calendar className={`h-3 w-3 ${relievingDate ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Relieving</p>
                                            </div>
                                            <p className={`text-sm font-bold ${relievingDate ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-400'}`}>
                                                {relievingDate ? formatDateForAPI(relievingDate) : '—'}
                                            </p>
                                        </div>

                                        <div className={`p-3 rounded-xl border-2 transition-all
                                            ${joiningDate
                                                ? 'border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-900/10'
                                                : 'border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${joiningDate ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                    <Calendar className={`h-3 w-3 ${joiningDate ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joining</p>
                                            </div>
                                            <p className={`text-sm font-bold ${joiningDate ? 'text-purple-700 dark:text-purple-300' : 'text-gray-400'}`}>
                                                {joiningDate ? formatDateForAPI(joiningDate) : '—'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Section 4: Remarks ──────────────────────────────────── */}
                            <div>
                                <SectionHeader
                                    icon={MessageSquare}
                                    title="Remarks"
                                    subtitle="Optional notes or reason for this transfer"
                                    gradient="from-indigo-500 to-violet-600"
                                />

                                <FormField
                                    label="Remarks / Notes"
                                    hint="Add any relevant information about this transfer request"
                                >
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <textarea
                                            value={remarks}
                                            onChange={e => setRemarks(e.target.value)}
                                            rows={4}
                                            placeholder="Enter reason for transfer, business justification, or any other notes…"
                                            className={`${inputCls()} pl-10 resize-none`}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">Optional</span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{remarks.length} chars</span>
                                    </div>
                                </FormField>
                            </div>

                            {/* ── Transfer Summary Preview ────────────────────────────── */}
                            {isFormReady && (
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Transfer Summary</h4>
                                        <span className="ml-auto text-[10px] font-bold text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">Ready to Submit</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        {[
                                            { label: 'Employee', value: selectedEmployee?.EmpName || selectedEmployee?.Name || '—' },
                                            { label: 'Employee ID', value: selectedEmployee?.EmpRefNo || selectedEmployee?.EmpId || '—' },
                                            { label: 'From CC', value: fromCCFull || '—' },
                                            { label: 'To CC', value: toCC || '—' },
                                            { label: 'Relieving Date', value: formatDateForAPI(relievingDate) || '—' },
                                            { label: 'Joining Date', value: formatDateForAPI(joiningDate) || '—' },
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
                                        : <><Send className="h-4 w-4" /> Submit Transfer</>
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

export default EmployeeTransfer;