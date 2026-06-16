import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    fetchSalaryEmpCC,
    fetchCCPayrollEmp,
    checkEmpPayRollRequirements,
    fetchEmployeeWiseGeneratedPayRollData,
    fetchBonusHeadsForEmployee,
    savePayRollForSingleEmp,       // ✅ CORRECT: individual employee submission
    // savePayRoll removed — that is bulk-only, not used here
    setSelectedYear,
    setSelectedMonth,
    setSelectedCCCode,
    setSelectedEmployees,
    resetPayrollData,
    clearSaveResult,
    selectSalaryEmpCostCentersArray,
    selectCCPayrollEmployeesArray,
    selectPayrollRequirements,
    selectEmployeeWisePayrollData,
    selectBonusHeadsArray,
    selectSaveResult,
    selectSalaryEmpCCLoading,
    selectCCPayrollEmpLoading,
    selectPayrollRequirementsLoading,
    selectEmployeeWisePayrollDataLoading,
    selectBonusHeadsLoading,
    selectSavePayrollLoading,
    selectSelectedYear,
    selectSelectedMonth,
    selectSelectedCCCode,
    selectSelectedEmployees as selectSelectedEmployeesRedux,
    selectPayrollSummary,
    selectFilterSelections,
} from '../../slices/HRSlice/staffPayrollGenerationSlice';
import CustomDatePicker from '../../components/CustomDatePicker';
import {
    Calendar, Building, Users, FileText, IndianRupee,
    Loader2, Save, RefreshCw, ChevronDown, ChevronUp,
    User, Mail, Phone, Home, MapPin, CheckCircle,
    XCircle, Filter, Search, Download, Banknote,
    Package, TrendingUp, AlertCircle, RotateCcw,
    Edit, X, Plus, Trash2, DollarSign, Check, Eye,
    Minus, Edit2,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getFrontendYears = () => {
    const currentYear = new Date().getFullYear();
    return [{ Year: currentYear }, { Year: currentYear - 1 }];
};

const getFrontendMonths = () => [
    { Month: '1',  MonthName: 'January'   }, { Month: '2',  MonthName: 'February' },
    { Month: '3',  MonthName: 'March'     }, { Month: '4',  MonthName: 'April'    },
    { Month: '5',  MonthName: 'May'       }, { Month: '6',  MonthName: 'June'     },
    { Month: '7',  MonthName: 'July'      }, { Month: '8',  MonthName: 'August'   },
    { Month: '9',  MonthName: 'September' }, { Month: '10', MonthName: 'October'  },
    { Month: '11', MonthName: 'November'  }, { Month: '12', MonthName: 'December' },
];

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
    }).format(amount);
};

