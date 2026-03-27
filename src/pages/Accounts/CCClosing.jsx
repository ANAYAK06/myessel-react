import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchCCClosingTypes,
    fetchCCClosingCCs,
    fetchCCPendingStatus,
    fetchDCABudgetReport,
    fetchCCClosingStatusReport,
    submitCCClosingData,
    clearSaveResult,
    clearPendingStatus,
    clearStatusReport,
    resetCCClosing,
    selectClosingTypes,
    selectCCList,
    selectPendingStatus,
    selectDCABudgetReport,
    selectCCStatusReport,
    selectClosingTypesLoading,
    selectCCListLoading,
    selectPendingStatusLoading,
    selectDCABudgetLoading,
    selectStatusReportLoading,
    selectSaveLoading,
    selectSaveResult,
    selectSaveError,
} from '../../slices/accountsSlice/ccClosingSlice';

import {
    Settings, BarChart2, FileText, IndianRupee, CheckCircle2,
    ChevronRight, ChevronLeft, Loader2,
    Building2, Calendar, Info, BarChart, Users,
    Lock, Unlock, Hash, TrendingDown, ClipboardList,
    CheckCircle, XCircle,
} from 'lucide-react';

// ── Date helpers ──────────────────────────────────────────────────────────────
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatDateForAPI = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(val)) return val;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        const [yyyy, mm, dd] = val.split('T')[0].split('-');
        return `${dd}-${MONTH_ABBR[parseInt(mm, 10) - 1]}-${yyyy}`;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2,'0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const serializeDate = (val) => {
    if (!val) return '';
    if (val instanceof Date) {
        return `${val.getFullYear()}-${String(val.getMonth()+1).padStart(2,'0')}-${String(val.getDate()).padStart(2,'0')}`;
    }
    return String(val);
};

