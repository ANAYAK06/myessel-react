import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import {
    Upload, RefreshCw, CheckCircle2, AlertCircle, Loader2,
    ChevronRight, RotateCcw, FileSpreadsheet, Info, Download,
    Users, IndianRupee, Navigation,
} from 'lucide-react';

import {
    uploadLabourStaging, fetchStagingPreview,
    generateLabourPayroll, fetchPayrollSummary,
    clearPayrollState, clearGenerateResult,
} from '../../slices/labourPayrollSlice/labourPayrollSlice';
import { fetchAllCostCenters, fetchMinWageConfig, fetchPFConfig, fetchESIConfig } from '../../slices/labourConfigSlice/labourConfigSlice';
import { getPTConfig, getPTSlabs, getLWFConfig } from '../../api/LabourConfigAPI/labourConfigAPI';

// ─── shared ui helpers ────────────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 ' +
    'text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 ' +
    'focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 ' +
    'hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const selectCls = inputCls;

const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const SectionCard = ({ children, title, icon: Icon, titleRight }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {title && (
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 flex-1">{title}</span>
                {titleRight}
            </div>
        )}
        {children}
    </div>
);

const Btn = ({ children, onClick, loading, disabled, variant = 'primary', size = 'md', className = '' }) => {
    const base = 'inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all focus:outline-none shadow-sm';
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm' };
    const variants = {
        primary:   'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white disabled:opacity-50 shadow-md',
        secondary: 'border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800',
        success:   'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white disabled:opacity-50 shadow-md',
        danger:    'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white disabled:opacity-50 shadow-md',
    };
    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            className={cn(base, sizes[size], variants[variant], className)}
        >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {children}
        </button>
    );
};

const fmt = (n) => (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const MONTHS = [
    { v: 1, l: 'January' }, { v: 2, l: 'February' }, { v: 3, l: 'March' },
    { v: 4, l: 'April' },   { v: 5, l: 'May' },       { v: 6, l: 'June' },
    { v: 7, l: 'July' },    { v: 8, l: 'August' },    { v: 9, l: 'September' },
    { v: 10, l: 'October' },{ v: 11, l: 'November' }, { v: 12, l: 'December' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Excel parser ─────────────────────────────────────────────────────────────
const parseAttendanceExcel = (file, payrollMonth, payrollYear) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb   = XLSX.read(e.target.result, { type: 'array' });
                const ws   = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

                if (!rows.length) { reject('Excel sheet is empty'); return; }

                const attValue = (v) => {
                    const s = String(v ?? '').trim().toUpperCase();
                    if (s === 'P' || s === 'H') return 1;
                    if (s === 'HD') return 0.5;
                    return 0;
                };

                const attStatus = (v) => {
                    const s = String(v ?? '').trim().toUpperCase();
                    if (['P', 'H', 'HD', 'A'].includes(s)) return s;
                    if (s === 'S' || s === 'WO' || s === 'OFF') return 'A'; // Sunday / week-off → absent (0 days)
                    return null;
                };

                const FIXED = ['labourid', 'labourname', 'category', 'designation', 'grossamount', 'gross amount', 'advance'];
                const daysInMonth = new Date(payrollYear, payrollMonth, 0).getDate();

                const parsed = rows.map((row, idx) => {
                    const norm = {};
                    Object.keys(row).forEach(k => { norm[k.toLowerCase().trim()] = row[k]; });

                    const labourId    = String(norm['labourid']    ?? '').trim();
                    const labourName  = String(norm['labourname']  ?? '').trim();
                    const category    = String(norm['category']    ?? '').trim().toUpperCase();
                    const designation = String(norm['designation'] ?? '').trim();
                    const grossAmount = parseFloat(norm['grossamount'] ?? norm['gross amount'] ?? 0);

                    // Match any column whose name starts with 'advance' (handles "Advance", "ADVANCE (CASH + BANK)", etc.)
                    const advanceKey  = Object.keys(norm).find(k => k.startsWith('advance'));
                    const advance     = parseFloat(advanceKey ? norm[advanceKey] : 0) || 0;

                    // Skip blank rows (totals / headers / empty lines) silently
                    if (!labourId) return null;

                    if (!['SK', 'SSK', 'USK', 'HSK'].includes(category)) {
                        reject(`Row ${idx + 2}: Invalid Category "${category}". Must be SK/SSK/USK/HSK`);
                        return null;
                    }

                    let daysWorked = 0;
                    const dayDetails = [];

                    for (let day = 1; day <= daysInMonth; day++) {
                        const raw = norm[String(day)] ?? norm[String(day).padStart(2, '0')] ?? '';
                        const status = attStatus(raw) ?? 'A';

                        daysWorked += attValue(raw);

                        const mm = String(payrollMonth).padStart(2, '0');
                        const dd = String(day).padStart(2, '0');
                        dayDetails.push({
                            AttendDate:   `${payrollYear}-${mm}-${dd}`,
                            AttendStatus: status,
                        });
                    }

                    return {
                        LabourId:    labourId,
                        LabourName:  labourName,
                        Category:    category,
                        Designation: designation,
                        DaysWorked:  parseFloat(daysWorked.toFixed(1)),
                        GrossAmount: grossAmount,
                        Advance:     advance,
                        DayDetails:  dayDetails,
                    };
                });

                resolve(parsed.filter(Boolean));
            } catch (ex) {
                reject(ex.message || 'Failed to parse Excel file');
            }
        };
        reader.onerror = () => reject('Failed to read file');
        reader.readAsArrayBuffer(file);
    });

