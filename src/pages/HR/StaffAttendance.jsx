import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import {
    fetchAllEmpCostCenters,
    fetchCCHolidays,
    fetchCCMinJoiningDate,
    fetchCheckPreviousAttendance,
    fetchCCEmpDataForAttendance,
    saveStaffAttendance,
    setAttendanceType,
    setAllAttendanceType,
    clearCCData,
    clearEmployeeList,
    clearSaveResult,
    resetAll,
    selectCostCentersArray,
    selectCostCentersLoading,
    selectMinDate,
    selectPrevAttendance,
    selectEmployeeListArray,
    selectLocalAttendance,
    selectEmployeeListLoading,
    selectEmployeeListError,
    selectPrevAttendanceLoading,
    selectSaveStatus,
    selectSaveLoading,
    selectSaveError,
    selectAttendanceSummary,
} from '../../slices/HRSlice/staffAttendanceEntrySlice';

import CustomDatePicker from '../../components/CustomDatePicker';
import {
    Building2, Calendar, Users, Loader2, AlertCircle,
    CheckCircle, RotateCcw, Send, ChevronDown,
    UserCheck, AlertTriangle, Info, TrendingUp, FileText, Navigation,
} from 'lucide-react';

// ==============================================
// ATTENDANCE TYPE CONFIG
// ==============================================
const ATT_TYPES = [
    { code: 'P',  label: 'Present',    bg: 'bg-emerald-500', text: 'text-emerald-700', lightBg: 'bg-emerald-50 dark:bg-emerald-900/30', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
    { code: 'H',  label: 'Holiday',    bg: 'bg-purple-500',  text: 'text-purple-700',  lightBg: 'bg-purple-50 dark:bg-purple-900/30',  badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'  },
    { code: 'A',  label: 'Absent',     bg: 'bg-rose-500',    text: 'text-rose-700',    lightBg: 'bg-rose-50 dark:bg-rose-900/30',    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'    },
    { code: 'HD', label: 'Half Day',   bg: 'bg-amber-500',   text: 'text-amber-700',   lightBg: 'bg-amber-50 dark:bg-amber-900/30',   badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'   },
    { code: 'S',  label: 'Sunday',     bg: 'bg-blue-400',    text: 'text-blue-700',    lightBg: 'bg-blue-50 dark:bg-blue-900/30',     badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'     },
    { code: 'PL', label: 'Paid Leave', bg: 'bg-teal-500',    text: 'text-teal-700',    lightBg: 'bg-teal-50 dark:bg-teal-900/30',    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'    },
    { code: 'T',  label: 'Travelling', bg: 'bg-orange-500',  text: 'text-orange-700',  lightBg: 'bg-orange-50 dark:bg-orange-900/30',  badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'  },
];

const ATT_MAP = Object.fromEntries(ATT_TYPES.map((a) => [a.code, a]));

// ==============================================
// HELPERS
// ==============================================
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatDateForAPI = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${d.getDate()}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};

const parseDateString = (str) => {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const day   = parseInt(parts[0]);
    const month = MONTHS.indexOf(parts[1]);
    const year  = parseInt(parts[2]);
    if (month === -1 || isNaN(day) || isNaN(year)) return null;
    return new Date(year, month, day);
};

// ==============================================
// SUB-COMPONENTS
// ==============================================
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
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

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all';

// Attendance type toggle buttons for a single employee row
const AttToggle = React.memo(({ empId, current, disabled }) => {
    const dispatch = useDispatch();
    return (
        <div className="flex flex-wrap gap-1">
            {ATT_TYPES.map((att) => (
                <button
                    key={att.code}
                    disabled={disabled}
                    onClick={() => dispatch(setAttendanceType({ empId, attType: att.code }))}
                    title={att.label}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all border-2 ${
                        current === att.code
                            ? `${att.bg} text-white border-transparent shadow-md scale-105`
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {att.code}
                </button>
            ))}
        </div>
    );
});

// Previous Saturday/Sunday attendance status banner
const PrevAttendanceBanner = ({ prevAttendance }) => {
    if (!prevAttendance) return null;

    const parse = (val) => {
        if (!val) return { status: 'unknown', date: '' };
        const [status, date] = val.split('/');
        return { status, date };
    };

    const sun = parse(prevAttendance.SundayAttendance);
    const sat = parse(prevAttendance.SaturdayAttendance);
    const hasNotExist = sun.status === 'NotExist' || sat.status === 'NotExist';

    return (
        <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row gap-3 ${
            hasNotExist
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
        }`}>
            <div className="flex items-center gap-2 flex-1">
                {hasNotExist
                    ? <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    : <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                }
                <span className={`text-sm font-semibold ${hasNotExist ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                    Previous Attendance Status
                </span>
            </div>
            <div className="flex gap-4 text-xs">
                {[{ label: 'Sunday', data: sun }, { label: 'Saturday', data: sat }].map(({ label, data }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <span className="text-gray-500 dark:text-gray-400">{label} ({data.date}):</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full ${
                            data.status === 'Exist'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>{data.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Summary card per attendance type
const SummaryCard = ({ att, count }) => (
    <div className={`flex flex-col items-center p-3 rounded-xl ${att.lightBg}`}>
        <span className={`text-xl font-black ${att.text}`}>{count}</span>
        <span className={`text-xs font-semibold mt-0.5 ${att.text}`}>{att.label}</span>
    </div>
);

// ==============================================
// MAIN COMPONENT
// ==============================================
const StaffAttendance = () => {
    const dispatch = useDispatch();

    const { userData } = useSelector((state) => state.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'User';

    const costCenters        = useSelector(selectCostCentersArray);
    const costCentersLoading = useSelector(selectCostCentersLoading);
    const minDate            = useSelector(selectMinDate);
    const prevAttendance     = useSelector(selectPrevAttendance);

    const employeeList    = useSelector(selectEmployeeListArray);
    const localAttendance = useSelector(selectLocalAttendance);
    const empListLoading  = useSelector(selectEmployeeListLoading);
    const empListError    = useSelector(selectEmployeeListError);
    const prevAttLoading  = useSelector(selectPrevAttendanceLoading);

    const saveStatus  = useSelector(selectSaveStatus);
    const saveLoading = useSelector(selectSaveLoading);
    const saveError   = useSelector(selectSaveError);
    const summary     = useSelector(selectAttendanceSummary);

    const [selectedCC,   setSelectedCC]   = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [remarks,      setRemarks]      = useState('');
    const [search,       setSearch]       = useState('');

    // Load cost centers on mount
    useEffect(() => {
        dispatch(fetchAllEmpCostCenters());
        return () => { dispatch(resetAll()); };
    }, [dispatch]);

    // When CC changes: load holidays + min date, clear employee data
    const handleCCChange = useCallback((ccCode) => {
        setSelectedCC(ccCode);
        setSelectedDate(null);
        dispatch(clearCCData());
        if (ccCode) {
            dispatch(fetchCCHolidays(ccCode));
            dispatch(fetchCCMinJoiningDate(ccCode));
        }
    }, [dispatch]);

    // When date changes: clear employee list
    const handleDateChange = useCallback((date) => {
        setSelectedDate(date);
        dispatch(clearEmployeeList());
    }, [dispatch]);

    // Load employees for selected CC + date
    const handleLoadAttendance = useCallback(() => {
        if (!selectedCC)   { toast.warn('Please select a cost center.'); return; }
        if (!selectedDate) { toast.warn('Please select an attendance date.'); return; }
        const attDate = formatDateForAPI(selectedDate);
        dispatch(fetchCheckPreviousAttendance({ ccCode: selectedCC, attDate }));
        dispatch(fetchCCEmpDataForAttendance({ ccCode: selectedCC, attDate }));
    }, [selectedCC, selectedDate, dispatch]);

    // Save success / failure toasts + reset
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Attendance submitted successfully!');
            dispatch(clearSaveResult());
            dispatch(clearEmployeeList());
            setSelectedDate(null);
            setRemarks('');
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
        }
    }, [saveStatus, saveError, dispatch]);

    // Submit handler
    const handleSubmit = useCallback(() => {
        if (!selectedCC || !selectedDate) { toast.warn('Please select CC and date.'); return; }
        if (employeeList.length === 0)    { toast.warn('No employees loaded.'); return; }

        const attDate  = formatDateForAPI(selectedDate);
        const empIds   = employeeList.map((e) => e.EmpId).join(',') + ',';
        const attTypes = employeeList.map((e) => localAttendance[e.EmpId] || 'P').join(',') + ',';

        dispatch(saveStaffAttendance({
            ccCode:          selectedCC,
            attDate:         attDate,
            employeeIds:     empIds,
            attendanceTypes: attTypes,
            remarks:         remarks.trim(),
            createdBy:       userName,
            roleId:          roleId,
        }));
    }, [selectedCC, selectedDate, employeeList, localAttendance, remarks, userName, roleId, dispatch]);

    const filteredEmps = useMemo(() => {
        if (!search.trim()) return employeeList;
        const q = search.toLowerCase();
        return employeeList.filter(
            (e) => e.EmpName?.toLowerCase().includes(q) || e.EmpId?.toLowerCase().includes(q)
        );
    }, [employeeList, search]);

    const minDateObj    = useMemo(() => parseDateString(minDate), [minDate]);
    const hasEmployees  = employeeList.length > 0;
    const isLoadingEmps = empListLoading || prevAttLoading;
    const isBusy        = isLoadingEmps || saveLoading;
    const isFormValid   = Boolean(selectedCC && selectedDate && hasEmployees);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <UserCheck className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Staff Attendance Entry</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Mark daily attendance for staff by cost center</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Attendance</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Filter Section ─────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Cost Center &amp; Date Selection</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Select cost center first, then pick an attendance date</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => { dispatch(clearCCData()); dispatch(clearEmployeeList()); setSelectedCC(''); setSelectedDate(null); setRemarks(''); setSearch(''); }}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader
                            icon={Building2}
                            title="Cost Center &amp; Date Selection"
                            subtitle="Select cost center first, then pick an attendance date"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">

                            {/* Cost Center */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Cost Center <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedCC}
                                        onChange={(e) => handleCCChange(e.target.value)}
                                        disabled={costCentersLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10 disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        <option value="">
                                            {costCentersLoading ? 'Loading...' : '— Select Cost Center —'}
                                        </option>
                                        {costCenters.map((cc) => (
                                            <option key={cc.CC_Code} value={cc.CC_Code}>
                                                {cc.CC_Name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        {costCentersLoading
                                            ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                                            : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            {/* Date Picker */}
                            <div>
                                <CustomDatePicker
                                    label="Attendance Date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    format="DD-MMM-YYYY"
                                    minDate={minDateObj}
                                    maxDate={new Date()}
                                    disabled={!selectedCC || isBusy}
                                    placeholder="Select attendance date"
                                />
                                {minDate && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Min date: {minDate}
                                    </p>
                                )}
                            </div>

                            {/* Load Button */}
                            <div>
                                <button
                                    onClick={handleLoadAttendance}
                                    disabled={!selectedCC || !selectedDate || isBusy}
                                    className="flex items-center justify-center gap-2 w-full px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoadingEmps
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                                        : <><Users className="h-4 w-4" /> Load Employees</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Previous Attendance Banner ─────────────────────────── */}
                {prevAttendance && (
                    <div className="max-w-7xl">
                        <PrevAttendanceBanner prevAttendance={prevAttendance} />
                    </div>
                )}

                {/* ── Employee List Error ────────────────────────────────── */}
                {empListError && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{empListError}</span>
                    </div>
                )}

                {/* ── Attendance Table ───────────────────────────────────── */}
                {hasEmployees && (
                    <>
                        {/* Summary + Bulk Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Attendance Summary</h2>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{summary.total} employees loaded</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Mark all:</span>
                                    {ATT_TYPES.map((att) => (
                                        <button
                                            key={att.code}
                                            disabled={saveLoading}
                                            onClick={() => dispatch(setAllAttendanceType({ attType: att.code }))}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold ${att.badge} disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity`}
                                        >
                                            {att.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {ATT_TYPES.map((att) => (
                                        <SummaryCard key={att.code} att={att} count={summary[att.code] || 0} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Employee Attendance Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-indigo-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                        Attendance — {formatDateForAPI(selectedDate)}
                                    </h2>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{selectedCC} · {employeeList.length} employees</p>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 pb-0">
                                <SectionHeader
                                    icon={Calendar}
                                    title={`Attendance — ${formatDateForAPI(selectedDate)}`}
                                    subtitle={`${selectedCC} · ${employeeList.length} employees`}
                                />
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by name or employee ID..."
                                        className="w-full sm:w-80 px-3.5 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 hover:border-gray-300 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">#</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Group</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Day</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mark Attendance</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmps.map((emp) => {
                                            const current = localAttendance[emp.EmpId] || 'P';
                                            const attInfo = ATT_MAP[current];
                                            return (
                                                <tr
                                                    key={emp.EmpId}
                                                    className="border-b border-gray-50 dark:border-gray-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                                                >
                                                    <td className="py-3 px-4 text-xs text-gray-400">{emp.RowNo}</td>
                                                    <td className="py-3 px-4">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{emp.EmpName}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">{emp.EmpId}</p>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">{emp.Category || '—'}</td>
                                                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                                                        {emp.GroupName ? `${emp.GroupName} (${emp.GroupId})` : '—'}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{emp.WeekDayName || '—'}</td>
                                                    <td className="py-3 px-4">
                                                        <AttToggle empId={emp.EmpId} current={current} disabled={saveLoading} />
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${attInfo?.badge || ''}`}>
                                                            {attInfo?.label || current}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredEmps.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                                                    No employees match the search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Remarks Card ───────────────────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center gap-3">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Remarks &amp; Submission</h2>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Add remarks and submit attendance</p>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <SectionHeader icon={FileText} title="Remarks &amp; Submission" />
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Remarks
                                </label>
                                <textarea
                                    rows={3}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    disabled={saveLoading}
                                    placeholder="Add any remarks (optional)..."
                                    className={`${inputCls} resize-none disabled:opacity-60 disabled:cursor-not-allowed`}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* ── Action Bar ──────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Ready to submit?</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {isFormValid
                                    ? <>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{employeeList.length} employees</span>
                                        {selectedDate ? ` · ${formatDateForAPI(selectedDate)}` : ''}
                                        {selectedCC ? ` · ${selectedCC}` : ''}
                                      </>
                                    : 'Select a cost center, date and load employees first'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(clearEmployeeList());
                                    setSelectedDate(null);
                                    setRemarks('');
                                }}
                                disabled={saveLoading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-4 w-4" /> Reset
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saveLoading || !hasEmployees}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {saveLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                                    : <><Send className="h-4 w-4" /> Submit Attendance</>
                                }
                            </button>
                        </div>
                    </div>

                    {!isFormValid && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg px-4 py-2.5">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Please select a cost center, date, and load employees before submitting.</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StaffAttendance;
