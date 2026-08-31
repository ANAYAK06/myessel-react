import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Users, UserCog, Search, Loader2, Save, Pencil, X, ChevronDown,
    Check, Info, ShieldCheck,
} from 'lucide-react';

import {
    fetchEmployeesForReportingConfig,
    fetchDefaultReportingPerson,
    saveDefaultReportingPerson,
    fetchReportingConnectionGrid,
    saveEmployeeReportingConnection,
    clearDefaultSaveResult,
    clearConnectionSaveResult,
} from '../../slices/HRSlice/staffReportingConfigSlice';

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitives (matches the LabourRuleConfig / ClientPOBudgetLimitConfig
// visual language used by other configuration pages in this app)
// ─────────────────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const Btn = ({ onClick, disabled, loading, variant = 'primary', size = 'md', children, type = 'button' }) => {
    const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed';
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-2.5 text-sm' };
    const variants = {
        primary:   'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-300 shadow-md hover:shadow-lg',
        secondary: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-400',
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
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-700',
        gray:   'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${colors[color]}`}>
            {children}
        </span>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Smart dropdown positioning — portals the panel to <body> and flips it above
// the trigger when there isn't enough room below (e.g. edit row near the
// bottom of the screen), so it's never clipped by the table's scroll container
// or the edge of the viewport.
// ─────────────────────────────────────────────────────────────────────────────

const DROPDOWN_MAX_HEIGHT = 280;
const DROPDOWN_GAP = 6;

const useDropdownPosition = (open, triggerRef) => {
    const [style, setStyle] = useState(null);

    const compute = useCallback(() => {
        const el = triggerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUp = spaceBelow < DROPDOWN_MAX_HEIGHT + DROPDOWN_GAP && spaceAbove > spaceBelow;
        setStyle({
            position: 'fixed',
            left: rect.left,
            width: rect.width,
            maxHeight: Math.max(140, Math.min(DROPDOWN_MAX_HEIGHT, (openUp ? spaceAbove : spaceBelow) - DROPDOWN_GAP - 8)),
            ...(openUp
                ? { bottom: window.innerHeight - rect.top + DROPDOWN_GAP }
                : { top: rect.bottom + DROPDOWN_GAP }),
        });
    }, [triggerRef]);

    useEffect(() => {
        if (!open) { setStyle(null); return undefined; }
        compute();
        window.addEventListener('resize', compute);
        window.addEventListener('scroll', compute, true);
        return () => {
            window.removeEventListener('resize', compute);
            window.removeEventListener('scroll', compute, true);
        };
    }, [open, compute]);

    return style;
};

// ─────────────────────────────────────────────────────────────────────────────
// Single-select searchable employee combobox (used for Reporting Person)
// ─────────────────────────────────────────────────────────────────────────────

const EmployeeCombobox = ({ value, onChange, options, loading, excludeRefNo, placeholder = 'Search employee…' }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef(null);
    const panelRef = useRef(null);
    const panelStyle = useDropdownPosition(open, ref);

    useEffect(() => {
        const handler = (e) => {
            const insideTrigger = ref.current?.contains(e.target);
            const insidePanel = panelRef.current?.contains(e.target);
            if (!insideTrigger && !insidePanel) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.EmpRefNo === value);

    const filtered = useMemo(() => {
        const list = options.filter(o => o.EmpRefNo !== excludeRefNo);
        const q = query.trim().toLowerCase();
        if (!q) return list.slice(0, 50);
        return list.filter(o =>
            o.EmployeeName?.toLowerCase().includes(q) || o.EmpRefNo?.toLowerCase().includes(q)
        ).slice(0, 50);
    }, [options, query, excludeRefNo]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={loading}
                onClick={() => { setOpen(o => !o); setQuery(''); }}
                className={`${inputCls} text-left flex items-center justify-between gap-2`}
            >
                <span className={`truncate ${selected ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400'}`}>
                    {selected ? `${selected.EmployeeName} (${selected.EmpRefNo})` : placeholder}
                </span>
                {loading
                    ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" />
                    : <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </button>
            {open && !loading && panelStyle && createPortal(
                <div
                    ref={panelRef}
                    style={panelStyle}
                    className="z-50 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
                >
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Type a name or emp ref no…"
                                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 min-h-0">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-400">No employees found.</div>
                        ) : filtered.map(o => (
                            <button
                                key={o.EmpRefNo}
                                type="button"
                                onClick={() => { onChange(o.EmpRefNo); setOpen(false); }}
                                className="w-full flex items-center justify-between gap-2 text-left px-3 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 transition-colors"
                            >
                                <span className="text-xs text-gray-700 dark:text-gray-200 truncate">
                                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">{o.EmpRefNo}</span>
                                    {' — '}{o.EmployeeName}
                                </span>
                                {o.EmpRefNo === value && <Check className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Multi-select checkbox dropdown (used for Notifying Persons)
// ─────────────────────────────────────────────────────────────────────────────

const NotifyingPersonsSelect = ({ value = [], onChange, options, loading, excludeRefNo }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef(null);
    const panelRef = useRef(null);
    const panelStyle = useDropdownPosition(open, ref);

    useEffect(() => {
        const handler = (e) => {
            const insideTrigger = ref.current?.contains(e.target);
            const insidePanel = panelRef.current?.contains(e.target);
            if (!insideTrigger && !insidePanel) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectableOptions = useMemo(
        () => options.filter(o => o.EmpRefNo !== excludeRefNo),
        [options, excludeRefNo]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return selectableOptions;
        return selectableOptions.filter(o =>
            o.EmployeeName?.toLowerCase().includes(q) || o.EmpRefNo?.toLowerCase().includes(q)
        );
    }, [selectableOptions, query]);

    const toggle = (empRefNo) => {
        onChange(value.includes(empRefNo) ? value.filter(v => v !== empRefNo) : [...value, empRefNo]);
    };

    const displayLabel = value.length === 0
        ? 'None selected'
        : value.length === 1
            ? (options.find(o => o.EmpRefNo === value[0])?.EmployeeName || value[0])
            : `${value.length} employees selected`;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={loading}
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
            {open && !loading && panelStyle && createPortal(
                <div
                    ref={panelRef}
                    style={panelStyle}
                    className="z-50 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
                >
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search employees…"
                                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 min-h-0">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-400">No employees found.</div>
                        ) : filtered.map(o => (
                            <label key={o.EmpRefNo} className="flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value.includes(o.EmpRefNo)}
                                    onChange={() => toggle(o.EmpRefNo)}
                                    className="w-3.5 h-3.5 accent-indigo-600 flex-shrink-0"
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-200 truncate">
                                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">{o.EmpRefNo}</span>
                                    {' — '}{o.EmployeeName}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Default Reporting Person card
// ─────────────────────────────────────────────────────────────────────────────

const DefaultReportingPersonCard = ({ userName, employeeOptions, employeeOptionsLoading }) => {
    const dispatch = useDispatch();
    const {
        defaultReportingPerson, loading, errors, defaultSaveStatus,
    } = useSelector((s) => s.staffReportingConfig);

    const [editing, setEditing] = useState(false);
    const [selected, setSelected] = useState('');

    useEffect(() => {
        if (defaultSaveStatus === 'success') {
            toast.success('Default reporting person updated.');
            dispatch(clearDefaultSaveResult());
            setEditing(false);
            dispatch(fetchDefaultReportingPerson());
        }
        if (defaultSaveStatus === 'failed' && errors.defaultSave) {
            toast.error(typeof errors.defaultSave === 'string' ? errors.defaultSave : 'Failed to save default reporting person.');
            dispatch(clearDefaultSaveResult());
        }
    }, [defaultSaveStatus]); // eslint-disable-line

    const handleStartEdit = () => {
        setSelected(defaultReportingPerson?.EmployeeId || '');
        setEditing(true);
    };

    const handleSave = () => {
        if (!selected) {
            toast.warning('Please select an employee.');
            return;
        }
        dispatch(saveDefaultReportingPerson({ EmployeeId: selected, CreatedBy: userName }));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-start gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                    <UserCog className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Default Reporting Person</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Fallback used for any employee who does not have a specific reporting person configured below.
                    </p>
                </div>
            </div>

            <div className="mt-4">
                {editing ? (
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
                        <div className="flex-1">
                            <EmployeeCombobox
                                value={selected}
                                onChange={setSelected}
                                options={employeeOptions}
                                loading={employeeOptionsLoading}
                                placeholder="Select default reporting person…"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Btn onClick={handleSave} loading={loading.defaultSave}>
                                <Save className="h-3.5 w-3.5" />Save
                            </Btn>
                            <Btn variant="secondary" onClick={() => setEditing(false)} disabled={loading.defaultSave}>
                                <X className="h-3.5 w-3.5" />Cancel
                            </Btn>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        {loading.defaultReportingPerson ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />Loading…
                            </div>
                        ) : defaultReportingPerson?.EmployeeId ? (
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400 flex-shrink-0">
                                    {defaultReportingPerson.EmployeeName?.[0] || '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{defaultReportingPerson.EmployeeName}</p>
                                    <p className="text-xs text-gray-400">{defaultReportingPerson.EmployeeId}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No default reporting person configured yet.</p>
                        )}
                        <Btn variant="secondary" size="sm" onClick={handleStartEdit}>
                            <Pencil className="h-3.5 w-3.5" />
                            {defaultReportingPerson?.EmployeeId ? 'Change' : 'Set Default'}
                        </Btn>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

const StaffReportingConfiguration = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);
    const userName = userData?.userName || userData?.username || 'User';

    const {
        employeeOptions, loading, errors, connectionGrid, connectionSaveStatus,
    } = useSelector((s) => s.staffReportingConfig);

    const [searchQuery, setSearchQuery] = useState('');
    const [editingRefNo, setEditingRefNo] = useState(null);
    const [editReportingPerson, setEditReportingPerson] = useState('');
    const [editNotifyingPersons, setEditNotifyingPersons] = useState([]);

    const load = useCallback(() => {
        dispatch(fetchEmployeesForReportingConfig());
        dispatch(fetchDefaultReportingPerson());
        dispatch(fetchReportingConnectionGrid());
    }, [dispatch]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (connectionSaveStatus === 'success') {
            toast.success('Reporting connection saved.');
            dispatch(clearConnectionSaveResult());
            setEditingRefNo(null);
            dispatch(fetchReportingConnectionGrid());
        }
        if (connectionSaveStatus === 'failed' && errors.connectionSave) {
            toast.error(typeof errors.connectionSave === 'string' ? errors.connectionSave : 'Failed to save reporting connection.');
            dispatch(clearConnectionSaveResult());
        }
    }, [connectionSaveStatus]); // eslint-disable-line

    const filteredGrid = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return connectionGrid;
        return connectionGrid.filter(row =>
            row.EmployeeName?.toLowerCase().includes(q) || row.EmpRefNo?.toLowerCase().includes(q)
        );
    }, [connectionGrid, searchQuery]);

    const handleStartEdit = (row) => {
        setEditingRefNo(row.EmpRefNo);
        setEditReportingPerson(row.ReportingPersonId || '');
        setEditNotifyingPersons(
            row.NotifyingPersonIds ? row.NotifyingPersonIds.split(',').map(s => s.trim()).filter(Boolean) : []
        );
    };

    const handleCancelEdit = () => setEditingRefNo(null);

    const handleSaveConnection = (row) => {
        if (!editReportingPerson) {
            toast.warning('Please select a reporting person.');
            return;
        }
        if (editReportingPerson === row.EmpRefNo) {
            toast.warning('An employee cannot report to themselves.');
            return;
        }
        dispatch(saveEmployeeReportingConnection({
            EmpRefNo: row.EmpRefNo,
            ReportingPersonId: editReportingPerson,
            NotifyingPersonIds: editNotifyingPersons.join(','),
            CreatedBy: userName,
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* Page Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-6 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                                Configuration
                            </span>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1">Staff Reporting Configuration</h1>
                            <p className="text-indigo-200 text-sm mt-0.5">
                                Define who each employee reports to for Employee Portal request verification, and who gets notified.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto space-y-4">

                <DefaultReportingPersonCard
                    userName={userName}
                    employeeOptions={employeeOptions}
                    employeeOptionsLoading={loading.employeeOptions}
                />

                {/* Search */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search employee name or ref no…"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                        />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                        <Info className="h-3 w-3 flex-shrink-0" />
                        Employees with no reporting person configured fall back to the default set above.
                    </p>
                </div>

                {/* Grid */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading.connectionGrid ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                            <span className="text-sm text-gray-400">Loading employees…</span>
                        </div>
                    ) : errors.connectionGrid ? (
                        <div className="py-10 text-center text-sm text-rose-500">
                            {typeof errors.connectionGrid === 'string' ? errors.connectionGrid : 'Failed to load reporting connections.'}
                        </div>
                    ) : filteredGrid.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            No employees found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                        {['Employee', 'Reporting Person', 'Notifying Persons', ''].map(h => (
                                            <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {filteredGrid.map((row) => {
                                        const isEditing = editingRefNo === row.EmpRefNo;
                                        const isSaving = isEditing && loading.connectionSave;
                                        return (
                                            <React.Fragment key={row.EmpRefNo}>
                                                <tr className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-gray-800 dark:text-gray-100">{row.EmployeeName}</p>
                                                        <p className="text-xs text-gray-400 font-mono">{row.EmpRefNo}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {row.ReportingPersonId ? (
                                                            <span className="text-gray-700 dark:text-gray-200">{row.ReportingPersonName}</span>
                                                        ) : (
                                                            <Badge color="gray">Uses default</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 max-w-xs">
                                                        {row.NotifyingPersonNames ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {row.NotifyingPersonNames.split(',').map(n => n.trim()).filter(Boolean).map((n, i) => (
                                                                    <Badge key={i} color="indigo">{n}</Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-300 dark:text-gray-600 text-xs italic">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 w-16">
                                                        {!isEditing && (
                                                            <div className="flex justify-end">
                                                                <button
                                                                    onClick={() => handleStartEdit(row)}
                                                                    title="Edit reporting connection"
                                                                    className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>

                                                {isEditing && (
                                                    <tr className="bg-indigo-50/30 dark:bg-indigo-900/10">
                                                        <td colSpan={4} className="px-4 py-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                                                        Reporting Person <span className="text-rose-500">*</span>
                                                                    </label>
                                                                    <EmployeeCombobox
                                                                        value={editReportingPerson}
                                                                        onChange={setEditReportingPerson}
                                                                        options={employeeOptions}
                                                                        loading={loading.employeeOptions}
                                                                        excludeRefNo={row.EmpRefNo}
                                                                        placeholder="Select reporting person…"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                                                        Notifying Persons <span className="font-normal text-gray-400 normal-case">(optional)</span>
                                                                    </label>
                                                                    <NotifyingPersonsSelect
                                                                        value={editNotifyingPersons}
                                                                        onChange={setEditNotifyingPersons}
                                                                        options={employeeOptions}
                                                                        loading={loading.employeeOptions}
                                                                        excludeRefNo={row.EmpRefNo}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2.5 mt-4">
                                                                <Btn onClick={() => handleSaveConnection(row)} loading={isSaving}>
                                                                    <Save className="h-3.5 w-3.5" />Save
                                                                </Btn>
                                                                <Btn variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
                                                                    <X className="h-3.5 w-3.5" />Cancel
                                                                </Btn>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 justify-center">
                    <ShieldCheck className="h-3 w-3" />
                    Reporting connections drive the Employee Portal's request-verification stage — they do not change the existing approval workflow.
                </div>
            </div>
        </div>
    );
};

export default StaffReportingConfiguration;
