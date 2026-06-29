import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ArrowLeftRight, User, Building2, Search, CheckCircle2,
    Loader2, ChevronDown, X, RefreshCw, Users, Calendar,
    History, ChevronRight, AlertCircle,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchLabourTypeList,
    fetchLTCContractors,
    fetchLTCMinDate,
    fetchLTCWorkHistory,
    submitLabourTypeChangeRequest,
    clearMinDate,
    clearSubmitResult,
    clearWorkHistory,
    selectLTCLabourList,
    selectLTCContractors,
    selectLTCMinDate,
    selectLTCSubmitResult,
    selectLTCWorkHistory,
    selectLTCLoading,
    selectLTCErrors,
} from '../../slices/HRSlice/labourTypeChangeSlice';

// ── Shared UI helpers ─────────────────────────────────────────────────────────

const cn = (...c) => c.filter(Boolean).join(' ');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const s = String(dateStr).trim();
    let m = s.match(/\/Date\((-?\d+)([+-]\d+)?\)\//);
    if (m) return new Date(+m[1]);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]); // DD/MM/YYYY
    m = s.match(/^(\d{2})-(\d{2})-(\d{4})/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    const d = new Date(s);
    return isNaN(d) ? null : d;
};

const fmt = (dateStr) => {
    if (!dateStr) return '—';
    const d = parseDate(dateStr);
    if (d) return `${String(d.getDate()).padStart(2, '0')}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
    return String(dateStr).split('T')[0].split(' ')[0];
};

const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const TypeBadge = ({ type }) => {
    const isOwn = type === 'Own Labour';
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
            isOwn
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
        )}>
            {isOwn ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
            {type}
        </span>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

const TABS = ['Own Labour', 'Contractor'];

const LabourTypeChange = () => {
    const dispatch = useDispatch();

    const labourList   = useSelector(selectLTCLabourList);
    const contractors  = useSelector(selectLTCContractors);
    const minDate      = useSelector(selectLTCMinDate);
    const submitResult = useSelector(selectLTCSubmitResult);
    const workHistory  = useSelector(selectLTCWorkHistory);
    const loading      = useSelector(selectLTCLoading);
    const errors       = useSelector(selectLTCErrors);

    const { userData } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId || userData?.RID;
    const userName = userData?.userName || userData?.UserName || 'system';

    // Tab / filter
    const [activeTab,         setActiveTab]         = useState('Own Labour');
    const [contractorFilter,  setContractorFilter]  = useState('');
    const [searchQuery,       setSearchQuery]        = useState('');

    // Modal state
    const [changingLabour,    setChangingLabour]     = useState(null);
    const [changeTarget,      setChangeTarget]       = useState(null);
    const [selectedContractor,setSelectedContractor] = useState('');
    const [effectDate,        setEffectDate]         = useState('');
    const [showWorkHistory,   setShowWorkHistory]    = useState(false);

    // ── Handlers (defined before effects to avoid TDZ in dep arrays) ─────────

    const openModal = (labour) => setChangingLabour(labour);

    const closeModal = useCallback(() => {
        setChangingLabour(null);
        setChangeTarget(null);
        setSelectedContractor('');
        setEffectDate('');
        setShowWorkHistory(false);
        dispatch(clearMinDate());
        dispatch(clearWorkHistory());
    }, [dispatch]);

    // ── Effects ──────────────────────────────────────────────────────────────

    useEffect(() => {
        dispatch(fetchLTCContractors());
        return () => { dispatch(clearSubmitResult()); };
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchLabourTypeList(activeTab));
        setContractorFilter('');
        setSearchQuery('');
    }, [activeTab, dispatch]);

    useEffect(() => {
        if (!changingLabour) return;
        dispatch(fetchLTCMinDate(changingLabour.LabourId));
        dispatch(fetchLTCWorkHistory(changingLabour.LabourId));
        // Auto-select target for Own Labour (only one option)
        if (changingLabour.LabourType === 'Own Labour') setChangeTarget('Contractor');
        else setChangeTarget(null);
        setSelectedContractor('');
        setEffectDate('');
        setShowWorkHistory(false);
    }, [changingLabour, dispatch]);

    useEffect(() => {
        if (!submitResult) return;
        const msg = typeof submitResult === 'string' ? submitResult : JSON.stringify(submitResult);
        if (msg.toLowerCase().includes('success')) {
            toast.success('Labour type change request submitted successfully!');
            closeModal();
            dispatch(fetchLabourTypeList(activeTab));
        } else {
            toast.error(msg || 'Submission failed.');
        }
        dispatch(clearSubmitResult());
    }, [submitResult, dispatch, activeTab, closeModal]);

    // ── Derived data ─────────────────────────────────────────────────────────

    // Unique contractors extracted from loaded contractor-type labours
    const contractorOptions = useMemo(() => {
        if (activeTab !== 'Contractor') return [];
        const map = {};
        labourList.forEach(l => {
            if (l.Contractorcode) map[l.Contractorcode] = l.ContractorName || l.Contractorcode;
        });
        return Object.entries(map).map(([code, name]) => ({ code, name }));
    }, [labourList, activeTab]);

    const filteredList = useMemo(() => {
        return labourList.filter(l => {
            if (contractorFilter && l.Contractorcode !== contractorFilter) return false;
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                l.LabourId?.toLowerCase().includes(q) ||
                l.LabourName?.toLowerCase().includes(q) ||
                l.DesignationName?.toLowerCase().includes(q) ||
                l.Department?.toLowerCase().includes(q) ||
                l.ContractorName?.toLowerCase().includes(q)
            );
        });
    }, [labourList, contractorFilter, searchQuery]);

    const handleSubmit = () => {
        if (!changeTarget) { toast.error('Please select the target labour type.'); return; }
        if (changeTarget !== 'Own Labour' && !selectedContractor) {
            toast.error('Please select a contractor.'); return;
        }
        if (!effectDate) { toast.error('With Effect From date is required.'); return; }

        const newType = changeTarget === 'Own Labour' ? 'Own Labour' : 'Contractor';

        dispatch(submitLabourTypeChangeRequest({
            LabourId:          changingLabour.LabourId,
            NewType:           newType,
            NewContractorCode: changeTarget !== 'Own Labour' ? selectedContractor : '',
            WithEffectFrom:    effectDate,
            RoleId:            roleId,
            RequestedBy:       userName,
        }));
    };

    // ── Render helpers ────────────────────────────────────────────────────────

    const renderMinDateHint = () => {
        if (loading.minDate) return (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking min date...
            </p>
        );
        if (!minDate) return null;
        return (
            <p className={cn(
                'text-xs mt-1 flex items-center gap-1',
                minDate.HasApprovedPayroll
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
            )}>
                <Calendar className="h-3 w-3" />
                Earliest allowed: <strong>{fmt(minDate.MinDate)}</strong>
                {minDate.HasApprovedPayroll && ' (payroll constraint)'}
            </p>
        );
    };

    const renderWorkHistory = () => (
        <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
            <button
                onClick={() => setShowWorkHistory(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <History className="h-4 w-4 text-indigo-500" />
                    Work History
                    {workHistory.length > 0 && (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">
                            {workHistory.length}
                        </span>
                    )}
                </span>
                <ChevronRight className={cn('h-4 w-4 transition-transform', showWorkHistory && 'rotate-90')} />
            </button>

            {showWorkHistory && (
                <div className="px-4 py-3 space-y-2">
                    {loading.workHistory ? (
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading history...
                        </p>
                    ) : workHistory.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No work history found.</p>
                    ) : (
                        <div className="relative pl-5 space-y-3">
                            {workHistory.map((h, i) => (
                                <div key={h.HistoryId} className="relative">
                                    <div className={cn(
                                        'absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800',
                                        h.ToDate === 'Present'
                                            ? 'bg-emerald-500'
                                            : 'bg-gray-400 dark:bg-gray-500'
                                    )} />
                                    {i < workHistory.length - 1 && (
                                        <div className="absolute -left-[17px] top-4 w-0.5 h-full bg-gray-200 dark:bg-gray-600" />
                                    )}
                                    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 text-xs space-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <TypeBadge type={h.LabourType} />
                                            {h.ToDate === 'Present' && (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">Active</span>
                                            )}
                                        </div>
                                        {h.ContractorName && (
                                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Building2 className="h-3 w-3" /> {h.ContractorName}
                                            </p>
                                        )}
                                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {fmt(h.WithEffectFrom)} → {h.ToDate === 'Present' ? 'Present' : fmt(h.ToDate)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // ── Change Modal ──────────────────────────────────────────────────────────

    const renderModal = () => {
        if (!changingLabour) return null;
        const isOwn = changingLabour.LabourType === 'Own Labour';

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

                    {/* Modal header */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 px-6 py-5 text-white">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                                    <ArrowLeftRight className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{changingLabour.LabourName}</h2>
                                    <p className="text-indigo-200 text-sm">{changingLabour.LabourId}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-white/70 hover:text-white transition-colors mt-0.5"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-indigo-200">Current type:</span>
                            <TypeBadge type={changingLabour.LabourType} />
                            {changingLabour.ContractorName && (
                                <span className="text-xs text-indigo-200 flex items-center gap-1">
                                    <Building2 className="h-3 w-3" /> {changingLabour.ContractorName}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Modal body */}
                    <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                        {/* Target type selection */}
                        <div>
                            <Label required>Change To</Label>
                            {isOwn ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20">
                                    <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Contractor Labour</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { key: 'Own Labour',          label: 'Own Labour',          icon: User, desc: 'Move to company payroll' },
                                        { key: 'Another Contractor',  label: 'Another Contractor',  icon: Building2, desc: 'Change contractor' },
                                    ].map(({ key, label, icon: Icon, desc }) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setChangeTarget(key);
                                                setSelectedContractor('');
                                            }}
                                            className={cn(
                                                'relative p-4 rounded-xl border-2 text-left transition-all duration-150',
                                                changeTarget === key
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 bg-white dark:bg-gray-700'
                                            )}
                                        >
                                            {changeTarget === key && (
                                                <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            )}
                                            <Icon className={cn('h-5 w-5 mb-1.5', changeTarget === key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500')} />
                                            <p className={cn('text-sm font-bold', changeTarget === key ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300')}>
                                                {label}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Contractor dropdown (shown when target is Contractor) */}
                        {changeTarget && changeTarget !== 'Own Labour' && (
                            <div>
                                <Label required>Select Contractor</Label>
                                <div className="relative">
                                    <select
                                        value={selectedContractor}
                                        onChange={(e) => setSelectedContractor(e.target.value)}
                                        className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">— Select contractor —</option>
                                        {loading.contractors && <option disabled>Loading...</option>}
                                        {contractors.map((c) => (
                                            <option key={c.Contractorcode} value={c.Contractorcode}>
                                                {c.ContractorName}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                                {errors.contractors && (
                                    <p className="mt-1 text-xs text-rose-500">{errors.contractors}</p>
                                )}
                            </div>
                        )}

                        {/* With Effect From */}
                        <div>
                            <Label required>With Effect From</Label>
                            <CustomDatePicker
                                value={effectDate}
                                onChange={setEffectDate}
                                format="DD-MMM-YYYY"
                                placeholder="Select effective date"
                                minDate={minDate?.MinDate}
                            />
                            {renderMinDateHint()}
                        </div>

                        {/* Work History */}
                        {renderWorkHistory()}
                    </div>

                    {/* Modal footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
                        <button
                            onClick={closeModal}
                            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading.submit || !changeTarget || !effectDate || (changeTarget !== 'Own Labour' && !selectedContractor)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading.submit && <Loader2 className="h-4 w-4 animate-spin" />}
                            <ArrowLeftRight className="h-4 w-4" />
                            Submit Request
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* Page Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <ArrowLeftRight className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">HR Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Labour Type Change</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Transfer labours between Own and Contractor categories</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">HR / Type Change</p>
                            </div>
                            <ArrowLeftRight className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-5">

                {/* Tab selector */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-2 flex gap-2">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                            >
                                {tab === 'Own Labour' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                                {tab}
                                {!loading.labourList && (
                                    <span className={cn(
                                        'text-xs px-2 py-0.5 rounded-full font-bold',
                                        isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    )}>
                                        {activeTab === tab ? filteredList.length : ''}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Filter row */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, ID, designation, department..."
                            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Contractor filter (Contractor tab only) */}
                    {activeTab === 'Contractor' && contractorOptions.length > 0 && (
                        <div className="relative sm:w-64">
                            <select
                                value={contractorFilter}
                                onChange={(e) => setContractorFilter(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Contractors</option>
                                {contractorOptions.map(({ code, name }) => (
                                    <option key={code} value={code}>{name}</option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                    )}

                    {/* Refresh */}
                    <button
                        onClick={() => dispatch(fetchLabourTypeList(activeTab))}
                        disabled={loading.labourList}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={cn('h-4 w-4', loading.labourList && 'animate-spin')} />
                        Refresh
                    </button>
                </div>

                {/* Labour table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    {/* Table header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/60 dark:bg-gray-900/40">
                        <Users className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {activeTab} — {loading.labourList ? '...' : filteredList.length + ' labour(s)'}
                        </span>
                    </div>

                    {loading.labourList ? (
                        <div className="flex items-center justify-center gap-3 py-20 text-gray-500">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                            <span className="text-sm">Loading labours...</span>
                        </div>
                    ) : errors.labourList ? (
                        <div className="flex items-center gap-3 mx-6 my-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-xl px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            {errors.labourList}
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Users className="h-12 w-12 mb-3 opacity-30" />
                            <p className="text-sm font-medium">No labours found</p>
                            <p className="text-xs mt-1">
                                {searchQuery ? 'Try adjusting your search.' : `No ${activeTab} labours available.`}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-900/20">
                                        {['#', 'Labour ID', 'Name', 'Designation', 'Department',
                                          activeTab === 'Contractor' ? 'Contractor' : null,
                                          'Joining Date', 'Action']
                                            .filter(Boolean)
                                            .map(col => (
                                                <th key={col} className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                                    {col}
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredList.map((labour, idx) => (
                                        <tr
                                            key={labour.LabourId}
                                            className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                                        >
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 w-10">{idx + 1}</td>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">{labour.LabourId}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center shrink-0">
                                                        <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{labour.LabourName}</p>
                                                        {labour.Category && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{labour.Category}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{labour.DesignationName || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{labour.Department || '—'}</td>
                                            {activeTab === 'Contractor' && (
                                                <td className="px-4 py-3 text-sm text-violet-700 dark:text-violet-400 whitespace-nowrap">
                                                    {labour.ContractorName || '—'}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {fmt(labour.JoiningDate)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => openModal(labour)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 transition-colors group-hover:border-indigo-400"
                                                >
                                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                                    Change Type
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Change modal */}
            {renderModal()}
        </div>
    );
};

export default LabourTypeChange;
