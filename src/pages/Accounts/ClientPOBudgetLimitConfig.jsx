import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, Search, Loader2, Save, Pencil, X, Percent, PlusCircle, AlertTriangle } from 'lucide-react';

import {
    fetchClientPOLockPercentList,
    submitCCClientPOPercent,
    fetchAllPerformingActiveCC,
    clearSaveResult,
    selectLockPercentList,
    selectListLoading,
    selectListError,
    selectSaveLoading,
    selectSaveResult,
    selectSaveError,
    selectAllCCList,
    selectAllCCLoading,
} from '../../slices/accountsSlice/clientPOBudgetLimitConfigSlice';
import { showToast } from '../../utilities/toastUtilities';

const ClientPOBudgetLimitConfig = () => {
    const dispatch = useDispatch();
    const { userData, userDetails } = useSelector((s) => s.auth);
    const currentUser = userData?.userName || userDetails?.userName || 'system';
    const roleId = userData?.roleId || userData?.RID || 0;
    const uid    = userData?.userId || userData?.UID || userData?.employeeId || '';

    const lockPercentList = useSelector(selectLockPercentList);
    const listLoading      = useSelector(selectListLoading);
    const listError        = useSelector(selectListError);
    const saveLoading      = useSelector(selectSaveLoading);
    const saveResult       = useSelector(selectSaveResult);
    const saveError        = useSelector(selectSaveError);
    const allCCList         = useSelector(selectAllCCList);
    const allCCLoading      = useSelector(selectAllCCLoading);

    const [searchQuery, setSearchQuery]     = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [editingCode, setEditingCode]     = useState(null);
    const [editValue,   setEditValue]       = useState('');
    const [savingCode,  setSavingCode]      = useState(null);

    const [addingCode, setAddingCode] = useState(null);
    const [addValue,   setAddValue]   = useState('');

    const searchRef = useRef(null);

    const load = useCallback(() => {
        dispatch(fetchClientPOLockPercentList());
    }, [dispatch]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (uid && roleId) {
            dispatch(fetchAllPerformingActiveCC({ uid, rid: roleId }));
        }
    }, [dispatch, uid, roleId]);

    // Cost centres that exist (Performing, Active) but have no Client PO limit configured yet
    const missingCCs = useMemo(() => {
        const configuredCodes = new Set(
            lockPercentList.map(r => (r.code || '').trim().toUpperCase())
        );
        return allCCList.filter(cc => !configuredCodes.has((cc.code || '').trim().toUpperCase()));
    }, [allCCList, lockPercentList]);

    useEffect(() => {
        if (saveResult) {
            showToast('success', `Limit updated to ${saveResult.value}% for ${saveResult.code}`);
            dispatch(clearSaveResult());
            setEditingCode(null);
            setEditValue('');
            setSavingCode(null);
            setAddingCode(null);
            setAddValue('');
        }
        if (saveError) {
            showToast('error', typeof saveError === 'string' ? saveError : 'Failed to save the limit.');
            dispatch(clearSaveResult());
            setSavingCode(null);
        }
    }, [saveResult, saveError, dispatch]);

    const filteredList = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return lockPercentList;
        return lockPercentList.filter(row =>
            row.code?.toLowerCase().includes(q) ||
            row.name?.toLowerCase().includes(q)
        );
    }, [lockPercentList, searchQuery]);

    // Suggestion list for the searchable cost-centre dropdown (top matches only)
    const suggestions = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return filteredList.slice(0, 8);
    }, [filteredList, searchQuery]);

    // Close the suggestion dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleStartEdit = (row) => {
        setEditingCode(row.code);
        setEditValue(row.value ?? '');
    };

    const handleSelectSuggestion = (row) => {
        setSearchQuery(row.code);
        setShowSuggestions(false);
        handleStartEdit(row);
    };

    const handleCancelEdit = () => {
        setEditingCode(null);
        setEditValue('');
    };

    const handleSave = (row) => {
        const currentVal = parseFloat(row.value);
        const newVal     = parseFloat(editValue);

        if (editValue === '' || isNaN(newVal) || newVal < 0) {
            showToast('error', 'Please enter a valid percentage.');
            return;
        }
        if (!isNaN(currentVal) && newVal < currentVal) {
            showToast('error', `New limit cannot be lower than the current ${currentVal}%. This limit can only be increased.`);
            return;
        }
        if (newVal === currentVal) {
            handleCancelEdit();
            return;
        }

        setSavingCode(row.code);
        dispatch(submitCCClientPOPercent({
            code:      row.code,
            value:     String(newVal),
            Createdby: currentUser,
        }));
    };

    const handleStartAdd = (cc) => {
        setAddingCode(cc.code);
        setAddValue('');
    };

    const handleCancelAdd = () => {
        setAddingCode(null);
        setAddValue('');
    };

    const handleSaveNew = (cc) => {
        const newVal = parseFloat(addValue);

        if (addValue === '' || isNaN(newVal) || newVal < 0) {
            showToast('error', 'Please enter a valid percentage.');
            return;
        }

        setSavingCode(cc.code);
        dispatch(submitCCClientPOPercent({
            code:      cc.code,
            value:     String(newVal),
            Createdby: currentUser,
            name:      cc.name,
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* Page Header */}
            <div className="max-w-5xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-6 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                                Configuration
                            </span>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1">Client PO Budget Limit Configuration</h1>
                            <p className="text-indigo-200 text-sm mt-0.5">
                                Set, per cost centre, how much of the Client PO value must be covered by budget before it is locked.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-4">

                {/* Cost centre search / dropdown selector */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="relative max-w-sm" ref={searchRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                            onFocus={() => searchQuery && setShowSuggestions(true)}
                            placeholder="Search or select a cost centre…"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                        />

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 shadow-xl z-50 max-h-64 overflow-y-auto">
                                {suggestions.map((row) => (
                                    <button
                                        key={row.code}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(row)}
                                        className="w-full flex items-center justify-between gap-3 text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{row.code}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.name}</p>
                                        </div>
                                        <span className="flex-shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{row.value ?? '—'}%</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showSuggestions && searchQuery.trim() && suggestions.length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl z-50 px-4 py-3 text-center text-sm text-gray-400">
                                No cost centres found
                            </div>
                        )}
                    </div>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 flex-shrink-0" />
                        Once a limit is set, it can only be increased — not lowered.
                    </p>
                </div>

                {/* Cost centres not yet configured with a Client PO limit */}
                {(allCCLoading || missingCCs.length > 0) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800/60 overflow-hidden">
                        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800/60 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <h2 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                                Cost Centres Without a Configured Limit
                            </h2>
                            {!allCCLoading && (
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                                    {missingCCs.length}
                                </span>
                            )}
                        </div>

                        {allCCLoading ? (
                            <div className="py-8 flex flex-col items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                                <span className="text-xs text-gray-400">Checking cost centres…</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {missingCCs.map((cc) => {
                                            const isAdding = addingCode === cc.code;
                                            const isSaving = savingCode === cc.code && saveLoading;
                                            return (
                                                <tr key={cc.code} className="hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-colors">
                                                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap w-32">{cc.code}</td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{cc.name}</td>
                                                    <td className="px-4 py-3">
                                                        {isAdding ? (
                                                            <div className="relative w-32 ml-auto">
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    autoFocus
                                                                    value={addValue}
                                                                    onChange={(e) => setAddValue(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleSaveNew(cc);
                                                                        if (e.key === 'Escape') handleCancelAdd();
                                                                    }}
                                                                    disabled={isSaving}
                                                                    placeholder="0.00"
                                                                    className="w-full pl-3 pr-7 py-1.5 rounded-lg border-2 text-sm text-right font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-amber-300 dark:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30 disabled:opacity-60"
                                                                />
                                                                <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <div className="text-right text-gray-300 dark:text-gray-600 text-xs italic">Not configured</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 w-20">
                                                        {isAdding ? (
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <button
                                                                    onClick={() => handleSaveNew(cc)}
                                                                    disabled={isSaving}
                                                                    title="Add"
                                                                    className="p-1.5 rounded-lg text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60 transition-colors"
                                                                >
                                                                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelAdd}
                                                                    disabled={isSaving}
                                                                    title="Cancel"
                                                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60 transition-colors"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end">
                                                                <button
                                                                    onClick={() => handleStartAdd(cc)}
                                                                    title="Add limit"
                                                                    className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                                                                >
                                                                    <PlusCircle className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {listLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                            <span className="text-sm text-gray-400">Loading cost centres…</span>
                        </div>
                    ) : listError ? (
                        <div className="py-10 text-center text-sm text-rose-500">{listError}</div>
                    ) : filteredList.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            No cost centres found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CC Code</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost Centre</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Current Limit</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-56">New Limit</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {filteredList.map((row) => {
                                        const isEditing = editingCode === row.code;
                                        const isSaving  = savingCode === row.code && saveLoading;
                                        return (
                                            <tr key={row.code} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">{row.code}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.name}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                                                    {row.value ?? '—'}%
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        <div className="relative w-32 ml-auto">
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                autoFocus
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleSave(row);
                                                                    if (e.key === 'Escape') handleCancelEdit();
                                                                }}
                                                                disabled={isSaving}
                                                                className="w-full pl-3 pr-7 py-1.5 rounded-lg border-2 text-sm text-right font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-indigo-300 dark:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 disabled:opacity-60"
                                                            />
                                                            <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                                                        </div>
                                                    ) : (
                                                        <div className="text-right text-gray-300 dark:text-gray-600 text-xs italic">—</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-1.5 justify-end">
                                                            <button
                                                                onClick={() => handleSave(row)}
                                                                disabled={isSaving}
                                                                title="Save"
                                                                className="p-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                                                            >
                                                                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                disabled={isSaving}
                                                                title="Cancel"
                                                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60 transition-colors"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={() => handleStartEdit(row)}
                                                                title="Edit limit"
                                                                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientPOBudgetLimitConfig;
