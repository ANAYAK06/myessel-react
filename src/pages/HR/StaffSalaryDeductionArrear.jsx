import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    fetchSalaryDeductionEmp,
    fetchSalaryPendingYear,
    fetchBindSalaryDeductionMonths,
    fetchEmpDeductionsForMonth,
    saveSingleEmpSalaryDeduction,
    updateSingleSalaryDeduction,
    saveSalaryDeductions,
    fetchArearHeads,
    fetchArearsCC,
    saveArear,
    fetchSalaryDeductionsByEmpTransNo,
    setSelectedEmpRefNo,
    setSelectedYear,
    setSelectedMonth,
    setSelectedArearHead,
    clearDeductionSaveResult,
    clearDeductionUpdateResult,
    clearDeductionBulkSaveResult,
    clearArearSaveResult,
    clearSalaryDeductionsByTransNo,
    resetDeductionData,
    resetArearData,
    selectSalaryDeductionEmployeesArray,
    selectSalaryPendingYearsArray,
    selectSalaryDeductionMonthsArray,
    selectEmpDeductionsForMonth,
    selectArearHeadsArray,
    selectArearsCostCentersArray,
    selectSalaryDeductionEmployeesLoading,
    selectSalaryPendingYearsLoading,
    selectSalaryDeductionMonthsLoading,
    selectEmpDeductionsForMonthLoading,
    selectSaveDeductionLoading,
    selectUpdateDeductionLoading,
    selectSaveBulkDeductionLoading,
    selectArearHeadsLoading,
    selectArearsCostCentersLoading,
    selectSaveArearLoading,
    selectSelectedEmpRefNo,
    selectSelectedYear,
    selectSelectedMonth,
    selectSelectedArearHead,
    selectDeductionSaveStatus,
    selectDeductionUpdateStatus,
    selectDeductionBulkSaveStatus,
    selectArearSaveStatus,
    fetchPendingSalaryDeductions,
    selectPendingSalaryDeductionsArray,
    selectPendingSalaryDeductionsLoading,
    fetchPendingSalaryArear,
    updateArear,
    saveSalaryArears,
    clearArearUpdateResult,
    clearArearBulkSaveResult,
    selectPendingSalaryArearsArray,
    selectPendingSalaryArearsLoading,
    selectUpdateArearLoading,
    selectSaveBulkArearLoading,
    selectArearUpdateStatus,
    selectArearBulkSaveStatus,
} from '../../slices/HRSlice/staffSalaryDeductionArrearSlice';
import {
    User, Calendar, Building, IndianRupee, Search, Loader2,
    Save, RotateCcw, Filter, X, CheckCircle, XCircle,
    AlertCircle, Minus, FileText, ArrowRight, Banknote, Scissors,
    Edit2, Trash2, Send, Users, ChevronDown, ChevronUp, Check, RefreshCw, Plus,
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return new Intl.NumberFormat('en-IN', { style: 'decimal', minimumFractionDigits: 2 }).format(amount);
};

const parseEmpName = (emp) => {
    const raw = emp?.FirstName || emp?.Name || emp?.EmpRefNo || '';
    return raw.replace(/\s*\([^)]*\)\s*$/, '').trim() || emp?.EmpRefNo || '';
};

const MONTHS = [
    { value: '1', label: 'January' },   { value: '2',  label: 'February' },
    { value: '3', label: 'March' },     { value: '4',  label: 'April' },
    { value: '5', label: 'May' },       { value: '6',  label: 'June' },
    { value: '7', label: 'July' },      { value: '8',  label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

const monthLabel = (mv) => MONTHS.find(m => m.value === String(mv))?.label || '';

// ─── Sub-components ────────────────────────────────────────────────────────────

const SectionCard = ({ title, icon: Icon, gradient = 'from-indigo-600 to-purple-600', children, badge }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-visible">
        <div className={`bg-gradient-to-r ${gradient} rounded-t-2xl px-6 py-4 flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
                {Icon && <Icon className="h-5 w-5 text-white" />}
                <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
            {badge && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold">{badge}</span>
            )}
        </div>
        <div className="p-6 md:p-8">{children}</div>
    </div>
);

const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all
                    ${active
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
    >
        <Icon className="h-4 w-4" />
        {label}
        {count > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/25 text-white' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'}`}>
                {count}
            </span>
        )}
    </button>
);