// ─── Reusable Multi-Select Dropdown ───────────────────────────────────────────
const MultiSelectDropdown = ({
    label, icon: Icon, options, selected, onChange,
    placeholder, getValue, getLabel, loading, disabled, required,
}) => {
    const [open,   setOpen]   = useState(false);
    const [q,      setQ]      = useState('');
    // FIX 1: track whether panel should open upward
    const [openUp, setOpenUp] = useState(false);
    const ref    = useRef(null);
    const btnRef = useRef(null);   // FIX 1: ref on the trigger button to measure position

    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                setQ('');
            }
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // FIX 1: measure available space before each open, then decide direction
    const handleToggle = () => {
        if (disabled) return;
        if (!open && btnRef.current) {
            const rect       = btnRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setOpenUp(spaceBelow < 420); // 420 px ≈ max panel height (max-h-96)
        }
        if (open) setQ(''); // clear search when closing
        setOpen(p => !p);
    };

    const filtered   = options.filter(o => getLabel(o).toLowerCase().includes(q.toLowerCase()));
    const allChecked = options.length > 0 && selected.length === options.length;

    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2  items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                    {label} {required && <span className="text-red-500">*</span>}
                    {selected.length > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                            {selected.length} selected
                        </span>
                    )}
                </label>
            )}

            <div className="relative" ref={ref}>
                {/* FIX 1: added ref={btnRef} and replaced inline onClick with handleToggle */}
                <button
                    ref={btnRef}
                    type="button"
                    disabled={disabled}
                    onClick={handleToggle}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className={`text-sm ${selected.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                        {loading
                            ? 'Loading…'
                            : selected.length === 0
                                ? placeholder
                                : selected.length === 1
                                    ? getLabel(options.find(o => getValue(o) === selected[0]) || {}) || selected[0]
                                    : `${selected.length} selected`}
                    </span>
                    {loading
                        ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                        : <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />}
                </button>

                {open && !loading && (
                    <div className={`absolute z-50 w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden
                                    ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                        {/* Single scroll container — sticky headers inside so they stick correctly and nothing gets clipped */}
                        <div className="max-h-96 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#a5b4fc #f3f4f6" }}>
                            <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 sticky top-0 z-10">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search…"
                                        value={q}
                                        onChange={e => setQ(e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-gray-600 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 sticky top-[73px] z-10">
                                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={allChecked}
                                        onChange={() => onChange(allChecked ? [] : options.map(getValue))}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                        Select All ({options.length})
                                    </span>
                                </label>
                            </div>

                            {filtered.length === 0
                                ? <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">No results</div>
                                : filtered.map(o => {
                                    const val     = getValue(o);
                                    const checked = selected.includes(val);
                                    return (
                                        <label
                                            key={val}
                                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => onChange(
                                                    checked ? selected.filter(s => s !== val) : [...selected, val]
                                                )}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-200 flex-1">{getLabel(o)}</span>
                                            {checked && <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                                        </label>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>

            {selected.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {selected.map(val => {
                        const opt = options.find(o => getValue(o) === val);
                        const lbl = opt ? getLabel(opt) : val;
                        return (
                            <span key={val}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                                {lbl}
                                <button
                                    onClick={() => onChange(selected.filter(s => s !== val))}
                                    className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── Employee Payroll Detail Modal ────────────────────────────────────────────
const EmployeeDetailModal = ({ empRow, details, optionalHeads, ccCode, onClose, onSave, saving }) => {
    const empRefNo = empRow.EmpRefno;

    const [amounts,    setAmounts]   = useState(() => {
        const m = {};
        details.forEach(d => { m[d.SalaryHead] = d.HeadAmount; });
        return m;
    });
    const [newHeads,   setNewHeads]  = useState([]);
    const [headType,   setHeadType]  = useState('');
    const [salaryHead, setSalHead]   = useState('');
    const [amount,     setAmt]       = useState('');

    const earnings    = details.filter(d => d.HeadType === 'Earning' || d.HeadType === 'Benefit');
    const deductions  = details.filter(d => d.HeadType === 'Deduction');
    const newEarnings = newHeads.filter(h => h.HeadType === 'Earning' || h.HeadType === 'Benefit' || h.HeadType === 'OtherBenefit');
    const newDeds     = newHeads.filter(h => h.HeadType === 'Deduction');

    const allEarnings   = [...earnings,   ...newEarnings];
    const allDeductions = [...deductions, ...newDeds];

    const gross    = allEarnings.reduce((s, h)   => s + Number(amounts[h.SalaryHead] ?? h.HeadAmount ?? 0), 0);
    const totalDed = allDeductions.reduce((s, h) => s + Number(amounts[h.SalaryHead] ?? h.HeadAmount ?? 0), 0);
    const netPay   = gross - totalDed;

    const filteredOptional = optionalHeads.filter(h => h.HeadType === headType);

    const handleAdd = () => {
        if (!headType || !salaryHead || !amount) { toast.error('Please fill all fields'); return; }
        if (newHeads.find(h => h.SalaryHead === salaryHead)) { toast.error('Head already added'); return; }
        const head = optionalHeads.find(h => h.HeadName === salaryHead) || {};
        setNewHeads(prev => [...prev, {
            SalaryHead: salaryHead, HeadType: headType,
            HeadAmount: Number(amount), IsEditable: 'Yes', isNew: true,
            ApplicableForPL: head.ApplicableForPL || 'No',
            ApplicableForESI: head.ApplicableForESI || 'No',
        }]);
        setAmounts(prev => ({ ...prev, [salaryHead]: Number(amount) }));
        setSalHead(''); setAmt(''); setHeadType('');
        toast.success('Head added');
    };

    const handleRemoveNew = (sh) => {
        setNewHeads(prev => prev.filter(h => h.SalaryHead !== sh));
        setAmounts(prev => { const n = { ...prev }; delete n[sh]; return n; });
    };

    const HeadRow = ({ h, isNew = false }) => (
        <div className={`grid grid-cols-2 items-center border-b border-gray-100 dark:border-gray-700 last:border-0
                         ${isNew ? 'bg-green-50 dark:bg-green-900/10' : 'bg-white dark:bg-gray-800'}`}>
            <div className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                {h.SalaryHead}
                {isNew && (
                    <>
                        <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">New</span>
                        <button onClick={() => handleRemoveNew(h.SalaryHead)}
                                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    </>
                )}
            </div>
            <div className="px-4 py-2">
                <input
                    type="number"
                    value={amounts[h.SalaryHead] ?? h.HeadAmount ?? 0}
                    onChange={e => setAmounts(prev => ({ ...prev, [h.SalaryHead]: e.target.value }))}
                    disabled={h.IsEditable === 'No' && !isNew}
                    className="w-full text-right text-sm px-3 py-1.5
                               border-2 border-gray-300 dark:border-gray-600 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500
                               dark:bg-gray-700 dark:text-white
                               disabled:bg-gray-100 dark:disabled:bg-gray-600/40
                               disabled:text-gray-500 dark:disabled:text-gray-400"
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
             onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto"
                 onClick={e => e.stopPropagation()}>

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700
                                rounded-t-2xl px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{empRow.Name || empRefNo}</h3>
                            <p className="text-indigo-100 text-sm">Payroll Details</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Employee meta */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4
                                    bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20
                                    rounded-xl p-4 text-sm border border-indigo-100 dark:border-indigo-900">
                        {[
                            { lbl: 'Employee ID',       val: empRefNo },
                            { lbl: 'Group',             val: empRow.GroupName || '—' },
                            { lbl: 'Cost Center',       val: ccCode },
                            { lbl: 'Total Salary Days', val: empRow.TotalSalaryDays },
                        ].map(({ lbl, val }) => (
                            <div key={lbl}>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{lbl}</p>
                                <p className="font-semibold text-gray-800 dark:text-white">{val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Earnings + Deductions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-2 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 text-white text-sm font-bold">
                                <div className="px-4 py-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" /> EARNINGS
                                </div>
                                <div className="px-4 py-3 flex items-center justify-end gap-1">
                                    <IndianRupee className="h-3.5 w-3.5" /> Rs
                                </div>
                            </div>
                            {allEarnings.length === 0
                                ? <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No earnings data</p>
                                : <>
                                    {earnings.map((h, i)    => <HeadRow key={`e-${i}`}  h={h} isNew={false} />)}
                                    {newEarnings.map((h, i) => <HeadRow key={`ne-${i}`} h={h} isNew={true}  />)}
                                </>}
                        </div>

                        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-2 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 text-white text-sm font-bold">
                                <div className="px-4 py-3 flex items-center gap-2">
                                    <Minus className="h-4 w-4" /> DEDUCTIONS
                                </div>
                                <div className="px-4 py-3 flex items-center justify-end gap-1">
                                    <IndianRupee className="h-3.5 w-3.5" /> Rs
                                </div>
                            </div>
                            {allDeductions.length === 0
                                ? <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No deductions</p>
                                : <>
                                    {deductions.map((h, i) => <HeadRow key={`d-${i}`}  h={h} isNew={false} />)}
                                    {newDeds.map((h, i)    => <HeadRow key={`nd-${i}`} h={h} isNew={true}  />)}
                                </>}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-xl">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">GROSS</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                &#8377;{formatCurrency(gross)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">DEDUCTIONS</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                &#8377;{formatCurrency(totalDed)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">NET PAY</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                &#8377;{formatCurrency(netPay)}
                            </p>
                        </div>
                    </div>

                    {/* Other Salary Heads */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Other Salary Heads
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Head Type
                                </label>
                                <select
                                    value={headType}
                                    onChange={e => { setHeadType(e.target.value); setSalHead(''); }}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                                               focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500
                                               dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">-Select-</option>
                                    <option value="Benefit">Benefit</option>
                                    <option value="OtherBenefit">Other Benefit</option>
                                    <option value="Deduction">Deduction</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Salary Head
                                </label>
                                {/* FIX 2: was <option value=""></option> — now has visible placeholder text */}
                                <select
                                    value={salaryHead}
                                    onChange={e => setSalHead(e.target.value)}
                                    disabled={!headType}
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                                               focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500
                                               dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">-Select-</option>
                                    {filteredOptional.map((h, i) => (
                                        <option key={i} value={h.HeadName}>{h.HeadName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmt(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                                               focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500
                                               dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <button
                                onClick={handleAdd}
                                className="flex items-center gap-2 px-5 py-2.5
                                           bg-gradient-to-r from-indigo-600 to-purple-600
                                           hover:from-indigo-700 hover:to-purple-700
                                           text-white text-sm rounded-xl font-semibold transition-all"
                            >
                                <Plus className="h-4 w-4" /> Add
                            </button>

                            <button
                                onClick={() => onSave({ empRow, details, amounts, newHeads, gross, totalDed, netPay })}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-2.5
                                           bg-gradient-to-r from-indigo-600 to-purple-600
                                           hover:from-indigo-700 hover:to-purple-700
                                           text-white rounded-xl font-bold text-sm
                                           transition-all shadow-md disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const StaffPayrollGeneration = () => {
    const dispatch = useDispatch();

    // Auth
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid    = userData?.UID    || userData?.uid;
    const userName = userData?.userName || userData?.UserName || 'User';

    // Redux state
    const salaryEmpCostCenters           = useSelector(selectSalaryEmpCostCentersArray);
    const ccPayrollEmployees             = useSelector(selectCCPayrollEmployeesArray);
    const payrollRequirements            = useSelector(selectPayrollRequirements);
    const employeeWisePayrollData        = useSelector(selectEmployeeWisePayrollData);
    const bonusHeads                     = useSelector(selectBonusHeadsArray);
    const saveResult                     = useSelector(selectSaveResult);

    const salaryEmpCCLoading             = useSelector(selectSalaryEmpCCLoading);
    const ccPayrollEmpLoading            = useSelector(selectCCPayrollEmpLoading);
    const payrollRequirementsLoading     = useSelector(selectPayrollRequirementsLoading);
    const employeeWisePayrollDataLoading = useSelector(selectEmployeeWisePayrollDataLoading);
    const bonusHeadsLoading              = useSelector(selectBonusHeadsLoading);
    const savePayrollLoading             = useSelector(selectSavePayrollLoading);

    const selectedYear     = useSelector(selectSelectedYear);
    const selectedMonth    = useSelector(selectSelectedMonth);
    const selectedCCCode   = useSelector(selectSelectedCCCode);
    const payrollSummary   = useSelector(selectPayrollSummary);
    const filterSelections = useSelector(selectFilterSelections);

    // Local state
    const [showFilters, setShowFilters] = useState(true);

    // Payroll date — last day of the selected month
    const getPayrollDate = () => {
        if (!selectedYear || !selectedMonth) return new Date();
        const year  = parseInt(selectedYear);
        const month = parseInt(selectedMonth);
        return new Date(year, month, 0); // day 0 of next month = last day of selected month
    };

    // CC + Employee multi-select
    const [selectedCCCodes, setSelectedCCCodes] = useState([]);
    const [selectedEmpIds,  setSelectedEmpIds]  = useState([]);

    // Generated payroll table data
    const [tableRows,     setTableRows]     = useState([]);
    const [detailsMap,    setDetailsMap]    = useState({});   // EmpRefno → MonthlySalaryDetailsData[]
    const [optionalMap,   setOptionalMap]   = useState({});   // EmpRefno → lstOptionalHeads[]
    const [pfesiMap,      setPfesiMap]      = useState({});   // EmpRefno → MonthlyPFESIData[]
    const [generatedData, setGeneratedData] = useState(null);

    // Table search
    const [tableSearch, setTableSearch] = useState('');

    // Payroll check warnings — shown after generate
    const [payrollWarnings, setPayrollWarnings] = useState(null);

    // Modal
    const [modalEmp, setModalEmp] = useState(null);

    const displayYears  = getFrontendYears();
    const displayMonths = getFrontendMonths();

    const employeesList = Array.isArray(ccPayrollEmployees) ? ccPayrollEmployees : [];

    // ── On mount ──────────────────────────────────────────────────────────────
    useEffect(() => {
        console.log('🎯 StaffPayrollGeneration mounted');
        return () => { dispatch(resetPayrollData()); };
    }, [dispatch]);

    // ── Year change ───────────────────────────────────────────────────────────
    const handleYearChange = (year) => {
        dispatch(setSelectedYear(year));
        setSelectedCCCodes([]);
        setSelectedEmpIds([]);
        setTableRows([]);
        setGeneratedData(null);
        if (year && selectedMonth) {
            dispatch(fetchSalaryEmpCC({ year, month: selectedMonth }));
        }
    };

    // ── Month change ──────────────────────────────────────────────────────────
    const handleMonthChange = (month) => {
        dispatch(setSelectedMonth(month));
        setSelectedCCCodes([]);
        setSelectedEmpIds([]);
        setTableRows([]);
        setGeneratedData(null);
        if (selectedYear && month) {
            dispatch(fetchSalaryEmpCC({ year: selectedYear, month }));
        }
    };

    // ── CC selection change ───────────────────────────────────────────────────
    const handleCCChange = (codes) => {
        setSelectedCCCodes(codes);
        setSelectedEmpIds([]);
        if (codes.length > 0 && selectedYear && selectedMonth) {
            const firstCC = codes[0];
            dispatch(setSelectedCCCode(firstCC));
            dispatch(fetchCCPayrollEmp({ year: selectedYear, month: selectedMonth, ccCode: firstCC }));
        }
    };

    // ── Generate payroll ──────────────────────────────────────────────────────
    const handleGenerate = async () => {
        if (!selectedYear || !selectedMonth)    { toast.error('Select Year and Month');            return; }
        if (selectedCCCodes.length === 0)       { toast.error('Select at least one Cost Center'); return; }
        if (selectedEmpIds.length === 0)        { toast.error('Select at least one Employee');    return; }

        const empList = selectedEmpIds.join(',');
        const ccCode  = selectedCCCodes[0];

        try {
            dispatch(setSelectedCCCode(ccCode));

            // checkEmpPayRollRequirements is a WARNINGS-ONLY pre-flight check.
            // Never block generation based on its result — always proceed.
            setPayrollWarnings(null); // clear previous warnings
            try {
                const checkResult = await dispatch(checkEmpPayRollRequirements({
                    month: selectedMonth, year: selectedYear,
                    roleId, ccCode, empRefNos: empList,
                })).unwrap();
                const checkData = checkResult?.Data || checkResult;
                if (checkData?.ErrorStatus === 'Exist') {
                    // Build a structured warnings object from all the warning lists
                    const warnings = {
                        attendance:  checkData.Attendencelist      || [],
                        salaryHeads: checkData.SalaryHeadlist      || [],
                        payRevision: checkData.lstPayRevision       || [],
                        noCC:        checkData.NoCClist             || [],
                        transfer:    checkData.TransferCClist       || [],
                        noPFESI:     checkData.NoPFESIlist          || [],
                        noJoining:   checkData.NoJoiningDatelist    || [],
                        payrollExist:checkData.PayrollExistCClist   || [],
                        monthYear:   checkData.MonthYear            || '',
                    };
                    const hasAnyWarning = Object.entries(warnings)
                        .filter(([k]) => k !== 'monthYear')
                        .some(([, v]) => v.length > 0);
                    if (hasAnyWarning) setPayrollWarnings(warnings);
                    console.warn('⚠️ Payroll check warnings (non-blocking):', warnings);
                }
            } catch (checkErr) {
                console.warn('⚠️ checkEmpPayRollRequirements error (ignored, proceeding):', checkErr);
            }

            const result = await dispatch(fetchEmployeeWiseGeneratedPayRollData({
                month: selectedMonth, createdBy: userName, year: selectedYear,
                roleId, ccCode, empRefNos: empList,
            })).unwrap();

            const data = result?.Data || result;
            setGeneratedData(data);

            const rows   = data?.MonthlySalaryData        || [];
            const dets   = data?.MonthlySalaryDetailsData || [];
            const optals = data?.lstOptionalHeads          || [];

            // Enrich rows with MainGridData fields
            const mainMap = {};
            (data?.MainGridData || []).forEach(m => { mainMap[m.EmpRefNo] = m; });

            const enriched = rows.map(r => ({
                ...r,
                Name:            mainMap[r.EmpRefno]?.Name            || r.Name || r.EmpRefno,
                DesignationName: mainMap[r.EmpRefno]?.DesignationName || '',
                Location:        mainMap[r.EmpRefno]?.Location        || '',
                RelievingCC:     mainMap[r.EmpRefno]?.RelievingCC     || '',
            }));

            setTableRows(enriched);

            const pfesis = data?.MonthlyPFESIData || [];
            console.log('🔍 MonthlyPFESIData from API:', pfesis);
            const dm = {}, om = {}, pm = {};
            rows.forEach(r => {
                dm[r.EmpRefno] = dets.filter(d => d.EmployeeId === r.EmpRefno);
                om[r.EmpRefno] = optals.filter(o => o.EmpRefno  === r.EmpRefno);
                pm[r.EmpRefno] = pfesis.filter(p => p.EmployeeId === r.EmpRefno);
            });
            console.log('🔍 pfesiMap built:', pm);
            setDetailsMap(dm);
            setOptionalMap(om);
            setPfesiMap(pm);

            toast.success(`Payroll generated for ${rows.length} employee(s)`);
        } catch (err) {
            console.error('❌ Generate error:', err);
            toast.error(err?.message || 'Failed to generate payroll');
        }
    };

    // ── Reset all ─────────────────────────────────────────────────────────────
    const handleCompleteReset = () => {
        dispatch(setSelectedYear(''));
        dispatch(setSelectedMonth(''));
        dispatch(setSelectedCCCode(''));
        setSelectedCCCodes([]);
        setSelectedEmpIds([]);
        setTableRows([]);
        setGeneratedData(null);
        setModalEmp(null);
        setTableSearch('');
        setPayrollWarnings(null);
        setPfesiMap({});
        dispatch(clearSaveResult());
        toast.info('All filters reset successfully');
    };

    // ── Save single employee — uses savePayRollForSingleEmp → spInsertSingleEmpSalary ──
    const handleSave = async ({ empRow, details, amounts, newHeads, gross, totalDed, netPay }) => {
        const empRefNo = empRow.EmpRefno;

        // Use the last day of the selected month as payroll date
        const payrollDate = getPayrollDate();

        // Build combined salary heads list — field types match old app exactly (all strings)
        const allHeads = [
            ...details.map(d => ({
                SalaryHead:       d.SalaryHead,
                HeadType:         d.HeadType,
                HeadAmount:       String(Math.round(Number(amounts[d.SalaryHead] ?? d.HeadAmount ?? 0))),
                PerDayAmount:     String(d.PerDayAmount || "0"),
                IsEditable:       d.IsEditable || "No",
                ApplicableForPL:  d.ApplicableForPL  || "No",
                ApplicableForESI: d.ApplicableForESI || "No",
                PayDays:          String(d.PayDays ?? empRow.TotalSalaryDays ?? "0") + ".00",  // "28.00" like old app
            })),
            ...newHeads.map(h => ({
                SalaryHead:       h.SalaryHead,
                HeadType:         h.HeadType,
                HeadAmount:       String(Math.round(Number(amounts[h.SalaryHead] ?? h.HeadAmount ?? 0))),
                PerDayAmount:     "0",
                IsEditable:       "Yes",
                ApplicableForPL:  h.ApplicableForPL  || "No",
                ApplicableForESI: h.ApplicableForESI || "No",
                PayDays:          "0",
            })),
        ];

        // TransactionRefNo — from first detail row
        const transactionRefNo = details[0]?.TransactionRefno
            || details[0]?.TransactionRefNo
            || '';

        // ConslidateTransNo — from empRow or generatedData
        const consolidateTransNo = Number(
            empRow.ConslidateTransNo
            || empRow.ConsolidateTransNo
            || generatedData?.ConslidateTransNo
            || 0
        );

        // MainJsonString — ALL values must be strings to match old app (SP uses JSON_VALUE)
        const mainJsonString = JSON.stringify({
            EmployeeId:                  empRefNo,
            PayRollFortheDate:           `${payrollDate.getMonth() + 1}/${payrollDate.getDate()}/${payrollDate.getFullYear()} 12:00:00 AM`,
            NetValue:                    String(Math.round(netPay)),
            GrossValue:                  String(Math.round(gross)),
            Deductions:                  String(Math.round(totalDed)),
            TransactionRefno:            transactionRefNo,
            TotalAttendanceDays:         String(empRow.TotalAttendanceDays      ?? "0"),
            TotalPLAttendanceDays:       String(empRow.TotalPLAttendanceDays    ?? "0"),
            TotalHolidays:               String(empRow.TotalHolidays            ?? "0"),
            TotalAbsentDays:             String(empRow.TotalAbsentDays          ?? "0"),
            TotalSalaryDays:             String(empRow.TotalSalaryDays          ?? "0"),
            CategoryId:                  String(empRow.CategoryId               ?? "0"),
            Category:                    empRow.Category                        || "",
            CCCode:                      empRow.CurrentCC                       || "",
            PaidAmount:                  String(Math.round(netPay)),            // old app sends net value here
            NoofCurrentCCHolidays:       String(empRow.NoofCurrentCCHolidays    ?? "0"),
            NoofCurrentCCHalfDays:       String(empRow.NoofCurrentCCHalfDays    ?? "0"),
            NoofCurrentCCPublicHolidays: String(empRow.NoofCurrentCCPublicHolidays ?? "0"),
            NoofCurrentCCTravelDays:     String(empRow.NoofCurrentCCTravelDays  ?? "0"),
            NoofCurrentCCESIPFCountdays: String(empRow.NoofCurrentCCESIPFCountdays ?? "0"),
            WorkingDays:                 String(empRow.WorkingDays              ?? "0"),
            BalanceLeaves:               String(empRow.BalanceLeaves            ?? "0"),
            SundayPL:                    String(empRow.SundayPL                 ?? "0"),
            GroupId:                     String(empRow.GroupId                  ?? "0"),
            EmpCCType:                   empRow.EmpCCType                       || "WorkingCC",
            IsDWSalary:                  empRow.IsDWSalary                      || "No",
            RelieveCC:                   empRow.RelievingCC                     || "",
            NoofRelCCPresentDays:        String(empRow.NoofRelCCPresentDays     ?? "0"),
            NoofRelCCTravelDays:         String(empRow.NoofRelCCTravelDays      ?? "0"),
            NoofRelCCHalfDays:           String(empRow.NoofRelCCHalfDays        ?? "0"),
            NoofRelCCHolidays:           String(empRow.NoofRelCCHolidays        ?? "0"),
            NoofRelCCPublicHolidays:     String(empRow.NoofRelCCPublicHolidays  ?? "0"),
            NoofRelCCAbsents:            String(empRow.RelievedCCAbsents        ?? "0"),
            CurrentCCAttDays:            String(empRow.CurrentCCAttendance      ?? "0"),
            RelCCAttDays:                String(empRow.RelievedCCAttendance     ?? "0"),
            CurrentCCSalDays:            String(empRow.CurrentCCSalaryDays      ?? "0"),
            RelCCSalDays:                String(empRow.RelievedCCSalaryDays     ?? "0"),
            RelievedCCPL:                String(empRow.RelievedCCPL             ?? "0"),
            CurrentCCPL:                 String(empRow.CurrentCCPL              ?? "0"),
            CurrentCCAbsents:            String(empRow.CurrentCCAbsents         ?? "0"),
            TotalSunDays:                String(empRow.TotalSunDays             ?? "0"),
            NoofRelCCESIPFCountdays:     String(empRow.NoofRelCCESIPFCountdays  ?? "0"),
        });

        const salaryHeadJsonString = JSON.stringify(allHeads);

        console.log('💾 handleSave → savePayRollForSingleEmp (spInsertSingleEmpSalary):', {
            empRefNo, transactionRefNo, consolidateTransNo,
            totalHeads: allHeads.length,
        });

        try {
            // ✅ CORRECT endpoint: SaveDwsIndividualEmpSalary (matches old MVC app)
            // Sends comma-separated strings, NOT JSON — same as old app's SaveEmpSalary JS function
            const payrollDateStr = payrollDate instanceof Date
                ? `${payrollDate.getFullYear()}-${String(payrollDate.getMonth() + 1).padStart(2, '0')}-${String(payrollDate.getDate()).padStart(2, '0')}`
                : String(payrollDate);

            const pfesiData = pfesiMap[empRefNo] || [];

            // Match the format the SP's XML-style JSON parser expects:
            // all numeric values must be quoted strings, no extra fields.
            const pfesiFormatted = pfesiData.map(p => ({
                EmployeeContAmt:  String(p.EmployeeContAmt  ?? 0),
                EmployeeContDca:  p.EmployeeContDca  ?? '',
                EmployerContDca:  p.EmployerContDca  ?? '',
                Type:             p.Type             ?? '',
                IsEditable:       p.IsEditable       ?? 'No',
                EmpContPercent:   String(p.EmpContPercent  ?? 0),
                EmprContPercent:  String(p.EmprContPercent ?? 0),
                AdminPercent:     String(p.AdminPercent    ?? 0),
            }));
            console.log('🔍 pfesiData for', empRefNo, ':', pfesiData);
            console.log('🔍 pfesiJsonString being sent:', JSON.stringify(pfesiFormatted));

            const result = await dispatch(savePayRollForSingleEmp({
                payRollForDate:       payrollDateStr,
                empRefNo,
                transactionRefNo,
                consolidateTransNo,
                roleId:               String(roleId),
                createdBy:            String(userName),
                mainJsonString,
                salaryHeadJsonString,
                pfesiJsonString:      JSON.stringify(pfesiFormatted),
                advanceJsonString:    '[]',
            })).unwrap();

            console.log('✅ Save result:', result);
            toast.success('Payroll saved successfully!');
            // Remove the submitted employee from the table — remaining employees stay
            setTableRows(prev => prev.filter(r => r.EmpRefno !== empRefNo));
            setModalEmp(null);
        } catch (err) {
            console.error('❌ Save error:', err);
            toast.error(typeof err === 'string' ? err : err?.message || 'Failed to save payroll');
        }
    };

    // ── Dropdown helpers ──────────────────────────────────────────────────────
    const ccOptions  = Array.isArray(salaryEmpCostCenters) ? salaryEmpCostCenters : [];
    const getCCCode  = o => o.CCCode  || o.CC_Code  || '';
    const getCCLabel = o => o.CCName || o.CC_Name || o.CCCode || o.CC_Code || '';

    const empOptions  = Array.isArray(employeesList) ? employeesList : [];
    const getEmpId    = o => o.EmpRefNo  || o.EmpRefno  || '';
    const getEmpLabel = o => o.Name      || o.EmpRefNo  || '';

    // Table filter
    const filteredRows = tableRows.filter(r => {
        if (!tableSearch) return true;
        const q = tableSearch.toLowerCase();
        return (r.EmpRefno || '').toLowerCase().includes(q)
            || (r.Name     || '').toLowerCase().includes(q)
            || (r.Location || '').toLowerCase().includes(q);
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl shadow-xl p-8 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-10 w-10" />
                            <div>
                                <h1 className="text-3xl font-bold">Staff Payroll Generation</h1>
                                <p className="text-indigo-100 dark:text-indigo-200 text-lg mt-1">
                                    Generate and manage employee payroll
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCompleteReset}
                                className="flex items-center gap-2 p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                                title="Reset All Filters"
                            >
                                <RotateCcw className="h-5 w-5" />
                                <span className="text-sm font-semibold hidden sm:inline">Reset All</span>
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Total Employees</p>
                                    <p className="text-2xl font-bold">{tableRows.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Building className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Selected CCs</p>
                                    <p className="text-2xl font-bold">{selectedCCCodes.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Selected Emp</p>
                                    <p className="text-2xl font-bold">{selectedEmpIds.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <IndianRupee className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Total Net Pay</p>
                                    <p className="text-2xl font-bold">
                                        &#8377;{formatCurrency(tableRows.reduce((s, r) => s + (r.NetValue || 0), 0))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* ── Filters Card ─────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-visible">
                    <div
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Filter className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                Filters &amp; Selection
                            </h2>
                            {showFilters
                                ? <ChevronUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                : <ChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="p-8 space-y-6">
                            {/* Row 1: Year + Month */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Select Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedYear || ''}
                                        onChange={e => handleYearChange(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select Year</option>
                                        {displayYears.map(y => (
                                            <option key={y.Year} value={y.Year}>{y.Year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2  items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Select Month <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedMonth || ''}
                                        onChange={e => handleMonthChange(e.target.value)}
                                        disabled={!selectedYear}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select Month</option>
                                        {displayMonths.map(m => (
                                            <option key={m.Month} value={m.Month}>{m.MonthName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Cost Center + Employee */}
                            {selectedYear && selectedMonth && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {salaryEmpCCLoading ? (
                                        <div>
                                            <label className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                Select Cost Centers <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex items-center justify-center py-4 gap-2 text-sm text-gray-500 dark:text-gray-400
                                                            border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                                                <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                                                Loading cost centers…
                                            </div>
                                        </div>
                                    ) : ccOptions.length === 0 ? (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center gap-2">
                                                <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                Select Cost Centers <span className="text-red-500">*</span>
                                            </label>
                                            <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                                                <AlertCircle className="h-7 w-7 mx-auto mb-2 text-gray-400" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">No cost centers available</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <MultiSelectDropdown
                                            label="Select Cost Centers"
                                            icon={Building}
                                            options={ccOptions}
                                            selected={selectedCCCodes}
                                            onChange={handleCCChange}
                                            placeholder="Select Cost Centers"
                                            getValue={getCCCode}
                                            getLabel={getCCLabel}
                                            loading={false}
                                            disabled={false}
                                            required
                                        />
                                    )}

                                    {selectedCCCodes.length === 0 ? (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center gap-2">
                                                <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                Select Employees <span className="text-red-500">*</span>
                                            </label>
                                            <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl
                                                            bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500
                                                            flex items-center gap-2 text-sm">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                Select a Cost Center first
                                            </div>
                                        </div>
                                    ) : ccPayrollEmpLoading ? (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center gap-2">
                                                <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                Select Employees <span className="text-red-500">*</span>
                                            </label>
                                            <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl
                                                            bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2 text-sm text-gray-500">
                                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                                                Loading employees…
                                            </div>
                                        </div>
                                    ) : (
                                        <MultiSelectDropdown
                                            label="Select Employees"
                                            icon={Users}
                                            options={empOptions}
                                            selected={selectedEmpIds}
                                            onChange={setSelectedEmpIds}
                                            placeholder={empOptions.length === 0 ? 'No employees found' : 'Select Employees'}
                                            getValue={getEmpId}
                                            getLabel={getEmpLabel}
                                            loading={false}
                                            disabled={empOptions.length === 0}
                                            required
                                        />
                                    )}
                                </div>
                            )}

                            {/* Generate button */}
                            {selectedEmpIds.length > 0 && (
                                <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={employeeWisePayrollDataLoading}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all shadow-md
                                            ${employeeWisePayrollDataLoading
                                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-lg'
                                            }`}
                                    >
                                        {employeeWisePayrollDataLoading
                                            ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating…</>
                                            : <><FileText className="h-5 w-5" /> Generate Payroll</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Loading State ─────────────────────────────────────────────── */}
                {employeeWisePayrollDataLoading && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-16 flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Generating payroll data…</p>
                    </div>
                )}

                {/* ── Payroll Warnings Panel ────────────────────────────────────────── */}
                {!employeeWisePayrollDataLoading && payrollWarnings && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-amber-200 dark:border-amber-700">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20
                                        px-6 py-4 border-b border-amber-200 dark:border-amber-700
                                        flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                                        Payroll Generation Warnings
                                    </h3>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                        {payrollWarnings.monthYear && `For ${payrollWarnings.monthYear} — `}
                                        The following employees may not be generated due to pending issues
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPayrollWarnings(null)}
                                className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors text-amber-600 dark:text-amber-400"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Warning rows */}
                        <div className="p-5 space-y-3">
                            {[
                                {
                                    key: 'payRevision',
                                    label: 'Pay Revision Pending Approval',
                                    desc: 'Payroll will generate using current approved salary, not the revised amount.',
                                    color: 'amber',
                                    icon: '💰',
                                },
                                {
                                    key: 'attendance',
                                    label: 'Attendance Not Finalised',
                                    desc: 'Attendance for this month has not been approved. Payroll may use incomplete data.',
                                    color: 'orange',
                                    icon: '📅',
                                },
                                {
                                    key: 'salaryHeads',
                                    label: 'Salary Heads Not Configured',
                                    desc: 'Salary head details are missing or not approved for these employees.',
                                    color: 'red',
                                    icon: '📋',
                                },
                                {
                                    key: 'payrollExist',
                                    label: 'Payroll Already Exists',
                                    desc: 'A payroll record already exists for this period. These employees will be skipped.',
                                    color: 'red',
                                    icon: '🔒',
                                },
                                {
                                    key: 'noCC',
                                    label: 'Cost Center Not Assigned',
                                    desc: 'No cost center is assigned for these employees.',
                                    color: 'red',
                                    icon: '🏢',
                                },
                                {
                                    key: 'noPFESI',
                                    label: 'PF / ESI Not Configured',
                                    desc: 'PF or ESI rules are not set up for these employees.',
                                    color: 'orange',
                                    icon: '⚙️',
                                },
                                {
                                    key: 'transfer',
                                    label: 'Transfer Pending',
                                    desc: 'An inter-CC transfer is pending for these employees.',
                                    color: 'amber',
                                    icon: '🔄',
                                },
                                {
                                    key: 'noJoining',
                                    label: 'Joining Date Not Set',
                                    desc: 'Joining date is missing for these employees.',
                                    color: 'red',
                                    icon: '📆',
                                },
                            ]
                                .filter(w => payrollWarnings[w.key]?.length > 0)
                                .map(w => {
                                    const colorMap = {
                                        amber: {
                                            bg:   'bg-amber-50 dark:bg-amber-900/10',
                                            border:'border-amber-200 dark:border-amber-700',
                                            tag:  'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200',
                                            label:'text-amber-800 dark:text-amber-300',
                                            desc: 'text-amber-700 dark:text-amber-400',
                                        },
                                        orange: {
                                            bg:   'bg-orange-50 dark:bg-orange-900/10',
                                            border:'border-orange-200 dark:border-orange-700',
                                            tag:  'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200',
                                            label:'text-orange-800 dark:text-orange-300',
                                            desc: 'text-orange-700 dark:text-orange-400',
                                        },
                                        red: {
                                            bg:   'bg-red-50 dark:bg-red-900/10',
                                            border:'border-red-200 dark:border-red-700',
                                            tag:  'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200',
                                            label:'text-red-800 dark:text-red-300',
                                            desc: 'text-red-700 dark:text-red-400',
                                        },
                                    }[w.color];
                                    return (
                                        <div key={w.key}
                                             className={`${colorMap.bg} ${colorMap.border} border rounded-xl p-4`}>
                                            <div className="flex items-start gap-3">
                                                <span className="text-lg mt-0.5">{w.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold ${colorMap.label} mb-1`}>
                                                        {w.label}
                                                    </p>
                                                    <p className={`text-xs ${colorMap.desc} mb-2`}>{w.desc}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {payrollWarnings[w.key].map((name, i) => (
                                                            <span key={i}
                                                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap.tag}`}>
                                                                <User className="h-3 w-3" />
                                                                {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* ── Results Table ─────────────────────────────────────────────── */}
                {!employeeWisePayrollDataLoading && tableRows.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20
                                        p-5 border-b border-gray-200 dark:border-gray-700
                                        flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Generated Payroll
                                <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                                    — {tableRows.length} employee(s)
                                </span>
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        value={tableSearch}
                                        onChange={e => setTableSearch(e.target.value)}
                                        placeholder="Search…"
                                        className="pl-9 pr-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl
                                                   focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500
                                                   dark:bg-gray-700 dark:text-white w-44"
                                    />
                                </div>
                                <button
                                    className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-300 dark:border-gray-600
                                               hover:border-indigo-500 dark:hover:border-indigo-400
                                               text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300
                                               rounded-xl text-sm font-semibold transition-colors"
                                    title="Export to Excel"
                                >
                                    <Download className="h-4 w-4" /> Export
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-indigo-700 dark:bg-indigo-800 text-white">
                                        <th className="px-3 py-3 w-12 text-center"></th>
                                        {[
                                            ['Employee Id',     'text-left'  ],
                                            ['Name',            'text-left'  ],
                                            ['Designation',     'text-left'  ],
                                            ['Cost Center',     'text-center'],
                                            ['Location',        'text-left'  ],
                                            ['Working Days',    'text-center'],
                                            ['Salary Days',     'text-center'],
                                            ['Paid Leaves',     'text-center'],
                                            ['Holidays',        'text-center'],
                                            ['Earnings',        'text-right' ],
                                            ['Deductions',      'text-right' ],
                                            ['Net',             'text-right' ],
                                            ['Group',           'text-center'],
                                            ['Relieved CC/Job', 'text-left'  ],
                                        ].map(([lbl, cls]) => (
                                            <th key={lbl} className={`px-3 py-3 text-xs font-bold uppercase tracking-wide ${cls}`}>
                                                {lbl}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={15} className="text-center py-10 text-gray-400 dark:text-gray-500">
                                                No records match your search
                                            </td>
                                        </tr>
                                    ) : filteredRows.map((row, i) => (
                                        <tr
                                            key={row.EmpRefno || i}
                                            className={`hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors
                                                        ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/60 dark:bg-gray-800/60'}`}
                                        >
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => setModalEmp(row)}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40
                                                               text-indigo-600 dark:text-indigo-400 transition-colors"
                                                    title="View / Edit payroll"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                            <td className="px-3 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{row.EmpRefno}</td>
                                            <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.Name}</td>
                                            <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">{row.DesignationName || '—'}</td>
                                            <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{row.CurrentCC || row.CurrentCostCenter || '—'}</td>
                                            <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{row.Location || '—'}</td>
                                            <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{row.WorkingDays}</td>
                                            <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{row.TotalSalaryDays}</td>
                                            <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{row.TotalPLAttendanceDays}</td>
                                            <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{row.TotalHolidays}</td>
                                            <td className="px-3 py-3 text-right font-medium text-gray-800 dark:text-gray-200">{formatCurrency(row.GrossValue)}</td>
                                            <td className="px-3 py-3 text-right font-medium text-red-600 dark:text-red-400">{formatCurrency(row.Deductions)}</td>
                                            <td className="px-3 py-3 text-right font-bold text-green-700 dark:text-green-400">{formatCurrency(row.NetValue)}</td>
                                            <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{row.GroupName}</td>
                                            <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">{row.RelievingCC || ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Empty state ───────────────────────────────────────────────── */}
                {!employeeWisePayrollDataLoading && generatedData && tableRows.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-16 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No payroll data found for the selected criteria
                        </p>
                    </div>
                )}
            </div>

            {/* ── Employee Detail Modal ─────────────────────────────────────────── */}
            {modalEmp && (
                <EmployeeDetailModal
                    empRow={modalEmp}
                    details={detailsMap[modalEmp.EmpRefno] || []}
                    optionalHeads={optionalMap[modalEmp.EmpRefno] || []}
                    ccCode={modalEmp.CurrentCC || selectedCCCodes[0] || ''}
                    onClose={() => setModalEmp(null)}
                    onSave={handleSave}
                    saving={savePayrollLoading}
                />
            )}
        </div>
    );
};

export default StaffPayrollGeneration;