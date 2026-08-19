import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, CalendarDays, Loader2, Save, Percent } from 'lucide-react';

import {
    fetchCDFinancialYears,
    fetchCDConfigView,
    submitCompanyDepreciationConfig,
    clearCDSaveResult,
    selectCDFinancialYears,
    selectCDYearsLoading,
    selectCDConfigList,
    selectCDConfigLoading,
    selectCDConfigError,
    selectCDSaveLoading,
    selectCDSaveResult,
    selectCDSaveError,
} from '../../slices/accountsSlice/companyDepreciationConfigSlice';
import { showToast } from '../../utilities/toastUtilities';

const getDefaultFYValue = (years) => {
    if (!years.length) return '';
    const now = new Date();
    const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const match = years.find(y => y.startYear === String(startYear));
    return match ? match.yearValue : years[years.length - 1].yearValue;
};

const CompanyDepreciationConfigure = () => {
    const dispatch = useDispatch();
    const { userData, userDetails } = useSelector((s) => s.auth);
    const currentUser = userData?.userName || userDetails?.userName || 'system';

    const financialYears = useSelector(selectCDFinancialYears);
    const yearsLoading    = useSelector(selectCDYearsLoading);
    const configList      = useSelector(selectCDConfigList);
    const configLoading   = useSelector(selectCDConfigLoading);
    const configError     = useSelector(selectCDConfigError);
    const saveLoading     = useSelector(selectCDSaveLoading);
    const saveResult      = useSelector(selectCDSaveResult);
    const saveError       = useSelector(selectCDSaveError);

    const [selectedFYear, setSelectedFYear] = useState('');
    const [values, setValues] = useState({});

    useEffect(() => { dispatch(fetchCDFinancialYears()); }, [dispatch]);

    useEffect(() => {
        if (!selectedFYear && financialYears.length) {
            setSelectedFYear(getDefaultFYValue(financialYears));
        }
    }, [financialYears, selectedFYear]);

    const prevYear = useMemo(() => {
        const idx = financialYears.findIndex(y => y.yearValue === selectedFYear);
        return idx > 0 ? financialYears[idx - 1].yearValue : '';
    }, [financialYears, selectedFYear]);

    const load = useCallback(() => {
        if (selectedFYear) {
            dispatch(fetchCDConfigView({ fYear: selectedFYear, prevYear }));
        }
    }, [dispatch, selectedFYear, prevYear]);

    useEffect(() => { load(); }, [load]);

    // Seed the editable percentage inputs whenever a fresh config list arrives
    useEffect(() => {
        const seeded = {};
        configList.forEach(row => { seeded[row.subDcaCode] = row.percentage ?? '0'; });
        setValues(seeded);
    }, [configList]);

    useEffect(() => {
        if (saveResult) {
            showToast('success', `Depreciation config saved for FY ${saveResult.fYear}.`);
            dispatch(clearCDSaveResult());
        }
        if (saveError) {
            showToast('error', typeof saveError === 'string' ? saveError : 'Failed to save the depreciation config.');
            dispatch(clearCDSaveResult());
        }
    }, [saveResult, saveError, dispatch]);

    const handleValueChange = (code, val) => {
        setValues(prev => ({ ...prev, [code]: val }));
    };

    const handleSaveAll = () => {
        if (!selectedFYear) {
            showToast('error', 'Select a financial year first.');
            return;
        }
        if (!configList.length) return;

        for (const row of configList) {
            const v = values[row.subDcaCode];
            const num = parseFloat(v);
            if (v === '' || v === undefined || isNaN(num) || num < 0) {
                showToast('error', `Enter a valid percentage for ${row.subDcaCode} (${row.description}).`);
                return;
            }
        }

        const subDcas      = configList.map(r => r.subDcaCode);
        const percentages   = configList.map(r => String(parseFloat(values[r.subDcaCode])));

        dispatch(submitCompanyDepreciationConfig({
            fYear:       selectedFYear,
            subDcas,
            percentages,
            createdBy:   currentUser,
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
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                                Configuration
                            </span>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1">Company Depreciation Configuration</h1>
                            <p className="text-indigo-200 text-sm mt-0.5">
                                Set the depreciation percentage for each asset category, per financial year.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-4">

                {/* Financial year selector */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="relative max-w-xs">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <select
                            value={selectedFYear}
                            onChange={(e) => setSelectedFYear(e.target.value)}
                            disabled={yearsLoading}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all disabled:opacity-60 appearance-none"
                        >
                            {!financialYears.length && <option value="">Loading years…</option>}
                            {financialYears.map(y => (
                                <option key={y.yearValue} value={y.yearValue}>{y.year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {configLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                            <span className="text-sm text-gray-400">Loading depreciation categories…</span>
                        </div>
                    ) : configError ? (
                        <div className="py-10 text-center text-sm text-rose-500">{configError}</div>
                    ) : configList.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm">
                            No depreciation categories found for this financial year.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/40 text-left">
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">DCA Code</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset Category</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Previous Year %</th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right w-40">Depreciation %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {configList.map((row) => (
                                            <tr key={row.subDcaCode} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">{row.subDcaCode}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.description}</td>
                                                <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {row.previousYearPercentage ?? '—'}%
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="relative w-28 ml-auto">
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={values[row.subDcaCode] ?? ''}
                                                            onChange={(e) => handleValueChange(row.subDcaCode, e.target.value)}
                                                            disabled={saveLoading}
                                                            className="w-full pl-3 pr-7 py-1.5 rounded-lg border-2 text-sm text-right font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 disabled:opacity-60"
                                                        />
                                                        <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={handleSaveAll}
                                    disabled={saveLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm shadow-indigo-500/20"
                                >
                                    {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save All
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyDepreciationConfigure;
