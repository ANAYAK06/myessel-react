import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    HardHat, Loader2, RotateCcw, Send, ChevronDown,
    IndianRupee, CheckCircle, Navigation,
    Users, Briefcase, ClipboardList, Eye,
} from 'lucide-react';
import {
    fetchCCList,
    fetchConsolidateTransNos,
    fetchContractors,
    fetchPOList,
    fetchWorkerGrid,
    saveLabourCMSPayment,
    setSelectedMonth,
    setSelectedYear,
    setSelectedCCCode,
    setSelectedConsolidateTransNo,
    setSelectedContractorCode,
    setSelectedPO,
    clearSaveResult,
    resetAll,
    selectCCList,
    selectConsolidateTransNos,
    selectContractors,
    selectPOList,
    selectWorkerGrid,
    selectCCListLoading,
    selectConsolidateTransNosLoading,
    selectContractorsLoading,
    selectPOListLoading,
    selectWorkerGridLoading,
    selectSaveLoading,
    selectSelectedMonth,
    selectSelectedYear,
    selectSelectedCCCode,
    selectSelectedConsolidateTransNo,
    selectSelectedContractorCode,
    selectSelectedPO,
} from '../../slices/HRSlice/labourCMSPaymentSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const LABOUR_TYPES = ['Own Labour', 'Contractor Labour'];
const MONTHS = [
    { value: '1', label: 'January' },  { value: '2', label: 'February' },
    { value: '3', label: 'March' },    { value: '4', label: 'April' },
    { value: '5', label: 'May' },      { value: '6', label: 'June' },
    { value: '7', label: 'July' },     { value: '8', label: 'August' },
    { value: '9', label: 'September' },{ value: '10', label: 'October' },
    { value: '11', label: 'November' },{ value: '12', label: 'December' },
];
const getYears = () => { const y = new Date().getFullYear(); return [y, y - 1, y - 2]; };

// Own Labour = 3 steps (no PO step), Contractor Labour = 4 steps
const STEPS_OWN        = ['Period & Setup', 'Workers', 'Review'];
const STEPS_CONTRACTOR = ['Period & Setup', 'PO Selection', 'Workers', 'Review'];

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n) =>
    n ? `₹ ${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹ 0.00';

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

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

const SectionCard = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
        <Icon className="h-4 w-4 text-indigo-500" />
        <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
    </div>
);

const InnerHeader = ({ icon: Icon, title, subtitle }) => (
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

const ReviewRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <span className={`text-xs font-semibold text-right max-w-[60%] ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
        </span>
    </div>
);

// ── Step Indicator (accepts dynamic steps array) ───────────────────────────────

