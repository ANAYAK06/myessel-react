import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import {
    fetchEmpForFinalSalary,
    generateFinalSalary,
    saveFinalSalary,
    clearGeneratedData,
    clearSaveResult,
    resetAll,
    selectEmpListArray,
    selectEmpListLoading,
    selectGeneratedData,
    selectGenerateStatus,
    selectGenerateLoading,
    selectGenerateError,
    selectSaveStatus,
    selectSaveLoading,
    selectSaveError,
} from '../../slices/HRSlice/staffFullFinalSlice';

import {
    User, Building2, Loader2, CheckCircle, AlertCircle,
    RotateCcw, Send, DollarSign, TrendingUp, TrendingDown,
    Calendar, Clock, Award, FileText, ChevronDown, Zap,
    Navigation, BadgeDollarSign, Wallet, Percent, Hash,
    Briefcase, Plus, Minus, IndianRupee, X,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val, dec = 2) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

const isBenefit   = (type) => type === 'Benefit' || type === 'OtherBenefit';
const isDeduction = (type) => type === 'Deduction';

// ─── Shared Sub-components ────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, gradient = 'from-indigo-600 to-purple-600' }) => (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

// Financial summary cards — values come from adjusted totals
const StatCard = ({ label, value, icon: Icon, gradient, sub, delta }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} shadow-lg`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">{label}</p>
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </div>
            <p className="text-2xl font-black">₹{fmt(value)}</p>
            {delta !== undefined && delta !== 0 && (
                <p className={`text-xs mt-1 font-semibold ${delta > 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {delta > 0 ? '+' : ''}₹{fmt(Math.abs(delta))} from optional heads
                </p>
            )}
            {(!delta || delta === 0) && sub && <p className="text-xs text-white/70 mt-1">{sub}</p>}
        </div>
    </div>
);

const colorMap = {
    indigo:  { border: 'border-indigo-200 dark:border-indigo-800',  bg: 'bg-indigo-50 dark:bg-indigo-900/20',  icon: 'bg-indigo-100 dark:bg-indigo-900/40',  text: 'text-indigo-600 dark:text-indigo-400',  val: 'text-indigo-700 dark:text-indigo-300'  },
    purple:  { border: 'border-purple-200 dark:border-purple-800',  bg: 'bg-purple-50 dark:bg-purple-900/20',  icon: 'bg-purple-100 dark:bg-purple-900/40',  text: 'text-purple-600 dark:text-purple-400',  val: 'text-purple-700 dark:text-purple-300'  },
    violet:  { border: 'border-violet-200 dark:border-violet-800',  bg: 'bg-violet-50 dark:bg-violet-900/20',  icon: 'bg-violet-100 dark:bg-violet-900/40',  text: 'text-violet-600 dark:text-violet-400',  val: 'text-violet-700 dark:text-violet-300'  },
    blue:    { border: 'border-blue-200 dark:border-blue-800',      bg: 'bg-blue-50 dark:bg-blue-900/20',      icon: 'bg-blue-100 dark:bg-blue-900/40',      text: 'text-blue-600 dark:text-blue-400',      val: 'text-blue-700 dark:text-blue-300'      },
    rose:    { border: 'border-rose-200 dark:border-rose-800',      bg: 'bg-rose-50 dark:bg-rose-900/20',      icon: 'bg-rose-100 dark:bg-rose-900/40',      text: 'text-rose-600 dark:text-rose-400',      val: 'text-rose-700 dark:text-rose-300'      },
    amber:   { border: 'border-amber-200 dark:border-amber-800',    bg: 'bg-amber-50 dark:bg-amber-900/20',    icon: 'bg-amber-100 dark:bg-amber-900/40',    text: 'text-amber-600 dark:text-amber-400',    val: 'text-amber-700 dark:text-amber-300'    },
    gray:    { border: 'border-gray-200 dark:border-gray-700',      bg: 'bg-gray-50 dark:bg-gray-900/40',      icon: 'bg-gray-100 dark:bg-gray-700',          text: 'text-gray-400',                         val: 'text-gray-400'                         },
};

