import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Settings, DollarSign, Users, BookOpen, CalendarDays,
    Plus, Pencil, Trash2, Save, Loader2, ChevronDown,
    X, Search, Filter, ShieldCheck, HeartPulse, Receipt, Briefcase,
} from 'lucide-react';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchAllCostCenters, fetchDCAForHR, fetchSubDCAByDCA,
    fetchMinWageConfig,   submitMinWageConfig,
    fetchDesignations,    submitDesignation,
    fetchWageComponents,  fetchWageAccountConfig, submitWageAccountConfig,
    fetchHolidays,        submitHoliday, removeHoliday,
    fetchPFConfig,        submitPFConfig,
    fetchESIConfig,       submitESIConfig,
    fetchPTConfig,        submitPTConfig,
    fetchPTSlabs,         submitPTSlab,   removePTSlab,
    fetchLWFConfig,       submitLWFConfig,
    clearSaveResult, clearPTSlabs, clearSubDca,
} from '../../slices/labourConfigSlice/labourConfigSlice';

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const selectCls = inputCls + ' appearance-none pr-10 cursor-pointer';

const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const SelectWrap = ({ children, loading }) => (
    <div className="relative">
        {children}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {loading
                ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
    </div>
);

const Btn = ({ onClick, disabled, loading, variant = 'primary', size = 'md', children, type = 'button' }) => {
    const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed';
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-2.5 text-sm' };
    const variants = {
        primary:   'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-300 shadow-md hover:shadow-lg',
        secondary: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-400',
        danger:    'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-100',
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled || loading}
            className={`${base} ${sizes[size]} ${variants[variant]}`}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {children}
        </button>
    );
};

const Badge = ({ children, color = 'gray' }) => {
    const colors = {
        green:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700',
        red:    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-700',
        blue:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-700',
        violet: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-700',
        gray:   'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]}`}>
            {children}
        </span>
    );
};

