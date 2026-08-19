import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Wallet, Search, Loader2, Save, Pencil, X, IndianRupee } from 'lucide-react';

import {
    fetchCCDayLimitList,
    submitCCDayLimit,
    clearCCDayLimitSaveResult,
    selectCCDayLimitList,
    selectCCDayLimitLoading,
    selectCCDayLimitError,
    selectCCDLSaveLoading,
    selectCCDLSaveResult,
    selectCCDLSaveError,
} from '../../slices/accountsSlice/ccDayLimitConfigSlice';
import { showToast } from '../../utilities/toastUtilities';

const currencyFmt = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

const CostCenterDayLimitConfig = () => {
    const dispatch = useDispatch();

    const dayLimitList = useSelector(selectCCDayLimitList);
    const listLoading   = useSelector(selectCCDayLimitLoading);
    const listError     = useSelector(selectCCDayLimitError);
    const saveLoading   = useSelector(selectCCDLSaveLoading);
    const saveResult    = useSelector(selectCCDLSaveResult);
    const saveError     = useSelector(selectCCDLSaveError);

    const [searchQuery, setSearchQuery]         = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [editingCode, setEditingCode]         = useState(null);
    const [editValue,   setEditValue]           = useState('');
    const [savingCode,  setSavingCode]          = useState(null);

    const searchRef = useRef(null);

    const load = useCallback(() => {
        dispatch(fetchCCDayLimitList());
    }, [dispatch]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (saveResult) {
            showToast('success', `Day limit updated to ${currencyFmt.format(saveResult.value)} for ${saveResult.code}`);
            dispatch(clearCCDayLimitSaveResult());
            setEditingCode(null);
            setEditValue('');
            setSavingCode(null);
        }
        if (saveError) {
            showToast('error', typeof saveError === 'string' ? saveError : 'Failed to save the day limit.');
            dispatch(clearCCDayLimitSaveResult());
            setSavingCode(null);
        }
    }, [saveResult, saveError, dispatch]);

    const filteredList = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return dayLimitList;
        return dayLimitList.filter(row =>
            row.code?.toLowerCase().includes(q) ||
            row.name?.toLowerCase().includes(q)
        );
    }, [dayLimitList, searchQuery]);

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
            showToast('error', 'Please enter a valid amount.');
            return;
        }
        if (newVal === currentVal) {
            handleCancelEdit();
            return;
        }

        setSavingCode(row.code);
        dispatch(submitCCDayLimit({
            code:  row.code,
            value: String(newVal),
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
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                                Configuration
                            </span>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1">Cost Centre Day Limit Configuration</h1>
                            <p className="text-indigo-200 text-sm mt-0.5">
                                Set the maximum amount a cost centre is allowed to spend in a single day.
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
                                        <span className="flex-shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                            {row.value != null ? currencyFmt.format(row.value) : '—'}
                                        </span>
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
                </div>

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
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Current Day Limit</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-56">New Day Limit</th>
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
                                                    {row.value != null ? currencyFmt.format(row.value) : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isEditing ? (
                                                        <div className="relative w-40 ml-auto">
                                                            <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
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
                                                                className="w-full pl-7 pr-3 py-1.5 rounded-lg border-2 text-sm text-right font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-indigo-300 dark:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 disabled:opacity-60"
                                                            />
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
                                                                title="Edit day limit"
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

export default CostCenterDayLimitConfig;