// ─── Step indicator (white on gradient) ──────────────────────────────────────
const Steps = ({ current }) => {
    const steps = ['Setup & Upload', 'Preview & Overrides', 'Summary'];
    return (
        <div className="flex items-center">
            {steps.map((s, i) => (
                <React.Fragment key={i}>
                    <div className="flex flex-col items-center">
                        <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                            current === i ? 'bg-white/20 border-white text-white' :
                            current > i  ? 'bg-white border-white text-indigo-600' :
                                           'bg-white/10 border-white/30 text-white/50'
                        )}>
                            {current > i ? <CheckCircle2 className="h-4 w-4" /> : <span>{i + 1}</span>}
                        </div>
                        <span className={cn('mt-1 text-xs font-medium hidden sm:block',
                            current === i ? 'text-white' :
                            current > i  ? 'text-indigo-200' : 'text-white/40'
                        )}>
                            {s}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={cn('flex-1 h-0.5 mx-2 mb-4 rounded', current > i ? 'bg-white/60' : 'bg-white/20')} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// ─── Govt Rate display ────────────────────────────────────────────────────────
const GovtRateTable = ({ minWageData }) => {
    const cats = ['SK', 'SSK', 'USK', 'HSK'];
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/40">
                        {['Category', 'Daily Rate (₹)', 'Effective From', 'Status'].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {cats.map(cat => {
                        const row = minWageData.filter(r => r.Category === cat)
                            .sort((a, b) => new Date(b.EffectiveDate || 0) - new Date(a.EffectiveDate || 0))[0];
                        return (
                            <tr key={cat} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-200">{cat}</td>
                                <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                                    {row ? fmt(row.DailyRate) : <span className="text-gray-300">—</span>}
                                </td>
                                <td className="px-3 py-2 text-gray-500">{row?.EffectiveDate || '—'}</td>
                                <td className="px-3 py-2">
                                    {row ? (
                                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold',
                                            row.Status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
                                            {row.Status}
                                        </span>
                                    ) : <span className="text-gray-300 text-xs">Not configured</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// ─── Summary view ─────────────────────────────────────────────────────────────
const SummaryView = ({ summary, onReset }) => {
    const h = summary?.Header;
    const breakdown = summary?.Breakdown || [];
    if (!h) return null;

    const monthName = MONTHS.find(m => m.v === h.PayrollMonth)?.l || h.PayrollMonth;

    const TotalRow = ({ label, value, bold }) => (
        <div className={cn('flex justify-between py-1.5', bold ? 'font-bold border-t border-gray-200 dark:border-gray-600 mt-1 pt-2' : '')}>
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            <span className="text-sm text-gray-800 dark:text-gray-100">₹{fmt(value)}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" /> Payroll Generated Successfully
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">{h.CCName} — {monthName} {h.PayrollYear}</p>
                </div>
                <Btn variant="secondary" onClick={onReset}>
                    <RotateCcw className="h-3.5 w-3.5" /> New Payroll
                </Btn>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="Payroll Parameters" icon={IndianRupee}>
                    <div className="p-5 space-y-1 text-sm">
                        {[
                            ['Ref No', h.TransactionRefNo],
                            ['Cost Centre', `${h.CCCode} — ${h.CCName}`],
                            ['Period', `${monthName} ${h.PayrollYear}`],
                            ['Working Days', h.WorkingDays],
                            ['PF Employee %', h.PFEmpPct],
                            ['PF Employer %', h.PFEmprPct],
                            ['ESI Employee %', h.ESIEmpPct],
                            ['ESI Employer %', h.ESIEmprPct],
                            ['PF Ceiling', h.PFCeiling ? `Yes — ₹${fmt(h.PFCeilingAmt)}` : 'No'],
                            ['ESI Auto-Exempt >21000', h.ESICeilingApply ? 'Yes' : 'No'],
                            ['Generated By', h.GeneratedBy],
                            ['Generated On', h.GeneratedOn],
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400">{k}</span>
                                <span className="text-gray-800 dark:text-gray-100 font-medium">{v}</span>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="Overall Totals" icon={Users}>
                    <div className="p-5">
                        <TotalRow label="Total Workers" value={h.TotalWorkers} />
                        <TotalRow label="Gross Amount" value={h.TotalGrossAmount} />
                        <TotalRow label="Basic Wage" value={h.TotalBasicWage} />
                        <TotalRow label="Allowance" value={h.TotalAllowance} />
                        <TotalRow label="PF Employee" value={h.TotalPFEmployee} />
                        <TotalRow label="PF Employer" value={h.TotalPFEmployer} />
                        <TotalRow label="ESI Employee" value={h.TotalESIEmployee} />
                        <TotalRow label="ESI Employer" value={h.TotalESIEmployer} />
                        <TotalRow label="Advance" value={h.TotalAdvance} />
                        <TotalRow label="Other Allowance" value={h.TotalOtherAllowance} />
                        <TotalRow label="Basic Payable" value={h.TotalBasicPayable} />
                        <TotalRow label="Allowance Payable" value={h.TotalAllowancePayable} />
                        <TotalRow label="Net Payable" value={h.TotalNetPayable} bold />
                    </div>
                </SectionCard>
            </div>

            {breakdown.length > 0 && (
                <SectionCard title="Category-wise Breakdown">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/40">
                                    {['Category','Workers','Gross Amount','Basic Wage','Allowance','PF Emp','PF Empr','ESI Emp','ESI Empr','Advance','Other Allow','Basic Payable','Allow. Payable','Net Payable'].map(h => (
                                        <th key={h} className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {breakdown.map(r => (
                                    <tr key={r.Category} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10">
                                        <td className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{r.Category}</td>
                                        <td className="px-3 py-2 text-center">{r.WorkerCount}</td>
                                        {[r.GrossAmount,r.BasicWage,r.Allowance,r.PFEmployee,r.PFEmployer,r.ESIEmployee,r.ESIEmployer,r.Advance,r.OtherAllowance,r.BasicPayable,r.AllowancePayable,r.NetPayable].map((v,i) => (
                                            <td key={i} className="px-3 py-2 text-right text-gray-700 dark:text-gray-200">{fmt(v)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const LabourPayrollGeneration = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const { costCenters, costCentersLoading, minWageData, minWageLoading,
        pfConfigData, pfConfigLoading, esiConfigData, esiConfigLoading,
    } = useSelector(s => s.labourConfig);
    const {
        uploadBatchId, stagingLoading, stagingError,
        previewRows, previewLoading, previewError,
        generateLoading, generateResult, generateError,
        summary, summaryLoading,
    } = useSelector(s => s.labourPayroll);

    const [step, setStep] = useState(0);

    const [form, setForm] = useState({
        ccCode: '', month: new Date().getMonth() + 1, year: CURRENT_YEAR,
        workingDays: '',
        pfEmpPct: '', pfEPS_Pct: '', pfEPF_Pct: '', pfEDLI_Pct: '', pfAdminCharge_Pct: '',
        pfCeiling: false, pfCeilingAmt: '',
        esiEmpPct: '', esiEmprPct: '', esiCeilingApply: true, esiApplicabilityAmt: '',
    });

    const [parsedRows, setParsedRows] = useState([]);
    const [excelFile, setExcelFile]   = useState(null);
    const [parseError, setParseError] = useState('');
    const [overrides, setOverrides]   = useState({});
    const [lastGenerateError, setLastGenerateError] = useState('');

    const [ptConfig,   setPTConfig]   = useState(null);
    const [ptSlabs,    setPTSlabs]    = useState([]);
    const [ptLoading,  setPTLoading]  = useState(false);
    const [lwfConfig,  setLWFConfig]  = useState(null);
    const [lwfLoading, setLWFLoading] = useState(false);

    const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

    useEffect(() => {
        dispatch(fetchAllCostCenters());
        return () => { dispatch(clearPayrollState()); };
    }, [dispatch]); // eslint-disable-line

    useEffect(() => {
        if (!form.ccCode) return;
        dispatch(fetchMinWageConfig({ ccCode: form.ccCode }));

        const PF_BLANK  = { pfEmpPct: '', pfEPS_Pct: '', pfEPF_Pct: '', pfEDLI_Pct: '', pfAdminCharge_Pct: '', pfCeiling: false, pfCeilingAmt: '' };
        const ESI_BLANK = { esiEmpPct: '', esiEmprPct: '', esiApplicabilityAmt: '' };

        const parseDate = s => { const [d, m, y] = (s || '').split('/'); return new Date(+y, +m - 1, +d); };

        // Clear PF/ESI fields immediately so stale values from a previous CC don't linger
        setForm(p => ({ ...p, ...PF_BLANK, ...ESI_BLANK }));

        dispatch(fetchPFConfig(form.ccCode)).unwrap()
            .then(data => {
                const records = Array.isArray(data) ? data : (data?.Data || []);
                const active = records
                    .filter(c => c.Status === 'Active')
                    .sort((a, b) => parseDate(b.EffectiveFrom) - parseDate(a.EffectiveFrom))[0];
                if (active) {
                    setForm(p => ({
                        ...p,
                        pfEmpPct:         String(active.EmpPFPct),
                        pfEPS_Pct:        String(active.EPS_Pct),
                        pfEPF_Pct:        String(active.EPF_Pct),
                        pfEDLI_Pct:       String(active.EDLI_Pct),
                        pfAdminCharge_Pct: String(active.EPFAdminCharge_Pct),
                        pfCeiling:        !!active.ThresholdApply,
                        pfCeilingAmt:     active.ThresholdAmt ? String(active.ThresholdAmt) : '',
                    }));
                }
            })
            .catch(() => setForm(p => ({ ...p, ...PF_BLANK })));

        dispatch(fetchESIConfig(form.ccCode)).unwrap()
            .then(data => {
                const records = Array.isArray(data) ? data : (data?.Data || []);
                const active = records
                    .filter(c => c.Status === 'Active')
                    .sort((a, b) => parseDate(b.EffectiveFrom) - parseDate(a.EffectiveFrom))[0];
                if (active) {
                    setForm(p => ({
                        ...p,
                        esiEmpPct:          String(active.EmpESIPct),
                        esiEmprPct:         String(active.EmprESIPct),
                        esiApplicabilityAmt: String(active.ApplicabilityAmt),
                    }));
                }
            })
            .catch(() => setForm(p => ({ ...p, ...ESI_BLANK })));

        // PT config + slabs
        setPTConfig(null); setPTSlabs([]); setPTLoading(true);
        getPTConfig(form.ccCode)
            .then(data => {
                const records = Array.isArray(data) ? data : (data?.Data || []);
                const active = records
                    .filter(c => c.Status === 'Active')
                    .sort((a, b) => parseDate(b.EffectiveFrom) - parseDate(a.EffectiveFrom))[0];
                setPTConfig(active || null);
                if (active) return getPTSlabs(active.ConfigId);
                return [];
            })
            .then(slabs => {
                const slabRecords = Array.isArray(slabs) ? slabs : (slabs?.Data || []);
                setPTSlabs(slabRecords);
            })
            .catch(() => { setPTConfig(null); setPTSlabs([]); })
            .finally(() => setPTLoading(false));

        // LWF config
        setLWFConfig(null); setLWFLoading(true);
        getLWFConfig(form.ccCode)
            .then(data => {
                const records = Array.isArray(data) ? data : (data?.Data || []);
                const active = records
                    .filter(c => c.Status === 'Active')
                    .sort((a, b) => parseDate(b.EffectiveFrom) - parseDate(a.EffectiveFrom))[0];
                setLWFConfig(active || null);
            })
            .catch(() => setLWFConfig(null))
            .finally(() => setLWFLoading(false));
    }, [form.ccCode, dispatch]); // eslint-disable-line

    useEffect(() => {
        if (uploadBatchId && form.ccCode) {
            dispatch(fetchStagingPreview({ ccCode: form.ccCode, month: form.month, year: form.year }));
            setStep(1);
        }
    }, [uploadBatchId]); // eslint-disable-line

    useEffect(() => {
        if (previewRows.length) {
            const init = {};
            previewRows.forEach(r => {
                init[r.LabourId] = overrides[r.LabourId] || {
                    pfApplicable: true, esiApplicable: true,
                    advance: r.Advance > 0 ? String(r.Advance) : '',
                    otherAllowance: '',
                };
            });
            setOverrides(init);
        }
    }, [previewRows]); // eslint-disable-line

    useEffect(() => {
        if (generateResult) {
            if (generateResult.Result === 'SUCCESS' || generateResult.PayrollId) {
                const pid = generateResult.PayrollId;
                toast.success('Payroll generated successfully!');
                dispatch(fetchPayrollSummary({ payrollId: pid }));
                setStep(2);
            } else {
                toast.error(generateResult.Message || 'Generation failed');
            }
            dispatch(clearGenerateResult());
        }
        if (generateError) {
            toast.error('Payroll generation failed. See details below.');
            setLastGenerateError(generateError);
            dispatch(clearGenerateResult());
        }
    }, [generateResult, generateError]); // eslint-disable-line

    const handleDownloadTemplate = () => {
        const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
        const headers = ['LabourId', 'LabourName', 'Category', 'Designation', ...days, 'GrossAmount', 'Advance'];
        const sampleRows = [
            ['LB001', 'Sample Worker 1', 'SK',  'Mason',    ...Array(31).fill('P'), 16900, 0],
            ['LB002', 'Sample Worker 2', 'USK', 'Helper',   ...Array(31).fill('A'), 0,     0],
            ['LB003', 'Sample Worker 3', 'SSK', 'Carpenter',...Array(31).fill('HD'), 9300, 500],
        ];
        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
        ws['!cols'] = [
            { wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 14 },
            ...Array(31).fill({ wch: 5 }),
            { wch: 12 }, { wch: 10 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        XLSX.writeFile(wb, 'LabourAttendance_Template.xlsx');
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setExcelFile(file);
        setParseError('');
        setParsedRows([]);
        try {
            console.log('[Upload] parsing file:', file.name, 'month:', form.month, 'year:', form.year);
            const rows = await parseAttendanceExcel(file, form.month, form.year);
            console.log('[Upload] parsed rows:', rows.length, rows);
            setParsedRows(rows);
        } catch (msg) {
            console.error('[Upload] parse error:', msg);
            setParseError(String(msg));
        }
        e.target.value = '';
    };

    const handleUpload = () => {
        if (!form.ccCode)          { toast.warning('Select a Cost Centre'); return; }
        if (!form.month)           { toast.warning('Select a month'); return; }
        if (!form.year)            { toast.warning('Select a year'); return; }
        if (!parsedRows.length)    { toast.warning('Upload a valid attendance Excel sheet'); return; }

        dispatch(uploadLabourStaging({
            CCCode:       form.ccCode,
            PayrollMonth: parseInt(form.month),
            PayrollYear:  parseInt(form.year),
            UploadedBy:   userData?.userName || userData?.empCode || '',
            Rows:         parsedRows,
        }));
    };

    const handleGenerate = () => {
        if (!form.workingDays || parseInt(form.workingDays) <= 0) {
            toast.warning('Enter valid working days');
            return;
        }
        if (!uploadBatchId) { toast.warning('Upload the attendance sheet first'); return; }

        const detailOverrides = previewRows.map(r => {
            const ov = overrides[r.LabourId] || {};
            return {
                LabourId:       r.LabourId,
                PFApplicable:   ov.pfApplicable !== false,
                ESIApplicable:  ov.esiApplicable !== false,
                Advance:        parseFloat(ov.advance) || 0,
                OtherAllowance: parseFloat(ov.otherAllowance) || 0,
            };
        });

        dispatch(generateLabourPayroll({
            CCCode:          form.ccCode,
            PayrollMonth:    parseInt(form.month),
            PayrollYear:     parseInt(form.year),
            WorkingDays:     parseInt(form.workingDays),
            PFEmpPct:        parseFloat(form.pfEmpPct) || 0,
            PFEmprPct:       (parseFloat(form.pfEPS_Pct) || 0) + (parseFloat(form.pfEPF_Pct) || 0)
                           + (parseFloat(form.pfEDLI_Pct) || 0) + (parseFloat(form.pfAdminCharge_Pct) || 0),
            ESIEmpPct:       parseFloat(form.esiEmpPct)      || 0,
            ESIEmprPct:      parseFloat(form.esiEmprPct)     || 0,
            PFCeiling:       form.pfCeiling,
            PFCeilingAmt:    form.pfCeiling ? (parseFloat(form.pfCeilingAmt) || null) : null,
            ESICeilingApply: form.esiCeilingApply,
            PTApply:         !!ptConfig,
            LWFApply:        !!lwfConfig,
            UploadBatchId:   uploadBatchId,
            RoleId:          userData?.roleId || 0,
            CreatedBy:       userData?.userName || userData?.empCode || '',
            Overrides:       detailOverrides,
        }));
    };

    const handleReset = () => {
        dispatch(clearPayrollState());
        setStep(0);
        setForm({
            ccCode: '', month: new Date().getMonth() + 1, year: CURRENT_YEAR,
            workingDays: '',
            pfEmpPct: '', pfEPS_Pct: '', pfEPF_Pct: '', pfEDLI_Pct: '', pfAdminCharge_Pct: '',
            pfCeiling: false, pfCeilingAmt: '',
            esiEmpPct: '', esiEmprPct: '', esiCeilingApply: true, esiApplicabilityAmt: '',
        });
        setParsedRows([]);
        setExcelFile(null);
        setParseError('');
        setOverrides({});
        setLastGenerateError('');
        setPTConfig(null); setPTSlabs([]);
        setLWFConfig(null);
    };

    const setOverride = (labourId, key, value) =>
        setOverrides(p => ({ ...p, [labourId]: { ...p[labourId], [key]: value } }));

    // ── Step 0: Setup + Upload
    const renderSetup = () => (
        <div className="space-y-6">
            <SectionCard title="Payroll Period & Parameters" icon={IndianRupee}>
                <div className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Label required>Cost Centre</Label>
                            <select className={selectCls} value={form.ccCode} onChange={e => setField('ccCode', e.target.value)}>
                                <option value="">— Select CC —</option>
                                {costCenters.map(c => (
                                    <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label required>Month</Label>
                            <select className={selectCls} value={form.month} onChange={e => setField('month', parseInt(e.target.value))}>
                                {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label required>Year</Label>
                            <select className={selectCls} value={form.year} onChange={e => setField('year', parseInt(e.target.value))}>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label required>Working Days</Label>
                            <input
                                type="number" min="1" max="31"
                                className={inputCls} placeholder="e.g. 26"
                                value={form.workingDays}
                                onChange={e => setField('workingDays', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* PF Configuration */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3 mt-4">
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">PF Configuration</span>
                            {pfConfigLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />}
                            {!pfConfigLoading && form.ccCode && form.pfEmpPct && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Loaded from config</span>
                            )}
                            {!pfConfigLoading && form.ccCode && !form.pfEmpPct && (
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">No PF configuration found for this cost centre</span>
                            )}
                            {!form.ccCode && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">Select a cost centre to load PF config</span>
                            )}
                        </div>
                        {form.pfEmpPct ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div>
                                        <Label>Employee PF %</Label>
                                        <input type="number" step="0.01" className={inputCls} value={form.pfEmpPct} onChange={e => setField('pfEmpPct', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>EPS %</Label>
                                        <input type="number" step="0.0001" className={inputCls} value={form.pfEPS_Pct} onChange={e => setField('pfEPS_Pct', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>EPF %</Label>
                                        <input type="number" step="0.0001" className={inputCls} value={form.pfEPF_Pct} onChange={e => setField('pfEPF_Pct', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>EDLI %</Label>
                                        <input type="number" step="0.0001" className={inputCls} value={form.pfEDLI_Pct} onChange={e => setField('pfEDLI_Pct', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Admin Charge %</Label>
                                        <input type="number" step="0.0001" className={inputCls} value={form.pfAdminCharge_Pct} onChange={e => setField('pfAdminCharge_Pct', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 items-end">
                                    <div className="flex flex-col gap-1">
                                        <Label>PF Wage Ceiling</Label>
                                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                                            <input
                                                type="checkbox" checked={form.pfCeiling}
                                                onChange={e => setField('pfCeiling', e.target.checked)}
                                                className="w-4 h-4 accent-purple-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Apply PF Ceiling</span>
                                        </label>
                                    </div>
                                    {form.pfCeiling && (
                                        <div>
                                            <Label>Ceiling Amount (₹)</Label>
                                            <input type="number" className={inputCls} value={form.pfCeilingAmt} onChange={e => setField('pfCeilingAmt', e.target.value)} />
                                        </div>
                                    )}
                                    <div className="md:col-span-3 flex items-end pb-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Employer total: <strong className="text-purple-600 dark:text-purple-400">
                                                {((parseFloat(form.pfEPS_Pct) || 0) + (parseFloat(form.pfEPF_Pct) || 0) + (parseFloat(form.pfEDLI_Pct) || 0) + (parseFloat(form.pfAdminCharge_Pct) || 0)).toFixed(4)}%
                                            </strong>
                                            <span className="ml-2 text-gray-400">(EPS + EPF + EDLI + Admin)</span>
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>

                    {/* ESI Configuration */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3 mt-4">
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">ESI Configuration</span>
                            {esiConfigLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />}
                            {!esiConfigLoading && form.ccCode && form.esiEmpPct && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Loaded from config</span>
                            )}
                            {!esiConfigLoading && form.ccCode && !form.esiEmpPct && (
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">No ESI configuration found for this cost centre</span>
                            )}
                            {!form.ccCode && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">Select a cost centre to load ESI config</span>
                            )}
                        </div>
                        {form.esiEmpPct ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <Label>Employee ESI %</Label>
                                    <input type="number" step="0.01" className={inputCls} value={form.esiEmpPct} onChange={e => setField('esiEmpPct', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Employer ESI %</Label>
                                    <input type="number" step="0.01" className={inputCls} value={form.esiEmprPct} onChange={e => setField('esiEmprPct', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Applicability Limit (₹)</Label>
                                    <input type="number" className={inputCls} value={form.esiApplicabilityAmt} onChange={e => setField('esiApplicabilityAmt', e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label>ESI Exemption</Label>
                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                        <input
                                            type="checkbox" checked={form.esiCeilingApply}
                                            onChange={e => setField('esiCeilingApply', e.target.checked)}
                                            className="w-4 h-4 accent-orange-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Auto-exempt &gt;₹{Number(form.esiApplicabilityAmt || 0).toLocaleString('en-IN')}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* PT Configuration — only rendered when configured for this CC */}
                    {(ptLoading || ptConfig) && (
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-3 mt-4">
                                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Professional Tax (PT)</span>
                                {ptLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-500" />}
                                {!ptLoading && ptConfig && (
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Loaded from config</span>
                                )}
                            </div>
                            {ptConfig && (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-5 text-xs text-gray-600 dark:text-gray-300">
                                        <span>Payment Cycle: <strong className="text-teal-700 dark:text-teal-400">{ptConfig.PaymentCycle}</strong></span>
                                        <span>Effective From: <strong>{ptConfig.EffectiveFrom || '—'}</strong></span>
                                        {ptConfig.GenderBased && <span className="text-violet-600 dark:text-violet-400 font-semibold">Gender-Based slabs</span>}
                                    </div>
                                    {ptSlabs.length > 0 && (
                                        <div className="overflow-x-auto rounded-xl border border-teal-100 dark:border-teal-800">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-teal-50 dark:bg-teal-900/20">
                                                        {[
                                                            ...(ptConfig.GenderBased ? ['Gender'] : []),
                                                            'Income From (₹)', 'Income To (₹)', `PT Amount (₹/${ptConfig.PaymentCycle})`,
                                                        ].map(h => (
                                                            <th key={h} className="px-3 py-2 text-left font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-teal-50 dark:divide-teal-900/20">
                                                    {ptSlabs.map((slab, i) => (
                                                        <tr key={i} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/10">
                                                            {ptConfig.GenderBased && <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{slab.Gender}</td>}
                                                            <td className="px-3 py-1.5 text-gray-700 dark:text-gray-200">₹{Number(slab.SlabFrom).toLocaleString('en-IN')}</td>
                                                            <td className="px-3 py-1.5 text-gray-700 dark:text-gray-200">
                                                                {slab.SlabTo != null ? `₹${Number(slab.SlabTo).toLocaleString('en-IN')}` : <span className="text-gray-400 italic">No cap</span>}
                                                            </td>
                                                            <td className="px-3 py-1.5 font-semibold text-teal-700 dark:text-teal-400">
                                                                {parseFloat(slab.PTAmount) === 0 ? 'Nil' : `₹${fmt(slab.PTAmount)}`}
                                                                {slab.SpecialMonthNo != null && (
                                                                    <span className="ml-2 text-xs font-normal text-gray-400">
                                                                        ({MONTH_ABBR[parseInt(slab.SpecialMonthNo) - 1]}: ₹{fmt(slab.SpecialMonthAmount ?? slab.PTAmount)})
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* LWF Configuration — only rendered when configured for this CC */}
                    {(lwfLoading || lwfConfig) && (
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-3 mt-4">
                                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Labour Welfare Fund (LWF)</span>
                                {lwfLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />}
                                {!lwfLoading && lwfConfig && (
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Loaded from config</span>
                                )}
                            </div>
                            {lwfConfig && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label>Payment Cycle</Label>
                                        <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">{lwfConfig.PaymentCycle}</div>
                                    </div>
                                    <div>
                                        <Label>Employee LWF (₹)</Label>
                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">₹{fmt(lwfConfig.EmpLWFAmt)}</div>
                                    </div>
                                    <div>
                                        <Label>Employer LWF (₹)</Label>
                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">₹{fmt(lwfConfig.EmprLWFAmt)}</div>
                                    </div>
                                    <div>
                                        <Label>Deduction Months</Label>
                                        <div className="text-sm text-gray-700 dark:text-gray-200">
                                            {lwfConfig.DeductionMonths
                                                ? String(lwfConfig.DeductionMonths).split(',').map(m => MONTH_ABBR[parseInt(m.trim()) - 1]).filter(Boolean).join(', ')
                                                : <span className="text-gray-500 italic">Every month</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </SectionCard>

            {form.ccCode && (
                <SectionCard title={`Govt Min. Wage Rates — ${form.ccCode}`} icon={IndianRupee}>
                    {minWageLoading ? (
                        <div className="py-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-indigo-500" /></div>
                    ) : (
                        <GovtRateTable minWageData={minWageData} />
                    )}
                </SectionCard>
            )}

            <SectionCard title="Attendance Excel Upload" icon={FileSpreadsheet}>
                <div className="p-6 md:p-8 space-y-4">
                    <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Excel columns: <strong>LabourId, LabourName, Category (SK/SSK/USK/HSK), Designation</strong>,
                                then attendance day columns (P=Present, H=Holiday, HD=Half Day, A=Absent),
                                then <strong>GrossAmount</strong> (total gross pay for the period),
                                then <strong>Advance</strong> (advance already paid — leave 0 if none).
                            </p>
                        </div>
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold transition-all shadow-sm"
                        >
                            <Download className="h-3.5 w-3.5" /> Download Template
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer">
                            <div className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-all',
                                'border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400',
                                'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                            )}>
                                <FileSpreadsheet className="h-4 w-4" />
                                {excelFile ? excelFile.name : 'Choose Excel File (.xlsx / .xls)'}
                            </div>
                            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                        </label>
                        {excelFile && parsedRows.length > 0 && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                ✓ {parsedRows.length} rows parsed
                            </span>
                        )}
                    </div>

                    {parseError && (
                        <div className="flex items-center gap-2 text-rose-500 text-xs">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {parseError}
                        </div>
                    )}

                    {parsedRows.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/40">
                                        {['#','Labour ID','Name','Category','Designation','Days Worked','Gross Amount','Advance'].map(h => (
                                            <th key={h} className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {parsedRows.map((r, i) => (
                                        <tr key={r.LabourId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                                            <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-200">{r.LabourId}</td>
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{r.LabourName}</td>
                                            <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold">{r.Category}</span></td>
                                            <td className="px-3 py-2 text-gray-500">{r.Designation || '—'}</td>
                                            <td className="px-3 py-2 text-center font-medium">{r.DaysWorked}</td>
                                            <td className="px-3 py-2 text-right font-medium">₹{fmt(r.GrossAmount)}</td>
                                            <td className="px-3 py-2 text-right font-medium text-rose-600 dark:text-rose-400">
                                                {r.Advance > 0 ? `₹${fmt(r.Advance)}` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Btn
                            onClick={handleUpload}
                            loading={stagingLoading}
                            disabled={!parsedRows.length || !form.ccCode}
                        >
                            <Upload className="h-3.5 w-3.5" /> Upload & Continue to Preview
                        </Btn>
                    </div>
                    {stagingError && (
                        <p className="text-xs text-rose-500">{stagingError}</p>
                    )}
                </div>
            </SectionCard>
        </div>
    );

    // ── Wage calculation
    const calcRow = (r) => {
        const ov = overrides[r.LabourId] || {};

        const minWageEntry = minWageData
            .filter(m => m.Category === r.Category && m.Status === 'Active')
            .sort((a, b) => new Date(b.EffectiveDate || b.EffectiveFrom || 0) - new Date(a.EffectiveDate || a.EffectiveFrom || 0))[0];
        const govtRate    = parseFloat(r.GovtRate) || parseFloat(minWageEntry?.DailyRate) || 0;
        const grossAmount = parseFloat(r.GrossAmount) || 0;
        const days        = parseFloat(r.DaysWorked) || 0;

        const basicWage = Math.round(govtRate * days * 100) / 100;
        const allowance = Math.round((grossAmount - basicWage) * 100) / 100;

        const pfApply       = ov.pfApplicable !== false;
        const esiCeilExempt = form.esiCeilingApply && basicWage > (parseFloat(form.esiApplicabilityAmt) || 21000);
        const esiApply      = !esiCeilExempt && ov.esiApplicable !== false;

        const pfCeilingBase = form.pfCeiling
            ? Math.min(basicWage, parseFloat(form.pfCeilingAmt) || 0)
            : basicWage;

        const pfEmprTotal = (parseFloat(form.pfEPS_Pct) || 0) + (parseFloat(form.pfEPF_Pct) || 0)
            + (parseFloat(form.pfEDLI_Pct) || 0) + (parseFloat(form.pfAdminCharge_Pct) || 0);
        const pfEmp  = pfApply  ? Math.round(basicWage    * (parseFloat(form.pfEmpPct) || 0) / 100) : 0;
        const pfEmpr = pfApply  ? Math.round(pfCeilingBase * pfEmprTotal               / 100) : 0;
        const esiEmp  = esiApply ? Math.ceil(basicWage     * (parseFloat(form.esiEmpPct)  || 0) / 100) : 0;
        const esiEmpr = esiApply ? Math.ceil(basicWage     * (parseFloat(form.esiEmprPct) || 0) / 100) : 0;

        const advance          = parseFloat(ov.advance)        || 0;
        const otherAllow       = parseFloat(ov.otherAllowance) || 0;

        // PT calculation — match income against active slabs
        let ptEmp = 0;
        if (ptSlabs.length > 0) {
            const incomeForPT = basicWage;
            const matchSlab = [...ptSlabs]
                .sort((a, b) => a.SlabFrom - b.SlabFrom)
                .find(s => incomeForPT >= s.SlabFrom && (s.SlabTo == null || incomeForPT <= s.SlabTo));
            if (matchSlab) {
                const isSpecial = matchSlab.SpecialMonthNo != null && parseInt(matchSlab.SpecialMonthNo) === form.month;
                ptEmp = isSpecial && matchSlab.SpecialMonthAmount != null
                    ? parseFloat(matchSlab.SpecialMonthAmount) || 0
                    : parseFloat(matchSlab.PTAmount) || 0;
            }
        }

        // LWF calculation — flat amount, only in configured deduction months
        let lwfEmp = 0, lwfEmpr = 0;
        if (lwfConfig) {
            const deductMonths = lwfConfig.DeductionMonths
                ? String(lwfConfig.DeductionMonths).split(',').map(m => parseInt(m.trim())).filter(Boolean)
                : [];
            const applyLWF = deductMonths.length === 0 || deductMonths.includes(form.month);
            if (applyLWF) {
                lwfEmp  = parseFloat(lwfConfig.EmpLWFAmt)  || 0;
                lwfEmpr = parseFloat(lwfConfig.EmprLWFAmt) || 0;
            }
        }

        const basicPayable     = Math.round((basicWage - pfEmp - esiEmp - ptEmp - lwfEmp) * 100) / 100;
        const allowancePayable = Math.round((allowance - advance + otherAllow) * 100) / 100;
        const netPayable       = Math.round((basicPayable + allowancePayable) * 100) / 100;

        return { govtRate, grossAmount, basicWage, allowance, pfEmp, pfEmpr, esiEmp, esiEmpr, ptEmp, lwfEmp, lwfEmpr, advance, otherAllow, basicPayable, allowancePayable, netPayable, pfApply, esiApply };
    };

    // ── Step 1: Preview + live calculation
    const renderPreview = () => {
        const validRows = previewRows.filter(r => r.ValidationStatus === 'Valid');
        const calcAll   = previewRows.map(r => ({ ...r, ...calcRow(r), isValid: r.ValidationStatus === 'Valid' }));
        const validCalc = calcAll.filter(r => r.isValid);

        const hasPT  = ptSlabs.length > 0;
        const hasLWF = !!lwfConfig;

        const sum = (key) => validCalc.reduce((s, r) => s + (r[key] || 0), 0);
        const grandTotal = {
            grossAmount: sum('grossAmount'), basicWage: sum('basicWage'), allowance: sum('allowance'),
            pfEmp: sum('pfEmp'), pfEmpr: sum('pfEmpr'), esiEmp: sum('esiEmp'), esiEmpr: sum('esiEmpr'),
            ptEmp: sum('ptEmp'), lwfEmp: sum('lwfEmp'), lwfEmpr: sum('lwfEmpr'),
            advance: sum('advance'), otherAllow: sum('otherAllow'),
            basicPayable: sum('basicPayable'), allowancePayable: sum('allowancePayable'), netPayable: sum('netPayable'),
        };

        const cats = ['SK','SSK','USK','HSK'];
        const catTotals = cats.map(cat => {
            const rows = validCalc.filter(r => r.Category === cat);
            if (!rows.length) return null;
            const cs = (key) => rows.reduce((s, r) => s + (r[key] || 0), 0);
            return { cat, workers: rows.length, grossAmount: cs('grossAmount'), basicWage: cs('basicWage'),
                allowance: cs('allowance'), pfEmp: cs('pfEmp'), pfEmpr: cs('pfEmpr'),
                esiEmp: cs('esiEmp'), esiEmpr: cs('esiEmpr'),
                ptEmp: cs('ptEmp'), lwfEmp: cs('lwfEmp'), lwfEmpr: cs('lwfEmpr'),
                advance: cs('advance'), otherAllow: cs('otherAllow'),
                basicPayable: cs('basicPayable'), allowancePayable: cs('allowancePayable'), netPayable: cs('netPayable') };
        }).filter(Boolean);

        // Labour-type-wise grouping for summary
        const typeGroups = [];
        const ownRows = validCalc.filter(r => !r.LabourType || r.LabourType === 'Own Labour');
        if (ownRows.length) {
            const cs = (key) => ownRows.reduce((s, r) => s + (r[key] || 0), 0);
            typeGroups.push({
                key: '__own__', label: 'Own Labour', isOwn: true, workers: ownRows.length,
                grossAmount: cs('grossAmount'), basicWage: cs('basicWage'), allowance: cs('allowance'),
                pfEmp: cs('pfEmp'), pfEmpr: cs('pfEmpr'), esiEmp: cs('esiEmp'), esiEmpr: cs('esiEmpr'),
                ptEmp: cs('ptEmp'), lwfEmp: cs('lwfEmp'), lwfEmpr: cs('lwfEmpr'),
                advance: cs('advance'), otherAllow: cs('otherAllow'),
                basicPayable: cs('basicPayable'), allowancePayable: cs('allowancePayable'), netPayable: cs('netPayable'),
            });
        }
        const ctrMap = {};
        validCalc.filter(r => r.LabourType && r.LabourType !== 'Own Labour').forEach(r => {
            const name = r.ContractorName || 'Unknown';
            if (!ctrMap[name]) ctrMap[name] = [];
            ctrMap[name].push(r);
        });
        Object.entries(ctrMap).forEach(([name, rows]) => {
            const cs = (key) => rows.reduce((s, r) => s + (r[key] || 0), 0);
            typeGroups.push({
                key: `__ctr__${name}`, label: `Contractor — ${name}`, isOwn: false, workers: rows.length,
                grossAmount: cs('grossAmount'), basicWage: cs('basicWage'), allowance: cs('allowance'),
                pfEmp: cs('pfEmp'), pfEmpr: cs('pfEmpr'), esiEmp: cs('esiEmp'), esiEmpr: cs('esiEmpr'),
                ptEmp: cs('ptEmp'), lwfEmp: cs('lwfEmp'), lwfEmpr: cs('lwfEmpr'),
                advance: cs('advance'), otherAllow: cs('otherAllow'),
                basicPayable: cs('basicPayable'), allowancePayable: cs('allowancePayable'), netPayable: cs('netPayable'),
            });
        });

        const th  = 'px-2 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap text-center';
        const thl = 'px-2 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap text-left';
        const td  = 'px-2 py-2 text-xs text-right text-gray-700 dark:text-gray-200';
        const numInput = 'w-20 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 text-right';

        const handleDownloadPreviewExcel = () => {
            const headers = [
                '#', 'Labour ID', 'Name', 'Category', 'Labour Type', 'Contractor',
                'Days', 'Gross Amount', 'Govt Rate/Day', 'Basic Wage', 'Allowance',
                'PF Emp (₹)', 'PF Empr (₹)', 'ESI Emp (₹)', 'ESI Empr (₹)',
                'Advance', 'Other Allow', 'Basic Payable', 'Allow. Payable', 'Net Payable', 'Status',
            ];
            const aoa = [headers];
            let lastGroupKey = null;
            let rowNum = 0;
            calcAll.forEach(r => {
                const isOwn = !r.LabourType || r.LabourType === 'Own Labour';
                const groupKey = isOwn ? '__own__' : `__ctr__${r.ContractorName || ''}`;
                if (groupKey !== lastGroupKey) {
                    lastGroupKey = groupKey;
                    aoa.push(['', isOwn ? '-- Own Labour --' : `-- Contractor: ${r.ContractorName || 'Unknown'} --`]);
                }
                rowNum++;
                aoa.push([
                    rowNum, r.LabourId, r.LabourName, r.Category,
                    r.LabourType || 'Own Labour', r.ContractorName || '',
                    r.DaysWorked, r.grossAmount, r.govtRate || 0, r.basicWage, r.allowance,
                    r.pfApply ? r.pfEmp : 0, r.pfApply ? r.pfEmpr : 0,
                    r.esiApply ? r.esiEmp : 0, r.esiApply ? r.esiEmpr : 0,
                    r.advance, r.otherAllow,
                    r.isValid ? r.basicPayable : '', r.isValid ? r.allowancePayable : '', r.isValid ? r.netPayable : '',
                    r.ValidationStatus,
                ]);
            });
            const gsum = (key) => validCalc.reduce((s, r) => s + (r[key] || 0), 0);
            aoa.push([]);
            aoa.push([
                '', 'GRAND TOTAL', `${validCalc.length} workers`, '', '', '', '',
                gsum('grossAmount'), '', gsum('basicWage'), gsum('allowance'),
                gsum('pfEmp'), gsum('pfEmpr'), gsum('esiEmp'), gsum('esiEmpr'),
                gsum('advance'), gsum('otherAllow'),
                gsum('basicPayable'), gsum('allowancePayable'), gsum('netPayable'), '',
            ]);
            const ws = XLSX.utils.aoa_to_sheet(aoa);
            ws['!cols'] = [
                {wch:4},{wch:12},{wch:22},{wch:6},{wch:14},{wch:20},
                {wch:6},{wch:12},{wch:12},{wch:12},{wch:12},
                {wch:11},{wch:11},{wch:11},{wch:11},
                {wch:10},{wch:10},{wch:12},{wch:12},{wch:12},{wch:18},
            ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Payroll Preview');
            const monthName = MONTHS.find(m => m.v === form.month)?.l || form.month;
            XLSX.writeFile(wb, `LabourPayroll_Preview_${form.ccCode}_${monthName}_${form.year}.xlsx`);
        };

        return (
            <div className="space-y-6">
                {previewRows.some(r => r.ValidationStatus !== 'Valid') && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        Workers marked <strong className="mx-1">Not Found / Not Approved</strong> are shown in red and excluded from the payroll.
                    </div>
                )}

                <SectionCard
                    title={`Labour-wise Payroll Calculation — ${validRows.length} Valid / ${previewRows.length} Total Workers`}
                    icon={Users}
                    titleRight={
                        <button
                            onClick={handleDownloadPreviewExcel}
                            disabled={!calcAll.length}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-sm"
                        >
                            <Download className="h-3.5 w-3.5" /> Download Excel
                        </button>
                    }
                >
                    {previewLoading ? (
                        <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
                    ) : previewError ? (
                        <p className="p-6 text-rose-500 text-sm">{previewError}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-900/60">
                                        <th colSpan={5} className={cn(thl, 'text-gray-500 border-r border-gray-200 dark:border-gray-600')}>Worker Info</th>
                                        <th colSpan={4} className={cn(th, 'text-blue-600 dark:text-blue-400 border-r border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20')}>Wage Breakup</th>
                                        <th colSpan={4} className={cn(th, 'text-purple-600 dark:text-purple-400 border-r border-gray-200 dark:border-gray-600 bg-purple-50 dark:bg-purple-900/20')}>PF</th>
                                        <th colSpan={4} className={cn(th, 'text-orange-600 dark:text-orange-400 border-r border-gray-200 dark:border-gray-600 bg-orange-50 dark:bg-orange-900/20')}>ESI</th>
                                        {hasPT  && <th colSpan={1} className={cn(th, 'text-teal-600 dark:text-teal-400 border-r border-gray-200 dark:border-gray-600 bg-teal-50 dark:bg-teal-900/20')}>PT</th>}
                                        {hasLWF && <th colSpan={2} className={cn(th, 'text-rose-600 dark:text-rose-400 border-r border-gray-200 dark:border-gray-600 bg-rose-50 dark:bg-rose-900/20')}>LWF</th>}
                                        <th colSpan={2} className={cn(th, 'text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600')}>Adjustments</th>
                                        <th colSpan={3} className={cn(th, 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20')}>Payable</th>
                                    </tr>
                                    <tr className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                                        <th className={cn(thl, 'text-gray-400')}>#</th>
                                        <th className={cn(thl, 'text-gray-500')}>Labour ID</th>
                                        <th className={cn(thl, 'text-gray-500')}>Name</th>
                                        <th className={cn(th,  'text-gray-500')}>Cat</th>
                                        <th className={cn(th,  'text-gray-500 border-r border-gray-200 dark:border-gray-600')}>Days</th>

                                        <th className={cn(th,  'text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 font-extrabold')}>Gross Amount</th>
                                        <th className={cn(th,  'text-blue-500 bg-blue-50/50 dark:bg-blue-900/10')}>Govt Rate / Day</th>
                                        <th className={cn(th,  'text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 font-extrabold')}>Basic Wage</th>
                                        <th className={cn(th,  'text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 border-r border-gray-200 dark:border-gray-600')}>Allowance</th>

                                        <th className={cn(th,  'text-purple-500 bg-purple-50/50 dark:bg-purple-900/10')}>Apply</th>
                                        <th className={cn(th,  'text-purple-600 bg-purple-50/50 dark:bg-purple-900/10')}>Emp %</th>
                                        <th className={cn(th,  'text-purple-600 bg-purple-50/50 dark:bg-purple-900/10')}>Emp (₹)</th>
                                        <th className={cn(th,  'text-purple-600 bg-purple-50/50 dark:bg-purple-900/10 border-r border-gray-200 dark:border-gray-600')}>Empr (₹)</th>

                                        <th className={cn(th,  'text-orange-500 bg-orange-50/50 dark:bg-orange-900/10')}>Apply</th>
                                        <th className={cn(th,  'text-orange-600 bg-orange-50/50 dark:bg-orange-900/10')}>Emp %</th>
                                        <th className={cn(th,  'text-orange-600 bg-orange-50/50 dark:bg-orange-900/10')}>Emp (₹)</th>
                                        <th className={cn(th,  'text-orange-600 bg-orange-50/50 dark:bg-orange-900/10 border-r border-gray-200 dark:border-gray-600')}>Empr (₹)</th>

                                        {hasPT  && <th className={cn(th, 'text-teal-600 bg-teal-50/50 dark:bg-teal-900/10 border-r border-gray-200 dark:border-gray-600')}>PT (₹)</th>}
                                        {hasLWF && <th className={cn(th, 'text-rose-500 bg-rose-50/50 dark:bg-rose-900/10')}>Emp (₹)</th>}
                                        {hasLWF && <th className={cn(th, 'text-rose-600 bg-rose-50/50 dark:bg-rose-900/10 border-r border-gray-200 dark:border-gray-600')}>Empr (₹)</th>}

                                        <th className={cn(th,  'text-gray-500')}>Advance (₹)</th>
                                        <th className={cn(th,  'text-gray-500 border-r border-gray-200 dark:border-gray-600')}>Other (₹)</th>

                                        <th className={cn(th,  'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10')}>Basic Pay</th>
                                        <th className={cn(th,  'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10')}>Allow. Pay</th>
                                        <th className={cn(th,  'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 font-extrabold')}>Net Payable</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {(() => {
                                        const rows = [];
                                        let lastGroupKey = null;
                                        let rowNum = 0;
                                        calcAll.forEach(r => {
                                            const isOwn = !r.LabourType || r.LabourType === 'Own Labour';
                                            const groupKey = isOwn ? '__own__' : `__ctr__${r.ContractorName || ''}`;
                                            if (groupKey !== lastGroupKey) {
                                                lastGroupKey = groupKey;
                                                const totalCols = 22 + (hasPT ? 1 : 0) + (hasLWF ? 2 : 0);
                                                rows.push(
                                                    <tr key={`grp-${groupKey}`} className="bg-indigo-50/80 dark:bg-indigo-900/30">
                                                        <td colSpan={totalCols} className="px-3 py-1.5 border-t-2 border-indigo-200 dark:border-indigo-700">
                                                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                                                                {isOwn ? 'Own Labour' : `Contractor — ${r.ContractorName || 'Unknown'}`}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            rowNum++;
                                            const ov = overrides[r.LabourId] || {};
                                            rows.push(
                                                <tr key={r.LabourId} className={cn(
                                                    'hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10',
                                                    !r.isValid && 'bg-rose-50/60 dark:bg-rose-900/10 opacity-60'
                                                )}>
                                                    <td className="px-2 py-2 text-gray-400">{rowNum}</td>
                                                    <td className="px-2 py-2 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">{r.LabourId}</td>
                                                    <td className="px-2 py-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">{r.LabourName}</td>
                                                    <td className="px-2 py-2 text-center">
                                                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold">{r.Category}</span>
                                                    </td>
                                                    <td className="px-2 py-2 text-center font-medium text-gray-700 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">{r.DaysWorked}</td>

                                                    <td className="px-2 py-2 text-right text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-900/5">₹{fmt(r.grossAmount)}</td>
                                                    <td className="px-2 py-2 text-right text-xs text-gray-500 dark:text-gray-400 bg-blue-50/30 dark:bg-blue-900/5">₹{fmt(r.govtRate || 0)}</td>
                                                    <td className="px-2 py-2 text-right text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-900/5">₹{fmt(r.basicWage)}</td>
                                                    <td className="px-2 py-2 text-right text-xs text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/5 border-r border-gray-100 dark:border-gray-700">₹{fmt(r.allowance)}</td>

                                                    <td className="px-2 py-2 text-center bg-purple-50/30 dark:bg-purple-900/5">
                                                        <input type="checkbox"
                                                            checked={ov.pfApplicable !== false}
                                                            onChange={e => setOverride(r.LabourId, 'pfApplicable', e.target.checked)}
                                                            className="w-3.5 h-3.5 accent-purple-600"
                                                            disabled={!r.isValid} />
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-xs text-purple-500 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-900/5">{r.pfApply ? `${form.pfEmpPct}%` : '—'}</td>
                                                    <td className={cn('bg-purple-50/30 dark:bg-purple-900/5', r.pfApply ? 'px-2 py-2 text-right text-xs text-purple-700 dark:text-purple-300 font-semibold' : td + ' text-gray-300 dark:text-gray-600')}>
                                                        {r.pfApply ? `₹${fmt(r.pfEmp)}` : '—'}
                                                    </td>
                                                    <td className={cn('bg-purple-50/30 dark:bg-purple-900/5 border-r border-gray-100 dark:border-gray-700', r.pfApply ? 'px-2 py-2 text-right text-xs text-purple-600 dark:text-purple-400' : td + ' text-gray-300 dark:text-gray-600')}>
                                                        {r.pfApply ? `₹${fmt(r.pfEmpr)}` : '—'}
                                                    </td>

                                                    <td className="px-2 py-2 text-center bg-orange-50/30 dark:bg-orange-900/5">
                                                        <input type="checkbox"
                                                            checked={ov.esiApplicable !== false}
                                                            onChange={e => setOverride(r.LabourId, 'esiApplicable', e.target.checked)}
                                                            className="w-3.5 h-3.5 accent-orange-500"
                                                            disabled={!r.isValid} />
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-xs text-orange-500 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-900/5">{r.esiApply ? `${form.esiEmpPct}%` : '—'}</td>
                                                    <td className={cn('bg-orange-50/30 dark:bg-orange-900/5', r.esiApply ? 'px-2 py-2 text-right text-xs text-orange-700 dark:text-orange-300 font-semibold' : td + ' text-gray-300 dark:text-gray-600')}>
                                                        {r.esiApply ? `₹${fmt(r.esiEmp)}` : '—'}
                                                    </td>
                                                    <td className={cn('bg-orange-50/30 dark:bg-orange-900/5 border-r border-gray-100 dark:border-gray-700', r.esiApply ? 'px-2 py-2 text-right text-xs text-orange-600 dark:text-orange-400' : td + ' text-gray-300 dark:text-gray-600')}>
                                                        {r.esiApply ? `₹${fmt(r.esiEmpr)}` : '—'}
                                                    </td>

                                                    {hasPT && (
                                                        <td className="px-2 py-2 text-right text-xs bg-teal-50/30 dark:bg-teal-900/5 border-r border-gray-100 dark:border-gray-700">
                                                            {r.ptEmp > 0
                                                                ? <span className="font-semibold text-teal-700 dark:text-teal-400">₹{fmt(r.ptEmp)}</span>
                                                                : <span className="text-gray-300 dark:text-gray-600">Nil</span>}
                                                        </td>
                                                    )}
                                                    {hasLWF && (
                                                        <>
                                                            <td className="px-2 py-2 text-right text-xs bg-rose-50/30 dark:bg-rose-900/5">
                                                                {r.lwfEmp > 0 ? <span className="font-semibold text-rose-600 dark:text-rose-400">₹{fmt(r.lwfEmp)}</span> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                                            </td>
                                                            <td className="px-2 py-2 text-right text-xs bg-rose-50/30 dark:bg-rose-900/5 border-r border-gray-100 dark:border-gray-700">
                                                                {r.lwfEmpr > 0 ? <span className="text-rose-500">₹{fmt(r.lwfEmpr)}</span> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                                            </td>
                                                        </>
                                                    )}

                                                    <td className="px-2 py-2">
                                                        <input type="number" min="0" step="0.01" className={numInput}
                                                            placeholder="0" value={ov.advance || ''}
                                                            onChange={e => setOverride(r.LabourId, 'advance', e.target.value)}
                                                            disabled={!r.isValid} />
                                                    </td>
                                                    <td className="px-2 py-2 border-r border-gray-100 dark:border-gray-700">
                                                        <input type="number" min="0" step="0.01" className={numInput}
                                                            placeholder="0" value={ov.otherAllowance || ''}
                                                            onChange={e => setOverride(r.LabourId, 'otherAllowance', e.target.value)}
                                                            disabled={!r.isValid} />
                                                    </td>

                                                    <td className="px-2 py-2 text-right text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10">
                                                        {r.isValid ? `₹${fmt(r.basicPayable)}` : '—'}
                                                    </td>
                                                    <td className="px-2 py-2 text-right text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10">
                                                        {r.isValid ? `₹${fmt(r.allowancePayable)}` : '—'}
                                                    </td>
                                                    <td className="px-2 py-2 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10">
                                                        {r.isValid ? `₹${fmt(r.netPayable)}` : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        });
                                        return rows;
                                    })()}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-500 font-bold">
                                        <td colSpan={5} className="px-2 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                                            Grand Total — {validCalc.length} workers
                                        </td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-blue-700 dark:text-blue-300">₹{fmt(grandTotal.grossAmount)}</td>
                                        <td className="px-2 py-2.5 text-right text-xs text-gray-400"></td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-blue-700 dark:text-blue-300">₹{fmt(grandTotal.basicWage)}</td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-blue-600 dark:text-blue-400">₹{fmt(grandTotal.allowance)}</td>
                                        <td colSpan={2} className="px-2 py-2.5 text-right text-xs text-gray-400"></td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-purple-700 dark:text-purple-300">₹{fmt(grandTotal.pfEmp)}</td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-purple-600 dark:text-purple-400">₹{fmt(grandTotal.pfEmpr)}</td>
                                        <td colSpan={2} className="px-2 py-2.5 text-right text-xs text-gray-400"></td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-orange-700 dark:text-orange-300">₹{fmt(grandTotal.esiEmp)}</td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-orange-600 dark:text-orange-400">₹{fmt(grandTotal.esiEmpr)}</td>
                                        {hasPT  && <td className="px-2 py-2.5 text-right text-xs font-bold text-teal-700 dark:text-teal-400">₹{fmt(grandTotal.ptEmp)}</td>}
                                        {hasLWF && <td className="px-2 py-2.5 text-right text-xs font-bold text-rose-600 dark:text-rose-400">₹{fmt(grandTotal.lwfEmp)}</td>}
                                        {hasLWF && <td className="px-2 py-2.5 text-right text-xs font-bold text-rose-500">₹{fmt(grandTotal.lwfEmpr)}</td>}
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-gray-700 dark:text-gray-200">₹{fmt(grandTotal.advance)}</td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-gray-700 dark:text-gray-200">₹{fmt(grandTotal.otherAllow)}</td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{fmt(grandTotal.basicPayable)}</td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{fmt(grandTotal.allowancePayable)}</td>
                                        <td className="px-2 py-2.5 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{fmt(grandTotal.netPayable)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </SectionCard>

                {typeGroups.length > 0 && (
                    <SectionCard title="Labour Type Summary" icon={Users}>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {typeGroups.map(g => (
                                <div key={g.key} className={cn(
                                    'rounded-xl border p-4',
                                    g.isOwn
                                        ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-900/10'
                                        : 'border-teal-200 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-900/10'
                                )}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={cn(
                                            'px-2 py-0.5 rounded-lg text-xs font-bold',
                                            g.isOwn
                                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                                                : 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
                                        )}>
                                            {g.label}
                                        </span>
                                        <span className="text-xs text-gray-500">{g.workers} workers</span>
                                    </div>
                                    {[
                                        ['Gross Amount',   g.grossAmount,      'text-blue-700 dark:text-blue-300'],
                                        ['Basic Wage',     g.basicWage,        'text-blue-600 dark:text-blue-400'],
                                        ['Allowance',      g.allowance,        'text-blue-500'],
                                        ['PF Employee',    g.pfEmp,            'text-purple-600 dark:text-purple-400'],
                                        ['PF Employer',    g.pfEmpr,           'text-purple-500'],
                                        ['ESI Employee',   g.esiEmp,           'text-orange-600 dark:text-orange-400'],
                                        ['ESI Employer',   g.esiEmpr,          'text-orange-500'],
                                        ...(hasPT  ? [['PT (Employee)', g.ptEmp,   'text-teal-600 dark:text-teal-400']] : []),
                                        ...(hasLWF ? [['LWF Employee',  g.lwfEmp,  'text-rose-600 dark:text-rose-400'],
                                                      ['LWF Employer',  g.lwfEmpr, 'text-rose-500']] : []),
                                        ['Advance',        g.advance,          'text-gray-600 dark:text-gray-400'],
                                        ['Other Allow',    g.otherAllow,       'text-gray-600 dark:text-gray-400'],
                                        ['Basic Payable',  g.basicPayable,     'text-emerald-600 dark:text-emerald-400'],
                                        ['Allow. Payable', g.allowancePayable, 'text-emerald-500'],
                                    ].map(([label, val, cls]) => (
                                        <div key={label} className="flex justify-between text-xs py-0.5">
                                            <span className="text-gray-500 dark:text-gray-400">{label}</span>
                                            <span className={cls}>₹{fmt(val)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-xs font-bold border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                                        <span className="text-gray-700 dark:text-gray-200">Net Payable</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">₹{fmt(g.netPayable)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {catTotals.length > 0 && (
                    <SectionCard title="Category-wise Summary" icon={Users}>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {catTotals.map(c => (
                                <div key={c.cat} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold">{c.cat}</span>
                                        <span className="text-xs text-gray-500">{c.workers} workers</span>
                                    </div>
                                    {[
                                        ['Gross Amount',     c.grossAmount,     'text-blue-700 dark:text-blue-300'],
                                        ['Basic Wage',       c.basicWage,       'text-blue-600 dark:text-blue-400'],
                                        ['Allowance',        c.allowance,       'text-blue-500'],
                                        ['PF Employee',      c.pfEmp,           'text-purple-600 dark:text-purple-400'],
                                        ['PF Employer',      c.pfEmpr,          'text-purple-500'],
                                        ['ESI Employee',     c.esiEmp,          'text-orange-600 dark:text-orange-400'],
                                        ['ESI Employer',     c.esiEmpr,         'text-orange-500'],
                                        ...(hasPT  ? [['PT (Employee)', c.ptEmp,   'text-teal-600 dark:text-teal-400']] : []),
                                        ...(hasLWF ? [['LWF Employee',  c.lwfEmp,  'text-rose-600 dark:text-rose-400'],
                                                      ['LWF Employer',  c.lwfEmpr, 'text-rose-500']] : []),
                                        ['Advance',          c.advance,         'text-gray-600 dark:text-gray-400'],
                                        ['Other Allow',      c.otherAllow,      'text-gray-600 dark:text-gray-400'],
                                        ['Basic Payable',    c.basicPayable,    'text-emerald-600 dark:text-emerald-400'],
                                        ['Allow. Payable',   c.allowancePayable,'text-emerald-500'],
                                    ].map(([label, val, cls]) => (
                                        <div key={label} className="flex justify-between text-xs py-0.5">
                                            <span className="text-gray-500 dark:text-gray-400">{label}</span>
                                            <span className={cls}>₹{fmt(val)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-xs font-bold border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                                        <span className="text-gray-700 dark:text-gray-200">Net Payable</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">₹{fmt(c.netPayable)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {lastGenerateError && (
                    <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-1">Generation Failed</p>
                                <p className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed">{lastGenerateError}</p>
                            </div>
                            <button onClick={() => setLastGenerateError('')}
                                className="text-rose-400 hover:text-rose-600 text-xs font-bold flex-shrink-0">✕</button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <Btn variant="secondary" onClick={() => setStep(0)}>
                        <RotateCcw className="h-3.5 w-3.5" /> Back
                    </Btn>
                    <Btn variant="success"
                        onClick={() => { setLastGenerateError(''); handleGenerate(); }}
                        loading={generateLoading}
                        disabled={!validCalc.length}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Generate & Submit for Approval
                    </Btn>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ───────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Users className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Labour Payroll Generation</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Upload attendance, configure deductions, and generate payroll</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {step > 0 && step < 2 && (
                                <button onClick={handleReset}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all">
                                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                                </button>
                            )}
                            <div className="hidden sm:flex items-center gap-2 text-indigo-200">
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wider">Module</p>
                                    <p className="text-sm font-bold text-white">HR / Payroll</p>
                                </div>
                                <Navigation className="h-5 w-5 opacity-60" />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <Steps current={step} />
                    </div>
                </div>
            </div>

            {/* ── Page Content ─────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto space-y-6">
                {step === 0 && renderSetup()}
                {step === 1 && renderPreview()}
                {step === 2 && (
                    summaryLoading
                        ? <div className="py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
                        : <SummaryView summary={summary} onReset={handleReset} />
                )}
            </div>
        </div>
    );
};

export default LabourPayrollGeneration;