const SectionCard = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm ${className}`}>
        {children}
    </div>
);

const EmptyState = ({ message }) => (
    <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
        <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
        {message}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Reusable DCA + Sub-DCA selector pair (used in 3 tabs)
// ─────────────────────────────────────────────────────────────────────────────

const DCASelector = ({ dcaId, subDcaId, onDCAChange, onSubDCAChange, dcaList, dcaLoading, subDcaList, subDcaLoading }) => (
    <>
        <div>
            <Label>DCA</Label>
            <SelectWrap loading={dcaLoading}>
                <select
                    className={selectCls}
                    value={dcaId}
                    onChange={(e) => onDCAChange(e.target.value)}
                    disabled={dcaLoading}
                >
                    <option value="">— Select DCA —</option>
                    {dcaList.map(d => (
                        <option key={d.DCAID} value={d.DCAID}>{d.DCAIDSTR}</option>
                    ))}
                </select>
            </SelectWrap>
        </div>
        <div>
            <Label>Sub DCA</Label>
            <SelectWrap loading={subDcaLoading}>
                <select
                    className={selectCls}
                    value={subDcaId}
                    onChange={(e) => onSubDCAChange(e.target.value)}
                    disabled={subDcaLoading || !dcaId}
                >
                    <option value="">— Select Sub DCA —</option>
                    {subDcaList.map(s => (
                        <option key={s.SubDCAID} value={s.SubDCAID}>{s.SubDCAIDSTR}</option>
                    ))}
                </select>
            </SelectWrap>
        </div>
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'minwage',      label: 'Min. Wages',    icon: DollarSign  },
    { id: 'designations', label: 'Designations',  icon: Users       },
    { id: 'wageaccounts', label: 'Wage Accounts', icon: BookOpen    },
    { id: 'holidays',     label: 'Holidays',      icon: CalendarDays },
    { id: 'pfconfig',     label: 'PF Config',     icon: ShieldCheck },
    { id: 'esiconfig',    label: 'ESI Config',    icon: HeartPulse  },
    { id: 'ptconfig',     label: 'PT Config',     icon: Receipt     },
    { id: 'lwfconfig',    label: 'LWF Config',    icon: Briefcase   },
];

const CATEGORIES     = ['SK', 'SSK', 'USK', 'HSK'];
const HOLIDAY_TYPES  = ['National', 'Regional', 'Optional'];
const STATUS_OPTIONS = ['Active', 'Inactive'];
const PAYMENT_CYCLES = ['Monthly', 'HalfYearly', 'Annual'];
const PT_GENDERS     = ['All', 'Male', 'Female'];
const MONTH_NAMES    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — CC Wise Minimum Wages
// ─────────────────────────────────────────────────────────────────────────────

// Derive Active / Upcoming from EffectiveDate — active if date is today or in the past
// Handles DD/MM/YYYY (picker default) and YYYY-MM-DD (API may return either)
const isEffective = (dateStr) => {
    if (!dateStr) return false;
    let d;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        d = new Date(year, month - 1, day);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        d = new Date(year, month - 1, day);
    } else {
        d = new Date(dateStr);
    }
    if (isNaN(d)) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d <= today;
};

const MinWageTab = ({ userData, costCenters, costCentersLoading }) => {
    const dispatch = useDispatch();
    const { minWageData, minWageLoading, minWageError, saveLoading, saveResult, saveError } =
        useSelector((s) => s.labourConfig);

    const [filterCC,       setFilterCC]       = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showForm,       setShowForm]       = useState(false);

    // EffectiveDate stored as DD/MM/YYYY (CustomDatePicker default format)
    const BLANK_FORM = { ConfigId: 0, CCCode: '', Category: '', WageAmount: '', EffectiveDate: '' };
    const [form, setForm] = useState(BLANK_FORM);

    const load = useCallback(() => {
        dispatch(fetchMinWageConfig({ ccCode: filterCC || undefined, category: filterCategory || undefined }));
    }, [dispatch, filterCC, filterCategory]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (saveResult) {
            toast.success('Minimum wage saved successfully.');
            dispatch(clearSaveResult());
            setShowForm(false);
            setForm(BLANK_FORM);
            load();
        }
        if (saveError) { toast.error(saveError); dispatch(clearSaveResult()); }
    }, [saveResult, saveError]); // eslint-disable-line

    const handleEdit = (row) => {
        // Normalise EffectiveFrom to DD/MM/YYYY for the picker
        const raw = row.EffectiveFrom || '';
        let dateVal = '';
        if (raw) {
            if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
                // YYYY-MM-DD or ISO → DD/MM/YYYY
                const [y, m, d] = raw.substring(0, 10).split('-');
                dateVal = `${d}/${m}/${y}`;
            } else {
                dateVal = raw; // already DD/MM/YYYY
            }
        }
        setForm({
            ConfigId:      row.ConfigId   || 0,
            CCCode:        row.CCCode     || '',
            Category:      row.Category   || '',
            WageAmount:    row.DailyRate  != null ? String(row.DailyRate) : '',
            EffectiveDate: dateVal,
        });
        setShowForm(true);
    };

    // Convert any date value (DD/MM/YYYY string, YYYY-MM-DD string, or Date object) → YYYY-MM-DD
    const toApiDate = (val) => {
        if (!val) return '';
        // Date object
        if (val instanceof Date) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, '0');
            const d = String(val.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        const str = String(val);
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10); // already YYYY-MM-DD or ISO
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split('/');
            return `${y}-${m}-${d}`;
        }
        return str;
    };

    const handleSubmit = () => {
        const amount = parseFloat(String(form.WageAmount).trim());
        if (!form.CCCode || !form.Category || !form.EffectiveDate) {
            toast.warning('All fields are required.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            toast.warning('Please enter a valid wage amount.');
            return;
        }
        dispatch(submitMinWageConfig({
            ConfigId:      form.ConfigId || 0,
            CCCode:        form.CCCode,
            Category:      form.Category,
            DailyRate:     amount,
            EffectiveFrom: toApiDate(form.EffectiveDate),
            Status:        'Active',
            ActionBy:      userData?.userName || userData?.empCode || '',
        }));
    };

    return (
        <div className="space-y-5">
            {/* Filter bar */}
            <SectionCard>
                <div className="p-4 flex flex-wrap gap-3 items-end">
                    <div className="w-56">
                        <Label>Cost Centre</Label>
                        <SelectWrap loading={costCentersLoading}>
                            <select className={selectCls} value={filterCC} onChange={(e) => setFilterCC(e.target.value)}>
                                <option value="">All Cost Centres</option>
                                {costCenters.map(c => (
                                    <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>
                                ))}
                            </select>
                        </SelectWrap>
                    </div>
                    <div className="w-40">
                        <Label>Category</Label>
                        <SelectWrap>
                            <select className={selectCls} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                <option value="">All</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </SelectWrap>
                    </div>
                    <Btn onClick={load} loading={minWageLoading} variant="secondary">
                        <Filter className="h-3.5 w-3.5" />Apply
                    </Btn>
                    <div className="ml-auto">
                        <Btn onClick={() => { setForm(BLANK_FORM); setShowForm(true); }}>
                            <Plus className="h-3.5 w-3.5" />Add Row
                        </Btn>
                    </div>
                </div>
            </SectionCard>

            {/* Form */}
            {showForm && (
                <SectionCard>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {form.CCCode && form.Category ? 'Edit Minimum Wage' : 'Add Minimum Wage'}
                        </span>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label required>Cost Centre</Label>
                            <SelectWrap loading={costCentersLoading}>
                                <select className={selectCls} value={form.CCCode}
                                    onChange={(e) => setForm(p => ({ ...p, CCCode: e.target.value }))}>
                                    <option value="">— Select CC —</option>
                                    {costCenters.map(c => (
                                        <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>
                                    ))}
                                </select>
                            </SelectWrap>
                        </div>
                        <div>
                            <Label required>Category</Label>
                            <SelectWrap>
                                <select className={selectCls} value={form.Category}
                                    onChange={(e) => setForm(p => ({ ...p, Category: e.target.value }))}>
                                    <option value="">— Select —</option>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </SelectWrap>
                        </div>
                        <div>
                            <Label required>Wage Amount (₹)</Label>
                            <input
                                className={inputCls}
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={form.WageAmount}
                                onChange={(e) => setForm(p => ({ ...p, WageAmount: e.target.value }))}
                            />
                        </div>
                        <div>
                            <CustomDatePicker
                                label="Effective Date"
                                required
                                value={form.EffectiveDate}
                                onChange={(val) => {
                                    // Picker may return a Date object or a formatted string — normalise to string
                                    if (val instanceof Date) {
                                        const d = String(val.getDate()).padStart(2, '0');
                                        const m = String(val.getMonth() + 1).padStart(2, '0');
                                        const y = val.getFullYear();
                                        setForm(p => ({ ...p, EffectiveDate: `${d}/${m}/${y}` }));
                                    } else {
                                        setForm(p => ({ ...p, EffectiveDate: val || '' }));
                                    }
                                }}
                                placeholder="DD/MM/YYYY"
                                format="DD/MM/YYYY"
                            />
                        </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                        <Btn onClick={handleSubmit} loading={saveLoading}>
                            <Save className="h-3.5 w-3.5" />Save
                        </Btn>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                    </div>
                </SectionCard>
            )}

            {/* Table */}
            <SectionCard>
                {minWageLoading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                ) : minWageError ? (
                    <div className="py-8 text-center text-rose-500 text-sm">{minWageError}</div>
                ) : minWageData.length === 0 ? (
                    <EmptyState message="No minimum wage records found." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                    {['CC Code', 'Category', 'Wage Amount', 'Effective Date', 'Status', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {minWageData.map((row, i) => {
                                    const active = isEffective(row.EffectiveFrom);
                                    return (
                                        <tr key={i} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{row.CCCode}</td>
                                            <td className="px-4 py-3"><Badge color="violet">{row.Category}</Badge></td>
                                            <td className="px-4 py-3 font-semibold text-indigo-700 dark:text-indigo-400">
                                                ₹ {parseFloat(row.DailyRate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.EffectiveFrom || '—'}</td>
                                            <td className="px-4 py-3">
                                                <Badge color={active ? 'green' : 'gray'}>
                                                    {active ? 'Active' : 'Upcoming'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleEdit(row)}
                                                    className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — Labour Designations
// SP params: @DesignationId, @DesignationCode, @DesignationName, @Category, @Status, @ActionBy
// ─────────────────────────────────────────────────────────────────────────────

const DesignationsTab = ({ userData }) => {
    const dispatch = useDispatch();
    const { designations, designationsLoading, designationsError, saveLoading, saveResult, saveError } =
        useSelector((s) => s.labourConfig);

    const BLANK_FORM = {
        DesignationId:   0,
        DesignationCode: '',
        DesignationName: '',
        Category:        '',
        Status:          'Active',
    };

    const [filterStatus, setFilterStatus] = useState('');
    const [showForm,     setShowForm]     = useState(false);
    const [form,         setForm]         = useState(BLANK_FORM);

    const load = useCallback(() => {
        dispatch(fetchDesignations({ status: filterStatus || undefined }));
    }, [dispatch, filterStatus]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (saveResult) {
            const msg = saveResult?.Message || saveResult?.Result;
            if (saveResult?.Result === 'DUPLICATE') {
                toast.warning(msg || 'Designation code already exists.');
            } else {
                toast.success(msg || 'Designation saved successfully.');
                setShowForm(false);
                setForm(BLANK_FORM);
                load();
            }
            dispatch(clearSaveResult());
        }
        if (saveError) { toast.error(saveError); dispatch(clearSaveResult()); }
    }, [saveResult, saveError]); // eslint-disable-line

    const handleEdit = (row) => {
        setForm({
            DesignationId:   row.DesignationId   || 0,
            DesignationCode: row.DesignationCode || '',
            DesignationName: row.DesignationName || '',
            Category:        row.Category        || '',
            Status:          row.Status          || 'Active',
        });
        setShowForm(true);
    };

    const handleSubmit = () => {
        if (!form.DesignationCode || !form.DesignationName || !form.Category) {
            toast.warning('Code, name and category are required.');
            return;
        }
        dispatch(submitDesignation({
            DesignationId:   form.DesignationId,
            DesignationCode: form.DesignationCode,
            DesignationName: form.DesignationName,
            Category:        form.Category,
            Status:          form.Status,
            ActionBy:        userData?.userName || userData?.empCode || '',
        }));
    };

    return (
        <div className="space-y-5">
            {/* Filter bar */}
            <SectionCard>
                <div className="p-4 flex flex-wrap gap-3 items-end">
                    <div className="w-44">
                        <Label>Status</Label>
                        <SelectWrap>
                            <select className={selectCls} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="">All</option>
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </SelectWrap>
                    </div>
                    <Btn onClick={load} loading={designationsLoading} variant="secondary">
                        <Filter className="h-3.5 w-3.5" />Apply
                    </Btn>
                    <div className="ml-auto">
                        <Btn onClick={() => { setForm(BLANK_FORM); setShowForm(true); }}>
                            <Plus className="h-3.5 w-3.5" />New Designation
                        </Btn>
                    </div>
                </div>
            </SectionCard>

            {/* Form */}
            {showForm && (
                <SectionCard>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {form.DesignationId ? 'Edit Designation' : 'New Designation'}
                        </span>
                        <button onClick={() => setShowForm(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label required>Code</Label>
                            <input className={inputCls} placeholder="e.g. WELD" value={form.DesignationCode}
                                onChange={(e) => setForm(p => ({ ...p, DesignationCode: e.target.value.toUpperCase() }))} />
                        </div>
                        <div>
                            <Label required>Name</Label>
                            <input className={inputCls} placeholder="e.g. Welder" value={form.DesignationName}
                                onChange={(e) => setForm(p => ({ ...p, DesignationName: e.target.value }))} />
                        </div>
                        <div>
                            <Label required>Category</Label>
                            <SelectWrap>
                                <select className={selectCls} value={form.Category}
                                    onChange={(e) => setForm(p => ({ ...p, Category: e.target.value }))}>
                                    <option value="">— Select —</option>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </SelectWrap>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <SelectWrap>
                                <select className={selectCls} value={form.Status}
                                    onChange={(e) => setForm(p => ({ ...p, Status: e.target.value }))}>
                                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </SelectWrap>
                        </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                        <Btn onClick={handleSubmit} loading={saveLoading}>
                            <Save className="h-3.5 w-3.5" />Save
                        </Btn>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                    </div>
                </SectionCard>
            )}

            {/* Table */}
            <SectionCard>
                {designationsLoading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                ) : designationsError ? (
                    <div className="py-8 text-center text-rose-500 text-sm">{designationsError}</div>
                ) : designations.length === 0 ? (
                    <EmptyState message="No designations found." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                    {['Code', 'Name', 'Category', 'Status', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {designations.map((row, i) => (
                                    <tr key={i} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="px-4 py-3 font-mono font-semibold text-indigo-700 dark:text-indigo-400">{row.DesignationCode}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{row.DesignationName}</td>
                                        <td className="px-4 py-3"><Badge color="violet">{row.Category || '—'}</Badge></td>
                                        <td className="px-4 py-3">
                                            <Badge color={row.Status === 'Active' ? 'green' : 'red'}>{row.Status}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleEdit(row)}
                                                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — Wage Account Configuration
// ─────────────────────────────────────────────────────────────────────────────

const WageAccountTab = ({ userData, costCenters, costCentersLoading, dcaList, dcaLoading, subDcaList, subDcaLoading, wageComponents, wageComponentsLoading }) => {
    const dispatch = useDispatch();
    const { wageAccountData, wageAccountLoading, wageAccountError, saveLoading, saveResult, saveError } =
        useSelector((s) => s.labourConfig);

    const BLANK_FORM = { CCCode: '', ComponentCode: '', DCAID: '', SubDCAID: '', Status: 'Active' };

    const [filterCC, setFilterCC] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form,     setForm]     = useState(BLANK_FORM);

    const load = useCallback(() => {
        dispatch(fetchWageAccountConfig({ ccCode: filterCC || undefined }));
    }, [dispatch, filterCC]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (saveResult) {
            if (saveResult.Result === 'SUCCESS') {
                toast.success(saveResult.Message || 'Wage account config saved.');
                dispatch(clearSaveResult());
                setShowForm(false);
                setForm(BLANK_FORM);
                dispatch(clearSubDca());
                load();
            } else {
                toast.error(saveResult.Message || 'Save failed.');
                dispatch(clearSaveResult());
            }
        }
        if (saveError) { toast.error(saveError); dispatch(clearSaveResult()); }
    }, [saveResult, saveError]); // eslint-disable-line

    const handleDCAChange = (dcaId) => {
        setForm(p => ({ ...p, DCAID: dcaId, SubDCAID: '' }));
        if (dcaId) {
            const dca = dcaList.find(d => String(d.DCAID) === String(dcaId));
            if (dca) dispatch(fetchSubDCAByDCA(dca.DCACode));
        } else {
            dispatch(clearSubDca());
        }
    };

    const handleEdit = (row) => {
        setForm({
            CCCode:        row.CCCode        || '',
            ComponentCode: row.ComponentCode || row.WageComponent || '',
            DCAID:         row.DCAID         || '',
            SubDCAID:      row.SubDCAID      || '',
            Status:        row.Status        || 'Active',
        });
        if (row.DCAID) {
            const dca = dcaList.find(d => String(d.DCAID) === String(row.DCAID));
            if (dca) dispatch(fetchSubDCAByDCA(dca.DCACode));
        }
        setShowForm(true);
    };

    const handleSubmit = () => {
        if (!form.CCCode || !form.ComponentCode || !form.DCAID) {
            toast.warning('CC, Component and DCA are required.');
            return;
        }
        dispatch(submitWageAccountConfig({
            CCCode:        form.CCCode,
            WageComponent: form.ComponentCode,
            DCAID:         parseInt(form.DCAID)    || 0,
            SubDCAID:      parseInt(form.SubDCAID) || 0,
            Status:        form.Status,
            ActionBy:      userData?.userName || userData?.empCode || '',
        }));
    };

    return (
        <div className="space-y-5">
            <SectionCard>
                <div className="p-4 flex flex-wrap gap-3 items-end">
                    <div className="w-56">
                        <Label>Cost Centre</Label>
                        <SelectWrap loading={costCentersLoading}>
                            <select className={selectCls} value={filterCC} onChange={(e) => setFilterCC(e.target.value)}>
                                <option value="">All Cost Centres</option>
                                {costCenters.map(c => (
                                    <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>
                                ))}
                            </select>
                        </SelectWrap>
                    </div>
                    <Btn onClick={load} loading={wageAccountLoading} variant="secondary">
                        <Filter className="h-3.5 w-3.5" />Apply
                    </Btn>
                    <div className="ml-auto">
                        <Btn onClick={() => { setForm(BLANK_FORM); dispatch(clearSubDca()); setShowForm(true); }}>
                            <Plus className="h-3.5 w-3.5" />Add Config
                        </Btn>
                    </div>
                </div>
            </SectionCard>

            {showForm && (
                <SectionCard>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            Wage Account Config — Upsert
                        </span>
                        <button onClick={() => { setShowForm(false); dispatch(clearSubDca()); }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="px-5 pt-3 text-xs text-gray-400 dark:text-gray-500">
                        One entry per wage component. Each save is an upsert.
                    </p>
                    <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <Label required>Cost Centre</Label>
                            <SelectWrap loading={costCentersLoading}>
                                <select className={selectCls} value={form.CCCode}
                                    onChange={(e) => setForm(p => ({ ...p, CCCode: e.target.value }))}>
                                    <option value="">— Select CC —</option>
                                    {costCenters.map(c => (
                                        <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>
                                    ))}
                                </select>
                            </SelectWrap>
                        </div>
                        <div>
                            <Label required>Wage Component</Label>
                            <SelectWrap loading={wageComponentsLoading}>
                                <select className={selectCls} value={form.ComponentCode}
                                    onChange={(e) => setForm(p => ({ ...p, ComponentCode: e.target.value }))}>
                                    <option value="">— Select Component —</option>
                                    {[...wageComponents]
                                        .sort((a, b) => (a.DisplayOrder || 0) - (b.DisplayOrder || 0))
                                        .map(c => (
                                            <option key={c.ComponentCode} value={c.ComponentCode}>
                                                {c.ComponentName} ({c.ComponentCode})
                                            </option>
                                        ))
                                    }
                                </select>
                            </SelectWrap>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <SelectWrap>
                                <select className={selectCls} value={form.Status}
                                    onChange={(e) => setForm(p => ({ ...p, Status: e.target.value }))}>
                                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </SelectWrap>
                        </div>
                        <DCASelector
                            dcaId={form.DCAID}
                            subDcaId={form.SubDCAID}
                            onDCAChange={handleDCAChange}
                            onSubDCAChange={(v) => setForm(p => ({ ...p, SubDCAID: v }))}
                            dcaList={dcaList}
                            dcaLoading={dcaLoading}
                            subDcaList={subDcaList}
                            subDcaLoading={subDcaLoading}
                        />
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                        <Btn onClick={handleSubmit} loading={saveLoading}>
                            <Save className="h-3.5 w-3.5" />Save
                        </Btn>
                        <Btn variant="secondary" onClick={() => { setShowForm(false); dispatch(clearSubDca()); }}>Cancel</Btn>
                    </div>
                </SectionCard>
            )}

            <SectionCard>
                {wageAccountLoading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                ) : wageAccountError ? (
                    <div className="py-8 text-center text-rose-500 text-sm">{wageAccountError}</div>
                ) : wageAccountData.length === 0 ? (
                    <EmptyState message="No wage account config found." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                    {['CC Code', 'Component', 'DCA', 'Sub DCA', 'Status', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {wageAccountData.map((row, i) => (
                                    <tr key={i} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{row.CCCode}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {row.ComponentName || row.WageComponent || row.ComponentCode || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.DCAID || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.SubDCAID || '—'}</td>
                                        <td className="px-4 py-3">
                                            <Badge color={row.Status === 'Active' ? 'green' : 'red'}>{row.Status}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleEdit(row)}
                                                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4 — Holiday Configuration
// ─────────────────────────────────────────────────────────────────────────────

const HolidaysTab = ({ userData, costCenters, costCentersLoading }) => {
    const dispatch = useDispatch();
    const { holidays, holidaysLoading, holidaysError, saveLoading, saveResult, saveError } =
        useSelector((s) => s.labourConfig);

    // HolidayDate stored as DD/MM/YYYY (CustomDatePicker default)
    const BLANK_FORM = { HolidayId: 0, HolidayName: '', HolidayDate: '', HolidayType: 'National', CCCode: '', Status: 'Active' };

    const toApiDate = (val) => {
        if (!val) return '';
        if (val instanceof Date) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, '0');
            const d = String(val.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        const str = String(val);
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split('/');
            return `${y}-${m}-${d}`;
        }
        return str;
    };

    const [filterCC,   setFilterCC]   = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [showForm,   setShowForm]   = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState(BLANK_FORM);

    const load = useCallback(() => {
        dispatch(fetchHolidays({ ccCode: filterCC || undefined, year: filterYear || undefined }));
    }, [dispatch, filterCC, filterYear]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (saveResult) {
            toast.success('Holiday saved successfully.');
            dispatch(clearSaveResult());
            setShowForm(false);
            setForm(BLANK_FORM);
            load();
        }
        if (saveError) { toast.error(saveError); dispatch(clearSaveResult()); }
    }, [saveResult, saveError]); // eslint-disable-line

    const handleEdit = (row) => {
        // Normalise HolidayDate to DD/MM/YYYY for CustomDatePicker
        const raw = row.HolidayDate || '';
        let dateVal = '';
        if (raw) {
            if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
                const [y, m, d] = raw.substring(0, 10).split('-');
                dateVal = `${d}/${m}/${y}`;
            } else {
                dateVal = raw; // already DD/MM/YYYY
            }
        }
        setForm({
            HolidayId:   row.HolidayId   || 0,
            HolidayName: row.HolidayName || '',
            HolidayDate: dateVal,
            HolidayType: row.HolidayType || 'National',
            CCCode:      row.CCCode      || '',
            Status:      row.Status      || 'Active',
        });
        setShowForm(true);
    };

    const handleSubmit = () => {
        if (!form.HolidayName || !form.HolidayDate) {
            toast.warning('Name and date are required.');
            return;
        }
        dispatch(submitHoliday({
            ...form,
            HolidayDate: toApiDate(form.HolidayDate),
            CCCode:      form.CCCode || null,
            ActionBy:    userData?.userName || userData?.empCode || '',
        }));
    };

    const handleDelete = (holidayId) => {
        dispatch(removeHoliday({
            holidayId,
            actionBy: userData?.userName || userData?.empCode || '',
        })).then((res) => {
            if (!res.error) toast.success('Holiday removed.');
            else toast.error(res.payload || 'Failed to delete holiday.');
        });
        setDeleteConfirm(null);
    };

    const typeColor = { National: 'blue', Regional: 'violet', Optional: 'gray' };

    return (
        <div className="space-y-5">
            <SectionCard>
                <div className="p-4 flex flex-wrap gap-3 items-end">
                    <div className="w-56">
                        <Label>Cost Centre</Label>
                        <SelectWrap loading={costCentersLoading}>
                            <select className={selectCls} value={filterCC} onChange={(e) => setFilterCC(e.target.value)}>
                                <option value="">All Cost Centres</option>
                                {costCenters.map(c => (
                                    <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>
                                ))}
                            </select>
                        </SelectWrap>
                    </div>
                    <div className="w-32">
                        <Label>Year</Label>
                        <input className={inputCls} type="number" placeholder="2026" value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)} />
                    </div>
                    <Btn onClick={load} loading={holidaysLoading} variant="secondary">
                        <Filter className="h-3.5 w-3.5" />Apply
                    </Btn>
                    <div className="ml-auto">
                        <Btn onClick={() => { setForm(BLANK_FORM); setShowForm(true); }}>
                            <Plus className="h-3.5 w-3.5" />Add Holiday
                        </Btn>
                    </div>
                </div>
            </SectionCard>

            {showForm && (
                <SectionCard>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {form.HolidayId ? 'Edit Holiday' : 'Add Holiday'}
                        </span>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <Label required>Holiday Name</Label>
                            <input className={inputCls} placeholder="e.g. Onam" value={form.HolidayName}
                                onChange={(e) => setForm(p => ({ ...p, HolidayName: e.target.value }))} />
                        </div>
                        <div>
                            <CustomDatePicker
                                label="Date"
                                required
                                value={form.HolidayDate}
                                onChange={(val) => {
                                    if (val instanceof Date) {
                                        const d = String(val.getDate()).padStart(2, '0');
                                        const m = String(val.getMonth() + 1).padStart(2, '0');
                                        const y = val.getFullYear();
                                        setForm(p => ({ ...p, HolidayDate: `${d}/${m}/${y}` }));
                                    } else {
                                        setForm(p => ({ ...p, HolidayDate: val || '' }));
                                    }
                                }}
                                placeholder="DD/MM/YYYY"
                                format="DD/MM/YYYY"
                            />
                        </div>
                        <div>
                            <Label required>Type</Label>
                            <SelectWrap>
                                <select className={selectCls} value={form.HolidayType}
                                    onChange={(e) => setForm(p => ({ ...p, HolidayType: e.target.value }))}>
                                    {HOLIDAY_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </SelectWrap>
                        </div>
                        <div>
                            <Label>Cost Centre <span className="font-normal text-gray-400 normal-case">(blank = all)</span></Label>
                            <SelectWrap loading={costCentersLoading}>
                                <select className={selectCls} value={form.CCCode}
                                    onChange={(e) => setForm(p => ({ ...p, CCCode: e.target.value }))}>
                                    <option value="">All Cost Centres</option>
                                    {costCenters.map(c => (
                                        <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>
                                    ))}
                                </select>
                            </SelectWrap>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <SelectWrap>
                                <select className={selectCls} value={form.Status}
                                    onChange={(e) => setForm(p => ({ ...p, Status: e.target.value }))}>
                                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </SelectWrap>
                        </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                        <Btn onClick={handleSubmit} loading={saveLoading}>
                            <Save className="h-3.5 w-3.5" />Save Holiday
                        </Btn>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                    </div>
                </SectionCard>
            )}

            {deleteConfirm && (
                <div className="rounded-2xl border border-rose-200 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20 px-5 py-4 flex items-center justify-between">
                    <span className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                        Are you sure you want to delete this holiday?
                    </span>
                    <div className="flex gap-2">
                        <Btn variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>
                            <Trash2 className="h-3 w-3" />Delete
                        </Btn>
                        <Btn variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
                    </div>
                </div>
            )}

            <SectionCard>
                {holidaysLoading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                ) : holidaysError ? (
                    <div className="py-8 text-center text-rose-500 text-sm">{holidaysError}</div>
                ) : holidays.length === 0 ? (
                    <EmptyState message="No holidays found for the selected filters." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                    {['Holiday Name', 'Date', 'Type', 'Cost Centre', 'Status', 'Created On', ''].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {holidays.map((row, i) => (
                                    <tr key={i} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{row.HolidayName}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.HolidayDate}</td>
                                        <td className="px-4 py-3">
                                            <Badge color={typeColor[row.HolidayType] || 'gray'}>{row.HolidayType}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                            {row.CCCode || <span className="text-gray-400 italic">All</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge color={row.Status === 'Active' ? 'green' : 'red'}>{row.Status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{row.CreatedOn || '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(row)}
                                                    className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => setDeleteConfirm(row.HolidayId)}
                                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Multi-select CC dropdown with checkboxes
// ─────────────────────────────────────────────────────────────────────────────

const MultiCCSelect = ({ value = [], onChange, costCenters, loading, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = (ccCode) => {
        onChange(value.includes(ccCode) ? value.filter(c => c !== ccCode) : [...value, ccCode]);
    };

    const allSelected = costCenters.length > 0 && value.length === costCenters.length;

    const displayLabel = value.length === 0
        ? '— Select Cost Centres —'
        : value.length === 1
            ? (costCenters.find(c => c.CC_Code === value[0])?.CC_Name || value[0])
            : `${value.length} Cost Centres selected`;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled || loading}
                onClick={() => setOpen(o => !o)}
                className={`${inputCls} text-left flex items-center justify-between gap-2`}
            >
                <span className={`truncate ${value.length === 0 ? 'text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {displayLabel}
                </span>
                {loading
                    ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" />
                    : <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </button>
            {open && !loading && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    <label className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => onChange(allSelected ? [] : costCenters.map(c => c.CC_Code))}
                            className="w-3.5 h-3.5 accent-indigo-600"
                        />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Select All</span>
                    </label>
                    {costCenters.map(c => (
                        <label key={c.CC_Code} className="flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value.includes(c.CC_Code)}
                                onChange={() => toggle(c.CC_Code)}
                                className="w-3.5 h-3.5 accent-indigo-600 flex-shrink-0"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-200">
                                <span className="font-semibold text-indigo-700 dark:text-indigo-400">{c.CC_Code}</span>
                                {' — '}{c.CC_Name}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 5 — PF Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PFConfigTab = ({ userData, costCenters, costCentersLoading }) => {
    const dispatch = useDispatch();
    const { pfConfigData, pfConfigLoading, pfConfigError, saveLoading, saveResult, saveError } =
        useSelector((s) => s.labourConfig);

    const toApiDate = (val) => {
        if (!val) return '';
        if (val instanceof Date) {
            return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}-${String(val.getDate()).padStart(2, '0')}`;
        }
        const str = String(val);
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split('/');
            return `${y}-${m}-${d}`;
        }
        return str;
    };

    const PF_BLANK = {
        ConfigId: 0, CCCodes: [], EffectiveFrom: '',
        EmpPFPct: '12.00', EPS_Pct: '8.33', EPF_Pct: '3.67',
        EDLI_Pct: '0.5000', EPFAdminCharge_Pct: '0.5000',
        ThresholdApply: true, ThresholdAmt: '15000', Status: 'Active',
    };

    const [filterCC, setFilterCC] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form,     setForm]     = useState(PF_BLANK);

    const load = useCallback(() => {
        dispatch(fetchPFConfig(filterCC || undefined));
    }, [dispatch, filterCC]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (saveResult) {
            const msg = saveResult?.Message || saveResult?.Result;
            if (saveResult?.Result === 'SUCCESS' || (saveResult?.SavedCount > 0)) {
                toast.success(msg || 'PF config saved successfully.');
                dispatch(clearSaveResult());
                setShowForm(false);
                setForm(PF_BLANK);
                load();
            } else {
                toast.warning(msg || 'Save completed with warnings.');
                dispatch(clearSaveResult());
            }
        }
        if (saveError) { toast.error(saveError); dispatch(clearSaveResult()); }
    }, [saveResult, saveError]); // eslint-disable-line

    const handleEdit = (row) => {
        const raw = row.EffectiveFrom || '';
        let dateVal = '';
        if (raw) {
            if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
                const [y, m, d] = raw.substring(0, 10).split('-');
                dateVal = `${d}/${m}/${y}`;
            } else {
                dateVal = raw;
            }
        }
        setForm({
            ConfigId:           row.ConfigId || 0,
            CCCodes:            [row.CCCode],
            EffectiveFrom:      dateVal,
            EmpPFPct:           String(row.EmpPFPct           ?? '12.00'),
            EPS_Pct:            String(row.EPS_Pct            ?? '8.33'),
            EPF_Pct:            String(row.EPF_Pct            ?? '3.67'),
            EDLI_Pct:           String(row.EDLI_Pct           ?? '0.5000'),
            EPFAdminCharge_Pct: String(row.EPFAdminCharge_Pct ?? '0.5000'),
            ThresholdApply:     !!row.ThresholdApply,
            ThresholdAmt:       row.ThresholdAmt != null ? String(row.ThresholdAmt) : '15000',
            Status:             row.Status || 'Active',
        });
        setShowForm(true);
    };

    const handleSubmit = () => {
        if (!form.CCCodes.length) { toast.warning('Select at least one Cost Centre.'); return; }
        if (!form.EffectiveFrom)  { toast.warning('Effective date is required.'); return; }
        dispatch(submitPFConfig({
            ConfigId:           form.ConfigId || 0,
            CCCodes:            form.CCCodes,
            EffectiveFrom:      toApiDate(form.EffectiveFrom),
            EmpPFPct:           parseFloat(form.EmpPFPct)           || 0,
            EPS_Pct:            parseFloat(form.EPS_Pct)            || 0,
            EPF_Pct:            parseFloat(form.EPF_Pct)            || 0,
            EDLI_Pct:           parseFloat(form.EDLI_Pct)           || 0,
            EPFAdminCharge_Pct: parseFloat(form.EPFAdminCharge_Pct) || 0,
            ThresholdApply:     form.ThresholdApply,
            ThresholdAmt:       form.ThresholdApply ? (parseFloat(form.ThresholdAmt) || null) : null,
            Status:             form.Status,
            ActionBy:           userData?.userName || userData?.empCode || '',
        }));
    };

    const fmtPct = (v) => v != null ? `${parseFloat(v).toFixed(2)}%` : '—';
    const fmtAmt = (v) => v != null ? `₹${parseFloat(v).toLocaleString('en-IN')}` : '—';

    return (
        <div className="space-y-5">
            <SectionCard>
                <div className="p-4 flex flex-wrap gap-3 items-end">
                    <div className="w-56">
                        <Label>Cost Centre</Label>
                        <SelectWrap loading={costCentersLoading}>
                            <select className={selectCls} value={filterCC} onChange={(e) => setFilterCC(e.target.value)}>
                                <option value="">All Cost Centres</option>
                                {costCenters.map(c => (
                                    <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>
                                ))}
                            </select>
                        </SelectWrap>
                    </div>
                    <Btn onClick={load} loading={pfConfigLoading} variant="secondary">
                        <Filter className="h-3.5 w-3.5" />Apply
                    </Btn>
                    <div className="ml-auto">
                        <Btn onClick={() => { setForm(PF_BLANK); setShowForm(true); }}>
                            <Plus className="h-3.5 w-3.5" />Add PF Config
                        </Btn>
                    </div>
                </div>
            </SectionCard>

            {showForm && (
                <SectionCard>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {form.ConfigId ? 'Edit PF Configuration' : 'Add PF Configuration'}
                        </span>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* CC + Effective Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label required>
                                    Cost Centre
                                    {!form.ConfigId && <span className="ml-1 font-normal text-gray-400 normal-case">(multiple allowed for new config)</span>}
                                </Label>
                                {form.ConfigId ? (
                                    <div className={`${inputCls} bg-gray-50 dark:bg-gray-700 cursor-not-allowed text-gray-500`}>
                                        {costCenters.find(c => c.CC_Code === form.CCCodes[0])?.CC_Name || form.CCCodes[0] || '—'}
                                    </div>
                                ) : (
                                    <MultiCCSelect
                                        value={form.CCCodes}
                                        onChange={(val) => setForm(p => ({ ...p, CCCodes: val }))}
                                        costCenters={costCenters}
                                        loading={costCentersLoading}
                                    />
                                )}
                            </div>
                            <div>
                                <CustomDatePicker
                                    label="Effective From"
                                    required
                                    value={form.EffectiveFrom}
                                    onChange={(val) => {
                                        if (val instanceof Date) {
                                            const d = String(val.getDate()).padStart(2, '0');
                                            const m = String(val.getMonth() + 1).padStart(2, '0');
                                            const y = val.getFullYear();
                                            setForm(p => ({ ...p, EffectiveFrom: `${d}/${m}/${y}` }));
                                        } else {
                                            setForm(p => ({ ...p, EffectiveFrom: val || '' }));
                                        }
                                    }}
                                    placeholder="DD/MM/YYYY"
                                    format="DD/MM/YYYY"
                                />
                            </div>
                        </div>

                        {/* PF Percentages */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { key: 'EmpPFPct',           label: 'Emp PF %',     placeholder: '12.00', step: '0.01'   },
                                { key: 'EPS_Pct',            label: 'EPS %',        placeholder: '8.33',  step: '0.01'   },
                                { key: 'EPF_Pct',            label: 'EPF %',        placeholder: '3.67',  step: '0.01'   },
                                { key: 'EDLI_Pct',           label: 'EDLI %',       placeholder: '0.5000',step: '0.0001' },
                                { key: 'EPFAdminCharge_Pct', label: 'Admin Charge %',placeholder:'0.5000',step: '0.0001' },
                            ].map(({ key, label, placeholder, step }) => (
                                <div key={key}>
                                    <Label required>{label}</Label>
                                    <input
                                        type="number" step={step} min="0"
                                        className={inputCls}
                                        value={form[key]}
                                        placeholder={placeholder}
                                        onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Threshold + Status */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                            <div className="flex flex-col gap-1">
                                <Label>PF Wage Threshold</Label>
                                <label className="flex items-center gap-2 cursor-pointer mt-1">
                                    <input
                                        type="checkbox"
                                        checked={form.ThresholdApply}
                                        onChange={(e) => setForm(p => ({ ...p, ThresholdApply: e.target.checked }))}
                                        className="w-4 h-4 accent-indigo-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Apply wage ceiling</span>
                                </label>
                            </div>
                            {form.ThresholdApply && (
                                <div>
                                    <Label required>Threshold Amount (₹)</Label>
                                    <input
                                        type="number" min="0" className={inputCls}
                                        value={form.ThresholdAmt} placeholder="15000"
                                        onChange={(e) => setForm(p => ({ ...p, ThresholdAmt: e.target.value }))}
                                    />
                                </div>
                            )}
                            <div>
                                <Label>Status</Label>
                                <SelectWrap>
                                    <select className={selectCls} value={form.Status}
                                        onChange={(e) => setForm(p => ({ ...p, Status: e.target.value }))}>
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </SelectWrap>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                        <Btn onClick={handleSubmit} loading={saveLoading}>
                            <Save className="h-3.5 w-3.5" />Save
                        </Btn>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                    </div>
                </SectionCard>
            )}

            <SectionCard>
                {pfConfigLoading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                ) : pfConfigError ? (
                    <div className="py-8 text-center text-rose-500 text-sm">{pfConfigError}</div>
                ) : pfConfigData.length === 0 ? (
                    <EmptyState message="No PF configurations found." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                    {['CC Code','CC Name','Effective From','Emp PF %','EPS %','EPF %','EDLI %','Admin %','Threshold','Threshold Amt','Status','Created On',''].map(h => (
                                        <th key={h} className="px-3 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {pfConfigData.map((row, i) => (
                                    <tr key={i} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-gray-100">{row.CCCode}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.CCName || '—'}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{row.EffectiveFrom || '—'}</td>
                                        <td className="px-3 py-2.5 font-semibold text-indigo-600 dark:text-indigo-400">{fmtPct(row.EmpPFPct)}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{fmtPct(row.EPS_Pct)}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{fmtPct(row.EPF_Pct)}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{fmtPct(row.EDLI_Pct)}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{fmtPct(row.EPFAdminCharge_Pct)}</td>
                                        <td className="px-3 py-2.5">
                                            <Badge color={row.ThresholdApply ? 'green' : 'gray'}>
                                                {row.ThresholdApply ? 'Yes' : 'No'}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                            {row.ThresholdApply && row.ThresholdAmt != null ? fmtAmt(row.ThresholdAmt) : '—'}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <Badge color={row.Status === 'Active' ? 'green' : 'red'}>{row.Status}</Badge>
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-400 text-xs">{row.CreatedOn || '—'}</td>
                                        <td className="px-3 py-2.5">
                                            <button onClick={() => handleEdit(row)}
                                                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 6 — ESI Configuration
// ─────────────────────────────────────────────────────────────────────────────

const ESIConfigTab = ({ userData, costCenters, costCentersLoading }) => {
    const dispatch = useDispatch();
    const { esiConfigData, esiConfigLoading, esiConfigError, saveLoading, saveResult, saveError } =
        useSelector((s) => s.labourConfig);

    const toApiDate = (val) => {
        if (!val) return '';
        if (val instanceof Date) {
            return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}-${String(val.getDate()).padStart(2, '0')}`;
        }
        const str = String(val);
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split('/');
            return `${y}-${m}-${d}`;
        }
        return str;
    };

    const ESI_BLANK = {
        ConfigId: 0, CCCodes: [], EffectiveFrom: '',
        EmpESIPct: '0.75', EmprESIPct: '3.25',
        ApplicabilityAmt: '21000', Status: 'Active',
    };

    const [filterCC, setFilterCC] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form,     setForm]     = useState(ESI_BLANK);

    const load = useCallback(() => {
        dispatch(fetchESIConfig(filterCC || undefined));
    }, [dispatch, filterCC]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (saveResult) {
            const msg = saveResult?.Message || saveResult?.Result;
            if (saveResult?.Result === 'SUCCESS' || (saveResult?.SavedCount > 0)) {
                toast.success(msg || 'ESI config saved successfully.');
                dispatch(clearSaveResult());
                setShowForm(false);
                setForm(ESI_BLANK);
                load();
            } else {
                toast.warning(msg || 'Save completed with warnings.');
                dispatch(clearSaveResult());
            }
        }
        if (saveError) { toast.error(saveError); dispatch(clearSaveResult()); }
    }, [saveResult, saveError]); // eslint-disable-line

    const handleEdit = (row) => {
        const raw = row.EffectiveFrom || '';
        let dateVal = '';
        if (raw) {
            if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
                const [y, m, d] = raw.substring(0, 10).split('-');
                dateVal = `${d}/${m}/${y}`;
            } else {
                dateVal = raw;
            }
        }
        setForm({
            ConfigId:         row.ConfigId || 0,
            CCCodes:          [row.CCCode],
            EffectiveFrom:    dateVal,
            EmpESIPct:        String(row.EmpESIPct        ?? '0.75'),
            EmprESIPct:       String(row.EmprESIPct       ?? '3.25'),
            ApplicabilityAmt: String(row.ApplicabilityAmt ?? '21000'),
            Status:           row.Status || 'Active',
        });
        setShowForm(true);
    };

    const handleSubmit = () => {
        if (!form.CCCodes.length) { toast.warning('Select at least one Cost Centre.'); return; }
        if (!form.EffectiveFrom)  { toast.warning('Effective date is required.'); return; }
        dispatch(submitESIConfig({
            ConfigId:         form.ConfigId || 0,
            CCCodes:          form.CCCodes,
            EffectiveFrom:    toApiDate(form.EffectiveFrom),
            EmpESIPct:        parseFloat(form.EmpESIPct)        || 0,
            EmprESIPct:       parseFloat(form.EmprESIPct)       || 0,
            ApplicabilityAmt: parseFloat(form.ApplicabilityAmt) || 0,
            Status:           form.Status,
            ActionBy:         userData?.userName || userData?.empCode || '',
        }));
    };

    const fmtPct = (v) => v != null ? `${parseFloat(v).toFixed(2)}%` : '—';
    const fmtAmt = (v) => v != null ? `₹${parseFloat(v).toLocaleString('en-IN')}` : '—';

    return (
        <div className="space-y-5">
            <SectionCard>
                <div className="p-4 flex flex-wrap gap-3 items-end">
                    <div className="w-56">
                        <Label>Cost Centre</Label>
                        <SelectWrap loading={costCentersLoading}>
                            <select className={selectCls} value={filterCC} onChange={(e) => setFilterCC(e.target.value)}>
                                <option value="">All Cost Centres</option>
                                {costCenters.map(c => (
                                    <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>
                                ))}
                            </select>
                        </SelectWrap>
                    </div>
                    <Btn onClick={load} loading={esiConfigLoading} variant="secondary">
                        <Filter className="h-3.5 w-3.5" />Apply
                    </Btn>
                    <div className="ml-auto">
                        <Btn onClick={() => { setForm(ESI_BLANK); setShowForm(true); }}>
                            <Plus className="h-3.5 w-3.5" />Add ESI Config
                        </Btn>
                    </div>
                </div>
            </SectionCard>

            {showForm && (
                <SectionCard>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {form.ConfigId ? 'Edit ESI Configuration' : 'Add ESI Configuration'}
                        </span>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* CC + Effective Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label required>
                                    Cost Centre
                                    {!form.ConfigId && <span className="ml-1 font-normal text-gray-400 normal-case">(multiple allowed for new config)</span>}
                                </Label>
                                {form.ConfigId ? (
                                    <div className={`${inputCls} bg-gray-50 dark:bg-gray-700 cursor-not-allowed text-gray-500`}>
                                        {costCenters.find(c => c.CC_Code === form.CCCodes[0])?.CC_Name || form.CCCodes[0] || '—'}
                                    </div>
                                ) : (
                                    <MultiCCSelect
                                        value={form.CCCodes}
                                        onChange={(val) => setForm(p => ({ ...p, CCCodes: val }))}
                                        costCenters={costCenters}
                                        loading={costCentersLoading}
                                    />
                                )}
                            </div>
                            <div>
                                <CustomDatePicker
                                    label="Effective From"
                                    required
                                    value={form.EffectiveFrom}
                                    onChange={(val) => {
                                        if (val instanceof Date) {
                                            const d = String(val.getDate()).padStart(2, '0');
                                            const m = String(val.getMonth() + 1).padStart(2, '0');
                                            const y = val.getFullYear();
                                            setForm(p => ({ ...p, EffectiveFrom: `${d}/${m}/${y}` }));
                                        } else {
                                            setForm(p => ({ ...p, EffectiveFrom: val || '' }));
                                        }
                                    }}
                                    placeholder="DD/MM/YYYY"
                                    format="DD/MM/YYYY"
                                />
                            </div>
                        </div>

                        {/* ESI Percentages + Applicability */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <Label required>Emp ESI %</Label>
                                <input
                                    type="number" step="0.01" min="0"
                                    className={inputCls} value={form.EmpESIPct} placeholder="0.75"
                                    onChange={(e) => setForm(p => ({ ...p, EmpESIPct: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label required>Empr ESI %</Label>
                                <input
                                    type="number" step="0.01" min="0"
                                    className={inputCls} value={form.EmprESIPct} placeholder="3.25"
                                    onChange={(e) => setForm(p => ({ ...p, EmprESIPct: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label required>Applicability Ceiling (₹)</Label>
                                <input
                                    type="number" min="0"
                                    className={inputCls} value={form.ApplicabilityAmt} placeholder="21000"
                                    onChange={(e) => setForm(p => ({ ...p, ApplicabilityAmt: e.target.value }))}
                                />
                                <p className="text-xs text-gray-400 mt-1">ESI not applicable if gross &gt; this amount</p>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <SelectWrap>
                                    <select className={selectCls} value={form.Status}
                                        onChange={(e) => setForm(p => ({ ...p, Status: e.target.value }))}>
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </SelectWrap>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                        <Btn onClick={handleSubmit} loading={saveLoading}>
                            <Save className="h-3.5 w-3.5" />Save
                        </Btn>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                    </div>
                </SectionCard>
            )}

            <SectionCard>
                {esiConfigLoading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                ) : esiConfigError ? (
                    <div className="py-8 text-center text-rose-500 text-sm">{esiConfigError}</div>
                ) : esiConfigData.length === 0 ? (
                    <EmptyState message="No ESI configurations found." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                    {['CC Code','CC Name','Effective From','Emp ESI %','Empr ESI %','Applicability Amt','Status','Created On',''].map(h => (
                                        <th key={h} className="px-3 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {esiConfigData.map((row, i) => (
                                    <tr key={i} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-gray-100">{row.CCCode}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.CCName || '—'}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{row.EffectiveFrom || '—'}</td>
                                        <td className="px-3 py-2.5 font-semibold text-indigo-600 dark:text-indigo-400">{fmtPct(row.EmpESIPct)}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{fmtPct(row.EmprESIPct)}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{fmtAmt(row.ApplicabilityAmt)}</td>
                                        <td className="px-3 py-2.5">
                                            <Badge color={row.Status === 'Active' ? 'green' : 'red'}>{row.Status}</Badge>
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-400 text-xs">{row.CreatedOn || '—'}</td>
                                        <td className="px-3 py-2.5">
                                            <button onClick={() => handleEdit(row)}
                                                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 7 — Professional Tax (PT) Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PT_CONFIG_BLANK = {
    ConfigId: 0, CCCodes: [], EffectiveFrom: '',
    PaymentCycle: 'Monthly', GenderBased: false, Status: 'Active',
};
const PT_SLAB_BLANK = {
    SlabId: 0, Gender: 'All', SlabFrom: '', SlabTo: '',
    PTAmount: '', SpecialMonthNo: '', SpecialMonthAmount: '', DisplayOrder: 0,
};

const PTConfigTab = ({ userData, costCenters, costCentersLoading }) => {
    const dispatch = useDispatch();
    const {
        ptConfigData, ptConfigLoading, ptConfigError,
        ptSlabData, ptSlabLoading, ptSlabError,
        saveLoading, saveResult, saveError,
    } = useSelector((s) => s.labourConfig);

    const savingWhatRef = useRef(null);

    const toApiDate = (val) => {
        if (!val) return '';
        if (val instanceof Date) {
            return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}-${String(val.getDate()).padStart(2, '0')}`;
        }
        const str = String(val);
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) { const [d, m, y] = str.split('/'); return `${y}-${m}-${d}`; }
        return str;
    };

    const [filterCC,         setFilterCC]         = useState('');
    const [showConfigForm,   setShowConfigForm]    = useState(false);
    const [configForm,       setConfigForm]        = useState(PT_CONFIG_BLANK);
    const [expandedConfigId, setExpandedConfigId]  = useState(null);
    const [showSlabForm,     setShowSlabForm]      = useState(false);
    const [slabForm,         setSlabForm]          = useState(PT_SLAB_BLANK);
    const [deleteSlabId,     setDeleteSlabId]      = useState(null);

    const selectedConfig = ptConfigData.find(c => c.ConfigId === expandedConfigId) || null;

    const loadConfigs = useCallback(() => {
        dispatch(fetchPTConfig(filterCC || undefined));
    }, [dispatch, filterCC]);

    useEffect(() => { loadConfigs(); }, [loadConfigs]);

    useEffect(() => {
        if (expandedConfigId) {
            dispatch(fetchPTSlabs(expandedConfigId));
        } else {
            dispatch(clearPTSlabs());
        }
    }, [expandedConfigId, dispatch]);

    useEffect(() => {
        if (saveResult) {
            const msg = saveResult?.Message || saveResult?.Result;
            if (saveResult?.Result === 'SUCCESS') {
                toast.success(msg || 'Saved successfully.');
                if (savingWhatRef.current === 'config') {
                    setShowConfigForm(false);
                    setConfigForm(PT_CONFIG_BLANK);
                    loadConfigs();
                } else if (savingWhatRef.current === 'slab') {
                    setShowSlabForm(false);
                    setSlabForm(PT_SLAB_BLANK);
                    if (expandedConfigId) dispatch(fetchPTSlabs(expandedConfigId));
                }
            } else if (saveResult?.Result === 'DUPLICATE') {
                toast.warning(msg || 'A config already exists for this CC and effective date.');
            } else if (saveResult?.Result === 'ERROR') {
                toast.error(msg || 'An error occurred.');
            } else {
                toast.warning(msg || 'Saved.');
            }
            dispatch(clearSaveResult());
            savingWhatRef.current = null;
        }
        if (saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
            savingWhatRef.current = null;
        }
    }, [saveResult, saveError]); // eslint-disable-line

    const handleEditConfig = (row) => {
        const raw = row.EffectiveFrom || '';
        let dateVal = '';
        if (raw) {
            if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
                const [y, m, d] = raw.substring(0, 10).split('-');
                dateVal = `${d}/${m}/${y}`;
            } else { dateVal = raw; }
        }
        setConfigForm({
            ConfigId:      row.ConfigId || 0,
            CCCodes:       [row.CCCode],
            EffectiveFrom: dateVal,
            PaymentCycle:  row.PaymentCycle || 'Monthly',
            GenderBased:   !!row.GenderBased,
            Status:        row.Status || 'Active',
        });
        setShowConfigForm(true);
    };

    const handleConfigSubmit = () => {
        if (!configForm.CCCodes.length || !configForm.EffectiveFrom) {
            toast.warning('Cost Centre and Effective Date are required.');
            return;
        }
        savingWhatRef.current = 'config';
        dispatch(submitPTConfig({
            ConfigId:      configForm.ConfigId || 0,
            CCCodes:       configForm.CCCodes,
            EffectiveFrom: toApiDate(configForm.EffectiveFrom),
            PaymentCycle:  configForm.PaymentCycle,
            GenderBased:   configForm.GenderBased,
            Status:        configForm.Status,
            ActionBy:      userData?.userName || userData?.empCode || '',
        }));
    };

    const handleEditSlab = (slab) => {
        setSlabForm({
            SlabId:             slab.SlabId || 0,
            Gender:             slab.Gender || 'All',
            SlabFrom:           slab.SlabFrom  != null ? String(slab.SlabFrom)  : '',
            SlabTo:             slab.SlabTo    != null ? String(slab.SlabTo)    : '',
            PTAmount:           slab.PTAmount  != null ? String(slab.PTAmount)  : '',
            SpecialMonthNo:     slab.SpecialMonthNo     != null ? String(slab.SpecialMonthNo)     : '',
            SpecialMonthAmount: slab.SpecialMonthAmount != null ? String(slab.SpecialMonthAmount) : '',
            DisplayOrder:       slab.DisplayOrder ?? 0,
        });
        setShowSlabForm(true);
    };

    const handleSlabSubmit = () => {
        if (slabForm.SlabFrom === '' || slabForm.PTAmount === '') {
            toast.warning('Slab From and PT Amount are required.');
            return;
        }
        savingWhatRef.current = 'slab';
        dispatch(submitPTSlab({
            SlabId:             slabForm.SlabId || 0,
            ConfigId:           selectedConfig.ConfigId,
            Gender:             slabForm.Gender,
            SlabFrom:           parseFloat(slabForm.SlabFrom) || 0,
            SlabTo:             slabForm.SlabTo !== '' ? parseFloat(slabForm.SlabTo) : null,
            PTAmount:           parseFloat(slabForm.PTAmount) || 0,
            SpecialMonthNo:     slabForm.SpecialMonthNo !== '' ? parseInt(slabForm.SpecialMonthNo) : null,
            SpecialMonthAmount: slabForm.SpecialMonthNo !== '' && slabForm.SpecialMonthAmount !== ''
                ? parseFloat(slabForm.SpecialMonthAmount) : null,
            DisplayOrder:       parseInt(slabForm.DisplayOrder) || 0,
        }));
    };

    const handleDeleteSlab = (slabId) => {
        dispatch(removePTSlab(slabId)).then((res) => {
            if (!res.error) toast.success('PT slab removed.');
            else toast.error(res.payload || 'Failed to remove slab.');
        });
        setDeleteSlabId(null);
    };

    const toggleExpand = (configId) => {
        if (expandedConfigId === configId) {
            setExpandedConfigId(null);
            setShowSlabForm(false);
            setSlabForm(PT_SLAB_BLANK);
        } else {
            setExpandedConfigId(configId);
            setShowSlabForm(false);
            setSlabForm(PT_SLAB_BLANK);
        }
    };

    const fmtAmt  = (v) => v != null ? `₹${parseFloat(v).toLocaleString('en-IN')}` : '—';
    const nilOrAmt = (v) => (v === 0 || v === '0' || parseFloat(v) === 0) ? 'Nil' : fmtAmt(v);

    return (
        <div className="space-y-5">
            {/* ── Filter + Add ── */}
            <SectionCard>
                <div className="p-4 flex flex-wrap gap-3 items-end">
                    <div className="w-56">
                        <Label>Cost Centre</Label>
                        <SelectWrap loading={costCentersLoading}>
                            <select className={selectCls} value={filterCC} onChange={(e) => setFilterCC(e.target.value)}>
                                <option value="">All Cost Centres</option>
                                {costCenters.map(c => <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>)}
                            </select>
                        </SelectWrap>
                    </div>
                    <Btn onClick={loadConfigs} loading={ptConfigLoading} variant="secondary">
                        <Filter className="h-3.5 w-3.5" />Apply
                    </Btn>
                    <div className="ml-auto">
                        <Btn onClick={() => { setConfigForm(PT_CONFIG_BLANK); setShowConfigForm(v => !v); }}>
                            <Plus className="h-3.5 w-3.5" />Add PT Config
                        </Btn>
                    </div>
                </div>
            </SectionCard>

            {/* ── Add / Edit Config Form ── */}
            {showConfigForm && (
                <SectionCard>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {configForm.ConfigId ? 'Edit PT Configuration' : 'Add PT Configuration'}
                        </span>
                        <button onClick={() => setShowConfigForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                        <div>
                            <Label required>
                                Cost Centre
                                {!configForm.ConfigId && <span className="ml-1 font-normal text-gray-400 normal-case">(multiple allowed)</span>}
                            </Label>
                            {configForm.ConfigId ? (
                                <div className={`${inputCls} bg-gray-50 dark:bg-gray-700 cursor-not-allowed text-gray-500`}>
                                    {costCenters.find(c => c.CC_Code === configForm.CCCodes[0])?.CC_Name || configForm.CCCodes[0] || '—'}
                                </div>
                            ) : (
                                <MultiCCSelect
                                    value={configForm.CCCodes}
                                    onChange={(val) => setConfigForm(p => ({ ...p, CCCodes: val }))}
                                    costCenters={costCenters}
                                    loading={costCentersLoading}
                                />
                            )}
                        </div>
                        <div>
                            <CustomDatePicker
                                label="Effective From"
                                required
                                value={configForm.EffectiveFrom}
                                onChange={(val) => {
                                    if (val instanceof Date) {
                                        const d = String(val.getDate()).padStart(2, '0');
                                        const m = String(val.getMonth() + 1).padStart(2, '0');
                                        const y = val.getFullYear();
                                        setConfigForm(p => ({ ...p, EffectiveFrom: `${d}/${m}/${y}` }));
                                    } else {
                                        setConfigForm(p => ({ ...p, EffectiveFrom: val || '' }));
                                    }
                                }}
                                placeholder="DD/MM/YYYY"
                                format="DD/MM/YYYY"
                            />
                        </div>
                        <div>
                            <Label required>Payment Cycle</Label>
                            <SelectWrap>
                                <select className={selectCls} value={configForm.PaymentCycle}
                                    onChange={(e) => setConfigForm(p => ({ ...p, PaymentCycle: e.target.value }))}>
                                    {PAYMENT_CYCLES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </SelectWrap>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <Label>Gender-Based Slabs</Label>
                                <label className="flex items-center gap-2 cursor-pointer mt-1.5">
                                    <input
                                        type="checkbox"
                                        checked={configForm.GenderBased}
                                        onChange={(e) => setConfigForm(p => ({ ...p, GenderBased: e.target.checked }))}
                                        className="w-4 h-4 accent-indigo-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Apply gender-specific slabs</span>
                                </label>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <SelectWrap>
                                    <select className={selectCls} value={configForm.Status}
                                        onChange={(e) => setConfigForm(p => ({ ...p, Status: e.target.value }))}>
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </SelectWrap>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                        <Btn onClick={handleConfigSubmit} loading={saveLoading}>
                            <Save className="h-3.5 w-3.5" />Save
                        </Btn>
                        <Btn variant="secondary" onClick={() => setShowConfigForm(false)}>Cancel</Btn>
                    </div>
                </SectionCard>
            )}

            {/* ── Per-config accordion cards ── */}
            {ptConfigLoading ? (
                <SectionCard>
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                </SectionCard>
            ) : ptConfigError ? (
                <SectionCard>
                    <div className="py-8 text-center text-rose-500 text-sm">{ptConfigError}</div>
                </SectionCard>
            ) : ptConfigData.length === 0 ? (
                <SectionCard>
                    <EmptyState message="No PT configurations found. Click 'Add PT Config' to begin." />
                </SectionCard>
            ) : (
                ptConfigData.map((config) => {
                    const isExpanded = expandedConfigId === config.ConfigId;
                    return (
                        <SectionCard key={config.ConfigId}>
                            {/* Config summary row */}
                            <div className="px-5 py-4 flex flex-wrap items-center gap-3">
                                <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{config.CCCode}</span>
                                    {config.CCName && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{config.CCName}</span>
                                    )}
                                    <Badge color="indigo">{config.PaymentCycle}</Badge>
                                    {config.GenderBased && <Badge color="violet">Gender-Based</Badge>}
                                    <Badge color={config.Status === 'Active' ? 'green' : 'red'}>{config.Status}</Badge>
                                    <span className="text-xs text-gray-400">Eff: {config.EffectiveFrom || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleEditConfig(config)}
                                        title="Edit config"
                                        className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <Btn
                                        size="sm"
                                        variant={isExpanded ? 'primary' : 'secondary'}
                                        onClick={() => toggleExpand(config.ConfigId)}
                                    >
                                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        {isExpanded ? 'Hide Slabs' : 'Manage Slabs'}
                                    </Btn>
                                </div>
                            </div>

                            {/* Expanded inline slab section */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 dark:border-gray-700">

                                    {/* Slab entry form */}
                                    {showSlabForm && (
                                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-indigo-50/40 dark:bg-indigo-900/10">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                                {slabForm.SlabId ? 'Edit Slab' : 'New Slab'}
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {!!config.GenderBased && (
                                                    <div>
                                                        <Label>Gender</Label>
                                                        <SelectWrap>
                                                            <select className={selectCls} value={slabForm.Gender}
                                                                onChange={(e) => setSlabForm(p => ({ ...p, Gender: e.target.value }))}>
                                                                {PT_GENDERS.map(g => <option key={g}>{g}</option>)}
                                                            </select>
                                                        </SelectWrap>
                                                    </div>
                                                )}
                                                <div>
                                                    <Label required>Income From (₹)</Label>
                                                    <input type="number" min="0" className={inputCls}
                                                        value={slabForm.SlabFrom} placeholder="0"
                                                        onChange={(e) => setSlabForm(p => ({ ...p, SlabFrom: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <Label>Income To (₹) <span className="font-normal text-gray-400 normal-case">(blank = no cap)</span></Label>
                                                    <input type="number" min="0" className={inputCls}
                                                        value={slabForm.SlabTo} placeholder="No cap"
                                                        onChange={(e) => setSlabForm(p => ({ ...p, SlabTo: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <Label required>PT Amount (₹/{config.PaymentCycle})</Label>
                                                    <input type="number" min="0" step="0.01" className={inputCls}
                                                        value={slabForm.PTAmount} placeholder="0 for Nil"
                                                        onChange={(e) => setSlabForm(p => ({ ...p, PTAmount: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <Label>Special Month <span className="font-normal text-gray-400 normal-case">(1–12)</span></Label>
                                                    <input type="number" min="1" max="12" className={inputCls}
                                                        value={slabForm.SpecialMonthNo} placeholder="e.g. 2 for Feb"
                                                        onChange={(e) => setSlabForm(p => ({ ...p, SpecialMonthNo: e.target.value }))} />
                                                </div>
                                                {slabForm.SpecialMonthNo !== '' && (
                                                    <div>
                                                        <Label>Special Month Amount (₹)</Label>
                                                        <input type="number" min="0" step="0.01" className={inputCls}
                                                            value={slabForm.SpecialMonthAmount} placeholder="300"
                                                            onChange={(e) => setSlabForm(p => ({ ...p, SpecialMonthAmount: e.target.value }))} />
                                                    </div>
                                                )}
                                                <div>
                                                    <Label>Display Order</Label>
                                                    <input type="number" min="0" className={inputCls}
                                                        value={slabForm.DisplayOrder}
                                                        onChange={(e) => setSlabForm(p => ({ ...p, DisplayOrder: e.target.value }))} />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <Btn onClick={handleSlabSubmit} loading={saveLoading}>
                                                    <Save className="h-3.5 w-3.5" />Save Slab
                                                </Btn>
                                                <Btn variant="secondary" onClick={() => { setShowSlabForm(false); setSlabForm(PT_SLAB_BLANK); }}>Cancel</Btn>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delete confirm */}
                                    {deleteSlabId && (
                                        <div className="mx-5 my-3 rounded-xl border border-rose-200 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 flex items-center justify-between">
                                            <span className="text-sm text-rose-700 dark:text-rose-300 font-medium">Delete this PT slab?</span>
                                            <div className="flex gap-2">
                                                <Btn variant="danger" size="sm" onClick={() => handleDeleteSlab(deleteSlabId)}>
                                                    <Trash2 className="h-3 w-3" />Delete
                                                </Btn>
                                                <Btn variant="secondary" size="sm" onClick={() => setDeleteSlabId(null)}>Cancel</Btn>
                                            </div>
                                        </div>
                                    )}

                                    {/* Slab table */}
                                    {ptSlabLoading ? (
                                        <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 text-indigo-500 animate-spin" /></div>
                                    ) : ptSlabError ? (
                                        <div className="py-6 text-center text-rose-500 text-sm">{ptSlabError}</div>
                                    ) : ptSlabData.length === 0 ? (
                                        <div className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No income slabs configured yet — click <strong>+ Add Slab</strong> below.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                                        {[
                                                            ...(config.GenderBased ? ['Gender'] : []),
                                                            'Income From', 'Income To', 'PT Amount', 'Special Month', 'Special Amt', 'Order', '',
                                                        ].map(h => (
                                                            <th key={h} className="px-3 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                                    {ptSlabData.map((slab, i) => (
                                                        <tr key={i} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                                            {config.GenderBased && (
                                                                <td className="px-3 py-2.5">
                                                                    <Badge color={slab.Gender === 'Male' ? 'blue' : slab.Gender === 'Female' ? 'violet' : 'gray'}>
                                                                        {slab.Gender}
                                                                    </Badge>
                                                                </td>
                                                            )}
                                                            <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-gray-100">{fmtAmt(slab.SlabFrom)}</td>
                                                            <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                                                {slab.SlabTo != null ? fmtAmt(slab.SlabTo) : <span className="text-gray-400 italic">No cap</span>}
                                                            </td>
                                                            <td className="px-3 py-2.5 font-semibold text-indigo-600 dark:text-indigo-400">
                                                                {nilOrAmt(slab.PTAmount)}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                                                {slab.SpecialMonthNo != null ? (MONTH_NAMES[slab.SpecialMonthNo - 1] || slab.SpecialMonthNo) : '—'}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                                                {slab.SpecialMonthAmount != null ? fmtAmt(slab.SpecialMonthAmount) : '—'}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-gray-400">{slab.DisplayOrder ?? '—'}</td>
                                                            <td className="px-3 py-2.5">
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => handleEditSlab(slab)}
                                                                        className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button onClick={() => setDeleteSlabId(slab.SlabId)}
                                                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Add Slab footer */}
                                    {!showSlabForm && (
                                        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
                                            <Btn size="sm" onClick={() => { setSlabForm(PT_SLAB_BLANK); setShowSlabForm(true); }}>
                                                <Plus className="h-3 w-3" />Add Slab
                                            </Btn>
                                        </div>
                                    )}
                                </div>
                            )}
                        </SectionCard>
                    );
                })
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB 8 — Labour Welfare Fund (LWF) Configuration
// ─────────────────────────────────────────────────────────────────────────────

const LWF_CONFIG_BLANK = {
    ConfigId: 0, CCCodes: [], EffectiveFrom: '',
    PaymentCycle: 'Monthly', EmpLWFAmt: '0', EmprLWFAmt: '0',
    DeductionMonths: '', Status: 'Active',
};

const LWFConfigTab = ({ userData, costCenters, costCentersLoading }) => {
    const dispatch = useDispatch();
    const { lwfConfigData, lwfConfigLoading, lwfConfigError, saveLoading, saveResult, saveError } =
        useSelector((s) => s.labourConfig);

    const toApiDate = (val) => {
        if (!val) return '';
        if (val instanceof Date) {
            return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}-${String(val.getDate()).padStart(2, '0')}`;
        }
        const str = String(val);
        if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) { const [d, m, y] = str.split('/'); return `${y}-${m}-${d}`; }
        return str;
    };

    const [filterCC, setFilterCC] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form,     setForm]     = useState(LWF_CONFIG_BLANK);

    const load = useCallback(() => {
        dispatch(fetchLWFConfig(filterCC || undefined));
    }, [dispatch, filterCC]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (saveResult) {
            const msg = saveResult?.Message || saveResult?.Result;
            if (saveResult?.Result === 'SUCCESS') {
                toast.success(msg || 'LWF config saved successfully.');
                dispatch(clearSaveResult());
                setShowForm(false);
                setForm(LWF_CONFIG_BLANK);
                load();
            } else if (saveResult?.Result === 'DUPLICATE') {
                toast.warning(msg || 'A LWF config already exists for this CC and effective date.');
                dispatch(clearSaveResult());
            } else {
                toast.warning(msg || 'Saved.');
                dispatch(clearSaveResult());
            }
        }
        if (saveError) { toast.error(saveError); dispatch(clearSaveResult()); }
    }, [saveResult, saveError]); // eslint-disable-line

    const handleEdit = (row) => {
        const raw = row.EffectiveFrom || '';
        let dateVal = '';
        if (raw) {
            if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
                const [y, m, d] = raw.substring(0, 10).split('-');
                dateVal = `${d}/${m}/${y}`;
            } else { dateVal = raw; }
        }
        setForm({
            ConfigId:        row.ConfigId || 0,
            CCCodes:         [row.CCCode],
            EffectiveFrom:   dateVal,
            PaymentCycle:    row.PaymentCycle || 'Monthly',
            EmpLWFAmt:       row.EmpLWFAmt  != null ? String(row.EmpLWFAmt)  : '0',
            EmprLWFAmt:      row.EmprLWFAmt != null ? String(row.EmprLWFAmt) : '0',
            DeductionMonths: row.DeductionMonths || '',
            Status:          row.Status || 'Active',
        });
        setShowForm(true);
    };

    const handleSubmit = () => {
        if (!form.CCCodes.length || !form.EffectiveFrom) {
            toast.warning('Cost Centre and Effective Date are required.');
            return;
        }
        dispatch(submitLWFConfig({
            ConfigId:        form.ConfigId || 0,
            CCCodes:         form.CCCodes,
            EffectiveFrom:   toApiDate(form.EffectiveFrom),
            PaymentCycle:    form.PaymentCycle,
            EmpLWFAmt:       parseFloat(form.EmpLWFAmt)  || 0,
            EmprLWFAmt:      parseFloat(form.EmprLWFAmt) || 0,
            DeductionMonths: form.DeductionMonths,
            Status:          form.Status,
            ActionBy:        userData?.userName || userData?.empCode || '',
        }));
    };

    const deductMonths = form.DeductionMonths
        ? form.DeductionMonths.split(',').map(m => parseInt(m.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 12)
        : [];

    const toggleMonth = (n) => {
        const updated = deductMonths.includes(n)
            ? deductMonths.filter(m => m !== n)
            : [...deductMonths, n].sort((a, b) => a - b);
        setForm(p => ({ ...p, DeductionMonths: updated.join(',') }));
    };

    const fmtAmt = (v) => v != null ? `₹${parseFloat(v).toLocaleString('en-IN')}` : '—';
    const fmtDeductMonths = (dm) => {
        if (!dm || !dm.trim()) return 'Every Month';
        return dm.split(',').map(m => MONTH_NAMES[parseInt(m.trim()) - 1] || m.trim()).filter(Boolean).join(', ');
    };

    return (
        <div className="space-y-5">
            <SectionCard>
                <div className="p-4 flex flex-wrap gap-3 items-end">
                    <div className="w-56">
                        <Label>Cost Centre</Label>
                        <SelectWrap loading={costCentersLoading}>
                            <select className={selectCls} value={filterCC} onChange={(e) => setFilterCC(e.target.value)}>
                                <option value="">All Cost Centres</option>
                                {costCenters.map(c => <option key={c.CC_Code} value={c.CC_Code}>{c.CC_Name}</option>)}
                            </select>
                        </SelectWrap>
                    </div>
                    <Btn onClick={load} loading={lwfConfigLoading} variant="secondary">
                        <Filter className="h-3.5 w-3.5" />Apply
                    </Btn>
                    <div className="ml-auto">
                        <Btn onClick={() => { setForm(LWF_CONFIG_BLANK); setShowForm(true); }}>
                            <Plus className="h-3.5 w-3.5" />Add LWF Config
                        </Btn>
                    </div>
                </div>
            </SectionCard>

            {showForm && (
                <SectionCard>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {form.ConfigId ? 'Edit LWF Configuration' : 'Add LWF Configuration'}
                        </span>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label required>
                                    Cost Centre
                                    {!form.ConfigId && <span className="ml-1 font-normal text-gray-400 normal-case">(multiple allowed)</span>}
                                </Label>
                                {form.ConfigId ? (
                                    <div className={`${inputCls} bg-gray-50 dark:bg-gray-700 cursor-not-allowed text-gray-500`}>
                                        {costCenters.find(c => c.CC_Code === form.CCCodes?.[0])?.CC_Name || form.CCCodes?.[0] || '—'}
                                    </div>
                                ) : (
                                    <MultiCCSelect
                                        value={form.CCCodes}
                                        onChange={(val) => setForm(p => ({ ...p, CCCodes: val }))}
                                        costCenters={costCenters}
                                        loading={costCentersLoading}
                                    />
                                )}
                            </div>
                            <div>
                                <CustomDatePicker
                                    label="Effective From"
                                    required
                                    value={form.EffectiveFrom}
                                    onChange={(val) => {
                                        if (val instanceof Date) {
                                            const d = String(val.getDate()).padStart(2, '0');
                                            const m = String(val.getMonth() + 1).padStart(2, '0');
                                            const y = val.getFullYear();
                                            setForm(p => ({ ...p, EffectiveFrom: `${d}/${m}/${y}` }));
                                        } else {
                                            setForm(p => ({ ...p, EffectiveFrom: val || '' }));
                                        }
                                    }}
                                    placeholder="DD/MM/YYYY"
                                    format="DD/MM/YYYY"
                                />
                            </div>
                            <div>
                                <Label required>Payment Cycle</Label>
                                <SelectWrap>
                                    <select className={selectCls} value={form.PaymentCycle}
                                        onChange={(e) => setForm(p => ({ ...p, PaymentCycle: e.target.value }))}>
                                        {PAYMENT_CYCLES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </SelectWrap>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <Label required>Employee LWF (₹)</Label>
                                <input type="number" min="0" step="0.01" className={inputCls}
                                    value={form.EmpLWFAmt} placeholder="20"
                                    onChange={(e) => setForm(p => ({ ...p, EmpLWFAmt: e.target.value }))} />
                            </div>
                            <div>
                                <Label required>Employer LWF (₹)</Label>
                                <input type="number" min="0" step="0.01" className={inputCls}
                                    value={form.EmprLWFAmt} placeholder="40"
                                    onChange={(e) => setForm(p => ({ ...p, EmprLWFAmt: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <SelectWrap>
                                    <select className={selectCls} value={form.Status}
                                        onChange={(e) => setForm(p => ({ ...p, Status: e.target.value }))}>
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </SelectWrap>
                            </div>
                        </div>

                        <div>
                            <Label>Deduction Months <span className="font-normal text-gray-400 normal-case">(none selected = every payroll month)</span></Label>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {MONTH_NAMES.map((name, i) => {
                                    const n = i + 1;
                                    const isOn = deductMonths.includes(n);
                                    return (
                                        <button key={n} type="button" onClick={() => toggleMonth(n)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all
                                                ${isOn
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-400'
                                                }`}>
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">
                                {deductMonths.length === 0
                                    ? 'Deduction applied every payroll month.'
                                    : `Deducted in: ${deductMonths.map(n => MONTH_NAMES[n - 1]).join(', ')}`}
                            </p>
                        </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-3">
                        <Btn onClick={handleSubmit} loading={saveLoading}>
                            <Save className="h-3.5 w-3.5" />Save
                        </Btn>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                    </div>
                </SectionCard>
            )}

            <SectionCard>
                {lwfConfigLoading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 text-indigo-500 animate-spin" /></div>
                ) : lwfConfigError ? (
                    <div className="py-8 text-center text-rose-500 text-sm">{lwfConfigError}</div>
                ) : lwfConfigData.length === 0 ? (
                    <EmptyState message="No LWF configurations found." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                    {['CC Code','CC Name','Effective From','Payment Cycle','Emp LWF','Empr LWF','Deduction Months','Status','Created On',''].map(h => (
                                        <th key={h} className="px-3 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {lwfConfigData.map((row, i) => (
                                    <tr key={i} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-gray-100">{row.CCCode}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.CCName || '—'}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{row.EffectiveFrom || '—'}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{row.PaymentCycle}</td>
                                        <td className="px-3 py-2.5 font-semibold text-indigo-600 dark:text-indigo-400">{fmtAmt(row.EmpLWFAmt)}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{fmtAmt(row.EmprLWFAmt)}</td>
                                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{fmtDeductMonths(row.DeductionMonths)}</td>
                                        <td className="px-3 py-2.5">
                                            <Badge color={row.Status === 'Active' ? 'green' : 'red'}>{row.Status}</Badge>
                                        </td>
                                        <td className="px-3 py-2.5 text-gray-400 text-xs">{row.CreatedOn || '—'}</td>
                                        <td className="px-3 py-2.5">
                                            <button onClick={() => handleEdit(row)}
                                                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page — loads shared lookups once, passes to all tabs
// ─────────────────────────────────────────────────────────────────────────────

const LabourRuleConfig = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);
    const {
        costCenters, costCentersLoading,
        dcaList, dcaLoading,
        subDcaList, subDcaLoading,
        wageComponents, wageComponentsLoading,
    } = useSelector((s) => s.labourConfig);

    const [activeTab, setActiveTab] = useState('minwage');

    // Load shared lookups once on mount
    useEffect(() => {
        dispatch(fetchAllCostCenters());
        dispatch(fetchDCAForHR());
        dispatch(fetchWageComponents());
    }, [dispatch]);

    const sharedProps = { userData, costCenters, costCentersLoading, dcaList, dcaLoading, subDcaList, subDcaLoading, wageComponents, wageComponentsLoading };

    const tabContent = {
        minwage:      <MinWageTab      {...sharedProps} />,
        designations: <DesignationsTab {...sharedProps} />,
        wageaccounts: <WageAccountTab  {...sharedProps} />,
        holidays:     <HolidaysTab     {...sharedProps} />,
        pfconfig:     <PFConfigTab     {...sharedProps} />,
        esiconfig:    <ESIConfigTab    {...sharedProps} />,
        ptconfig:     <PTConfigTab     {...sharedProps} />,
        lwfconfig:    <LWFConfigTab    {...sharedProps} />,
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 px-6 py-8 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Labour Rule Configuration</h1>
                        <p className="text-indigo-200 text-xs mt-0.5">
                            Manage minimum wages, designations, wage accounts, holidays, PF, ESI, PT and LWF configurations
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-0 overflow-x-auto">
                        {TABS.map(({ id, label, icon: Icon }) => {
                            const active = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                                        ${active
                                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {tabContent[activeTab]}
            </div>
        </div>
    );
};

export default LabourRuleConfig;
