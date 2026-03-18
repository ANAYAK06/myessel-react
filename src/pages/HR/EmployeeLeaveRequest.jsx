import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    User, Building2, Loader2, CheckCircle, AlertCircle,
    RotateCcw, Send, Calendar, CalendarDays,
    Plane, Navigation, Hash, Phone, MapPin,
    FileText, ChevronDown,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchEmpDataForLeaveRequest,
    fetchSingleEmpForLeaveRequest,
    fetchEmpBalanceLeave,
    saveLeaveRequest,
    clearSaveResult,
    resetEmployeeLeaveData,
    selectEmpSearchList,
    selectEmpSearchLoading,
    selectLeaveRequestDetails,
    selectLeaveRequestDetailsLoading,
    selectBalanceLeave,
    selectBalanceLeaveLoading,
    selectSaveStatus,
    selectSaveLeaveRequestLoading,
} from '../../slices/HRSlice/employeeLeaveSlice';

// ─── Static Leave Types ────────────────────────────────────────────────────────
const LEAVE_TYPES = [
    { id: 1, name: 'PL — Privilege / Annual Leave' },
    { id: 2, name: 'SL — Sick Leave' },
    { id: 3, name: 'CL — Casual Leave' },
    { id: 4, name: 'ML — Maternity Leave' },
    { id: 5, name: 'PL — Paternity Leave' },
    { id: 6, name: 'EL — Emergency Leave' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Convert "dd-Mon-yyyy" (server) → "DD/MM/YYYY" (display / CustomDatePicker)
const fromServerDate = (serverDate) => {
    if (!serverDate) return null;
    const MON = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };
    const parts = serverDate.split('-');
    if (parts.length !== 3) return null;
    const [dd, mon, yyyy] = parts;
    const mm = MON[mon];
    return mm ? `${dd}/${mm}/${yyyy}` : null;
};

// Normalize a Date object or string to "DD/MM/YYYY" string
const toDisplayDate = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (val instanceof Date) {
        return `${String(val.getDate()).padStart(2, '0')}/${String(val.getMonth() + 1).padStart(2, '0')}/${val.getFullYear()}`;
    }
    return '';
};

// Convert "DD/MM/YYYY" → "dd-Mon-yyyy" (server format)
const toServerDate = (ddmmyyyy) => {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return ddmmyyyy;
    const [dd, mm, yyyy] = parts;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthName = months[parseInt(mm, 10) - 1];
    if (!monthName) return ddmmyyyy;
    return `${dd}-${monthName}-${yyyy}`;
};

// Calculate calendar days between two "DD/MM/YYYY" dates (inclusive)
const calcDays = (from, to) => {
    if (!from || !to) return 0;
    const parse = (dmy) => {
        const [d, m, y] = dmy.split('/').map(Number);
        return new Date(y, m - 1, d);
    };
    const diff = parse(to) - parse(from);
    if (diff < 0) return 0;
    return Math.floor(diff / 86400000) + 1;
};

// ─── Sub-components ────────────────────────────────────────────────────────────
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

