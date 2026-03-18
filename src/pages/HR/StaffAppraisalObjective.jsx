import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Target, User, Calendar, FileText, Building2,
    Loader2, CheckCircle, RotateCcw, Send,
    ChevronDown, Navigation, Briefcase, Clock, AlertCircle,
} from 'lucide-react';
import {
    fetchAllEmployees,
    fetchEmpDetails,
    saveAppraisalObjective,
    clearSaveResult,
    clearEmpDetails,
    resetCreationFlow,
    selectEmpList,
    selectEmpDetails,
    selectSaveStatus,
    selectSaveLoading,
    selectEmpListLoading,
    selectEmpDetailsLoading,
} from '../../slices/HRSlice/staffAppraisalSlice';

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTH_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Sub-components ───────────────────────────────────────────────────────────
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

const readOnlyInputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-gray-50 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700/60 cursor-not-allowed select-none';

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffAppraisalObjective = () => {
    const dispatch = useDispatch();

    const { userData }  = useSelector((s) => s.auth);
    const userName      = userData?.userName || userData?.username || 'User';
    const userRoleId    = userData?.roleId   || userData?.RID      || 0;

    const empList           = useSelector(selectEmpList);
    const empDetails        = useSelector(selectEmpDetails);
    const saveStatus        = useSelector(selectSaveStatus);
    const saveLoading       = useSelector(selectSaveLoading);
    const empListLoading    = useSelector(selectEmpListLoading);
    const empDetailsLoading = useSelector(selectEmpDetailsLoading);

    // ── Local state ───────────────────────────────────────────────────────────
    const [selectedEmp, setSelectedEmp] = useState('');
    const [year,        setYear]        = useState('');
    const [month,       setMonth]       = useState('');
    const [remarks,     setRemarks]     = useState('');

    // ── Year range ────────────────────────────────────────────────────────────
    const yearOptions = useMemo(() => {
        const current = new Date().getFullYear();
        const years = [];
        for (let y = current - 2; y <= current + 1; y++) years.push(y);
        return years;
    }, []);

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAllEmployees());
        return () => { dispatch(resetCreationFlow()); };
    }, [dispatch]);

    // ── On employee change ────────────────────────────────────────────────────
    const handleEmpChange = (e) => {
        const val = e.target.value;
        setSelectedEmp(val);
        dispatch(clearEmpDetails());
        if (val) dispatch(fetchEmpDetails(val));
    };

    // ── Handle save status ────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Appraisal objective submitted successfully!');
            setSelectedEmp('');
            setYear('');
            setMonth('');
            setRemarks('');
            dispatch(clearSaveResult());
            dispatch(clearEmpDetails());
        } else if (saveStatus === 'failed') {
            toast.error('Submission failed. Please try again.');
            dispatch(clearSaveResult());
        }
    }, [saveStatus]); // eslint-disable-line

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setSelectedEmp('');
        setYear('');
        setMonth('');
        setRemarks('');
        dispatch(clearEmpDetails());
        dispatch(clearSaveResult());
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!selectedEmp)          { toast.error('Please select an employee.');       return; }
        if (!year)                 { toast.error('Please select an appraisal year.'); return; }
        if (!month)                { toast.error('Please select an appraisal month.'); return; }
        if (!remarks.trim())       { toast.error('Please enter remarks / objectives.'); return; }

        dispatch(saveAppraisalObjective({
            EmpRefNo:          String(selectedEmp),
            CCCode:            empDetails?.JoiningCostCenter || empDetails?.CCCode || '',
            Remarks:           remarks.trim(),
            Year:              parseInt(year, 10),
            Month:             parseInt(month, 10),
            RoleId:            Number(userRoleId),
            OldDesignationId:  empDetails?.OldDesignationId  || 0,
            NewDesignationId:  empDetails?.NewDesignationId  || empDetails?.OldDesignationId || 0,
            Createdby:         userName,
        }));
    };

    const isFormValid = Boolean(selectedEmp && year && month && remarks.trim().length > 0);

    // ─────────────────────────────────────────────────────────────────────────
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
                                <Target className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Appraisal Objective &amp; Goals</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Set and submit employee appraisal objectives and goals</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Appraisal</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ═══ Section 1: Employee Selection ═══ */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Employee Selection</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Select the employee for this appraisal</p>
                            </div>
                        </div>
                        <button type="button" onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader icon={User} title="Select Employee" subtitle="Choose the employee for whom this appraisal objective is being raised" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Employee <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedEmp}
                                        onChange={handleEmpChange}
                                        disabled={empListLoading}
                                        className={`${inputCls} appearance-none pr-10 disabled:opacity-60 disabled:cursor-not-allowed`}>
                                        <option value="">{empListLoading ? 'Loading employees…' : '— Select Employee —'}</option>
                                        {Array.isArray(empList) && empList
                                            .filter((emp, idx, arr) => arr.findIndex((e) => e.EmpRefNo === emp.EmpRefNo) === idx)
                                            .map((emp) => (
                                                <option key={emp.EmpRefNo} value={emp.EmpRefNo}>{emp.EmpName || emp.Name}</option>
                                            ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        {empListLoading
                                            ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                                            : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Employee details strip */}
                        {selectedEmp && (
                            <div className="mt-5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
                                {empDetailsLoading ? (
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Fetching employee details…</span>
                                    </div>
                                ) : empDetails ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee Name</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{empDetails.Name || empDetails.EmployeeName || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                                                <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{empDetails.Category || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                                <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Designated As</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{empDetails.DesignatedAs || empDetails.Designation || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                                                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{empDetails.Department || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                                <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost Centre</p>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{empDetails.JoiningCostCenter || empDetails.CCCode || '—'}</p>
                                            </div>
                                        </div>
                                        {empDetails.LastAppraisalDate && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                                                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Appraisal Date</p>
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{empDetails.LastAppraisalDate}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-sm text-indigo-600 dark:text-indigo-400">Employee details will appear here once loaded.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ Section 2: Appraisal Period ═══ */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Appraisal Period</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Select the year and month for this appraisal</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader icon={Calendar} title="Appraisal Period" subtitle="Select the year and month for this appraisal objective" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Year */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Year <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">— Select Year —</option>
                                        {yearOptions.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Month */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Month <span className="text-rose-500 ml-0.5">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">— Select Month —</option>
                                        {MONTH_FULL.map((m, idx) => (
                                            <option key={idx + 1} value={idx + 1}>{m}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Period summary strip */}
                        {year && month && (
                            <div className="mt-5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-5 py-4">
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Appraisal Period</span>
                                        <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                            {MONTH_FULL[parseInt(month, 10) - 1]} {year}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ Section 3: Remarks / Objectives ═══ */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Remarks / Objectives</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Describe the appraisal objectives and goals</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <SectionHeader icon={FileText} title="Appraisal Objectives &amp; Goals" subtitle="Provide a clear description of the objectives and goals for this appraisal period" />
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            Remarks / Objectives <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        <textarea
                            rows={5}
                            placeholder="Enter the appraisal objectives and goals for this employee…"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            maxLength={1000}
                            className={`${inputCls} resize-none`}
                        />
                        <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500 text-right">{remarks.trim().length} / 1000</p>
                    </div>
                </div>

                {/* ═══ Action Bar ═══ */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Ready to submit?</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {isFormValid
                                    ? <>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Appraisal Objective</span>
                                        {year && month ? ` · ${MONTH_FULL[parseInt(month, 10) - 1]} ${year}` : ''}
                                      </>
                                    : 'Fill in all required fields above'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={saveLoading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-4 w-4" /> Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!isFormValid || saveLoading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {saveLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                    : <><Send className="h-4 w-4" /> Submit Objective</>
                                }
                            </button>
                        </div>
                    </div>

                    {!isFormValid && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg px-4 py-2.5">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Please fill in all required fields before submitting.</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StaffAppraisalObjective;