const StepIndicator = ({ current, steps }) => (
    <div className="flex items-center">
        {steps.map((label, i) => {
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
                    {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-4 rounded ${done ? 'bg-white/60' : 'bg-white/20'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const LabourCMSPayCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'system';

    // Redux data
    const ccList               = useSelector(selectCCList);
    const contractors          = useSelector(selectContractors);
    const poList               = useSelector(selectPOList);
    const workerGrid           = useSelector(selectWorkerGrid);
    const ccListLoading        = useSelector(selectCCListLoading);
    const consolidateTransNos        = useSelector(selectConsolidateTransNos);
    const consolidateTransNosLoading = useSelector(selectConsolidateTransNosLoading);
    const contractorsLoading         = useSelector(selectContractorsLoading);
    const poListLoading              = useSelector(selectPOListLoading);
    const workerGridLoading          = useSelector(selectWorkerGridLoading);
    const saveLoading                = useSelector(selectSaveLoading);
    const selectedMonth              = useSelector(selectSelectedMonth);
    const selectedYear               = useSelector(selectSelectedYear);
    const selectedCCCode             = useSelector(selectSelectedCCCode);
    const selectedConsolidateTransNo = useSelector(selectSelectedConsolidateTransNo);
    const selectedContractorCode     = useSelector(selectSelectedContractorCode);
    const selectedPO                 = useSelector(selectSelectedPO);

    // derive PayrollId from the selected consolidate trans no entry (used in save payload)
    const selectedPayrollId = consolidateTransNos.find(
        t => (t.ConslidateTransNo ?? t.ConsolidateTransNo) === selectedConsolidateTransNo
    )?.PayrollId || null;

    // Local state
    const [step,            setStep]            = useState(1);
    const [labourType,      setLabourType]      = useState('Own Labour');
    // { [LabourId]: { basic: bool, allowance: bool } }
    const [selectedWorkers, setSelectedWorkers] = useState({});

    // Dynamic steps — Own Labour has no PO step
    const steps      = labourType === 'Own Labour' ? STEPS_OWN : STEPS_CONTRACTOR;
    const totalSteps = steps.length;

    // Step identity helpers
    const isPOStep      = labourType === 'Contractor Labour' && step === 2;
    const isWorkersStep = (labourType === 'Own Labour'        && step === 2)
                       || (labourType === 'Contractor Labour' && step === 3);
    const isReviewStep  = step === totalSteps;

    // Cleanup on unmount
    useEffect(() => {
        return () => { dispatch(resetAll()); };
    }, [dispatch]);

    // ── Step 1 handlers ───────────────────────────────────────────────────────

    const handleMonthChange = (val) => {
        dispatch(setSelectedMonth(val));
        dispatch(setSelectedCCCode(''));
        setSelectedWorkers({});
        if (val && selectedYear) {
            dispatch(fetchCCList({ month: val, year: selectedYear }));
        }
    };

    const handleYearChange = (val) => {
        dispatch(setSelectedYear(val));
        dispatch(setSelectedCCCode(''));
        setSelectedWorkers({});
        if (selectedMonth && val) {
            dispatch(fetchCCList({ month: selectedMonth, year: val }));
        }
    };

    const handleCCChange = (code) => {
        dispatch(setSelectedCCCode(code));
        setSelectedWorkers({});
        dispatch(fetchConsolidateTransNos({ month: selectedMonth, year: selectedYear, ccCode: code }));
        if (code && labourType === 'Contractor Labour') {
            dispatch(fetchContractors({ ccCode: code, month: selectedMonth, year: selectedYear }));
        }
    };

    const handleConsolidateTransNoChange = (transNo) => {
        dispatch(setSelectedConsolidateTransNo(transNo));
        setSelectedWorkers({});
    };

    const handleLabourTypeChange = (val) => {
        setLabourType(val);
        dispatch(setSelectedContractorCode(''));
        dispatch(setSelectedPO(null));
        setSelectedWorkers({});
        if (val === 'Contractor Labour' && selectedCCCode) {
            dispatch(fetchContractors({ ccCode: selectedCCCode, month: selectedMonth, year: selectedYear }));
        }
    };

    // Contractor selected in Step 1 — also pre-fetch POs for Step 2
    const handleContractorChange = (val) => {
        dispatch(setSelectedContractorCode(val));
        dispatch(setSelectedPO(null));
        setSelectedWorkers({});
        if (val && selectedCCCode) {
            dispatch(fetchPOList({ contractorCode: val, ccCode: selectedCCCode }));
        }
    };

    // ── Step 2 (PO) handler ───────────────────────────────────────────────────

    const handlePOSelect = (po) => {
        dispatch(setSelectedPO(po));
        setSelectedWorkers({});
    };

    // ── Load workers ──────────────────────────────────────────────────────────

    const handleLoadWorkers = useCallback(() => {
        if (!selectedConsolidateTransNo) {
            toast.warn('Please select a transaction reference first.');
            return false;
        }
        dispatch(fetchWorkerGrid({
            conslidateTransNo: selectedConsolidateTransNo,
            labourType:        labourType === 'Contractor Labour' ? 'Contractor' : labourType,
            contractorCode:    labourType === 'Contractor Labour' ? selectedContractorCode : null,
        }));
        return true;
    }, [dispatch, selectedConsolidateTransNo, labourType, selectedContractorCode]);

    // ── Worker selection ──────────────────────────────────────────────────────

    const toggleWorker = (id) =>
        setSelectedWorkers(prev => {
            if (prev[id]) { const n = { ...prev }; delete n[id]; return n; }
            return { ...prev, [id]: { basic: true, allowance: true } };
        });

    const toggleAmount = (id, field) =>
        setSelectedWorkers(prev => {
            const cur = prev[id] || { basic: false, allowance: false };
            const updated = { ...cur, [field]: !cur[field] };
            if (!updated.basic && !updated.allowance) {
                const n = { ...prev }; delete n[id]; return n;
            }
            return { ...prev, [id]: updated };
        });

    const allSelected = workerGrid.length > 0 && workerGrid.every(w => selectedWorkers[w.LabourId]);
    const toggleAll = () => {
        if (allSelected) {
            setSelectedWorkers({});
        } else {
            setSelectedWorkers(Object.fromEntries(workerGrid.map(w => [w.LabourId, { basic: true, allowance: true }])));
        }
    };

    const workersWithBasic      = workerGrid.filter(w => parseFloat(w.BasicBalance || 0) > 0);
    const workersWithAllowance  = workerGrid.filter(w => parseFloat(w.AllowanceBalance || 0) > 0);
    const allBasicSelected      = workersWithBasic.length > 0 && workersWithBasic.every(w => selectedWorkers[w.LabourId]?.basic);
    const allAllowanceSelected  = workersWithAllowance.length > 0 && workersWithAllowance.every(w => selectedWorkers[w.LabourId]?.allowance);

    const toggleAllBasic = () => {
        setSelectedWorkers(prev => {
            const next = { ...prev };
            workersWithBasic.forEach(w => {
                const cur = next[w.LabourId] || { basic: false, allowance: false };
                const updated = { ...cur, basic: !allBasicSelected };
                if (!updated.basic && !updated.allowance) { delete next[w.LabourId]; }
                else { next[w.LabourId] = updated; }
            });
            return next;
        });
    };

    const toggleAllAllowance = () => {
        setSelectedWorkers(prev => {
            const next = { ...prev };
            workersWithAllowance.forEach(w => {
                const cur = next[w.LabourId] || { basic: false, allowance: false };
                const updated = { ...cur, allowance: !allAllowanceSelected };
                if (!updated.basic && !updated.allowance) { delete next[w.LabourId]; }
                else { next[w.LabourId] = updated; }
            });
            return next;
        });
    };

    const getWorkerSelectedAmt = (w) => {
        const a = selectedWorkers[w.LabourId];
        if (!a) return 0;
        return (a.basic ? parseFloat(w.BasicBalance || 0) : 0)
             + (a.allowance ? parseFloat(w.AllowanceBalance || 0) : 0);
    };

    // ── Totals ────────────────────────────────────────────────────────────────

    const totalAll = workerGrid.reduce(
        (s, w) => s + parseFloat(w.NetBalance || 0), 0
    );
    const totalSelected = workerGrid.reduce((s, w) => s + getWorkerSelectedAmt(w), 0);
    const selectedWorkerCount = Object.keys(selectedWorkers).length;

    // ── Validation ────────────────────────────────────────────────────────────

    const validateStep1 = useCallback(() => {
        if (!selectedMonth)  { toast.warn('Please select a month.'); return false; }
        if (!selectedYear)   { toast.warn('Please select a year.'); return false; }
        if (!selectedCCCode) { toast.warn('Please select a Cost Center.'); return false; }
        if (!selectedConsolidateTransNo) { toast.warn('Please select a transaction reference.'); return false; }
        if (labourType === 'Contractor Labour' && !selectedContractorCode) {
            toast.warn('Please select a contractor.'); return false;
        }
        return true;
    }, [selectedMonth, selectedYear, selectedCCCode, selectedConsolidateTransNo, labourType, selectedContractorCode]);

    const validatePOStep = useCallback(() => {
        if (!selectedPO) { toast.warn('Please select a PO.'); return false; }
        return true;
    }, [selectedPO]);

    const validateWorkersStep = useCallback(() => {
        if (Object.keys(selectedWorkers).length === 0) {
            toast.warn('Please select at least one worker.'); return false;
        }
        return true;
    }, [selectedWorkers]);

    // ── Navigation ────────────────────────────────────────────────────────────

    const goNext = () => {
        if (step === 1) {
            if (!validateStep1()) return;
            // Own Labour: skip PO, go straight to workers
            if (labourType === 'Own Labour') {
                handleLoadWorkers();
            }
            setStep(2);
            return;
        }
        if (isPOStep) {
            if (!validatePOStep()) return;
            handleLoadWorkers();
            setStep(3);
            return;
        }
        if (isWorkersStep) {
            if (!validateWorkersStep()) return;
            setStep(s => s + 1);
            return;
        }
    };

    const goBack = () => {
        if (step > 1) setStep(s => s - 1);
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        const today = new Date().toISOString().split('T')[0];
        const payload = {
            PayrollId:      selectedPayrollId,
            CCCode:         selectedCCCode,
            PayrollMonth:   parseInt(selectedMonth, 10),
            PayrollYear:    parseInt(selectedYear, 10),
            LabourType:     labourType === 'Own Labour' ? 'Own' : 'Contractor',
            ContractorCode: labourType === 'Contractor Labour' ? selectedContractorCode : null,
            PONo:           labourType === 'Contractor Labour' ? (selectedPO?.PONo || '') : null,
            PaymentDate:    today,
            RoleId:         roleId,
            CreatedBy:      userName,
            Workers: workerGrid
                .filter(w => selectedWorkers[w.LabourId])
                .map(w => {
                    const a = selectedWorkers[w.LabourId];
                    return {
                        LabourId:        w.LabourId,
                        BasicPayNow:     a.basic    ? parseFloat(w.BasicBalance    || 0) : 0,
                        AllowancePayNow: a.allowance ? parseFloat(w.AllowanceBalance || 0) : 0,
                    };
                }),
        };

        try {
            const result = await dispatch(saveLabourCMSPayment(payload)).unwrap();
            const data   = result?.Data || result;
            const status = data?.Result || '';
            if (status === 'SUCCESS') {
                toast.success(`Labour CMS Payment saved! Ref: ${data.CMSTransactionNo || ''}`);
                dispatch(clearSaveResult());
                handleReset();
            } else {
                toast.error(data?.Message || 'Save failed');
            }
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Save failed');
        }
    };

    // ── Reset ─────────────────────────────────────────────────────────────────

    const handleReset = () => {
        setStep(1);
        setLabourType('Own Labour');
        setSelectedWorkers({});
        dispatch(resetAll());
    };

    // ── Derived ───────────────────────────────────────────────────────────────

    const monthLabel = MONTHS.find(m => m.value === selectedMonth)?.label || '';
    const selectedCCName = ccList.find(cc => (cc.CC_Code || cc.CCCode) === selectedCCCode)?.CC_Name || '';
    const selectedContractorName = contractors.find(
        c => c.ContractorCode === selectedContractorCode
    )?.ContractorName || selectedContractorCode;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <HardHat className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Labour CMS Payment'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">CMS Bank Payment for Labour Workers</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                            <div className="hidden sm:flex items-center gap-2 text-indigo-200">
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wider">Module</p>
                                    <p className="text-sm font-bold text-white">HR / CMS</p>
                                </div>
                                <Navigation className="h-5 w-5 opacity-60" />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <StepIndicator current={step} steps={steps} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── STEP 1: Period & Setup ─────────────────────────────────── */}
                {step === 1 && (
                    <SectionCard>
                        <SectionHeader icon={Users} title="Period & Setup"
                            subtitle="Select month/year → cost center → labour type → contractor (if applicable)" />
                        <div className="p-6">
                            <InnerHeader icon={HardHat} title="Selection Criteria"
                                subtitle="Choose the period and labour category" />

                            {/* Month + Year */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <Label required>Month</Label>
                                    <div className="relative">
                                        <select value={selectedMonth} onChange={e => handleMonthChange(e.target.value)} className={inputCls}>
                                            <option value="">— Select Month —</option>
                                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                        </select>
                                        <SelectIcon loading={false} />
                                    </div>
                                </div>
                                <div>
                                    <Label required>Year</Label>
                                    <div className="relative">
                                        <select value={selectedYear} onChange={e => handleYearChange(e.target.value)} className={inputCls}>
                                            <option value="">— Select Year —</option>
                                            {getYears().map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                        <SelectIcon loading={false} />
                                    </div>
                                </div>
                            </div>

                            {/* CC List — appears after month+year chosen */}
                            {selectedMonth && selectedYear && (
                                <div className="mb-5">
                                    <Label required>Cost Center</Label>
                                    {ccListLoading ? (
                                        <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading cost centers…
                                        </div>
                                    ) : ccList.length === 0 ? (
                                        <p className="text-xs text-gray-400 py-3">No cost centers available for selected period.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700">
                                            {ccList.map(cc => {
                                                const code = cc.CC_Code || cc.CCCode || cc.Code;
                                                const name = cc.CC_Name || cc.CCName || cc.Name || '';
                                                return (
                                                    <label
                                                        key={code}
                                                        className={`flex items-center gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-all
                                                            ${selectedCCCode === code
                                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-300'}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="ccCode"
                                                            value={code}
                                                            checked={selectedCCCode === code}
                                                            onChange={() => handleCCChange(code)}
                                                            className="w-3.5 h-3.5 text-indigo-600"
                                                        />
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{code}</p>
                                                            {name && <p className="text-[11px] text-gray-400 dark:text-gray-500">{name}</p>}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Consolidate TransNo — appears after CC chosen */}
                            {selectedCCCode && (
                                <div className="mb-5">
                                    <Label required>Transaction Reference</Label>
                                    {consolidateTransNosLoading ? (
                                        <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading transactions…
                                        </div>
                                    ) : consolidateTransNos.length === 0 ? (
                                        <p className="text-xs text-gray-400 py-3">No transactions found for this cost center.</p>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {consolidateTransNos.map(t => {
                                                const transNo  = t.ConslidateTransNo ?? t.ConsolidateTransNo;
                                                const refNo    = t.TransactionRefNo || t.TransRefNo || '';
                                                const genOn    = t.GeneratedOn ? new Date(t.GeneratedOn).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
                                                const isActive = selectedConsolidateTransNo === transNo;
                                                return (
                                                    <label
                                                        key={transNo}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                                                            ${isActive
                                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-300'}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="consolidateTransNo"
                                                            value={transNo}
                                                            checked={isActive}
                                                            onChange={() => handleConsolidateTransNoChange(transNo)}
                                                            className="w-3.5 h-3.5 text-indigo-600"
                                                        />
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-100">
                                                                {refNo || `Txn #${transNo}`}
                                                            </p>
                                                            {genOn && <p className="text-[11px] text-gray-400 dark:text-gray-500">Generated: {genOn}</p>}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Labour Type — appears after TransNo chosen */}
                            {selectedCCCode && selectedConsolidateTransNo && (
                                <div className="mb-5">
                                    <Label required>Labour Type</Label>
                                    <div className="flex gap-3">
                                        {LABOUR_TYPES.map(lt => (
                                            <button
                                                key={lt}
                                                type="button"
                                                onClick={() => handleLabourTypeChange(lt)}
                                                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                                                    ${labourType === lt
                                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800'}`}
                                            >
                                                {lt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contractor — appears only when Contractor Labour is selected */}
                            {selectedCCCode && selectedConsolidateTransNo && labourType === 'Contractor Labour' && (
                                <div>
                                    <Label required>Contractor</Label>
                                    {contractorsLoading ? (
                                        <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading contractors…
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                value={selectedContractorCode}
                                                onChange={e => handleContractorChange(e.target.value)}
                                                className={inputCls}
                                                disabled={contractors.length === 0}
                                            >
                                                <option value="">
                                                    {contractors.length === 0 ? 'No contractors available' : '— Select Contractor —'}
                                                </option>
                                                {contractors.map(c => (
                                                    <option key={c.ContractorCode} value={c.ContractorCode}>
                                                        {c.ContractorCode} — {c.ContractorName}
                                                    </option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={contractorsLoading} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* ── STEP 2 — Contractor Labour only: PO Selection ─────────── */}
                {isPOStep && (
                    <SectionCard>
                        <SectionHeader icon={ClipboardList} title="PO Selection"
                            subtitle="Select the purchase order for this contractor payment" />
                        <div className="p-6">
                            <InnerHeader icon={Briefcase} title="Purchase Order"
                                subtitle={`Contractor: ${selectedContractorCode} — ${selectedContractorName}`}
                            />

                            <Label required>Purchase Order</Label>
                            {poListLoading ? (
                                <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading PO list…
                                </div>
                            ) : poList.length === 0 ? (
                                <p className="text-xs text-gray-400 py-3">No open POs available for this contractor.</p>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                <th className="px-4 py-3 text-center w-10"></th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO No</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {poList.map((po, i) => {
                                                const isSelected = selectedPO?.PONo === po.PONo;
                                                return (
                                                    <tr
                                                        key={po.PONo || i}
                                                        onClick={() => handlePOSelect(po)}
                                                        className={`border-t border-gray-100 dark:border-gray-700 cursor-pointer transition-colors
                                                            ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}
                                                    >
                                                        <td className="px-4 py-3 text-center">
                                                            <input type="radio" checked={isSelected} onChange={() => handlePOSelect(po)} className="text-indigo-600" />
                                                        </td>
                                                        <td className="px-4 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{po.PONo || '—'}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{po.PODesc || '—'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {selectedPO && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                    Selected: <span className="font-bold">{selectedPO.PONo}</span>
                                    {selectedPO.PODesc && <> — {selectedPO.PODesc}</>}
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* ── Workers Step (step 2 for Own Labour, step 3 for Contractor) */}
                {isWorkersStep && (
                    <SectionCard>
                        <SectionHeader icon={Users} title="Worker Selection"
                            subtitle="Select workers to include in this payment" />
                        <div className="p-6">
                            <InnerHeader icon={HardHat} title="Worker Grid"
                                subtitle={labourType === 'Contractor Labour'
                                    ? `PO: ${selectedPO?.PONo || '—'} • ${selectedContractorName}`
                                    : `Cost Center: ${selectedCCCode} • Own Labour`}
                            />

                            {workerGridLoading ? (
                                <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                    <span className="text-sm">Loading workers…</span>
                                </div>
                            ) : workerGrid.length === 0 ? (
                                <div className="py-12 text-center text-sm text-gray-400">No workers found.</div>
                            ) : (
                                <>
                                    {/* Select all + running total */}
                                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleAll}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                                Select All ({selectedWorkerCount}/{workerGrid.length})
                                            </span>
                                        </label>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Selected Amount</p>
                                            <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">{fmt(totalSelected)}</p>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                    <th className="px-4 py-3 text-center w-10"></th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Labour ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IFSC</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        <label className="inline-flex items-center gap-1.5 cursor-pointer justify-end">
                                                            <input
                                                                type="checkbox"
                                                                checked={allBasicSelected}
                                                                onChange={toggleAllBasic}
                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            Basic Payable
                                                        </label>
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        <label className="inline-flex items-center gap-1.5 cursor-pointer justify-end">
                                                            <input
                                                                type="checkbox"
                                                                checked={allAllowanceSelected}
                                                                onChange={toggleAllAllowance}
                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            Allowance Payable
                                                        </label>
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Selected Amt</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {workerGrid.map((w, i) => {
                                                    const amounts = selectedWorkers[w.LabourId];
                                                    const sel     = !!amounts;
                                                    return (
                                                        <tr
                                                            key={w.LabourId || i}
                                                            className={`border-t border-gray-100 dark:border-gray-700 transition-colors
                                                                ${sel ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}
                                                        >
                                                            {/* Row select */}
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={sel}
                                                                    onChange={() => toggleWorker(w.LabourId)}
                                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{w.LabourId}</td>
                                                            <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{w.LabourName || '—'}</td>
                                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{w.Category || '—'}</td>
                                                            <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">{w.BankAccountNo || '—'}</td>
                                                            <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">{w.IFSCCode || '—'}</td>
                                                            {/* Basic */}
                                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                                {parseFloat(w.BasicBalance || 0) > 0 ? (
                                                                    <label className="inline-flex items-center gap-1.5 cursor-pointer justify-end">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!amounts?.basic}
                                                                            onChange={() => toggleAmount(w.LabourId, 'basic')}
                                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                        />
                                                                        <span className={`text-xs ${amounts?.basic ? 'text-gray-700 dark:text-gray-200 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                                                                            {fmt(w.BasicBalance)}
                                                                        </span>
                                                                    </label>
                                                                ) : (
                                                                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                                                )}
                                                            </td>
                                                            {/* Allowance */}
                                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                                {parseFloat(w.AllowanceBalance || 0) > 0 ? (
                                                                    <label className="inline-flex items-center gap-1.5 cursor-pointer justify-end">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!amounts?.allowance}
                                                                            onChange={() => toggleAmount(w.LabourId, 'allowance')}
                                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                        />
                                                                        <span className={`text-xs ${amounts?.allowance ? 'text-gray-700 dark:text-gray-200 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                                                                            {fmt(w.AllowanceBalance)}
                                                                        </span>
                                                                    </label>
                                                                ) : (
                                                                    <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                                                )}
                                                            </td>
                                                            {/* Net selected */}
                                                            <td className="px-4 py-3 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                                {sel ? fmt(getWorkerSelectedAmt(w)) : '—'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-indigo-50 dark:bg-indigo-900/20 border-t-2 border-indigo-200 dark:border-indigo-700">
                                                    <td colSpan={8} className="px-4 py-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                                                        Total ({selectedWorkerCount} selected / {workerGrid.length} workers)
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-right font-black text-indigo-700 dark:text-indigo-300">{fmt(totalSelected)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {selectedWorkerCount > 0 && (
                                        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <IndianRupee className="h-4 w-4 text-indigo-500" />
                                                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                                        {selectedWorkerCount} Worker{selectedWorkerCount > 1 ? 's' : ''} Selected
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Payment</p>
                                                    <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(totalSelected)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* ── Review Step (last step for both flows) ────────────────── */}
                {isReviewStep && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SectionCard>
                            <SectionHeader icon={Eye} title="Payment Summary" subtitle="Review before submitting" />
                            <div className="p-6">
                                <ReviewRow label="Period"        value={`${monthLabel} ${selectedYear}`} />
                                <ReviewRow label="Labour Type"  value={labourType} />
                                <ReviewRow label="Cost Center"  value={`${selectedCCCode}${selectedCCName ? ` — ${selectedCCName}` : ''}`} />
                                {labourType === 'Contractor Labour' && (
                                    <>
                                        <ReviewRow label="Contractor" value={`${selectedContractorCode} — ${selectedContractorName}`} />
                                        <ReviewRow label="PO Number"  value={selectedPO?.PONo || '—'} />
                                    </>
                                )}
                                <ReviewRow label="Workers Selected" value={`${selectedWorkerCount} of ${workerGrid.length}`} />
                                <ReviewRow label="Total Amount"  value={fmt(totalSelected)} highlight />
                            </div>
                        </SectionCard>

                        <SectionCard>
                            <SectionHeader icon={Users} title="Worker Breakdown" subtitle="Workers included in this payment" />
                            <div className="p-6">
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 max-h-72 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0">
                                            <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Labour ID</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                                <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Basic</th>
                                                <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Allowance</th>
                                                <th className="px-3 py-2.5 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {workerGrid
                                                .filter(w => selectedWorkers[w.LabourId])
                                                .map((w, i) => {
                                                    const a = selectedWorkers[w.LabourId];
                                                    return (
                                                        <tr key={i} className={`border-t border-gray-100 dark:border-gray-700 ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-900/20'}`}>
                                                            <td className="px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{w.LabourId}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{w.LabourName || '—'}</td>
                                                            <td className="px-3 py-2 text-xs text-right text-gray-500 dark:text-gray-400">
                                                                {a.basic ? fmt(w.BasicBalance) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                                            </td>
                                                            <td className="px-3 py-2 text-xs text-right text-gray-500 dark:text-gray-400">
                                                                {a.allowance ? fmt(w.AllowanceBalance) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                                            </td>
                                                            <td className="px-3 py-2 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400">{fmt(getWorkerSelectedAmt(w))}</td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Grand Total</span>
                                        <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(totalSelected)}</span>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* ── Navigation Buttons ───────────────────────────────────── */}
                <div className="flex items-center justify-between pt-2 pb-6">
                    <button
                        type="button"
                        onClick={goBack}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-gray-800"
                    >
                        ← Back
                    </button>

                    {!isReviewStep ? (
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={workerGridLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {workerGridLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading Workers…</>
                                : <>Next →</>}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saveLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saveLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                : <><Send className="h-4 w-4" /> Submit Payment</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LabourCMSPayCreation;