const InfoPill = ({ label, value, icon: Icon, color = 'indigo', loading }) => {
    const c = colorMap[value ? color : 'gray'] ?? colorMap['gray'];
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
                    {loading ? 'Loading…' : (value || 'N/A')}
                </p>
            </div>
        </div>
    );
};

// ─── Salary heads breakdown table (fixed heads) ────────────────────────────────
const HeadsTable = ({ title, icon: Icon, rows, gradient, emptyMsg }) => (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={`px-4 py-3 bg-gradient-to-r ${gradient} flex items-center gap-2`}>
            <Icon className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">{title}</span>
            <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{rows.length}</span>
        </div>
        {rows.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">{emptyMsg}</div>
        ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.SalaryHead || r.HeadName}</p>
                            {r.optional && (
                                <span className="text-[10px] text-purple-500 dark:text-purple-400 font-medium">Optional head</span>
                            )}
                            {r.ApplicableForPL === 'Yes' && !r.optional && (
                                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">PL applicable</span>
                            )}
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">₹{fmt(r.HeadAmount)}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ─── Add Optional Head Modal ──────────────────────────────────────────────────
const AddOptionalHeadModal = ({ open, onClose, optionalGroups, optionalAmounts, onChange }) => {
    const [selectedType, setSelectedType] = useState('');
    const [selectedHead, setSelectedHead] = useState('');
    const [amount, setAmount]             = useState('');
    const [added, setAdded]               = useState(false);

    const types         = Object.keys(optionalGroups);
    const headsForType  = selectedType ? (optionalGroups[selectedType] || []) : [];
    const isBen         = isBenefit(selectedType);
    const existingAmt   = selectedHead ? (optionalAmounts[selectedHead] || '') : '';

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        setSelectedHead('');
        setAmount('');
        setAdded(false);
    };

    const handleHeadChange = (e) => {
        const name = e.target.value;
        setSelectedHead(name);
        setAmount(optionalAmounts[name] || '');
        setAdded(false);
    };

    const handleAdd = () => {
        if (!selectedHead || parseFloat(amount) <= 0) return;
        onChange(selectedHead, amount);
        setAdded(true);
        // Reset head & amount for next entry (keep type)
        setTimeout(() => {
            setSelectedHead('');
            setAmount('');
            setAdded(false);
        }, 800);
    };

    const handleClose = () => {
        setSelectedType('');
        setSelectedHead('');
        setAmount('');
        setAdded(false);
        onClose();
    };

    if (!open) return null;

    const canAdd = selectedHead && parseFloat(amount) > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Plus className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm">Add Optional Salary Head</span>
                    </div>
                    <button onClick={handleClose}
                        className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">

                    {/* Step 1 — Type */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                            Step 1 &mdash; Head Type
                        </label>
                        <div className="relative">
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <select value={selectedType} onChange={handleTypeChange}
                                className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/30 transition-all">
                                <option value="">— Select Type —</option>
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        {selectedType && (
                            <p className={`text-[10px] mt-1.5 font-bold flex items-center gap-1 ${isBen ? 'text-indigo-500' : 'text-rose-500'}`}>
                                {isBen
                                    ? <><Plus className="h-3 w-3" /> Adds to Gross &amp; Net pay</>
                                    : <><Minus className="h-3 w-3" /> Reduces Net pay only</>
                                }
                            </p>
                        )}
                    </div>

                    {/* Step 2 — Head */}
                    {selectedType && (
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Step 2 &mdash; Salary Head
                            </label>
                            <div className="relative">
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <select value={selectedHead} onChange={handleHeadChange}
                                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/30 transition-all">
                                    <option value="">— Select Head —</option>
                                    {headsForType.map(h => (
                                        <option key={h.HeadName} value={h.HeadName}>
                                            {h.HeadName}{optionalAmounts[h.HeadName] > 0 ? ` (₹${fmt(optionalAmounts[h.HeadName])})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedHead && parseFloat(existingAmt) > 0 && (
                                <p className="text-[10px] mt-1.5 font-semibold text-amber-500">
                                    Currently set to ₹{fmt(existingAmt)} — entering a new value will update it
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 3 — Amount */}
                    {selectedHead && (
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Step 3 &mdash; Amount (₹)
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    autoFocus
                                    onChange={e => { setAmount(e.target.value); setAdded(false); }}
                                    onKeyDown={e => e.key === 'Enter' && canAdd && handleAdd()}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 text-sm text-right font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-100 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 pt-1">
                        <button onClick={handleClose}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600">
                            Done
                        </button>
                        <button onClick={handleAdd} disabled={!canAdd || added}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all disabled:cursor-not-allowed
                                ${added
                                    ? 'bg-green-500 text-white opacity-100'
                                    : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 disabled:opacity-50'
                                }`}>
                            {added
                                ? <><CheckCircle className="h-4 w-4" /> Added!</>
                                : <><Plus className="h-4 w-4" /> {parseFloat(existingAmt) > 0 ? 'Update' : 'Add'} Head</>
                            }
                        </button>
                    </div>

                    <p className="text-[10px] text-center text-gray-400">
                        After adding, you can add another head or click Done to close.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const StaffFullFinal = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const userName = userData?.userName || userData?.username || 'User';

    // ── Selectors ────────────────────────────────────────────────────────────
    const empList         = useSelector(selectEmpListArray);
    const empListLoading  = useSelector(selectEmpListLoading);
    const generatedData   = useSelector(selectGeneratedData);
    const generateStatus  = useSelector(selectGenerateStatus);
    const generateLoading = useSelector(selectGenerateLoading);
    const generateError   = useSelector(selectGenerateError);
    const saveStatus      = useSelector(selectSaveStatus);
    const saveLoading     = useSelector(selectSaveLoading);
    const saveError       = useSelector(selectSaveError);

    // ── Local State ──────────────────────────────────────────────────────────
    const [selectedEmpRefNo, setSelectedEmpRefNo] = useState('');
    const [optionalAmounts, setOptionalAmounts]   = useState({});
    const [showOptionalModal, setShowOptionalModal] = useState(false);

    // ── Lifecycle ────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchEmpForFinalSalary());
        return () => dispatch(resetAll());
    }, [dispatch]);

    // Reset optional amounts whenever a new salary is generated
    useEffect(() => {
        if (generateStatus === 'success') setOptionalAmounts({});
    }, [generateStatus]);

    // ── Side-effects: save status ─────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Full & Final salary submitted successfully!');
            handleReset();
            dispatch(clearSaveResult());
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(typeof saveError === 'string' ? saveError : 'Submission failed. Please try again.');
        }
    }, [saveStatus, saveError]); // eslint-disable-line

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEmployeeChange = useCallback((e) => {
        setSelectedEmpRefNo(e.target.value);
        dispatch(clearGeneratedData());
        setOptionalAmounts({});
    }, [dispatch]);

    const handleGenerate = useCallback(() => {
        if (!selectedEmpRefNo) { toast.error('Please select an employee first.'); return; }
        dispatch(generateFinalSalary({ empRefNo: selectedEmpRefNo, createdBy: userName }));
    }, [selectedEmpRefNo, userName, dispatch]);

    const handleSave = useCallback(() => {
        if (!selectedEmpRefNo) return;
        dispatch(saveFinalSalary({ empRefNo: selectedEmpRefNo, createdBy: userName }));
    }, [selectedEmpRefNo, userName, dispatch]);

    const handleReset = useCallback(() => {
        setSelectedEmpRefNo('');
        setOptionalAmounts({});
        dispatch(clearGeneratedData());
        dispatch(clearSaveResult());
    }, [dispatch]);

    const handleOptionalAmountChange = useCallback((headName, value) => {
        setOptionalAmounts(prev => ({ ...prev, [headName]: value }));
    }, []);

    // ── Derived Data ─────────────────────────────────────────────────────────
    const d = generatedData;

    const earnings   = d?.lstMonthSalaryHeads?.filter(h => h.HeadType === 'Earning')   || [];
    const deductions = d?.lstMonthSalaryHeads?.filter(h => h.HeadType === 'Deduction') || [];

    // Group optional heads by HeadType
    const optionalGroups = useMemo(() => {
        const groups = {};
        (d?.lstMonthSalaryOptionalHeads || []).forEach(h => {
            if (!groups[h.HeadType]) groups[h.HeadType] = [];
            groups[h.HeadType].push(h);
        });
        return groups;
    }, [d]);

    // Compute totals from entered optional amounts
    const { optBenefitTotal, optDeductionTotal, adjustedGross, adjustedDeduction, adjustedNet } = useMemo(() => {
        let optBenefitTotal   = 0;
        let optDeductionTotal = 0;

        (d?.lstMonthSalaryOptionalHeads || []).forEach(h => {
            const amt = parseFloat(optionalAmounts[h.HeadName]) || 0;
            if (amt <= 0) return;
            if (isBenefit(h.HeadType))   optBenefitTotal   += amt;
            if (isDeduction(h.HeadType)) optDeductionTotal += amt;
        });

        const baseGross     = parseFloat(d?.FinalGross)     || 0;
        const baseDeduction = parseFloat(d?.FinalDeduction) || 0;
        const baseNet       = parseFloat(d?.FinalNet)       || 0;

        return {
            optBenefitTotal,
            optDeductionTotal,
            adjustedGross:     baseGross     + optBenefitTotal,
            adjustedDeduction: baseDeduction + optDeductionTotal,
            adjustedNet:       baseNet       + optBenefitTotal - optDeductionTotal,
        };
    }, [d, optionalAmounts]);

    // Optional heads that have non-zero amounts (for breakdown display)
    const activeOptionalEarnings = useMemo(() =>
        (d?.lstMonthSalaryOptionalHeads || [])
            .filter(h => isBenefit(h.HeadType) && parseFloat(optionalAmounts[h.HeadName]) > 0)
            .map(h => ({ HeadName: h.HeadName, SalaryHead: h.HeadName, HeadAmount: parseFloat(optionalAmounts[h.HeadName]), optional: true })),
        [d, optionalAmounts]
    );

    const activeOptionalDeductions = useMemo(() =>
        (d?.lstMonthSalaryOptionalHeads || [])
            .filter(h => isDeduction(h.HeadType) && parseFloat(optionalAmounts[h.HeadName]) > 0)
            .map(h => ({ HeadName: h.HeadName, SalaryHead: h.HeadName, HeadAmount: parseFloat(optionalAmounts[h.HeadName]), optional: true })),
        [d, optionalAmounts]
    );

    const hasOptionalEntries = optBenefitTotal > 0 || optDeductionTotal > 0;

    const isAlreadyGenerated = generateStatus === 'failed' &&
        typeof generateError === 'string' &&
        generateError.toLowerCase().includes('already generated');

    const selectedEmpName = empList.find(e => e.EmpRefNo === selectedEmpRefNo)?.Name || '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <BadgeDollarSign className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Staff Full &amp; Final</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Generate and submit final settlement salary for exited employees</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Settlement</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Employee Selection Card ───────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40">
                        <div className="flex items-center gap-3">
                            <BadgeDollarSign className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Full &amp; Final Settlement Form</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Select an employee, generate the settlement, then submit</p>
                            </div>
                        </div>
                        <button type="button" onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                        <div>
                            <SectionHeader
                                icon={User}
                                title="Select Employee"
                                subtitle="Choose an employee eligible for full & final settlement"
                                gradient="from-indigo-600 to-purple-600"
                            />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                        Employee <span className="text-rose-500 ml-0.5">*</span>
                                    </label>
                                    <div className="relative">
                                        {empListLoading
                                            ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-500 pointer-events-none" />
                                            : <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        }
                                        <select
                                            value={selectedEmpRefNo}
                                            onChange={handleEmployeeChange}
                                            disabled={empListLoading}
                                            className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all disabled:opacity-60"
                                        >
                                            <option value="">— Select Employee —</option>
                                            {[...new Map(empList.map(emp => [emp.EmpRefNo, emp])).values()].map(emp => (
                                                <option key={emp.EmpRefNo} value={emp.EmpRefNo}>{emp.Name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {empList.length === 0 && !empListLoading && (
                                        <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> No employees pending settlement found.
                                        </p>
                                    )}
                                </div>

                                {selectedEmpRefNo ? (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
                                            <User className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{selectedEmpName}</p>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">ID: {selectedEmpRefNo}</p>
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

                            <div className="mt-5 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={!selectedEmpRefNo || generateLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {generateLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                                        : <><Zap className="h-4 w-4" /> Generate Settlement</>
                                    }
                                </button>
                                {generateStatus === 'success' && (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                        <CheckCircle className="h-4 w-4" /> Data generated successfully
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Already Generated banner */}
                        {isAlreadyGenerated && (
                            <div className="flex items-start gap-4 p-5 rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Salary Already Generated</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                                        The full &amp; final salary for <strong>{selectedEmpName}</strong> has already been generated and is pending approval.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Other error banner */}
                        {generateStatus === 'failed' && !isAlreadyGenerated && generateError && (
                            <div className="flex items-start gap-4 p-5 rounded-2xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Generation Failed</p>
                                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                                        {typeof generateError === 'string' ? generateError : 'An error occurred. Please try again.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Generated Data ────────────────────────────────────────── */}
                {d && generateStatus === 'success' && (
                    <>
                        {/* ── Employee Info ──────────────────────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                            <SectionHeader icon={User} title="Employee Information" subtitle="Details fetched from the exit record" gradient="from-indigo-600 to-purple-600" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                <InfoPill label="Employee Name"    value={d.EmployeeName}    icon={User}      color="indigo" />
                                <InfoPill label="Employee ID"      value={d.EmpRefNo}         icon={Hash}      color="purple" />
                                <InfoPill label="Cost Center"      value={d.CCCode}           icon={Building2} color="violet" />
                                <InfoPill label="Group"            value={d.GroupName || (d.GroupId ? `Group ${d.GroupId}` : null)} icon={Briefcase} color="blue" />
                                <InfoPill label="Joining Date"     value={d.JoiningDate}      icon={Calendar}  color="indigo" />
                                <InfoPill label="Resignation Date" value={d.ResignationDate}  icon={Calendar}  color="purple" />
                                <InfoPill label="Relieving Date"   value={d.RelievingDate}    icon={Calendar}  color="violet" />
                                <InfoPill label="Transaction Ref"  value={d.TransactionRefNo} icon={FileText}  color="blue" />
                            </div>
                        </div>

                        {/* ── Financial Summary ──────────────────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                            <SectionHeader icon={DollarSign} title="Financial Summary" subtitle={hasOptionalEntries ? 'Adjusted with optional head entries' : 'Base settlement amounts'} gradient="from-purple-600 to-indigo-600" />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <StatCard
                                    label="Final Net Amount"
                                    value={adjustedNet}
                                    icon={Wallet}
                                    gradient="from-indigo-500 to-violet-600"
                                    sub="Net payable to employee"
                                    delta={hasOptionalEntries ? (optBenefitTotal - optDeductionTotal) : undefined}
                                />
                                <StatCard
                                    label="Final Gross"
                                    value={adjustedGross}
                                    icon={TrendingUp}
                                    gradient="from-purple-500 to-indigo-600"
                                    sub="Total gross earnings"
                                    delta={hasOptionalEntries ? optBenefitTotal : undefined}
                                />
                                <StatCard
                                    label="Total Deductions"
                                    value={adjustedDeduction}
                                    icon={TrendingDown}
                                    gradient="from-rose-500 to-pink-600"
                                    sub="Total amount deducted"
                                    delta={hasOptionalEntries ? optDeductionTotal : undefined}
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <InfoPill label="Leave Encashment"  value={`₹${fmt(d.LeaveEncashment)}`}       icon={Award}      color="indigo" />
                                <InfoPill label="Last Drawn Salary" value={`₹${fmt(d.LastDrawnSalary)}`}      icon={DollarSign} color="purple" />
                                <InfoPill label="Per Day Rate"      value={`₹${fmt(d.LastDrawnSalaryPerDay)}`} icon={Percent}    color="violet" />
                                <InfoPill label="Other Due"         value={`₹${fmt(d.OtherDue)}`}             icon={Wallet}     color="blue" />
                            </div>

                            {/* Optional totals summary row */}
                            {hasOptionalEntries && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {optBenefitTotal > 0 && (
                                        <div className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-4 w-4 text-indigo-500" />
                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Optional Benefits Added</span>
                                            </div>
                                            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">+₹{fmt(optBenefitTotal)}</span>
                                        </div>
                                    )}
                                    {optDeductionTotal > 0 && (
                                        <div className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20">
                                            <div className="flex items-center gap-2">
                                                <Minus className="h-4 w-4 text-rose-500" />
                                                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Optional Deductions Added</span>
                                            </div>
                                            <span className="text-sm font-black text-rose-700 dark:text-rose-300">−₹{fmt(optDeductionTotal)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Gratuity & Experience ──────────────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                            <SectionHeader icon={Award} title="Gratuity &amp; Experience" subtitle="Gratuity eligibility and total service period" gradient="from-violet-600 to-purple-600" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                <InfoPill label="Total Days"       value={`${d.TotalExperiencedays} days`} icon={Clock}      color="indigo" />
                                <InfoPill label="Gratuity Years"   value={`${d.GratuityYears} yrs`}       icon={Clock}      color="purple" />
                                <InfoPill label="Gratuity Days"    value={`${d.Gratuitydays} days`}       icon={Clock}      color="violet" />
                                <InfoPill label="Gratuity Per Day" value={`₹${fmt(d.GratuityPerday)}`}   icon={DollarSign} color="blue" />
                                <InfoPill label="Gratuity Amount"  value={`₹${fmt(d.Gratuity)}`}         icon={Award}      color="indigo" />
                                <InfoPill label="Bonus Basic"      value={`₹${fmt(d.BonusBasic)}`}       icon={TrendingUp} color="purple" />
                            </div>
                            {d.Gratuity === 0 && (
                                <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    Gratuity is ₹0.00 — employee may not have completed the minimum service period (5 years).
                                </div>
                            )}
                        </div>

                        {/* ── Last Month Salary ──────────────────────────────── */}
                        {d.MonthSalary && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                                <SectionHeader icon={FileText} title="Last Month Salary" subtitle={`Payroll for ${d.MonthSalary.PayRollFortheDate || 'last processed month'}`} gradient="from-indigo-600 to-blue-600" />
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    <InfoPill label="Gross"          value={`₹${fmt(d.MonthSalary.Gross)}`}          icon={TrendingUp}   color="indigo" />
                                    <InfoPill label="Deduction"      value={`₹${fmt(d.MonthSalary.TotalDeduction)}`} icon={TrendingDown} color="rose" />
                                    <InfoPill label="Net Amount"     value={`₹${fmt(d.MonthSalary.NetAmount)}`}      icon={Wallet}       color="purple" />
                                    <InfoPill label="Present Days"   value={`${d.MonthSalary.NoofPresentDays} days`} icon={Calendar}     color="violet" />
                                    <InfoPill label="PL Days"        value={`${d.MonthSalary.NoofPLDays} days`}      icon={Calendar}     color="blue" />
                                    <InfoPill label="Total Days"     value={`${d.MonthSalary.TotalSalaryDays} days`} icon={Clock}        color="indigo" />
                                    <InfoPill label="Balance Leaves" value={`${d.MonthSalary.BalanceLeaves} days`}   icon={Clock}        color="purple" />
                                    <InfoPill label="Status"         value={d.MonthSalary.AmountStatus}              icon={CheckCircle}  color="violet" />
                                    <InfoPill label="Category"       value={d.MonthSalary.Category}                  icon={Briefcase}    color="blue" />
                                </div>
                                {d.MonthSalary.CCName && (
                                    <div className="mt-3">
                                        <InfoPill label="Cost Center Name" value={d.MonthSalary.CCName} icon={Building2} color="indigo" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Salary Head Breakdown (fixed + active optional heads) ── */}
                        {(earnings.length > 0 || deductions.length > 0 || activeOptionalEarnings.length > 0 || activeOptionalDeductions.length > 0) && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                                <SectionHeader icon={DollarSign} title="Salary Head Breakdown" subtitle="Fixed earnings, deductions and any optional heads you have entered" gradient="from-indigo-600 to-purple-600" />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    <HeadsTable
                                        title="Earnings"
                                        icon={TrendingUp}
                                        rows={[...earnings, ...activeOptionalEarnings]}
                                        gradient="from-indigo-500 to-violet-600"
                                        emptyMsg="No earnings heads"
                                    />
                                    <HeadsTable
                                        title="Deductions"
                                        icon={TrendingDown}
                                        rows={[...deductions, ...activeOptionalDeductions]}
                                        gradient="from-rose-500 to-pink-600"
                                        emptyMsg="No deduction heads"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Optional Salary Heads (popup) ─────────────────── */}
                        {Object.keys(optionalGroups).length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                                {/* Section header row with Add button */}
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Optional Salary Heads</h3>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                {hasOptionalEntries
                                                    ? `${activeOptionalEarnings.length + activeOptionalDeductions.length} head(s) added`
                                                    : 'Click Add Head to include optional components'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowOptionalModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/30 hover:from-purple-700 hover:to-violet-700 transition-all flex-shrink-0">
                                        <Plus className="h-4 w-4" /> Add Head
                                    </button>
                                </div>

                                {/* Active heads list or empty state */}
                                {!hasOptionalEntries ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-3">
                                            <FileText className="h-7 w-7 opacity-40" />
                                        </div>
                                        <p className="text-sm font-semibold">No optional heads added yet</p>
                                        <p className="text-xs mt-1">Benefits will add to gross &amp; net · Deductions will reduce net</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Benefits */}
                                        {activeOptionalEarnings.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <Plus className="h-3 w-3" /> Benefits — adds to Gross &amp; Net
                                                </p>
                                                <div className="space-y-2">
                                                    {activeOptionalEarnings.map(h => (
                                                        <div key={h.HeadName}
                                                            className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 group">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                                                    <Plus className="h-3.5 w-3.5 text-indigo-500" />
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{h.HeadName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">+₹{fmt(h.HeadAmount)}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOptionalAmountChange(h.HeadName, '')}
                                                                    title="Remove"
                                                                    className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors opacity-0 group-hover:opacity-100">
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Deductions */}
                                        {activeOptionalDeductions.length > 0 && (
                                            <div className={activeOptionalEarnings.length > 0 ? 'mt-4' : ''}>
                                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <Minus className="h-3 w-3" /> Deductions — reduces Net pay
                                                </p>
                                                <div className="space-y-2">
                                                    {activeOptionalDeductions.map(h => (
                                                        <div key={h.HeadName}
                                                            className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 group">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0">
                                                                    <Minus className="h-3.5 w-3.5 text-rose-500" />
                                                                </div>
                                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{h.HeadName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                                <span className="text-sm font-bold text-rose-700 dark:text-rose-300">−₹{fmt(h.HeadAmount)}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOptionalAmountChange(h.HeadName, '')}
                                                                    title="Remove"
                                                                    className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors opacity-0 group-hover:opacity-100">
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Add Optional Head Modal ────────────────────────── */}
                        <AddOptionalHeadModal
                            open={showOptionalModal}
                            onClose={() => setShowOptionalModal(false)}
                            optionalGroups={optionalGroups}
                            optionalAmounts={optionalAmounts}
                            onChange={handleOptionalAmountChange}
                        />

                        {/* ── Submit / Action Bar ────────────────────────────── */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Ready to submit?</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        Net payable: <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{fmt(adjustedNet)}</span>
                                        {hasOptionalEntries && <span className="ml-1 text-purple-500">(includes optional heads)</span>}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={handleReset}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600">
                                        <RotateCcw className="h-4 w-4" /> Reset
                                    </button>
                                    <button type="button" onClick={handleSave} disabled={saveLoading}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                        {saveLoading
                                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                            : <><Send className="h-4 w-4" /> Submit Settlement</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StaffFullFinal;