const SaveBanner = ({ status, message, onClose }) => {
    if (!status || status === 'pending') return null;
    const ok = status === 'success';
    const isDuplicate = status === 'duplicate';
    return (
        <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2
                         ${ok
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
                            : isDuplicate
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'}`}>
            {ok
                ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                : isDuplicate
                    ? <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />}
            <p className="text-sm font-semibold flex-1">{message}</p>
            <button onClick={onClose} className="hover:opacity-70"><X className="h-4 w-4" /></button>
        </div>
    );
};

const EmpResultList = ({ employees, onSelect }) => {
    if (!employees?.length) return null;
    return (
        <div className="mt-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-56 overflow-y-auto"
             style={{ scrollbarWidth: 'thin', scrollbarColor: '#a5b4fc #f3f4f6' }}>
            {employees.map(emp => (
                <button
                    key={emp.EmpRefNo}
                    onClick={() => onSelect(emp)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                               border-b border-gray-100 dark:border-gray-700 last:border-0
                               flex items-center justify-between text-gray-700 dark:text-gray-200 transition-colors"
                >
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{parseEmpName(emp)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{emp.EmpRefNo}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                </button>
            ))}
        </div>
    );
};

const SelectedEmpBadge = ({ emp, onClear, colorClass = 'indigo' }) => {
    const c = colorClass === 'violet'
        ? { wrap: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800', avatar: 'bg-violet-600', name: 'text-violet-800 dark:text-violet-200', id: 'text-violet-500 dark:text-violet-400', btn: 'hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-600 dark:text-violet-400' }
        : { wrap: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', avatar: 'bg-indigo-600', name: 'text-indigo-800 dark:text-indigo-200', id: 'text-indigo-500 dark:text-indigo-400', btn: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' };
    return (
        <div className={`mt-3 flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${c.wrap}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${c.avatar}`}>
                <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${c.name}`}>{parseEmpName(emp)}</p>
                <p className={`text-xs ${c.id}`}>{emp.EmpRefNo}</p>
            </div>
            <button onClick={onClear} className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${c.btn}`}>
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

// Simple deduction row — no "new head" UI, just existing heads from API
const DeductionRow = ({ head, amount, onChange }) => (
    <div className="grid grid-cols-2 items-center border-b border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800">
        <div className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Scissors className="h-3 w-3 text-rose-400 flex-shrink-0" />
            <span className="truncate">{head}</span>
        </div>
        <div className="px-4 py-2">
            <input
                type="number"
                value={amount}
                onChange={e => onChange(e.target.value)}
                className="w-full text-right text-sm px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500
                           dark:bg-gray-700 dark:text-white"
            />
        </div>
    </div>
);

// ─── Queued Employee Row ───────────────────────────────────────────────────────
const QueuedEmpRow = ({ item, index, onEdit, onRemove, isEditing }) => {
    const totalAmt = item.deductionAmounts
        .split(',')
        .filter(Boolean)
        .reduce((s, v) => s + Number(v), 0);

    return (
        <tr className={`border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors
                        ${isEditing
                            ? 'bg-amber-50 dark:bg-amber-900/10'
                            : index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/60 dark:bg-gray-800/60'}`}>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{index + 1}</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.empName}</p>
                        <p className="text-xs text-gray-400">{item.empRefNo}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {monthLabel(item.month)} {item.year}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {item.loadingHeads ? (
                    <div className="flex items-center gap-2 text-indigo-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="text-xs">Loading…</span>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {item.deductionHeads.split(',').filter(Boolean).map((h, i) => (
                            <span key={i} className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded text-xs font-medium">
                                {h}
                            </span>
                        ))}
                    </div>
                )}
            </td>
            <td className="px-4 py-3 text-right">
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    {item.loadingHeads ? '—' : `₹${formatCurrency(totalAmt)}`}
                </span>
            </td>
            <td className="px-4 py-3">
                {item.savedTransRefNo ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                        <Check className="h-3.5 w-3.5" /> Saved
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" /> Pending
                    </span>
                )}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={() => onEdit(item)}
                        disabled={!!item.loadingHeads}
                        title="Edit deduction"
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                                    ${isEditing
                                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                        : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400'}`}
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onRemove(item.localId)}
                        title="Remove from queue"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const StaffSalaryDeductionArrear = () => {
    const dispatch = useDispatch();

    const { userData } = useSelector(s => s.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid    = userData?.UID    || userData?.uid;
    const userName = userData?.userName || userData?.username || 'User';
    console.log('userData:', userData);

    // ── Tab ───────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('deduction');

    // ── Redux selectors ───────────────────────────────────────────────────────
    const deductionEmployees      = useSelector(selectSalaryDeductionEmployeesArray);
    const salaryPendingYears      = useSelector(selectSalaryPendingYearsArray);
    const deductionMonths         = useSelector(selectSalaryDeductionMonthsArray);
    const empDeductionsForMonth   = useSelector(selectEmpDeductionsForMonth);
    const arearHeads              = useSelector(selectArearHeadsArray);
    const arearsCostCenters       = useSelector(selectArearsCostCentersArray);
    const pendingSalaryDeductions = useSelector(selectPendingSalaryDeductionsArray);
    const pendingDedLoading       = useSelector(selectPendingSalaryDeductionsLoading);
    const deductionSaveStatus     = useSelector(selectDeductionSaveStatus);
    const deductionUpdateStatus   = useSelector(selectDeductionUpdateStatus);
    const deductionBulkSaveStatus = useSelector(selectDeductionBulkSaveStatus);
    const arearSaveStatus         = useSelector(selectArearSaveStatus);
    const arearUpdateStatus       = useSelector(selectArearUpdateStatus);
    const arearBulkSaveStatus     = useSelector(selectArearBulkSaveStatus);
    const pendingSalaryArears     = useSelector(selectPendingSalaryArearsArray);
    const pendingArearLoading     = useSelector(selectPendingSalaryArearsLoading);
    const selectedEmpRefNo        = useSelector(selectSelectedEmpRefNo);
    const selectedYear            = useSelector(selectSelectedYear);
    const selectedMonth           = useSelector(selectSelectedMonth);
    const selectedArearHead       = useSelector(selectSelectedArearHead);

    // Loading
    const dedEmpLoading    = useSelector(selectSalaryDeductionEmployeesLoading);
    const yearLoading      = useSelector(selectSalaryPendingYearsLoading);
    const monthLoading     = useSelector(selectSalaryDeductionMonthsLoading);
    const dedDetailLoading = useSelector(selectEmpDeductionsForMonthLoading);
    const saveDedLoading   = useSelector(selectSaveDeductionLoading);
    const updateDedLoading = useSelector(selectUpdateDeductionLoading);
    const bulkSaveLoading  = useSelector(selectSaveBulkDeductionLoading);
    const arearHeadLoading = useSelector(selectArearHeadsLoading);
    const arearCCLoading   = useSelector(selectArearsCostCentersLoading);
    const saveArearLoading   = useSelector(selectSaveArearLoading);
    const updateArearLoading = useSelector(selectUpdateArearLoading);
    const bulkArearLoading   = useSelector(selectSaveBulkArearLoading);

    // ── Local state: Deduction form ───────────────────────────────────────────
    const [dedPrefix,      setDedPrefix]      = useState('');
    const [selectedDedEmp, setSelectedDedEmp] = useState(null);
    const [showDedList,    setShowDedList]    = useState(false);
    const [dedAmounts,     setDedAmounts]     = useState({});
    // NOTE: newDedHeads removed — heads come from API only (GetSalaryDeductionsbyEmpTransNo)

    // ── Queue state ───────────────────────────────────────────────────────────
    const [queuedEmployees,  setQueuedEmployees]  = useState([]);
    const [editingQueueItem, setEditingQueueItem] = useState(null);
    const [localIdCounter,   setLocalIdCounter]   = useState(1);
    const [showQueue,        setShowQueue]         = useState(true);

    // ── Arrear Queue state ───────────────────────────────────────────────────
    const [arearQueue,          setArearQueue]          = useState([]);
    const [arearEditingItem,    setArearEditingItem]    = useState(null);
    const [arearLocalIdCounter, setArearLocalIdCounter] = useState(1);
    const [showArearQueue,      setShowArearQueue]      = useState(true);

    // ── Local state: Arrear ───────────────────────────────────────────────────
    const [arearPrefix,      setArearPrefix]      = useState('');
    const [selectedArearEmp, setSelectedArearEmp] = useState(null);
    const [showArearList,    setShowArearList]    = useState(false);
    const [arearMonth,       setArearMonth]       = useState('');
    const [arearYear,        setArearYear]        = useState('');
    const [arearTotal,       setArearTotal]       = useState('');
    const [ccRows,           setCCRows]           = useState([]);

    const currentYear   = new Date().getFullYear();
    const arearYearOpts = [String(currentYear), String(currentYear - 1), String(currentYear - 2)];

    // ── Mount / unmount ───────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchArearHeads());
        dispatch(fetchPendingSalaryDeductions());
        dispatch(fetchPendingSalaryArear());
        return () => { dispatch(resetDeductionData()); dispatch(resetArearData()); };
    }, [dispatch]);

    // ── Sync pending deductions: Step 1 → base rows, Step 2 → enrich with heads/amounts ──
    // GetPendingSalaryDeductions returns employee info only (DeductionHeads/Amounts are null).
    // For real heads & amounts we call GetSalaryDeductionsbyEmpTransNo per employee.
    useEffect(() => {
        if (pendingSalaryDeductions.length === 0) {
            setQueuedEmployees([]);
            return;
        }

        // Build base rows immediately (loadingHeads: true shows spinner in queue)
        const baseRows = pendingSalaryDeductions.map((rec, idx) => ({
            localId:          idx + 1,
            empRefNo:         rec.EmpRefno  || rec.EmpRefNo  || '',
            empName:          rec.EmpName   || rec.Empname   || rec.EmpRefno || '',
            month:            String(rec.Month || ''),
            year:             String(rec.Year  || ''),
            ccCode:           rec.CCCode    || '',
            deductionHeads:   '',
            deductionAmounts: '',
            savedTransRefNo:  rec.EmpTransactionRefNo || rec.TransactionRefno || rec.Id || null,
            id:               rec.Id        || null,
            loadingHeads:     true,
        }));

        setQueuedEmployees(baseRows);
        setLocalIdCounter(pendingSalaryDeductions.length + 1);

        // Enrich each row with real heads/amounts
        pendingSalaryDeductions.forEach(async (rec, idx) => {
            const empRefNo            = rec.EmpRefno  || rec.EmpRefNo  || '';
            const empTransactionRefNo = rec.EmpTransactionRefNo || rec.TransactionRefno || '';

            if (!empRefNo || !empTransactionRefNo) {
                setQueuedEmployees(prev => prev.map(q =>
                    q.localId === idx + 1 ? { ...q, loadingHeads: false } : q
                ));
                return;
            }

            try {
                const result = await dispatch(fetchSalaryDeductionsByEmpTransNo({
                    empTransactionRefNo,
                    empRefNo,
                })).unwrap();

                const records = result?.Data || [];
                const heads   = records.map(r => r.HeadName || '').filter(Boolean);
                const amounts = records.map(r => String(Math.round(Number(r.Amount ?? 0))));

                const deductionHeads   = heads.join(',')   + (heads.length   ? ',' : '');
                const deductionAmounts = amounts.join(',') + (amounts.length ? ',' : '');

                setQueuedEmployees(prev => prev.map(q =>
                    q.localId === idx + 1
                        ? { ...q, deductionHeads, deductionAmounts, loadingHeads: false }
                        : q
                ));
            } catch (err) {
                console.error('❌ Failed to fetch heads for', empRefNo, err);
                setQueuedEmployees(prev => prev.map(q =>
                    q.localId === idx + 1 ? { ...q, loadingHeads: false } : q
                ));
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingSalaryDeductions]);


    // ── Sync pending arrears: Data is fully inline in GetPendingSalaryArear response ──
    // No secondary API call needed — SalaryHead, ArearAmount, CCJsonstring are all present.
    useEffect(() => {
        if (pendingSalaryArears.length === 0) {
            setArearQueue([]);
            return;
        }

        const rows = pendingSalaryArears.map((rec, idx) => {
            // Parse CCJsonstring → [{ CCCode, Amount }]
            let parsedCC = [];
            try {
                const raw = typeof rec.CCJsonstring === 'string' ? JSON.parse(rec.CCJsonstring) : (rec.CCJsonstring || []);
                parsedCC = Array.isArray(raw) ? raw.map(r => ({
                    CCCode: r.CCCode || '',
                    Amount: String(r.Amount ?? r.HeadAmount ?? '0'),
                })) : [];
            } catch { parsedCC = []; }

            return {
                localId:          idx + 1,
                empRefNo:         rec.EmpRefno   || rec.EmpRefNo  || '',
                empName:          rec.EmpName    || rec.EmpRefno  || '',
                month:            String(rec.Month || ''),
                year:             String(rec.Year  || ''),
                ccCode:           rec.CCCode     || '',
                salaryHead:       rec.SalaryHead || '',
                arearAmount:      String(rec.ArearAmount ?? rec.TotalAmount ?? '0'),
                ccJsonString:     rec.CCJsonstring || '[]',
                parsedCC,
                savedTransRefNo:  rec.EmpTransactionRefNo || rec.TransactionRefno || rec.Id || null,
                id:               rec.Id         || null,
            };
        });

        setArearQueue(rows);
        setArearLocalIdCounter(pendingSalaryArears.length + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingSalaryArears]);

    // ── Refs that always hold the latest volatile state ────────────────────────
    const dedFormRef = useRef({});
    const deductionSaveResultRef = useRef(null);
    const deductionSaveResult    = useSelector(s => s.salaryDeductionArrear.deductionSaveResult);
    useEffect(() => { deductionSaveResultRef.current = deductionSaveResult; }, [deductionSaveResult]);

    useEffect(() => {
        dedFormRef.current = {
            selectedDedEmp,
            selectedYear,
            selectedMonth,
            empDeductionsForMonth,
            dedAmounts,
            localIdCounter,
            queuedEmployees,
            editingQueueItem,
        };
    });

    // ── Sync deduction amounts when API returns data ───────────────────────────
    useEffect(() => {
        if (!empDeductionsForMonth) return;
        const list = empDeductionsForMonth?.lstDeduction || [];
        const map = {};
        list.forEach(d => { map[d.HeadName] = d.Amount ?? 0; });

        // Merge queue item amounts when in edit mode
        if (editingQueueItem !== null) {
            const item = queuedEmployees.find(q => q.localId === editingQueueItem);
            if (item) {
                const heads   = item.deductionHeads.split(',').filter(Boolean);
                const amounts = item.deductionAmounts.split(',').filter(Boolean);
                heads.forEach((h, i) => { map[h] = amounts[i] ?? 0; });
            }
        }

        setDedAmounts(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empDeductionsForMonth]);

    // ── Sync CC rows for arrear ───────────────────────────────────────────────
    useEffect(() => {
        if (arearsCostCenters.length > 0) {
            setCCRows(arearsCostCenters.map(cc => ({ CCCode: cc.CCCode || cc.CC_Code || '', Amount: '' })));
        }
    }, [arearsCostCenters]);

    // ── handleClearDedForm ────────────────────────────────────────────────────
    const handleClearDedForm = useCallback(() => {
        setSelectedDedEmp(null);
        setDedPrefix('');
        setShowDedList(false);
        setDedAmounts({});
        dispatch(setSelectedEmpRefNo(null));
        dispatch(setSelectedYear(null));
        dispatch(setSelectedMonth(null));
        dispatch(clearSalaryDeductionsByTransNo());
    }, [dispatch]);

    // ── Watch save status → add to queue ──────────────────────────────────────
    useEffect(() => {
        if (deductionSaveStatus !== 'success') return;

        const {
            selectedDedEmp: emp,
            selectedYear:   year,
            selectedMonth:  month,
            empDeductionsForMonth: dedData,
            dedAmounts:     amounts,
            localIdCounter: counter,
            queuedEmployees: queued,
        } = dedFormRef.current;

        if (!emp || !year || !month) return;

        const key = `${emp.EmpRefNo}_${month}_${year}`;
        const alreadyQueued = queued.find(q => `${q.empRefNo}_${q.month}_${q.year}` === key);

        if (!alreadyQueued) {
            // Heads come from the API-fetched list only — no custom heads
            const existingList = dedData?.lstDeduction || [];
            const allNames     = existingList.map(d => d.HeadName);
            const allAmounts   = allNames.map(n => String(Math.round(Number(amounts[n] ?? 0))));
            const ccCode       = dedData?.CCCode || '';

            setQueuedEmployees(prev => [...prev, {
                localId:          counter,
                empRefNo:         emp.EmpRefNo,
                empName:          parseEmpName(emp),
                month,
                year,
                ccCode,
                deductionHeads:   allNames.join(',') + (allNames.length ? ',' : ''),
                deductionAmounts: allAmounts.join(',') + (allAmounts.length ? ',' : ''),
                savedTransRefNo:  deductionSaveResultRef.current?.Data?.EmpTransactionRefNo
                                  || deductionSaveResultRef.current?.EmpTransactionRefNo
                                  || deductionSaveResultRef.current?.Data?.Id
                                  || null,
                id:               deductionSaveResultRef.current?.Data?.Id
                                  || deductionSaveResultRef.current?.Id
                                  || null,
                loadingHeads:     false,
            }]);
            setLocalIdCounter(prev => prev + 1);
            setShowQueue(true);
        }

        handleClearDedForm();
        dispatch(clearDeductionSaveResult());
    }, [deductionSaveStatus, dispatch, handleClearDedForm]);

    // ── Watch update status → patch queue item ────────────────────────────────
    useEffect(() => {
        if (deductionUpdateStatus !== 'success') return;

        const {
            editingQueueItem: editId,
            empDeductionsForMonth: dedData,
            dedAmounts: amounts,
        } = dedFormRef.current;

        if (editId === null) return;

        // Heads from API list only
        const existingList = dedData?.lstDeduction || [];
        const allNames     = existingList.map(d => d.HeadName);
        const allAmounts   = allNames.map(n => String(Math.round(Number(amounts[n] ?? 0))));

        setQueuedEmployees(prev => prev.map(q =>
            q.localId === editId
                ? {
                    ...q,
                    deductionHeads:   allNames.join(',') + (allNames.length ? ',' : ''),
                    deductionAmounts: allAmounts.join(',') + (allAmounts.length ? ',' : ''),
                    loadingHeads:     false,
                }
                : q
        ));
        setEditingQueueItem(null);
        toast.success('Deduction updated in queue!');
        handleClearDedForm();
        dispatch(clearDeductionUpdateResult());
    }, [deductionUpdateStatus, dispatch, handleClearDedForm]);


    // ── handleClearArearForm — defined here so watcher effects below can reference it ──
    const handleClearArearForm = useCallback(() => {
        setSelectedArearEmp(null);
        setArearPrefix('');
        setShowArearList(false);
        setArearMonth('');
        setArearYear('');
        setArearTotal('');
        setCCRows([]);
        dispatch(setSelectedArearHead(null));
    }, [dispatch]);

    // ── Arrear form ref ───────────────────────────────────────────────────────
    const arearFormRef = useRef({});
    const arearSaveResultRef = useRef(null);
    const arearSaveResult    = useSelector(s => s.salaryDeductionArrear.arearSaveResult);
    useEffect(() => { arearSaveResultRef.current = arearSaveResult; }, [arearSaveResult]);

    useEffect(() => {
        arearFormRef.current = {
            selectedArearEmp,
            arearMonth,
            arearYear,
            selectedArearHead,
            arearTotal,
            ccRows,
            arearLocalIdCounter,
            arearQueue,
            arearEditingItem,
        };
    });

    // ── Watch arrear save status → add to arrear queue ────────────────────────
    useEffect(() => {
        if (arearSaveStatus !== 'success') return;

        const {
            selectedArearEmp: emp,
            arearMonth:  month,
            arearYear:   year,
            selectedArearHead: head,
            arearTotal:  total,
            ccRows:      rows,
            arearLocalIdCounter: counter,
            arearQueue:  queued,
        } = arearFormRef.current;

        if (!emp || !month || !year) return;

        const key = `${emp.EmpRefNo}_${month}_${year}`;
        const alreadyQueued = queued.find(q => `${q.empRefNo}_${q.month}_${q.year}` === key);

        if (!alreadyQueued) {
            const ccJson = JSON.stringify(rows.filter(r => Number(r.Amount) > 0).map(r => ({ CCCode: r.CCCode, Amount: String(r.Amount) })));
            const ccCode = rows.find(r => Number(r.Amount) > 0)?.CCCode || rows[0]?.CCCode || '';

            setArearQueue(prev => [...prev, {
                localId:         counter,
                empRefNo:        emp.EmpRefNo,
                empName:         emp.EmpName || emp.FirstName || emp.EmpRefNo,
                month,
                year,
                ccCode,
                salaryHead:      head || '',
                arearAmount:     String(total || 0),
                ccJsonString:    ccJson,
                parsedCC:        rows.filter(r => Number(r.Amount) > 0).map(r => ({ CCCode: r.CCCode, Amount: String(r.Amount) })),
                savedTransRefNo: arearSaveResultRef.current?.Data?.EmpTransactionRefNo
                                 || arearSaveResultRef.current?.EmpTransactionRefNo
                                 || arearSaveResultRef.current?.Data?.Id
                                 || null,
                id:              arearSaveResultRef.current?.Data?.Id
                                 || arearSaveResultRef.current?.Id
                                 || null,
            }]);
            setArearLocalIdCounter(prev => prev + 1);
            setShowArearQueue(true);
        }

        handleClearArearForm();
        dispatch(clearArearSaveResult());
    }, [arearSaveStatus, dispatch, handleClearArearForm]);

    // ── Watch arrear update status → patch queue item ─────────────────────────
    useEffect(() => {
        if (arearUpdateStatus !== 'success') return;

        const {
            arearEditingItem: editId,
            arearTotal:  total,
            ccRows:      rows,
        } = arearFormRef.current;

        if (editId === null) return;

        const ccJson = JSON.stringify(rows.filter(r => Number(r.Amount) > 0).map(r => ({ CCCode: r.CCCode, Amount: String(r.Amount) })));
        const ccCode = rows.find(r => Number(r.Amount) > 0)?.CCCode || rows[0]?.CCCode || '';

        setArearQueue(prev => prev.map(q =>
            q.localId === editId
                ? {
                    ...q,
                    arearAmount:  String(total || 0),
                    ccJsonString: ccJson,
                    parsedCC:     rows.filter(r => Number(r.Amount) > 0).map(r => ({ CCCode: r.CCCode, Amount: String(r.Amount) })),
                    ccCode,
                }
                : q
        ));
        setArearEditingItem(null);
        toast.success('Arrear updated in queue!');
        handleClearArearForm();
        dispatch(clearArearUpdateResult());
    }, [arearUpdateStatus, dispatch, handleClearArearForm]);

    // ═══════════════════════════════════════════════════════════════════════════
    // DEDUCTION HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════

    const handleDedSearch = (val) => {
        setDedPrefix(val);
        setShowDedList(true);
        if (val.length >= 2) dispatch(fetchSalaryDeductionEmp({ prefix: val }));
    };

    const handleDedSelect = (emp) => {
        setSelectedDedEmp(emp);
        setShowDedList(false);
        setDedPrefix('');
        setDedAmounts({});
        dispatch(setSelectedEmpRefNo(emp.EmpRefNo));
        dispatch(setSelectedYear(null));
        dispatch(setSelectedMonth(null));
        dispatch(fetchSalaryPendingYear({ empRefNo: emp.EmpRefNo }));
    };

    const handleYearChange = (year) => {
        dispatch(setSelectedYear(year));
        dispatch(setSelectedMonth(null));
        setDedAmounts({});
        if (year && selectedEmpRefNo) {
            dispatch(fetchBindSalaryDeductionMonths({ year, empRefNo: selectedEmpRefNo }));
        }
    };

    const handleMonthChange = (month) => {
        dispatch(setSelectedMonth(month));
        setDedAmounts({});
        if (month && selectedYear && selectedEmpRefNo) {
            dispatch(fetchEmpDeductionsForMonth({ year: selectedYear, empRefNo: selectedEmpRefNo, month }));
        }
    };

    // Save single employee — heads from API (existingDedList) only
    const handleSaveDeduction = async () => {
        if (!selectedEmpRefNo) { toast.error('Select an employee'); return; }
        if (!selectedYear)     { toast.error('Select year');        return; }
        if (!selectedMonth)    { toast.error('Select month');       return; }

        const key = `${selectedEmpRefNo}_${selectedMonth}_${selectedYear}`;
        if (queuedEmployees.find(q => `${q.empRefNo}_${q.month}_${q.year}` === key)) {
            toast.warning('This employee for the same month/year is already in the queue. Use edit to modify.');
            return;
        }

        const allNames   = existingDedList.map(d => d.HeadName);
        const allAmounts = allNames.map(n => String(Math.round(Number(dedAmounts[n] ?? 0))));
        const deductionHeads   = allNames.join(',') + (allNames.length ? ',' : '');
        const deductionAmounts = allAmounts.join(',') + (allAmounts.length ? ',' : '');
        const ccCode = dedCCCode || '';

        try {
            await dispatch(saveSingleEmpSalaryDeduction({
                empRefNo: selectedEmpRefNo, month: selectedMonth, year: selectedYear,
                deductionHeads, deductionAmounts, ccCode,
                roleId: String(roleId), createdBy: String(userName),
            })).unwrap();
            toast.success('Employee deduction saved and added to queue!');
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Failed to save');
        }
    };

    // Edit a queued employee — load their data into the form
    const handleEditQueueItem = (item) => {
        setEditingQueueItem(item.localId);
        setShowDedList(false);

        const fakeEmp = { EmpRefNo: item.empRefNo, FirstName: item.empName };
        setSelectedDedEmp(fakeEmp);
        dispatch(setSelectedEmpRefNo(item.empRefNo));
        dispatch(setSelectedYear(item.year));
        dispatch(setSelectedMonth(item.month));

        dispatch(fetchEmpDeductionsForMonth({
            year: item.year, empRefNo: item.empRefNo, month: item.month,
        }));

        // Pre-fill amounts from queue item immediately
        const heads   = item.deductionHeads.split(',').filter(Boolean);
        const amounts = item.deductionAmounts.split(',').filter(Boolean);
        const map = {};
        heads.forEach((h, i) => { map[h] = amounts[i] ?? 0; });
        setDedAmounts(map);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(`Editing: ${item.empName}`);
    };

    // Update existing queued entry — heads from API only
    const handleUpdateDeduction = async () => {
        const item = queuedEmployees.find(q => q.localId === editingQueueItem);
        if (!item) return;

        const allNames   = existingDedList.map(d => d.HeadName);
        const allAmounts = allNames.map(n => String(Math.round(Number(dedAmounts[n] ?? 0))));
        const deductionHeads   = allNames.join(',') + (allNames.length ? ',' : '');
        const deductionAmounts = allAmounts.join(',') + (allAmounts.length ? ',' : '');

        try {
            await dispatch(updateSingleSalaryDeduction({
                empRefNo:            item.empRefNo,
                empTransactionRefNo: item.savedTransRefNo || 0,
                deductionHeads,
                deductionAmounts,
                ccCode:              item.ccCode,
                roleId:              String(roleId),
                createdBy:           String(userName),
            })).unwrap();
            toast.success('Deduction updated successfully!');
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Failed to update');
        }
    };

    const handleCancelEdit = () => {
        setEditingQueueItem(null);
        handleClearDedForm();
        dispatch(clearDeductionUpdateResult());
    };

    const handleRemoveFromQueue = (localId) => {
        setQueuedEmployees(prev => prev.filter(q => q.localId !== localId));
        if (editingQueueItem === localId) {
            setEditingQueueItem(null);
            handleClearDedForm();
        }
        toast.info('Removed from queue');
    };

    // Bulk submit — heads/amounts come from queue rows (enriched by GetSalaryDeductionsbyEmpTransNo)
    const handleBulkSubmit = async () => {
        if (queuedEmployees.length === 0) { toast.error('No employees in queue'); return; }

        const join = (arr) => arr.join(',') + ',';

        const formatPayDate = (month, year) => {
            const lastDay = new Date(Number(year), Number(month), 0);
            const mm   = String(lastDay.getMonth() + 1).padStart(2, '0');
            const dd   = String(lastDay.getDate()).padStart(2, '0');
            const yyyy = lastDay.getFullYear();
            return `${mm}/${dd}/${yyyy} 12:00:00 AM`;
        };

        const ids         = join(queuedEmployees.map(q => q.id              || q.savedTransRefNo || '0'));
        const empRefNos   = join(queuedEmployees.map(q => q.empRefNo));
        const empTransNos = join(queuedEmployees.map(q => q.savedTransRefNo || '0'));
        const months      = join(queuedEmployees.map(q => q.month));
        const years       = join(queuedEmployees.map(q => q.year));
        const payDates    = join(queuedEmployees.map(q => formatPayDate(q.month, q.year)));
        const ccCodes     = join(queuedEmployees.map(q => q.ccCode));

        console.log('📦 Bulk Submit Payload:', { ids, empRefNos, empTransNos, months, years, payDates, ccCodes });

        try {
            await dispatch(saveSalaryDeductions({
                ids, empRefNos, empTransNos, months, years, payDates, ccCodes,
                roleId: String(roleId), createdBy: String(userName),
            })).unwrap();
            toast.success('All salary deductions submitted successfully!');
            setQueuedEmployees([]);
            dispatch(clearDeductionBulkSaveResult());
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Bulk submission failed');
        }
    };

    const handleDeductionReset = () => {
        handleClearDedForm();
        setEditingQueueItem(null);
        setQueuedEmployees([]);
        dispatch(clearDeductionSaveResult());
        dispatch(clearDeductionUpdateResult());
        dispatch(clearDeductionBulkSaveResult());
        toast.info('Form reset');
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // ARREAR HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════

    const handleArearSearch = (val) => {
        setArearPrefix(val);
        setShowArearList(true);
        if (val.length >= 2) dispatch(fetchSalaryDeductionEmp({ prefix: val }));
    };

    const handleArearSelect = (emp) => {
        setSelectedArearEmp(emp);
        setShowArearList(false);
        setArearPrefix('');
        dispatch(fetchArearsCC({ empRefNo: emp.EmpRefNo }));
    };

    const handleCCAmountChange = (ccCode, val) => {
        setCCRows(prev => prev.map(r => r.CCCode === ccCode ? { ...r, Amount: val } : r));
        const updated = ccRows.map(r => r.CCCode === ccCode ? { ...r, Amount: val } : r);
        const total = updated.reduce((s, r) => s + Number(r.Amount || 0), 0);
        setArearTotal(total > 0 ? String(total) : '');
    };

    // Save single employee arrear → adds to queue
    const handleSaveArrear = async () => {
        if (!selectedArearEmp)  { toast.error('Select an employee'); return; }
        if (!arearMonth)        { toast.error('Select month');       return; }
        if (!arearYear)         { toast.error('Select year');        return; }
        if (!selectedArearHead) { toast.error('Select salary head'); return; }
        if (!arearTotal)        { toast.error('Enter total amount'); return; }
        if (!ccRows.some(r => Number(r.Amount) > 0)) { toast.error('Enter amount for at least one cost center'); return; }

        const key = `${selectedArearEmp.EmpRefNo}_${arearMonth}_${arearYear}`;
        if (arearQueue.find(q => `${q.empRefNo}_${q.month}_${q.year}` === key)) {
            toast.warning('This employee for the same month/year is already in the arrear queue. Use edit to modify.');
            return;
        }

        const ccCode = ccRows.find(r => Number(r.Amount) > 0)?.CCCode || arearsCostCenters[0]?.CCCode || '';
        // Backend expects Amount key (not HeadAmount) in CCJsonstring for update/save
        const ccJsonString = JSON.stringify(
            ccRows.filter(r => Number(r.Amount) > 0).map(r => ({ CCCode: r.CCCode, Amount: String(r.Amount) }))
        );

        try {
            await dispatch(saveArear({
                empRefNo: selectedArearEmp.EmpRefNo, month: arearMonth, year: arearYear,
                salaryHead: selectedArearHead, totalAmount: String(arearTotal),
                ccCode, roleId: String(roleId), createdBy: String(userName), ccJsonString,
            })).unwrap();
            toast.success('Arrear saved and added to queue!');
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Failed to save');
        }
    };

    // Edit a queued arrear item → populate form fields
    const handleEditArearItem = (item) => {
        setArearEditingItem(item.localId);
        setShowArearList(false);

        const fakeEmp = { EmpRefNo: item.empRefNo, EmpName: item.empName, FirstName: item.empName };
        setSelectedArearEmp(fakeEmp);
        setArearMonth(item.month);
        setArearYear(item.year);
        setArearTotal(item.arearAmount);
        dispatch(setSelectedArearHead(item.salaryHead));

        // Restore CC rows from parsedCC stored in queue item
        const restoredCC = item.parsedCC?.length
            ? item.parsedCC.map(r => ({ CCCode: r.CCCode, Amount: r.Amount }))
            : [{ CCCode: item.ccCode, Amount: item.arearAmount }];
        setCCRows(restoredCC);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info(`Editing arrear: ${item.empName}`);
    };

    // Update existing queued arrear entry
    const handleUpdateArear = async () => {
        const item = arearQueue.find(q => q.localId === arearEditingItem);
        if (!item) return;
        if (!arearTotal) { toast.error('Enter total amount'); return; }
        if (!ccRows.some(r => Number(r.Amount) > 0)) { toast.error('Enter amount for at least one cost center'); return; }

        const ccJsonString = JSON.stringify(
            ccRows.filter(r => Number(r.Amount) > 0).map(r => ({ CCCode: r.CCCode, Amount: String(r.Amount) }))
        );

        try {
            await dispatch(updateArear({
                empRefNo:            item.empRefNo,
                empTransactionRefNo: item.savedTransRefNo || 0,
                totalAmount:         String(arearTotal),
                ccJsonString,
                roleId:              String(roleId),
                createdBy:           String(userName),
            })).unwrap();
            toast.success('Arrear updated successfully!');
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Failed to update arrear');
        }
    };

    const handleCancelArearEdit = () => {
        setArearEditingItem(null);
        handleClearArearForm();
        dispatch(clearArearUpdateResult());
    };

    const handleRemoveFromArearQueue = (localId) => {
        setArearQueue(prev => prev.filter(q => q.localId !== localId));
        if (arearEditingItem === localId) {
            setArearEditingItem(null);
            handleClearArearForm();
        }
        toast.info('Removed from arrear queue');
    };

    // Bulk submit arrears
    const handleArearBulkSubmit = async () => {
        if (arearQueue.length === 0) { toast.error('No employees in arrear queue'); return; }

        const join = (arr) => arr.join(',') + ',';

        const formatPayDate = (month, year) => {
            const lastDay = new Date(Number(year), Number(month), 0);
            const mm   = String(lastDay.getMonth() + 1).padStart(2, '0');
            const dd   = String(lastDay.getDate()).padStart(2, '0');
            const yyyy = lastDay.getFullYear();
            return `${mm}/${dd}/${yyyy} 12:00:00 AM`;
        };

        const ids         = join(arearQueue.map(q => q.id || q.savedTransRefNo || '0'));
        const empRefNos   = join(arearQueue.map(q => q.empRefNo));
        const empTransNos = join(arearQueue.map(q => q.savedTransRefNo || '0'));
        const months      = join(arearQueue.map(q => q.month));
        const years       = join(arearQueue.map(q => q.year));
        const payDates    = join(arearQueue.map(q => formatPayDate(q.month, q.year)));
        const ccCodes     = join(arearQueue.map(q => q.ccCode));

        console.log('📦 Arrear Bulk Submit Payload:', { ids, empRefNos, empTransNos, months, years, payDates, ccCodes });

        try {
            await dispatch(saveSalaryArears({
                ids, empRefNos, empTransNos, months, years, payDates, ccCodes,
                roleId: String(roleId), createdBy: String(userName),
            })).unwrap();
            toast.success('All salary arrears submitted successfully!');
            setArearQueue([]);
            dispatch(clearArearBulkSaveResult());
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Arrear bulk submission failed');
        }
    };

    const handleArearReset = () => {
        handleClearArearForm();
        setArearEditingItem(null);
        setArearQueue([]);
        dispatch(clearArearSaveResult());
        dispatch(clearArearUpdateResult());
        dispatch(clearArearBulkSaveResult());
        toast.info('Arrear form reset');
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const existingDedList = empDeductionsForMonth?.lstDeduction || [];
    const dedCCCode       = empDeductionsForMonth?.CCCode || '';

    // Total from API heads only (no custom heads)
    const totalDeduction = existingDedList.reduce((s, d) => {
        return s + Number(dedAmounts[d.HeadName] ?? d.Amount ?? 0);
    }, 0);

    const isEditMode = editingQueueItem !== null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">

            {/* ══ Header ═══════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl shadow-xl p-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Scissors className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Salary Deduction &amp; Arrear</h1>
                                <p className="text-indigo-100 mt-1 text-lg">Manage employee deductions and arrear entries</p>
                            </div>
                        </div>
                        <button
                            onClick={activeTab === 'deduction' ? handleDeductionReset : handleArearReset}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-sm font-semibold"
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="hidden sm:inline">Reset All</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: User,     label: 'Employee',       value: selectedDedEmp ? parseEmpName(selectedDedEmp).substring(0, 22) + (parseEmpName(selectedDedEmp).length > 22 ? '…' : '') : '—' },
                            { icon: Calendar, label: 'Period',          value: selectedYear && selectedMonth ? `${monthLabel(selectedMonth)} ${selectedYear}` : '—' },
                            { icon: Scissors, label: 'Deduction Heads', value: existingDedList.length },
                            { icon: Users,    label: 'Queue',           value: `${queuedEmployees.length} employee${queuedEmployees.length !== 1 ? 's' : ''}` },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <Icon className="h-7 w-7 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-indigo-100 mb-0.5">{label}</p>
                                        <p className="text-lg font-bold truncate">{value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Tabs ───────────────────────────────────────────────────── */}
                <div className="flex gap-3 flex-wrap">
                    <TabButton active={activeTab === 'deduction'} onClick={() => setActiveTab('deduction')}
                        icon={Scissors} label="Salary Deduction" count={queuedEmployees.length} />
                    <TabButton active={activeTab === 'arrear'} onClick={() => setActiveTab('arrear')}
                        icon={Banknote} label="Salary Arrear" count={arearQueue.length} />
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    DEDUCTION TAB
                ══════════════════════════════════════════════════════════════ */}
                {activeTab === 'deduction' && (
                    <>
                        {deductionBulkSaveStatus && deductionBulkSaveStatus !== 'pending' && (
                            <SaveBanner
                                status={deductionBulkSaveStatus}
                                message={
                                    deductionBulkSaveStatus === 'success'
                                        ? 'All salary deductions submitted successfully!'
                                        : deductionBulkSaveStatus === 'duplicate'
                                            ? 'Some employees already have salary records for the selected periods.'
                                            : 'Bulk submission failed. Please try again.'
                                }
                                onClose={() => dispatch(clearDeductionBulkSaveResult())}
                            />
                        )}

                        {isEditMode && (
                            <div className="flex items-center gap-3 px-5 py-4 rounded-xl border-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                                <Edit2 className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex-1">
                                    Edit mode — modifying queued entry for <strong>{queuedEmployees.find(q => q.localId === editingQueueItem)?.empName}</strong>. Save changes or cancel.
                                </p>
                                <button onClick={handleCancelEdit}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors">
                                    <X className="h-3.5 w-3.5" /> Cancel Edit
                                </button>
                            </div>
                        )}

                        {/* ── Employee + Period ──────────────────────────────── */}
                        <SectionCard
                            title={isEditMode ? 'Edit Deduction Entry' : 'Employee & Period Selection'}
                            icon={isEditMode ? Edit2 : Filter}
                            gradient={isEditMode ? 'from-amber-500 to-orange-500' : 'from-indigo-600 to-purple-600'}
                        >
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Search Employee <span className="text-red-500">*</span>
                                    </label>
                                    {!selectedDedEmp ? (
                                        <>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                                <input type="text" value={dedPrefix} onChange={e => handleDedSearch(e.target.value)}
                                                    onFocus={() => setShowDedList(true)}
                                                    placeholder="Type employee name or ID (min 2 chars)…"
                                                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm" />
                                                {dedEmpLoading && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-indigo-600" />}
                                            </div>
                                            {showDedList && <EmpResultList employees={deductionEmployees} onSelect={handleDedSelect} />}
                                            {showDedList && !dedEmpLoading && dedPrefix.length >= 2 && deductionEmployees.length === 0 && (
                                                <div className="mt-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-400 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" /> No employees found
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <SelectedEmpBadge emp={selectedDedEmp} colorClass={isEditMode ? 'violet' : 'indigo'} onClear={isEditMode ? handleCancelEdit : handleClearDedForm} />
                                    )}
                                </div>

                                {selectedDedEmp && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                Pending Year <span className="text-red-500">*</span>
                                            </label>
                                            {yearLoading ? (
                                                <div className="flex items-center gap-2 py-3 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-400">
                                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Loading years…
                                                </div>
                                            ) : isEditMode ? (
                                                <div className="px-4 py-3 border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-300">{selectedYear}</div>
                                            ) : salaryPendingYears.length === 0 ? (
                                                <div className="flex items-center gap-2 py-3 px-4 border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                                                    <AlertCircle className="h-4 w-4" /> No pending years
                                                </div>
                                            ) : (
                                                <select value={selectedYear || ''} onChange={e => handleYearChange(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm">
                                                    <option value="">Select Year</option>
                                                    {salaryPendingYears.map(y => { const yr = y.Year || y; return <option key={yr} value={yr}>{yr}</option>; })}
                                                </select>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                Month <span className="text-red-500">*</span>
                                            </label>
                                            {monthLoading ? (
                                                <div className="flex items-center gap-2 py-3 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-400">
                                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Loading months…
                                                </div>
                                            ) : isEditMode ? (
                                                <div className="px-4 py-3 border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-300">{monthLabel(selectedMonth)}</div>
                                            ) : (
                                                <select value={selectedMonth || ''} onChange={e => handleMonthChange(e.target.value)}
                                                    disabled={!selectedYear || deductionMonths.length === 0}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <option value="">{!selectedYear ? 'Select year first' : deductionMonths.length === 0 ? 'No pending months' : 'Select Month'}</option>
                                                    {deductionMonths.map(m => { const mv = m.MonthNo ?? m.Month ?? m.value ?? m; const ml = m.MonthName || monthLabel(mv) || mv; return <option key={mv} value={mv}>{ml}</option>; })}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {dedDetailLoading && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-14 flex flex-col items-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading deduction details…</p>
                            </div>
                        )}

                        {/* ── Deduction detail ───────────────────────────────── */}
                        {!dedDetailLoading && selectedDedEmp && selectedYear && selectedMonth && (
                            <SectionCard
                                title={isEditMode ? 'Edit Deduction Amounts' : 'Deduction Details'}
                                icon={Scissors}
                                gradient={isEditMode ? 'from-amber-500 to-orange-500' : 'from-rose-600 to-pink-600'}
                            >
                                {existingDedList.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                                        <Scissors className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No deduction heads configured for this period</p>
                                        <p className="text-sm mt-1 text-gray-400">Heads are fetched from the server — contact admin if missing</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
                                            <div className={`grid grid-cols-2 text-white text-sm font-bold ${isEditMode ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-rose-600 to-pink-600'}`}>
                                                <div className="px-4 py-3 flex items-center gap-2"><Scissors className="h-4 w-4" /> DEDUCTION HEAD</div>
                                                <div className="px-4 py-3 flex items-center justify-end gap-1"><IndianRupee className="h-3.5 w-3.5" /> AMOUNT (Rs)</div>
                                            </div>

                                            {existingDedList.map((d, i) => (
                                                <DeductionRow
                                                    key={`e-${i}`}
                                                    head={d.HeadName}
                                                    amount={dedAmounts[d.HeadName] ?? d.Amount ?? 0}
                                                    onChange={val => setDedAmounts(prev => ({ ...prev, [d.HeadName]: val }))}
                                                />
                                            ))}

                                            <div className={`grid grid-cols-2 border-t-2 border-gray-200 dark:border-gray-700 ${isEditMode ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-amber-900/20' : 'bg-gradient-to-r from-gray-50 to-rose-50 dark:from-gray-800 dark:to-rose-900/20'}`}>
                                                <div className="px-4 py-4 text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <Minus className="h-4 w-4 text-rose-500" /> TOTAL DEDUCTION
                                                </div>
                                                <div className={`px-4 py-4 text-right text-xl font-bold ${isEditMode ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    ₹{formatCurrency(totalDeduction)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info note replacing the add-head section */}
                                        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl text-xs text-blue-700 dark:text-blue-300 mb-5">
                                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                            Deduction heads are fetched from the server. Edit amounts above and click <strong>&nbsp;{isEditMode ? 'Update' : 'Add to Queue'}&nbsp;</strong> to proceed.
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    {isEditMode ? (
                                        <>
                                            <button onClick={handleCancelEdit}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                                <X className="h-4 w-4" /> Cancel
                                            </button>
                                            <button onClick={handleUpdateDeduction} disabled={updateDedLoading}
                                                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all shadow-md text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed">
                                                {updateDedLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Updating…</> : <><Edit2 className="h-5 w-5" /> Update Deduction</>}
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={handleSaveDeduction} disabled={saveDedLoading || existingDedList.length === 0}
                                            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed">
                                            {saveDedLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving…</> : <><Save className="h-5 w-5" /> Add to Queue</>}
                                        </button>
                                    )}
                                </div>
                            </SectionCard>
                        )}

                        {/* ══ Queue table ══════════════════════════════════════ */}
                        {queuedEmployees.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-white" />
                                        <h2 className="text-lg font-bold text-white">Queued Employees</h2>
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold">
                                            {queuedEmployees.length} employee{queuedEmployees.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => dispatch(fetchPendingSalaryDeductions())} disabled={pendingDedLoading}
                                            title="Reload pending deductions from server"
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white text-xs font-semibold disabled:opacity-50">
                                            <RefreshCw className={`h-3.5 w-3.5 ${pendingDedLoading ? 'animate-spin' : ''}`} />
                                            <span className="hidden sm:inline">Reload</span>
                                        </button>
                                        <button onClick={() => setShowQueue(v => !v)}
                                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white">
                                            {showQueue ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {showQueue && (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-900/40 border-b-2 border-gray-200 dark:border-gray-700">
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deduction Heads</th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {queuedEmployees.map((item, idx) => (
                                                        <QueuedEmpRow key={item.localId} item={item} index={idx}
                                                            onEdit={handleEditQueueItem} onRemove={handleRemoveFromQueue}
                                                            isEditing={editingQueueItem === item.localId} />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="px-6 py-5 border-t-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900/40 dark:to-gray-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                                    Ready to submit: <span className="text-indigo-700 dark:text-indigo-300">{queuedEmployees.length} employee{queuedEmployees.length !== 1 ? 's' : ''}</span>
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">This will process all queued deductions in a single operation</p>
                                            </div>
                                            <button onClick={handleBulkSubmit} disabled={bulkSaveLoading || queuedEmployees.some(q => q.loadingHeads)}
                                                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all shadow-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                                title={queuedEmployees.some(q => q.loadingHeads) ? 'Wait for heads to finish loading' : ''}>
                                                {bulkSaveLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</> : <><Send className="h-5 w-5" /> Submit All Deductions</>}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    ARREAR TAB
                ══════════════════════════════════════════════════════════════ */}
                {activeTab === 'arrear' && (
                    <>
                        {arearBulkSaveStatus && arearBulkSaveStatus !== 'pending' && (
                            <SaveBanner
                                status={arearBulkSaveStatus}
                                message={
                                    arearBulkSaveStatus === 'success'
                                        ? 'All salary arrears submitted successfully!'
                                        : arearBulkSaveStatus === 'duplicate'
                                            ? 'Some employees already have arrear records for the selected periods.'
                                            : 'Bulk arrear submission failed. Please try again.'
                                }
                                onClose={() => dispatch(clearArearBulkSaveResult())}
                            />
                        )}

                        {arearEditingItem !== null && (
                            <div className="flex items-center gap-3 px-5 py-4 rounded-xl border-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                                <Edit2 className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex-1">
                                    Edit mode — modifying arrear entry for <strong>{arearQueue.find(q => q.localId === arearEditingItem)?.empName}</strong>. Save changes or cancel.
                                </p>
                                <button onClick={handleCancelArearEdit}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors">
                                    <X className="h-3.5 w-3.5" /> Cancel Edit
                                </button>
                            </div>
                        )}

                        {/* ── Arrear Entry Form ─────────────────────────────── */}
                        <SectionCard
                            title={arearEditingItem !== null ? 'Edit Arrear Entry' : 'Arrear Entry'}
                            icon={arearEditingItem !== null ? Edit2 : Banknote}
                            gradient={arearEditingItem !== null ? 'from-amber-500 to-orange-500' : 'from-violet-600 to-indigo-600'}
                        >
                            <div className="space-y-6">
                                {/* Employee Search */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Search Employee <span className="text-red-500">*</span>
                                    </label>
                                    {!selectedArearEmp ? (
                                        <>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                                <input type="text" value={arearPrefix} onChange={e => handleArearSearch(e.target.value)}
                                                    onFocus={() => setShowArearList(true)}
                                                    placeholder="Type employee name or ID (min 2 chars)…"
                                                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm" />
                                                {dedEmpLoading && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-indigo-600" />}
                                            </div>
                                            {showArearList && <EmpResultList employees={deductionEmployees} onSelect={handleArearSelect} />}
                                        </>
                                    ) : (
                                        <SelectedEmpBadge
                                            emp={selectedArearEmp}
                                            colorClass={arearEditingItem !== null ? 'violet' : 'indigo'}
                                            onClear={arearEditingItem !== null ? handleCancelArearEdit : handleClearArearForm}
                                        />
                                    )}
                                </div>

                                {/* Month / Year / Head */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-indigo-600" /> Month <span className="text-red-500">*</span>
                                        </label>
                                        {arearEditingItem !== null ? (
                                            <div className="px-4 py-3 border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-300">
                                                {monthLabel(arearMonth)}
                                            </div>
                                        ) : (
                                            <select value={arearMonth} onChange={e => setArearMonth(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm">
                                                <option value="">Select Month</option>
                                                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-indigo-600" /> Year <span className="text-red-500">*</span>
                                        </label>
                                        {arearEditingItem !== null ? (
                                            <div className="px-4 py-3 border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-300">
                                                {arearYear}
                                            </div>
                                        ) : (
                                            <select value={arearYear} onChange={e => setArearYear(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm">
                                                <option value="">Select Year</option>
                                                {arearYearOpts.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-indigo-600" /> Salary Head <span className="text-red-500">*</span>
                                        </label>
                                        {arearEditingItem !== null ? (
                                            <div className="px-4 py-3 border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-300 truncate">
                                                {selectedArearHead}
                                            </div>
                                        ) : arearHeadLoading ? (
                                            <div className="flex items-center gap-2 py-3 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-400">
                                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Loading…
                                            </div>
                                        ) : (
                                            <select value={selectedArearHead || ''} onChange={e => dispatch(setSelectedArearHead(e.target.value))}
                                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm">
                                                <option value="">Select Head</option>
                                                {arearHeads.map((h, i) => <option key={i} value={h.HeadName || h}>{h.HeadName || h}</option>)}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* CC Distribution */}
                                {selectedArearEmp && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-indigo-600" />
                                            Cost Center Distribution
                                            {arearCCLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 ml-1" />}
                                        </label>
                                        {ccRows.length === 0 && !arearCCLoading ? (
                                            <div className="py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                                <Building className="h-8 w-8 mx-auto mb-2 opacity-30" /> No cost centers found
                                            </div>
                                        ) : (
                                            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                                <div className={`grid grid-cols-2 text-white text-sm font-bold ${arearEditingItem !== null ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600'}`}>
                                                    <div className="px-4 py-3 flex items-center gap-2"><Building className="h-4 w-4" /> COST CENTER</div>
                                                    <div className="px-4 py-3 text-right flex items-center justify-end gap-1"><IndianRupee className="h-3.5 w-3.5" /> AMOUNT (Rs)</div>
                                                </div>
                                                {ccRows.map((row, i) => (
                                                    <div key={row.CCCode} className={`grid grid-cols-2 items-center border-b border-gray-100 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/60 dark:bg-gray-800/60'}`}>
                                                        <div className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">{row.CCCode}</div>
                                                        <div className="px-4 py-2">
                                                            <input type="number" value={row.Amount} onChange={e => handleCCAmountChange(row.CCCode, e.target.value)} placeholder="0"
                                                                className="w-full text-right text-sm px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className={`grid grid-cols-2 border-t-2 border-gray-200 dark:border-gray-700 ${arearEditingItem !== null ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-amber-900/20' : 'bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-800 dark:to-violet-900/20'}`}>
                                                    <div className="px-4 py-4 text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">TOTAL ARREAR AMOUNT</div>
                                                    <div className="px-4 py-3">
                                                        <input type="number" value={arearTotal} onChange={e => setArearTotal(e.target.value)} placeholder="Total"
                                                            className={`w-full text-right text-base font-bold px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 dark:bg-gray-700 ${arearEditingItem !== null ? 'border-amber-300 dark:border-amber-600 focus:ring-amber-200 focus:border-amber-500 text-amber-700 dark:text-amber-300' : 'border-violet-300 dark:border-violet-600 focus:ring-violet-200 focus:border-violet-500 text-violet-700 dark:text-violet-300'}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Save / Update buttons */}
                                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    {arearEditingItem !== null ? (
                                        <>
                                            <button onClick={handleCancelArearEdit}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                                <X className="h-4 w-4" /> Cancel
                                            </button>
                                            <button onClick={handleUpdateArear} disabled={updateArearLoading}
                                                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all shadow-md text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed">
                                                {updateArearLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Updating…</> : <><Edit2 className="h-5 w-5" /> Update Arrear</>}
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={handleSaveArrear} disabled={saveArearLoading}
                                            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all shadow-md text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed">
                                            {saveArearLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving…</> : <><Save className="h-5 w-5" /> Add to Queue</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </SectionCard>

                        {/* ══ Arrear Queue table ═══════════════════════════════ */}
                        {arearQueue.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-white" />
                                        <h2 className="text-lg font-bold text-white">Queued Arrears</h2>
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold">
                                            {arearQueue.length} employee{arearQueue.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => dispatch(fetchPendingSalaryArear())} disabled={pendingArearLoading}
                                            title="Reload pending arrears from server"
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white text-xs font-semibold disabled:opacity-50">
                                            <RefreshCw className={`h-3.5 w-3.5 ${pendingArearLoading ? 'animate-spin' : ''}`} />
                                            <span className="hidden sm:inline">Reload</span>
                                        </button>
                                        <button onClick={() => setShowArearQueue(v => !v)}
                                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white">
                                            {showArearQueue ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {showArearQueue && (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-900/40 border-b-2 border-gray-200 dark:border-gray-700">
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salary Head</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CC Distribution</th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {arearQueue.map((item, idx) => (
                                                        <tr key={item.localId}
                                                            className={`border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors
                                                                        ${arearEditingItem === item.localId
                                                                            ? 'bg-amber-50 dark:bg-amber-900/10'
                                                                            : idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/60 dark:bg-gray-800/60'}`}>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                                                                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{idx + 1}</span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.empName}</p>
                                                                        <p className="text-xs text-gray-400">{item.empRefNo}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                                {monthLabel(item.month)} {item.year}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs font-medium">
                                                                    {item.salaryHead}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {(item.parsedCC || []).filter(r => Number(r.Amount) > 0).map((r, i) => (
                                                                        <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded text-xs">
                                                                            {r.CCCode}: ₹{formatCurrency(r.Amount)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
                                                                    ₹{formatCurrency(item.arearAmount)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {item.savedTransRefNo ? (
                                                                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                                                                        <Check className="h-3.5 w-3.5" /> Saved
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                                        <AlertCircle className="h-3.5 w-3.5" /> Pending
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2 justify-end">
                                                                    <button onClick={() => handleEditArearItem(item)}
                                                                        title="Edit arrear"
                                                                        className={`p-1.5 rounded-lg transition-colors
                                                                                    ${arearEditingItem === item.localId
                                                                                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                                                                        : 'hover:bg-violet-50 dark:hover:bg-violet-900/30 text-violet-500 dark:text-violet-400'}`}>
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </button>
                                                                    <button onClick={() => handleRemoveFromArearQueue(item.localId)}
                                                                        title="Remove from queue"
                                                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="px-6 py-5 border-t-2 border-gray-100 dark:border-gray-700 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-900/40 dark:to-gray-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                                    Ready to submit: <span className="text-violet-700 dark:text-violet-300">{arearQueue.length} employee{arearQueue.length !== 1 ? 's' : ''}</span>
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">This will process all queued arrears in a single operation</p>
                                            </div>
                                            <button onClick={handleArearBulkSubmit} disabled={bulkArearLoading}
                                                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all shadow-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed">
                                                {bulkArearLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</> : <><Send className="h-5 w-5" /> Submit All Arrears</>}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StaffSalaryDeductionArrear;