const fmt = (v) => {
    const n = parseFloat(v);
    if (!v || isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── Step config ────────────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Setup',           icon: Settings,     desc: 'Type & CC selection' },
    { id: 2, label: 'CC Overview',     icon: BarChart2,    desc: 'Status & DCA budget' },
    { id: 3, label: 'Closing Details', icon: FileText,     desc: 'Dates & remarks' },
    { id: 4, label: 'Financial Data',  icon: IndianRupee,  desc: 'Invoice & payment data' },
    { id: 5, label: 'Review & Submit', icon: CheckCircle2, desc: 'Confirm & submit' },
];

// ── Closing type color config (each type gets its own badge color) ─────────────
const TYPE_COLORS = {
    '5': { grad: 'from-rose-500 to-red-600',     light: 'bg-rose-50 dark:bg-rose-900/20',   border: 'border-rose-300 dark:border-rose-700',   ring: 'ring-rose-400',   text: 'text-rose-700 dark:text-rose-300'   },
    '6': { grad: 'from-orange-500 to-amber-600', light: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-700', ring: 'ring-orange-400', text: 'text-orange-700 dark:text-orange-300' },
    '7': { grad: 'from-teal-500 to-cyan-600',    light: 'bg-teal-50 dark:bg-teal-900/20',   border: 'border-teal-300 dark:border-teal-700',   ring: 'ring-teal-400',   text: 'text-teal-700 dark:text-teal-300'   },
    '8': { grad: 'from-violet-500 to-purple-600',light: 'bg-violet-50 dark:bg-violet-900/20',border: 'border-violet-300 dark:border-violet-700',ring: 'ring-violet-400', text: 'text-violet-700 dark:text-violet-300'},
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const StepSidebar = ({ steps, currentStep, completedSteps, onStepClick }) => (
    <div className="hidden lg:flex flex-col gap-1.5 w-52 flex-shrink-0">
        {steps.map((step) => {
            const done    = completedSteps.includes(step.id);
            const active  = currentStep === step.id;
            const unlocked = step.id === 1 || done || active || completedSteps.includes(step.id - 1);
            const Icon = step.icon;
            return (
                <button key={step.id}
                    onClick={() => unlocked && onStepClick(step.id)}
                    disabled={!unlocked}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                        ${active
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                            : done
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 cursor-pointer border border-indigo-200 dark:border-indigo-700'
                                : unlocked
                                    ? 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700 cursor-pointer'
                                    : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-gray-800 cursor-not-allowed opacity-50'
                        }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                        ${active ? 'bg-white/20' : done ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {done && !active
                            ? <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            : <Icon className={`h-4 w-4 ${active ? 'text-white' : unlocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-300'}`} />
                        }
                    </div>
                    <div className="min-w-0">
                        <p className={`text-xs font-bold leading-tight ${active ? 'text-white' : done ? 'text-indigo-700 dark:text-indigo-300' : unlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-300'}`}>
                            {step.label}
                        </p>
                        <p className={`text-[10px] leading-tight truncate ${active ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                            {step.desc}
                        </p>
                    </div>
                    {done && !active && <CheckCircle className="h-3.5 w-3.5 text-indigo-500 ml-auto flex-shrink-0" />}
                </button>
            );
        })}
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 border-gray-200 dark:border-gray-700 focus:border-indigo-400 hover:border-gray-300 dark:hover:border-gray-600 transition-all';

const FieldLabel = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const FinancialField = ({ label, name, value, onChange }) => (
    <div>
        <FieldLabel>{label}</FieldLabel>
        <input
            type="number"
            step="0.01"
            name={name}
            value={value}
            onChange={onChange}
            className={inputCls}
            placeholder="0.00"
        />
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const CCClosing = ({ menuData }) => {
    const dispatch = useDispatch();

    const closingTypes    = useSelector(selectClosingTypes);
    const ccList          = useSelector(selectCCList);
    const pendingStatus   = useSelector(selectPendingStatus);   // null | '' | 'some message'
    const dcaBudgetReport = useSelector(selectDCABudgetReport);
    const statusReport    = useSelector(selectCCStatusReport);
    const saveResult      = useSelector(selectSaveResult);
    const saveError       = useSelector(selectSaveError);

    const typesLoading   = useSelector(selectClosingTypesLoading);
    const ccLoading      = useSelector(selectCCListLoading);
    const pendingLoading = useSelector(selectPendingStatusLoading);
    const dcaLoading     = useSelector(selectDCABudgetLoading);
    const statusLoading  = useSelector(selectStatusReportLoading);
    const saveLoading    = useSelector(selectSaveLoading);

    const { userData } = useSelector(s => s.auth);
    const roleId  = userData?.roleId  || userData?.RID || 0;
    const userId  = userData?.userId  || userData?.UID || userData?.employeeId || '';
    const userName = userData?.userName || 'system';

    // Step state
    const [currentStep, setCurrentStep]       = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);

    // Step 1
    const [selectedType, setSelectedType]     = useState('');
    const [selectedCC, setSelectedCC]         = useState('');
    const [selectedCCName, setSelectedCCName] = useState('');

    // Step 3
    const [closingDate, setClosingDate]       = useState('');
    const [startDate, setStartDate]           = useState('');
    const [endDate, setEndDate]               = useState('');
    const [alertNote, setAlertNote]           = useState('');
    const [userRemarks, setUserRemarks]       = useState('');
    const [resourceHead, setResourceHead]     = useState('');
    const [resDetails, setResDetails]         = useState('');
    const [depreciationValue, setDepreciationValue] = useState('');
    const [interestOnCC, setInterestOnCC]     = useState('');
    const [overHead, setOverHead]             = useState('');

    // Step 4 — financial fields
    const emptyFinancial = {
        CCCumulativeInvoice: '', CUMULATIVECLIENTRECEIPTINCLUDINGTDS: '',
        CREDITAGAINSTNEWSTOCKTRANSFER: '', PROJECTSTATUSWITHCUMULATIVEINVOICE: '',
        PROJECTSTATUSWITHCUMCLIENTNETRECEIPTINCTDS: '',
        PROJSTATWITHCUMCLIENTNETRECINCTDSNEWSTKTRANSCREDITS: '',
        DIFFERENCEINCLIENTRECEIPT: '', DEBITNOTEISSUEDBYCLIENT: '',
        CREDITNOTEISSUEDTOCLIENT: '', BADDEBTSBOOKED: '', BADDEBTSBOOKEDFORTHEACYEAR: '',
        DEBITNOTEISSUEDTOVENDOR: '', CREDITNOTEISSUEDTOVENDOR: '',
        ACCOUNTEDPAYABLEWRITTENOFFMADEDURINGCCCLOSUER: '',
        TOTALCOSTAFTERDEDUCTINGWRITTENOFFPAYABLES: '',
        PAYABLEWRITTENOFFFINANCIALYEAR: '',
        COMMENTSBYACCOUNTSONDEBITNOTETOVENDOR: '',
        COMMENTSONCREDITNOTEISSUEDTOVENDOR: '',
        PCCBUDGETTRANSFERTOCAPITAL: '',
        OtherDeductions: '', JVDeductions: '', AdvanceRecovered: '',
    };
    const [financial, setFinancial] = useState(emptyFinancial);

    // Derived: has pending means array is non-empty
    const hasPendingItems = pendingStatus !== null && Array.isArray(pendingStatus) && pendingStatus.length > 0;
    const pendingChecked  = pendingStatus !== null && !pendingLoading;

    // ── Init ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchCCClosingTypes());
        return () => dispatch(resetCCClosing());
    }, [dispatch]);

    useEffect(() => {
        if (selectedType) {
            setSelectedCC(''); setSelectedCCName('');
            dispatch(clearPendingStatus());
            dispatch(clearStatusReport());
            dispatch(fetchCCClosingCCs({ closingType: selectedType, uid: userId, rid: roleId }));
        }
    }, [selectedType, dispatch]);

    useEffect(() => {
        if (selectedCC && selectedType) {
            dispatch(clearPendingStatus());
            dispatch(fetchCCPendingStatus({ ccCode: selectedCC, type: selectedType }));
        }
    }, [selectedCC, selectedType, dispatch]);

    useEffect(() => {
        if (currentStep === 2 && selectedCC) {
            dispatch(fetchCCClosingStatusReport(selectedCC));
            dispatch(fetchDCABudgetReport(selectedCC));
        }
    }, [currentStep, selectedCC, dispatch]);

    // Pre-fill financial from status report
    useEffect(() => {
        if (statusReport?.ConsolidateCCClosingStatusData?.length > 0) {
            const d = statusReport.ConsolidateCCClosingStatusData[0];
            setFinancial(prev => ({
                ...prev,
                CCCumulativeInvoice:                              String(d.CCCumulativeInvoice || ''),
                CUMULATIVECLIENTRECEIPTINCLUDINGTDS:              d.CUMULATIVECLIENTRECEIPTINCLUDINGTDS              || '',
                CREDITAGAINSTNEWSTOCKTRANSFER:                    d.CREDITAGAINSTNEWSTOCKTRANSFER                    || '',
                PROJECTSTATUSWITHCUMULATIVEINVOICE:               d.PROJECTSTATUSWITHCUMULATIVEINVOICE               || '',
                PROJECTSTATUSWITHCUMCLIENTNETRECEIPTINCTDS:       d.PROJECTSTATUSWITHCUMCLIENTNETRECEIPTINCTDS       || '',
                PROJSTATWITHCUMCLIENTNETRECINCTDSNEWSTKTRANSCREDITS: d.PROJSTATWITHCUMCLIENTNETRECINCTDSNEWSTKTRANSCREDITS || '',
                DIFFERENCEINCLIENTRECEIPT:                        d.DIFFERENCEINCLIENTRECEIPT                        || '',
                DEBITNOTEISSUEDBYCLIENT:                          d.DEBITNOTEISSUEDBYCLIENT                          || '',
                CREDITNOTEISSUEDTOCLIENT:                         d.CREDITNOTEISSUEDTOCLIENT                         || '',
                BADDEBTSBOOKED:                                   d.BADDEBTSBOOKED                                   || '',
                BADDEBTSBOOKEDFORTHEACYEAR:                       d.BADDEBTSBOOKEDFORTHEACYEAR                       || '',
                DEBITNOTEISSUEDTOVENDOR:                          String(d.DEBITNOTEISSUEDTOVENDOR                   || ''),
                CREDITNOTEISSUEDTOVENDOR:                         String(d.CREDITNOTEISSUEDTOVENDOR                  || ''),
                ACCOUNTEDPAYABLEWRITTENOFFMADEDURINGCCCLOSUER:    String(d.ACCOUNTEDPAYABLEWRITTENOFFMADEDURINGCCCLOSUER || ''),
                TOTALCOSTAFTERDEDUCTINGWRITTENOFFPAYABLES:        String(d.TOTALCOSTAFTERDEDUCTINGWRITTENOFFPAYABLES  || ''),
                PAYABLEWRITTENOFFFINANCIALYEAR:                   d.PAYABLEWRITTENOFFFINANCIALYEAR                   || '',
                COMMENTSBYACCOUNTSONDEBITNOTETOVENDOR:            d.COMMENTSBYACCOUNTSONDEBITNOTETOVENDOR            || '',
                COMMENTSONCREDITNOTEISSUEDTOVENDOR:               d.COMMENTSONCREDITNOTEISSUEDTOVENDOR               || '',
                OtherDeductions:                                  String(d.OtherDeductions                           || ''),
                JVDeductions:                                     String(d.JVDeductions                              || ''),
                AdvanceRecovered:                                 String(d.AdvanceRecovered                          || ''),
            }));
            if (d.CCStartDate) setStartDate(d.CCStartDate);
        }
    }, [statusReport]);

    // Save result handling
    useEffect(() => {
        if (saveResult) {
            const msg = typeof saveResult === 'string' ? saveResult : '';
            toast.success(msg ? `Submitted: ${msg.split(',')[0]}` : 'CC Closing submitted successfully!');
            setTimeout(() => {
                dispatch(clearSaveResult());
                dispatch(resetCCClosing());
                setCurrentStep(1); setCompletedSteps([]);
                setSelectedType(''); setSelectedCC(''); setSelectedCCName('');
                setClosingDate(''); setStartDate(''); setEndDate('');
                setAlertNote(''); setUserRemarks(''); setResourceHead('');
                setResDetails(''); setDepreciationValue(''); setInterestOnCC(''); setOverHead('');
                setFinancial(emptyFinancial);
            }, 1200);
        }
    }, [saveResult, dispatch]);

    useEffect(() => {
        if (saveError) { toast.error(saveError); dispatch(clearSaveResult()); }
    }, [saveError, dispatch]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const canAdvanceStep1 = () => {
        if (!selectedType)    { toast.error('Please select a closing type.'); return false; }
        if (!selectedCC)      { toast.error('Please select a cost center.'); return false; }
        if (pendingLoading)   { toast.error('Checking pending status, please wait...'); return false; }
        if (hasPendingItems) {
            toast.error('There are pending transactions. Clear all pending items before proceeding.');
            return false;
        }
        return true;
    };

    const canAdvanceStep3 = () => {
        if (!closingDate)          { toast.error('Closing date is required.'); return false; }
        if (!userRemarks.trim())   { toast.error('Remarks are required.'); return false; }
        return true;
    };

    const goNext = () => {
        if (currentStep === 1 && !canAdvanceStep1()) return;
        if (currentStep === 3 && !canAdvanceStep3()) return;
        setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
        setCurrentStep(s => Math.min(s + 1, STEPS.length));
    };

    const goPrev = () => setCurrentStep(s => Math.max(s - 1, 1));
    const handleStepClick = (id) => { if (id < currentStep) setCurrentStep(id); };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!userRemarks.trim()) { toast.error('Remarks are required.'); return; }
        dispatch(submitCCClosingData({
            ClosingType: selectedType, ClosingCCs: selectedCC,
            ClosingDate: formatDateForAPI(closingDate), Alertnote: alertNote,
            UserRemarks: userRemarks, RoleID: String(roleId),
            UserID: String(userId), Createdby: userName,
            StartDate: formatDateForAPI(startDate), EndDate: formatDateForAPI(endDate),
            ResourceHead: resourceHead, ResDetails: resDetails,
            DepreciationValue: depreciationValue, InterestonCC: interestOnCC,
            OverHead: overHead, ...financial,
        }));
    };

    // ── Step renderers ────────────────────────────────────────────────────────

    const renderStep1 = () => (
        <div className="space-y-6">
            <SectionHeader icon={Settings} title="Closing Setup" subtitle="Select the type of CC closing and the target cost center" />

            {/* Closing Type cards */}
            <div>
                <FieldLabel required>Closing Type</FieldLabel>
                {typesLoading ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading types...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {closingTypes.map(t => {
                            const c = TYPE_COLORS[t.Id] || TYPE_COLORS['5'];
                            const isSelected = selectedType === t.Id;
                            return (
                                <button key={t.Id} type="button"
                                    onClick={() => setSelectedType(t.Id)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200
                                        ${isSelected ? `${c.light} ${c.border} ring-2 ${c.ring} shadow-md` : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${c.grad}`}>
                                        <Lock className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold ${isSelected ? c.text : 'text-gray-800 dark:text-gray-100'}`}>{t.Name}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Type ID: {t.Id}</p>
                                    </div>
                                    {isSelected && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cost Center dropdown */}
            {selectedType && (
                <div>
                    <FieldLabel required>Cost Center</FieldLabel>
                    {ccLoading ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading cost centers...
                        </div>
                    ) : (
                        <select value={selectedCC}
                            onChange={e => {
                                const cc = ccList.find(c => c.CCId === e.target.value);
                                setSelectedCC(e.target.value);
                                setSelectedCCName(cc?.CCName || '');
                            }}
                            className={inputCls}>
                            <option value="">— Select Cost Center —</option>
                            {ccList.map(cc => (
                                <option key={cc.CCId} value={cc.CCId}>{cc.CCName}</option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {/* Pending status result */}
            {selectedCC && (
                pendingLoading ? (
                    <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 p-5">
                        <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
                            <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
                            <span className="text-sm font-medium">Checking pending transactions for {selectedCC}…</span>
                        </div>
                    </div>
                ) : hasPendingItems ? (
                    <div className="rounded-2xl border-2 border-red-300 dark:border-red-700 overflow-hidden">
                        {/* Header */}
                        <div className="bg-red-600 px-5 py-3.5 flex items-center gap-3 text-white">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Lock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Pending Transactions Found — Cannot Proceed</p>
                                <p className="text-xs text-red-200 mt-0.5">
                                    {pendingStatus.length} pending item{pendingStatus.length !== 1 ? 's' : ''} must be cleared before closing {selectedCC}
                                </p>
                            </div>
                        </div>

                        {/* Grouped table */}
                        {(() => {
                            const grouped = pendingStatus.reduce((acc, item) => {
                                const key = (item.MasterCode || 'Other').trim();
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(item);
                                return acc;
                            }, {});

                            return (
                                <div className="bg-red-50 dark:bg-red-900/10 divide-y divide-red-200 dark:divide-red-800">
                                    {Object.entries(grouped).map(([category, items]) => (
                                        <div key={category}>
                                            {/* Category sub-header */}
                                            <div className="px-5 py-2 bg-red-100 dark:bg-red-900/20 flex items-center justify-between">
                                                <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                                                    {category}
                                                </span>
                                                <span className="text-[10px] font-semibold text-red-500 dark:text-red-400 bg-red-200 dark:bg-red-800/50 px-2 py-0.5 rounded-full">
                                                    {items.length} item{items.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            {/* Items */}
                                            <div className="divide-y divide-red-100 dark:divide-red-900/30">
                                                {items.map((item, idx) => (
                                                    <div key={idx} className="px-5 py-2.5 flex items-center justify-between gap-4 text-sm">
                                                        <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                                                            {item.PendingDetails}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">
                                                            {item.PendingRoleName || item.RoleName}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Footer note */}
                        <div className="px-5 py-3 bg-red-50 dark:bg-red-900/10 border-t border-red-200 dark:border-red-800">
                            <p className="text-xs text-red-600 dark:text-red-400">
                                Clear all pending items listed above, then re-select the cost center to re-check.
                            </p>
                        </div>
                    </div>
                ) : pendingChecked ? (
                    <div className="rounded-2xl border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-5">
                        <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-bold">No Pending Transactions</p>
                                <p className="text-xs mt-0.5 text-green-600 dark:text-green-400">
                                    {selectedCC} is clear — you can proceed with closing.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <SectionHeader icon={BarChart2} title="CC Overview" subtitle={`Status report and DCA budget summary for ${selectedCC}`} />

            {statusLoading ? (
                <div className="flex items-center justify-center py-12 gap-3 text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm font-medium">Loading CC status report...</span>
                </div>
            ) : statusReport?.ConsolidateCCClosingStatusData?.length > 0 ? (() => {
                const d = statusReport.ConsolidateCCClosingStatusData[0];
                return (
                    <div className="space-y-4">
                        {/* CC identity banner */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-5 border-2 border-indigo-200 dark:border-indigo-700">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{d.CCCode}</h4>
                                    <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">{d.CCName}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{d.CCStartDate}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    ['Total Invoices', d.TotalInvoices],
                                    ['Cumulative Invoice', `₹${fmt(d.CCCumulativeInvoice)}`],
                                    ['Total Receipts', `₹${fmt(d.TotalReceiptAmount)}`],
                                    ['Net Receipt', `₹${fmt(d.NetReceipt)}`],
                                ].map(([label, value]) => (
                                    <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-indigo-200 dark:border-indigo-700 text-sm">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                                        <p className="font-bold text-gray-900 dark:text-white">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial status table */}
                        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3">
                                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                    <BarChart className="h-4 w-4" /> Financial Status Summary
                                </h5>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {[
                                    ['Cumulative Client Receipt Incl. TDS', d.CUMULATIVECLIENTRECEIPTINCLUDINGTDS],
                                    ['Credit Against New Stock Transfer', d.CREDITAGAINSTNEWSTOCKTRANSFER],
                                    ['Project Status (Cumulative Invoice)', d.PROJECTSTATUSWITHCUMULATIVEINVOICE],
                                    ['Difference in Client Receipt', d.DIFFERENCEINCLIENTRECEIPT],
                                    ['Debit Note Issued by Client', d.DEBITNOTEISSUEDBYCLIENT],
                                    ['Credit Note Issued to Client', d.CREDITNOTEISSUEDTOCLIENT],
                                    ['Bad Debts Booked', d.BADDEBTSBOOKED],
                                    ['Advance Received', `₹${fmt(d.AdvanceReceived)}`],
                                    ['Advance Recovered', `₹${fmt(d.AdvanceRecovered)}`],
                                    ['Other Deductions', `₹${fmt(d.OtherDeductions)}`],
                                    ['JV Deductions', `₹${fmt(d.JVDeductions)}`],
                                ].map(([label, value], i) => (
                                    <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/60'}`}>
                                        <span className="text-gray-600 dark:text-gray-400">{label}</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {String(value ?? '0.00').startsWith('₹') ? value : `₹${fmt(value)}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })() : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Info className="h-10 w-10 mb-3 opacity-50" />
                    <p className="text-sm">No status report data available for {selectedCC}</p>
                </div>
            )}

            {/* DCA Budget */}
            <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-indigo-500" /> DCA Consumed Budget
                </h4>
                {dcaLoading ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-indigo-600 dark:text-indigo-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading DCA budget...</span>
                    </div>
                ) : dcaBudgetReport.length > 0 ? (
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                            <thead className="bg-gradient-to-r from-indigo-500 to-purple-600">
                                <tr>
                                    <th className="px-4 py-3 text-left text-white font-bold uppercase tracking-wider">DCA Code</th>
                                    <th className="px-4 py-3 text-left text-white font-bold uppercase tracking-wider">DCA Name</th>
                                    <th className="px-4 py-3 text-right text-white font-bold uppercase tracking-wider">Consumed Budget</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                {dcaBudgetReport.filter(r => r.ConsumedBudget > 0).map((row, i) => (
                                    <tr key={i} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10">
                                        <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">{row.DCACode}</td>
                                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{row.DCAName}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-white">₹{fmt(row.ConsumedBudget)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                                    <td colSpan={2} className="px-4 py-3 font-bold text-indigo-800 dark:text-indigo-200 text-right">Total</td>
                                    <td className="px-4 py-3 font-black text-indigo-900 dark:text-indigo-100 text-right">
                                        ₹{fmt(dcaBudgetReport.reduce((s, r) => s + (r.ConsumedBudget || 0), 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-6">No DCA budget data available</p>
                )}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <SectionHeader icon={FileText} title="Closing Details" subtitle="Enter dates, alert note, remarks and resource information" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                    <FieldLabel required>Closing Date</FieldLabel>
                    <CustomDatePicker value={closingDate} onChange={v => setClosingDate(serializeDate(v))} format="DD-MMM-YYYY" placeholder="Select closing date" />
                </div>
                <div>
                    <FieldLabel>Start Date</FieldLabel>
                    <CustomDatePicker value={startDate} onChange={v => setStartDate(serializeDate(v))} format="DD-MMM-YYYY" placeholder="Select start date" />
                </div>
                <div>
                    <FieldLabel>End Date</FieldLabel>
                    <CustomDatePicker value={endDate} onChange={v => setEndDate(serializeDate(v))} format="DD-MMM-YYYY" placeholder="Select end date" />
                </div>
            </div>

            <div>
                <FieldLabel>Alert Note</FieldLabel>
                <input type="text" value={alertNote} onChange={e => setAlertNote(e.target.value)}
                    className={inputCls} placeholder="Alert note for this closing (optional)" maxLength={500} />
            </div>

            <div>
                <FieldLabel required>Remarks</FieldLabel>
                <textarea value={userRemarks} onChange={e => setUserRemarks(e.target.value)}
                    rows={4} className={inputCls} placeholder="Enter closing remarks..." maxLength={1000} />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{userRemarks.length}/1000</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <FieldLabel>Resource Head</FieldLabel>
                    <input type="text" value={resourceHead} onChange={e => setResourceHead(e.target.value)}
                        className={inputCls} placeholder="Resource head name(s)" />
                </div>
                <div>
                    <FieldLabel>Resource Details</FieldLabel>
                    <input type="text" value={resDetails} onChange={e => setResDetails(e.target.value)}
                        className={inputCls} placeholder="Resource details" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                    <FieldLabel>Depreciation Value</FieldLabel>
                    <input type="number" step="0.01" value={depreciationValue}
                        onChange={e => setDepreciationValue(e.target.value)} className={inputCls} placeholder="0.00" />
                </div>
                <div>
                    <FieldLabel>Interest on CC</FieldLabel>
                    <input type="number" step="0.01" value={interestOnCC}
                        onChange={e => setInterestOnCC(e.target.value)} className={inputCls} placeholder="0.00" />
                    {statusReport?.ConsolidateCCClosingStatusData?.[0]?.NewAccumulatedInterst > 0 && (
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                            Acc. Interest: ₹{fmt(statusReport.ConsolidateCCClosingStatusData[0].NewAccumulatedInterst)}
                        </p>
                    )}
                </div>
                <div>
                    <FieldLabel>Overhead</FieldLabel>
                    <input type="number" step="0.01" value={overHead}
                        onChange={e => setOverHead(e.target.value)} className={inputCls} placeholder="0.00" />
                    {(() => {
                        const ohRow = dcaBudgetReport.find(r => r.DCACode === 'Over Head');
                        return ohRow && ohRow.ConsumedBudget > 0 ? (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                                DCA Overhead: ₹{fmt(ohRow.ConsumedBudget)}
                            </p>
                        ) : null;
                    })()}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => {
        const handleFinancialChange = e => setFinancial(prev => ({ ...prev, [e.target.name]: e.target.value }));

        const Section = ({ title, icon: Icon, color, children }) => (
            <div className={`rounded-2xl p-5 border ${color}`}>
                <h5 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Icon className="h-4 w-4 text-indigo-500" /> {title}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
            </div>
        );

        return (
            <div className="space-y-5">
                <SectionHeader icon={IndianRupee} title="Financial Settlement Data" subtitle="Pre-filled from CC status report — edit as required" />

                <Section title="Client Invoice & Receipt" icon={TrendingDown} color="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800">
                    <FinancialField label="CC Cumulative Invoice" name="CCCumulativeInvoice" value={financial.CCCumulativeInvoice} onChange={handleFinancialChange} />
                    <FinancialField label="Cumulative Client Receipt Incl. TDS" name="CUMULATIVECLIENTRECEIPTINCLUDINGTDS" value={financial.CUMULATIVECLIENTRECEIPTINCLUDINGTDS} onChange={handleFinancialChange} />
                    <FinancialField label="Credit Against New Stock Transfer" name="CREDITAGAINSTNEWSTOCKTRANSFER" value={financial.CREDITAGAINSTNEWSTOCKTRANSFER} onChange={handleFinancialChange} />
                    <FinancialField label="Project Status with Cumulative Invoice" name="PROJECTSTATUSWITHCUMULATIVEINVOICE" value={financial.PROJECTSTATUSWITHCUMULATIVEINVOICE} onChange={handleFinancialChange} />
                    <FinancialField label="Project Status with Cum Client Net Receipt Incl TDS" name="PROJECTSTATUSWITHCUMCLIENTNETRECEIPTINCTDS" value={financial.PROJECTSTATUSWITHCUMCLIENTNETRECEIPTINCTDS} onChange={handleFinancialChange} />
                    <FinancialField label="Proj Stat + New Stk Trans Credits" name="PROJSTATWITHCUMCLIENTNETRECINCTDSNEWSTKTRANSCREDITS" value={financial.PROJSTATWITHCUMCLIENTNETRECINCTDSNEWSTKTRANSCREDITS} onChange={handleFinancialChange} />
                    <div className="md:col-span-2">
                        <FinancialField label="Difference in Client Receipt" name="DIFFERENCEINCLIENTRECEIPT" value={financial.DIFFERENCEINCLIENTRECEIPT} onChange={handleFinancialChange} />
                    </div>
                </Section>

                <Section title="Debit / Credit Notes (Client)" icon={ClipboardList} color="bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
                    <FinancialField label="Debit Note Issued by Client" name="DEBITNOTEISSUEDBYCLIENT" value={financial.DEBITNOTEISSUEDBYCLIENT} onChange={handleFinancialChange} />
                    <FinancialField label="Credit Note Issued to Client" name="CREDITNOTEISSUEDTOCLIENT" value={financial.CREDITNOTEISSUEDTOCLIENT} onChange={handleFinancialChange} />
                    <FinancialField label="Bad Debts Booked" name="BADDEBTSBOOKED" value={financial.BADDEBTSBOOKED} onChange={handleFinancialChange} />
                    <div>
                        <FieldLabel>Bad Debts Booked (A/C Year)</FieldLabel>
                        <input type="text" name="BADDEBTSBOOKEDFORTHEACYEAR" value={financial.BADDEBTSBOOKEDFORTHEACYEAR}
                            onChange={handleFinancialChange} className={inputCls} placeholder="e.g. 2024-25" />
                    </div>
                </Section>

                <Section title="Vendor Debit / Credit Notes" icon={Users} color="bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800">
                    <FinancialField label="Debit Note Issued to Vendor" name="DEBITNOTEISSUEDTOVENDOR" value={financial.DEBITNOTEISSUEDTOVENDOR} onChange={handleFinancialChange} />
                    <FinancialField label="Credit Note Issued to Vendor" name="CREDITNOTEISSUEDTOVENDOR" value={financial.CREDITNOTEISSUEDTOVENDOR} onChange={handleFinancialChange} />
                    <FinancialField label="Payables Written Off During CC Closure" name="ACCOUNTEDPAYABLEWRITTENOFFMADEDURINGCCCLOSUER" value={financial.ACCOUNTEDPAYABLEWRITTENOFFMADEDURINGCCCLOSUER} onChange={handleFinancialChange} />
                    <FinancialField label="Total Cost After Deducting Written Off Payables" name="TOTALCOSTAFTERDEDUCTINGWRITTENOFFPAYABLES" value={financial.TOTALCOSTAFTERDEDUCTINGWRITTENOFFPAYABLES} onChange={handleFinancialChange} />
                    <div>
                        <FieldLabel>Payable Written Off Financial Year</FieldLabel>
                        <input type="text" name="PAYABLEWRITTENOFFFINANCIALYEAR" value={financial.PAYABLEWRITTENOFFFINANCIALYEAR}
                            onChange={handleFinancialChange} className={inputCls} placeholder="e.g. 2015-16" />
                    </div>
                    <div>
                        <FieldLabel>PCC Budget Transfer to Capital</FieldLabel>
                        <input type="text" name="PCCBUDGETTRANSFERTOCAPITAL" value={financial.PCCBUDGETTRANSFERTOCAPITAL}
                            onChange={handleFinancialChange} className={inputCls} placeholder="Enter value" />
                    </div>
                    <div className="md:col-span-2">
                        <FieldLabel>Comments on Debit Note to Vendor</FieldLabel>
                        <textarea rows={2} name="COMMENTSBYACCOUNTSONDEBITNOTETOVENDOR" value={financial.COMMENTSBYACCOUNTSONDEBITNOTETOVENDOR}
                            onChange={handleFinancialChange} className={inputCls} placeholder="Enter comments..." />
                    </div>
                    <div className="md:col-span-2">
                        <FieldLabel>Comments on Credit Note Issued to Vendor</FieldLabel>
                        <textarea rows={2} name="COMMENTSONCREDITNOTEISSUEDTOVENDOR" value={financial.COMMENTSONCREDITNOTEISSUEDTOVENDOR}
                            onChange={handleFinancialChange} className={inputCls} placeholder="Enter comments..." />
                    </div>
                </Section>

                <Section title="Deductions & Recovery" icon={Hash} color="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                    <FinancialField label="Other Deductions" name="OtherDeductions" value={financial.OtherDeductions} onChange={handleFinancialChange} />
                    <FinancialField label="JV Deductions" name="JVDeductions" value={financial.JVDeductions} onChange={handleFinancialChange} />
                    <FinancialField label="Advance Recovered" name="AdvanceRecovered" value={financial.AdvanceRecovered} onChange={handleFinancialChange} />
                </Section>
            </div>
        );
    };

    const renderStep5 = () => {
        const typeName = closingTypes.find(t => t.Id === selectedType)?.Name || selectedType;
        return (
            <div className="space-y-6">
                <SectionHeader icon={CheckCircle2} title="Review & Submit" subtitle="Verify all details before submitting" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        ['Closing Type', typeName],
                        ['Cost Center', selectedCCName || selectedCC],
                        ['Closing Date', formatDateForAPI(closingDate) || '—'],
                    ].map(([label, value]) => (
                        <div key={label} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 border-2 border-indigo-200 dark:border-indigo-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800/60 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Closing Details</h5>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {[
                            ['Start Date', formatDateForAPI(startDate) || '—'],
                            ['End Date', formatDateForAPI(endDate) || '—'],
                            ['Alert Note', alertNote || '—'],
                            ['Remarks', userRemarks || '—'],
                            ['Resource Head', resourceHead || '—'],
                            ['Resource Details', resDetails || '—'],
                            ['Depreciation Value', depreciationValue ? `₹${fmt(depreciationValue)}` : '—'],
                            ['Interest on CC', interestOnCC ? `₹${fmt(interestOnCC)}` : '—'],
                            ['Overhead', overHead ? `₹${fmt(overHead)}` : '—'],
                        ].map(([label, value]) => (
                            <div key={label} className="flex gap-3">
                                <span className="text-gray-500 dark:text-gray-400 min-w-[140px] flex-shrink-0">{label}:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800/60 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Key Financial Figures</h5>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            ['CC Cumulative Invoice', financial.CCCumulativeInvoice],
                            ['Client Receipt Incl. TDS', financial.CUMULATIVECLIENTRECEIPTINCLUDINGTDS],
                            ['Difference in Client Receipt', financial.DIFFERENCEINCLIENTRECEIPT],
                            ['Payables Written Off', financial.ACCOUNTEDPAYABLEWRITTENOFFMADEDURINGCCCLOSUER],
                            ['Other Deductions', financial.OtherDeductions],
                            ['Advance Recovered', financial.AdvanceRecovered],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm">
                                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">₹{fmt(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border-2 border-green-200 dark:border-green-700">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-green-800 dark:text-green-200 mb-1">Ready to Submit</p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                                By submitting, you confirm all details are correct and this closing request will be sent for approval.
                                Submitted by: <strong>{userName}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];
    const currentStepData = STEPS[currentStep - 1];
    const isLastStep = currentStep === STEPS.length;
    const nextDisabled = currentStep === 1 && (pendingLoading || hasPendingItems);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">

            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl mx-6 mt-6 mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-lg">
                            <Lock className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-3 py-1 bg-white/15 text-white text-xs font-bold rounded-full border border-white/20">
                                    Accounts Module
                                </span>
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight">CC Closing</h1>
                            <p className="text-indigo-100 text-sm mt-0.5">Cost Center Closing &amp; Suspension Management</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                            {STEPS.map(s => (
                                <div key={s.id}
                                    className={`rounded-full transition-all ${s.id === currentStep ? 'w-6 h-2 bg-white' : completedSteps.includes(s.id) ? 'w-2 h-2 bg-white/70' : 'w-2 h-2 bg-white/30'}`}
                                />
                            ))}
                        </div>
                        <p className="text-white/70 text-xs">Step {currentStep} of {STEPS.length}: {currentStepData.label}</p>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-6 pb-10">
                <div className="flex gap-6">
                    <StepSidebar steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} />

                    <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Step header */}
                            <div className="bg-gradient-to-r from-gray-50 to-indigo-50/40 dark:from-gray-800 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        {React.createElement(currentStepData.icon, { className: 'h-4 w-4 text-white' })}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                            Step {currentStep} of {STEPS.length}
                                        </p>
                                        <h2 className="text-base font-black text-gray-800 dark:text-gray-100">{currentStepData.label}</h2>
                                    </div>
                                </div>
                                {selectedCC && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                        <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{selectedCC}</span>
                                    </div>
                                )}
                            </div>

                            {/* Step body */}
                            <div className="p-6 md:p-8">{stepRenderers[currentStep - 1]?.()}</div>

                            {/* Navigation footer */}
                            <div className="bg-gray-50 dark:bg-gray-800/60 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <button type="button" onClick={goPrev} disabled={currentStep === 1}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {STEPS.map(s => (
                                        <div key={s.id} className={`rounded-full transition-all ${s.id === currentStep ? 'w-5 h-2 bg-indigo-500' : completedSteps.includes(s.id) ? 'w-2 h-2 bg-indigo-400' : 'w-2 h-2 bg-gray-200 dark:bg-gray-600'}`} />
                                    ))}
                                </div>

                                {isLastStep ? (
                                    <button type="button" onClick={handleSubmit} disabled={saveLoading}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                        {saveLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><CheckCircle2 className="h-4 w-4" /> Submit Closing</>}
                                    </button>
                                ) : (
                                    <button type="button" onClick={goNext} disabled={nextDisabled}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                        Next <ChevronRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CCClosing;