const InfoPill = ({ label, value, icon: Icon, color = 'indigo' }) => {
    const colors = {
        indigo: { border: 'border-indigo-200 dark:border-indigo-800', bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400', val: 'text-indigo-700 dark:text-indigo-300' },
        purple: { border: 'border-purple-200 dark:border-purple-800', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400', val: 'text-purple-700 dark:text-purple-300' },
        violet: { border: 'border-violet-200 dark:border-violet-800', bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600 dark:text-violet-400', val: 'text-violet-700 dark:text-violet-300' },
        green:  { border: 'border-green-200 dark:border-green-800',  bg: 'bg-green-50 dark:bg-green-900/20',  icon: 'bg-green-100 dark:bg-green-900/40',  text: 'text-green-600 dark:text-green-400',  val: 'text-green-700 dark:text-green-300' },
        amber:  { border: 'border-amber-200 dark:border-amber-800',  bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'bg-amber-100 dark:bg-amber-900/40',  text: 'text-amber-600 dark:text-amber-400',  val: 'text-amber-700 dark:text-amber-300' },
        gray:   { border: 'border-gray-200 dark:border-gray-700',    bg: 'bg-gray-50 dark:bg-gray-900/40',   icon: 'bg-gray-100 dark:bg-gray-700',        text: 'text-gray-400',                       val: 'text-gray-400' },
    };
    const c = colors[value ? color : 'gray'] ?? colors['gray'];
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${c.border} ${c.bg}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                <Icon className={`h-4 w-4 ${c.text}`} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-bold truncate mt-0.5 ${c.val}`}>{value || 'N/A'}</p>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const EmployeeLeaveRequest = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const userName   = userData?.userName || userData?.username || 'User';
    const userRoleId = userData?.roleId || userData?.RID || 0;

    // ── Selectors ─────────────────────────────────────────────────────────────
    const searchResults  = useSelector(selectEmpSearchList);
    const searchLoading  = useSelector(selectEmpSearchLoading);
    const empData        = useSelector(selectLeaveRequestDetails);
    const empDataLoading = useSelector(selectLeaveRequestDetailsLoading);
    const balanceLeave   = useSelector(selectBalanceLeave);
    const balanceLoading = useSelector(selectBalanceLeaveLoading);
    const saveStatus     = useSelector(selectSaveStatus);
    const saveLoading    = useSelector(selectSaveLeaveRequestLoading);

    // ── Local State ────────────────────────────────────────────────────────────
    const [searchText,       setSearchText]       = useState('');
    const [showDropdown,     setShowDropdown]     = useState(false);
    const [selectedEmpRefNo, setSelectedEmpRefNo] = useState('');
    const [leaveTypeId,      setLeaveTypeId]      = useState('');
    const [fromDate,         setFromDate]         = useState('');
    const [toDate,           setToDate]           = useState('');
    const [remarks,          setRemarks]          = useState('');

    const dropdownRef = useRef(null);
    const searchTimer = useRef(null);

    // computed
    const noOfLeaves  = calcDays(fromDate, toDate);

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    useEffect(() => {
        return () => dispatch(resetEmployeeLeaveData());
    }, [dispatch]);

    // Debounced search
    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (searchText.trim().length >= 2) {
            searchTimer.current = setTimeout(() => {
                dispatch(fetchEmpDataForLeaveRequest(searchText.trim()));
                setShowDropdown(true);
            }, 350);
        } else {
            setShowDropdown(false);
        }
        return () => clearTimeout(searchTimer.current);
    }, [searchText, dispatch]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Save result handling
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Leave request submitted successfully!');
            handleReset();
            dispatch(clearSaveResult());
        } else if (saveStatus === 'failed') {
            toast.error('Submission failed. Please try again.');
            dispatch(clearSaveResult());
        }
    }, [saveStatus]); // eslint-disable-line

    // Auto-fetch balance when all 3 inputs are set
    useEffect(() => {
        if (selectedEmpRefNo && leaveTypeId && fromDate) {
            dispatch(fetchEmpBalanceLeave({
                empRefno:    selectedEmpRefNo,
                leaveTypeid: leaveTypeId,
                fromDate:    toServerDate(fromDate),
            }));
        }
    }, [selectedEmpRefNo, leaveTypeId, fromDate, dispatch]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSelectEmp = useCallback((emp) => {
        setSelectedEmpRefNo(emp.EmpRefNo);
        setSearchText(emp.FirstName || emp.EmpRefNo);
        setShowDropdown(false);
        dispatch(fetchSingleEmpForLeaveRequest(emp.EmpRefNo));
        // reset form fields
        setLeaveTypeId('');
        setFromDate('');
        setToDate('');
        setRemarks('');
    }, [dispatch]);

    const handleReset = useCallback(() => {
        setSearchText('');
        setSelectedEmpRefNo('');
        setLeaveTypeId('');
        setFromDate('');
        setToDate('');
        setRemarks('');
        setShowDropdown(false);
        dispatch(resetEmployeeLeaveData());
        dispatch(clearSaveResult());
    }, [dispatch]);

    const handleSubmit = useCallback(() => {
        if (!selectedEmpRefNo)   { toast.error('Please select an employee.'); return; }
        if (!leaveTypeId)        { toast.error('Please select a leave type.'); return; }
        if (!fromDate)           { toast.error('Please select the from date.'); return; }
        if (!toDate)             { toast.error('Please select the to date.'); return; }
        if (noOfLeaves <= 0)     { toast.error('To date must be on or after from date.'); return; }

        dispatch(saveLeaveRequest({
            EmpRefNo:    selectedEmpRefNo,
            FromDate:    toServerDate(fromDate),
            ToDate:      toServerDate(toDate),
            Noofleaves:  noOfLeaves,
            LeaveTypeId: parseInt(leaveTypeId, 10),
            Remarks:     remarks.trim(),
            Roleid:      userRoleId,
            CreatedBy:   userName,
            Action:      'CheckLeaves',
        }));
    }, [selectedEmpRefNo, leaveTypeId, fromDate, toDate, noOfLeaves, remarks, userName, userRoleId, dispatch]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Plane className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Employee Leave Request</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Submit leave requests for staff members</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Leave</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Leave Request Form Card ──────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <Plane className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Leave Request Form</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Search employee, fill leave details, and submit</p>
                            </div>
                        </div>
                        <button type="button" onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">

                        {/* ── Step 1: Employee Search ───────────────────────── */}
                        <div>
                            <SectionHeader icon={User} title="Select Employee" subtitle="Type at least 2 characters to search by name or employee code" />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                {/* Search input with dropdown */}
                                <div ref={dropdownRef} className="relative">
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Employee <span className="text-rose-500 ml-0.5">*</span>
                                    </label>
                                    <div className="relative">
                                        {searchLoading
                                            ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-500 pointer-events-none" />
                                            : selectedEmpRefNo
                                                ? <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
                                                : <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        }
                                        <input
                                            type="text"
                                            placeholder="Type name or employee code…"
                                            value={searchText}
                                            onChange={(e) => {
                                                setSearchText(e.target.value);
                                                if (selectedEmpRefNo) {
                                                    setSelectedEmpRefNo('');
                                                    dispatch(resetEmployeeLeaveData());
                                                }
                                            }}
                                            className="w-full px-3.5 py-2.5 pr-10 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all"
                                        />
                                    </div>

                                    {/* Dropdown */}
                                    {showDropdown && searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 shadow-xl z-50 max-h-52 overflow-y-auto">
                                            {searchResults.map((emp) => (
                                                <button
                                                    key={emp.EmpRefNo}
                                                    type="button"
                                                    onClick={() => handleSelectEmp(emp)}
                                                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{emp.FirstName}</p>
                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">{emp.EmpRefNo}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {showDropdown && !searchLoading && searchResults.length === 0 && searchText.length >= 2 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl z-50 px-4 py-3 text-center text-sm text-gray-400">
                                            No employees found
                                        </div>
                                    )}
                                </div>

                                {/* Selected employee preview */}
                                {selectedEmpRefNo ? (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                            <User className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{empData?.EmployeeName || searchText}</p>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">ID: {selectedEmpRefNo}</p>
                                            {empData?.CCName && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{empData.CCName}</p>
                                            )}
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 text-gray-400">
                                        <User className="h-5 w-5 opacity-40" />
                                        <p className="text-xs font-medium">Employee details appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Employee Info (after selection) ────────────────── */}
                        {empDataLoading && (
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                                <span className="text-sm text-indigo-700 dark:text-indigo-400">Loading employee details…</span>
                            </div>
                        )}

                        {empData && !empDataLoading && (
                            <>
                                {/* Leave assign status warning */}
                                {empData.LeaveAssignStatus === 'Not Assigned' && (
                                    <div className="flex items-start gap-3 p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                                        <AlertCircle className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-600 dark:text-blue-400">Paid leave balance account is not yet assigned for this employee. Leave request can still be submitted.</p>
                                    </div>
                                )}

                                {/* Employee info grid */}
                                <div>
                                    <SectionHeader icon={User} title="Employee Information" subtitle="Details fetched from the HR system" />
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        <InfoPill label="Employee Name"    value={empData.EmployeeName}      icon={User}        color="indigo" />
                                        <InfoPill label="Employee ID"      value={empData.EmpRefNo}           icon={Hash}        color="purple" />
                                        <InfoPill label="Category"         value={empData.Category}           icon={FileText}    color="violet" />
                                        <InfoPill label="Cost Center"      value={empData.JoiningCostCenter}  icon={Building2}   color="indigo" />
                                        <InfoPill label="CC Name"          value={empData.CCName}             icon={Building2}   color="purple" />
                                        <InfoPill label="Joining Date"     value={empData.JoiningDate}        icon={Calendar}    color="violet" />
                                        <InfoPill label="Balance Leaves"   value={empData.Balanceleaves ? `${empData.Balanceleaves} days` : null} icon={CalendarDays} color="green" />
                                        <InfoPill label="Previous LR Date" value={empData.PreviousLRDate}     icon={Calendar}    color="amber" />
                                    </div>

                                    {/* Contact info row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                        {empData.MobileNo && <InfoPill label="Mobile" value={empData.MobileNo} icon={Phone}  color="indigo" />}
                                        {empData.State    && <InfoPill label="State"  value={empData.State}    icon={MapPin} color="purple" />}
                                    </div>

                                    {/* Leave eligibility period */}
                                    {(empData.Mindate || empData.MaxDate) && (
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {empData.Mindate && (
                                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                                                    <Calendar className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Eligible From</p>
                                                        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{empData.Mindate}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {empData.MaxDate && (
                                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
                                                    <Calendar className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Eligible Until</p>
                                                        <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{empData.MaxDate}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* ── Step 2: Leave Details Form ────────────────── */}
                                <div>
                                    <SectionHeader icon={Plane} title="Leave Details" subtitle="Select leave type, dates, and provide reason" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                        {/* Leave Type */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                                Leave Type <span className="text-rose-500 ml-0.5">*</span>
                                            </label>
                                            <div className="relative">
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                <select
                                                    value={leaveTypeId}
                                                    onChange={(e) => setLeaveTypeId(e.target.value)}
                                                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all">
                                                    <option value="">— Select Leave Type —</option>
                                                    {LEAVE_TYPES.map(lt => (
                                                        <option key={lt.id} value={lt.id}>{lt.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* No of days display */}
                                        <div className="flex items-end">
                                            <div className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all ${noOfLeaves > 0 ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20'}`}>
                                                <CalendarDays className={`h-6 w-6 flex-shrink-0 ${noOfLeaves > 0 ? 'text-indigo-500' : 'text-gray-400'}`} />
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Days Requested</p>
                                                    <p className={`text-2xl font-black ${noOfLeaves > 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-400'}`}>
                                                        {noOfLeaves > 0 ? noOfLeaves : '—'}
                                                    </p>
                                                </div>
                                                {/* Balance from API */}
                                                {balanceLeave && (
                                                    <div className="ml-auto text-right">
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Balance</p>
                                                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                                            {balanceLoading
                                                                ? <Loader2 className="h-4 w-4 animate-spin inline" />
                                                                : `${balanceLeave?.Balanceleaves ?? balanceLeave} days`
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* From Date */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                                From Date <span className="text-rose-500 ml-0.5">*</span>
                                            </label>
                                            <CustomDatePicker
                                                value={fromDate}
                                                onChange={(val) => {
                                                    const str = toDisplayDate(val);
                                                    setFromDate(str);
                                                    if (toDate && calcDays(str, toDate) <= 0) setToDate('');
                                                }}
                                                format="DD/MM/YYYY"
                                                minDate={fromServerDate(empData.Mindate)}
                                                maxDate={fromServerDate(empData.MaxDate)}
                                                placeholder="Select from date"
                                            />
                                        </div>

                                        {/* To Date */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                                To Date <span className="text-rose-500 ml-0.5">*</span>
                                            </label>
                                            <CustomDatePicker
                                                value={toDate}
                                                onChange={(val) => setToDate(toDisplayDate(val))}
                                                format="DD/MM/YYYY"
                                                minDate={fromDate || fromServerDate(empData.Mindate)}
                                                maxDate={fromServerDate(empData.MaxDate)}
                                                placeholder="Select to date"
                                            />
                                        </div>

                                        {/* Remarks */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                                Reason / Remarks
                                            </label>
                                            <textarea
                                                rows={3}
                                                placeholder="Provide reason for leave request…"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                maxLength={500}
                                                className="w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all resize-none"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1 text-right">{remarks.length}/500</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Action Bar ───────────────────────────────────────────── */}
                {empData && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Ready to submit?</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {noOfLeaves > 0
                                        ? <><span className="font-bold text-indigo-600 dark:text-indigo-400">{noOfLeaves} day(s)</span> leave requested{leaveTypeId ? ` · ${LEAVE_TYPES.find(l => String(l.id) === String(leaveTypeId))?.name || ''}` : ''}</>
                                        : 'Fill in leave details above'
                                    }
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={handleReset}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600">
                                    <RotateCcw className="h-4 w-4" /> Reset
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={saveLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {saveLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                        : <><Send className="h-4 w-4" /> Submit Request</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeLeaveRequest;
